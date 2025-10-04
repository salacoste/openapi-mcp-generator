/**
 * Custom error classes for CLI error handling
 * Following architecture standards: typed errors with structured context
 */

/**
 * Base CLI error class
 */
export class CLIError extends Error {
  public readonly exitCode: number;

  constructor(message: string, exitCode = 1) {
    super(message);
    this.name = 'CLIError';
    this.exitCode = exitCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error for invalid user input
 */
export class ValidationError extends CLIError {
  constructor(message: string) {
    super(message, 1);
    this.name = 'ValidationError';
  }
}

/**
 * File system error for file operations
 */
export class FileSystemError extends CLIError {
  constructor(message: string) {
    super(message, 1);
    this.name = 'FileSystemError';
  }
}

/**
 * User input error for invalid arguments
 */
export class UserInputError extends CLIError {
  constructor(message: string) {
    super(message, 1);
    this.name = 'UserInputError';
  }
}

/**
 * Format and display error message to console
 */
export function handleError(error: Error): void {
  // Format error message with red color (simple ANSI codes)
  const red = '\x1b[31m';
  const reset = '\x1b[0m';

  console.error(`${red}❌ Error: ${error.message}${reset}`);

  // Show stack trace only in verbose mode
  if (process.env.VERBOSE === 'true' && error.stack) {
    console.error(`\n${error.stack}`);
  }

  // Exit with appropriate code
  const exitCode = error instanceof CLIError ? error.exitCode : 2;
  process.exit(exitCode);
}
