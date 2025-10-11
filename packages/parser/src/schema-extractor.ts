/**
 * Schema Extraction and Normalization Module
 *
 * Extracts and normalizes schemas from resolved OpenAPI documents for TypeScript code generation.
 * Handles component schemas, inline schemas, compositions (allOf/oneOf/anyOf), nested objects, and arrays.
 *
 * @module schema-extractor
 */

import type { OpenAPI } from 'openapi-types';
import type {
  NormalizedSchema,
  PropertySchema,
  SchemaMap,
  SchemaConstraints,
  PropertyConstraints,
} from './schema-types.js';

const MAX_NESTING_DEPTH = 10;

/**
 * Extracts and normalizes all schemas from an OpenAPI document.
 *
 * This function:
 * - Extracts component schemas from components.schemas
 * - Extracts inline schemas from request/response bodies
 * - Normalizes allOf compositions (merges properties)
 * - Handles oneOf/anyOf as union types
 * - Extracts nested objects as separate schemas
 * - Generates unique names for all schemas
 *
 * @param document - Fully resolved OpenAPI document (no $ref properties)
 * @returns Map of schema names to normalized schema objects
 *
 * @example
 * ```typescript
 * const document = await resolveReferences(openapiDoc);
 * const schemaMap = extractSchemas(document);
 *
 * console.log(`Extracted ${schemaMap.size} schemas`);
 * for (const [name, schema] of schemaMap) {
 *   console.log(`${name}: ${schema.type}`);
 * }
 * ```
 */
export function extractSchemas(document: OpenAPI.Document): SchemaMap {
  const schemaMap: SchemaMap = new Map();

  // Type guard to access components safely
  const doc = document as unknown as {
    components?: {
      schemas?: Record<string, Record<string, unknown>>;
    };
    paths?: Record<string, unknown>;
  };

  // Step 1: Extract component schemas
  if (doc.components?.schemas) {
    for (const [name, schemaObj] of Object.entries(doc.components.schemas)) {
      const schema = schemaObj as Record<string, unknown>;
      const normalized = normalizeSchema(schema, name, schemaMap, 0);
      schemaMap.set(name, normalized);
    }
  }

  // Step 2: Extract inline schemas from paths
  if (document.paths) {
    extractInlineSchemas(document.paths as Record<string, unknown>, schemaMap);
  }

  // Step 3: Validate output
  validateSchemaMap(schemaMap);

  return schemaMap;
}

/**
 * Extracts inline schemas from request and response bodies in paths.
 *
 * @param paths - Paths object from OpenAPI document
 * @param schemaMap - Schema map to add extracted schemas to
 */
function extractInlineSchemas(paths: Record<string, unknown>, schemaMap: SchemaMap): void {
  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== 'object') {continue;}

    const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

    for (const method of methods) {
      const operation = (pathItem as Record<string, unknown>)[method];
      if (!operation || typeof operation !== 'object') {continue;}

      const op = operation as Record<string, unknown>;

      // Extract from request body
      if (op.requestBody && typeof op.requestBody === 'object') {
        const requestBody = op.requestBody as Record<string, unknown>;
        if (requestBody.content && typeof requestBody.content === 'object') {
          for (const mediaType of Object.values(requestBody.content as Record<string, unknown>)) {
            if (mediaType && typeof mediaType === 'object') {
              const mt = mediaType as Record<string, unknown>;
              if (mt.schema && typeof mt.schema === 'object' && !('$ref' in mt.schema)) {
                const name = generateInlineSchemaName(path, method, 'request');
                const uniqueName = ensureUniqueName(name, schemaMap);
                const normalized = normalizeSchema(mt.schema as Record<string, unknown>, uniqueName, schemaMap, 0);
                schemaMap.set(uniqueName, normalized);
              }
            }
          }
        }
      }

      // Extract from responses
      if (op.responses && typeof op.responses === 'object') {
        for (const [statusCode, response] of Object.entries(op.responses as Record<string, unknown>)) {
          if (response && typeof response === 'object') {
            const resp = response as Record<string, unknown>;
            if (resp.content && typeof resp.content === 'object') {
              for (const mediaType of Object.values(resp.content as Record<string, unknown>)) {
                if (mediaType && typeof mediaType === 'object') {
                  const mt = mediaType as Record<string, unknown>;
                  if (mt.schema && typeof mt.schema === 'object' && !('$ref' in mt.schema)) {
                    const name = generateInlineSchemaName(path, method, 'response', statusCode);
                    const uniqueName = ensureUniqueName(name, schemaMap);
                    const normalized = normalizeSchema(mt.schema as Record<string, unknown>, uniqueName, schemaMap, 0);
                    schemaMap.set(uniqueName, normalized);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

/**
 * Generates a descriptive name for inline schemas.
 *
 * Pattern: {Method}{Path}{StatusCode?}{Location}Schema
 * Examples:
 * - POST /users → PostUsersRequestSchema
 * - GET /users/{id} → GetUsers200ResponseSchema
 *
 * @param path - API path
 * @param method - HTTP method
 * @param location - 'request' or 'response'
 * @param statusCode - Status code (for responses)
 * @returns Generated schema name
 */
function generateInlineSchemaName(
  path: string,
  method: string,
  location: 'request' | 'response',
  statusCode?: string
): string {
  // Remove path parameters and special characters
  const pathParts = path
    .split('/')
    .filter((part) => part && !part.startsWith('{'))
    .map((part) => part.replace(/[^a-zA-Z0-9]/g, ''));

  // Convert to PascalCase
  const pathName = pathParts.map(toPascalCase).join('');
  const methodName = toPascalCase(method);

  if (location === 'request') {
    return `${methodName}${pathName}RequestSchema`;
  } else {
    const statusPart = statusCode || '200';
    return `${methodName}${pathName}${statusPart}ResponseSchema`;
  }
}

/**
 * Converts string to PascalCase.
 */
function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Normalizes a schema object into a NormalizedSchema.
 *
 * Handles:
 * - allOf compositions (merges properties)
 * - oneOf/anyOf compositions (marks as union)
 * - Object types (extracts properties)
 * - Array types (extracts items)
 * - Primitive types
 *
 * @param schema - Raw schema object
 * @param name - Schema name
 * @param schemaMap - Schema map for storing nested schemas
 * @param depth - Current nesting depth
 * @returns Normalized schema
 */
function normalizeSchema(
  schema: Record<string, unknown>,
  name: string,
  schemaMap: SchemaMap,
  depth: number
): NormalizedSchema {
  // Handle allOf composition
  if (schema.allOf && Array.isArray(schema.allOf)) {
    return normalizeAllOf(schema.allOf, name);
  }

  // Handle oneOf composition
  if (schema.oneOf && Array.isArray(schema.oneOf)) {
    return normalizeOneOf(schema.oneOf, 'oneOf', name, schemaMap);
  }

  // Handle anyOf composition
  if (schema.anyOf && Array.isArray(schema.anyOf)) {
    return normalizeOneOf(schema.anyOf, 'anyOf', name, schemaMap);
  }

  // Handle object type
  if (schema.type === 'object' || schema.properties) {
    return normalizeObjectSchema(schema, name, schemaMap, depth);
  }

  // Handle array type
  if (schema.type === 'array') {
    return normalizeArraySchema(schema, name, schemaMap, depth);
  }

  // Handle primitive types
  return normalizePrimitiveSchema(schema, name);
}

/**
 * Normalizes allOf composition by merging all schemas.
 */
function normalizeAllOf(
  allOfArray: unknown[],
  name: string
): NormalizedSchema {
  const merged: NormalizedSchema = {
    name,
    type: 'object',
    properties: {},
    required: [],
    composition: {
      type: 'allOf',
      schemas: [],
      merged: true,
    },
  };

  // Merge all schemas
  for (const item of allOfArray) {
    if (!item || typeof item !== 'object') {continue;}
    const schema = item as Record<string, unknown>;

    // Merge properties
    if (schema.properties && typeof schema.properties === 'object') {
      const props = schema.properties as Record<string, unknown>;
      for (const [propName, propSchema] of Object.entries(props)) {
        const isRequired = Boolean(
          schema.required && Array.isArray(schema.required) && schema.required.includes(propName)
        );
        if (merged.properties) {
          merged.properties[propName] = extractPropertyMetadata(
            propSchema as Record<string, unknown>,
            propName,
            isRequired
          );
        }
      }
    }

    // Merge required fields
    if (schema.required && Array.isArray(schema.required)) {
      merged.required = [...new Set([...(merged.required || []), ...schema.required as string[]])];
    }

    // Use last description
    if (schema.description && typeof schema.description === 'string') {
      merged.description = schema.description;
    }
  }

  return merged;
}

/**
 * Normalizes oneOf/anyOf composition as union type.
 */
function normalizeOneOf(
  oneOfArray: unknown[],
  type: 'oneOf' | 'anyOf',
  name: string,
  schemaMap: SchemaMap
): NormalizedSchema {
  const schema: NormalizedSchema = {
    name,
    type: 'union',
    composition: {
      type,
      schemas: [],
      merged: false,
    },
  };

  // Extract each option as a separate schema
  for (let i = 0; i < oneOfArray.length; i++) {
    const option = oneOfArray[i];
    if (!option || typeof option !== 'object') {continue;}

    const optionName = `${name}Option${i + 1}`;
    const normalized = normalizeSchema(option as Record<string, unknown>, optionName, schemaMap, 0);

    schemaMap.set(optionName, normalized);
    if (schema.composition) {
      schema.composition.schemas.push(optionName);
    }
  }

  return schema;
}

/**
 * Normalizes object schema.
 */
function normalizeObjectSchema(
  schema: Record<string, unknown>,
  name: string,
  schemaMap: SchemaMap,
  depth: number
): NormalizedSchema {
  const normalized: NormalizedSchema = {
    name,
    type: 'object',
    properties: {},
    required: schema.required && Array.isArray(schema.required) ? (schema.required as string[]) : [],
    description: schema.description as string | undefined,
    example: schema.example,
  };

  // Extract properties
  if (schema.properties && typeof schema.properties === 'object') {
    const props = schema.properties as Record<string, unknown>;
    for (const [propName, propSchema] of Object.entries(props)) {
      const isRequired = normalized.required?.includes(propName) || false;
      if (normalized.properties) {
        normalized.properties[propName] = extractPropertyMetadata(
          propSchema as Record<string, unknown>,
          propName,
          isRequired
        );
      }

      // Extract nested objects if not at max depth
      if (depth < MAX_NESTING_DEPTH) {
        const prop = propSchema as Record<string, unknown>;
        if ((prop.type === 'object' || prop.properties) && prop.properties) {
          const nestedName = `${name}${toPascalCase(propName)}`;
          const uniqueName = ensureUniqueName(nestedName, schemaMap);
          const nested = normalizeSchema(prop, uniqueName, schemaMap, depth + 1);
          nested.metadata = { ...nested.metadata, parent: name };
          schemaMap.set(uniqueName, nested);
        }
      }
    }
  }

  return normalized;
}

/**
 * Normalizes array schema.
 */
function normalizeArraySchema(
  schema: Record<string, unknown>,
  name: string,
  schemaMap: SchemaMap,
  depth: number
): NormalizedSchema {
  const normalized: NormalizedSchema = {
    name,
    type: 'array',
    description: schema.description as string | undefined,
    constraints: {
      minItems: schema.minItems as number | undefined,
      maxItems: schema.maxItems as number | undefined,
      uniqueItems: schema.uniqueItems as boolean | undefined,
    },
  };

  if (schema.items && typeof schema.items === 'object') {
    const items = schema.items as Record<string, unknown>;

    if ((items.type === 'object' || items.properties) && depth < MAX_NESTING_DEPTH) {
      // Array of objects - extract items as separate schema
      const itemsName = `${name}Item`;
      const uniqueName = ensureUniqueName(itemsName, schemaMap);
      const itemsSchema = normalizeSchema(items, uniqueName, schemaMap, depth + 1);
      schemaMap.set(uniqueName, itemsSchema);
      normalized.items = itemsSchema;
    } else {
      // Array of primitives
      normalized.items = {
        name: `${name}Item`,
        type: (items.type as string) || 'string',
        format: items.format as string | undefined,
        enum: items.enum as (string | number)[] | undefined,
      } as NormalizedSchema;
    }
  }

  return normalized;
}

/**
 * Normalizes primitive schema.
 */
function normalizePrimitiveSchema(schema: Record<string, unknown>, name: string): NormalizedSchema {
  const constraints: SchemaConstraints = {};

  // Extract constraints
  if (schema.minLength !== undefined) {constraints.minLength = schema.minLength as number;}
  if (schema.maxLength !== undefined) {constraints.maxLength = schema.maxLength as number;}
  if (schema.pattern !== undefined) {constraints.pattern = schema.pattern as string;}
  if (schema.minimum !== undefined) {constraints.minimum = schema.minimum as number;}
  if (schema.maximum !== undefined) {constraints.maximum = schema.maximum as number;}

  return {
    name,
    type: (schema.type as string) || 'string',
    description: schema.description as string | undefined,
    format: schema.format as string | undefined,
    enum: schema.enum as (string | number)[] | undefined,
    example: schema.example,
    constraints: Object.keys(constraints).length > 0 ? constraints : undefined,
  } as NormalizedSchema;
}

/**
 * Extracts property metadata.
 */
function extractPropertyMetadata(
  property: Record<string, unknown>,
  _propertyName: string,
  required: boolean
): PropertySchema {
  const constraints: PropertyConstraints = {};

  // Extract constraints
  if (property.minLength !== undefined) {constraints.minLength = property.minLength as number;}
  if (property.maxLength !== undefined) {constraints.maxLength = property.maxLength as number;}
  if (property.pattern !== undefined) {constraints.pattern = property.pattern as string;}
  if (property.minimum !== undefined) {constraints.minimum = property.minimum as number;}
  if (property.maximum !== undefined) {constraints.maximum = property.maximum as number;}

  return {
    type: (property.type as string) || 'any',
    description: property.description as string | undefined,
    format: property.format as string | undefined,
    enum: property.enum as (string | number)[] | undefined,
    default: property.default,
    required,
    nullable: property.nullable as boolean | undefined,
    constraints: Object.keys(constraints).length > 0 ? constraints : undefined,
  };
}

/**
 * Ensures schema name is unique by appending suffix if needed.
 */
function ensureUniqueName(baseName: string, schemaMap: SchemaMap): string {
  let name = baseName;
  let counter = 2;

  while (schemaMap.has(name)) {
    name = `${baseName}${counter}`;
    counter++;
  }

  return name;
}

/**
 * Validates schema map for correctness.
 */
function validateSchemaMap(schemaMap: SchemaMap): boolean {
  const names = new Set<string>();

  for (const [name, schema] of schemaMap.entries()) {
    // Check unique names
    if (names.has(name)) {
      throw new Error(`Duplicate schema name: ${name}`);
    }
    names.add(name);

    // Check no $ref in output
    const schemaStr = JSON.stringify(schema);
    if (schemaStr.includes('"$ref"')) {
      throw new Error(`Schema ${name} contains unresolved $ref`);
    }

    // Check schema has name
    if (!schema.name) {
      throw new Error(`Schema missing name`);
    }
  }

  return true;
}

/**
 * Serializes schema map to JSON string.
 */
export function serializeSchemaMap(schemaMap: SchemaMap): string {
  const obj = Object.fromEntries(schemaMap);
  return JSON.stringify(obj, null, 2);
}

/**
 * Deserializes JSON string to schema map.
 */
export function deserializeSchemaMap(json: string): SchemaMap {
  const obj = JSON.parse(json);
  return new Map(Object.entries(obj));
}
