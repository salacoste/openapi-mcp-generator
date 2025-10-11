/**
 * Type definitions for operation extraction
 * @module operation-types
 */

/**
 * HTTP methods supported
 */
export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';

/**
 * Parameter location
 */
export type ParameterLocation = 'path' | 'query' | 'header';

/**
 * Operation metadata extracted from OpenAPI document
 */
export interface OperationMetadata {
  /** Unique operation identifier */
  operationId: string;
  /** HTTP method */
  method: HttpMethod;
  /** API path */
  path: string;
  /** Operation summary */
  summary?: string;
  /** Operation description */
  description?: string;
  /** Operation tags for categorization */
  tags: string[];
  /** Path parameters */
  pathParameters: ParameterMetadata[];
  /** Query parameters */
  queryParameters: ParameterMetadata[];
  /** Header parameters */
  headerParameters: ParameterMetadata[];
  /** Request body metadata */
  requestBody?: RequestBodyMetadata;
  /** Response metadata */
  responses: ResponseMetadata[];
  /** Is operation deprecated? */
  deprecated: boolean;
  /** Security requirements (placeholder for Story 2.6) */
  security?: unknown[];
}

/**
 * Parameter metadata
 */
export interface ParameterMetadata {
  /** Parameter name */
  name: string;
  /** Parameter location */
  in: ParameterLocation;
  /** Is parameter required? */
  required: boolean;
  /** Parameter description */
  description?: string;
  /** Parameter schema/type (supports full OpenAPI schema properties) */
  schema?: Record<string, unknown>;
  /** Style for array parameters */
  style?: string;
  /** Explode flag for array parameters */
  explode?: boolean;
}

/**
 * Request body metadata
 */
export interface RequestBodyMetadata {
  /** Is request body required? */
  required: boolean;
  /** Request body description */
  description?: string;
  /** Media type (e.g., application/json) */
  mediaType: string;
  /** Schema name reference (if schema is in SchemaMap) */
  schemaName?: string;
  /** Inline expanded schema (if schema was dereferenced inline) */
  schema?: Record<string, unknown>;
}

/**
 * Response metadata
 */
export interface ResponseMetadata {
  /** HTTP status code or 'default' */
  statusCode: string;
  /** Response description */
  description: string;
  /** Media type (e.g., application/json) */
  mediaType?: string;
  /** Schema name reference */
  schemaName?: string;
}
