/**
 * Unit tests for error handler utilities
 */

import { describe, it, expect } from 'vitest';
import {
  handleNetworkError,
  handleYAMLParseError,
  handleTimeoutError,
  handleUnsupportedVersion,
  handleMissingDependency,
  handleCircularReference,
  handleParserError,
  handleFileSystemError,
} from '../../../src/utils/error-handlers.js';
import { ValidationError } from '../../../src/utils/validation.js';

describe('Error Handlers', () => {
  describe('handleNetworkError', () => {
    it('should handle timeout errors', () => {
      const error = new Error('timeout of 5000ms exceeded');
      expect(() => handleNetworkError(error, 'http://example.com')).toThrow(
        ValidationError
      );
      expect(() => handleNetworkError(error, 'http://example.com')).toThrow(
        /Network timeout while fetching/
      );
    });

    it('should handle connection refused errors', () => {
      const error = new Error('ECONNREFUSED');
      expect(() =>
        handleNetworkError(error, 'http://localhost:9999')
      ).toThrow(ValidationError);
      expect(() =>
        handleNetworkError(error, 'http://localhost:9999')
      ).toThrow(/Cannot connect to/);
    });

    it('should handle ENOTFOUND errors', () => {
      const error = new Error('ENOTFOUND invalid.example.com');
      expect(() =>
        handleNetworkError(error, 'http://invalid.example.com')
      ).toThrow(ValidationError);
      expect(() =>
        handleNetworkError(error, 'http://invalid.example.com')
      ).toThrow(/Cannot connect to/);
    });

    it('should handle generic network errors', () => {
      const error = new Error('Network unreachable');
      expect(() => handleNetworkError(error, 'http://example.com')).toThrow(
        ValidationError
      );
      expect(() => handleNetworkError(error, 'http://example.com')).toThrow(
        /Network error fetching/
      );
    });

    it('should work without URL', () => {
      const error = new Error('timeout');
      expect(() => handleNetworkError(error)).toThrow(ValidationError);
      expect(() => handleNetworkError(error)).toThrow(/Network timeout/);
    });
  });

  describe('handleYAMLParseError', () => {
    it('should format YAML syntax errors with line/column', () => {
      const error = {
        mark: { line: 5, column: 10 },
      };
      expect(() => handleYAMLParseError(error, 'test.yaml')).toThrow(
        ValidationError
      );
      try {
        handleYAMLParseError(error, 'test.yaml');
      } catch (err) {
        expect(err).toBeInstanceOf(ValidationError);
        expect((err as ValidationError).suggestion).toContain('line 6, column 11');
      }
    });

    it('should handle generic YAML parse errors', () => {
      const error = new Error('Invalid YAML');
      expect(() => handleYAMLParseError(error, 'test.yaml')).toThrow(
        ValidationError
      );
      expect(() => handleYAMLParseError(error, 'test.yaml')).toThrow(
        /Failed to parse YAML file/
      );
    });

    it('should handle unknown error types', () => {
      const error = 'unknown error';
      expect(() => handleYAMLParseError(error, 'test.yaml')).toThrow(
        ValidationError
      );
    });
  });

  describe('handleTimeoutError', () => {
    it('should format timeout errors with suggestions', () => {
      expect(() => handleTimeoutError('API fetch', 5000)).toThrow(
        ValidationError
      );
      expect(() => handleTimeoutError('API fetch', 5000)).toThrow(
        /Operation timed out: API fetch/
      );
    });

    it('should suggest doubling timeout', () => {
      try {
        handleTimeoutError('generation', 10000);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).command).toContain('20000ms');
      }
    });
  });

  describe('handleUnsupportedVersion', () => {
    it('should reject unsupported versions', () => {
      expect(() => handleUnsupportedVersion('2.0')).toThrow(ValidationError);
      expect(() => handleUnsupportedVersion('2.0')).toThrow(
        /Unsupported OpenAPI version/
      );
    });

    it('should list supported versions', () => {
      try {
        handleUnsupportedVersion('3.1.0');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).command).toContain('3.0.0');
        expect((error as ValidationError).command).toContain('3.0.3');
      }
    });

    it('should provide conversion URL', () => {
      try {
        handleUnsupportedVersion('4.0.0');
      } catch (error) {
        expect((error as ValidationError).command).toContain('converter.swagger.io');
      }
    });
  });

  describe('handleMissingDependency', () => {
    it('should provide install command for known dependencies', () => {
      try {
        handleMissingDependency('axios');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).command).toContain('npm install axios');
      }
    });

    it('should provide install command for unknown dependencies', () => {
      try {
        handleMissingDependency('unknown-package');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).command).toContain(
          'npm install unknown-package'
        );
      }
    });

    it('should handle MCP SDK dependency', () => {
      try {
        handleMissingDependency('@modelcontextprotocol/sdk');
      } catch (error) {
        expect((error as ValidationError).command).toContain(
          'npm install @modelcontextprotocol/sdk'
        );
      }
    });
  });

  describe('handleCircularReference', () => {
    it('should format circular reference path', () => {
      const refPath = ['Schema1', 'Schema2', 'Schema3', 'Schema1'];
      expect(() => handleCircularReference(refPath)).toThrow(ValidationError);
      expect(() => handleCircularReference(refPath)).toThrow(
        /Circular reference detected/
      );
    });

    it('should show full reference cycle', () => {
      const refPath = ['A', 'B', 'C', 'A'];
      try {
        handleCircularReference(refPath);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).command).toContain('A -> B -> C -> A');
      }
    });
  });

  describe('handleParserError', () => {
    it('should handle invalid version errors', () => {
      const error = new Error('Invalid OpenAPI version');
      expect(() => handleParserError(error)).toThrow(ValidationError);
      expect(() => handleParserError(error)).toThrow(/Unsupported OpenAPI version/);
    });

    it('should handle missing operationId errors', () => {
      const error = new Error('Missing operationId');
      expect(() => handleParserError(error)).toThrow(ValidationError);
      expect(() => handleParserError(error)).toThrow(/operationId/);
    });

    it('should handle reference errors', () => {
      const error = new Error('Failed to resolve $ref');
      expect(() => handleParserError(error)).toThrow(ValidationError);
      expect(() => handleParserError(error)).toThrow(/schema reference/);
    });

    it('should handle generic parser errors', () => {
      const error = new Error('Unknown parse error');
      expect(() => handleParserError(error)).toThrow(ValidationError);
      expect(() => handleParserError(error)).toThrow(/OpenAPI parsing failed/);
    });
  });

  describe('handleFileSystemError', () => {
    it('should handle permission denied errors', () => {
      const error = new Error('EACCES') as NodeJS.ErrnoException;
      error.code = 'EACCES';
      expect(() => handleFileSystemError(error, '/test/path')).toThrow(
        ValidationError
      );
      expect(() => handleFileSystemError(error, '/test/path')).toThrow(
        /Permission denied/
      );
    });

    it('should handle path not found errors', () => {
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      expect(() => handleFileSystemError(error, '/missing/path')).toThrow(
        ValidationError
      );
      expect(() => handleFileSystemError(error, '/missing/path')).toThrow(
        /Path does not exist/
      );
    });

    it('should handle no space left errors', () => {
      const error = new Error('ENOSPC') as NodeJS.ErrnoException;
      error.code = 'ENOSPC';
      expect(() => handleFileSystemError(error, '/path')).toThrow(ValidationError);
      expect(() => handleFileSystemError(error, '/path')).toThrow(/No space left/);
    });

    it('should handle too many files errors', () => {
      const error = new Error('EMFILE') as NodeJS.ErrnoException;
      error.code = 'EMFILE';
      expect(() => handleFileSystemError(error, '/path')).toThrow(ValidationError);
      expect(() => handleFileSystemError(error, '/path')).toThrow(/Too many open files/);
    });

    it('should handle directory instead of file errors', () => {
      const error = new Error('EISDIR') as NodeJS.ErrnoException;
      error.code = 'EISDIR';
      expect(() => handleFileSystemError(error, '/dir')).toThrow(ValidationError);
      expect(() => handleFileSystemError(error, '/dir')).toThrow(
        /Expected file but found directory/
      );
    });
  });
});
