/**
 * Type definitions for OpenAPI parser package
 * @module @openapi-to-mcp/parser/types
 */

import type { OpenAPI } from 'openapi-types';

/**
 * Re-export OpenAPI types for convenience
 */
export type OpenAPIObject = OpenAPI.Document;

/**
 * Options for loading OpenAPI documents
 */
export interface LoaderOptions {
  /**
   * Whether to validate the document structure after loading
   * @default false
   */
  validate?: boolean;

  /**
   * Maximum file size in bytes to load
   * @default 10485760 (10MB)
   */
  maxFileSize?: number;
}

/**
 * Result of loading an OpenAPI document
 */
export interface LoaderResult {
  /**
   * Parsed OpenAPI document
   */
  document: OpenAPIObject;

  /**
   * Original file path
   */
  filePath: string;

  /**
   * Detected format (json or yaml)
   */
  format: 'json' | 'yaml';

  /**
   * File size in bytes
   */
  size: number;
}

/**
 * Supported file formats
 */
export type FileFormat = 'json' | 'yaml';
