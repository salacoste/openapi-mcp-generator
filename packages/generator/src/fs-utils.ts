/**
 * File system utilities for code generation
 * Provides safe, typed wrappers around fs-extra operations
 */

import fs from 'fs-extra';
import { resolve } from 'path';
import { log } from './utils/logger.js';

/**
 * Custom error class for file system operations
 */
export class FileSystemError extends Error {
  public readonly exitCode: number;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'FileSystemError';
    this.exitCode = 1;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Maps Node.js error codes to user-friendly messages with suggestions
 */
function mapFileSystemError(
  error: NodeJS.ErrnoException,
  operation: string,
  path: string
): FileSystemError {
  const context = {
    operation,
    path,
    code: error.code,
    originalMessage: error.message,
  };

  switch (error.code) {
    case 'EACCES':
      return new FileSystemError(
        `Permission denied ${operation}: ${path}\n\nSuggestion: Check directory permissions or run with appropriate privileges`,
        context
      );
    case 'ENOSPC':
      return new FileSystemError(
        `No disk space available ${operation}: ${path}\n\nSuggestion: Free up disk space and try again`,
        context
      );
    case 'ENOENT':
      return new FileSystemError(
        `Path not found ${operation}: ${path}\n\nSuggestion: Check the file path and try again`,
        context
      );
    case 'EEXIST':
      return new FileSystemError(
        `File already exists ${operation}: ${path}\n\nSuggestion: Use --force flag to overwrite`,
        context
      );
    case 'EISDIR':
      return new FileSystemError(
        `Expected file but found directory ${operation}: ${path}\n\nSuggestion: Check the target path`,
        context
      );
    case 'ENOTDIR':
      return new FileSystemError(
        `Expected directory but found file ${operation}: ${path}\n\nSuggestion: Check the target path`,
        context
      );
    default:
      return new FileSystemError(
        `File system error ${operation}: ${path}\n\n${error.message}`,
        context
      );
  }
}

/**
 * Creates a directory with parent directories if needed
 * @param dirPath - Path to directory to create
 * @throws {FileSystemError} If directory creation fails
 */
export async function createDirectory(dirPath: string): Promise<void> {
  const absolutePath = resolve(dirPath);
  log(`Creating directory: ${absolutePath}`);

  try {
    await fs.ensureDir(absolutePath);
    log(`Directory created successfully: ${absolutePath}`);
  } catch (error) {
    throw mapFileSystemError(error as NodeJS.ErrnoException, 'creating directory', absolutePath);
  }
}

/**
 * Writes string content to a file with UTF-8 encoding
 * Creates parent directories automatically if they don't exist
 * @param filePath - Path to file to write
 * @param content - String content to write
 * @throws {FileSystemError} If file write fails
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  const absolutePath = resolve(filePath);
  log(`Writing file: ${absolutePath} (${content.length} bytes)`);

  try {
    await fs.outputFile(absolutePath, content, 'utf-8');
    log(`File written successfully: ${absolutePath}`);
  } catch (error) {
    throw mapFileSystemError(error as NodeJS.ErrnoException, 'writing file', absolutePath);
  }
}

/**
 * Copies template files from source to destination directory
 * @param source - Source template directory path
 * @param dest - Destination directory path
 * @throws {FileSystemError} If copy operation fails or source doesn't exist
 */
export async function copyTemplate(source: string, dest: string): Promise<void> {
  const absoluteSource = resolve(source);
  const absoluteDest = resolve(dest);

  log(`Copying template from ${absoluteSource} to ${absoluteDest}`);

  try {
    // Validate source exists
    const sourceExists = await fs.pathExists(absoluteSource);
    if (!sourceExists) {
      throw new FileSystemError(
        `Template source directory not found: ${absoluteSource}\n\nSuggestion: Check the template path`,
        {
          operation: 'validating source',
          path: absoluteSource,
        }
      );
    }

    // Copy directory contents
    await fs.copy(absoluteSource, absoluteDest, { overwrite: false });
    log(`Template copied successfully to ${absoluteDest}`);
  } catch (error) {
    // If it's already our error, re-throw it
    if (error instanceof FileSystemError) {
      throw error;
    }
    throw mapFileSystemError(
      error as NodeJS.ErrnoException,
      'copying template',
      `${absoluteSource} → ${absoluteDest}`
    );
  }
}

/**
 * Validates that output directory has required MCP server structure
 * Required structure: src/, package.json, README.md
 * @param outputDir - Output directory path to validate
 * @returns True if structure is valid, false otherwise
 */
export async function validateOutputStructure(outputDir: string): Promise<boolean> {
  const absolutePath = resolve(outputDir);
  log(`Validating output structure: ${absolutePath}`);

  const requiredPaths = [
    { path: 'src', name: 'src/' },
    { path: 'package.json', name: 'package.json' },
    { path: 'README.md', name: 'README.md' },
  ];

  let allValid = true;

  for (const { path, name } of requiredPaths) {
    const fullPath = resolve(absolutePath, path);
    const exists = await fs.pathExists(fullPath);
    log(`  ${name}: ${exists ? '✓' : '✗'}`);
    if (!exists) {
      allValid = false;
    }
  }

  log(`Output structure validation: ${allValid ? 'PASS' : 'FAIL'}`);
  return allValid;
}

/**
 * Checks output directory and handles overwrite based on force flag
 * @param outputDir - Output directory path
 * @param force - Whether to force overwrite existing directory
 * @throws {FileSystemError} If directory exists and force is false
 */
export async function checkOutputDirectory(outputDir: string, force: boolean): Promise<void> {
  const absolutePath = resolve(outputDir);
  log(`Checking output directory: ${absolutePath} (force=${force})`);

  const exists = await fs.pathExists(absolutePath);

  if (!exists) {
    log(`Output directory does not exist, will be created`);
    return;
  }

  if (force) {
    log(`Clearing existing directory: ${absolutePath}`);
    try {
      await fs.emptyDir(absolutePath);
      log(`Directory cleared successfully`);
    } catch (error) {
      throw mapFileSystemError(error as NodeJS.ErrnoException, 'clearing directory', absolutePath);
    }
  } else {
    throw new FileSystemError(
      `Output directory already exists: ${absolutePath}\n\nSuggestion: Use --force flag to overwrite or choose a different output directory`,
      {
        operation: 'checking output directory',
        path: absolutePath,
        force: false,
      }
    );
  }
}
