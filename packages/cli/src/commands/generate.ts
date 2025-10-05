/**
 * Generate command implementation
 * Generates an MCP server from an OpenAPI specification
 */

import { Command } from 'commander';
import { existsSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { checkOutputDirectory, copyTemplate } from '@openapi-to-mcp/generator';
import {
  loadOpenAPIDocument,
  validateOpenAPISchema,
  resolveReferences,
  extractSchemas,
  extractOperations,
  extractSecuritySchemes,
  extractTags,
  extractServers,
  FileSystemError,
  ParseError,
  UnsupportedFormatError,
} from '@openapi-to-mcp/parser';
import type {
  ValidationIssue,
  ResolutionError,
  SchemaMap,
  OperationMetadata,
  SecurityExtractionResult,
  TagExtractionResult,
  ServerExtractionResult,
} from '@openapi-to-mcp/parser';
import { ValidationError } from '../errors/index.js';
import { createLogger } from '../logging/index.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create logger for generate command
const logger = createLogger('openapi-to-mcp:cli:generate');

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
    .option(
      '-f, --format [json|yaml]',
      'OpenAPI specification format (auto-detected if not specified)'
    )
    .option('-v, --verbose', 'enable verbose output for debugging')
    .option(
      '-a, --auth-type [apiKey|bearer|basic]',
      'authentication type (auto-detected from spec if not specified)'
    )
    .option('--force', 'overwrite output directory if it exists')
    .addHelpText(
      'after',
      `
Examples:
  $ openapi-to-mcp generate petstore.yaml --output ./my-server
  $ openapi-to-mcp generate api.json -o ./server -a bearer -v`
    )
    .action(async (openapiPath: string, options: GenerateOptions) => {
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

      // Log parsed arguments
      logger.info('Generate command called');
      logger.debug('OpenAPI path:', resolvedPath);
      logger.debug('Output directory:', outputPath);
      logger.debug('Format:', options.format || 'auto-detect');
      logger.debug('Auth type:', options.authType || 'auto-detect');
      logger.debug('Force overwrite:', options.force || false);

      // Load and parse OpenAPI document (Story 2.1)
      logger.info('Loading OpenAPI document...');
      try {
        const result = await loadOpenAPIDocument(resolvedPath);

        if (options.verbose) {
          // eslint-disable-next-line no-console
          console.log(`✓ Loaded OpenAPI document from: ${result.filePath}`);
          // eslint-disable-next-line no-console
          console.log(`  Format: ${result.format}`);
          // eslint-disable-next-line no-console
          console.log(`  Size: ${result.size} bytes`);
          // eslint-disable-next-line no-console
          console.log(`  OpenAPI version: ${'openapi' in result.document ? result.document.openapi : 'N/A'}`);
          // eslint-disable-next-line no-console
          console.log(`  API title: ${result.document.info.title}`);
        }

        logger.debug('OpenAPI document loaded successfully');
        logger.debug('Document version:', 'openapi' in result.document ? result.document.openapi : 'N/A');
        logger.debug('Document title:', result.document.info.title);

        // Validate OpenAPI schema (Story 2.2)
        logger.info('Validating OpenAPI schema...');
        const validationResult = await validateOpenAPISchema(result.document);

        // Handle validation errors
        if (!validationResult.valid) {
          let errorMsg = 'OpenAPI schema validation failed:\n\n';
          validationResult.errors.forEach((issue: ValidationIssue, index: number) => {
            errorMsg += `  ${index + 1}. [${issue.path}] ${issue.message}`;
            if (issue.expected && issue.actual) {
              errorMsg += `\n     Expected: ${issue.expected}, Got: ${issue.actual}`;
            }
            errorMsg += '\n';
          });
          throw new ValidationError(errorMsg.trim());
        }

        // Display warnings if any (non-blocking)
        if (validationResult.warnings.length > 0 && !options.force) {
          // eslint-disable-next-line no-console
          console.log('\n⚠️  OpenAPI schema warnings:');
          validationResult.warnings.forEach((issue: ValidationIssue, index: number) => {
            // eslint-disable-next-line no-console
            console.log(`  ${index + 1}. [${issue.path}] ${issue.message}`);
          });
          // eslint-disable-next-line no-console
          console.log('\nUse --force to bypass warnings\n');
        }

        if (options.verbose) {
          // eslint-disable-next-line no-console
          console.log('✓ OpenAPI schema validation passed');
        }

        // Resolve $ref references (Story 2.3)
        logger.info('Resolving $ref references...');
        const basePath = dirname(resolvedPath);
        const resolutionResult = await resolveReferences(result.document, basePath);

        // Handle resolution errors
        if (resolutionResult.errors.length > 0) {
          let errorMsg = 'Reference resolution failed:\n\n';
          resolutionResult.errors.forEach((error: ResolutionError, index: number) => {
            errorMsg += `  ${index + 1}. [${error.type}] ${error.reference}\n`;
            errorMsg += `     ${error.message}\n`;
            if (error.path !== 'document') {
              errorMsg += `     Location: ${error.path}\n`;
            }
          });
          throw new ValidationError(errorMsg.trim());
        }

        if (options.verbose) {
          // eslint-disable-next-line no-console
          console.log(`✓ Resolved ${resolutionResult.resolved} $ref references`);
        }

        logger.debug(`Successfully resolved ${resolutionResult.resolved} references`);

        // Use resolved document for subsequent processing
        const resolvedDocument = resolutionResult.document;
        logger.debug('Document fully resolved and ready for schema extraction');

        // Story 2.4: Extract and normalize schemas
        logger.info('Extracting and normalizing schemas...');
        const schemaMap: SchemaMap = extractSchemas(resolvedDocument);

        if (options.verbose) {
          // eslint-disable-next-line no-console
          console.log(`✓ Extracted ${schemaMap.size} schemas`);
        }

        logger.debug(`Extracted ${schemaMap.size} schemas from document`);

        // Story 2.5: Extract operations
        logger.info('Extracting operations...');
        const operations: OperationMetadata[] = extractOperations(resolvedDocument);

        if (options.verbose) {
          // eslint-disable-next-line no-console
          console.log(`✓ Extracted ${operations.length} operations`);
        }

        logger.debug(`Extracted ${operations.length} operations from document`);

        // Story 2.6: Extract security schemes
        logger.info('Extracting security schemes...');
        const securityResult: SecurityExtractionResult = extractSecuritySchemes(
          resolvedDocument,
          operations
        );

        const schemeCount = Object.keys(securityResult.schemes).length;
        if (options.verbose) {
          // eslint-disable-next-line no-console
          console.log(`✓ Extracted ${schemeCount} security schemes`);

          if (securityResult.warnings.length > 0) {
            securityResult.warnings.forEach((warning) => {
              // eslint-disable-next-line no-console
              console.log(`  ⚠️  ${warning}`);
            });
          }

          Object.entries(securityResult.schemes).forEach(([name, scheme]) => {
            const supportStatus = scheme.supported ? 'supported' : 'manual implementation required';
            // eslint-disable-next-line no-console
            console.log(`  - ${name}: ${scheme.classification} (${supportStatus})`);
          });
        }

        logger.debug(`Extracted ${schemeCount} security schemes`);

        // Story 2.7: Extract tags
        logger.info('Extracting tags...');
        const tagResult: TagExtractionResult = extractTags(resolvedDocument, operations);

        if (options.verbose) {
          // eslint-disable-next-line no-console
          console.log(`✓ Extracted ${tagResult.tags.length} tags`);

          if (tagResult.warnings.length > 0) {
            tagResult.warnings.forEach((warning) => {
              // eslint-disable-next-line no-console
              console.log(`  ⚠️  ${warning}`);
            });
          }

          tagResult.tags.forEach((tag) => {
            const sourceLabel =
              tag.source === 'root'
                ? 'root'
                : tag.source === 'operation'
                  ? 'operation'
                  : 'generated';
            // eslint-disable-next-line no-console
            console.log(`  - ${tag.name}: ${tag.operationCount} operations (${sourceLabel})`);
          });
        }

        logger.debug(`Extracted ${tagResult.tags.length} tags`);

        // Story 2.8: Extract servers
        logger.info('Extracting servers...');
        const serverResult: ServerExtractionResult = extractServers(resolvedDocument);

        if (options.verbose) {
          // eslint-disable-next-line no-console
          console.log(`✓ Extracted ${serverResult.servers.length} server(s)`);
          // eslint-disable-next-line no-console
          console.log(`  Default server: ${serverResult.defaultServer.baseURL || 'relative URLs'}`);

          if (serverResult.warnings.length > 0) {
            serverResult.warnings.forEach((warning) => {
              // eslint-disable-next-line no-console
              console.log(`  ⚠️  ${warning}`);
            });
          }

          serverResult.servers.forEach((server) => {
            // eslint-disable-next-line no-console
            console.log(
              `  - ${server.baseURL} (${server.environment}, priority: ${server.priority})`
            );
            if (server.variables) {
              Object.entries(server.variables).forEach(([name, variable]) => {
                // eslint-disable-next-line no-console
                console.log(`    - {${name}}: default="${variable.default}"`);
              });
            }
          });
        }

        logger.debug(
          `Extracted ${serverResult.servers.length} servers, default: ${serverResult.defaultServer.baseURL || 'relative URLs'}`
        );

        // TODO: Pass all extracted metadata to code generator in Epic 3
        logger.debug('All metadata extracted and ready for code generation');
      } catch (error) {
        if (error instanceof FileSystemError) {
          throw new ValidationError(
            `Failed to load OpenAPI file: ${error.message}\n\nPath: ${error.path}`
          );
        }
        if (error instanceof ParseError) {
          let errorMsg = `Failed to parse OpenAPI file: ${error.message}`;
          if (error.line) {
            errorMsg += `\n  at line ${error.line}${error.column ? `, column ${error.column}` : ''}`;
          }
          if (error.path) {
            errorMsg += `\n\nFile: ${error.path}`;
          }
          throw new ValidationError(errorMsg);
        }
        if (error instanceof UnsupportedFormatError) {
          throw new ValidationError(
            `Unsupported file format: ${error.extension}\n\nSupported formats: .json, .yaml, .yml`
          );
        }
        // Re-throw unexpected errors
        throw error;
      }

      // Check output directory (Story 1.4)
      await checkOutputDirectory(outputPath, options.force || false);

      // Get template path (Story 1.5)
      // Path from packages/cli/dist to packages/templates/hello-world
      const templatePath = resolve(__dirname, '../../../packages/templates/hello-world');

      logger.debug('Template path:', templatePath);

      // Verify template exists
      if (!existsSync(templatePath)) {
        throw new ValidationError(
          `Template not found at: ${templatePath}\n\nThis is likely a build issue. Please ensure the templates package is available.`
        );
      }

      // Copy hello-world template to output directory
      logger.info('Generating MCP server...');

      await copyTemplate(templatePath, outputPath);

      // Success message
      // eslint-disable-next-line no-console
      console.log(`\n✅ MCP server generated successfully at ${outputPath}`);
      // eslint-disable-next-line no-console
      console.log('\nNext steps:');
      // eslint-disable-next-line no-console
      console.log(`  1. cd ${outputPath}`);
      // eslint-disable-next-line no-console
      console.log('  2. npm install');
      // eslint-disable-next-line no-console
      console.log('  3. npm run build');
      // eslint-disable-next-line no-console
      console.log('  4. node dist/index.js');

      // TODO: Parser integration coming in Story 2.x
      logger.debug('Note: OpenAPI parsing will be implemented in Story 2.x');
      logger.debug('Currently generating hello-world template regardless of OpenAPI spec');
    });
}
