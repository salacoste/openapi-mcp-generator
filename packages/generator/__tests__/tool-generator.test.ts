/**
 * Tests for MCP Tool Definition Generator
 */

import { describe, it, expect } from 'vitest';
import { generateToolDefinitions } from '../src/tool-generator.js';
import type { OperationMetadata, SchemaMap } from '@openapi-to-mcp/parser';

// Helper to create empty schema map for tests
const emptySchemas: SchemaMap = new Map();

describe('Tool Generator', () => {
  describe('generateToolDefinitions', () => {
    it('should generate empty result for empty operations', () => {
      const result = generateToolDefinitions([], emptySchemas);

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

      const result = generateToolDefinitions([operation], emptySchemas);

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

      const result = generateToolDefinitions([operation], emptySchemas);

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

      const result = generateToolDefinitions(operations, emptySchemas);

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

      const result = generateToolDefinitions([operation], emptySchemas);

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

      const result = generateToolDefinitions([operation], emptySchemas);

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

      const result = generateToolDefinitions([operation], emptySchemas);

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

      const result = generateToolDefinitions([operation], emptySchemas);

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

      const result = generateToolDefinitions([operation], emptySchemas);

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

      const result = generateToolDefinitions([operation], emptySchemas);
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

      const result = generateToolDefinitions([operation], emptySchemas);
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

      const result = generateToolDefinitions([operation], emptySchemas);
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

      const result = generateToolDefinitions([operation], emptySchemas);
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

      const result = generateToolDefinitions([operation], emptySchemas);
      const schema = result.tools[0]?.inputSchema;

      expect(schema?.properties.param?.type).toBe('string');
    });

    it('should preserve integer type and map number type', () => {
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
            schema: { type: 'integer', format: 'int64' },
          },
          {
            name: 'price',
            in: 'query',
            required: false,
            schema: { type: 'number', format: 'float' },
          },
        ],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation], emptySchemas);
      const schema = result.tools[0]?.inputSchema;

      // Integer type should be preserved as 'integer' (Story 9.4)
      expect(schema?.properties.count?.type).toBe('integer');
      expect(schema?.properties.count?.format).toBe('int64');

      // Number type should remain as 'number'
      expect(schema?.properties.price?.type).toBe('number');
      expect(schema?.properties.price?.format).toBe('float');
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

      const result = generateToolDefinitions([operation], emptySchemas);
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

      const result = generateToolDefinitions([operation], emptySchemas);
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

      const result = generateToolDefinitions([operation], emptySchemas);
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

      const result = generateToolDefinitions([operation], emptySchemas, { includeTags: true });

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

      const result = generateToolDefinitions([operation], emptySchemas, { includeTags: false });

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

      (operation as any).pathParameters = undefined;

      const result = generateToolDefinitions([operation], emptySchemas);

      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Request Body Schema Expansion (Story 9.1)', () => {
    describe('expandRequestBodySchema', () => {
      it('should return generic object when no schema name', () => {
        const operation: OperationMetadata = {
          operationId: 'test',
          method: 'post',
          path: '/test',
          summary: 'Test',
          tags: [],
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          requestBody: {
            required: true,
            description: 'Test body',
            mediaType: 'application/json',
          },
          responses: [],
          deprecated: false,
        };

        const result = generateToolDefinitions([operation], emptySchemas);
        const schema = result.tools[0]?.inputSchema;

        expect(schema?.properties.body).toBeDefined();
        expect(schema?.properties.body?.type).toBe('object');
        expect(schema?.properties.body?.description).toBe('Test body');
        expect(schema?.required).toContain('body');
      });

      it('should expand simple inline schema with properties', () => {
        const schemas: SchemaMap = new Map([
          [
            'CreateUserRequest',
            {
              name: 'CreateUserRequest',
              type: 'object',
              properties: {
                username: {
                  type: 'string',
                  description: 'Username',
                  required: true,
                },
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'Email address',
                  required: true,
                },
              },
              required: ['username', 'email'],
              description: 'Create user request',
            },
          ],
        ]);

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
            schemaName: 'CreateUserRequest',
          },
          responses: [],
          deprecated: false,
        };

        const result = generateToolDefinitions([operation], schemas);
        const bodySchema = result.tools[0]?.inputSchema.properties.body;

        expect(bodySchema).toBeDefined();
        expect(bodySchema?.type).toBe('object');
        expect(bodySchema?.properties?.username).toBeDefined();
        expect(bodySchema?.properties?.username?.type).toBe('string');
        expect(bodySchema?.properties?.username?.description).toBe('Username');
        expect(bodySchema?.properties?.email).toBeDefined();
        expect(bodySchema?.properties?.email?.format).toBe('email');
        expect(bodySchema?.required).toEqual(['username', 'email']);
      });

      it('should handle missing schema with fallback to generic object', () => {
        const operation: OperationMetadata = {
          operationId: 'test',
          method: 'post',
          path: '/test',
          summary: 'Test',
          tags: [],
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          requestBody: {
            required: true,
            description: 'Missing schema body',
            mediaType: 'application/json',
            schemaName: 'NonExistentSchema',
          },
          responses: [],
          deprecated: false,
        };

        const result = generateToolDefinitions([operation], emptySchemas);
        const bodySchema = result.tools[0]?.inputSchema.properties.body;

        expect(bodySchema).toBeDefined();
        expect(bodySchema?.type).toBe('object');
        expect(bodySchema?.description).toBe('Missing schema body');
      });

      it('should preserve enum constraints', () => {
        const schemas: SchemaMap = new Map([
          [
            'CampaignRequest',
            {
              name: 'CampaignRequest',
              type: 'object',
              properties: {
                placement: {
                  type: 'string',
                  enum: ['PLACEMENT_PDP', 'PLACEMENT_SEARCH', 'PLACEMENT_EXTERNAL'],
                  description: 'Ad placement',
                  required: true,
                },
              },
              required: ['placement'],
            },
          ],
        ]);

        const operation: OperationMetadata = {
          operationId: 'createCampaign',
          method: 'post',
          path: '/campaigns',
          summary: 'Create campaign',
          tags: [],
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          requestBody: {
            required: true,
            mediaType: 'application/json',
            schemaName: 'CampaignRequest',
          },
          responses: [],
          deprecated: false,
        };

        const result = generateToolDefinitions([operation], schemas);
        const bodySchema = result.tools[0]?.inputSchema.properties.body;

        expect(bodySchema?.properties?.placement?.enum).toEqual([
          'PLACEMENT_PDP',
          'PLACEMENT_SEARCH',
          'PLACEMENT_EXTERNAL',
        ]);
      });

      it('should preserve format constraints', () => {
        const schemas: SchemaMap = new Map([
          [
            'OrderRequest',
            {
              name: 'OrderRequest',
              type: 'object',
              properties: {
                dailyBudget: {
                  type: 'string',
                  format: 'uint64',
                  description: 'Daily budget',
                  required: false,
                },
                fromDate: {
                  type: 'string',
                  format: 'date',
                  description: 'Start date',
                  required: false,
                },
                count: {
                  type: 'integer',
                  format: 'int32',
                  description: 'Item count',
                  required: false,
                },
              },
            },
          ],
        ]);

        const operation: OperationMetadata = {
          operationId: 'createOrder',
          method: 'post',
          path: '/orders',
          summary: 'Create order',
          tags: [],
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          requestBody: {
            required: true,
            mediaType: 'application/json',
            schemaName: 'OrderRequest',
          },
          responses: [],
          deprecated: false,
        };

        const result = generateToolDefinitions([operation], schemas);
        const bodySchema = result.tools[0]?.inputSchema.properties.body;

        expect(bodySchema?.properties?.dailyBudget?.format).toBe('uint64');
        expect(bodySchema?.properties?.fromDate?.format).toBe('date');
        expect(bodySchema?.properties?.count?.format).toBe('int32');
      });

      it('should handle nested arrays with items', () => {
        const schemas: SchemaMap = new Map([
          [
            'ListRequest',
            {
              name: 'ListRequest',
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  description: 'List of items',
                  items: {
                    type: 'string',
                    description: 'Item ID',
                  },
                  required: true,
                },
              },
              required: ['items'],
            },
          ],
        ]);

        const operation: OperationMetadata = {
          operationId: 'createList',
          method: 'post',
          path: '/lists',
          summary: 'Create list',
          tags: [],
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          requestBody: {
            required: true,
            mediaType: 'application/json',
            schemaName: 'ListRequest',
          },
          responses: [],
          deprecated: false,
        };

        const result = generateToolDefinitions([operation], schemas);
        const bodySchema = result.tools[0]?.inputSchema.properties.body;

        expect(bodySchema?.properties?.items?.type).toBe('array');
        expect(bodySchema?.properties?.items?.items?.type).toBe('string');
      });

      it('should detect circular references', () => {
        const schemas: SchemaMap = new Map([
          [
            'CircularSchema',
            {
              name: 'CircularSchema',
              type: 'object',
              properties: {
                data: {
                  type: 'string',
                  description: 'Data',
                  required: false,
                },
              },
            },
          ],
        ]);

        // Create circular reference by modifying the schema after creation
        const circularSchema = schemas.get('CircularSchema');
        if (circularSchema && circularSchema.properties) {
          // Create self-referencing items schema
          circularSchema.items = circularSchema;
          circularSchema.type = 'array';
        }

        const operation: OperationMetadata = {
          operationId: 'testCircular',
          method: 'post',
          path: '/test',
          summary: 'Test circular',
          tags: [],
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          requestBody: {
            required: true,
            mediaType: 'application/json',
            schemaName: 'CircularSchema',
          },
          responses: [],
          deprecated: false,
        };

        const result = generateToolDefinitions([operation], schemas);
        const bodySchema = result.tools[0]?.inputSchema.properties.body;

        // Should handle circular reference gracefully
        expect(bodySchema).toBeDefined();
        expect(bodySchema?.type).toBe('array');
        expect(bodySchema?.items?.description).toContain('Circular reference');
      });

      it('should handle allOf composition', () => {
        const schemas: SchemaMap = new Map([
          [
            'BaseUser',
            {
              name: 'BaseUser',
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'User ID',
                  required: true,
                },
                name: {
                  type: 'string',
                  description: 'User name',
                  required: true,
                },
              },
              required: ['id', 'name'],
            },
          ],
          [
            'ExtendedUser',
            {
              name: 'ExtendedUser',
              type: 'object',
              composition: {
                type: 'allOf',
                schemas: ['BaseUser'],
                merged: false,
              },
              properties: {
                role: {
                  type: 'string',
                  enum: ['admin', 'user'],
                  description: 'User role',
                  required: true,
                },
              },
              required: ['role'],
            },
          ],
        ]);

        const operation: OperationMetadata = {
          operationId: 'createExtendedUser',
          method: 'post',
          path: '/users/extended',
          summary: 'Create extended user',
          tags: [],
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          requestBody: {
            required: true,
            mediaType: 'application/json',
            schemaName: 'ExtendedUser',
          },
          responses: [],
          deprecated: false,
        };

        const result = generateToolDefinitions([operation], schemas);
        const bodySchema = result.tools[0]?.inputSchema.properties.body;

        expect(bodySchema).toBeDefined();
        expect(bodySchema?.type).toBe('object');
        // Composition merges schemas - should have properties from BaseUser
        expect(bodySchema?.properties?.id).toBeDefined();
        expect(bodySchema?.properties?.name).toBeDefined();
        // Required fields should include both schemas' required fields
        expect(bodySchema?.required).toContain('id');
        expect(bodySchema?.required).toContain('name');
      });

      it('should handle deeply nested schemas gracefully', () => {
        // Create deeply nested schema chain (12 levels deep - exceeds limit of 10)
        const schemas: SchemaMap = new Map();

        // Build chain from bottom up
        for (let i = 11; i >= 0; i--) {
          const schema: any = {
            name: `Level${i}`,
            type: 'array',
            description: `Level ${i} schema`,
          };

          if (i < 11) {
            // Reference next level as items
            schema.items = {
              name: `Level${i + 1}`,
              type: 'array',
              description: `Level ${i + 1} schema`,
            };

            // Create the next level schema and add to map
            const nextLevel = schemas.get(`Level${i + 1}`) || {
              name: `Level${i + 1}`,
              type: 'array',
              description: `Level ${i + 1} schema`,
            };

            if (!schemas.has(`Level${i + 1}`)) {
              schemas.set(`Level${i + 1}`, nextLevel as any);
            }
          } else {
            // Deepest level is just an array of strings
            schema.items = {
              name: 'String',
              type: 'string',
              description: 'String value',
            };
          }

          schemas.set(`Level${i}`, schema);
        }

        const operation: OperationMetadata = {
          operationId: 'testDeep',
          method: 'post',
          path: '/test',
          summary: 'Test deep nesting',
          tags: [],
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          requestBody: {
            required: true,
            mediaType: 'application/json',
            schemaName: 'Level0',
          },
          responses: [],
          deprecated: false,
        };

        // Should handle deep nesting gracefully (may throw error and fallback to generic object)
        const result = generateToolDefinitions([operation], schemas);
        const bodySchema = result.tools[0]?.inputSchema.properties.body;

        // Should be defined with fallback behavior
        expect(bodySchema).toBeDefined();
        // Type should be either 'array' (if depth limit not hit) or 'object' (if fallback triggered)
        expect(['array', 'object']).toContain(bodySchema?.type);
      });
    });
  });

  describe('Integer Type Preservation (Story 9.4)', () => {
    it('should preserve integer type in JSON Schema', () => {
      const operation: OperationMetadata = {
        operationId: 'getCampaign',
        method: 'get',
        path: '/campaigns/{campaignId}',
        summary: 'Get campaign',
        tags: [],
        pathParameters: [
          {
            name: 'campaignId',
            in: 'path',
            required: true,
            description: 'Campaign ID',
            schema: { type: 'integer', format: 'int64' },
          },
        ],
        queryParameters: [],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation], emptySchemas);
      const schema = result.tools[0]?.inputSchema;

      expect(schema?.properties.campaignId?.type).toBe('integer');
      expect(schema?.properties.campaignId?.format).toBe('int64');
      expect(schema?.properties.campaignId?.description).toBe('Campaign ID');
    });

    it('should preserve integer type in query parameters', () => {
      const operation: OperationMetadata = {
        operationId: 'listCampaigns',
        method: 'get',
        path: '/campaigns',
        summary: 'List campaigns',
        tags: [],
        pathParameters: [],
        queryParameters: [
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Max results',
            schema: { type: 'integer', format: 'int32' },
          },
          {
            name: 'offset',
            in: 'query',
            required: false,
            description: 'Skip results',
            schema: { type: 'integer' },
          },
        ],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation], emptySchemas);
      const schema = result.tools[0]?.inputSchema;

      expect(schema?.properties.limit?.type).toBe('integer');
      expect(schema?.properties.limit?.format).toBe('int32');
      expect(schema?.properties.offset?.type).toBe('integer');
    });

    it('should not confuse integer with number type', () => {
      const operation: OperationMetadata = {
        operationId: 'updateMetrics',
        method: 'post',
        path: '/metrics',
        summary: 'Update metrics',
        tags: [],
        pathParameters: [],
        queryParameters: [
          {
            name: 'clicks',
            in: 'query',
            required: false,
            description: 'Click count',
            schema: { type: 'integer' },
          },
          {
            name: 'ctr',
            in: 'query',
            required: false,
            description: 'Click-through rate',
            schema: { type: 'number' },
          },
        ],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation], emptySchemas);
      const schema = result.tools[0]?.inputSchema;

      // Integer should map to 'integer'
      expect(schema?.properties.clicks?.type).toBe('integer');

      // Number should still map to 'number'
      expect(schema?.properties.ctr?.type).toBe('number');
    });
  });

  describe('Array Items Type Specification (Story 9.2)', () => {
    it('should include items for simple array parameters', () => {
      const operation: OperationMetadata = {
        operationId: 'filterCampaigns',
        method: 'get',
        path: '/campaigns',
        summary: 'Filter campaigns',
        tags: [],
        pathParameters: [],
        queryParameters: [
          {
            name: 'campaignIds',
            in: 'query',
            required: false,
            description: 'Campaign IDs to filter',
            schema: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uint64',
              },
            },
          },
        ],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation], emptySchemas);
      const schema = result.tools[0]?.inputSchema;

      expect(schema?.properties.campaignIds).toBeDefined();
      expect(schema?.properties.campaignIds?.type).toBe('array');
      expect(schema?.properties.campaignIds?.items).toBeDefined();
      expect(schema?.properties.campaignIds?.items?.type).toBe('string');
      expect(schema?.properties.campaignIds?.items?.format).toBe('uint64');
    });

    it('should handle nested arrays (array of arrays)', () => {
      const operation: OperationMetadata = {
        operationId: 'processMatrix',
        method: 'post',
        path: '/matrix',
        summary: 'Process matrix',
        tags: [],
        pathParameters: [],
        queryParameters: [
          {
            name: 'matrix',
            in: 'query',
            required: true,
            description: 'Data matrix',
            schema: {
              type: 'array',
              items: {
                type: 'array',
                items: {
                  type: 'number',
                },
              },
            },
          },
        ],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation], emptySchemas);
      const schema = result.tools[0]?.inputSchema;

      expect(schema?.properties.matrix).toBeDefined();
      expect(schema?.properties.matrix?.type).toBe('array');
      expect(schema?.properties.matrix?.items?.type).toBe('array');
      expect(schema?.properties.matrix?.items?.items?.type).toBe('number');
    });

    it('should handle array with enum items', () => {
      const operation: OperationMetadata = {
        operationId: 'filterByStatus',
        method: 'get',
        path: '/campaigns',
        summary: 'Filter by status',
        tags: [],
        pathParameters: [],
        queryParameters: [
          {
            name: 'statuses',
            in: 'query',
            required: false,
            description: 'Status filters',
            schema: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['ACTIVE', 'PAUSED', 'ARCHIVED'],
              },
            },
          },
        ],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation], emptySchemas);
      const schema = result.tools[0]?.inputSchema;

      expect(schema?.properties.statuses).toBeDefined();
      expect(schema?.properties.statuses?.type).toBe('array');
      expect(schema?.properties.statuses?.items?.enum).toEqual(['ACTIVE', 'PAUSED', 'ARCHIVED']);
    });

    it('should handle array without items gracefully', () => {
      const operation: OperationMetadata = {
        operationId: 'getItems',
        method: 'get',
        path: '/items',
        summary: 'Get items',
        tags: [],
        pathParameters: [],
        queryParameters: [
          {
            name: 'tags',
            in: 'query',
            required: false,
            description: 'Tags filter',
            schema: {
              type: 'array',
              // No items specified
            },
          },
        ],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation], emptySchemas);
      const schema = result.tools[0]?.inputSchema;

      expect(schema?.properties.tags).toBeDefined();
      expect(schema?.properties.tags?.type).toBe('array');
      // items should be undefined when not specified in source schema
      expect(schema?.properties.tags?.items).toBeUndefined();
    });

    it('should handle array with object items', () => {
      const operation: OperationMetadata = {
        operationId: 'createBatch',
        method: 'post',
        path: '/batch',
        summary: 'Create batch',
        tags: [],
        pathParameters: [],
        queryParameters: [
          {
            name: 'items',
            in: 'query',
            required: true,
            description: 'Batch items',
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  quantity: { type: 'number' },
                },
                required: ['id'],
              },
            },
          },
        ],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation], emptySchemas);
      const schema = result.tools[0]?.inputSchema;

      expect(schema?.properties.items).toBeDefined();
      expect(schema?.properties.items?.type).toBe('array');
      expect(schema?.properties.items?.items?.type).toBe('object');
      expect(schema?.properties.items?.items?.properties?.id?.type).toBe('string');
      expect(schema?.properties.items?.items?.properties?.quantity?.type).toBe('number');
      expect(schema?.properties.items?.items?.required).toEqual(['id']);
    });

    it('should handle array items with $ref gracefully', () => {
      const operation: OperationMetadata = {
        operationId: 'getUsersByIds',
        method: 'get',
        path: '/users',
        summary: 'Get users by IDs',
        tags: [],
        pathParameters: [],
        queryParameters: [
          {
            name: 'userIds',
            in: 'query',
            required: false,
            description: 'User IDs',
            schema: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/UserId',
              } as any,
            },
          },
        ],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation], emptySchemas);
      const schema = result.tools[0]?.inputSchema;

      // Should handle $ref gracefully - either resolve it or provide placeholder
      expect(schema?.properties.userIds).toBeDefined();
      expect(schema?.properties.userIds?.type).toBe('array');
      expect(schema?.properties.userIds?.items).toBeDefined();
      // Should have a description indicating it's a reference
      expect(schema?.properties.userIds?.items?.description).toContain('Reference:');
    });

    it('should handle deeply nested arrays within depth limit', () => {
      const operation: OperationMetadata = {
        operationId: 'processNestedData',
        method: 'post',
        path: '/data',
        summary: 'Process nested data',
        tags: [],
        pathParameters: [],
        queryParameters: [
          {
            name: 'deepArray',
            in: 'query',
            required: true,
            description: '5-level nested array',
            schema: {
              type: 'array',
              items: {
                type: 'array',
                items: {
                  type: 'array',
                  items: {
                    type: 'array',
                    items: {
                      type: 'array',
                      items: {
                        type: 'string',
                        description: 'Leaf value',
                      },
                    },
                  },
                },
              },
            },
          },
        ],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation], emptySchemas);
      const schema = result.tools[0]?.inputSchema;

      // Should successfully handle 5 levels of nesting (within limit of 10)
      expect(schema?.properties.deepArray).toBeDefined();
      expect(schema?.properties.deepArray?.type).toBe('array');

      // Verify nested structure
      let current = schema?.properties.deepArray;
      for (let i = 0; i < 5; i++) {
        expect(current?.type).toBe('array');
        expect(current?.items).toBeDefined();
        current = current?.items;
      }

      // Final level should be string
      expect(current?.type).toBe('string');
      expect(current?.description).toBe('Leaf value');
    });

    it('should preserve format constraints in deeply nested array items', () => {
      const operation: OperationMetadata = {
        operationId: 'processTimestamps',
        method: 'post',
        path: '/timestamps',
        summary: 'Process timestamps',
        tags: [],
        pathParameters: [],
        queryParameters: [
          {
            name: 'nestedTimestamps',
            in: 'query',
            required: true,
            description: 'Nested timestamp data',
            schema: {
              type: 'array',
              items: {
                type: 'array',
                items: {
                  type: 'array',
                  items: {
                    type: 'string',
                    format: 'date-time',
                    description: 'ISO 8601 timestamp',
                  },
                },
              },
            },
          },
        ],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation], emptySchemas);
      const schema = result.tools[0]?.inputSchema;

      // Navigate through 3 levels of nesting
      expect(schema?.properties.nestedTimestamps?.type).toBe('array');
      expect(schema?.properties.nestedTimestamps?.items?.type).toBe('array');
      expect(schema?.properties.nestedTimestamps?.items?.items?.type).toBe('array');

      // Verify format is preserved at the deepest level
      const deepestItems = schema?.properties.nestedTimestamps?.items?.items?.items;
      expect(deepestItems?.type).toBe('string');
      expect(deepestItems?.format).toBe('date-time');
      expect(deepestItems?.description).toBe('ISO 8601 timestamp');
    });
  });

  describe('Parameter Description Propagation (Story 9.5)', () => {
    it('should use param.description if present', () => {
      const operation: OperationMetadata = {
        operationId: 'getCampaign',
        method: 'get',
        path: '/campaigns/{campaignId}',
        summary: 'Get campaign',
        tags: [],
        pathParameters: [
          {
            name: 'campaignId',
            in: 'path',
            required: true,
            description: 'Campaign identifier',
            schema: {
              type: 'integer',
              description: 'Should not be used',
            },
          },
        ],
        queryParameters: [],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation], emptySchemas);
      const schema = result.tools[0]?.inputSchema;

      expect(schema?.properties.campaignId?.description).toBe('Campaign identifier');
    });

    it('should fallback to schema.description', () => {
      const operation: OperationMetadata = {
        operationId: 'getCampaign',
        method: 'get',
        path: '/campaigns/{campaignId}',
        summary: 'Get campaign',
        tags: [],
        pathParameters: [
          {
            name: 'campaignId',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
              description: 'Идентификатор кампании',
            },
          },
        ],
        queryParameters: [],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation], emptySchemas);
      const schema = result.tools[0]?.inputSchema;

      expect(schema?.properties.campaignId?.description).toBe('Идентификатор кампании');
    });

    it('should handle missing descriptions', () => {
      const operation: OperationMetadata = {
        operationId: 'getCampaign',
        method: 'get',
        path: '/campaigns/{campaignId}',
        summary: 'Get campaign',
        tags: [],
        pathParameters: [
          {
            name: 'campaignId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        queryParameters: [],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation], emptySchemas);
      const schema = result.tools[0]?.inputSchema;

      expect(schema?.properties.campaignId?.description).toBeUndefined();
    });

    it('should ignore empty string descriptions', () => {
      const operation: OperationMetadata = {
        operationId: 'getCampaign',
        method: 'get',
        path: '/campaigns/{campaignId}',
        summary: 'Get campaign',
        tags: [],
        pathParameters: [
          {
            name: 'campaignId',
            in: 'path',
            required: true,
            description: '',
            schema: {
              type: 'integer',
              description: 'Valid description',
            },
          },
        ],
        queryParameters: [],
        headerParameters: [],
        responses: [],
        deprecated: false,
      };

      const result = generateToolDefinitions([operation], emptySchemas);
      const schema = result.tools[0]?.inputSchema;

      // Empty string should be ignored, fallback to schema
      expect(schema?.properties.campaignId?.description).toBe('Valid description');
    });
  });
});
