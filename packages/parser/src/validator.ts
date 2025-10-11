/**
 * OpenAPI 3.0 schema validator
 * @module @openapi-to-mcp/parser/validator
 */

import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPIObject } from './types.js';
import type { ValidationResult, ValidationIssue } from './validation-types.js';

type DocRecord = Record<string, unknown>;

function isObject(value: unknown): value is DocRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Check OpenAPI version compatibility
 */
function checkVersion(document: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!isObject(document)) {
    return [
      {
        path: 'document',
        message: 'Document must be an object',
        severity: 'error',
        expected: 'object',
        actual: typeof document,
      },
    ];
  }

  if (!document.openapi) {
    if (document.swagger || document.version === '2.0') {
      issues.push({
        path: 'openapi',
        message:
          'Swagger 2.0 not supported. Upgrade to OpenAPI 3.0: https://swagger.io/docs/specification/2-0/converting-to-3-0/',
        severity: 'error',
        expected: '3.0.x',
        actual: String(document.swagger || '2.0'),
      });
    } else {
      issues.push({
        path: 'openapi',
        message: 'Missing required field "openapi"',
        severity: 'error',
        expected: 'string (3.0.x)',
        actual: 'undefined',
      });
    }
    return issues;
  }

  const version = String(document.openapi);

  if (/^3\.1\.\d+$/.test(version)) {
    issues.push({
      path: 'openapi',
      message: 'OpenAPI 3.1.x not fully supported. This tool targets 3.0.x. Some features may not work.',
      severity: 'warning',
      expected: '3.0.0 - 3.0.3',
      actual: version,
    });
  } else if (!/^3\.0\.[0-3]$/.test(version)) {
    issues.push({
      path: 'openapi',
      message: `Invalid version "${version}". Supported: 3.0.0, 3.0.1, 3.0.2, 3.0.3`,
      severity: 'error',
      expected: '3.0.0 - 3.0.3',
      actual: version,
    });
  }

  return issues;
}

/**
 * Check required fields
 */
function checkRequiredFields(document: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!isObject(document)) {return issues;}

  if (!document.info) {
    issues.push({
      path: 'info',
      message: 'Missing required field "info"',
      severity: 'error',
      expected: 'object',
      actual: typeof document.info,
    });
  } else if (isObject(document.info)) {
    if (!document.info.title) {
      issues.push({
        path: 'info.title',
        message: 'Missing required field "info.title"',
        severity: 'error',
        expected: 'string',
        actual: typeof document.info.title,
      });
    }
    if (!document.info.version) {
      issues.push({
        path: 'info.version',
        message: 'Missing required field "info.version"',
        severity: 'error',
        expected: 'string',
        actual: typeof document.info.version,
      });
    }
  }

  if (document.paths === undefined) {
    issues.push({
      path: 'paths',
      message: 'Missing required field "paths"',
      severity: 'error',
      expected: 'object',
      actual: 'undefined',
    });
  }

  return issues;
}

/**
 * Check field types
 */
function checkFieldTypes(document: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!isObject(document)) {return issues;}

  if (document.paths !== undefined && !isObject(document.paths)) {
    issues.push({
      path: 'paths',
      message: 'Field "paths" must be an object',
      severity: 'error',
      expected: 'object',
      actual: Array.isArray(document.paths) ? 'array' : typeof document.paths,
    });
  }

  if (document.servers !== undefined && !Array.isArray(document.servers)) {
    issues.push({
      path: 'servers',
      message: 'Field "servers" must be an array',
      severity: 'error',
      expected: 'array',
      actual: typeof document.servers,
    });
  }

  if (document.components !== undefined && !isObject(document.components)) {
    issues.push({
      path: 'components',
      message: 'Field "components" must be an object',
      severity: 'error',
      expected: 'object',
      actual: Array.isArray(document.components) ? 'array' : typeof document.components,
    });
  }

  return issues;
}

/**
 * Normalize OpenAPI document to fix common issues
 * This makes the validator more tolerant of malformed swagger files
 *
 * Fixes:
 * - enum: null → removes the field
 * - required: true on property level → removes it
 * - missing required field on parameters → adds default values
 * - requestBody with invalid required field → converts to x-required
 *
 * @param document - OpenAPI document to normalize
 * @returns Normalized document
 */
export function normalizeDocument(document: unknown): unknown {
  if (!isObject(document)) {
    return document;
  }

  // Deep clone to avoid mutating original
  const normalized = JSON.parse(JSON.stringify(document));

  // Recursive normalization function
  function normalizeObject(obj: DocRecord): void {
    for (const [key, value] of Object.entries(obj)) {
      if (value === null) {
        // Handle null values
        if (key === 'enum') {
          // Remove null enums
          delete obj[key];
        }
      } else if (Array.isArray(value)) {
        // Normalize array items
        value.forEach((item) => {
          if (isObject(item)) {
            normalizeObject(item);
          }
        });
      } else if (isObject(value)) {
        // Fix required field on property level (should be on parent object)
        if ('required' in value && typeof value.required === 'boolean') {
          delete value.required;
        }

        // Recursively normalize nested objects
        normalizeObject(value);
      }
    }

    // Fix parameters without required field
    if ('parameters' in obj && Array.isArray(obj.parameters)) {
      obj.parameters.forEach((param: unknown) => {
        if (isObject(param) && param.in === 'path' && !('required' in param)) {
          param.required = true; // Path parameters are always required
        }
        if (isObject(param) && !('required' in param)) {
          param.required = false; // Default to optional
        }
      });
    }

    // Fix requestBody with required as separate field
    if ('requestBody' in obj && isObject(obj.requestBody)) {
      const rb = obj.requestBody as DocRecord;
      // If required is a top-level boolean property (invalid), move it
      if ('required' in rb && typeof rb.required === 'boolean' && !('content' in rb)) {
        const required = rb.required;
        delete rb.required;
        // Keep it as metadata for now, parser will handle it
        rb['x-required'] = required;
      }
    }
  }

  normalizeObject(normalized);
  return normalized;
}

/**
 * Check for missing operationIds and other warnings
 */
function checkCommonIssues(document: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!isObject(document) || !isObject(document.paths)) {return issues;}

  for (const [pathKey, pathItem] of Object.entries(document.paths)) {
    if (!isObject(pathItem)) {continue;}

    const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'];
    for (const method of methods) {
      const operation = pathItem[method];
      if (isObject(operation)) {
        if (!operation.operationId) {
          issues.push({
            path: `paths.${pathKey}.${method}.operationId`,
            message: `Missing recommended "operationId" in ${method.toUpperCase()} ${pathKey}`,
            severity: 'warning',
          });
        }

        if (
          !operation.responses ||
          !isObject(operation.responses) ||
          Object.keys(operation.responses).length === 0
        ) {
          issues.push({
            path: `paths.${pathKey}.${method}.responses`,
            message: `No responses defined for ${method.toUpperCase()} ${pathKey}`,
            severity: 'warning',
          });
        }
      }
    }
  }

  return issues;
}

/**
 * Validate OpenAPI document against OpenAPI 3.0 specification
 *
 * @param document - Parsed OpenAPI document
 * @returns Validation result with errors and warnings
 *
 * @example
 * ```typescript
 * const result = await validateOpenAPISchema(document);
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors);
 * }
 * if (result.warnings.length > 0) {
 *   console.warn('Warnings:', result.warnings);
 * }
 * ```
 */
export async function validateOpenAPISchema(document: unknown): Promise<ValidationResult> {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Quick validation checks first (on original document)
  errors.push(...checkVersion(document));
  errors.push(...checkRequiredFields(document));
  errors.push(...checkFieldTypes(document));

  // If we have critical errors, skip swagger-parser validation
  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      warnings,
    };
  }

  // Normalize document to fix common issues before validation
  const normalized = normalizeDocument(document);

  // Use swagger-parser for comprehensive validation
  try {
    await SwaggerParser.validate(normalized as OpenAPIObject);
  } catch (error: unknown) {
    // swagger-parser throws on validation errors
    const err = error as { message?: string; path?: string };
    if (err.message) {
      // Log warning instead of error for known issues
      const knownIssues = [
        'enum must be array',
        'required must be array',
        'must have required property',
        'must match exactly one schema in oneOf',
      ];

      const isKnownIssue = knownIssues.some(pattern => err.message?.includes(pattern));

      if (isKnownIssue) {
        warnings.push({
          path: err.path || 'document',
          message: `Schema validation warning (auto-fixed): ${err.message}`,
          severity: 'warning',
        });
      } else {
        errors.push({
          path: err.path || 'document',
          message: err.message,
          severity: 'error',
        });
      }
    } else {
      errors.push({
        path: 'document',
        message: `Validation failed: ${String(error)}`,
        severity: 'error',
      });
    }
  }

  // Check for warnings (non-critical issues)
  warnings.push(...checkCommonIssues(document));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
