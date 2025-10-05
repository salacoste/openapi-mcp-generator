/**
 * Tests for TypeScript interface generator
 */

import { describe, it, expect } from 'vitest';
import { generateInterfaces, type SchemaMap } from '../src/interface-generator.js';

describe('Interface Generator', () => {
  describe('generateInterfaces', () => {
    it('should generate empty result for empty schema map', () => {
      const result = generateInterfaces({});

      expect(result.interfaces).toHaveLength(0);
      expect(result.code).toContain('@generated');
    });

    it('should generate basic interface from simple schema', () => {
      const schemas: SchemaMap = {
        User: {
          name: 'User',
          type: 'object',
          description: 'User information',
          properties: {
            id: { name: 'id', type: 'string' },
            name: { name: 'name', type: 'string' },
            age: { name: 'age', type: 'integer' },
          },
          required: ['id', 'name'],
        },
      };

      const result = generateInterfaces(schemas);

      expect(result.interfaces).toHaveLength(1);
      expect(result.interfaces[0]?.name).toBe('User');
      expect(result.code).toContain('export interface User');
      expect(result.code).toContain('id: string');
      expect(result.code).toContain('name: string');
      expect(result.code).toContain('age?: number');
    });
  });

  describe('Basic Type Mapping', () => {
    it('should map string type correctly', () => {
      const schemas: SchemaMap = {
        StringTest: {
          name: 'StringTest',
          type: 'object',
          properties: {
            value: { name: 'value', type: 'string' },
          },
        },
      };

      const result = generateInterfaces(schemas);
      expect(result.code).toContain('value?: string');
    });

    it('should map number type correctly', () => {
      const schemas: SchemaMap = {
        NumberTest: {
          name: 'NumberTest',
          type: 'object',
          properties: {
            count: { name: 'count', type: 'number' },
            index: { name: 'index', type: 'integer' },
          },
        },
      };

      const result = generateInterfaces(schemas);
      expect(result.code).toContain('count?: number');
      expect(result.code).toContain('index?: number');
    });

    it('should map boolean type correctly', () => {
      const schemas: SchemaMap = {
        BooleanTest: {
          name: 'BooleanTest',
          type: 'object',
          properties: {
            isActive: { name: 'isActive', type: 'boolean' },
          },
        },
      };

      const result = generateInterfaces(schemas);
      expect(result.code).toContain('isActive?: boolean');
    });

    it('should map unknown types to unknown', () => {
      const schemas: SchemaMap = {
        UnknownTest: {
          name: 'UnknownTest',
          type: 'object',
          properties: {
            value: { name: 'value', type: 'custom' },
          },
        },
      };

      const result = generateInterfaces(schemas);
      expect(result.code).toContain('value?: unknown');
    });
  });

  describe('Nullable Handling', () => {
    it('should generate nullable type', () => {
      const schemas: SchemaMap = {
        NullableTest: {
          name: 'NullableTest',
          type: 'object',
          properties: {
            value: { name: 'value', type: 'string', nullable: true },
          },
        },
      };

      const result = generateInterfaces(schemas);
      expect(result.code).toContain('value?: string | null');
    });

    it('should handle nullable arrays', () => {
      const schemas: SchemaMap = {
        NullableArrayTest: {
          name: 'NullableArrayTest',
          type: 'object',
          properties: {
            items: {
              name: 'items',
              type: 'array',
              items: { name: 'item', type: 'string' },
              nullable: true,
            },
          },
        },
      };

      const result = generateInterfaces(schemas);
      expect(result.code).toContain('items?: string[] | null');
    });
  });

  describe('Enum Generation', () => {
    it('should generate string enum as union type', () => {
      const schemas: SchemaMap = {
        Status: {
          name: 'Status',
          type: 'object',
          properties: {
            value: { name: 'value', type: 'string', enum: ['active', 'inactive', 'pending'] },
          },
        },
      };

      const result = generateInterfaces(schemas);
      expect(result.code).toContain("value?: 'active' | 'inactive' | 'pending'");
    });

    it('should generate numeric enum', () => {
      const schemas: SchemaMap = {
        Priority: {
          name: 'Priority',
          type: 'object',
          properties: {
            level: { name: 'level', type: 'integer', enum: [1, 2, 3] },
          },
        },
      };

      const result = generateInterfaces(schemas);
      expect(result.code).toContain('level?: 1 | 2 | 3');
    });
  });

  describe('Required vs Optional Properties', () => {
    it('should mark required properties without ?', () => {
      const schemas: SchemaMap = {
        RequiredTest: {
          name: 'RequiredTest',
          type: 'object',
          properties: {
            required1: { name: 'required1', type: 'string' },
            required2: { name: 'required2', type: 'number' },
            optional1: { name: 'optional1', type: 'string' },
          },
          required: ['required1', 'required2'],
        },
      };

      const result = generateInterfaces(schemas);
      expect(result.code).toContain('required1: string');
      expect(result.code).toContain('required2: number');
      expect(result.code).toContain('optional1?: string');
    });

    it('should handle empty required array', () => {
      const schemas: SchemaMap = {
        AllOptional: {
          name: 'AllOptional',
          type: 'object',
          properties: {
            prop1: { name: 'prop1', type: 'string' },
            prop2: { name: 'prop2', type: 'number' },
          },
          required: [],
        },
      };

      const result = generateInterfaces(schemas);
      expect(result.code).toContain('prop1?: string');
      expect(result.code).toContain('prop2?: number');
    });
  });

  describe('Array Type Generation', () => {
    it('should generate primitive array types', () => {
      const schemas: SchemaMap = {
        ArrayTest: {
          name: 'ArrayTest',
          type: 'object',
          properties: {
            strings: {
              name: 'strings',
              type: 'array',
              items: { name: 'item', type: 'string' },
            },
            numbers: {
              name: 'numbers',
              type: 'array',
              items: { name: 'item', type: 'number' },
            },
          },
        },
      };

      const result = generateInterfaces(schemas);
      expect(result.code).toContain('strings?: string[]');
      expect(result.code).toContain('numbers?: number[]');
    });

    it('should generate Array<T> syntax when configured', () => {
      const schemas: SchemaMap = {
        GenericArrayTest: {
          name: 'GenericArrayTest',
          type: 'object',
          properties: {
            items: {
              name: 'items',
              type: 'array',
              items: { name: 'item', type: 'string' },
            },
          },
        },
      };

      const result = generateInterfaces(schemas, {
        arrayStyle: 'generic',
      });

      expect(result.code).toContain('items?: Array<string>');
    });

    it('should generate tuple types for fixed-length arrays', () => {
      const schemas: SchemaMap = {
        TupleTest: {
          name: 'TupleTest',
          type: 'object',
          properties: {
            coordinates: {
              name: 'coordinates',
              type: 'array',
              items: { name: 'item', type: 'number' },
              minItems: 2,
              maxItems: 2,
            },
          },
        },
      };

      const result = generateInterfaces(schemas);
      expect(result.code).toContain('coordinates?: [number, number]');
    });
  });

  describe('Nested Object Handling', () => {
    it('should generate nested interfaces', () => {
      const schemas: SchemaMap = {
        User: {
          name: 'User',
          type: 'object',
          properties: {
            id: { name: 'id', type: 'string' },
            profile: {
              name: 'profile',
              type: 'object',
              properties: {
                bio: { name: 'bio', type: 'string' },
                avatar: { name: 'avatar', type: 'string' },
              },
            },
          },
        },
      };

      const result = generateInterfaces(schemas);
      expect(result.interfaces).toHaveLength(2);
      expect(result.code).toContain('export interface User');
      expect(result.code).toContain('export interface UserProfile');
      expect(result.code).toContain('bio?: string');
      expect(result.code).toContain('avatar?: string');
    });
  });

  describe('AllOf Composition', () => {
    it('should generate intersection types for allOf', () => {
      const schemas: SchemaMap = {
        BaseEntity: {
          name: 'BaseEntity',
          type: 'object',
          properties: {
            id: { name: 'id', type: 'string' },
          },
        },
        Timestamped: {
          name: 'Timestamped',
          type: 'object',
          properties: {
            createdAt: { name: 'createdAt', type: 'string' },
          },
        },
        User: {
          name: 'User',
          type: 'object',
          allOf: [
            { $ref: '#/components/schemas/BaseEntity' },
            { $ref: '#/components/schemas/Timestamped' },
          ],
        },
      };

      const result = generateInterfaces(schemas);
      expect(result.code).toContain('export type User = BaseEntity & Timestamped');
    });
  });

  describe('OneOf/AnyOf Union Types', () => {
    it('should generate union types for oneOf', () => {
      const schemas: SchemaMap = {
        Cat: {
          name: 'Cat',
          type: 'object',
          properties: {
            meow: { name: 'meow', type: 'string' },
          },
        },
        Dog: {
          name: 'Dog',
          type: 'object',
          properties: {
            bark: { name: 'bark', type: 'string' },
          },
        },
        Pet: {
          name: 'Pet',
          type: 'object',
          oneOf: [{ $ref: '#/components/schemas/Cat' }, { $ref: '#/components/schemas/Dog' }],
        },
      };

      const result = generateInterfaces(schemas);
      expect(result.code).toContain('export type Pet = Cat | Dog');
    });

    it('should generate union types for anyOf', () => {
      const schemas: SchemaMap = {
        SuccessResponse: {
          name: 'SuccessResponse',
          type: 'object',
          properties: {
            success: { name: 'success', type: 'boolean' },
          },
        },
        ErrorResponse: {
          name: 'ErrorResponse',
          type: 'object',
          properties: {
            error: { name: 'error', type: 'string' },
          },
        },
        Response: {
          name: 'Response',
          type: 'object',
          anyOf: [
            { $ref: '#/components/schemas/SuccessResponse' },
            { $ref: '#/components/schemas/ErrorResponse' },
          ],
        },
      };

      const result = generateInterfaces(schemas);
      expect(result.code).toContain('export type Response = SuccessResponse | ErrorResponse');
    });
  });

  describe('JSDoc Comments', () => {
    it('should include descriptions in JSDoc comments', () => {
      const schemas: SchemaMap = {
        User: {
          name: 'User',
          type: 'object',
          description: 'Represents a user in the system',
          properties: {
            name: {
              name: 'name',
              type: 'string',
              description: 'The user full name',
            },
          },
        },
      };

      const result = generateInterfaces(schemas, {
        includeComments: true,
      });

      expect(result.code).toContain('Represents a user in the system');
      expect(result.code).toContain('The user full name');
    });

    it('should include examples when configured', () => {
      const schemas: SchemaMap = {
        User: {
          name: 'User',
          type: 'object',
          description: 'User information',
          example: { name: 'John Doe' },
          properties: {
            name: { name: 'name', type: 'string' },
          },
        },
      };

      const result = generateInterfaces(schemas, {
        includeComments: true,
        includeExamples: true,
      });

      expect(result.code).toContain('@example');
      expect(result.code).toContain('John Doe');
    });

    it('should omit comments when configured', () => {
      const schemas: SchemaMap = {
        User: {
          name: 'User',
          type: 'object',
          description: 'User information',
          properties: {
            name: { name: 'name', type: 'string', description: 'User name' },
          },
        },
      };

      const result = generateInterfaces(schemas, {
        includeComments: false,
      });

      expect(result.code).not.toContain('User information');
      expect(result.code).not.toContain('User name');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle complex nested schema with multiple types', () => {
      const schemas: SchemaMap = {
        ComplexEntity: {
          name: 'ComplexEntity',
          type: 'object',
          description: 'A complex entity with various types',
          properties: {
            id: { name: 'id', type: 'string' },
            status: { name: 'status', type: 'string', enum: ['active', 'inactive'] },
            tags: {
              name: 'tags',
              type: 'array',
              items: { name: 'tag', type: 'string' },
              nullable: true,
            },
            metadata: {
              name: 'metadata',
              type: 'object',
              properties: {
                created: { name: 'created', type: 'string' },
                modified: { name: 'modified', type: 'string', nullable: true },
              },
              required: ['created'],
            },
          },
          required: ['id', 'status'],
        },
      };

      const result = generateInterfaces(schemas);

      expect(result.code).toContain('id: string');
      expect(result.code).toContain("status: 'active' | 'inactive'");
      expect(result.code).toContain('tags?: string[] | null');
      expect(result.code).toContain('export interface ComplexEntityMetadata');
      expect(result.code).toContain('created: string');
      expect(result.code).toContain('modified?: string | null');
    });
  });
});
