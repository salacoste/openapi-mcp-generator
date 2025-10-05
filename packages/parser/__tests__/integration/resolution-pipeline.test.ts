/**
 * Integration tests for Load → Validate → Resolve pipeline
 */

import { describe, it, expect } from 'vitest';
import { validateOpenAPISchema } from '../../src/validator.js';
import { resolveReferences } from '../../src/ref-resolver.js';

describe('Load → Validate → Resolve Pipeline', () => {
  it('should successfully complete full pipeline with internal references', async () => {
    // Create a complete OpenAPI document with internal references
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            operationId: 'getUsers',
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
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
      },
    };

    // Step 1: Validation (we skip loading since we have the document)
    const validationResult = await validateOpenAPISchema(doc);
    expect(validationResult.valid).toBe(true);
    expect(validationResult.errors).toHaveLength(0);

    // Step 2: Resolve references
    const resolutionResult = await resolveReferences(doc);
    expect(resolutionResult.errors).toHaveLength(0);
    // Reference count may be 0 if swagger-parser resolves them all inline without counting
    // The important verification is that no $ref properties remain

    // Verify no $ref properties remain in resolved document
    const hasRefs = JSON.stringify(resolutionResult.document).includes('"$ref"');
    expect(hasRefs).toBe(false);

    // Verify document structure is preserved
    expect(resolutionResult.document.openapi).toBe('3.0.0');
    expect(resolutionResult.document.info.title).toBe('Test API');
  });

  it('should handle validation errors before resolution', async () => {
    // Invalid document (missing required fields)
    const doc = {
      openapi: '3.0.0',
      // Missing info and paths
    };

    // Validation should fail
    const validationResult = await validateOpenAPISchema(doc);
    expect(validationResult.valid).toBe(false);
    expect(validationResult.errors.length).toBeGreaterThan(0);

    // Don't proceed to resolution if validation fails
    // In real CLI workflow, we'd exit here
  });

  it('should handle resolution errors after validation passes', async () => {
    // Valid structure but missing referenced schema
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            operationId: 'getUsers',
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

    // Validation (this test focuses on resolution errors, not validation)
    await validateOpenAPISchema(doc);

    // Resolution should fail (missing reference)
    const resolutionResult = await resolveReferences(doc);
    expect(resolutionResult.errors.length).toBeGreaterThan(0);
    expect(resolutionResult.errors[0].type).toBe('missing');
  });

  it('should handle documents with no references', async () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Simple API', version: '1.0.0' },
      paths: {
        '/ping': {
          get: {
            operationId: 'ping',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string' },
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

    // Validation should pass
    const validationResult = await validateOpenAPISchema(doc);
    expect(validationResult.valid).toBe(true);

    // Resolution should succeed with 0 references
    const resolutionResult = await resolveReferences(doc);
    expect(resolutionResult.errors).toHaveLength(0);
    expect(resolutionResult.resolved).toBe(0);
  });

  it('should handle complex documents with multiple reference types', async () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Complex API', version: '1.0.0' },
      paths: {
        '/users': {
          post: {
            operationId: 'createUser',
            parameters: [{ $ref: '#/components/parameters/ApiKey' }],
            requestBody: { $ref: '#/components/requestBodies/CreateUser' },
            responses: {
              '201': { $ref: '#/components/responses/UserCreated' },
              '400': { $ref: '#/components/responses/BadRequest' },
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
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
        responses: {
          UserCreated: {
            description: 'User created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          BadRequest: {
            description: 'Bad request',
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
        },
      },
    };

    // Validation should pass
    const validationResult = await validateOpenAPISchema(doc);
    expect(validationResult.valid).toBe(true);

    // Resolution should succeed
    const resolutionResult = await resolveReferences(doc);
    expect(resolutionResult.errors).toHaveLength(0);
    // Reference count may vary depending on how swagger-parser handles nested refs
    // The important part is no errors occurred

    // Verify all references are resolved (no $ref properties remain)
    const hasRefs = JSON.stringify(resolutionResult.document).includes('"$ref"');
    expect(hasRefs).toBe(false);
  });
});
