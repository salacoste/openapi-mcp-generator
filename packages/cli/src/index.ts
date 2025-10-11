#!/usr/bin/env node

/**
 * OpenAPI-to-MCP CLI entry point
 * Command-line interface for generating MCP servers from OpenAPI specifications
 */

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { registerGenerateCommand } from './commands/generate.js';
import { formatError, getExitCode } from './errors/index.js';
import { createLogger } from './logging/index.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create logger
const logger = createLogger('openapi-to-mcp:cli');

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  try {
    // Read package.json for version
    const packageJsonPath = join(__dirname, '../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as { version: string };

    // Create program instance
    const program = new Command();

    // Configure program
    program
      .name('openapi-to-mcp')
      .description('Generate MCP servers from OpenAPI specifications')
      .version(packageJson.version, '-V, --version', 'output the current version')
      .option('--verbose', 'enable verbose logging')
      .option('--quiet', 'suppress all output except errors');

    // Register commands
    registerGenerateCommand(program);

    // Parse command-line arguments
    await program.parseAsync(process.argv);
  } catch (error) {
    // Format and display error
    const verbose = process.argv.includes('--verbose');
     
    console.error(formatError(error, { verbose }));

    // Log error for debugging
    logger.error('CLI execution failed', error);

    // Exit with appropriate code
    const exitCode = getExitCode(error);
    process.exitCode = exitCode;
  }
}

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', reason);
   
  console.error(formatError(reason, { verbose: false }));
  process.exitCode = 2; // Internal error
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
   
  console.error(formatError(error, { verbose: false }));
  process.exitCode = 2; // Internal error
  process.exit(2); // Exit immediately for uncaught exceptions
});

// Run main function
void main();
