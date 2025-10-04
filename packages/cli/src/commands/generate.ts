/**
 * Generate command implementation
 * Generates an MCP server from an OpenAPI specification
 */

import { Command } from 'commander';
import { existsSync, statSync } from 'fs';
import { resolve } from 'path';
import { ValidationError } from '../utils/errors.js';

interface GenerateOptions {
  output: string;
  format?: string;
  verbose?: boolean;
  authType?: string;
  force?: boolean;
}

/**
 * Register the generate command with the CLI program
 */
export function registerGenerateCommand(program: Command): void {
  program
    .command('generate')
    .description('Generate an MCP server from an OpenAPI specification')
    .argument('<openapi-path>', 'path to OpenAPI specification file (JSON or YAML)')
    .option('-o, --output <dir>', 'output directory for generated MCP server', './mcp-server')
    .option('-f, --format [json|yaml]', 'OpenAPI specification format (auto-detected if not specified)')
    .option('-v, --verbose', 'enable verbose output for debugging')
    .option('-a, --auth-type [apiKey|bearer|basic]', 'authentication type (auto-detected from spec if not specified)')
    .option('--force', 'overwrite output directory if it exists')
    .addHelpText('after', `
Examples:
  $ openapi-to-mcp generate petstore.yaml --output ./my-server
  $ openapi-to-mcp generate api.json -o ./server -a bearer -v`)
    .action((openapiPath: string, options: GenerateOptions) => {
      // Set verbose mode for error handling
      if (options.verbose) {
        process.env.VERBOSE = 'true';
      }

      // Validate openapi-path exists
      const resolvedPath = resolve(openapiPath);
      if (!existsSync(resolvedPath)) {
        throw new ValidationError(`OpenAPI file not found: ${openapiPath}`);
      }

      // Validate openapi-path is a file
      const stats = statSync(resolvedPath);
      if (!stats.isFile()) {
        throw new ValidationError(`Path is not a file: ${openapiPath}`);
      }

      // Validate output directory path is valid
      const outputPath = resolve(options.output);
      if (outputPath === '/') {
        throw new ValidationError('Invalid output directory: cannot use root directory');
      }

      // Log parsed arguments in verbose mode
      if (options.verbose) {
        console.log('Generate command called with:');
        console.log('  OpenAPI path:', resolvedPath);
        console.log('  Output directory:', outputPath);
        console.log('  Format:', options.format || 'auto-detect');
        console.log('  Auth type:', options.authType || 'auto-detect');
        console.log('  Force overwrite:', options.force || false);
      }

      // TODO: Call parser and generator packages (Story 2.x, 3.x)
      console.log('✅ Generate command validated successfully');
      console.log(`📝 Will generate MCP server from: ${resolvedPath}`);
      console.log(`📁 Output directory: ${outputPath}`);
      console.log('\n⏳ Full implementation coming in Story 2.x (Parser) and 3.x (Generator)');
    });
}
