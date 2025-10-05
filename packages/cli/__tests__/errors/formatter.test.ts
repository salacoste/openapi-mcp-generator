import { describe, it, expect } from 'vitest';
import { formatError, formatErrorForLogging } from '../../src/errors/formatter.js';
import { ValidationError } from '../../src/errors/base-error.js';

describe('formatError', () => {
  it('should format simple Error', () => {
    const error = new Error('Test error');
    const formatted = formatError(error, { colors: false });

    expect(formatted).toContain('❌ Error');
    expect(formatted).toContain('Test error');
    expect(formatted).toContain('┌');
    expect(formatted).toContain('└');
  });

  it('should format error with context', () => {
    const error = new ValidationError('Invalid OpenAPI document', {
      file: 'openapi.json',
      line: 10,
    });
    const formatted = formatError(error, { colors: false });

    expect(formatted).toContain('ValidationError');
    expect(formatted).toContain('Invalid OpenAPI document');
    expect(formatted).toContain('Context:');
    expect(formatted).toContain('file: openapi.json');
    expect(formatted).toContain('line: 10');
  });

  it('should format error with suggested fix', () => {
    const error = new ValidationError(
      'Missing title field',
      undefined,
      'Add a title field to the info section'
    );
    const formatted = formatError(error, { colors: false });

    expect(formatted).toContain('Suggested Fix:');
    expect(formatted).toContain('Add a title field to the info section');
  });

  it('should include stack trace in verbose mode', () => {
    const error = new Error('Test error');
    const formatted = formatError(error, { verbose: true, colors: false });

    expect(formatted).toContain('Stack trace:');
    expect(formatted).toContain('Error: Test error');
  });

  it('should not include stack trace in non-verbose mode', () => {
    const error = new Error('Test error');
    const formatted = formatError(error, { verbose: false, colors: false });

    expect(formatted).not.toContain('Stack trace:');
  });

  it('should handle non-Error objects', () => {
    const formatted = formatError('Simple string error', { colors: false });

    expect(formatted).toContain('❌ Error: Simple string error');
  });
});

describe('formatErrorForLogging', () => {
  it('should format Error for logging', () => {
    const error = new Error('Test error');
    const formatted = formatErrorForLogging(error);

    expect(formatted).toHaveProperty('name', 'Error');
    expect(formatted).toHaveProperty('message', 'Test error');
    expect(formatted).toHaveProperty('stack');
  });

  it('should format ValidationError for logging', () => {
    const error = new ValidationError('Invalid input', { field: 'title' }, 'Add title');
    const formatted = formatErrorForLogging(error);

    expect(formatted).toHaveProperty('name', 'ValidationError');
    expect(formatted).toHaveProperty('message', 'Invalid input');
    expect(formatted).toHaveProperty('context', { field: 'title' });
    expect(formatted).toHaveProperty('suggestedFix', 'Add title');
  });

  it('should handle non-Error objects', () => {
    const formatted = formatErrorForLogging('Simple string');

    expect(formatted).toEqual({ error: 'Simple string' });
  });
});
