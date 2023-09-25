
import { ConfigType, GenerateUUIDv4, PolicyType, SchemaEntity, TagType, TopicType, } from '@guardian/interfaces';
import { publishSystemSchemas } from '@api/helpers/schema-publish-helper';
import { PolicyConverterUtils } from '@policy-engine/policy-converter-utils';
import { INotifier } from '@helpers/notifier';
import {
    DataBaseHelper,
    DatabaseServer,
    IPolicyComponents,
    MessageAction,
    MessageServer,
    MessageType,
    Policy,
    PolicyMessage,
    regenerateIds,
    replaceAllEntities,
    replaceAllVariables,
    replaceArtifactProperties,
    Schema,
    SchemaFields,
    Topic,
    TopicConfig,
    TopicHelper,
    Users
} from '@guardian/common';
import { importTag } from '@api/helpers/tag-import-export-helper';
import { SchemaImportResult } from '@api/helpers/schema-helper';
import { HashComparator } from '@analytics';
import {
    importToolsByPolicy,
    importSchemaByFiles,
    importTokensByFiles,
    importArtifactsByFiles
} from '@api/helpers';

/**
 * Policy import export helper
 */
export class PolicyImportExportHelper {
    /**
     * Get system schemas
     *
     * @returns Array of schemas
     */
    public static async getSystemSchemas(): Promise<Schema[]> {
        const schemas = await Promise.all([
            DatabaseServer.getSystemSchema(SchemaEntity.POLICY),
            DatabaseServer.getSystemSchema(SchemaEntity.MINT_TOKEN),
            DatabaseServer.getSystemSchema(SchemaEntity.MINT_NFTOKEN),
            DatabaseServer.getSystemSchema(SchemaEntity.WIPE_TOKEN),
            DatabaseServer.getSystemSchema(SchemaEntity.ISSUER),
            DatabaseServer.getSystemSchema(SchemaEntity.USER_ROLE),
            DatabaseServer.getSystemSchema(SchemaEntity.CHUNK),
            DatabaseServer.getSystemSchema(SchemaEntity.ACTIVITY_IMPACT),
            DatabaseServer.getSystemSchema(SchemaEntity.TOKEN_DATA_SOURCE)
        ]);

        for (const schema of schemas) {
            if (!schema) {
                throw new Error('One of system schemas is not exist');
            }
        }
        return schemas;
    }

    /**
     * Import policy
     * @param policyToImport
     * @param policyOwner
     * @param versionOfTopicId
     * @param notifier
     * @param additionalPolicyConfig
     *
     * @returns Policies by owner
     */
    public static async importPolicy(
        policyToImport: IPolicyComponents,
        policyOwner: string,
        versionOfTopicId: string,
        notifier: INotifier,
        additionalPolicyConfig?: Partial<Policy>,
    ): Promise<{
        /**
         * New Policy
         */
        policy: Policy,
        /**
         * Errors
         */
        errors: any[]
    }> {
        const {
            policy,
            tokens,
            schemas,
            artifacts,
            tags,
            tools
        } = policyToImport;

        delete policy._id;
        delete policy.id;
        delete policy.messageId;
        delete policy.version;
        delete policy.previousVersion;
        delete policy.createDate;

        policy.policyTag = additionalPolicyConfig?.policyTag || 'Tag_' + Date.now();
        policy.uuid = GenerateUUIDv4();
        policy.creator = policyOwner;
        policy.owner = policyOwner;
        policy.status = PolicyType.DRAFT;
        policy.instanceTopicId = null;
        policy.synchronizationTopicId = null;
        policy.name = additionalPolicyConfig?.name || policy.name;
        policy.topicDescription = additionalPolicyConfig?.topicDescription || policy.topicDescription;
        policy.description = additionalPolicyConfig?.description || policy.description;

        const users = new Users();
        notifier.start('Resolve Hedera account');
        const root = await users.getHederaAccount(policyOwner);
        notifier.completedAndStart('Resolve topic');
        const parent = await TopicConfig.fromObject(
            await DatabaseServer.getTopicByType(policyOwner, TopicType.UserTopic), true
        );
        const topicHelper = new TopicHelper(root.hederaAccountId, root.hederaAccountKey);

        let topicRow: TopicConfig;
        if (versionOfTopicId) {
            topicRow = await TopicConfig.fromObject(await DatabaseServer.getTopicById(versionOfTopicId), true);
        } else {
            topicRow = await topicHelper.create({
                type: TopicType.PolicyTopic,
                name: policy.name || TopicType.PolicyTopic,
                description: policy.topicDescription || TopicType.PolicyTopic,
                owner: policyOwner,
                policyId: null,
                policyUUID: null
            });
            await topicRow.saveKeys();
            await DatabaseServer.saveTopic(topicRow.toObject());
        }

        policy.topicId = topicRow.topicId;

        if (!versionOfTopicId) {
            notifier.completedAndStart('Publish Policy in Hedera');
            const messageServer = new MessageServer(root.hederaAccountId, root.hederaAccountKey);
            const message = new PolicyMessage(MessageType.Policy, MessageAction.CreatePolicy);
            message.setDocument(policy);
            const messageStatus = await messageServer
                .setTopicObject(parent)
                .sendMessage(message);
            notifier.completedAndStart('Link topic and policy');
            await topicHelper.twoWayLink(
                topicRow,
                parent,
                messageStatus.getId()
            );

            notifier.completedAndStart('Publishing schemas');
            const systemSchemas = await PolicyImportExportHelper.getSystemSchemas();
            notifier.info(`Found ${systemSchemas.length} schemas`);
            messageServer.setTopicObject(topicRow);
            await publishSystemSchemas(systemSchemas, messageServer, policyOwner, notifier);
        } else {
            notifier.completedAndStart('Skip publishing policy in Hedera');
            notifier.completedAndStart('Skip publishing schemas');
        }

        notifier.completed();

        // Import Tokens
        const tokensResult = await importTokensByFiles(policyOwner, tokens, notifier);
        const tokenMap = tokensResult.tokenMap;

        // Import Schemas
        const schemasResult = await importSchemaByFiles(policyOwner, schemas, topicRow.topicId, notifier);
        const schemasMap = schemasResult.schemasMap;

        // Import Tools
        const toolsResult = await importToolsByPolicy(root, tools, notifier);

        // Import Artifacts
        const artifactsResult = await importArtifactsByFiles(policyOwner, artifacts, notifier);
        const artifactsMap = artifactsResult.artifactsMap;

        notifier.completedAndStart('Saving in DB');

        // Replace id
        await PolicyImportExportHelper.replaceConfig(policy, schemasMap, artifactsMap, tokenMap);

        // Save
        const model = new DataBaseHelper(Policy).create(policy as Policy);
        const result = await new DataBaseHelper(Policy).save(model);

        if (tags) {
            notifier.start('Import tags');
            const policyTags = tags.filter((t: any) => t.entity === TagType.Policy);
            const tokenTags = tags.filter((t: any) => t.entity === TagType.Token);
            const schemaTags = tags.filter((t: any) => t.entity === TagType.Schema);
            await importTag(policyTags, result.id.toString());
            const tokenIdMap: Map<string, string> = new Map();
            for (const item of tokenMap) {
                tokenIdMap.set(item.oldID, item.newID);
                tokenIdMap.set(item.oldTokenID, item.newID);
            }
            await importTag(tokenTags, tokenIdMap);
            const schemaIdMap: Map<string, string> = new Map();
            for (const item of schemasMap) {
                schemaIdMap.set(item.oldID, item.newID);
                schemaIdMap.set(item.oldMessageID, item.newID);
            }
            await importTag(schemaTags, schemaIdMap);
            notifier.completed();
        }

        const _topicRow = await new DataBaseHelper(Topic).findOne({ topicId: topicRow.topicId })
        _topicRow.policyId = result.id.toString();
        _topicRow.policyUUID = result.uuid;
        await new DataBaseHelper(Topic).update(_topicRow);

        for (const addedArtifact of artifactsResult.artifacts) {
            addedArtifact.policyId = result.id;
            await DatabaseServer.saveArtifact(addedArtifact);
        }

        const suggestionsConfig = await DatabaseServer.getSuggestionsConfig(
            policyOwner
        );
        if (!suggestionsConfig) {
            await DatabaseServer.setSuggestionsConfig({
                user: policyOwner,
                items: [
                    {
                        id: result.id,
                        type: ConfigType.POLICY,
                        index: 0,
                    },
                ],
            });
        }

        notifier.completedAndStart('Updating hash');
        await HashComparator.saveHashMap(result);

        const errors: any[] = [];
        if (schemasResult.errors) {
            for (const error of schemasResult.errors) {
                errors.push(error);
            }
        }
        if (toolsResult.errors) {
            for (const error of toolsResult.errors) {
                errors.push(error);
            }
        }

        notifier.completed();
        return { policy: result, errors };
    }

    /**
     * Replace config
     * @param policy
     * @param schemasMap
     */
    public static async replaceConfig(
        policy: Policy,
        schemasMap: SchemaImportResult[],
        artifactsMap: Map<string, string>,
        tokenMap: any[]
    ) {
        if (await new DataBaseHelper(Policy).findOne({ name: policy.name })) {
            policy.name = policy.name + '_' + Date.now();
        }

        for (const item of schemasMap) {
            replaceAllEntities(policy.config, SchemaFields, item.oldIRI, item.newIRI);
            replaceAllVariables(policy.config, 'Schema', item.oldIRI, item.newIRI);
        }

        for (const item of tokenMap) {
            replaceAllEntities(policy.config, ['tokenId'], item.oldTokenID, item.newTokenID);
            replaceAllVariables(policy.config, 'Token', item.oldTokenID, item.newTokenID);
        }

        // compatibility with older versions
        policy = PolicyConverterUtils.PolicyConverter(policy);
        policy.codeVersion = PolicyConverterUtils.VERSION;
        regenerateIds(policy.config);

        replaceArtifactProperties(policy.config, 'uuid', artifactsMap);
    }

    /**
     * Convert errors to string
     * @param errors
     */
    public static errorsMessage(errors: any[]): string {
        const schemas: string[] = [];
        const tools: string[] = [];
        const others: string[] = []
        for (const e of errors) {
            if (e.type === 'schema') {
                schemas.push(e.name);
            } else if (e.type === 'tool') {
                tools.push(e.name);
            } else {
                others.push(e.name);
            }
        }
        let message: string = 'Failed to import components:';
        if (schemas.length) {
            message += ` schemas: ${JSON.stringify(schemas)};`
        }
        if (tools.length) {
            message += ` tools: ${JSON.stringify(tools)};`
        }
        if (others.length) {
            message += ` others: ${JSON.stringify(others)};`
        }
        return message;
    }
}
