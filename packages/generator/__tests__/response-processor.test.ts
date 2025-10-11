/**
 * Unit tests for Response Processing Code Generator
 */

import { describe, it, expect } from 'vitest';
import { generateResponseProcessing, generateErrorHandling } from '../src/response-processor.js';
import type { OperationMetadata } from '@openapi-to-mcp/parser';

// Helper to create mock operation with required fields
function createMockOperation(overrides: Partial<OperationMetadata>): OperationMetadata {
  return {
    operationId: 'testOperation',
    path: '/test',
    method: 'get',
    summary: 'Test operation',
    description: 'Test description',
    pathParameters: [],
    queryParameters: [],
    headerParameters: [],
    tags: [],
    deprecated: false,
    responses: [],
    ...overrides,
  };
}

describe('generateResponseProcessing', () => {
  describe('Success Response Handling (2xx)', () => {
    it('should generate type casting for 200 response with schema', () => {
      const operation: OperationMetadata = {
        operationId: 'getUser',
        path: '/users/{userId}',
        method: 'get',
        summary: 'Get user',
        description: 'Get user by ID',
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        responses: [
          {
            statusCode: '200',
            description: 'Successful response',
            schemaName: 'UserResponse',
          },
        ],
        tags: [],
        deprecated: false,
      };

      const code = generateResponseProcessing(operation);

      expect(code).toContain('const typedData = response as UserResponse');
      expect(code).toContain('type: \'text\'');
      expect(code).toContain('JSON.stringify(truncatedData, null, 2)');
    });

    it('should handle response without schema', () => {
      const operation: OperationMetadata = {
        operationId: 'ping',
        path: '/ping',
        method: 'get',
        summary: 'Ping',
        description: 'Health check',
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        responses: [
          {
            statusCode: '200',
            description: 'OK',
          },
        ],
        tags: [],
        deprecated: false,
      };

      const code = generateResponseProcessing(operation);

      expect(code).toContain('No schema defined, use raw response');
      expect(code).toContain('const typedData = response');
      expect(code).not.toContain('as UserResponse');
    });

    it('should prefer 200 over 201 response', () => {
      const operation: OperationMetadata = {
        operationId: 'createUser',
        path: '/users',
        method: 'post',
        summary: 'Create user',
        description: 'Create user',
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        responses: [
          {
            statusCode: '201',
            description: 'Created',
            schemaName: 'CreateUserResponse',
          },
          {
            statusCode: '200',
            description: 'OK',
            schemaName: 'UserResponse',
          },
        ],
        tags: [],
        deprecated: false,
      };

      const code = generateResponseProcessing(operation);

      expect(code).toContain('const typedData = response as UserResponse');
    });

    it('should use 201 response when 200 not available', () => {
      const operation: OperationMetadata = {
        operationId: 'createUser',
        path: '/users',
        method: 'post',
        summary: 'Create user',
        description: 'Create user',
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        responses: [
          {
            statusCode: '201',
            description: 'Created',
            schemaName: 'CreateUserResponse',
          },
        ],
        tags: [],
        deprecated: false,
      };

      const code = generateResponseProcessing(operation);

      expect(code).toContain('const typedData = response as CreateUserResponse');
    });

    it('should handle 204 No Content response', () => {
      const operation: OperationMetadata = {
        operationId: 'deleteUser',
        path: '/users/{userId}',
        method: 'delete',
        summary: 'Delete user',
        description: 'Delete user',
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        responses: [
          {
            statusCode: '204',
            description: 'No Content',
          },
        ],
        tags: [],
        deprecated: false,
      };

      const code = generateResponseProcessing(operation);

      expect(code).toContain('const typedData = response');
      expect(code).toContain('JSON.stringify(truncatedData, null, 2)');
    });

    it('should use default response when no specific status codes', () => {
      const operation: OperationMetadata = {
        operationId: 'genericOperation',
        path: '/generic',
        method: 'get',
        summary: 'Generic operation',
        description: 'Generic operation',
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        responses: [
          {
            statusCode: 'default',
            description: 'Default response',
            schemaName: 'GenericResponse',
          },
        ],
        tags: [],
        deprecated: false,
      };

      const code = generateResponseProcessing(operation);

      expect(code).toContain('const typedData = response as GenericResponse');
    });

    it('should fallback to any 2xx response', () => {
      const operation: OperationMetadata = {
        operationId: 'customStatus',
        path: '/custom',
        method: 'post',
        summary: 'Custom status',
        description: 'Custom status',
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        responses: [
          {
            statusCode: '202',
            description: 'Accepted',
            schemaName: 'AcceptedResponse',
          },
        ],
        tags: [],
        deprecated: false,
      };

      const code = generateResponseProcessing(operation);

      expect(code).toContain('const typedData = response as AcceptedResponse');
    });
  });

  describe('MCP Response Formatting', () => {
    it('should format response as MCP content', () => {
      const operation: OperationMetadata = {
        operationId: 'getData',
        path: '/data',
        method: 'get',
        summary: 'Get data',
        description: 'Get data',
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        responses: [
          {
            statusCode: '200',
            description: 'Success',
            schemaName: 'DataResponse',
          },
        ],
        tags: [],
        deprecated: false,
      };

      const code = generateResponseProcessing(operation);

      expect(code).toContain('return {');
      expect(code).toContain('content: [');
      expect(code).toContain('type: \'text\'');
      expect(code).toContain('text: JSON.stringify(truncatedData, null, 2)');
      expect(code).toContain(']');
      expect(code).toContain('}');
    });

    it('should pretty-print JSON with 2-space indentation', () => {
      const operation: OperationMetadata = {
        operationId: 'getData',
        path: '/data',
        method: 'get',
        summary: 'Get data',
        description: 'Get data',
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        responses: [
          {
            statusCode: '200',
            description: 'Success',
          },
        ],
        tags: [],
        deprecated: false,
      };

      const code = generateResponseProcessing(operation);

      expect(code).toContain('JSON.stringify(truncatedData, null, 2)');
    });
  });

  describe('Error Handling', () => {
    it('should generate error handling wrapper', () => {
      const errorCode = generateErrorHandling('getUser');

      expect(errorCode).toContain('} catch (error: unknown) {');
      expect(errorCode).toContain('operation: \'getUser\'');
      expect(errorCode).toContain('error: true');
      expect(errorCode).toContain('message:');
      expect(errorCode).toContain('code:');
      expect(errorCode).toContain('timestamp:');
      expect(errorCode).toContain('throw errorResponse');
    });

    it('should include operation context in errors', () => {
      const errorCode = generateErrorHandling('createUser');

      expect(errorCode).toContain('operation: \'createUser\'');
    });

    it('should handle error details', () => {
      const errorCode = generateErrorHandling('getData');

      expect(errorCode).toContain('if (err.response)');
      expect(errorCode).toContain('details');
    });

    it('should include timestamp in error response', () => {
      const errorCode = generateErrorHandling('operation');

      expect(errorCode).toContain('timestamp: new Date().toISOString()');
    });
  });

  describe('No Responses Defined', () => {
    it('should handle operation with no responses', () => {
      const operation: OperationMetadata = {
        operationId: 'noResponses',
        path: '/no-responses',
        method: 'get',
        summary: 'No responses',
        description: 'No responses',
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        responses: [],
        tags: [],
        deprecated: false,
      };

      const code = generateResponseProcessing(operation);

      expect(code).toContain('No schema defined');
      expect(code).toContain('const typedData = response');
    });

    it('should handle operation with undefined responses', () => {
      const operation: OperationMetadata = {
        operationId: 'undefinedResponses',
        path: '/undefined',
        method: 'get',
        summary: 'Undefined responses',
        description: 'Undefined responses',
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        tags: [],
        deprecated: false,
      };

      const code = generateResponseProcessing(operation);

      expect(code).toContain('No schema defined');
      expect(code).toContain('const typedData = response');
    });
  });

  describe('Null Handling (AC7)', () => {
    it('should generate null/undefined normalization code', () => {
      const operation: OperationMetadata = createMockOperation({
        responses: [
          {
            statusCode: '200',
            description: 'Success',
            schemaName: 'UserResponse',
          },
        ],
      });

      const code = generateResponseProcessing(operation);

      expect(code).toContain('normalizeNullValues');
      expect(code).toContain('const normalizedData = normalizeNullValues(typedData)');
      expect(code).toContain('function normalizeNullValues(data: unknown)');
    });

    it('should handle null and undefined values recursively', () => {
      const operation: OperationMetadata = createMockOperation({
        responses: [{ statusCode: '200', schemaName: 'Response' }],
      });

      const code = generateResponseProcessing(operation);

      // Verify recursive handling for objects and arrays
      expect(code).toContain('if (data === null || data === undefined)');
      expect(code).toContain('if (Array.isArray(data))');
      expect(code).toContain('if (typeof data === \'object\' && data !== null)');
    });
  });

  describe('Array Truncation (AC8)', () => {
    it('should generate array truncation code', () => {
      const operation: OperationMetadata = createMockOperation({
        responses: [
          {
            statusCode: '200',
            description: 'Success',
            schemaName: 'ItemList',
          },
        ],
      });

      const code = generateResponseProcessing(operation);

      expect(code).toContain('truncateArrays');
      expect(code).toContain('const truncatedData = truncateArrays(normalizedData, 100)');
      expect(code).toContain('function truncateArrays(data: unknown, maxItems = 100)');
    });

    it('should truncate arrays exceeding maxItems limit', () => {
      const operation: OperationMetadata = createMockOperation({
        responses: [{ statusCode: '200', schemaName: 'Response' }],
      });

      const code = generateResponseProcessing(operation);

      // Verify truncation logic
      expect(code).toContain('if (data.length > maxItems)');
      expect(code).toContain('data.slice(0, maxItems)');
      expect(code).toContain('_truncated: true');
      expect(code).toContain('_originalLength: data.length');
      expect(code).toContain('_remainingItems: data.length - maxItems');
    });

    it('should add truncation metadata to truncated arrays', () => {
      const operation: OperationMetadata = createMockOperation({
        responses: [{ statusCode: '200', schemaName: 'Response' }],
      });

      const code = generateResponseProcessing(operation);

      expect(code).toContain('_message: `Array truncated: showing ${maxItems} of ${data.length} items`');
    });

    it('should use truncatedData in MCP response formatting', () => {
      const operation: OperationMetadata = createMockOperation({
        responses: [{ statusCode: '200', schemaName: 'Response' }],
      });

      const code = generateResponseProcessing(operation);

      expect(code).toContain('JSON.stringify(truncatedData, null, 2)');
      expect(code).not.toContain('JSON.stringify(typedData, null, 2)');
    });
  });

  describe('Performance Benchmarks (AC18)', () => {
    it('should generate response processing code efficiently', () => {
      const operation: OperationMetadata = createMockOperation({
        responses: [
          {
            statusCode: '200',
            description: 'Success',
            schemaName: 'ComplexResponse',
          },
        ],
      });

      const iterations = 1000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        generateResponseProcessing(operation);
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;

      // Should be very fast (<1ms per operation)
      expect(avgTime).toBeLessThan(1);
    });
  });

  describe('CSV Response Handling (Story 9.3)', () => {
    it('should preserve CSV formatting for text/csv responses', () => {
      const operation: OperationMetadata = createMockOperation({
        operationId: 'DownloadStatistics',
        responses: [
          {
            statusCode: '200',
            description: 'Statistics report',
            mediaType: 'text/csv',
          },
        ],
      });

      const code = generateResponseProcessing(operation);

      expect(code).toContain('isTextResponse');
      expect(code).toContain('text/');
      expect(code).toContain('String(response.data || response)');
    });

    it('should not affect JSON responses (backward compatible)', () => {
      const operation: OperationMetadata = createMockOperation({
        operationId: 'ListCampaigns',
        responses: [
          {
            statusCode: '200',
            description: 'Campaign list',
            mediaType: 'application/json',
            schemaName: 'CampaignList',
          },
        ],
      });

      const code = generateResponseProcessing(operation);

      expect(code).toContain('JSON.stringify(truncatedData, null, 2)');
      expect(code).not.toContain('isTextResponse');
    });

    it('should handle text/plain responses', () => {
      const operation: OperationMetadata = createMockOperation({
        operationId: 'GetLogs',
        responses: [
          {
            statusCode: '200',
            description: 'Log file',
            mediaType: 'text/plain',
          },
        ],
      });

      const code = generateResponseProcessing(operation);

      expect(code).toContain('isTextResponse');
      expect(code).toContain('text/');
    });

    it('should handle text/html responses', () => {
      const operation: OperationMetadata = createMockOperation({
        operationId: 'GetReport',
        responses: [
          {
            statusCode: '200',
            description: 'HTML report',
            mediaType: 'text/html',
          },
        ],
      });

      const code = generateResponseProcessing(operation);

      expect(code).toContain('isTextResponse');
      expect(code).toContain('text/');
    });

    it('should use JSON formatting when no text/* media type detected', () => {
      const operation: OperationMetadata = createMockOperation({
        operationId: 'GetData',
        responses: [
          {
            statusCode: '200',
            description: 'Data response',
            mediaType: 'application/xml',
          },
        ],
      });

      const code = generateResponseProcessing(operation);

      expect(code).not.toContain('isTextResponse');
      expect(code).toContain('JSON.stringify(truncatedData, null, 2)');
    });

    it('should generate conditional formatting code for CSV responses', () => {
      const operation: OperationMetadata = createMockOperation({
        operationId: 'ExportData',
        responses: [
          {
            statusCode: '200',
            description: 'Export file',
            mediaType: 'text/csv',
          },
        ],
      });

      const code = generateResponseProcessing(operation);

      // Verify runtime detection
      expect(code).toContain('typeof response === \'string\'');
      expect(code).toContain('response?.headers?.[\'content-type\']?.includes(\'text/\')');

      // Verify conditional formatting
      expect(code).toContain('? String(response.data || response)');
      expect(code).toContain(': JSON.stringify(truncatedData, null, 2)');
    });
  });
});
