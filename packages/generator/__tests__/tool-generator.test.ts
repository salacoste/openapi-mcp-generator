/**
 * Tests for MCP Tool Definition Generator
 */

import { describe, it, expect } from 'vitest';
import { generateToolDefinitions } from '../src/tool-generator.js';
import type { OperationMetadata } from '@openapi-to-mcp/parser';

describe('Tool Generator', () => {
  describe('generateToolDefinitions', () => {
    it('should generate empty result for empty operations', () => {
      const result = generateToolDefinitions([]);

      expect(result.tools).toHaveLength(0);
      expect(result.nameCollisions).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should generate tool definition from operation', () => {
      const operation: OperationMetadata = {
        operationId: 'getUserById',
        method: 'get',
        path: '/users/{userId}',
        summary: 'Get user by ID',
        description: 'Retrieve a user by their unique identifier',
        tags: ['users'],
        pathParameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            description: 'User ID',
            schema: { type: 'string' },
          },
        ],
        queryParameters: [],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation]);

      expect(result.tools).toHaveLength(1);
      expect(result.tools[0]?.name).toBe('getUserById');
      expect(result.tools[0]?.description).toContain('Get user by ID');
      expect(result.tools[0]?.inputSchema.properties).toHaveProperty('userId');
      expect(result.tools[0]?.inputSchema.required).toContain('userId');
    });
  });

  describe('Tool Naming', () => {
    it('should use operationId as tool name', () => {
      const operation: OperationMetadata = {
        operationId: 'createProduct',
        method: 'post',
        path: '/products',
        summary: 'Create product',
        tags: [],
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation]);

      expect(result.tools[0]?.name).toBe('createProduct');
    });

    it('should handle name collisions with suffix numbering', () => {
      const operations: OperationMetadata[] = [
        {
          operationId: 'getUser',
          method: 'get',
          path: '/users/{id}',
          summary: 'Get user',
          tags: [],
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          responses: [],
          deprecated: false,
        },
        {
          operationId: 'getUser',
          method: 'get',
          path: '/admin/users/{id}',
          summary: 'Get user (admin)',
          tags: [],
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          responses: [],
          deprecated: false,
        },
      ];

      const result = generateToolDefinitions(operations);

      expect(result.tools).toHaveLength(2);
      expect(result.tools[0]?.name).toBe('getUser');
      expect(result.tools[1]?.name).toBe('getUser1');
      expect(result.nameCollisions).toContain('getUser');
    });
  });

  describe('Tool Descriptions', () => {
    it('should generate description from summary', () => {
      const operation: OperationMetadata = {
        operationId: 'listProducts',
        method: 'get',
        path: '/products',
        summary: 'List all products',
        tags: [],
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation]);

      expect(result.tools[0]?.description).toBe('List all products');
    });

    it('should combine summary and description', () => {
      const operation: OperationMetadata = {
        operationId: 'updateProduct',
        method: 'put',
        path: '/products/{id}',
        summary: 'Update product',
        description: 'Update product details including name, price, and inventory',
        tags: [],
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation]);

      expect(result.tools[0]?.description).toContain('Update product');
      expect(result.tools[0]?.description).toContain('Update product details');
    });

    it('should truncate long descriptions', () => {
      const longDescription = 'A'.repeat(400);
      const operation: OperationMetadata = {
        operationId: 'test',
        method: 'get',
        path: '/test',
        summary: 'Test',
        description: longDescription,
        tags: [],
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation]);

      expect(result.tools[0]?.description).toHaveLength(300);
      expect(result.tools[0]?.description).toMatch(/\.\.\.$/);
    });

    it('should add deprecation notice', () => {
      const operation: OperationMetadata = {
        operationId: 'oldMethod',
        method: 'get',
        path: '/old',
        summary: 'Old method',
        tags: [],
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        responses: [],
        deprecated: true,
      };

      const result = generateToolDefinitions([operation]);

      expect(result.tools[0]?.description).toContain('[DEPRECATED]');
    });

    it('should add authentication notice', () => {
      const operation: OperationMetadata = {
        operationId: 'secureMethod',
        method: 'get',
        path: '/secure',
        summary: 'Secure method',
        tags: [],
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        responses: [],
        deprecated: false,
        security: [{ apiKey: [] }],
      };

      const result = generateToolDefinitions([operation]);

      expect(result.tools[0]?.description).toContain('Requires authentication');
    });
  });

  describe('Input Schema Generation', () => {
    it('should generate schema for path parameters', () => {
      const operation: OperationMetadata = {
        operationId: 'getItem',
        method: 'get',
        path: '/items/{itemId}',
        summary: 'Get item',
        tags: [],
        pathParameters: [
          {
            name: 'itemId',
            in: 'path',
            required: true,
            description: 'Item identifier',
            schema: { type: 'string' },
          },
        ],
        queryParameters: [],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation]);
      const schema = result.tools[0]?.inputSchema;

      expect(schema?.properties.itemId).toBeDefined();
      expect(schema?.properties.itemId?.type).toBe('string');
      expect(schema?.properties.itemId?.description).toBe('Item identifier');
      expect(schema?.required).toContain('itemId');
    });

    it('should generate schema for query parameters', () => {
      const operation: OperationMetadata = {
        operationId: 'searchProducts',
        method: 'get',
        path: '/products',
        summary: 'Search products',
        tags: [],
        pathParameters: [],
        queryParameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            description: 'Search query',
            schema: { type: 'string' },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Max results',
            schema: { type: 'integer', default: 10 },
          },
        ],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation]);
      const schema = result.tools[0]?.inputSchema;

      expect(schema?.properties.q).toBeDefined();
      expect(schema?.properties.limit).toBeDefined();
      expect(schema?.required).toContain('q');
      expect(schema?.required).not.toContain('limit');
      expect(schema?.properties.limit?.default).toBe(10);
    });

    it('should generate schema for request body', () => {
      const operation: OperationMetadata = {
        operationId: 'createUser',
        method: 'post',
        path: '/users',
        summary: 'Create user',
        tags: [],
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        requestBody: {
          required: true,
          description: 'User data',
          mediaType: 'application/json',
          schemaName: 'UserCreateRequest',
        },
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation]);
      const schema = result.tools[0]?.inputSchema;

      expect(schema?.properties.body).toBeDefined();
      expect(schema?.properties.body?.type).toBe('object');
      expect(schema?.properties.body?.description).toBe('User data');
      expect(schema?.required).toContain('body');
    });

    it('should skip standard headers', () => {
      const operation: OperationMetadata = {
        operationId: 'test',
        method: 'get',
        path: '/test',
        summary: 'Test',
        tags: [],
        pathParameters: [],
        queryParameters: [],
        headerParameters: [
          {
            name: 'Authorization',
            in: 'header',
            required: true,
            description: 'Auth token',
            schema: { type: 'string' },
          },
          {
            name: 'X-Custom-Header',
            in: 'header',
            required: true,
            description: 'Custom header',
            schema: { type: 'string' },
          },
        ],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation]);
      const schema = result.tools[0]?.inputSchema;

      expect(schema?.properties.Authorization).toBeUndefined();
      expect(schema?.properties['X-Custom-Header']).toBeDefined();
    });
  });

  describe('Parameter Type Conversion', () => {
    it('should map string type', () => {
      const operation: OperationMetadata = {
        operationId: 'test',
        method: 'get',
        path: '/test',
        summary: 'Test',
        tags: [],
        pathParameters: [
          {
            name: 'param',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        queryParameters: [],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation]);
      const schema = result.tools[0]?.inputSchema;

      expect(schema?.properties.param?.type).toBe('string');
    });

    it('should map integer and number types to number', () => {
      const operation: OperationMetadata = {
        operationId: 'test',
        method: 'get',
        path: '/test',
        summary: 'Test',
        tags: [],
        pathParameters: [],
        queryParameters: [
          {
            name: 'count',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
          },
          {
            name: 'price',
            in: 'query',
            required: false,
            schema: { type: 'number' },
          },
        ],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation]);
      const schema = result.tools[0]?.inputSchema;

      expect(schema?.properties.count?.type).toBe('number');
      expect(schema?.properties.price?.type).toBe('number');
    });

    it('should map boolean type', () => {
      const operation: OperationMetadata = {
        operationId: 'test',
        method: 'get',
        path: '/test',
        summary: 'Test',
        tags: [],
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
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation]);
      const schema = result.tools[0]?.inputSchema;

      expect(schema?.properties.active?.type).toBe('boolean');
    });

    it('should handle enum values', () => {
      const operation: OperationMetadata = {
        operationId: 'test',
        method: 'get',
        path: '/test',
        summary: 'Test',
        tags: [],
        pathParameters: [],
        queryParameters: [
          {
            name: 'status',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: ['active', 'inactive', 'pending'],
            },
          },
        ],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation]);
      const schema = result.tools[0]?.inputSchema;

      expect(schema?.properties.status?.enum).toEqual(['active', 'inactive', 'pending']);
    });

    it('should handle format hints', () => {
      const operation: OperationMetadata = {
        operationId: 'test',
        method: 'get',
        path: '/test',
        summary: 'Test',
        tags: [],
        pathParameters: [],
        queryParameters: [
          {
            name: 'createdAt',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              format: 'date-time',
            },
          },
        ],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation]);
      const schema = result.tools[0]?.inputSchema;

      expect(schema?.properties.createdAt?.format).toBe('date-time');
    });
  });

  describe('Tag-Based Grouping', () => {
    it('should include tags in tool definition', () => {
      const operation: OperationMetadata = {
        operationId: 'getUser',
        method: 'get',
        path: '/users/{id}',
        summary: 'Get user',
        tags: ['users', 'accounts'],
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation], { includeTags: true });

      expect(result.tools[0]?.tags).toEqual(['users', 'accounts']);
    });

    it('should omit tags when disabled', () => {
      const operation: OperationMetadata = {
        operationId: 'getUser',
        method: 'get',
        path: '/users/{id}',
        summary: 'Get user',
        tags: ['users'],
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation], { includeTags: false });

      expect(result.tools[0]?.tags).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should collect warnings for invalid operations', () => {
      const operation = {
        operationId: 'invalid',
        method: 'get',
        path: '/test',
        summary: 'Test',
        tags: [],
        pathParameters: [],
        queryParameters: [],
        headerParameters: [],
        responses: [],
        deprecated: false,
      } as OperationMetadata;

      // Force an error by making pathParameters undefined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (operation as any).pathParameters = undefined;

      const result = generateToolDefinitions([operation]);

      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
});
