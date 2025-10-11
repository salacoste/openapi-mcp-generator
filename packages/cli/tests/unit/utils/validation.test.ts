import { describe, test, expect, afterEach } from 'vitest';
import fs from 'fs-extra';
import { validateOutputDirectory, validateGeneratedCode, ValidationError } from '../../../src/utils/validation.js';

describe('validateOutputDirectory', () => {
  const testDir = '/tmp/validation-test';

  afterEach(async () => {
    await fs.remove(testDir);
  });

  test('throws error if directory exists without force', async () => {
    await fs.ensureDir(testDir);

    await expect(
      validateOutputDirectory(testDir, false)
    ).rejects.toThrow(ValidationError);
  });

  test('succeeds if directory exists with force', async () => {
    await fs.ensureDir(testDir);

    await expect(
      validateOutputDirectory(testDir, true)
    ).resolves.not.toThrow();
  });

  test('succeeds if directory does not exist', async () => {
    await expect(
      validateOutputDirectory(testDir, false)
    ).resolves.not.toThrow();
  });

  test('includes suggestion in error', async () => {
    await fs.ensureDir(testDir);

    try {
      await validateOutputDirectory(testDir, false);
      expect.fail('Should have thrown ValidationError');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).suggestion).toContain('--force');
    }
  });

  test('throws error if parent directory does not exist', async () => {
    const nonExistentParent = '/tmp/non-existent-parent-dir/child';

    await expect(
      validateOutputDirectory(nonExistentParent, false)
    ).rejects.toThrow(/Parent directory does not exist/);
  });
});

describe('validateGeneratedCode', () => {
  const testDir = '/tmp/validation-code-test';

  afterEach(async () => {
    await fs.remove(testDir);
  });

  test('returns valid: false when required files are missing', async () => {
    await fs.ensureDir(testDir);

    const result = await validateGeneratedCode(testDir);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Missing required file');
  });

  test('returns valid: true when all required files exist', async () => {
    await fs.ensureDir(testDir);

    // Create required files
    await fs.ensureDir(`${testDir}/src`);
    await fs.writeFile(`${testDir}/src/index.ts`, 'console.log("MCP server"); '.repeat(10));
    await fs.writeFile(`${testDir}/src/types.ts`, 'export interface Test {}');
    await fs.writeFile(`${testDir}/src/tools.ts`, 'export const tools = []');
    await fs.writeFile(`${testDir}/src/http-client.ts`, 'import axios from "axios"');
    await fs.writeFile(`${testDir}/package.json`, '{}');
    await fs.writeFile(`${testDir}/tsconfig.json`, '{}');

    const result = await validateGeneratedCode(testDir);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('detects unresolved template variables', async () => {
    await fs.ensureDir(testDir);
    await fs.ensureDir(`${testDir}/src`);

    // Create files with template variables
    await fs.writeFile(`${testDir}/src/index.ts`, 'const value = {{unresolved}}; '.repeat(10));
    await fs.writeFile(`${testDir}/src/types.ts`, 'export interface Test {}');
    await fs.writeFile(`${testDir}/src/tools.ts`, 'export const tools = []');
    await fs.writeFile(`${testDir}/src/http-client.ts`, 'import axios from "axios"');
    await fs.writeFile(`${testDir}/package.json`, '{}');
    await fs.writeFile(`${testDir}/tsconfig.json`, '{}');

    const result = await validateGeneratedCode(testDir);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Generated code contains unresolved template variables');
  });

  test('detects incomplete generated files', async () => {
    await fs.ensureDir(testDir);
    await fs.ensureDir(`${testDir}/src`);

    // Create incomplete index.ts
    await fs.writeFile(`${testDir}/src/index.ts`, 'short');
    await fs.writeFile(`${testDir}/src/types.ts`, 'export interface Test {}');
    await fs.writeFile(`${testDir}/src/tools.ts`, 'export const tools = []');
    await fs.writeFile(`${testDir}/src/http-client.ts`, 'import axios from "axios"');
    await fs.writeFile(`${testDir}/package.json`, '{}');
    await fs.writeFile(`${testDir}/tsconfig.json`, '{}');

    const result = await validateGeneratedCode(testDir);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Generated index.ts appears incomplete');
  });
});
