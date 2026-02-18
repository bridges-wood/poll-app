/**
 * Supported resource types for ownership verification.
 * Add new resource types here as they become ownable.
 */
export enum ResourceType {
  POST = 'post',
  COMMENT = 'comment',
  // Add more resource types here as needed
}

/**
 * Type-safe resource type names
 */
export type ResourceTypeName = `${ResourceType}`;
