/**
 * Logging utility using debug library
 * Provides namespaced logging with different levels and sensitive data redaction
 */

import debug from 'debug';
import { v4 as uuidv4 } from 'uuid';

/**
 * Log levels supported by the logger
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /**
   * Namespace for the logger (e.g., 'openapi-to-mcp:cli')
   */
  namespace: string;

  /**
   * Correlation ID for tracing requests
   */
  correlationId?: string;

  /**
   * Enable verbose mode (shows debug messages)
   */
  verbose?: boolean;

  /**
   * Quiet mode (only errors)
   */
  quiet?: boolean;
}

/**
 * Patterns to detect and redact sensitive data
 */
const SENSITIVE_PATTERNS = [
  /api[_-]?key/i,
  /token/i,
  /password/i,
  /secret/i,
  /credential/i,
  /authorization/i,
  /bearer/i,
];

/**
 * Check if a key might contain sensitive data
 */
function isSensitiveKey(key: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(key));
}

/**
 * Redact sensitive data from log messages
 */
function redactSensitiveData(data: unknown): unknown {
  if (typeof data === 'string') {
    // Check if string looks like a credential
    if (data.length > 20 && /^[A-Za-z0-9+/=_-]+$/.test(data)) {
      return '[REDACTED]';
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item));
  }

  if (data && typeof data === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (isSensitiveKey(key)) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactSensitiveData(value);
      }
    }
    return redacted;
  }

  return data;
}

/**
 * Logger class with namespaced debug instances
 */
export class Logger {
  private readonly errorLogger: debug.Debugger;
  private readonly warnLogger: debug.Debugger;
  private readonly infoLogger: debug.Debugger;
  private readonly debugLogger: debug.Debugger;
  private readonly correlationId: string;
  private readonly quiet: boolean;

  constructor(config: LoggerConfig) {
    const { namespace, correlationId, verbose = false, quiet = false } = config;

    this.correlationId = correlationId || uuidv4();
    this.quiet = quiet;

    // Create namespaced debuggers
    this.errorLogger = debug(`${namespace}:error`);
    this.warnLogger = debug(`${namespace}:warn`);
    this.infoLogger = debug(`${namespace}:info`);
    this.debugLogger = debug(`${namespace}:debug`);

    // Enable all levels by default
    // Users control via DEBUG environment variable
    debug.enable(`${namespace}:*`);

    // In verbose mode, enable all debug output
    if (verbose) {
      debug.enable('openapi-to-mcp:*');
    }

    // In quiet mode, only enable errors
    if (quiet) {
      debug.enable('openapi-to-mcp:*:error');
    }
  }

  /**
   * Log an error message
   */
  error(message: string, ...args: unknown[]): void {
    const redactedArgs = args.map((arg) => redactSensitiveData(arg));
    this.errorLogger(`[${this.correlationId}] ${message}`, ...redactedArgs);
  }

  /**
   * Log a warning message
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.quiet) return;
    const redactedArgs = args.map((arg) => redactSensitiveData(arg));
    this.warnLogger(`[${this.correlationId}] ${message}`, ...redactedArgs);
  }

  /**
   * Log an info message
   */
  info(message: string, ...args: unknown[]): void {
    if (this.quiet) return;
    const redactedArgs = args.map((arg) => redactSensitiveData(arg));
    this.infoLogger(`[${this.correlationId}] ${message}`, ...redactedArgs);
  }

  /**
   * Log a debug message (only shown in verbose mode)
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.quiet) return;
    const redactedArgs = args.map((arg) => redactSensitiveData(arg));
    this.debugLogger(`[${this.correlationId}] ${message}`, ...redactedArgs);
  }

  /**
   * Get the correlation ID for this logger
   */
  getCorrelationId(): string {
    return this.correlationId;
  }
}

/**
 * Create a new logger instance
 */
export function createLogger(namespace: string, options?: Partial<LoggerConfig>): Logger {
  return new Logger({
    namespace,
    ...options,
  });
}

/**
 * Default CLI logger
 */
export const defaultLogger = createLogger('openapi-to-mcp:cli');
