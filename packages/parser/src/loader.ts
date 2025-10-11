/**
 * OpenAPI document loader with format auto-detection
 * @module @openapi-to-mcp/parser/loader
 */

import { readFile, access, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { constants } from 'node:fs';
import yaml from 'js-yaml';
import type { OpenAPIObject, LoaderOptions, LoaderResult, FileFormat } from './types.js';
import { FileSystemError, ParseError, UnsupportedFormatError, FileSizeError } from './errors.js';

/**
 * Default maximum file size (10MB)
 */
const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Detect file format based on file extension
 *
 * @param filePath - Path to the file
 * @returns Detected format (json or yaml)
 * @throws {UnsupportedFormatError} If file extension is not supported
 */
function detectFormat(filePath: string): FileFormat {
  const ext = extname(filePath).toLowerCase();

  if (ext === '.json') {
    return 'json';
  }

  if (ext === '.yaml' || ext === '.yml') {
    return 'yaml';
  }

  throw new UnsupportedFormatError(
    `Unsupported file format: ${ext}. Supported formats: .json, .yaml, .yml`,
    ext
  );
}

/**
 * Parse JSON content
 *
 * @param content - File content as string
 * @param filePath - File path for error messages
 * @returns Parsed OpenAPI object
 * @throws {ParseError} If JSON parsing fails
 */
function parseJSON(content: string, filePath: string): OpenAPIObject {
  try {
    return JSON.parse(content) as OpenAPIObject;
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Try to extract line/column from error message
      // Example: "Unexpected token } in JSON at position 42"
      const match = error.message.match(/position (\d+)/);
      const position = match?.[1] ? parseInt(match[1], 10) : undefined;

      // Calculate approximate line number from position
      let line: number | undefined;
      if (position !== undefined) {
        const beforeError = content.substring(0, position);
        line = beforeError.split('\n').length;
      }

      throw new ParseError(`Invalid JSON: ${error.message}`, {
        line,
        path: filePath,
      });
    }
    throw error;
  }
}

/**
 * Parse YAML content
 *
 * @param content - File content as string
 * @param filePath - File path for error messages
 * @returns Parsed OpenAPI object
 * @throws {ParseError} If YAML parsing fails
 */
function parseYAML(content: string, filePath: string): OpenAPIObject {
  try {
    const document = yaml.load(content, {
      filename: filePath,
      // Disable schema so we can parse any valid YAML
      schema: yaml.CORE_SCHEMA,
    });

    if (typeof document !== 'object' || document === null) {
      throw new ParseError('YAML document must be an object', { path: filePath });
    }

    return document as OpenAPIObject;
  } catch (error) {
    if (error instanceof yaml.YAMLException) {
      throw new ParseError(`Invalid YAML: ${error.message}`, {
        line: error.mark?.line !== undefined ? error.mark.line + 1 : undefined,
        column: error.mark?.column !== undefined ? error.mark.column + 1 : undefined,
        path: filePath,
      });
    }
    throw error;
  }
}

/**
 * Validate file existence and accessibility
 *
 * @param filePath - Absolute path to file
 * @throws {FileSystemError} If file does not exist or is not accessible
 */
async function validateFileAccess(filePath: string): Promise<void> {
  try {
    await access(filePath, constants.R_OK);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'ENOENT') {
        throw new FileSystemError(
          `File not found: ${filePath}\n\nPlease check the file path and try again.`,
          filePath
        );
      }
      if (error.code === 'EACCES') {
        throw new FileSystemError(
          `Permission denied: ${filePath}\n\nPlease check file permissions.`,
          filePath
        );
      }
    }
    throw new FileSystemError(`Cannot access file: ${filePath}`, filePath);
  }
}

/**
 * Validate file size
 *
 * @param filePath - Absolute path to file
 * @param maxSize - Maximum allowed file size in bytes
 * @throws {FileSizeError} If file exceeds maximum size
 */
async function validateFileSize(filePath: string, maxSize: number): Promise<number> {
  const stats = await stat(filePath);

  if (!stats.isFile()) {
    throw new FileSystemError(`Path is not a file: ${filePath}`, filePath);
  }

  if (stats.size > maxSize) {
    throw new FileSizeError(
      `File size (${stats.size} bytes) exceeds maximum allowed size (${maxSize} bytes)`,
      stats.size,
      maxSize
    );
  }

  return stats.size;
}

/**
 * Load and parse an OpenAPI document from a file
 *
 * Supports JSON and YAML formats with automatic format detection based on file extension.
 * File paths are normalized to absolute paths for security.
 *
 * @param filePath - Path to OpenAPI specification file (relative or absolute)
 * @param options - Loader options
 * @returns Parsed OpenAPI document with metadata
 * @throws {FileSystemError} If file does not exist, is not accessible, or is not a file
 * @throws {UnsupportedFormatError} If file extension is not .json, .yaml, or .yml
 * @throws {FileSizeError} If file size exceeds maximum allowed size
 * @throws {ParseError} If file content is not valid JSON or YAML
 *
 * @example
 * ```typescript
 * // Load JSON OpenAPI file
 * const result = await loadOpenAPIDocument('./petstore.json');
 * console.log(result.document.openapi); // '3.0.0'
 * console.log(result.format); // 'json'
 *
 * // Load YAML OpenAPI file with options
 * const result = await loadOpenAPIDocument('./api.yaml', {
 *   maxFileSize: 5 * 1024 * 1024 // 5MB
 * });
 * ```
 */
export async function loadOpenAPIDocument(
  filePath: string,
  options: LoaderOptions = {}
): Promise<LoaderResult> {
  // Normalize file path to absolute path for security
  const absolutePath = resolve(filePath);

  // Apply default options
  const maxFileSize = options.maxFileSize ?? DEFAULT_MAX_FILE_SIZE;

  // Validate file exists and is accessible
  await validateFileAccess(absolutePath);

  // Validate file size (this also checks if it's a file, not a directory)
  const size = await validateFileSize(absolutePath, maxFileSize);

  // Detect format after validating it's a file
  const format = detectFormat(absolutePath);

  // Read file content with UTF-8 encoding
  let content: string;
  try {
    content = await readFile(absolutePath, 'utf-8');
  } catch {
    throw new FileSystemError(`Failed to read file: ${absolutePath}`, absolutePath);
  }

  // Parse content based on detected format
  let document: OpenAPIObject;
  if (format === 'json') {
    document = parseJSON(content, absolutePath);
  } else {
    document = parseYAML(content, absolutePath);
  }

  return {
    document,
    filePath: absolutePath,
    format,
    size,
  };
}

/**
 * Load only the OpenAPI document without metadata
 *
 * Convenience function that returns only the parsed document.
 *
 * @param filePath - Path to OpenAPI specification file
 * @param options - Loader options
 * @returns Parsed OpenAPI document
 *
 * @example
 * ```typescript
 * const doc = await loadOpenAPI('./petstore.json');
 * console.log(doc.info.title); // 'Petstore API'
 * ```
 */
export async function loadOpenAPI(
  filePath: string,
  options: LoaderOptions = {}
): Promise<OpenAPIObject> {
  const result = await loadOpenAPIDocument(filePath, options);
  return result.document;
}
