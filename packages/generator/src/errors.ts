/**
 * Custom error classes for code generation
 */

/**
 * Base error class for generation errors
 */
export class GenerationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'GenerationError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Template rendering error
 */
export class TemplateRenderError extends GenerationError {
  constructor(
    message: string,
    public readonly templatePath: string,
    public readonly lineNumber?: number,
    context?: Record<string, unknown>
  ) {
    super(message, 'TEMPLATE_RENDER_ERROR', {
      ...context,
      templatePath,
      lineNumber,
    });
    this.name = 'TemplateRenderError';
  }
}

/**
 * Template validation error
 */
export class TemplateValidationError extends GenerationError {
  constructor(
    message: string,
    public readonly templatePath: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'TEMPLATE_VALIDATION_ERROR', {
      ...context,
      templatePath,
    });
    this.name = 'TemplateValidationError';
  }
}

/**
 * Template not found error
 */
export class TemplateNotFoundError extends GenerationError {
  constructor(public readonly templatePath: string) {
    super(`Template not found: ${templatePath}`, 'TEMPLATE_NOT_FOUND', {
      templatePath,
    });
    this.name = 'TemplateNotFoundError';
  }
}

/**
 * Code formatting error
 */
export class CodeFormattingError extends GenerationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CODE_FORMATTING_ERROR', context);
    this.name = 'CodeFormattingError';
  }
}

/**
 * Data validation error
 */
export class DataValidationError extends GenerationError {
  constructor(
    message: string,
    public readonly missingFields: string[],
    context?: Record<string, unknown>
  ) {
    super(message, 'DATA_VALIDATION_ERROR', {
      ...context,
      missingFields,
    });
    this.name = 'DataValidationError';
  }
}
