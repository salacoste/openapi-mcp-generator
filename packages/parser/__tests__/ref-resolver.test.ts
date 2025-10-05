/**
 * Tests for reference resolution functionality
 */

import { describe, it, expect } from 'vitest';
import { resolveReferences } from '../src/ref-resolver.js';
import type { ResolutionResult } from '../src/ref-resolver.js';

describe('resolveReferences', () => {
  describe('Internal Reference Resolution', () => {
    it('should resolve simple internal schema references', async () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
              },
            },
          },
        },
      };

      const result: ResolutionResult = await resolveReferences(doc);

      expect(result.errors).toHaveLength(0);
      expect(result.resolved).toBe(1);

      // Verify $ref is replaced with actual schema
      const paths = result.document.paths as Record<
        string,
        {
          get: {
            responses: Record<
              string,
              {
                content: Record<string, { schema: Record<string, unknown> }>;
              }
            >;
          };
        }
      >;
      const responseSchema = paths['/users'].get.responses['200'].content['application/json'].schema;
      expect(responseSchema.$ref).toBeUndefined();
      expect(responseSchema.type).toBe('object');
      expect(responseSchema.properties).toBeDefined();
    });

    it('should resolve references in parameters', async () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              parameters: [{ $ref: '#/components/parameters/PageSize' }],
              responses: {
                '200': { description: 'Success' },
              },
            },
          },
        },
        components: {
          parameters: {
            PageSize: {
              name: 'pageSize',
              in: 'query',
              schema: { type: 'integer', default: 10 },
            },
          },
        },
      };

      const result = await resolveReferences(doc);

      expect(result.errors).toHaveLength(0);
      expect(result.resolved).toBe(1);

      // Verify parameter $ref is resolved
      const paths = result.document.paths as unknown as Record<
        string,
        { get: { parameters: Array<Record<string, unknown>> } }
      >;
      const params = paths['/users'].get.parameters;
      expect(params[0].$ref).toBeUndefined();
      expect(params[0].name).toBe('pageSize');
      expect(params[0].in).toBe('query');
    });

    it('should resolve references in responses', async () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              responses: {
                '404': { $ref: '#/components/responses/NotFound' },
              },
            },
          },
        },
        components: {
          responses: {
            NotFound: {
              description: 'Resource not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = await resolveReferences(doc);

      expect(result.errors).toHaveLength(0);
      expect(result.resolved).toBe(1);

      // Verify response $ref is resolved
      const paths = result.document.paths as unknown as Record<
        string,
        { get: { responses: Record<string, Record<string, unknown>> } }
      >;
      const response = paths['/users'].get.responses['404'];
      expect(response.$ref).toBeUndefined();
      expect(response.description).toBe('Resource not found');
    });

    it('should resolve multiple references to same schema', async () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            post: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/User' },
                  },
                },
              },
              responses: {
                '201': {
                  description: 'Created',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
              },
            },
          },
        },
      };

      const result = await resolveReferences(doc);

      expect(result.errors).toHaveLength(0);
      expect(result.resolved).toBe(3); // Three $ref to same schema

      // Verify all refs are resolved
      const paths = result.document.paths as unknown as Record<
        string,
        {
          get: {
            responses: Record<string, { content: Record<string, { schema: Record<string, unknown> }> }>;
          };
        }
      >;
      const getResponse = paths['/users'].get.responses['200'].content['application/json'].schema;
      expect(getResponse.$ref).toBeUndefined();
      expect(getResponse.type).toBe('object');
    });
  });

  describe('Nested Reference Resolution', () => {
    it('should resolve nested references (ref → ref → ref)', async () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/UserList' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            UserList: {
              type: 'array',
              items: { $ref: '#/components/schemas/User' },
            },
            User: {
              type: 'object',
              properties: {
                address: { $ref: '#/components/schemas/Address' },
              },
            },
            Address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
              },
            },
          },
        },
      };

      const result = await resolveReferences(doc);

      expect(result.errors).toHaveLength(0);
      expect(result.resolved).toBe(3); // UserList → User → Address

      // Verify nested resolution
      const paths = result.document.paths as unknown as Record<
        string,
        {
          get: {
            responses: Record<string, { content: Record<string, { schema: Record<string, unknown> }> }>;
          };
        }
      >;
      const schema = paths['/users'].get.responses['200'].content['application/json'].schema;
      expect(schema.$ref).toBeUndefined();
      expect(schema.type).toBe('array');
    });
  });

  describe('Error Handling', () => {
    it('should detect missing references', async () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/NonExistent' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {},
        },
      };

      const result = await resolveReferences(doc);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].type).toBe('missing');
      expect(result.errors[0].message).toMatch(/not found|NonExistent/i);
    });

    it('should detect circular references', async () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
            Node: {
              type: 'object',
              properties: {
                value: { type: 'string' },
                children: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Node' },
                },
              },
            },
          },
        },
      };

      const result = await resolveReferences(doc);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].type).toBe('circular');
      expect(result.errors[0].message).toMatch(/circular/i);
    });

    it('should handle invalid document structure', async () => {
      const doc = null;

      const result = await resolveReferences(doc);

      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Multiple Reference Types', () => {
    it('should resolve references in request bodies, responses, parameters, and examples', async () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            post: {
              parameters: [{ $ref: '#/components/parameters/ApiKey' }],
              requestBody: { $ref: '#/components/requestBodies/CreateUser' },
              responses: {
                '201': { $ref: '#/components/responses/UserCreated' },
              },
            },
          },
        },
        components: {
          parameters: {
            ApiKey: {
              name: 'X-API-Key',
              in: 'header',
              schema: { type: 'string' },
            },
          },
          requestBodies: {
            CreateUser: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
          responses: {
            UserCreated: {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = await resolveReferences(doc);

      expect(result.errors).toHaveLength(0);
      expect(result.resolved).toBe(3);

      // Verify all different ref types are resolved
      const paths = result.document.paths as unknown as Record<
        string,
        {
          post: {
            parameters: Array<Record<string, unknown>>;
            requestBody: Record<string, unknown>;
            responses: Record<string, Record<string, unknown>>;
          };
        }
      >;
      const operation = paths['/users'].post;
      expect(operation.parameters[0].$ref).toBeUndefined();
      expect(operation.requestBody.$ref).toBeUndefined();
      expect(operation.responses['201'].$ref).toBeUndefined();
    });
  });

  describe('Reference Counting', () => {
    it('should accurately count references before resolution', async () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
                '404': { $ref: '#/components/responses/NotFound' },
              },
            },
          },
        },
        components: {
          schemas: {
            User: { type: 'object' },
          },
          responses: {
            NotFound: { description: 'Not found' },
          },
        },
      };

      const result = await resolveReferences(doc);

      expect(result.resolved).toBe(2); // User schema + NotFound response
    });

    it('should return 0 for documents with no references', async () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = await resolveReferences(doc);

      expect(result.errors).toHaveLength(0);
      expect(result.resolved).toBe(0);
    });
  });

  describe('Complex Document Resolution', () => {
    it('should handle complex documents with mixed reference patterns', async () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Complex API', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              parameters: [
                { $ref: '#/components/parameters/PageParam' },
                { $ref: '#/components/parameters/LimitParam' },
              ],
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
                '400': { $ref: '#/components/responses/BadRequest' },
                '404': { $ref: '#/components/responses/NotFound' },
              },
            },
            post: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/CreateUser' },
                  },
                },
              },
              responses: {
                '201': {
                  description: 'Created',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          parameters: {
            PageParam: {
              name: 'page',
              in: 'query',
              schema: { type: 'integer' },
            },
            LimitParam: {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer' },
            },
          },
          schemas: {
            User: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
              },
            },
            CreateUser: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
          },
          responses: {
            BadRequest: {
              description: 'Bad request',
            },
            NotFound: {
              description: 'Not found',
            },
          },
        },
      };

      const result = await resolveReferences(doc);

      expect(result.errors).toHaveLength(0);
      expect(result.resolved).toBe(7); // 2 params + 2 schemas (User, CreateUser) + 2 responses + 1 items ref

      // Verify document structure is preserved
      expect(result.document.openapi).toBe('3.0.0');
      expect(result.document.info.title).toBe('Complex API');
    });
  });
});
