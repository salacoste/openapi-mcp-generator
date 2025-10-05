/**
 * Unit tests for file system utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { tmpdir } from 'os';
import { join } from 'path';
import { mkdtemp, rm, writeFile as fsWriteFile, mkdir } from 'fs/promises';
import fs from 'fs-extra';
import {
  createDirectory,
  writeFile,
  copyTemplate,
  validateOutputStructure,
  checkOutputDirectory,
  FileSystemError,
} from '../src/fs-utils.js';

describe('fs-utils', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create a unique temp directory for each test
    testDir = await mkdtemp(join(tmpdir(), 'generator-test-'));
  });

  afterEach(async () => {
    // Clean up test directory
    await rm(testDir, { recursive: true, force: true });
  });

  describe('createDirectory', () => {
    it('should create directory with parent directories', async () => {
      const nestedPath = join(testDir, 'a', 'b', 'c');
      await createDirectory(nestedPath);

      const exists = await fs.pathExists(nestedPath);
      expect(exists).toBe(true);
    });

    it('should handle existing directories gracefully', async () => {
      const dirPath = join(testDir, 'existing');
      await createDirectory(dirPath);

      // Should not throw when directory already exists
      await expect(createDirectory(dirPath)).resolves.not.toThrow();
    });

    it('should use absolute paths', async () => {
      const relativePath = 'relative/path';
      // This will create directory relative to current working directory
      // but fs-utils should convert it to absolute
      await createDirectory(relativePath);

      // Clean up - using absolute path
      const absolutePath = join(process.cwd(), relativePath);
      await rm(absolutePath, { recursive: true, force: true });
    });
  });

  describe('writeFile', () => {
    it('should write string content with UTF-8 encoding', async () => {
      const filePath = join(testDir, 'test.txt');
      const content = 'Hello, World! 🌍';

      await writeFile(filePath, content);

      const written = await fs.readFile(filePath, 'utf-8');
      expect(written).toBe(content);
    });

    it('should create parent directories automatically', async () => {
      const filePath = join(testDir, 'nested', 'dirs', 'file.txt');
      const content = 'test content';

      await writeFile(filePath, content);

      const exists = await fs.pathExists(filePath);
      expect(exists).toBe(true);

      const written = await fs.readFile(filePath, 'utf-8');
      expect(written).toBe(content);
    });

    it('should handle empty content', async () => {
      const filePath = join(testDir, 'empty.txt');
      await writeFile(filePath, '');

      const written = await fs.readFile(filePath, 'utf-8');
      expect(written).toBe('');
    });
  });

  describe('copyTemplate', () => {
    it('should copy directory contents recursively', async () => {
      // Create source template directory with files
      const sourceDir = join(testDir, 'template');
      const destDir = join(testDir, 'output');

      await mkdir(sourceDir, { recursive: true });
      await mkdir(join(sourceDir, 'subdir'), { recursive: true });
      await fsWriteFile(join(sourceDir, 'file1.txt'), 'content1');
      await fsWriteFile(join(sourceDir, 'subdir', 'file2.txt'), 'content2');

      // Copy template
      await copyTemplate(sourceDir, destDir);

      // Verify files were copied
      expect(await fs.pathExists(join(destDir, 'file1.txt'))).toBe(true);
      expect(await fs.pathExists(join(destDir, 'subdir', 'file2.txt'))).toBe(true);

      const content1 = await fs.readFile(join(destDir, 'file1.txt'), 'utf-8');
      const content2 = await fs.readFile(join(destDir, 'subdir', 'file2.txt'), 'utf-8');
      expect(content1).toBe('content1');
      expect(content2).toBe('content2');
    });

    it('should throw FileSystemError for missing source', async () => {
      const sourceDir = join(testDir, 'nonexistent');
      const destDir = join(testDir, 'output');

      await expect(copyTemplate(sourceDir, destDir)).rejects.toThrow(FileSystemError);
      await expect(copyTemplate(sourceDir, destDir)).rejects.toThrow(/not found/);
    });
  });

  describe('validateOutputStructure', () => {
    it('should return true for valid MCP server structure', async () => {
      // Create valid structure
      await mkdir(join(testDir, 'src'), { recursive: true });
      await fsWriteFile(join(testDir, 'package.json'), '{}');
      await fsWriteFile(join(testDir, 'README.md'), '# README');

      const isValid = await validateOutputStructure(testDir);
      expect(isValid).toBe(true);
    });

    it('should return false for missing src directory', async () => {
      await fsWriteFile(join(testDir, 'package.json'), '{}');
      await fsWriteFile(join(testDir, 'README.md'), '# README');

      const isValid = await validateOutputStructure(testDir);
      expect(isValid).toBe(false);
    });

    it('should return false for missing package.json', async () => {
      await mkdir(join(testDir, 'src'), { recursive: true });
      await fsWriteFile(join(testDir, 'README.md'), '# README');

      const isValid = await validateOutputStructure(testDir);
      expect(isValid).toBe(false);
    });

    it('should return false for missing README.md', async () => {
      await mkdir(join(testDir, 'src'), { recursive: true });
      await fsWriteFile(join(testDir, 'package.json'), '{}');

      const isValid = await validateOutputStructure(testDir);
      expect(isValid).toBe(false);
    });

    it('should return false for completely empty directory', async () => {
      const isValid = await validateOutputStructure(testDir);
      expect(isValid).toBe(false);
    });
  });

  describe('checkOutputDirectory', () => {
    it('should not throw for non-existent directory', async () => {
      const newDir = join(testDir, 'new');
      await expect(checkOutputDirectory(newDir, false)).resolves.not.toThrow();
    });

    it('should clear directory when force=true', async () => {
      const outputDir = join(testDir, 'output');

      // Create directory with files
      await mkdir(outputDir, { recursive: true });
      await fsWriteFile(join(outputDir, 'file1.txt'), 'content');
      await mkdir(join(outputDir, 'subdir'), { recursive: true });

      // Clear with force
      await checkOutputDirectory(outputDir, true);

      // Directory should exist but be empty
      expect(await fs.pathExists(outputDir)).toBe(true);
      const contents = await fs.readdir(outputDir);
      expect(contents).toHaveLength(0);
    });

    it('should throw FileSystemError when force=false and directory exists', async () => {
      const outputDir = join(testDir, 'output');
      await mkdir(outputDir, { recursive: true });

      await expect(checkOutputDirectory(outputDir, false)).rejects.toThrow(FileSystemError);
      await expect(checkOutputDirectory(outputDir, false)).rejects.toThrow(/already exists/);
    });
  });

  describe('verbose logging', () => {
    it('should log when VERBOSE=true', async () => {
      const originalVerbose = process.env.VERBOSE;
      process.env.VERBOSE = 'true';

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const filePath = join(testDir, 'verbose-test.txt');
      await writeFile(filePath, 'test content');

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls.some((call) => call[0].includes('[generator]'))).toBe(true);

      consoleSpy.mockRestore();
      process.env.VERBOSE = originalVerbose;
    });

    it('should not log when VERBOSE is not set', async () => {
      const originalVerbose = process.env.VERBOSE;
      delete process.env.VERBOSE;

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const filePath = join(testDir, 'silent-test.txt');
      await writeFile(filePath, 'test content');

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      process.env.VERBOSE = originalVerbose;
    });
  });

  describe('error handling', () => {
    it('should provide helpful error messages', async () => {
      const sourceDir = join(testDir, 'nonexistent');
      const destDir = join(testDir, 'output');

      try {
        await copyTemplate(sourceDir, destDir);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(FileSystemError);
        const fsError = error as FileSystemError;
        expect(fsError.message).toContain('not found');
        expect(fsError.message).toContain('Suggestion');
        expect(fsError.exitCode).toBe(1);
      }
    });

    it('should include context in errors', async () => {
      const sourceDir = join(testDir, 'nonexistent');
      const destDir = join(testDir, 'output');

      try {
        await copyTemplate(sourceDir, destDir);
        expect.fail('Should have thrown an error');
      } catch (error) {
        const fsError = error as FileSystemError;
        expect(fsError.context).toBeDefined();
        expect(fsError.context?.operation).toBe('validating source');
      }
    });
  });
});
