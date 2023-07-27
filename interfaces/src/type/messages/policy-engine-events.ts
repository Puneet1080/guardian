/**
 * Policy engine events
 */
export enum PolicyEngineEvents {
    RECEIVE_EXTERNAL_DATA = 'policy-engine-event-receive-external-data',
    POLICY_IMPORT_MESSAGE_PREVIEW = 'policy-engine-event-policy-import-message-preview',
    POLICY_IMPORT_MESSAGE_PREVIEW_ASYNC = 'policy-engine-event-policy-import-message-preview-async',
    POLICY_IMPORT_FILE_PREVIEW = 'policy-engine-event-policy-import-file-preview',
    CREATE_POLICIES = 'policy-engine-event-create-policies',
    CREATE_POLICIES_ASYNC = 'policy-engine-event-create-policies-async',
    SAVE_POLICIES = 'policy-engine-event-save-policies',
    PUBLISH_POLICIES = 'policy-engine-event-publish-policies',
    PUBLISH_POLICIES_ASYNC = 'policy-engine-event-publish-policies-async',
    DRY_RUN_POLICIES = 'policy-engine-event-dry-run-policies',
    DRAFT_POLICIES = 'policy-engine-event-draft-policies',
    VALIDATE_POLICIES = 'policy-engine-event-validate-policies',
    POLICY_BLOCKS = 'policy-engine-event-get-policy-blocks',
    GET_BLOCK_DATA = 'policy-engine-event-get-block-data',
    GET_BLOCK_DATA_BY_TAG = 'policy-engine-event-get-block-data-by-tag',
    SET_BLOCK_DATA = 'policy-engine-event-set-block-data',
    SET_BLOCK_DATA_BY_TAG = 'policy-engine-event-set-block-data-by-tag',
    BLOCK_BY_TAG = 'policy-engine-event-get-block-by-tag',
    POLICY_EXPORT_FILE = 'policy-engine-event-policy-export-file',
    POLICY_EXPORT_MESSAGE = 'policy-engine-event-policy-export-message',
    POLICY_IMPORT_FILE = 'policy-engine-event-policy-import-file',
    POLICY_IMPORT_FILE_ASYNC = 'policy-engine-event-policy-import-file-async',
    POLICY_IMPORT_MESSAGE = 'policy-engine-event-policy-import-message',
    POLICY_IMPORT_MESSAGE_ASYNC = 'policy-engine-event-policy-import-message-async',
    GET_POLICIES = 'policy-engine-event-get-policies',
    GET_POLICY = 'policy-engine-event-get-policy',
    GET_BLOCK_PARENTS = 'policy-engine-event-get-block-parents',
    BLOCK_ABOUT = 'policy-engine-event-block-about',
    GET_VIRTUAL_USERS = 'policy-engine-event-get-virtual-users',
    CREATE_VIRTUAL_USER = 'policy-engine-event-create-virtual-user',
    SET_VIRTUAL_USER = 'policy-engine-event-login-virtual-user',
    RESTART_DRY_RUN= 'policy-engine-event-restart-dry-run',
    GET_VIRTUAL_DOCUMENTS = 'policy-engine-event-get-virtual-documents',
    DELETE_POLICY_ASYNC = 'policy-engine-event-delete-policy-async',
    GET_INVITE = 'policy-engine-event-get-invite',
    GET_POLICY_GROUPS = 'policy-engine-event-get-policy-groups',
    SELECT_POLICY_GROUP = 'policy-engine-event-select-policy-group',
    CLONE_POLICY_ASYNC = 'policy-engine-event-clone-policy-async',
    GET_TOKENS_MAP = 'policy-engine-event-get-tokens-map',
    SET_MULTI_POLICY = 'policy-engine-event-set-multi-policy',
    GET_MULTI_POLICY = 'policy-engine-event-get-multi-policy'
}