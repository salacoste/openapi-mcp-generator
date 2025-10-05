/**
 * Custom error classes for parser package
 * @module @openapi-to-mcp/parser/errors
 */

/**
 * Base error class for all parser errors
 */
export class ParserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParserError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when file system operations fail
 */
export class FileSystemError extends ParserError {
  /**
   * The file path that caused the error
   */
  public readonly path: string;

  constructor(message: string, path: string) {
    super(message);
    this.name = 'FileSystemError';
    this.path = path;
  }
}

/**
 * Error thrown when parsing fails (JSON or YAML)
 */
export class ParseError extends ParserError {
  /**
   * Line number where error occurred (if available)
   */
  public readonly line?: number;

  /**
   * Column number where error occurred (if available)
   */
  public readonly column?: number;

  /**
   * The file path being parsed
   */
  public readonly path?: string;

  constructor(message: string, options?: { line?: number; column?: number; path?: string }) {
    super(message);
    this.name = 'ParseError';
    this.line = options?.line;
    this.column = options?.column;
    this.path = options?.path;
  }
}

/**
 * Error thrown when file format is not supported
 */
export class UnsupportedFormatError extends ParserError {
  /**
   * The file extension that was not supported
   */
  public readonly extension: string;

  constructor(message: string, extension: string) {
    super(message);
    this.name = 'UnsupportedFormatError';
    this.extension = extension;
  }
}

/**
 * Error thrown when file size exceeds maximum allowed
 */
export class FileSizeError extends ParserError {
  /**
   * Actual file size in bytes
   */
  public readonly actualSize: number;

  /**
   * Maximum allowed size in bytes
   */
  public readonly maxSize: number;

  constructor(message: string, actualSize: number, maxSize: number) {
    super(message);
    this.name = 'FileSizeError';
    this.actualSize = actualSize;
    this.maxSize = maxSize;
  }
}
