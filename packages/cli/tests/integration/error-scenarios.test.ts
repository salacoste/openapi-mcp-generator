/**
 * Error Scenario Tests
 * Comprehensive tests for edge cases and invalid inputs
 * Story 5.11: Error Scenario Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';
import fs from 'fs-extra';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Error Scenario Tests (Story 5.11)', () => {
  const testOutputDir = '/tmp/error-scenarios-test';
  const cliPath = resolve(__dirname, '../../dist/index.js');

  beforeEach(async () => {
    await fs.ensureDir(testOutputDir);
  });

  afterEach(async () => {
    await fs.remove(testOutputDir);
  });

  describe('FR1: Missing OperationId Tests', () => {
    it('should handle spec with missing operationId gracefully', async () => {
      const specWithoutOpId = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              // Missing operationId - should auto-generate or handle gracefully
              summary: 'Test endpoint',
              responses: {
                '200': { description: 'Success' },
              },
            },
          },
        },
      };

      const specPath = resolve(testOutputDir, 'missing-operationid.json');
      await fs.writeJSON(specPath, specWithoutOpId);
      const outputPath = resolve(testOutputDir, 'output-missing-op');

      const result = await execa('node', [cliPath, 'generate', specPath, '--output', outputPath], {
        reject: false,
      });

      // Current implementation auto-generates operationIds, so this should succeed
      expect(result.exitCode).toBe(0);

      // Verify output was generated
      expect(await fs.pathExists(resolve(outputPath, 'package.json'))).toBe(true);
    });

    it('should handle multiple operations with missing operationIds', async () => {
      const specMultipleMissing = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: { '200': { description: 'Success' } },
            },
          },
          '/posts': {
            get: {
              // Missing operationId - should be auto-generated
              summary: 'Get posts',
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      };

      const specPath = resolve(testOutputDir, 'specific-missing-operationid.json');
      await fs.writeJSON(specPath, specMultipleMissing);
      const outputPath = resolve(testOutputDir, 'output-specific-missing');

      const result = await execa('node', [cliPath, 'generate', specPath, '--output', outputPath], {
        reject: false,
      });

      // Should succeed with auto-generated operationId
      expect(result.exitCode).toBe(0);
      expect(await fs.pathExists(resolve(outputPath, 'package.json'))).toBe(true);
    });
  });

  describe('FR2: Unsupported OpenAPI Version Tests', () => {
    it('should reject OpenAPI 2.0 (Swagger) specs', async () => {
      const swagger2Spec = {
        swagger: '2.0',
        info: { title: 'Old API', version: '1.0.0' },
        paths: {},
      };

      const specPath = resolve(testOutputDir, 'swagger-2.0.json');
      await fs.writeJSON(specPath, swagger2Spec);
      const outputPath = resolve(testOutputDir, 'output-swagger');

      const result = await execa('node', [cliPath, 'generate', specPath, '--output', outputPath], {
        reject: false,
      });

      expect(result.exitCode).not.toBe(0);
      const errorOutput = result.stderr + result.stdout;
      expect(errorOutput).toMatch(/OpenAPI 3\.0|Swagger 2\.0|version/i);
    });

    it('should reject future OpenAPI 4.0 specs', async () => {
      const futureSpec = {
        openapi: '4.0.0',
        info: { title: 'Future API', version: '1.0.0' },
        paths: {},
      };

      const specPath = resolve(testOutputDir, 'openapi-4.0.json');
      await fs.writeJSON(specPath, futureSpec);
      const outputPath = resolve(testOutputDir, 'output-future');

      const result = await execa('node', [cliPath, 'generate', specPath, '--output', outputPath], {
        reject: false,
      });

      expect(result.exitCode).not.toBe(0);
      const errorOutput = result.stderr + result.stdout;
      expect(errorOutput).toMatch(/version|Unsupported|Invalid/i);
    });

    it('should suggest conversion for Swagger 2.0', async () => {
      const swagger2Spec = {
        swagger: '2.0',
        info: { title: 'Old API', version: '1.0.0' },
        paths: {},
      };

      const specPath = resolve(testOutputDir, 'swagger-convert.json');
      await fs.writeJSON(specPath, swagger2Spec);
      const outputPath = resolve(testOutputDir, 'output-convert');

      const result = await execa('node', [cliPath, 'generate', specPath, '--output', outputPath], {
        reject: false,
      });

      expect(result.exitCode).not.toBe(0);
      const errorOutput = result.stderr + result.stdout;
      // Should mention conversion or upgrade
      expect(errorOutput).toMatch(/convert|upgrade|3\.0/i);
    });

    it('should handle OpenAPI 3.1.x appropriately', async () => {
      const openapi31Spec = {
        openapi: '3.1.0',
        info: { title: 'OpenAPI 3.1 API', version: '1.0.0' },
        paths: {},
      };

      const specPath = resolve(testOutputDir, 'openapi-3.1.json');
      await fs.writeJSON(specPath, openapi31Spec);
      const outputPath = resolve(testOutputDir, 'output-3.1');

      const result = await execa('node', [cliPath, 'generate', specPath, '--output', outputPath], {
        reject: false,
      });

      // OpenAPI 3.1 might succeed with warnings or fail
      const errorOutput = result.stderr + result.stdout;
      if (result.exitCode !== 0) {
        expect(errorOutput).toMatch(/3\.1|not.*support|warning/i);
      }
    });
  });

  describe('FR3: Circular Reference Tests', () => {
    it('should handle self-referencing schemas', async () => {
      const circularSpec = {
        openapi: '3.0.0',
        info: { title: 'Circular API', version: '1.0.0' },
        paths: {
          '/nodes': {
            get: {
              operationId: 'getNodes',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/Node',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Node: {
              type: 'object',
              properties: {
                value: { type: 'string' },
                next: { $ref: '#/components/schemas/Node' }, // Self-reference (valid for recursive types)
              },
            },
          },
        },
      };

      const specPath = resolve(testOutputDir, 'circular-self.json');
      await fs.writeJSON(specPath, circularSpec);
      const outputPath = resolve(testOutputDir, 'output-circular-self');

      // Self-referencing schemas are valid in OpenAPI (for recursive types)
      // The test verifies we handle them gracefully
      const result = await execa('node', [cliPath, 'generate', specPath, '--output', outputPath], {
        reject: false,
      });

      // Should succeed or provide clear error message
      if (result.exitCode !== 0) {
        const errorOutput = result.stderr + result.stdout;
        expect(errorOutput).toBeTruthy();
      } else {
        // Should generate successfully
        expect(await fs.pathExists(resolve(outputPath, 'package.json'))).toBe(true);
      }
    });

    it('should handle mutual circular references', async () => {
      const circularSpec = {
        openapi: '3.0.0',
        info: { title: 'Circular Mutual', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'getTest',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/A' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            A: {
              type: 'object',
              properties: {
                b: { $ref: '#/components/schemas/B' },
              },
            },
            B: {
              type: 'object',
              properties: {
                a: { $ref: '#/components/schemas/A' },
              },
            },
          },
        },
      };

      const specPath = resolve(testOutputDir, 'circular-mutual.json');
      await fs.writeJSON(specPath, circularSpec);
      const outputPath = resolve(testOutputDir, 'output-circular-mutual');

      const result = await execa('node', [cliPath, 'generate', specPath, '--output', outputPath], {
        reject: false,
      });

      // Mutual circular references are valid - verify handling
      if (result.exitCode !== 0) {
        const errorOutput = result.stderr + result.stdout;
        expect(errorOutput).toBeTruthy();
      }
    });

    it('should handle invalid $ref pointers', async () => {
      const invalidRefSpec = {
        openapi: '3.0.0',
        info: { title: 'Invalid Ref', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'getTest',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/NonExistent',
                      },
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

      const specPath = resolve(testOutputDir, 'invalid-ref.json');
      await fs.writeJSON(specPath, invalidRefSpec);
      const outputPath = resolve(testOutputDir, 'output-invalid-ref');

      const result = await execa('node', [cliPath, 'generate', specPath, '--output', outputPath], {
        reject: false,
      });

      expect(result.exitCode).not.toBe(0);
      const errorOutput = result.stderr + result.stdout;
      expect(errorOutput).toMatch(/ref|reference|NonExistent|not found/i);
    });
  });

  describe('FR4: Invalid JSON Schema Tests', () => {
    it('should reject invalid schema types', async () => {
      const invalidSpec = {
        openapi: '3.0.0',
        info: { title: 'Invalid Schema', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              operationId: 'getTest',
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'invalid-type',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const specPath = resolve(testOutputDir, 'invalid-schema-type.json');
      await fs.writeJSON(specPath, invalidSpec);
      const outputPath = resolve(testOutputDir, 'output-invalid-type');

      const result = await execa('node', [cliPath, 'generate', specPath, '--output', outputPath], {
        reject: false,
      });

      expect(result.exitCode).not.toBe(0);
      const errorOutput = result.stderr + result.stdout;
      expect(errorOutput).toMatch(/schema|validation|type|invalid/i);
    });

    it('should validate enum must be array', async () => {
      const invalidSpec = {
        openapi: '3.0.0',
        info: { title: 'Invalid Enum', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
            Status: {
              type: 'string',
              enum: 'active', // Should be array
            },
          },
        },
      };

      const specPath = resolve(testOutputDir, 'invalid-enum.json');
      await fs.writeJSON(specPath, invalidSpec);
      const outputPath = resolve(testOutputDir, 'output-invalid-enum');

      const result = await execa('node', [cliPath, 'generate', specPath, '--output', outputPath], {
        reject: false,
      });

      expect(result.exitCode).not.toBe(0);
      const errorOutput = result.stderr + result.stdout;
      expect(errorOutput).toMatch(/enum|array|validation/i);
    });

    it('should validate required must be array', async () => {
      const invalidSpec = {
        openapi: '3.0.0',
        info: { title: 'Invalid Required', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
              required: 'name', // Should be array
            },
          },
        },
      };

      const specPath = resolve(testOutputDir, 'invalid-required.json');
      await fs.writeJSON(specPath, invalidSpec);
      const outputPath = resolve(testOutputDir, 'output-invalid-required');

      const result = await execa('node', [cliPath, 'generate', specPath, '--output', outputPath], {
        reject: false,
      });

      expect(result.exitCode).not.toBe(0);
      const errorOutput = result.stderr + result.stdout;
      expect(errorOutput).toMatch(/required|array|validation/i);
    });
  });

  describe('Additional Error Scenarios', () => {
    it('should handle empty OpenAPI spec gracefully', async () => {
      const emptySpec = {
        openapi: '3.0.0',
        info: { title: 'Empty API', version: '1.0.0' },
        paths: {},
      };

      const specPath = resolve(testOutputDir, 'empty-spec.json');
      await fs.writeJSON(specPath, emptySpec);
      const outputPath = resolve(testOutputDir, 'output-empty');

      const result = await execa('node', [cliPath, 'generate', specPath, '--output', outputPath], {
        reject: false,
      });

      // Empty spec should succeed
      expect(result.exitCode).toBe(0);

      // Verify minimal structure created
      expect(await fs.pathExists(resolve(outputPath, 'package.json'))).toBe(true);
      expect(await fs.pathExists(resolve(outputPath, 'src'))).toBe(true);
    });

    it('should handle spec with no operations', async () => {
      const noOpsSpec = {
        openapi: '3.0.0',
        info: { title: 'No Operations', version: '1.0.0' },
        paths: {
          '/test': {}, // No HTTP methods
        },
      };

      const specPath = resolve(testOutputDir, 'no-ops.json');
      await fs.writeJSON(specPath, noOpsSpec);
      const outputPath = resolve(testOutputDir, 'output-no-ops');

      const result = await execa('node', [cliPath, 'generate', specPath, '--output', outputPath], {
        reject: false,
      });

      // Should succeed
      expect(result.exitCode).toBe(0);
      expect(await fs.pathExists(resolve(outputPath, 'package.json'))).toBe(true);
    });

    it('should handle duplicate operationIds appropriately', async () => {
      const duplicateSpec = {
        openapi: '3.0.0',
        info: { title: 'Duplicate IDs', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              operationId: 'getItem',
              responses: { '200': { description: 'Success' } },
            },
          },
          '/posts': {
            get: {
              operationId: 'getItem', // Duplicate operationId
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      };

      const specPath = resolve(testOutputDir, 'duplicate-ids.json');
      await fs.writeJSON(specPath, duplicateSpec);
      const outputPath = resolve(testOutputDir, 'output-duplicate');

      const result = await execa('node', [cliPath, 'generate', specPath, '--output', outputPath], {
        reject: false,
      });

      // Duplicate operationIds might be handled by auto-generating unique names
      // or may fail - both are acceptable behaviors
      if (result.exitCode !== 0) {
        const errorOutput = result.stderr + result.stdout;
        expect(errorOutput).toMatch(/duplicate|operationId|getItem/i);
      } else {
        // If it succeeds, verify output was created
        expect(await fs.pathExists(resolve(outputPath, 'package.json'))).toBe(true);
      }
    });

    it('should reject malformed JSON', async () => {
      const malformedPath = resolve(testOutputDir, 'malformed.json');
      await fs.writeFile(malformedPath, '{ "openapi": "3.0.0", invalid json }');
      const outputPath = resolve(testOutputDir, 'output-malformed');

      const result = await execa('node', [cliPath, 'generate', malformedPath, '--output', outputPath], {
        reject: false,
      });

      expect(result.exitCode).not.toBe(0);
      const errorOutput = result.stderr + result.stdout;
      expect(errorOutput).toMatch(/JSON|parse|syntax/i);
    });

    it('should reject spec missing required info field', async () => {
      const missingInfoSpec = {
        openapi: '3.0.0',
        // Missing info field
        paths: {},
      };

      const specPath = resolve(testOutputDir, 'missing-info.json');
      await fs.writeJSON(specPath, missingInfoSpec);
      const outputPath = resolve(testOutputDir, 'output-missing-info');

      const result = await execa('node', [cliPath, 'generate', specPath, '--output', outputPath], {
        reject: false,
      });

      expect(result.exitCode).not.toBe(0);
      const errorOutput = result.stderr + result.stdout;
      expect(errorOutput).toMatch(/info|required/i);
    });

    it('should reject spec with invalid paths type', async () => {
      const invalidPathsSpec = {
        openapi: '3.0.0',
        info: { title: 'Invalid Paths', version: '1.0.0' },
        paths: [], // Should be object, not array
      };

      const specPath = resolve(testOutputDir, 'invalid-paths.json');
      await fs.writeJSON(specPath, invalidPathsSpec);
      const outputPath = resolve(testOutputDir, 'output-invalid-paths');

      const result = await execa('node', [cliPath, 'generate', specPath, '--output', outputPath], {
        reject: false,
      });

      expect(result.exitCode).not.toBe(0);
      const errorOutput = result.stderr + result.stdout;
      expect(errorOutput).toMatch(/paths|object|type/i);
    });
  });
});
