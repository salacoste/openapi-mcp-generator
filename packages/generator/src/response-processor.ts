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
            text: JSON.stringify(typedData, null, 2)
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
