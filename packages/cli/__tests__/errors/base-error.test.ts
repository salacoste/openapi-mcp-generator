import { describe, it, expect } from 'vitest';
import {
  BaseError,
  CLIError,
  ValidationError,
  FileSystemError,
  UserInputError,
  InternalError,
  NetworkError,
} from '../../src/errors/base-error.js';

describe('BaseError', () => {
  it('should create error with message', () => {
    const error = new BaseError('Test error');

    expect(error.message).toBe('Test error');
    expect(error.name).toBe('BaseError');
    expect(error.stack).toBeDefined();
  });

  it('should create error with context', () => {
    const context = { file: 'test.json', line: 10 };
    const error = new BaseError('Test error', context);

    expect(error.context).toEqual(context);
  });

  it('should create error with suggested fix', () => {
    const suggestedFix = 'Try adding a title field';
    const error = new BaseError('Test error', undefined, suggestedFix);

    expect(error.suggestedFix).toBe(suggestedFix);
  });

  it('should serialize to JSON', () => {
    const error = new BaseError('Test error', { file: 'test.json' }, 'Fix this');
    const json = error.toJSON();

    expect(json.name).toBe('BaseError');
    expect(json.message).toBe('Test error');
    expect(json.context).toEqual({ file: 'test.json' });
    expect(json.suggestedFix).toBe('Fix this');
    expect(json.stack).toBeDefined();
  });
});

describe('CLIError', () => {
  it('should have exit code 1', () => {
    const error = new CLIError('Test error');

    expect(error.exitCode).toBe(1);
    expect(error.name).toBe('CLIError');
  });
});

describe('ValidationError', () => {
  it('should extend CLIError', () => {
    const error = new ValidationError('Invalid input');

    expect(error).toBeInstanceOf(CLIError);
    expect(error).toBeInstanceOf(BaseError);
    expect(error.name).toBe('ValidationError');
    expect(error.exitCode).toBe(1);
  });
});

describe('FileSystemError', () => {
  it('should extend CLIError', () => {
    const error = new FileSystemError('File not found');

    expect(error).toBeInstanceOf(CLIError);
    expect(error.name).toBe('FileSystemError');
    expect(error.exitCode).toBe(1);
  });
});

describe('UserInputError', () => {
  it('should extend CLIError', () => {
    const error = new UserInputError('Invalid argument');

    expect(error).toBeInstanceOf(CLIError);
    expect(error.name).toBe('UserInputError');
    expect(error.exitCode).toBe(1);
  });
});

describe('InternalError', () => {
  it('should have exit code 2', () => {
    const error = new InternalError('Internal failure');

    expect(error).toBeInstanceOf(BaseError);
    expect(error.name).toBe('InternalError');
    expect(error.exitCode).toBe(2);
  });
});

describe('NetworkError', () => {
  it('should extend CLIError', () => {
    const error = new NetworkError('Connection failed');

    expect(error).toBeInstanceOf(CLIError);
    expect(error.name).toBe('NetworkError');
    expect(error.exitCode).toBe(1);
  });
});
