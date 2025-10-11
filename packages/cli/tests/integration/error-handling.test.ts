import { describe, test, expect, afterEach } from 'vitest';
import fs from 'fs-extra';
import { resolve } from 'path';
import { validateOutputDirectory, ValidationError } from '../../src/utils/validation.js';

describe('Error Handling Integration Tests', () => {
  const testBaseDir = '/tmp/cli-error-handling-tests';

  afterEach(async () => {
    // Cleanup test directories
    await fs.remove(testBaseDir);
  });

  describe('Output Directory Validation', () => {
    test('prevents overwriting existing directory without --force', async () => {
      const outputDir = resolve(testBaseDir, 'existing-dir');
      await fs.ensureDir(outputDir);

      await expect(
        validateOutputDirectory(outputDir, false)
      ).rejects.toThrow(ValidationError);

      await expect(
        validateOutputDirectory(outputDir, false)
      ).rejects.toThrow(/already exists/);
    });

    test('allows overwriting with --force flag', async () => {
      const outputDir = resolve(testBaseDir, 'existing-dir-force');
      await fs.ensureDir(outputDir);

      await expect(
        validateOutputDirectory(outputDir, true)
      ).resolves.not.toThrow();
    });

    test('validates parent directory permissions', async () => {
      const readonlyParent = resolve(testBaseDir, 'readonly');
      await fs.ensureDir(readonlyParent);
      await fs.chmod(readonlyParent, 0o444);

      const childDir = resolve(readonlyParent, 'child');

      try {
        await expect(
          validateOutputDirectory(childDir, false)
        ).rejects.toThrow(ValidationError);

        await expect(
          validateOutputDirectory(childDir, false)
        ).rejects.toThrow(/not writable/);
      } finally {
        // Restore permissions for cleanup
        await fs.chmod(readonlyParent, 0o755);
      }
    });

    test('provides actionable error messages', async () => {
      const outputDir = resolve(testBaseDir, 'actionable-test');
      await fs.ensureDir(outputDir);

      try {
        await validateOutputDirectory(outputDir, false);
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.suggestion).toBeTruthy();
        expect(validationError.suggestion).toContain('--force');
        expect(validationError.command).toBeTruthy();
      }
    });

    test('succeeds when output directory does not exist', async () => {
      // Ensure parent exists
      await fs.ensureDir(testBaseDir);
      const outputDir = resolve(testBaseDir, 'new-dir');

      await expect(
        validateOutputDirectory(outputDir, false)
      ).resolves.not.toThrow();
    });

    test('detects missing parent directory', async () => {
      const nonExistentPath = resolve('/tmp/non-existent-parent-xyz/child/nested');

      await expect(
        validateOutputDirectory(nonExistentPath, false)
      ).rejects.toThrow(/Parent directory does not exist/);
    });
  });

  describe('Validation Error Messages', () => {
    test('validation errors include suggestion field', async () => {
      const outputDir = resolve(testBaseDir, 'suggestion-test');
      await fs.ensureDir(outputDir);

      try {
        await validateOutputDirectory(outputDir, false);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const ve = error as ValidationError;
        expect(ve.suggestion).toBeDefined();
        expect(typeof ve.suggestion).toBe('string');
      }
    });

    test('validation errors include command field when applicable', async () => {
      const outputDir = resolve(testBaseDir, 'command-test');
      await fs.ensureDir(outputDir);

      try {
        await validateOutputDirectory(outputDir, false);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const ve = error as ValidationError;
        expect(ve.command).toBeDefined();
        expect(typeof ve.command).toBe('string');
      }
    });
  });
});
