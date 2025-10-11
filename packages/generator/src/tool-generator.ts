/**
 * MCP Tool Definition Generator from OpenAPI Operations
 * Converts OpenAPI operations to MCP tool definitions
 */

import debugLib from 'debug';
import type { OperationMetadata, ParameterMetadata, NormalizedSchema, SchemaMap } from '@openapi-to-mcp/parser';
import { generateParameterMapping } from './parameter-mapper.js';

const debug = debugLib('openapi-to-mcp:tool-generator');

/**
 * JSON Schema property definition
 */
export interface JSONSchemaProperty {
  type: string;
  description?: string;
  format?: string;
  enum?: (string | number | boolean)[];
  items?: JSONSchemaProperty;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  default?: unknown;
}

/**
 * JSON Schema definition for tool input
 */
export interface JSONSchema {
  type: 'object';
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

/**
 * MCP Tool Definition
 */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  executeCode?: string;
  tags?: string[];
  security?: string[];
}

/**
 * Tool generation options
 */
export interface ToolGenerationOptions {
  /** Maximum description length (default: 300) */
  maxDescriptionLength?: number;
  /** Include tag grouping (default: true) */
  includeTags?: boolean;
  /** Include security documentation (default: true) */
  includeSecurity?: boolean;
  /** Handle name collisions with numbering (default: true) */
  handleCollisions?: boolean;
  /** Generate execute function code (default: true) */
  generateExecuteCode?: boolean;
}

/**
 * Tool generation result
 */
export interface ToolGenerationResult {
  tools: ToolDefinition[];
  nameCollisions: string[];
  warnings: string[];
}

/**
 * Generate MCP tool definitions from OpenAPI operations
 */
export function generateToolDefinitions(
  operations: OperationMetadata[],
  schemas: SchemaMap,
  options: ToolGenerationOptions = {}
): ToolGenerationResult {
  const opts: Required<ToolGenerationOptions> = {
    maxDescriptionLength: options.maxDescriptionLength ?? 300,
    includeTags: options.includeTags ?? true,
    includeSecurity: options.includeSecurity ?? true,
    handleCollisions: options.handleCollisions ?? true,
    generateExecuteCode: options.generateExecuteCode ?? true,
  };

  const tools: ToolDefinition[] = [];
  const nameCollisions: string[] = [];
  const warnings: string[] = [];
  const usedNames = new Set<string>();

  for (const operation of operations) {
    try {
      // Generate unique tool name
      let toolName = operation.operationId;

      if (opts.handleCollisions && usedNames.has(toolName)) {
        // Handle name collision
        let suffix = 1;
        const baseName = toolName;
        while (usedNames.has(toolName)) {
          toolName = `${baseName}${suffix}`;
          suffix++;
        }
        nameCollisions.push(baseName);
      }

      usedNames.add(toolName);

      // Generate tool definition
      const tool: ToolDefinition = {
        name: toolName,
        description: generateToolDescription(operation, opts),
        inputSchema: generateInputSchema(operation, schemas),
      };

      // Generate execute function code if enabled
      if (opts.generateExecuteCode) {
        tool.executeCode = generateParameterMapping(operation);
      }

      // Add tags if enabled
      if (opts.includeTags && operation.tags.length > 0) {
        tool.tags = operation.tags;
      }

      // Add security documentation if enabled
      if (opts.includeSecurity && operation.security && operation.security.length > 0) {
        tool.security = extractSecurityRequirements(operation.security);
      }

      tools.push(tool);
    } catch (error) {
      warnings.push(`Failed to generate tool for operation ${operation.operationId}: ${error}`);
    }
  }

  return {
    tools,
    nameCollisions,
    warnings,
  };
}

/**
 * Generate AI-optimized tool description
 */
function generateToolDescription(
  operation: OperationMetadata,
  options: Required<ToolGenerationOptions>
): string {
  const summary = operation.summary || 'API operation';
  const description = operation.description || '';

  // Start with summary
  let fullDescription = summary;

  // Add detailed description if different from summary
  if (description && description.trim() !== summary.trim()) {
    fullDescription += '. ' + description;
  }

  // Add deprecation notice
  if (operation.deprecated) {
    fullDescription += ' [DEPRECATED]';
  }

  // Add security requirements
  if (options.includeSecurity && operation.security && operation.security.length > 0) {
    fullDescription += '. Requires authentication.';
  }

  // Truncate if too long
  if (fullDescription.length > options.maxDescriptionLength) {
    fullDescription = fullDescription.substring(0, options.maxDescriptionLength - 3) + '...';
  }

  return fullDescription;
}

/**
 * Generate JSON Schema from operation parameters
 */
function generateInputSchema(operation: OperationMetadata, schemas: SchemaMap): JSONSchema {
  const properties: Record<string, JSONSchemaProperty> = {};
  const required: string[] = [];

  // Add path parameters (all required)
  for (const param of operation.pathParameters) {
    properties[param.name] = parameterToJsonSchemaProperty(param);
    required.push(param.name);
  }

  // Add query parameters
  for (const param of operation.queryParameters) {
    properties[param.name] = parameterToJsonSchemaProperty(param);
    if (param.required) {
      required.push(param.name);
    }
  }

  // Add header parameters (if custom)
  for (const param of operation.headerParameters) {
    // Skip standard headers
    if (isCustomHeader(param.name)) {
      properties[param.name] = parameterToJsonSchemaProperty(param);
      if (param.required) {
        required.push(param.name);
      }
    }
  }

  // Add request body as expanded schema
  if (operation.requestBody) {
    const bodySchema = expandRequestBodySchema(
      operation.requestBody,
      schemas
    );

    if (bodySchema) {
      properties['body'] = bodySchema;

      if (operation.requestBody.required) {
        required.push('body');
      }
    }
  }

  return {
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined,
    additionalProperties: false,
  };
}

/**
 * Convert OpenAPI parameter to JSON Schema property
 */
function parameterToJsonSchemaProperty(param: ParameterMetadata): JSONSchemaProperty {
  const schema = param.schema || {};
  const schemaType = typeof schema.type === 'string' ? schema.type : 'string';

  const property: JSONSchemaProperty = {
    type: mapTypeToJsonSchema(schemaType),
  };

  // Add description with fallback
  if (param.description) {
    property.description = param.description;
  } else if (typeof schema.description === 'string') {
    property.description = schema.description;
  }

  // Add format
  if (typeof schema.format === 'string') {
    property.format = schema.format;
  }

  // Add enum values
  if (Array.isArray(schema.enum)) {
    property.enum = schema.enum as (string | number | boolean)[];
  }

  // Add default value
  if (schema.default !== undefined) {
    property.default = schema.default;
  }

  // Handle array items
  if (schemaType === 'array' && schema.items) {
    property.items = expandArrayItems(schema.items, 0, new Set());
  }

  return property;
}

/**
 * Expand array items schema to JSON Schema property
 *
 * Recursively processes OpenAPI array items schemas and converts them to
 * JSON Schema format. Handles nested arrays, object items with properties,
 * enum values, format constraints, and circular references.
 *
 * @param items - Array items schema from OpenAPI specification
 * @param depth - Current recursion depth for overflow protection (default: 0, max: 10)
 * @param visited - Set of visited schema names for circular reference detection
 * @returns Expanded JSON Schema property representing the array items
 * @throws {Error} If maximum depth (10 levels) is exceeded during recursion
 *
 * @example
 * ```typescript
 * // Simple array of strings
 * const items = { type: 'string', format: 'uint64' };
 * const result = expandArrayItems(items);
 * // Returns: { type: 'string', format: 'uint64' }
 *
 * // Nested array (array of arrays)
 * const nestedItems = {
 *   type: 'array',
 *   items: { type: 'number' }
 * };
 * const result = expandArrayItems(nestedItems);
 * // Returns: { type: 'array', items: { type: 'number' } }
 *
 * // Array of objects with properties
 * const objectItems = {
 *   type: 'object',
 *   properties: {
 *     id: { type: 'string' },
 *     count: { type: 'number' }
 *   },
 *   required: ['id']
 * };
 * const result = expandArrayItems(objectItems);
 * // Returns expanded object schema with properties
 * ```
 *
 * @internal
 */
function expandArrayItems(items: unknown, depth: number = 0, visited: Set<string> = new Set()): JSONSchemaProperty {
  // Depth limit protection
  if (depth > 10) {
    throw new Error('Maximum array nesting depth exceeded (10 levels)');
  }

  // Handle non-object items (safety check)
  if (!items || typeof items !== 'object') {
    return { type: 'string' };
  }

  const itemsSchema = items as Record<string, unknown>;

  // Handle $ref in items
  // Note: OpenAPI $refs are expected to be pre-resolved by swagger-parser
  // If a $ref is still present, it indicates the schema wasn't fully dereferenced
  if (typeof itemsSchema.$ref === 'string') {
    return {
      type: 'object',
      description: `Reference: ${itemsSchema.$ref}`,
    };
  }

  // Circular reference detection
  // Check if schema has a name/id that we can track
  const schemaName = typeof itemsSchema.name === 'string'
    ? itemsSchema.name
    : undefined;

  if (schemaName) {
    if (visited.has(schemaName)) {
      return {
        type: 'object',
        description: `Circular reference: ${schemaName}`,
      };
    }
    visited.add(schemaName);
  }

  const itemType = typeof itemsSchema.type === 'string' ? itemsSchema.type : 'string';

  const itemProperty: JSONSchemaProperty = {
    type: mapTypeToJsonSchema(itemType),
  };

  // Add description
  if (typeof itemsSchema.description === 'string') {
    itemProperty.description = itemsSchema.description;
  }

  // Add format (e.g., uint64, date)
  if (typeof itemsSchema.format === 'string') {
    itemProperty.format = itemsSchema.format;
  }

  // Add enum values
  if (Array.isArray(itemsSchema.enum)) {
    itemProperty.enum = itemsSchema.enum as (string | number | boolean)[];
  }

  // Handle nested arrays (array of arrays)
  if (itemType === 'array' && itemsSchema.items) {
    itemProperty.items = expandArrayItems(itemsSchema.items, depth + 1, visited);
  }

  // Handle object items (array of objects)
  if (itemType === 'object' && itemsSchema.properties) {
    itemProperty.properties = {};
    const props = itemsSchema.properties as Record<string, unknown>;

    for (const [key, value] of Object.entries(props)) {
      if (value && typeof value === 'object') {
        itemProperty.properties[key] = expandArrayItems(value, depth + 1, visited);
      }
    }

    // Add required fields
    if (Array.isArray(itemsSchema.required)) {
      itemProperty.required = itemsSchema.required as string[];
    }
  }

  // Remove from visited set (allow same schema in different branches)
  if (schemaName) {
    visited.delete(schemaName);
  }

  return itemProperty;
}

/**
 * Map OpenAPI type to JSON Schema type
 */
function mapTypeToJsonSchema(openApiType: string): string {
  const typeMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    integer: 'integer',
    boolean: 'boolean',
    array: 'array',
    object: 'object',
  };
  return typeMap[openApiType] || 'string';
}

/**
 * Check if header is custom (not standard HTTP header)
 */
function isCustomHeader(headerName: string): boolean {
  const standardHeaders = [
    'accept',
    'accept-encoding',
    'accept-language',
    'authorization',
    'cache-control',
    'content-type',
    'content-length',
    'cookie',
    'host',
    'user-agent',
  ];
  return !standardHeaders.includes(headerName.toLowerCase());
}

/**
 * Extract security requirements from operation
 */
function extractSecurityRequirements(security: unknown[]): string[] {
  const requirements: string[] = [];

  // This is a placeholder - actual implementation depends on security extraction from Story 2.6
  if (Array.isArray(security) && security.length > 0) {
    requirements.push('API Key authentication');
  }

  return requirements;
}

/**
 * Expand request body schema from OpenAPI to full JSON Schema
 * Handles $ref resolution, nested properties, composition
 *
 * @param requestBody - Request body metadata from operation
 * @param schemas - Map of all component schemas
 * @returns Expanded JSON Schema property or null if no schema
 */
function expandRequestBodySchema(
  requestBody: { schemaName?: string; description?: string; schema?: Record<string, unknown> },
  schemas: SchemaMap
): JSONSchemaProperty | null {
  // Try schema name first (references a schema in SchemaMap)
  if (requestBody.schemaName) {
    const schema = schemas.get(requestBody.schemaName);
    if (schema) {
      const visited = new Set<string>();

      try {
        const expanded = expandSchema(schema, schemas, visited, 0);

        // Add description from request body if not in schema
        if (requestBody.description && !expanded.description) {
          expanded.description = requestBody.description;
        }

        return expanded;
      } catch (error) {
        // Fallback to generic object if expansion fails
        debug('Failed to expand request body schema: %o', error);
      }
    }
  }

  // Try inline schema (dereferenced schema from resolved document)
  if (requestBody.schema && typeof requestBody.schema === 'object') {
    try {
      return expandInlineSchema(requestBody.schema, requestBody.description);
    } catch (error) {
      debug('Failed to expand inline request body schema: %o', error);
    }
  }

  // Fallback to generic object
  return {
    type: 'object',
    description: requestBody.description || 'Request body',
  };
}

/**
 * Expand inline schema (already dereferenced) to JSON Schema
 */
function expandInlineSchema(
  schema: Record<string, unknown>,
  description?: string
): JSONSchemaProperty {
  const jsonSchema: JSONSchemaProperty = {
    type: mapSchemaTypeToJsonSchema((schema.type as string) || 'object'),
  };

  // Add description
  if (description && !schema.description) {
    jsonSchema.description = description;
  } else if (schema.description) {
    jsonSchema.description = schema.description as string;
  }

  // Add format
  if (schema.format) {
    jsonSchema.format = schema.format as string;
  }

  // Add enum
  if (schema.enum && Array.isArray(schema.enum)) {
    jsonSchema.enum = schema.enum as (string | number | boolean)[];
  }

  // Handle object properties
  if (schema.type === 'object' && schema.properties) {
    jsonSchema.properties = {};

    const props = schema.properties as Record<string, unknown>;
    for (const [propName, propSchema] of Object.entries(props)) {
      if (propSchema && typeof propSchema === 'object') {
        jsonSchema.properties[propName] = expandInlineSchema(
          propSchema as Record<string, unknown>
        );
      }
    }

    // Add required fields
    if (schema.required && Array.isArray(schema.required)) {
      jsonSchema.required = schema.required as string[];
    }
  }

  // Handle array items
  if (schema.type === 'array' && schema.items) {
    jsonSchema.items = expandInlineSchema(schema.items as Record<string, unknown>);
  }

  return jsonSchema;
}

/**
 * Recursively expand OpenAPI schema to JSON Schema
 *
 * @param schema - Normalized schema object from parser
 * @param schemas - Map of all component schemas
 * @param visited - Set of visited schema names (circular detection)
 * @param depth - Current recursion depth (max 10)
 * @returns Expanded JSON Schema property
 */
function expandSchema(
  schema: NormalizedSchema,
  schemas: SchemaMap,
  visited: Set<string>,
  depth: number
): JSONSchemaProperty {
  // Depth limit protection
  if (depth > 10) {
    throw new Error('Maximum schema depth exceeded (10 levels)');
  }

  // Circular reference detection
  if (visited.has(schema.name)) {
    return {
      type: 'object',
      description: `Circular reference: ${schema.name}`,
    };
  }

  // Add to visited set
  visited.add(schema.name);

  // Base JSON Schema property
  const jsonSchema: JSONSchemaProperty = {
    type: mapSchemaTypeToJsonSchema(schema.type),
  };

  // Add description
  if (schema.description) {
    jsonSchema.description = schema.description;
  }

  // Add format
  if (schema.format) {
    jsonSchema.format = schema.format;
  }

  // Add enum
  if (schema.enum && Array.isArray(schema.enum)) {
    jsonSchema.enum = schema.enum as (string | number | boolean)[];
  }

  // Handle object properties
  if (schema.type === 'object' && schema.properties) {
    jsonSchema.properties = {};

    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      jsonSchema.properties[propName] = expandPropertySchema(
        propSchema,
        schemas,
        visited,
        depth + 1
      );
    }

    // Add required fields
    if (schema.required && Array.isArray(schema.required)) {
      jsonSchema.required = schema.required;
    }
  }

  // Handle array items
  if (schema.type === 'array' && schema.items) {
    jsonSchema.items = expandSchema(
      schema.items,
      schemas,
      visited,
      depth + 1
    );
  }

  // Handle composition (allOf/oneOf/anyOf)
  if (schema.composition) {
    const composedSchema = expandComposition(schema.composition, schemas, visited, depth);

    // Merge composed schema into current schema
    Object.assign(jsonSchema, composedSchema);
  }

  // Remove from visited set (allow same schema in different branches)
  visited.delete(schema.name);

  return jsonSchema;
}

/**
 * Expand property schema (simplified version for nested properties)
 */
function expandPropertySchema(
  propSchema: { type: string; description?: string; format?: string; enum?: (string | number)[]; items?: unknown; properties?: unknown },
  schemas: SchemaMap,
  visited: Set<string>,
  depth: number
): JSONSchemaProperty {
  const property: JSONSchemaProperty = {
    type: mapSchemaTypeToJsonSchema(propSchema.type),
  };

  if (propSchema.description) {
    property.description = propSchema.description;
  }

  if (propSchema.format) {
    property.format = propSchema.format;
  }

  if (propSchema.enum && Array.isArray(propSchema.enum)) {
    property.enum = propSchema.enum as (string | number | boolean)[];
  }

  // Handle nested arrays
  if (propSchema.type === 'array' && propSchema.items) {
    const items = propSchema.items as { type: string; description?: string; format?: string; enum?: (string | number)[] };
    property.items = expandPropertySchema(items, schemas, visited, depth + 1);
  }

  return property;
}

/**
 * Expand composition schemas (allOf/oneOf/anyOf)
 *
 * @param composition - Composition metadata
 * @param schemas - Map of all component schemas
 * @param visited - Set of visited schema names
 * @param depth - Current recursion depth
 * @returns Merged JSON Schema property
 */
function expandComposition(
  composition: { type: 'allOf' | 'oneOf' | 'anyOf'; schemas: string[]; merged: boolean },
  schemas: SchemaMap,
  visited: Set<string>,
  depth: number
): JSONSchemaProperty {
  // Handle allOf (merge all schemas)
  if (composition.type === 'allOf') {
    const mergedProperties: Record<string, JSONSchemaProperty> = {};
    const mergedRequired: string[] = [];

    for (const schemaName of composition.schemas) {
      const schema = schemas.get(schemaName);
      if (!schema) continue;

      const expanded = expandSchema(schema, schemas, visited, depth + 1);

      // Merge properties
      if (expanded.properties) {
        Object.assign(mergedProperties, expanded.properties);
      }

      // Merge required fields
      if (expanded.required) {
        mergedRequired.push(...expanded.required);
      }
    }

    return {
      type: 'object',
      properties: mergedProperties,
      required: mergedRequired.length > 0 ? mergedRequired : undefined,
    };
  }

  // Handle oneOf/anyOf (union types)
  if (composition.type === 'oneOf' || composition.type === 'anyOf') {
    // For JSON Schema, we'll represent as a generic object
    // Full oneOf/anyOf support would require JSON Schema Draft 7
    return {
      type: 'object',
      description: `Union type (${composition.type})`,
    };
  }

  return {
    type: 'object',
  };
}

/**
 * Map schema type to JSON Schema type
 */
function mapSchemaTypeToJsonSchema(schemaType: string): string {
  const typeMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    integer: 'integer',
    boolean: 'boolean',
    array: 'array',
    object: 'object',
    null: 'null',
  };
  return typeMap[schemaType] || 'string';
}
