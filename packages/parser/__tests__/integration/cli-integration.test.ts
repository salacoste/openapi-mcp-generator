/**
 * Integration tests for CLI and parser integration
 */

import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { loadOpenAPIDocument } from '../../src/index.js';

const FIXTURES_DIR = join(__dirname, '../fixtures/valid');

describe('CLI Integration', () => {
  it('should load OpenAPI document in CLI workflow', async () => {
    // Simulate CLI generate command workflow
    const openapiPath = join(FIXTURES_DIR, 'petstore.json');

    // Step 1: Load OpenAPI document (Story 2.1)
    const result = await loadOpenAPIDocument(openapiPath);

    // Verify document loaded
    expect(result).toBeDefined();
    expect(result.document).toBeDefined();
    expect(result.document.openapi).toMatch(/^3\.0\.\d+$/);
    expect(result.format).toBe('json');

    // Verify document structure for future processing
    expect(result.document.info).toBeDefined();
    expect(result.document.info.title).toBe('Petstore API');
    expect(result.document.paths).toBeDefined();
  });

  it('should load YAML OpenAPI document in CLI workflow', async () => {
    const openapiPath = join(FIXTURES_DIR, 'petstore.yaml');

    const result = await loadOpenAPIDocument(openapiPath);

    expect(result.document.openapi).toBe('3.0.0');
    expect(result.format).toBe('yaml');
  });
});
