import { describe, it, expect } from 'vitest';
import { ExitCode, getExitCode } from '../../src/errors/exit-codes.js';
import { CLIError, InternalError } from '../../src/errors/base-error.js';

describe('ExitCode', () => {
  it('should have SUCCESS = 0', () => {
    expect(ExitCode.SUCCESS).toBe(0);
  });

  it('should have USER_ERROR = 1', () => {
    expect(ExitCode.USER_ERROR).toBe(1);
  });

  it('should have INTERNAL_ERROR = 2', () => {
    expect(ExitCode.INTERNAL_ERROR).toBe(2);
  });
});

describe('getExitCode', () => {
  it('should return SUCCESS for null/undefined', () => {
    expect(getExitCode(null)).toBe(ExitCode.SUCCESS);
    expect(getExitCode(undefined)).toBe(ExitCode.SUCCESS);
  });

  it('should return exit code from CLIError', () => {
    const error = new CLIError('Test error');
    expect(getExitCode(error)).toBe(1);
  });

  it('should return exit code from InternalError', () => {
    const error = new InternalError('Test error');
    expect(getExitCode(error)).toBe(2);
  });

  it('should return INTERNAL_ERROR for unknown error', () => {
    const error = new Error('Test error');
    expect(getExitCode(error)).toBe(ExitCode.INTERNAL_ERROR);
  });

  it('should return INTERNAL_ERROR for non-error objects', () => {
    expect(getExitCode('string error')).toBe(ExitCode.INTERNAL_ERROR);
    expect(getExitCode(123)).toBe(ExitCode.INTERNAL_ERROR);
  });
});
