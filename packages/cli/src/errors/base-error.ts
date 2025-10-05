/**
 * Base error class for all custom errors in the OpenAPI-to-MCP generator
 * Provides structured context and suggested fixes for better user experience
 */

export interface ErrorContext {
  [key: string]: unknown;
}

/**
 * Base class for all application errors
 * Includes structured context and suggested fixes
 */
export class BaseError extends Error {
  /**
   * Error context with additional structured information
   */
  public readonly context?: ErrorContext;

  /**
   * Suggested fix or action the user can take
   */
  public readonly suggestedFix?: string;

  constructor(message: string, context?: ErrorContext, suggestedFix?: string) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;
    this.suggestedFix = suggestedFix;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Serialize error to JSON for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      context: this.context,
      suggestedFix: this.suggestedFix,
      stack: this.stack,
    };
  }
}

/**
 * CLI-specific error for user-facing issues
 * Exit code: 1 (user error)
 */
export class CLIError extends BaseError {
  public readonly exitCode = 1;

  constructor(message: string, context?: ErrorContext, suggestedFix?: string) {
    super(message, context, suggestedFix);
  }
}

/**
 * Validation error for invalid user input or OpenAPI documents
 * Exit code: 1 (user error)
 */
export class ValidationError extends CLIError {
  constructor(message: string, context?: ErrorContext, suggestedFix?: string) {
    super(message, context, suggestedFix);
  }
}

/**
 * File system error for file operations (read, write, permissions)
 * Exit code: 1 (user error - usually fixable)
 */
export class FileSystemError extends CLIError {
  constructor(message: string, context?: ErrorContext, suggestedFix?: string) {
    super(message, context, suggestedFix);
  }
}

/**
 * User input error for invalid command-line arguments
 * Exit code: 1 (user error)
 */
export class UserInputError extends CLIError {
  constructor(message: string, context?: ErrorContext, suggestedFix?: string) {
    super(message, context, suggestedFix);
  }
}

/**
 * Internal error for unexpected failures (bugs)
 * Exit code: 2 (internal error)
 */
export class InternalError extends BaseError {
  public readonly exitCode = 2;

  constructor(message: string, context?: ErrorContext, suggestedFix?: string) {
    super(message, context, suggestedFix);
  }
}

/**
 * Network error for external operations (fetching $refs, etc.)
 * Exit code: 1 (user error - usually connectivity issues)
 */
export class NetworkError extends CLIError {
  constructor(message: string, context?: ErrorContext, suggestedFix?: string) {
    super(message, context, suggestedFix);
  }
}
