/**
 * Unit tests for Request Parameter Mapping Code Generator
 */

import { describe, it, expect } from 'vitest';
import { generateParameterMapping } from '../src/parameter-mapper.js';
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

describe('generateParameterMapping', () => {
  describe('Path Parameter Substitution', () => {
    it('should generate code for single path parameter', () => {
      const operation: OperationMetadata = createMockOperation({
        operationId: 'getUser',
        path: '/users/{userId}',
        method: 'get',
        summary: 'Get user',
        description: 'Get user by ID',
        pathParameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
      });

      const code = generateParameterMapping(operation);

      expect(code).toContain('let url = \'/users/{userId}\'');
      expect(code).toContain('url = url.replace(\'{userId}\', encodeURIComponent(String(args.userId)))');
      expect(code).toContain('Missing required path parameter: userId');
    });

    it('should generate code for multiple path parameters', () => {
      const operation: OperationMetadata = {
        operationId: 'getPost',
        path: '/users/{userId}/posts/{postId}',
        method: 'get',
        summary: 'Get post',
        description: 'Get post by user and post ID',
        pathParameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'postId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        queryParameters: [],
        headerParameters: [],
        tags: [],
        deprecated: false,
        responses: [],
      };

      const code = generateParameterMapping(operation);

      expect(code).toContain('url = url.replace(\'{userId}\', encodeURIComponent(String(args.userId)))');
      expect(code).toContain('url = url.replace(\'{postId}\', encodeURIComponent(String(');
      expect(code).toContain('Missing required path parameter: userId');
      expect(code).toContain('Missing required path parameter: postId');
    });

    it('should handle numeric path parameters with type coercion', () => {
      const operation: OperationMetadata = {
        operationId: 'getItem',
        path: '/items/{itemId}',
        method: 'get',
        summary: 'Get item',
        description: 'Get item by ID',
        pathParameters: [
          {
            name: 'itemId',
            in: 'path',
            required: true,
            schema: { type: 'number' },
          },
        ],
        queryParameters: [],
        headerParameters: [],
        tags: [],
        deprecated: false,
      };

      const code = generateParameterMapping(operation);

      expect(code).toContain('typeof args.itemId === \'string\' ? Number(args.itemId) : args.itemId');
    });
  });

  describe('Query Parameter Mapping', () => {
    it('should generate code for optional query parameters', () => {
      const operation: OperationMetadata = {
        operationId: 'listUsers',
        path: '/users',
        method: 'get',
        summary: 'List users',
        description: 'List users',
        pathParameters: [],
        queryParameters: [
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 10 },
          },
        ],
        headerParameters: [],
        tags: [],
        deprecated: false,
      };

      const code = generateParameterMapping(operation);

      expect(code).toContain('const params: Record<string, unknown> = {}');
      expect(code).toContain('if (args.page !== undefined && args.page !== null)');
      expect(code).toContain('params[\'page\']');
      expect(code).toContain('params[\'limit\']');
    });

    it('should generate code for required query parameters', () => {
      const operation: OperationMetadata = {
        operationId: 'searchUsers',
        path: '/users/search',
        method: 'get',
        summary: 'Search users',
        description: 'Search users',
        pathParameters: [],
        queryParameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
        ],
        headerParameters: [],
        tags: [],
        deprecated: false,
      };

      const code = generateParameterMapping(operation);

      expect(code).toContain('Missing required query parameter: q');
    });

    it('should apply default values for query parameters', () => {
      const operation: OperationMetadata = {
        operationId: 'listItems',
        path: '/items',
        method: 'get',
        summary: 'List items',
        description: 'List items',
        pathParameters: [],
        queryParameters: [
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 10 },
          },
        ],
        headerParameters: [],
        tags: [],
        deprecated: false,
      };

      const code = generateParameterMapping(operation);

      expect(code).toContain('params[\'limit\'] = 10');
    });
  });

  describe('Header Parameter Mapping', () => {
    it('should generate code for custom headers', () => {
      const operation: OperationMetadata = {
        operationId: 'getData',
        path: '/data',
        method: 'get',
        summary: 'Get data',
        description: 'Get data',
        pathParameters: [],
        queryParameters: [],
        headerParameters: [
          {
            name: 'X-Custom-Header',
            in: 'header',
            required: false,
            schema: { type: 'string' },
          },
        ],
        tags: [],
        deprecated: false,
      };

      const code = generateParameterMapping(operation);

      expect(code).toContain('const headers: Record<string, string> = {}');
      expect(code).toContain('headers[\'X-Custom-Header\']');
    });

    it('should skip standard headers like Authorization', () => {
      const operation: OperationMetadata = {
        operationId: 'getData',
        path: '/data',
        method: 'get',
        summary: 'Get data',
        description: 'Get data',
        pathParameters: [],
        queryParameters: [],
        headerParameters: [
          {
            name: 'Authorization',
            in: 'header',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'X-Custom',
            in: 'header',
            required: false,
            schema: { type: 'string' },
          },
        ],
        tags: [],
        deprecated: false,
      };

      const code = generateParameterMapping(operation);

      expect(code).not.toContain('headers[\'Authorization\']');
      expect(code).not.toContain('headers[\'authorization\']');
      expect(code).toContain('headers[\'X-Custom\']');
    });
  });

  describe('Request Body Mapping', () => {
    it('should generate code for request body', () => {
      const operation: OperationMetadata = {
        operationId: 'createUser',
        path: '/users',
        method: 'post',
        summary: 'Create user',
        description: 'Create user',
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        requestBody: {
          required: true,
          description: 'User data',
          mediaType: 'application/json',
        },
        tags: [],
        deprecated: false,
      };

      const code = generateParameterMapping(operation);

      expect(code).toContain('const data = args.body');
      expect(code).toContain('Missing required request body');
    });

    it('should not generate body code for GET requests', () => {
      const operation: OperationMetadata = {
        operationId: 'getUser',
        path: '/users/{userId}',
        method: 'get',
        summary: 'Get user',
        description: 'Get user by ID',
        pathParameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        queryParameters: [],
        headerParameters: [],
        tags: [],
        deprecated: false,
      };

      const code = generateParameterMapping(operation);

      expect(code).not.toContain('const data = args.body');
    });
  });

  describe('HTTP Method Integration', () => {
    it('should generate correct client call for GET request', () => {
      const operation: OperationMetadata = {
        operationId: 'getUser',
        path: '/users/{userId}',
        method: 'get',
        summary: 'Get user',
        description: 'Get user by ID',
        pathParameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        queryParameters: [],
        headerParameters: [],
        tags: [],
        deprecated: false,
      };

      const code = generateParameterMapping(operation);

      expect(code).toContain('await client.get<unknown>(url, { params, headers })');
      expect(code).not.toContain(', data,');
    });

    it('should generate correct client call for POST request with body', () => {
      const operation: OperationMetadata = {
        operationId: 'createUser',
        path: '/users',
        method: 'post',
        summary: 'Create user',
        description: 'Create user',
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        requestBody: {
          required: true,
          description: 'User data',
          mediaType: 'application/json',
        },
        tags: [],
        deprecated: false,
      };

      const code = generateParameterMapping(operation);

      expect(code).toContain('await client.post<unknown>(url, data, { params, headers })');
    });

    it('should generate correct client call for PUT request with body', () => {
      const operation: OperationMetadata = {
        operationId: 'updateUser',
        path: '/users/{userId}',
        method: 'put',
        summary: 'Update user',
        description: 'Update user',
        pathParameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        queryParameters: [],
        headerParameters: [],
        requestBody: {
          required: true,
          description: 'User data',
          mediaType: 'application/json',
        },
        tags: [],
        deprecated: false,
      };

      const code = generateParameterMapping(operation);

      expect(code).toContain('await client.put<unknown>(url, data, { params, headers })');
    });

    it('should generate correct client call for DELETE request', () => {
      const operation: OperationMetadata = {
        operationId: 'deleteUser',
        path: '/users/{userId}',
        method: 'delete',
        summary: 'Delete user',
        description: 'Delete user',
        pathParameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        queryParameters: [],
        headerParameters: [],
        tags: [],
        deprecated: false,
      };

      const code = generateParameterMapping(operation);

      expect(code).toContain('await client.delete<unknown>(url, { params, headers })');
    });
  });

  describe('Type Coercion', () => {
    it('should generate type coercion for number types', () => {
      const operation: OperationMetadata = {
        operationId: 'getItem',
        path: '/items',
        method: 'get',
        summary: 'Get items',
        description: 'Get items',
        pathParameters: [],
        queryParameters: [
          {
            name: 'count',
            in: 'query',
            required: false,
            schema: { type: 'number' },
          },
        ],
        headerParameters: [],
        tags: [],
        deprecated: false,
      };

      const code = generateParameterMapping(operation);

      expect(code).toContain('typeof args.count === \'string\' ? Number(args.count) : args.count');
    });

    it('should generate type coercion for boolean types', () => {
      const operation: OperationMetadata = {
        operationId: 'getItems',
        path: '/items',
        method: 'get',
        summary: 'Get items',
        description: 'Get items',
        pathParameters: [],
        queryParameters: [
          {
            name: 'active',
            in: 'query',
            required: false,
            schema: { type: 'boolean' },
          },
        ],
        headerParameters: [],
        tags: [],
        deprecated: false,
      };

      const code = generateParameterMapping(operation);

      expect(code).toContain('typeof args.active === \'string\' ? args.active === \'true\' : args.active');
    });
  });

  describe('Complex Integration', () => {
    it('should handle operation with all parameter types', () => {
      const operation: OperationMetadata = {
        operationId: 'complexOperation',
        path: '/users/{userId}/posts/{postId}',
        method: 'patch',
        summary: 'Complex operation',
        description: 'Complex operation with all parameter types',
        pathParameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'postId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        queryParameters: [
          {
            name: 'expand',
            in: 'query',
            required: false,
            schema: { type: 'string' },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 10 },
          },
        ],
        headerParameters: [
          {
            name: 'X-Request-ID',
            in: 'header',
            required: false,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          description: 'Post data',
        },
        tags: [],
        deprecated: false,
      };

      const code = generateParameterMapping(operation);

      // Validate all sections are present
      expect(code).toContain('let url = \'/users/{userId}/posts/{postId}\'');
      expect(code).toContain('const params: Record<string, unknown> = {}');
      expect(code).toContain('const headers: Record<string, string> = {}');
      expect(code).toContain('const data = args.body');
      expect(code).toContain('await client.patch<unknown>(url, data, { params, headers })');

      // Validate path params
      expect(code).toContain('url = url.replace(\'{userId}\'');
      expect(code).toContain('url = url.replace(\'{postId}\'');

      // Validate query params
      expect(code).toContain('params[\'expand\']');
      expect(code).toContain('params[\'limit\']');

      // Validate headers
      expect(code).toContain('headers[\'X-Request-ID\']');

      // Validate validations
      expect(code).toContain('Missing required path parameter: userId');
      expect(code).toContain('Missing required path parameter: postId');
      expect(code).toContain('Missing required request body');
    });
  });

  describe('Array Parameter Serialization (AC11)', () => {
    it('should serialize array with form style and explode=true (default)', () => {
      const operation: OperationMetadata = createMockOperation({
        queryParameters: [
          {
            name: 'tags',
            in: 'query',
            required: false,
            schema: { type: 'array', items: { type: 'string' } },
            style: 'form',
            explode: true,
          },
        ],
      });

      const code = generateParameterMapping(operation);

      // Exploded form style: axios handles natively as array
      expect(code).toContain('params[\'tags\'] = args.tags');
      expect(code).not.toContain('.join');
    });

    it('should serialize array with form style and explode=false', () => {
      const operation: OperationMetadata = createMockOperation({
        queryParameters: [
          {
            name: 'tags',
            in: 'query',
            required: false,
            schema: { type: 'array', items: { type: 'string' } },
            style: 'form',
            explode: false,
          },
        ],
      });

      const code = generateParameterMapping(operation);

      // Non-exploded form style: comma-separated
      expect(code).toContain('(Array.isArray(args.tags) ? args.tags.join(\',\') : args.tags)');
    });

    it('should serialize array with spaceDelimited style', () => {
      const operation: OperationMetadata = createMockOperation({
        queryParameters: [
          {
            name: 'tags',
            in: 'query',
            required: false,
            schema: { type: 'array', items: { type: 'string' } },
            style: 'spaceDelimited',
          },
        ],
      });

      const code = generateParameterMapping(operation);

      // Space delimited: join with space
      expect(code).toContain('(Array.isArray(args.tags) ? args.tags.join(\' \') : args.tags)');
    });

    it('should serialize array with pipeDelimited style', () => {
      const operation: OperationMetadata = createMockOperation({
        queryParameters: [
          {
            name: 'tags',
            in: 'query',
            required: false,
            schema: { type: 'array', items: { type: 'string' } },
            style: 'pipeDelimited',
          },
        ],
      });

      const code = generateParameterMapping(operation);

      // Pipe delimited: join with pipe
      expect(code).toContain('(Array.isArray(args.tags) ? args.tags.join(\'|\') : args.tags)');
    });

    it('should default to form style with explode when style not specified', () => {
      const operation: OperationMetadata = createMockOperation({
        queryParameters: [
          {
            name: 'tags',
            in: 'query',
            required: false,
            schema: { type: 'array', items: { type: 'string' } },
            // No style specified - should default to form with explode=true
          },
        ],
      });

      const code = generateParameterMapping(operation);

      // Default: form style with explode (array passed as-is for axios)
      expect(code).toContain('params[\'tags\'] = args.tags');
      expect(code).not.toContain('.join');
    });

    it('should handle array parameters in headers with comma separation', () => {
      const operation: OperationMetadata = createMockOperation({
        headerParameters: [
          {
            name: 'X-Custom-Tags',
            in: 'header',
            required: false,
            schema: { type: 'array', items: { type: 'string' } },
          },
        ],
      });

      const code = generateParameterMapping(operation);

      // Custom headers are included and arrays are comma-separated
      expect(code).toContain('headers[\'X-Custom-Tags\']');
      // Array serialization converts to string via String() which for arrays joins with comma
      expect(code).toContain('String(');
    });
  });

  describe('Performance Benchmarks (AC18)', () => {
    it('should generate parameter mapping code in < 10ms per operation', () => {
      const operation: OperationMetadata = createMockOperation({
        pathParameters: [
          { name: 'userId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        queryParameters: [
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer' } },
          { name: 'offset', in: 'query', required: false, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
      });

      const iterations = 100;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        generateParameterMapping(operation);
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;

      expect(avgTime).toBeLessThan(10); // Must be < 10ms per operation
    });

    it('should handle complex operations efficiently', () => {
      const operation: OperationMetadata = createMockOperation({
        pathParameters: [
          { name: 'userId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'postId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        queryParameters: [
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer' } },
          { name: 'offset', in: 'query', required: false, schema: { type: 'integer' } },
          { name: 'tags', in: 'query', required: false, schema: { type: 'array' }, style: 'form' },
          { name: 'expand', in: 'query', required: false, schema: { type: 'string' } },
        ],
        headerParameters: [
          { name: 'X-Request-ID', in: 'header', required: false, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
      });

      const iterations = 100;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        generateParameterMapping(operation);
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;

      expect(avgTime).toBeLessThan(10); // Must be < 10ms even for complex operations
    });
  });
});
