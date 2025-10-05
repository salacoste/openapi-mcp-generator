/**
 * Unit tests for CLI package
 * Tests command parsing, flag validation, and error handling
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerGenerateCommand } from '../src/commands/generate.js';
import { ValidationError, CLIError } from '../src/errors/index.js';

describe('CLI Error Classes', () => {
  it('should create CLIError with default exit code', () => {
    const error = new CLIError('test error');
    expect(error.message).toBe('test error');
    expect(error.exitCode).toBe(1);
    expect(error.name).toBe('CLIError');
  });

  it('should create ValidationError with exit code 1', () => {
    const error = new ValidationError('validation failed');
    expect(error.message).toBe('validation failed');
    expect(error.exitCode).toBe(1);
    expect(error.name).toBe('ValidationError');
  });
});

describe('Generate Command', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    registerGenerateCommand(program);
  });

  it('should register generate command', () => {
    const commands = program.commands;
    expect(commands).toHaveLength(1);
    expect(commands[0]?.name()).toBe('generate');
  });

  it('should have correct command description', () => {
    const generateCmd = program.commands[0];
    expect(generateCmd?.description()).toBe('Generate an MCP server from an OpenAPI specification');
  });

  it('should define required openapi-path argument', () => {
    const generateCmd = program.commands[0];
    const args = generateCmd?.registeredArguments;
    expect(args).toHaveLength(1);
    expect(args?.[0]?.name()).toBe('openapi-path');
    expect(args?.[0]?.required).toBe(true);
  });

  it('should define output option with default value', () => {
    const generateCmd = program.commands[0];
    const outputOption = generateCmd?.options.find((opt) => opt.long === '--output');
    expect(outputOption).toBeDefined();
    expect(outputOption?.short).toBe('-o');
    expect(outputOption?.defaultValue).toBe('./mcp-server');
  });

  it('should define format option', () => {
    const generateCmd = program.commands[0];
    const formatOption = generateCmd?.options.find((opt) => opt.long === '--format');
    expect(formatOption).toBeDefined();
    expect(formatOption?.short).toBe('-f');
  });

  it('should define verbose boolean flag', () => {
    const generateCmd = program.commands[0];
    const verboseOption = generateCmd?.options.find((opt) => opt.long === '--verbose');
    expect(verboseOption).toBeDefined();
    expect(verboseOption?.short).toBe('-v');
  });

  it('should define auth-type option', () => {
    const generateCmd = program.commands[0];
    const authOption = generateCmd?.options.find((opt) => opt.long === '--auth-type');
    expect(authOption).toBeDefined();
    expect(authOption?.short).toBe('-a');
  });

  it('should define force option', () => {
    const generateCmd = program.commands[0];
    const forceOption = generateCmd?.options.find((opt) => opt.long === '--force');
    expect(forceOption).toBeDefined();
  });
});

describe('CLI Version and Help', () => {
  it('should have version option', () => {
    const program = new Command();
    program.version('0.1.0', '-V, --version');

    const versionOption = program.options.find((opt) => opt.long === '--version');
    expect(versionOption).toBeDefined();
    expect(versionOption?.short).toBe('-V');
  });

  it('should support help command', () => {
    const program = new Command();
    program.configureHelp();
    // Help is automatically added by Commander.js
    expect(program.helpInformation()).toContain('display help');
  });
});

// Error handling tests moved to __tests__/errors/
// See: exit-codes.test.ts and formatter.test.ts
