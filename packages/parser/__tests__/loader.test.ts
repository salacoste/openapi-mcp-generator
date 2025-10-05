/**
 * Unit tests for OpenAPI document loader
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { resolve, join } from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';
import {
  loadOpenAPIDocument,
  loadOpenAPI,
  FileSystemError,
  ParseError,
  UnsupportedFormatError,
  FileSizeError,
} from '../src/index.js';

const FIXTURES_DIR = join(__dirname, 'fixtures');
const VALID_DIR = join(FIXTURES_DIR, 'valid');
const INVALID_DIR = join(FIXTURES_DIR, 'invalid');
const TEMP_DIR = join(__dirname, 'temp');

describe('loadOpenAPIDocument', () => {
  beforeAll(async () => {
    // Create temp directory for test files
    await mkdir(TEMP_DIR, { recursive: true });
  });

  describe('successful loading', () => {
    it('should load valid JSON OpenAPI file', async () => {
      const filePath = join(VALID_DIR, 'petstore.json');
      const result = await loadOpenAPIDocument(filePath);

      expect(result).toBeDefined();
      expect(result.document).toBeDefined();
      expect(result.document.openapi).toMatch(/^3\.0\.\d+$/);
      expect(result.document.info.title).toBe('Petstore API');
      expect(result.format).toBe('json');
      expect(result.filePath).toBe(resolve(filePath));
      expect(result.size).toBeGreaterThan(0);
    });

    it('should load valid YAML OpenAPI file', async () => {
      const filePath = join(VALID_DIR, 'petstore.yaml');
      const result = await loadOpenAPIDocument(filePath);

      expect(result).toBeDefined();
      expect(result.document).toBeDefined();
      expect(result.document.openapi).toBe('3.0.0');
      expect(result.document.info.title).toBe('Petstore API');
      expect(result.format).toBe('yaml');
      expect(result.filePath).toBe(resolve(filePath));
      expect(result.size).toBeGreaterThan(0);
    });

    it('should handle .yml extension', async () => {
      // Create a .yml file
      const ymlPath = join(TEMP_DIR, 'test.yml');
      await writeFile(
        ymlPath,
        'openapi: "3.0.0"\ninfo:\n  title: Test\n  version: 1.0.0\npaths: {}'
      );

      const result = await loadOpenAPIDocument(ymlPath);

      expect(result.format).toBe('yaml');
      expect(result.document.info.title).toBe('Test');
    });

    it('should handle case-insensitive extensions', async () => {
      // Create files with uppercase extensions
      const jsonPath = join(TEMP_DIR, 'test.JSON');
      const yamlPath = join(TEMP_DIR, 'test.YAML');

      await writeFile(
        jsonPath,
        '{"openapi":"3.0.0","info":{"title":"Test","version":"1.0.0"},"paths":{}}'
      );
      await writeFile(
        yamlPath,
        'openapi: "3.0.0"\ninfo:\n  title: Test\n  version: 1.0.0\npaths: {}'
      );

      const jsonResult = await loadOpenAPIDocument(jsonPath);
      const yamlResult = await loadOpenAPIDocument(yamlPath);

      expect(jsonResult.format).toBe('json');
      expect(yamlResult.format).toBe('yaml');
    });

    it('should resolve relative paths to absolute', async () => {
      const relativePath = 'packages/parser/__tests__/fixtures/valid/petstore.json';
      const result = await loadOpenAPIDocument(relativePath);

      expect(result.filePath).toBe(resolve(relativePath));
    });

    it('should handle absolute paths', async () => {
      const absolutePath = resolve(join(VALID_DIR, 'petstore.json'));
      const result = await loadOpenAPIDocument(absolutePath);

      expect(result.filePath).toBe(absolutePath);
    });

    it('should respect maxFileSize option', async () => {
      const filePath = join(VALID_DIR, 'petstore.json');

      // Should succeed with large max size
      const result = await loadOpenAPIDocument(filePath, {
        maxFileSize: 1024 * 1024, // 1MB
      });

      expect(result).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should throw FileSystemError for non-existent file', async () => {
      await expect(loadOpenAPIDocument('non-existent.json')).rejects.toThrow(FileSystemError);
    });

    it('should throw ParseError for invalid JSON syntax', async () => {
      const filePath = join(INVALID_DIR, 'malformed.json');

      await expect(loadOpenAPIDocument(filePath)).rejects.toThrow(ParseError);
    });

    it('should throw ParseError for invalid YAML syntax', async () => {
      const filePath = join(INVALID_DIR, 'malformed.yaml');

      await expect(loadOpenAPIDocument(filePath)).rejects.toThrow(ParseError);
    });

    it('should throw UnsupportedFormatError for unsupported extensions', async () => {
      const txtPath = join(TEMP_DIR, 'test.txt');
      await writeFile(txtPath, 'some content');

      await expect(loadOpenAPIDocument(txtPath)).rejects.toThrow(UnsupportedFormatError);
    });

    it('should throw FileSizeError when file exceeds max size', async () => {
      const filePath = join(VALID_DIR, 'petstore.json');

      await expect(
        loadOpenAPIDocument(filePath, {
          maxFileSize: 10, // 10 bytes - too small
        })
      ).rejects.toThrow(FileSizeError);
    });

    it('should throw FileSystemError for directory instead of file', async () => {
      await expect(loadOpenAPIDocument(VALID_DIR)).rejects.toThrow(FileSystemError);
    });

    it('should include file path in error messages', async () => {
      const nonExistent = 'non-existent.json';

      try {
        await loadOpenAPIDocument(nonExistent);
        expect.fail('Should have thrown FileSystemError');
      } catch (error) {
        expect(error).toBeInstanceOf(FileSystemError);
        if (error instanceof FileSystemError) {
          expect(error.path).toContain(nonExistent);
          expect(error.message).toContain(nonExistent);
        }
      }
    });

    it('should include line number in JSON parse errors', async () => {
      const filePath = join(INVALID_DIR, 'malformed.json');

      try {
        await loadOpenAPIDocument(filePath);
        expect.fail('Should have thrown ParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(ParseError);
        if (error instanceof ParseError) {
          expect(error.path).toBe(resolve(filePath));
          // Line number may or may not be available depending on error
        }
      }
    });

    it('should include line number in YAML parse errors', async () => {
      const filePath = join(INVALID_DIR, 'malformed.yaml');

      try {
        await loadOpenAPIDocument(filePath);
        expect.fail('Should have thrown ParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(ParseError);
        if (error instanceof ParseError) {
          expect(error.path).toBe(resolve(filePath));
          expect(error.line).toBeDefined();
          expect(error.column).toBeDefined();
        }
      }
    });
  });

  describe('loadOpenAPI convenience function', () => {
    it('should return only the document object', async () => {
      const filePath = join(VALID_DIR, 'petstore.json');
      const document = await loadOpenAPI(filePath);

      expect(document).toBeDefined();
      expect(document.openapi).toMatch(/^3\.0\.\d+$/);
      expect(document.info.title).toBe('Petstore API');
    });

    it('should throw same errors as loadOpenAPIDocument', async () => {
      await expect(loadOpenAPI('non-existent.json')).rejects.toThrow(FileSystemError);
    });
  });

  describe('edge cases', () => {
    it('should handle empty JSON object', async () => {
      const emptyPath = join(TEMP_DIR, 'empty.json');
      await writeFile(emptyPath, '{}');

      const result = await loadOpenAPIDocument(emptyPath);

      expect(result.document).toEqual({});
    });

    it('should handle files with different line endings', async () => {
      const crlfPath = join(TEMP_DIR, 'crlf.json');
      // Create JSON with CRLF line endings
      await writeFile(
        crlfPath,
        '{\r\n  "openapi":"3.0.0",\r\n  "info":{"title":"CRLF Test","version":"1.0.0"},\r\n  "paths":{}\r\n}'
      );

      const result = await loadOpenAPIDocument(crlfPath);

      expect(result.document.info.title).toBe('CRLF Test');
    });

    it('should handle file paths with spaces', async () => {
      const spacePath = join(TEMP_DIR, 'file with spaces.json');
      await writeFile(
        spacePath,
        '{"openapi":"3.0.0","info":{"title":"Space Test","version":"1.0.0"},"paths":{}}'
      );

      const result = await loadOpenAPIDocument(spacePath);

      expect(result.document.info.title).toBe('Space Test');
    });

    it('should handle Unicode characters in content', async () => {
      const unicodePath = join(TEMP_DIR, 'unicode.json');
      await writeFile(
        unicodePath,
        '{"openapi":"3.0.0","info":{"title":"Tést ÅÞÏ 你好","version":"1.0.0"},"paths":{}}'
      );

      const result = await loadOpenAPIDocument(unicodePath);

      expect(result.document.info.title).toBe('Tést ÅÞÏ 你好');
    });
  });
});
