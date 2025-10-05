/**
 * MCP Tool Definition Generator from OpenAPI Operations
 * Converts OpenAPI operations to MCP tool definitions
 */

import type { OperationMetadata, ParameterMetadata } from '@openapi-to-mcp/parser';
import { generateParameterMapping } from './parameter-mapper.js';

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
        inputSchema: generateInputSchema(operation),
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
function generateInputSchema(operation: OperationMetadata): JSONSchema {
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

  // Add request body as nested object
  if (operation.requestBody) {
    properties['body'] = {
      type: 'object',
      description: operation.requestBody.description || 'Request body',
    };
    if (operation.requestBody.required) {
      required.push('body');
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
  const property: JSONSchemaProperty = {
    type: mapTypeToJsonSchema(param.schema?.type || 'string'),
  };

  // Add description
  if (param.description) {
    property.description = param.description;
  }

  // Add format
  if (param.schema?.format) {
    property.format = param.schema.format;
  }

  // Add enum values
  if (param.schema?.enum) {
    property.enum = param.schema.enum;
  }

  // Add default value
  if (param.schema?.default !== undefined) {
    property.default = param.schema.default;
  }

  return property;
}

/**
 * Map OpenAPI type to JSON Schema type
 */
function mapTypeToJsonSchema(openApiType: string): string {
  const typeMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    integer: 'number',
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
