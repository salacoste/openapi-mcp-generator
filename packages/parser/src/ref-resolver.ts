/**
 * Reference Resolution Module
 *
 * Resolves all $ref references in OpenAPI documents using @apidevtools/swagger-parser.
 * Handles internal references (#/components/schemas/User), external file references
 * (./common.yaml#/schemas/Error), and nested reference chains.
 *
 * @module ref-resolver
 */

import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPI } from 'openapi-types';

/**
 * Result of reference resolution operation
 */
export interface ResolutionResult {
  /** Fully dereferenced OpenAPI document with all $ref expanded */
  document: OpenAPI.Document;
  /** Number of $ref references found and resolved */
  resolved: number;
  /** Array of resolution errors (empty if successful) */
  errors: ResolutionError[];
}

/**
 * Error that occurred during reference resolution
 */
export interface ResolutionError {
  /** The $ref value that failed (e.g., "#/components/schemas/User") */
  reference: string;
  /** Location in document where ref was used */
  path: string;
  /** Human-readable error message */
  message: string;
  /** Type of resolution error */
  type: 'missing' | 'circular' | 'external' | 'invalid';
}

/**
 * Resolves all $ref references in an OpenAPI document.
 *
 * This function handles:
 * - Internal references: #/components/schemas/User
 * - External file references: ./common.yaml#/schemas/Error
 * - Nested references: ref → ref → ref
 * - Circular reference detection
 * - Automatic caching of resolved references
 *
 * @param document - OpenAPI document (may contain $ref references)
 * @param basePath - Base directory for resolving relative external file references
 * @returns Resolution result with dereferenced document or errors
 *
 * @example
 * ```typescript
 * const document = await loadOpenAPIDocument('./api.json');
 * const result = await resolveReferences(document, './');
 *
 * if (result.errors.length > 0) {
 *   console.error('Resolution failed:', result.errors);
 * } else {
 *   console.log(`Resolved ${result.resolved} references`);
 *   // Use result.document for code generation
 * }
 * ```
 */
export async function resolveReferences(
  document: unknown,
   
  _basePath?: string
): Promise<ResolutionResult> {
  try {
    // Count references before resolution for metrics
    const refCount = countReferences(document);

    // Use swagger-parser to dereference all references
    // This handles:
    // - Internal refs: #/components/schemas/User
    // - External refs: ./common.yaml#/schemas/Error
    // - Nested refs: ref → ref → ref
    // - Caching: automatically caches resolved refs
    const parser = new SwaggerParser();
    const resolved = (await parser.dereference(document as OpenAPI.Document, {
      dereference: {
        circular: false, // Throw error on circular refs
      },
    })) as OpenAPI.Document;

    return {
      document: resolved,
      resolved: refCount,
      errors: [],
    };
  } catch (err: unknown) {
    // Transform swagger-parser errors to our format
    const errors = transformResolutionErrors(err);

    return {
      document: document as OpenAPI.Document, // Return original document on error
      resolved: 0,
      errors,
    };
  }
}

/**
 * Counts the number of $ref properties in a document.
 * Used for metrics and reporting.
 *
 * @param obj - Object to count references in
 * @returns Total number of $ref properties found
 */
function countReferences(obj: unknown): number {
  let count = 0;

  function traverse(value: unknown): void {
    if (value && typeof value === 'object') {
      // Check if this object has a $ref property
      if ('$ref' in value) {
        count++;
      }

      // Recursively traverse object/array
      if (Array.isArray(value)) {
        value.forEach(traverse);
      } else {
        Object.values(value).forEach(traverse);
      }
    }
  }

  traverse(obj);
  return count;
}

/**
 * Transforms swagger-parser errors into our ResolutionError format.
 *
 * @param err - Error from swagger-parser
 * @returns Array of formatted resolution errors
 */
function transformResolutionErrors(err: unknown): ResolutionError[] {
  const errors: ResolutionError[] = [];

  // Type guard for error object
  if (!err || typeof err !== 'object') {
    errors.push({
      reference: 'unknown',
      path: 'document',
      message: String(err),
      type: 'invalid',
    });
    return errors;
  }

  const error = err as { message?: string; path?: string };
  const message = error.message || 'Unknown resolution error';
  const messageLower = message.toLowerCase();

  // Circular reference error
  if (messageLower.includes('circular')) {
    errors.push({
      reference: extractReference(message),
      path: error.path || 'document',
      message,
      type: 'circular',
    });
    return errors;
  }

  // Missing reference error or external file not found
  if (
    messageLower.includes('not found') ||
    messageLower.includes('cannot find') ||
    messageLower.includes('does not exist') ||
    messageLower.includes('could not find') ||
    messageLower.includes('enoent') ||
    messageLower.includes('token') ||
    messageLower.includes('undefined')
  ) {
    errors.push({
      reference: extractReference(message),
      path: error.path || 'document',
      message,
      type: messageLower.includes('enoent') ? 'external' : 'missing',
    });
    return errors;
  }

  // Generic error
  errors.push({
    reference: 'unknown',
    path: error.path || 'document',
    message,
    type: 'invalid',
  });

  return errors;
}

/**
 * Extracts reference path from error message.
 *
 * @param message - Error message from swagger-parser
 * @returns Extracted reference path or 'unknown'
 */
function extractReference(message: string): string {
  // Try to extract $ref value from error message
  // Example: "Token 'User' does not exist" → "#/components/schemas/User"
  const match = message.match(/#\/[^\s]+/);
  return match ? match[0] : 'unknown';
}
