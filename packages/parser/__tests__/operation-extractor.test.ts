/**
 * Tests for operation extraction
 */

import { describe, it, expect } from 'vitest';
import { extractOperations } from '../src/operation-extractor.js';

describe('extractOperations', () => {
  it('should extract operations from simple paths', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get all users',
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
      },
    };

    const operations = extractOperations(doc as never);

    expect(operations).toHaveLength(1);
    expect(operations[0].operationId).toBe('getUsers');
    expect(operations[0].method).toBe('get');
    expect(operations[0].path).toBe('/users');
    expect(operations[0].summary).toBe('Get all users');
  });

  it('should generate operation IDs when missing', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
        '/products': {
          post: {
            responses: {
              '201': { description: 'Created' },
            },
          },
        },
      },
    };

    const operations = extractOperations(doc as never);

    expect(operations).toHaveLength(2);
    expect(operations[0].operationId).toBe('getUsers');
    expect(operations[1].operationId).toBe('postProducts');
  });

  it('should generate operation IDs with path parameters', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/users/{id}': {
          get: {
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
        '/users/{userId}/posts/{postId}': {
          get: {
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
      },
    };

    const operations = extractOperations(doc as never);

    expect(operations).toHaveLength(2);
    expect(operations[0].operationId).toBe('getUsersById');
    expect(operations[1].operationId).toBe('getUsersPostsByUseridAndPostid');
  });

  it('should extract query parameters', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            parameters: [
              {
                name: 'page',
                in: 'query',
                required: false,
                schema: { type: 'integer', default: 1 },
              },
              {
                name: 'limit',
                in: 'query',
                required: true,
                schema: { type: 'integer' },
              },
            ],
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
      },
    };

    const operations = extractOperations(doc as never);

    expect(operations).toHaveLength(1);
    expect(operations[0].queryParameters).toHaveLength(2);
    expect(operations[0].queryParameters[0].name).toBe('page');
    expect(operations[0].queryParameters[0].required).toBe(false);
    expect(operations[0].queryParameters[1].name).toBe('limit');
    expect(operations[0].queryParameters[1].required).toBe(true);
  });

  it('should extract path parameters and mark as required', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/users/{userId}': {
          get: {
            parameters: [
              {
                name: 'userId',
                in: 'path',
                schema: { type: 'string' },
              },
            ],
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
      },
    };

    const operations = extractOperations(doc as never);

    expect(operations[0].pathParameters).toHaveLength(1);
    expect(operations[0].pathParameters[0].name).toBe('userId');
    expect(operations[0].pathParameters[0].required).toBe(true); // Always required per spec
  });

  it('should extract header parameters excluding auth headers', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            parameters: [
              {
                name: 'X-Request-ID',
                in: 'header',
                schema: { type: 'string' },
              },
              {
                name: 'Authorization',
                in: 'header',
                schema: { type: 'string' },
              },
              {
                name: 'X-API-Key',
                in: 'header',
                schema: { type: 'string' },
              },
            ],
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
      },
    };

    const operations = extractOperations(doc as never);

    expect(operations[0].headerParameters).toHaveLength(1);
    expect(operations[0].headerParameters[0].name).toBe('X-Request-ID');
  });

  it('should extract request body', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/users': {
          post: {
            requestBody: {
              required: true,
              description: 'User data',
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
            responses: {
              '201': { description: 'Created' },
            },
          },
        },
      },
    };

    const operations = extractOperations(doc as never);

    expect(operations[0].requestBody).toBeDefined();
    expect(operations[0].requestBody?.required).toBe(true);
    expect(operations[0].requestBody?.description).toBe('User data');
    expect(operations[0].requestBody?.mediaType).toBe('application/json');
  });

  it('should extract multiple responses', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { type: 'array' },
                  },
                },
              },
              '400': { description: 'Bad Request' },
              '404': { description: 'Not Found' },
              default: { description: 'Error' },
            },
          },
        },
      },
    };

    const operations = extractOperations(doc as never);

    expect(operations[0].responses).toHaveLength(4);
    expect(operations[0].responses.map((r) => r.statusCode)).toEqual(
      expect.arrayContaining(['200', '400', '404', 'default'])
    );
  });

  it('should assign tags from operation', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            tags: ['Users', 'Admin'],
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
      },
    };

    const operations = extractOperations(doc as never);

    expect(operations[0].tags).toEqual(['Users', 'Admin']);
  });

  it('should infer tags from path when missing', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/products': {
          get: {
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
        '/orders/pending': {
          get: {
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
      },
    };

    const operations = extractOperations(doc as never);

    expect(operations[0].tags).toEqual(['Products']);
    expect(operations[1].tags).toEqual(['Orders']);
  });

  it('should deduplicate parameters', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/users': {
          parameters: [
            {
              name: 'apiVersion',
              in: 'query',
              schema: { type: 'string', default: 'v1' },
            },
          ],
          get: {
            parameters: [
              {
                name: 'apiVersion',
                in: 'query',
                schema: { type: 'string', default: 'v2' }, // Override
              },
              {
                name: 'page',
                in: 'query',
                schema: { type: 'integer' },
              },
            ],
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
      },
    };

    const operations = extractOperations(doc as never);

    expect(operations[0].queryParameters).toHaveLength(2);
    // Operation-level should override path-level
    const apiVersion = operations[0].queryParameters.find((p) => p.name === 'apiVersion');
    expect(apiVersion?.schema?.default).toBe('v2');
  });

  it('should mark deprecated operations', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/old-endpoint': {
          get: {
            deprecated: true,
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
      },
    };

    const operations = extractOperations(doc as never);

    expect(operations[0].deprecated).toBe(true);
  });

  it('should handle all HTTP methods', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/resource': {
          get: { responses: { '200': { description: 'OK' } } },
          post: { responses: { '201': { description: 'Created' } } },
          put: { responses: { '200': { description: 'OK' } } },
          patch: { responses: { '200': { description: 'OK' } } },
          delete: { responses: { '204': { description: 'No Content' } } },
          head: { responses: { '200': { description: 'OK' } } },
          options: { responses: { '200': { description: 'OK' } } },
        },
      },
    };

    const operations = extractOperations(doc as never);

    expect(operations).toHaveLength(7);
    expect(operations.map((o) => o.method)).toEqual(
      expect.arrayContaining(['get', 'post', 'put', 'patch', 'delete', 'head', 'options'])
    );
  });

  it('should ensure operation ID uniqueness', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/users': {
          get: { operationId: 'getUsers', responses: { '200': { description: 'OK' } } },
        },
        '/users/active': {
          get: { operationId: 'getUsers', responses: { '200': { description: 'OK' } } }, // Duplicate!
        },
      },
    };

    const operations = extractOperations(doc as never);

    expect(operations).toHaveLength(2);
    expect(operations[0].operationId).toBe('getUsers');
    expect(operations[1].operationId).toBe('getUsers2'); // Should append suffix
  });
});
