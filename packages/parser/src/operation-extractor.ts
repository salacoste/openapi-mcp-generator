/**
 * Operation Extraction Module
 *
 * Extracts operations (API endpoints) from resolved OpenAPI documents.
 * Handles parameter extraction, operation ID generation, and tag assignment.
 *
 * @module operation-extractor
 */

import type { OpenAPI } from 'openapi-types';
import type {
  OperationMetadata,
  ParameterMetadata,
  RequestBodyMetadata,
  ResponseMetadata,
  HttpMethod,
} from './operation-types.js';

const HTTP_METHODS: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

/**
 * Extracts all operations from an OpenAPI document.
 *
 * @param document - Fully resolved OpenAPI document
 * @returns Array of operation metadata objects
 *
 * @example
 * ```typescript
 * const document = await resolveReferences(openapiDoc);
 * const schemaMap = extractSchemas(document);
 * const operations = extractOperations(document);
 *
 * console.log(`Extracted ${operations.length} operations`);
 * ```
 */
export function extractOperations(
  document: OpenAPI.Document
): OperationMetadata[] {
  const operations: OperationMetadata[] = [];
  const operationIds = new Set<string>();

  if (!document.paths) {
    return operations;
  }

  const paths = document.paths as Record<string, unknown>;

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== 'object') {continue;}

    const pathObj = pathItem as Record<string, unknown>;
    const pathLevelParams = extractParametersFromArray(
      (pathObj.parameters as Record<string, unknown>[]) || []
    );

    for (const method of HTTP_METHODS) {
      const operation = pathObj[method];
      if (!operation || typeof operation !== 'object') {continue;}

      const op = operation as Record<string, unknown>;

      // Extract or generate operation ID
      const baseOpId = (op.operationId as string) || generateOperationId(path, method);
      const operationId = ensureUniqueOperationId(baseOpId, operationIds);
      operationIds.add(operationId);

      // Extract operation-level parameters
      const opLevelParams = extractParametersFromArray(
        (op.parameters as Record<string, unknown>[]) || []
      );

      // Deduplicate parameters
      const allParams = deduplicateParameters(pathLevelParams, opLevelParams);

      // Extract path parameters from template
      const pathParams = allParams.filter((p) => p.in === 'path');

      // Extract query parameters
      const queryParams = allParams.filter((p) => p.in === 'query');

      // Extract header parameters (excluding auth headers)
      const headerParams = allParams.filter(
        (p) => p.in === 'header' && !isAuthHeader(p.name)
      );

      // Extract request body
      const requestBody = extractRequestBody(op);

      // Extract responses
      const responses = extractResponses(op);

      // Extract tags or infer from path
      const tags = extractTags(op, path);

      // Create operation metadata
      const metadata: OperationMetadata = {
        operationId,
        method,
        path,
        summary: op.summary as string | undefined,
        description: op.description as string | undefined,
        tags,
        pathParameters: pathParams,
        queryParameters: queryParams,
        headerParameters: headerParams,
        requestBody,
        responses,
        deprecated: op.deprecated === true,
      };

      operations.push(metadata);
    }
  }

  return operations;
}

/**
 * Generates an operation ID from path and method.
 * Pattern: {method}{PascalCasePath}
 */
function generateOperationId(path: string, method: string): string {
  // Remove path parameters and split
  const pathParts = path
    .split('/')
    .filter((part) => part && !part.startsWith('{'))
    .map((part) => part.replace(/[^a-zA-Z0-9]/g, ''))
    .map(toPascalCase);

  const pathName = pathParts.join('');

  // Handle path parameters in naming
  const paramParts = path
    .split('/')
    .filter((part) => part.startsWith('{'))
    .map((part) => {
      const paramName = part.replace(/[{}]/g, '');
      return toPascalCase(paramName);
    });

  const suffix = paramParts.length > 0 ? `By${paramParts.join('And')}` : '';

  return `${method}${pathName}${suffix}`;
}

/**
 * Ensures operation ID is unique by appending suffix if needed.
 */
function ensureUniqueOperationId(baseId: string, existingIds: Set<string>): string {
  let id = baseId;
  let counter = 2;

  while (existingIds.has(id)) {
    id = `${baseId}${counter}`;
    counter++;
  }

  return id;
}

/**
 * Converts string to PascalCase.
 */
function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Extracts parameters from array.
 */
function extractParametersFromArray(params: Record<string, unknown>[]): ParameterMetadata[] {
  const result: ParameterMetadata[] = [];

  for (const param of params) {
    if (!param || typeof param !== 'object') {continue;}

    const p = param as Record<string, unknown>;

    result.push({
      name: (p.name as string) || '',
      in: (p.in as 'path' | 'query' | 'header') || 'query',
      required: (p.in === 'path' ? true : p.required === true),
      description: p.description as string | undefined,
      schema: p.schema as ParameterMetadata['schema'],
      style: p.style as string | undefined,
      explode: p.explode as boolean | undefined,
    });
  }

  return result;
}

/**
 * Deduplicates parameters, with operation-level overriding path-level.
 */
function deduplicateParameters(
  pathParams: ParameterMetadata[],
  opParams: ParameterMetadata[]
): ParameterMetadata[] {
  const paramMap = new Map<string, ParameterMetadata>();

  // Add path-level params first
  for (const param of pathParams) {
    const key = `${param.in}:${param.name}`;
    paramMap.set(key, param);
  }

  // Add operation-level params (overrides path-level)
  for (const param of opParams) {
    const key = `${param.in}:${param.name}`;
    paramMap.set(key, param);
  }

  // Sort: path params first, then query, then header
  const result = Array.from(paramMap.values());
  return result.sort((a, b) => {
    const order = { path: 0, query: 1, header: 2 };
    return order[a.in] - order[b.in];
  });
}

/**
 * Checks if header is an authentication header.
 */
function isAuthHeader(name: string): boolean {
  const authHeaders = ['authorization', 'x-api-key', 'api-key', 'apikey'];
  return authHeaders.includes(name.toLowerCase());
}

/**
 * Extracts request body metadata.
 */
function extractRequestBody(
  operation: Record<string, unknown>
): RequestBodyMetadata | undefined {
  if (!operation.requestBody || typeof operation.requestBody !== 'object') {
    return undefined;
  }

  const rb = operation.requestBody as Record<string, unknown>;

  if (!rb.content || typeof rb.content !== 'object') {
    return undefined;
  }

  const content = rb.content as Record<string, unknown>;

  // Prioritize application/json
  const mediaTypes = ['application/json', 'application/xml', 'multipart/form-data', 'application/x-www-form-urlencoded'];
  let selectedMediaType = '';
  let schema: Record<string, unknown> | undefined;

  for (const mt of mediaTypes) {
    if (content[mt] && typeof content[mt] === 'object') {
      const mediaTypeObj = content[mt] as Record<string, unknown>;
      if (mediaTypeObj.schema) {
        selectedMediaType = mt;
        schema = mediaTypeObj.schema as Record<string, unknown>;
        break;
      }
    }
  }

  if (!selectedMediaType || !schema) {
    // Try first available media type
    const firstMt = Object.keys(content)[0];
    if (firstMt && content[firstMt]) {
      const mtObj = content[firstMt] as Record<string, unknown>;
      selectedMediaType = firstMt;
      schema = mtObj.schema as Record<string, unknown> | undefined;
    }
  }

  // Extract schema name
  // After ref resolution, the schema is expanded inline and loses its name
  // Try multiple approaches to get the schema name:
  let schemaName: string | undefined;
  if (schema && typeof schema === 'object') {
    // 1. Check for 'x-schema-name' property (custom extension that we could add)
    // 2. Check for 'title' property (from original schema)
    // 3. Check for 'name' property (added by schema extractor)
    // 4. Try to infer from the schema properties if it matches a known pattern
    schemaName = (schema['x-schema-name'] as string) || (schema.title as string) || (schema.name as string) || undefined;

    // If still no schema name, try to infer from properties
    // This is a workaround for resolved schemas that lost their names
    if (!schemaName && schema.properties && typeof schema.properties === 'object') {
      // For now, we'll leave schemaName as undefined
      // The tool-generator will fallback to generic object schema
      // TODO: Future improvement - match resolved schema against SchemaMap by structure
    }
  }

  return {
    required: rb.required === true,
    description: rb.description as string | undefined,
    mediaType: selectedMediaType,
    schemaName,
    schema, // Include the inline expanded schema
  };
}

/**
 * Extracts response metadata.
 */
function extractResponses(
  operation: Record<string, unknown>
): ResponseMetadata[] {
  const result: ResponseMetadata[] = [];

  if (!operation.responses || typeof operation.responses !== 'object') {
    return result;
  }

  const responses = operation.responses as Record<string, unknown>;

  for (const [statusCode, response] of Object.entries(responses)) {
    if (!response || typeof response !== 'object') {continue;}

    const resp = response as Record<string, unknown>;

    let mediaType: string | undefined;
    let schemaName: string | undefined;

    if (resp.content && typeof resp.content === 'object') {
      const content = resp.content as Record<string, unknown>;

      // Prioritize application/json
      const mediaTypes = ['application/json', 'application/xml'];
      for (const mt of mediaTypes) {
        if (content[mt] && typeof content[mt] === 'object') {
          const mtObj = content[mt] as Record<string, unknown>;
          if (mtObj.schema) {
            mediaType = mt;
            const schema = mtObj.schema as Record<string, unknown>;
            schemaName = (schema.title as string) || undefined;
            break;
          }
        }
      }

      // Fallback to first available
      if (!mediaType) {
        const firstMt = Object.keys(content)[0];
        if (firstMt && content[firstMt]) {
          mediaType = firstMt;
          const mtObj = content[firstMt] as Record<string, unknown>;
          if (mtObj.schema) {
            const schema = mtObj.schema as Record<string, unknown>;
            schemaName = (schema.title as string) || undefined;
          }
        }
      }
    }

    result.push({
      statusCode,
      description: (resp.description as string) || '',
      mediaType,
      schemaName,
    });
  }

  return result;
}

/**
 * Extracts tags or infers from path.
 */
function extractTags(operation: Record<string, unknown>, path: string): string[] {
  // Use operation tags if present
  if (operation.tags && Array.isArray(operation.tags) && operation.tags.length > 0) {
    return operation.tags.map((tag) => normalizeTag(String(tag)));
  }

  // Infer from path
  const pathParts = path.split('/').filter((part) => part && !part.startsWith('{'));

  if (pathParts.length > 0 && pathParts[0]) {
    return [normalizeTag(pathParts[0])];
  }

  return ['General'];
}

/**
 * Normalizes tag name to PascalCase.
 */
function normalizeTag(tag: string): string {
  // Remove special characters
  const cleaned = tag.replace(/[^a-zA-Z0-9]/g, ' ');

  // Convert to PascalCase
  return cleaned
    .split(' ')
    .filter((part) => part)
    .map(toPascalCase)
    .join('');
}
