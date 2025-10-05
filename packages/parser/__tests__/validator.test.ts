/**
 * Unit tests for OpenAPI validator
 */

import { describe, it, expect } from 'vitest';
import { validateOpenAPISchema } from '../src/validator.js';

describe('validateOpenAPISchema', () => {
  describe('valid documents', () => {
    it('should validate minimal valid OpenAPI 3.0 document', async () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
      };

      const result = await validateOpenAPISchema(doc);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate all supported versions', async () => {
      const versions = ['3.0.0', '3.0.1', '3.0.2', '3.0.3'];

      for (const version of versions) {
        const doc = {
          openapi: version,
          info: { title: 'Test', version: '1.0.0' },
          paths: {},
        };
        const result = await validateOpenAPISchema(doc);
        expect(result.valid).toBe(true);
      }
    });
  });

  describe('version validation', () => {
    it('should reject missing openapi field', async () => {
      const doc = { info: { title: 'Test', version: '1.0.0' }, paths: {} };

      const result = await validateOpenAPISchema(doc);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          path: 'openapi',
          severity: 'error',
        })
      );
    });

    it('should reject Swagger 2.0', async () => {
      const doc = {
        swagger: '2.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
      };

      const result = await validateOpenAPISchema(doc);

      expect(result.valid).toBe(false);
      expect(result.errors[0]?.message).toContain('Swagger 2.0');
      expect(result.errors[0]?.message).toContain('Upgrade');
    });

    it('should warn about OpenAPI 3.1.x', async () => {
      const doc = {
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
      };

      const result = await validateOpenAPISchema(doc);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          path: 'openapi',
          severity: 'warning',
          message: expect.stringContaining('3.1.x'),
        })
      );
    });

    it('should reject invalid version', async () => {
      const doc = {
        openapi: '4.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
      };

      const result = await validateOpenAPISchema(doc);

      expect(result.valid).toBe(false);
      expect(result.errors[0]?.message).toContain('Invalid version');
    });
  });

  describe('required fields', () => {
    it('should reject missing info', async () => {
      const doc = { openapi: '3.0.0', paths: {} };

      const result = await validateOpenAPISchema(doc);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          path: 'info',
          message: expect.stringContaining('Missing'),
        })
      );
    });

    it('should reject missing info.title', async () => {
      const doc = {
        openapi: '3.0.0',
        info: { version: '1.0.0' },
        paths: {},
      };

      const result = await validateOpenAPISchema(doc);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          path: 'info.title',
        })
      );
    });

    it('should reject missing paths', async () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
      };

      const result = await validateOpenAPISchema(doc);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          path: 'paths',
        })
      );
    });
  });

  describe('type validation', () => {
    it('should reject paths as array', async () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: [],
      };

      const result = await validateOpenAPISchema(doc);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          path: 'paths',
          expected: 'object',
          actual: 'array',
        })
      );
    });

    it('should reject servers as object', async () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
        servers: {},
      };

      const result = await validateOpenAPISchema(doc);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          path: 'servers',
          expected: 'array',
        })
      );
    });
  });

  describe('warnings', () => {
    it('should warn about missing operationId', async () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              responses: { '200': { description: 'OK' } },
            },
          },
        },
      };

      const result = await validateOpenAPISchema(doc);

      expect(result.valid).toBe(true);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          path: 'paths./users.get.operationId',
          severity: 'warning',
        })
      );
    });

    it('should warn about missing responses', async () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
            },
          },
        },
      };

      const result = await validateOpenAPISchema(doc);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          path: 'paths./users.get.responses',
          message: expect.stringContaining('No responses'),
        })
      );
    });
  });

  describe('multiple errors', () => {
    it('should collect all errors', async () => {
      const doc = {
        openapi: '3.0.0',
        paths: {},
      };

      const result = await validateOpenAPISchema(doc);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(1);
    });
  });
});
