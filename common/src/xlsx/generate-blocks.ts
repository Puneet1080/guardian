import { BlockType, GenerateUUIDv4, SchemaEntity } from '@guardian/interfaces';
import { XlsxResult } from './models/xlsx-result';
import { PolicyTool } from '../entity';
import { IBlock } from './interfaces/block-interface';
import { XlsxSchema } from './models/xlsx-schema';
import * as mathjs from 'mathjs';

class TagIndexer {
    private index: number;

    constructor() {
        this.index = Date.now();
    }

    public getTag(type: BlockType, data: XlsxSchema | PolicyTool): string {
        if (type === BlockType.Tool) {
            return `Tool_${++this.index}`;
        }
        if (type === BlockType.Container) {
            if (data) {
                const name = (data.name).slice(0, 20).replace(/ /ig, '_')
                return `${name}_Schema_Holder_${++this.index}`;
            } else {
                return `Root_Holder_${++this.index}`;
            }
        }
        if (type === BlockType.Request) {
            return `Schema_Entry_${++this.index}`;
        }
        if (type === BlockType.CustomLogicBlock) {
            return `Schema_Calculations_${++this.index}`;
        }
        return `Autogenerated_${++this.index}`;
    }
}

interface IExpression {
    symbol: string;
    formulae: string;
}

interface IVariable {
    symbol: string;
    path: string;
}

/**
 * Generate policy config
 */
export class GenerateBlocks {
    /**
     * Generate policy config
     * @param xlsxResult
     */
    public static generate(xlsxResult: XlsxResult) {
        const config: IBlock = xlsxResult.policy?.config || {};
        const tags = new TagIndexer();
        const parent = GenerateBlocks.generateContainer(config, tags);
        GenerateBlocks.addPolicyTools(config, xlsxResult.tools, parent, tags);
        GenerateBlocks.generateRequests(xlsxResult.xlsxSchemas, parent, tags, xlsxResult);
    }

    /**
     * Add block
     * @param parent
     * @param block
     */
    private static pushBlock(parent: IBlock, block: IBlock) {
        if (Array.isArray(parent.children)) {
            parent.children.push(block);
        } else {
            parent.children = [block];
        }
    }

    /**
     * Add block
     * @param parent
     * @param block
     */
    private static unshiftBlock(parent: IBlock, block: IBlock) {
        if (Array.isArray(parent.children)) {
            parent.children.unshift(block);
        } else {
            parent.children = [block];
        }
    }

    /**
     * Generate block
     * @param config
     */
    private static generateBlock(config: any): IBlock {
        return {
            id: GenerateUUIDv4(),
            defaultActive: true,
            children: [],
            permissions: [],
            artifacts: [],
            ...config
        } as IBlock;
    }

    /**
     * Find tool ids
     * @param block
     * @param result
     */
    private static findTools(block: any, result: Set<string>) {
        if (!block) {
            return;
        }
        if (block.blockType === BlockType.Tool) {
            if (block.messageId && typeof block.messageId === 'string') {
                result.add(block.messageId);
            }
        } else {
            if (Array.isArray(block.children)) {
                for (const child of block.children) {
                    GenerateBlocks.findTools(child, result);
                }
            }
        }
    }

    /**
     * Generate Tool
     * @param policy
     * @param tools
     */
    private static addPolicyTools(
        config: IBlock,
        tools: PolicyTool[],
        parent: IBlock,
        tags: TagIndexer
    ): void {
        const toolIds = new Set<string>();
        GenerateBlocks.findTools(config, toolIds);
        for (const tool of tools) {
            if (!toolIds.has(tool.messageId)) {
                toolIds.add(tool.messageId);
                const block = GenerateBlocks.generateBlock({
                    tag: tags.getTag(BlockType.Tool, tool),
                    blockType: BlockType.Tool,
                    hash: tool.hash,
                    messageId: tool.messageId,
                    inputEvents: tool.config?.inputEvents,
                    outputEvents: tool.config?.outputEvents,
                    variables: tool.config?.variables,
                    innerEvents: []
                })
                GenerateBlocks.pushBlock(parent, block);
            }
        }
    }

    /**
     * Generate Container
     * @param policy
     * @param schemas
     */
    private static generateContainer(
        config: IBlock,
        tags: TagIndexer
    ): IBlock {
        const parent = GenerateBlocks.generateBlock({
            tag: tags.getTag(BlockType.Container, null),
            blockType: BlockType.Container
        });
        GenerateBlocks.unshiftBlock(config, parent);
        return parent;
    }

    /**
     * Generate Requests
     * @param policy
     * @param schemas
     */
    private static generateRequests(
        schemas: XlsxSchema[],
        parent: IBlock,
        tags: TagIndexer,
        xlsxResult: XlsxResult
    ): void {
        for (const schema of schemas) {
            if (schema.entity === SchemaEntity.VC) {
                const requestContainer = GenerateBlocks.generateBlock({
                    tag: tags.getTag(BlockType.Container, schema),
                    blockType: BlockType.Container
                });
                GenerateBlocks.generateRequest(requestContainer, schema, tags);
                GenerateBlocks.generateCalculation(requestContainer, schema, tags, xlsxResult);
                GenerateBlocks.pushBlock(parent, requestContainer);
            }
        }
    }

    /**
     * Generate Request
     * @param parent
     * @param schema
     */
    private static generateRequest(
        parent: IBlock,
        schema: XlsxSchema,
        tags: TagIndexer
    ): void {
        const request = GenerateBlocks.generateBlock({
            tag: tags.getTag(BlockType.Request, schema),
            blockType: BlockType.Request,
            schema: schema.iri,
            idType: 'UUID',
            presetFields: []
        });
        GenerateBlocks.pushBlock(parent, request);
    }

    /**
     * Generate CustomLogicBlock
     * @param parent
     * @param schema
     */
    private static generateCalculation(
        parent: IBlock,
        schema: XlsxSchema,
        tags: TagIndexer,
        xlsxResult: XlsxResult
    ): void {
        const expression = GenerateBlocks.generateExpression(schema, xlsxResult);
        if (expression) {
            const calculation = GenerateBlocks.generateBlock({
                tag: tags.getTag(BlockType.CustomLogicBlock, schema),
                blockType: BlockType.CustomLogicBlock,
                expression,
                documentSigner: '',
                idType: 'UUID',
                outputSchema: schema.iri,
            });
            GenerateBlocks.pushBlock(parent, calculation);
        }
    }

    /**
     * Generate Expression
     * @param schema
     */
    private static generateExpression(
        xlsxSchema: XlsxSchema,
        xlsxResult: XlsxResult
    ): string {
        const expressions: IExpression[] = [];
        for (const field of xlsxSchema.fields) {
            if (field.formulae) {
                expressions.push({
                    symbol: field.name,
                    formulae: field.formulae
                });
            }
        }
        if (!expressions.length) {
            return null;
        }

        const symbols = new Set<string>();
        for (const expression of expressions) {
            const nodes = mathjs.parse(expression.formulae);
            GenerateBlocks.findVariables(nodes, symbols);
        }

        const variables: IVariable[] = [];
        const paths = xlsxSchema.getVariables();
        for (const symbol of symbols) {
            if (paths.has(symbol)) {
                variables.push({
                    symbol,
                    path: paths.get(symbol)
                });
            } else {
                xlsxResult.addError({
                    type: 'error',
                    text: `Variable ${symbol} is not defined.`,
                    message: `Variable ${symbol} is not defined.`,
                    worksheet: xlsxSchema.worksheet.name
                }, null);
                return null;
            }
        }

        let body = '';
        //Main
        body += `function main(document) {\r\n`;
        body += `    //Variables\r\n`;
        //Variables
        for (const variable of variables) {
            body += `    let ${variable.symbol} = document.${variable.path};\r\n`;
        }
        body += `\r\n`;
        //Expressions
        body += `    //Expressions\r\n`;
        for (const expression of expressions) {
            body += `    document.${expression.symbol} = ${expression.formulae}; //${xlsxSchema.worksheet.name}: ${expression.symbol} = ${expression.formulae}\r\n`;
        }
        body += `\r\n`;
        //Main
        body += `    //Result\r\n`;
        body += `    return document;\r\n`;
        body += `}\r\n`;
        body += `(function calc() {\r\n`;
        body += `    return done(documents.map((document) =>\r\n`;
        body += `        main(document.document.credentialSubject[0]);\r\n`;
        body += `    ));\r\n`;
        body += `})();`;

        return body;
    }

    private static findVariables(tree: mathjs.MathNode, variables: Set<string>): void {
        if (tree.type === 'SymbolNode') {
            variables.add(tree.name);
        } else if (tree.type === 'FunctionNode' || tree.type === 'OperatorNode') {
            for (const arg of tree.args) {
                GenerateBlocks.findVariables(arg, variables);
            }
        }
    }
}