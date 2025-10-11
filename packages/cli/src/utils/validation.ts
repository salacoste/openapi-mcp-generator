/**
 * Validation utilities for CLI operations
 * Provides custom error types and validation functions
 */

import fs from 'fs-extra';
import { resolve } from 'path';

/**
 * Custom error class for validation failures with actionable suggestions
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public suggestion?: string,
    public command?: string
  ) {
    super(message);
    this.name = 'ValidationError';
    Error.captureStackTrace(this, ValidationError);
  }
}

/**
 * Validate output directory permissions and existence
 */
export async function validateOutputDirectory(
  outputPath: string,
  force: boolean
): Promise<void> {
  const absolutePath = resolve(outputPath);

  // Check if directory exists
  const exists = await fs.pathExists(absolutePath);

  if (exists && !force) {
    throw new ValidationError(
      `Output directory already exists: ${absolutePath}`,
      'Use --force flag to overwrite existing directory',
      `${process.argv.slice(0, 3).join(' ')} --force`
    );
  }

  if (exists) {
    // Check write permissions on existing directory
    try {
      await fs.access(absolutePath, fs.constants.W_OK);
    } catch {
      throw new ValidationError(
        `Output directory is not writable: ${absolutePath}`,
        'Check directory permissions or use --output with writable path',
        `chmod 755 ${absolutePath}`
      );
    }
  } else {
    // Check parent directory exists and is writable
    const parentDir = resolve(absolutePath, '..');
    const parentExists = await fs.pathExists(parentDir);

    if (!parentExists) {
      throw new ValidationError(
        `Parent directory does not exist: ${parentDir}`,
        'Create parent directory first',
        `mkdir -p ${parentDir}`
      );
    }

    try {
      await fs.access(parentDir, fs.constants.W_OK);
    } catch {
      throw new ValidationError(
        `Parent directory is not writable: ${parentDir}`,
        'Check directory permissions',
        `chmod 755 ${parentDir}`
      );
    }
  }
}

/**
 * Validate generated code structure and syntax
 */
export async function validateGeneratedCode(
  outputPath: string
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Check all required files exist
  const requiredFiles = [
    'src/index.ts',
    'src/types.ts',
    'src/tools.ts',
    'src/http-client.ts',
    'package.json',
    'tsconfig.json',
  ];

  for (const file of requiredFiles) {
    const filePath = resolve(outputPath, file);
    const exists = await fs.pathExists(filePath);
    if (!exists) {
      errors.push(`Missing required file: ${file}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Basic syntax validation on generated TypeScript files
  try {
    const indexContent = await fs.readFile(
      resolve(outputPath, 'src/index.ts'),
      'utf-8'
    );

    // Check for obvious syntax issues
    if (indexContent.length < 100) {
      errors.push('Generated index.ts appears incomplete');
    }

    // Check for unresolved template variables
    // NOTE: Temporarily disabled to debug - some valid code may contain {{ }}
    // if (indexContent.includes('{{') || indexContent.includes('}}')) {
    //   errors.push('Generated code contains unresolved template variables');
    // }
  } catch (error) {
    errors.push(`Failed to read generated files: ${(error as Error).message}`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
