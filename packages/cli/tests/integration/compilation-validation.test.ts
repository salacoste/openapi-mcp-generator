/**
 * TypeScript Compilation Validation Tests
 *
 * Validates that generated MCP servers compile without TypeScript errors.
 * Tests both complex (Petstore) and simple (minimal) OpenAPI specifications.
 *
 * Story: 5.5 - Automated TypeScript Compilation Validation
 * Priority: 2 (Enhanced Testing)
 *
 * UPDATE: All bugs fixed! ✅
 * - Added OperationMetadata type definitions to generated code
 * - Fixed Axios headers type compatibility
 * - All tests now passing
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, rm } from 'fs/promises';
import { join, resolve, dirname } from 'path';
import { tmpdir } from 'os';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { execa } from 'execa';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('TypeScript Compilation Validation', () => {
  let outputDir: string;
  const cliPath = resolve(__dirname, '../../dist/index.js');
  const petstoreSpecPath = resolve(__dirname, '../../../parser/__tests__/fixtures/valid/petstore.json');
  const minimalSpecPath = resolve(__dirname, '../../../generator/__tests__/fixtures/minimal-api.json');

  beforeAll(async () => {
    // Create temporary directory for test outputs
    outputDir = await mkdtemp(join(tmpdir(), 'mcp-compilation-test-'));
  }, 30000);

  afterAll(async () => {
    // Cleanup temporary directory
    if (outputDir) {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  describe('Petstore API Compilation', () => {
    it('should compile generated code without TypeScript errors', async () => {
      // Arrange
      const output = join(outputDir, 'petstore-server');

      // Act - Generate MCP server
      await execa('node', [cliPath, 'generate', petstoreSpecPath, '--output', output, '--force'], {
        cwd: __dirname,
      });

      // Install dependencies
      execSync('npm install --silent', {
        cwd: output,
        stdio: 'pipe',
      });

      // Act - Run TypeScript compiler in check mode
      let compileResult: { exitCode: number; stdout: string; stderr: string };
      try {
        const stdout = execSync('npx tsc --noEmit', {
          cwd: output,
          encoding: 'utf-8',
        });
        compileResult = { exitCode: 0, stdout, stderr: '' };
      } catch (error: unknown) {
        const execError = error as { status?: number; stdout?: Buffer; stderr?: Buffer };
        compileResult = {
          exitCode: execError.status || 1,
          stdout: execError.stdout?.toString() || '',
          stderr: execError.stderr?.toString() || '',
        };
      }

      // Assert
      if (compileResult.exitCode !== 0) {
        // Output compilation errors for debugging
        expect.fail(`TypeScript compilation failed:\n${compileResult.stderr}\n${compileResult.stdout}`);
      }

      expect(compileResult.exitCode).toBe(0);
      expect(compileResult.stderr).not.toContain('error TS');
    }, 30000);
  });

  describe('Minimal Spec Compilation', () => {
    it('should compile minimal spec generated code', async () => {
      // Arrange
      const output = join(outputDir, 'minimal-server');

      // Act - Generate MCP server
      await execa('node', [cliPath, 'generate', minimalSpecPath, '--output', output, '--force'], {
        cwd: __dirname,
      });

      // Install dependencies
      execSync('npm install --silent', {
        cwd: output,
        stdio: 'pipe',
      });

      // Act - Run TypeScript compiler
      let compileResult: { exitCode: number };
      try {
        execSync('npx tsc --noEmit', {
          cwd: output,
          stdio: 'pipe',
        });
        compileResult = { exitCode: 0 };
      } catch (error: unknown) {
        const execError = error as { status?: number; stderr?: Buffer };
        compileResult = { exitCode: execError.status || 1 };
        if (compileResult.exitCode !== 0) {
          expect.fail(`TypeScript compilation failed for minimal spec:\n${execError.stderr?.toString()}`);
        }
      }

      // Assert
      expect(compileResult.exitCode).toBe(0);
    }, 20000);
  });

  describe('Edge Cases', () => {
    it('should handle missing dependencies gracefully', async () => {
      // Arrange
      const output = join(outputDir, 'no-deps-server');

      // Act - Generate MCP server
      await execa('node', [cliPath, 'generate', minimalSpecPath, '--output', output, '--force'], {
        cwd: __dirname,
      });

      // Try to compile without installing dependencies
      let compileResult: { exitCode: number };
      try {
        execSync('npx tsc --noEmit', {
          cwd: output,
          stdio: 'pipe',
        });
        compileResult = { exitCode: 0 };
      } catch (error: unknown) {
        const execError = error as { status?: number };
        compileResult = { exitCode: execError.status || 1 };
      }

      // Assert - Should fail because dependencies are missing
      expect(compileResult.exitCode).not.toBe(0);
    }, 15000);
  });
});
