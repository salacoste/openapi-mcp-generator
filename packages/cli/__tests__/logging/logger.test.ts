/**
 * Tests for logging utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import debug from 'debug';
import { Logger, createLogger, defaultLogger } from '../../src/logging/logger.js';

describe('Logger', () => {
  let originalDebugEnable: typeof debug.enable;
  let enableSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Save original debug.enable
    originalDebugEnable = debug.enable;
    // Create spy
    enableSpy = vi.fn();
    debug.enable = enableSpy;
  });

  afterEach(() => {
    // Restore original debug.enable
    debug.enable = originalDebugEnable;
    vi.clearAllMocks();
  });

  describe('Logger instantiation', () => {
    it('should create logger with correct namespace', () => {
      const logger = new Logger({ namespace: 'test:namespace' });
      expect(logger).toBeDefined();
      expect(logger.getCorrelationId()).toBeDefined();
    });

    it('should generate correlation ID if not provided', () => {
      const logger = new Logger({ namespace: 'test' });
      const correlationId = logger.getCorrelationId();
      expect(correlationId).toMatch(/^[0-9a-f-]{36}$/); // UUID v4 format
    });

    it('should use provided correlation ID', () => {
      const customId = 'custom-correlation-id';
      const logger = new Logger({
        namespace: 'test',
        correlationId: customId,
      });
      expect(logger.getCorrelationId()).toBe(customId);
    });

    it('should enable all log levels by default', () => {
      new Logger({ namespace: 'test' });
      expect(enableSpy).toHaveBeenCalledWith('test:*');
    });

    it('should enable verbose mode when verbose=true', () => {
      new Logger({ namespace: 'test', verbose: true });
      expect(enableSpy).toHaveBeenCalledWith('openapi-to-mcp:*');
    });

    it('should enable quiet mode when quiet=true', () => {
      new Logger({ namespace: 'test', quiet: true });
      expect(enableSpy).toHaveBeenCalledWith('openapi-to-mcp:*:error');
    });
  });

  describe('Log level methods', () => {
    it('should have error, warn, info, debug methods', () => {
      const logger = new Logger({ namespace: 'test' });
      expect(logger.error).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.debug).toBeDefined();
    });

    it('should call logger methods without throwing', () => {
      const logger = new Logger({
        namespace: 'test',
        correlationId: 'test-id',
      });

      // These should not throw
      expect(() => logger.error('Error message')).not.toThrow();
      expect(() => logger.warn('Warning message')).not.toThrow();
      expect(() => logger.info('Info message')).not.toThrow();
      expect(() => logger.debug('Debug message')).not.toThrow();
    });

    it('should return correlation ID', () => {
      const logger = new Logger({
        namespace: 'test',
        correlationId: 'test-id',
      });
      expect(logger.getCorrelationId()).toBe('test-id');
    });
  });

  describe('Quiet mode', () => {
    it('should create logger in quiet mode', () => {
      const logger = new Logger({
        namespace: 'test',
        quiet: true,
      });

      // Should not throw even in quiet mode
      expect(() => logger.warn('Warning message')).not.toThrow();
      expect(() => logger.info('Info message')).not.toThrow();
      expect(() => logger.debug('Debug message')).not.toThrow();
      expect(() => logger.error('Error message')).not.toThrow();
    });

    it('should enable quiet mode debug namespace', () => {
      new Logger({
        namespace: 'test',
        quiet: true,
      });

      expect(enableSpy).toHaveBeenCalledWith('openapi-to-mcp:*:error');
    });
  });

  describe('Verbose mode', () => {
    it('should enable verbose mode debug namespace', () => {
      new Logger({
        namespace: 'test',
        verbose: true,
      });

      expect(enableSpy).toHaveBeenCalledWith('openapi-to-mcp:*');
    });
  });

  describe('Sensitive data redaction', () => {
    it('should call error method with potentially sensitive data', () => {
      const logger = new Logger({ namespace: 'test' });

      // Test that method doesn't throw with sensitive-looking data
      expect(() =>
        logger.error('Test message', { apiKey: 'sk-1234567890' })
      ).not.toThrow();
    });

    it('should call error method with tokens', () => {
      const logger = new Logger({ namespace: 'test' });

      expect(() =>
        logger.error('Test message', { token: 'bearer-token-123' })
      ).not.toThrow();
    });

    it('should call error method with passwords', () => {
      const logger = new Logger({ namespace: 'test' });

      expect(() => logger.error('Test message', { password: 'super-secret' })).not.toThrow();
    });

    it('should call error method with secrets', () => {
      const logger = new Logger({ namespace: 'test' });

      expect(() =>
        logger.error('Test message', { secret: 'my-secret-value' })
      ).not.toThrow();
    });

    it('should call error method with authorization headers', () => {
      const logger = new Logger({ namespace: 'test' });

      expect(() =>
        logger.error('Test message', { authorization: 'Bearer token123' })
      ).not.toThrow();
    });

    it('should call error method with credential-like strings', () => {
      const logger = new Logger({ namespace: 'test' });

      const credential = 'sk_test_1234567890abcdefghijklmnop';
      expect(() => logger.error('Test message', credential)).not.toThrow();
    });

    it('should call error method with normal strings', () => {
      const logger = new Logger({ namespace: 'test' });

      const normalString = 'This is a normal message';
      expect(() => logger.error('Test message', normalString)).not.toThrow();
    });

    it('should call error method with nested sensitive data', () => {
      const logger = new Logger({ namespace: 'test' });

      expect(() =>
        logger.error('Test message', {
          user: {
            name: 'John',
            credentials: {
              apiKey: 'sk-secret',
              password: 'pass123',
            },
          },
        })
      ).not.toThrow();
    });

    it('should call error method with arrays containing sensitive data', () => {
      const logger = new Logger({ namespace: 'test' });

      expect(() =>
        logger.error('Test message', [
          { apiKey: 'sk-123' },
          { token: 'tok-456' },
          { normalField: 'normal-value' },
        ])
      ).not.toThrow();
    });
  });

  describe('Namespace creation', () => {
    it('should create loggers with different namespaces', () => {
      const logger1 = new Logger({ namespace: 'openapi-to-mcp:cli' });
      const logger2 = new Logger({ namespace: 'openapi-to-mcp:parser' });
      const logger3 = new Logger({ namespace: 'openapi-to-mcp:generator' });

      expect(logger1).toBeDefined();
      expect(logger2).toBeDefined();
      expect(logger3).toBeDefined();
      expect(logger1.getCorrelationId()).not.toBe(logger2.getCorrelationId());
    });

    it('should support nested namespaces', () => {
      const logger = new Logger({ namespace: 'openapi-to-mcp:cli:commands:generate' });
      expect(logger).toBeDefined();
    });
  });

  describe('createLogger factory function', () => {
    it('should create logger with namespace', () => {
      const logger = createLogger('test:factory');
      expect(logger).toBeDefined();
      expect(logger.getCorrelationId()).toBeDefined();
    });

    it('should accept options', () => {
      const logger = createLogger('test:factory', {
        correlationId: 'factory-id',
        verbose: true,
      });
      expect(logger.getCorrelationId()).toBe('factory-id');
    });
  });

  describe('Default logger', () => {
    it('should export default CLI logger', () => {
      expect(defaultLogger).toBeDefined();
      expect(defaultLogger.getCorrelationId()).toBeDefined();
    });
  });
});
