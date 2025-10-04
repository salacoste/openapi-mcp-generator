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
import { handleError } from './utils/errors.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  // Read package.json for version
  const packageJsonPath = join(__dirname, '../package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

  // Create program instance
  const program = new Command();

  // Configure program
  program
    .name('openapi-to-mcp')
    .description('Generate MCP servers from OpenAPI specifications')
    .version(packageJson.version, '-V, --version', 'output the current version');

  // Register commands
  registerGenerateCommand(program);

  // Parse command-line arguments
  program.parse(process.argv);
} catch (error) {
  // Handle errors gracefully
  handleError(error as Error);
}
