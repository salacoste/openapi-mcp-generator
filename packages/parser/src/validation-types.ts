/**
 * Validation types for OpenAPI schema validation
 * @module @openapi-to-mcp/parser/validation-types
 */

/**
 * Severity levels for validation issues
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Validation issue (error or warning)
 */
export interface ValidationIssue {
  /**
   * JSON path to the field with the issue (e.g., 'paths./users.get.responses')
   */
  path: string;

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Issue severity
   */
  severity: ValidationSeverity;

  /**
   * Expected value or type (if applicable)
   */
  expected?: string;

  /**
   * Actual value or type that caused the error
   */
  actual?: string;
}

/**
 * Result of OpenAPI schema validation
 */
export interface ValidationResult {
  /**
   * Whether the document is valid
   */
  valid: boolean;

  /**
   * Validation errors (severity: error)
   */
  errors: ValidationIssue[];

  /**
   * Validation warnings (severity: warning)
   */
  warnings: ValidationIssue[];
}
