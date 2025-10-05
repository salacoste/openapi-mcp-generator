/**
 * Full Parser Pipeline Integration Tests
 * Story 2.9: Parser Output Validation and Integration Testing
 *
 * Tests the complete parsing pipeline end-to-end with parseOpenAPIDocument
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { parseOpenAPIDocument } from '../../src/index.js';
import type { ParseResult } from '../../src/index.js';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, '../fixtures');

describe('Full Parser Pipeline Integration', () => {
  let parseResult: ParseResult;
  const fixturePath = join(fixturesDir, 'ozon-api-simplified.yaml');

  beforeAll(async () => {
    // Verify fixture exists
    if (!existsSync(fixturePath)) {
      throw new Error(`Test fixture not found at ${fixturePath}`);
    }

    // Parse through complete pipeline
    parseResult = await parseOpenAPIDocument(fixturePath);
  });

  describe('AC3: Successful Parsing Validation', () => {
    it('should parse without errors', () => {
      expect(parseResult.errors).toHaveLength(0);
    });

    it('should complete all pipeline stages', () => {
      expect(parseResult.document).toBeDefined();
      expect(parseResult.schemas).toBeDefined();
      expect(parseResult.operations).toBeDefined();
      expect(parseResult.security).toBeDefined();
      expect(parseResult.tags).toBeDefined();
      expect(parseResult.servers).toBeDefined();
    });

    it('should have valid metadata', () => {
      expect(parseResult.metadata.apiName).toBe('Ozon Performance API (Simplified)');
      expect(parseResult.metadata.apiVersion).toBe('1.0.0');
      expect(parseResult.metadata.parseTime).toBeGreaterThan(0);
    });
  });

  describe('AC4: Operation Count Validation', () => {
    it('should extract all operations', () => {
      // Simplified fixture has 3 operations
      expect(parseResult.operations.length).toBe(3);
    });

    it('should assign operation IDs to all operations', () => {
      parseResult.operations.forEach((op) => {
        expect(op.operationId).toBeDefined();
        expect(op.operationId).toMatch(/^[a-zA-Z][a-zA-Z0-9_]*$/);
      });
    });

    it('should extract all required metadata', () => {
      parseResult.operations.forEach((op) => {
        expect(op.path).toBeDefined();
        expect(op.method).toBeDefined();
        // parameters may be undefined for operations without parameters
        if (op.parameters !== undefined) {
          expect(Array.isArray(op.parameters)).toBe(true);
        }
      });
    });

    it('should have correct operation IDs', () => {
      const operationIds = parseResult.operations.map((op) => op.operationId);
      expect(operationIds).toContain('listProducts');
      expect(operationIds).toContain('createProduct');
      expect(operationIds).toContain('getProduct');
    });
  });

  describe('AC5: Reference Resolution Validation', () => {
    it('should resolve all $ref references', () => {
      // Check operations have no $ref
      const opsString = JSON.stringify(parseResult.operations);
      expect(opsString).not.toContain('$ref');
    });

    it('should resolve schema references', () => {
      const schemaArray = Array.from(parseResult.schemas.values());
      const schemaString = JSON.stringify(schemaArray);

      // Schemas should not contain $ref after resolution
      expect(schemaString).not.toContain('$ref');
    });

    it('should extract referenced schemas', () => {
      expect(parseResult.schemas.has('Error')).toBe(true);
      expect(parseResult.schemas.has('Product')).toBe(true);
      expect(parseResult.schemas.has('ProductList')).toBe(true);
    });
  });

  describe('AC6: Security Scheme Classification Validation', () => {
    it('should classify all security schemes', () => {
      const schemes = Object.values(parseResult.security.schemes);
      expect(schemes.length).toBeGreaterThan(0);

      schemes.forEach((scheme) => {
        expect(scheme.classification).toBeDefined();
      });
    });

    it('should classify ApiKey scheme correctly', () => {
      expect(parseResult.security.schemes['ApiKeyAuth']).toBeDefined();
      expect(parseResult.security.schemes['ApiKeyAuth'].classification).toBe('api-key-header');
    });
  });

  describe('AC7: Tag Extraction Validation', () => {
    it('should extract tags with operation counts', () => {
      expect(parseResult.tags.tags.length).toBeGreaterThan(0);

      parseResult.tags.tags.forEach((tag) => {
        expect(tag.name).toBeDefined();
        expect(tag.operationCount).toBeGreaterThan(0);
        expect(tag.operationIds.length).toBe(tag.operationCount);
      });
    });

    it('should have Products tag', () => {
      const productsTag = parseResult.tags.tags.find((t) => t.name === 'Products');
      expect(productsTag).toBeDefined();
      if (productsTag) {
        expect(productsTag.operationCount).toBe(3);
      }
    });

    it('should assign all operations to tags', () => {
      const operationTagMap = parseResult.tags.operationTagMap;
      parseResult.operations.forEach((op) => {
        const tags = operationTagMap.get(op.operationId);
        expect(tags).toBeDefined();
        if (tags) {
          expect(tags.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('AC8: Server URL Validation', () => {
    it('should extract server URLs', () => {
      expect(parseResult.servers.servers.length).toBe(2);
    });

    it('should extract production server', () => {
      const prodServer = parseResult.servers.servers.find(
        (s) => s.environment === 'production'
      );
      expect(prodServer).toBeDefined();
      if (prodServer) {
        expect(prodServer.baseURL).toBe('https://api.ozon.ru/v1');
        expect(prodServer.basePath).toBe('/v1');
      }
    });

    it('should extract staging server', () => {
      const stagingServer = parseResult.servers.servers.find(
        (s) => s.environment === 'staging'
      );
      expect(stagingServer).toBeDefined();
      if (stagingServer) {
        expect(stagingServer.baseURL).toBe('https://api-staging.ozon.ru/v1');
      }
    });

    it('should set default server', () => {
      expect(parseResult.servers.defaultServer).toBeDefined();
      expect(parseResult.servers.defaultServer.priority).toBe(0);
    });
  });

  describe('AC9: Complex Schema Normalization Validation', () => {
    it('should extract inline request/response schemas', () => {
      const schemaNames = Array.from(parseResult.schemas.keys());

      // Check for main schemas
      expect(schemaNames).toContain('Error');
      expect(schemaNames).toContain('Product');
      expect(schemaNames).toContain('ProductList');
    });

    it('should normalize schema structures', () => {
      const product = parseResult.schemas.get('Product');
      expect(product).toBeDefined();
      if (product) {
        expect(product.properties).toBeDefined();
        expect(product.required).toContain('id');
        expect(product.required).toContain('name');
      }
    });

    it('should handle nested object properties', () => {
      const productList = parseResult.schemas.get('ProductList');
      expect(productList).toBeDefined();
      if (productList && productList.properties) {
        expect(productList.properties).toBeDefined();
        expect(productList.properties['items']).toBeDefined();
        expect(productList.properties['total']).toBeDefined();
      }
    });
  });

  describe('AC10: Performance Benchmarks', () => {
    it('should parse in reasonable time', () => {
      // Simplified fixture should parse very quickly
      expect(parseResult.metadata.parseTime).toBeLessThan(5000); // <5s
    });

    it('should report performance metadata', () => {
      expect(parseResult.metadata).toBeDefined();
      expect(parseResult.metadata.parseTime).toBeGreaterThan(0);
      expect(parseResult.metadata.schemaCount).toBe(parseResult.schemas.size);
      expect(parseResult.metadata.operationCount).toBe(parseResult.operations.length);
    });
  });

  describe('AC11: Memory Usage Validation', () => {
    it('should use reasonable memory', () => {
      const memUsage = process.memoryUsage();
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;

      // Should stay under 256MB for simplified fixture
      expect(heapUsedMB).toBeLessThan(256);
    });
  });

  describe('Parse Result Structure', () => {
    it('should have all required fields', () => {
      expect(parseResult).toHaveProperty('document');
      expect(parseResult).toHaveProperty('schemas');
      expect(parseResult).toHaveProperty('operations');
      expect(parseResult).toHaveProperty('security');
      expect(parseResult).toHaveProperty('tags');
      expect(parseResult).toHaveProperty('servers');
      expect(parseResult).toHaveProperty('errors');
      expect(parseResult).toHaveProperty('warnings');
      expect(parseResult).toHaveProperty('metadata');
    });

    it('should have metadata with all required fields', () => {
      expect(parseResult.metadata).toHaveProperty('apiName');
      expect(parseResult.metadata).toHaveProperty('apiVersion');
      expect(parseResult.metadata).toHaveProperty('parseTime');
      expect(parseResult.metadata).toHaveProperty('schemaCount');
      expect(parseResult.metadata).toHaveProperty('operationCount');
      expect(parseResult.metadata).toHaveProperty('tagCount');
      expect(parseResult.metadata).toHaveProperty('serverCount');
    });

    it('should have correct metadata counts', () => {
      expect(parseResult.metadata.schemaCount).toBe(parseResult.schemas.size);
      expect(parseResult.metadata.operationCount).toBe(parseResult.operations.length);
      expect(parseResult.metadata.tagCount).toBe(parseResult.tags.tags.length);
      expect(parseResult.metadata.serverCount).toBe(parseResult.servers.servers.length);
    });
  });
});
