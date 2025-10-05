/**
 * Tests for schema extraction and normalization
 */

import { describe, it, expect } from 'vitest';
import { extractSchemas, serializeSchemaMap } from '../src/schema-extractor.js';

describe('extractSchemas', () => {
  it('should extract component schemas from components.schemas', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
            required: ['id'],
          },
        },
      },
    };

    const schemaMap = extractSchemas(doc as never);

    expect(schemaMap.size).toBe(1);
    expect(schemaMap.has('User')).toBe(true);

    const userSchema = schemaMap.get('User');
    expect(userSchema?.type).toBe('object');
    expect(userSchema?.properties).toBeDefined();
    expect(userSchema?.required).toEqual(['id']);
  });

  it('should generate names for inline request schemas', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/users': {
          post: {
            requestBody: {
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
              '200': { description: 'OK' },
            },
          },
        },
      },
    };

    const schemaMap = extractSchemas(doc as never);

    expect(schemaMap.has('PostUsersRequestSchema')).toBe(true);
  });

  it('should generate names for inline response schemas', () => {
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
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
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

    const schemaMap = extractSchemas(doc as never);

    expect(schemaMap.has('GetUsers200ResponseSchema')).toBe(true);
  });

  it('should normalize allOf composition by merging properties', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          UserWithProfile: {
            allOf: [
              {
                type: 'object',
                properties: { id: { type: 'string' } },
                required: ['id'],
              },
              {
                type: 'object',
                properties: { name: { type: 'string' } },
                required: ['name'],
              },
            ],
          },
        },
      },
    };

    const schemaMap = extractSchemas(doc as never);
    const schema = schemaMap.get('UserWithProfile');

    expect(schema?.type).toBe('object');
    expect(schema?.properties).toBeDefined();
    expect(schema?.required).toEqual(expect.arrayContaining(['id', 'name']));
    expect(schema?.composition?.type).toBe('allOf');
  });

  it('should handle oneOf as union type', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          Pet: {
            oneOf: [
              { type: 'object', properties: { meow: { type: 'boolean' } } },
              { type: 'object', properties: { bark: { type: 'boolean' } } },
            ],
          },
        },
      },
    };

    const schemaMap = extractSchemas(doc as never);
    const schema = schemaMap.get('Pet');

    expect(schema?.type).toBe('union');
    expect(schema?.composition?.type).toBe('oneOf');
    expect(schema?.composition?.schemas.length).toBe(2);
    expect(schemaMap.has('PetOption1')).toBe(true);
    expect(schemaMap.has('PetOption2')).toBe(true);
  });

  it('should handle array schemas', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          UserList: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
              },
            },
          },
        },
      },
    };

    const schemaMap = extractSchemas(doc as never);
    const schema = schemaMap.get('UserList');

    expect(schema?.type).toBe('array');
    expect(schema?.items).toBeDefined();
  });

  it('should handle enum properties', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          Status: {
            type: 'string',
            enum: ['active', 'inactive', 'pending'],
          },
        },
      },
    };

    const schemaMap = extractSchemas(doc as never);
    const schema = schemaMap.get('Status');

    expect(schema?.enum).toEqual(['active', 'inactive', 'pending']);
  });

  it('should extract property metadata', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              email: {
                type: 'string',
                format: 'email',
                description: 'User email address',
              },
              age: {
                type: 'integer',
                minimum: 0,
                maximum: 120,
              },
            },
            required: ['email'],
          },
        },
      },
    };

    const schemaMap = extractSchemas(doc as never);
    const schema = schemaMap.get('User');

    expect(schema?.properties?.email.format).toBe('email');
    expect(schema?.properties?.email.description).toBe('User email address');
    expect(schema?.properties?.email.required).toBe(true);
    expect(schema?.properties?.age.required).toBe(false);
    expect(schema?.properties?.age.constraints?.minimum).toBe(0);
    expect(schema?.properties?.age.constraints?.maximum).toBe(120);
  });

  it('should ensure unique names for duplicate schemas', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { name: { type: 'string' } },
                  },
                },
              },
            },
            responses: {
              '200': { description: 'OK' },
            },
          },
        },
        '/users/{id}': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { email: { type: 'string' } },
                  },
                },
              },
            },
            responses: {
              '200': { description: 'OK' },
            },
          },
        },
      },
    };

    const schemaMap = extractSchemas(doc as never);

    // Both POST /users and POST /users/{id} would generate "PostUsersRequestSchema"
    // Second one should be renamed to "PostUsersRequestSchema2"
    expect(schemaMap.has('PostUsersRequestSchema')).toBe(true);
    expect(schemaMap.has('PostUsersRequestSchema2')).toBe(true);
  });

  it('should serialize and deserialize schema map', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'string' },
            },
          },
        },
      },
    };

    const schemaMap = extractSchemas(doc as never);
    const json = serializeSchemaMap(schemaMap);

    expect(json).toContain('"User"');
    expect(json).toContain('"type": "object"'); // JSON is pretty-printed with spaces

    // Verify it's valid JSON
    const parsed = JSON.parse(json);
    expect(parsed.User).toBeDefined();
  });

  it('should extract nested object schemas', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              profile: {
                type: 'object',
                properties: {
                  bio: { type: 'string' },
                  avatar: { type: 'string' },
                },
              },
            },
          },
        },
      },
    };

    const schemaMap = extractSchemas(doc as never);

    // Should extract User and nested UserProfile
    expect(schemaMap.has('User')).toBe(true);
    expect(schemaMap.has('UserProfile')).toBe(true);

    const profileSchema = schemaMap.get('UserProfile');
    expect(profileSchema?.type).toBe('object');
    expect(profileSchema?.metadata?.parent).toBe('User');
  });
});
