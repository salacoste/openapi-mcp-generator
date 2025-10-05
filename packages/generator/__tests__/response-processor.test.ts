/**
 * Unit tests for Response Processing Code Generator
 */

import { describe, it, expect } from 'vitest';
import { generateResponseProcessing, generateErrorHandling } from '../src/response-processor.js';
import type { OperationMetadata } from '@openapi-to-mcp/parser';

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
      expect(code).toContain('JSON.stringify(typedData, null, 2)');
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
      expect(code).toContain('JSON.stringify(typedData, null, 2)');
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
      expect(code).toContain('text: JSON.stringify(typedData, null, 2)');
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

      expect(code).toContain('JSON.stringify(typedData, null, 2)');
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
});
