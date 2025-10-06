/**
 * Response Processing Code Generator
 * Generates response processing and type casting code for MCP tools
 */

import type { OperationMetadata } from '@openapi-to-mcp/parser';

/**
 * Response schema information
 */
interface ResponseSchema {
  statusCode: string;
  typeName: string | null;
  description?: string;
}

/**
 * Generate response processing code for an operation's execute function
 */
export function generateResponseProcessing(operation: OperationMetadata): string {
  const successSchema = getSuccessResponseSchema(operation);
  const hasTypeCasting = successSchema?.typeName !== null;

  const codeLines: string[] = [];

  // Add type casting if schema available
  if (hasTypeCasting && successSchema?.typeName) {
    codeLines.push(`      // Type cast response to generated interface
      const typedData = response as ${successSchema.typeName};`);
  } else {
    codeLines.push(`      // No schema defined, use raw response
      const typedData = response;`);
  }

  // Add null/undefined normalization
  codeLines.push(generateNullHandling());

  // Add array truncation for large responses
  codeLines.push(generateArrayTruncation());

  // Add MCP response formatting
  codeLines.push(generateMCPFormatting());

  return codeLines.join('\n\n');
}

/**
 * Get success response schema (2xx status codes)
 */
function getSuccessResponseSchema(operation: OperationMetadata): ResponseSchema | null {
  // Check if operation has responses defined
  if (!operation.responses || operation.responses.length === 0) {
    return null;
  }

  // Priority order: 200, 201, 204, 2xx, default
  const priorityOrder = ['200', '201', '204', '2xx', 'default'];

  for (const statusCode of priorityOrder) {
    const response = operation.responses.find(r => r.statusCode === statusCode);
    if (response) {
      return {
        statusCode: response.statusCode,
        typeName: response.schemaName || null,
        description: response.description,
      };
    }
  }

  // Fallback: find any 2xx response
  const success2xx = operation.responses.find(r => {
    const code = parseInt(r.statusCode);
    return !isNaN(code) && code >= 200 && code < 300;
  });

  if (success2xx) {
    return {
      statusCode: success2xx.statusCode,
      typeName: success2xx.schemaName || null,
      description: success2xx.description,
    };
  }

  return null;
}

/**
 * Generate MCP response formatting code
 */
function generateMCPFormatting(): string {
  return `      // Format response for MCP protocol
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(truncatedData, null, 2)
          }
        ]
      };`;
}

/**
 * Generate error handling wrapper code
 */
export function generateErrorHandling(operationId: string): string {
  return `      } catch (error: unknown) {
        // Enhanced error handling with operation context
        const err = error as { message?: string; statusCode?: number; response?: unknown };

        const errorResponse = {
          error: true,
          operation: '${operationId}',
          message: err.message || 'Tool execution failed',
          code: err.statusCode,
          timestamp: new Date().toISOString()
        };

        if (err.response) {
          (errorResponse as { details?: unknown }).details = err.response;
        }

        throw errorResponse;
      }`;
}

/**
 * Generate complete execute function with error handling
 */
export function wrapWithErrorHandling(
  operationId: string,
  parameterMappingCode: string,
  responseProcessingCode: string
): string {
  return `      try {
${parameterMappingCode}

${responseProcessingCode}

${generateErrorHandling(operationId)}`;
}

/**
 * Generate null/undefined handling code (AC7)
 * Normalizes null and undefined values in response data
 */
function generateNullHandling(): string {
  return `      // Normalize null and undefined values
      const normalizedData = normalizeNullValues(typedData);

      function normalizeNullValues(data: unknown): unknown {
        if (data === null || data === undefined) {
          return null;
        }

        if (Array.isArray(data)) {
          return data.map(item => normalizeNullValues(item));
        }

        if (typeof data === 'object' && data !== null) {
          const normalized: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(data)) {
            normalized[key] = normalizeNullValues(value);
          }
          return normalized;
        }

        return data;
      }`;
}

/**
 * Generate array truncation code (AC8)
 * Truncates large arrays to prevent context overflow
 */
function generateArrayTruncation(): string {
  return `      // Truncate large arrays to prevent context overflow
      const truncatedData = truncateArrays(normalizedData, 100);

      function truncateArrays(data: unknown, maxItems = 100): unknown {
        if (Array.isArray(data)) {
          if (data.length > maxItems) {
            const truncated = data.slice(0, maxItems);
            return [...truncated.map(item => truncateArrays(item, maxItems)), {
              _truncated: true,
              _originalLength: data.length,
              _remainingItems: data.length - maxItems,
              _message: \`Array truncated: showing \${maxItems} of \${data.length} items\`
            }];
          }
          return data.map(item => truncateArrays(item, maxItems));
        }

        if (typeof data === 'object' && data !== null) {
          const truncated: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(data)) {
            truncated[key] = truncateArrays(value, maxItems);
          }
          return truncated;
        }

        return data;
      }`;
}
