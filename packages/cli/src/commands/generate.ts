/**
 * Generate command implementation
 * Generates an MCP server from an OpenAPI specification
 */

import { Command } from 'commander';
import { existsSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import {
  analyzeSecurityRequirements,
  formatSecurityGuidance,
  scaffoldProject,
  generateInterfaces,
  generateToolDefinitions,
  generateOAuthClient,
  writeFile,
} from '@openapi-to-mcp/generator';
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
  NormalizedSchema,
} from '@openapi-to-mcp/parser';
import { ValidationError } from '../errors/index.js';
import { createLogger } from '../logging/index.js';
import { ProgressReporter } from '../utils/progress.js';
import { validateOutputDirectory, validateGeneratedCode } from '../utils/validation.js';
import {
  parseAuthOverride,
  loadAuthConfig,
  type AuthOverrideConfig,
} from '../utils/auth-override.js';
import { ensureDir, move, pathExists, remove } from 'fs-extra';
import { tmpdir } from 'os';
import { join } from 'path';

// Create logger for generate command
const logger = createLogger('openapi-to-mcp:cli:generate');

interface GenerateOptions {
  output: string;
  format?: string;
  verbose?: boolean;
  authType?: string;
  authOverride?: string;
  authConfig?: string;
  force?: boolean;
  debug?: boolean;
}

/**
 * Generate MCP server from parsed OpenAPI metadata
 */
async function generateMCPServer(
  outputPath: string,
  result: { document: { info: { title: string; version: string; description?: string }; externalDocs?: { url: string } } },
  schemaMap: SchemaMap,
  operations: OperationMetadata[],
  securityResult: SecurityExtractionResult,
  tagResult: TagExtractionResult,
  serverResult: ServerExtractionResult
): Promise<void> {
  // Calculate total steps for accurate progress tracking
  const totalSteps =
    1 + // Scaffolding
    schemaMap.size + // Interface generation (one per schema)
    operations.length + // Tool generation (one per operation)
    2; // Server file + HTTP client

  // Initialize progress reporter
  const progress = new ProgressReporter();
  progress.start(totalSteps, 'Initializing generation...');

  let currentStep = 0;

  try {
    logger.info('⚙️  Step 1/5: Scaffolding project structure...');

    // Step 1: Scaffold project
    progress.update(++currentStep, 'Creating project structure...');
    await scaffoldProject({
    outputDir: outputPath,
    apiName: result.document.info.title,
    apiVersion: result.document.info.version,
    apiDescription: result.document.info.description || 'No description provided',
    baseURL: serverResult.defaultServer.baseURL,
    license: 'MIT',
    securitySchemes: Object.entries(securityResult.schemes).map(([name, scheme]) => ({
      name,
      type: scheme.type,
      classification: scheme.classification,
      supported: scheme.supported,
      metadata: scheme.metadata,
    })),
    tags: tagResult.tags.map((tag) => ({
      name: tag.name,
      pascalName: tag.name,
      displayName: tag.displayName,
      description: tag.description,
      operationCount: tag.operationCount,
    })),
    operationCount: operations.length,
    externalDocsUrl: result.document.externalDocs?.url,
  });

  logger.info('✅ Project structure scaffolded');

  // Step 2: Generate TypeScript interfaces
  logger.info('⚙️  Step 2/5: Generating TypeScript interfaces...');

  const schemaRecord: Record<string, NormalizedSchema> = {};
  schemaMap.forEach((schema, name) => {
    schemaRecord[name] = schema;
    progress.update(++currentStep, `Generating interface: ${name}`);
  });

  const interfaceResult = generateInterfaces(schemaRecord, {
    includeComments: true,
    includeExamples: false,
    exportAll: true,
  });

  const typesFilePath = resolve(outputPath, 'src/types.ts');
  await writeFile(typesFilePath, interfaceResult.code);

  logger.info(`✅ Generated ${interfaceResult.interfaces.length} TypeScript interfaces`);

  // Step 3: Generate MCP tool definitions
  logger.info('⚙️  Step 3/5: Generating MCP tool definitions...');

  const toolResult = generateToolDefinitions(operations, {
    includeTags: true,
    includeSecurity: true,
    generateExecuteCode: true,
  });

  // Update progress for each tool generated
  operations.forEach((op) => {
    progress.update(++currentStep, `Generating tool: ${op.operationId}`);
  });

  const toolsCode = `/**
 * MCP Tool Definitions
 * Generated from OpenAPI specification
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';

${toolResult.tools
  .map(
    (tool) => `export const ${tool.name}Tool: Tool = ${JSON.stringify(tool, null, 2)};`
  )
  .join('\n\n')}

// Export all tools as an array
export const allTools: Tool[] = [
${toolResult.tools.map((tool) => `  ${tool.name}Tool`).join(',\n')}
];
`;

  const toolsFilePath = resolve(outputPath, 'src/tools.ts');
  await writeFile(toolsFilePath, toolsCode);

  logger.info(`✅ Generated ${toolResult.tools.length} MCP tools`);

  // Step 4: Generate main server file
  logger.info('⚙️  Step 4/5: Generating server entry point...');
  progress.update(++currentStep, 'Creating server entry point...');

  const serverCode = `/**
 * MCP Server Entry Point
 * Generated from ${result.document.info.title} v${result.document.info.version}
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { allTools } from './tools.js';
import { httpClient } from './http-client.js';
import type { AxiosRequestConfig } from 'axios';

// Type definitions for operation metadata
interface ParameterMetadata {
  name: string;
  in: 'path' | 'query' | 'header';
  required: boolean;
  description?: string;
  schema?: Record<string, unknown>;
  style?: string;
  explode?: boolean;
}

interface RequestBodyMetadata {
  required: boolean;
  description?: string;
  mediaType: string;
  schemaName?: string;
  schema?: Record<string, unknown>;
}

interface ResponseMetadata {
  statusCode: string;
  description: string;
  mediaType?: string;
  schemaName?: string;
}

interface OperationMetadata {
  operationId: string;
  method: string;
  path: string;
  summary?: string;
  description?: string;
  tags: string[];
  pathParameters: ParameterMetadata[];
  queryParameters: ParameterMetadata[];
  headerParameters: ParameterMetadata[];
  requestBody?: RequestBodyMetadata;
  responses: ResponseMetadata[];
  deprecated: boolean;
}

// Operation metadata for API calls
const operations: OperationMetadata[] = ${JSON.stringify(operations, null, 2)};

// Create MCP server
const server = new Server(
  {
    name: '${result.document.info.title.replace(/'/g, "\\'")}',
    version: '${result.document.info.version}',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: allTools,
  };
});

// Register tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const tool = allTools.find((t) => t.name === toolName);

  if (!tool) {
    throw new Error(\`Unknown tool: \${toolName}\`);
  }

  try {
    // Find operation metadata for this tool
    const operation = operations.find((op) => op.operationId === toolName);
    if (!operation) {
      throw new Error(\`Operation metadata not found for tool: \${toolName}\`);
    }

    // Build URL with path parameters
    let url = operation.path;
    const args = request.params.arguments as Record<string, unknown>;

    // Replace path parameters in URL
    for (const param of operation.pathParameters) {
      const value = args[param.name];
      if (value === undefined && param.required) {
        throw new Error(\`Missing required path parameter: \${param.name}\`);
      }
      url = url.replace(\`{\${param.name}}\`, encodeURIComponent(String(value || '')));
    }

    // Build request configuration
    const requestConfig: AxiosRequestConfig = {
      method: operation.method.toUpperCase(),
      url,
    };

    // Add query parameters
    if (operation.queryParameters.length > 0) {
      requestConfig.params = {};
      for (const param of operation.queryParameters) {
        const value = args[param.name];
        if (value !== undefined) {
          requestConfig.params[param.name] = value;
        }
      }
    }

    // Add request body
    if (operation.requestBody && args.body !== undefined) {
      requestConfig.data = args.body;
    }

    // Add header parameters
    if (operation.headerParameters.length > 0) {
      const headers: Record<string, string> = {};
      for (const param of operation.headerParameters) {
        const value = args[param.name];
        if (value !== undefined) {
          headers[param.name] = String(value);
        }
      }
      requestConfig.headers = headers;
    }

    // Execute API call
    const response = await httpClient.request(requestConfig);

    // Return response data in MCP format
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(\`API call failed: \${errorMessage}\`);
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('${result.document.info.title} MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
`;

  const indexFilePath = resolve(outputPath, 'src/index.ts');
  await writeFile(indexFilePath, serverCode);

  logger.info('✅ Server entry point generated');

  // Step 4.5: Generate OAuth client if OAuth2 authentication is used (Epic 8)
  const hasOAuth = Object.values(securityResult.schemes).some((s) => s.classification === 'oauth2');
  if (hasOAuth) {
    logger.info('⚙️  Step 4.5/5: Generating OAuth client...');
    progress.update(++currentStep, 'Creating OAuth authentication client...');

    // Create minimal ParseResult-like object for generateOAuthClient function
    const parseResultForOAuth = {
      security: securityResult,
    } as any;

    // Use generator's OAuth client function (supports all flows)
    const oauthClientCode = generateOAuthClient(parseResultForOAuth);

    if (oauthClientCode) {
      // Create auth directory and write OAuth client file
      const authDir = resolve(outputPath, 'src/auth');
      await ensureDir(authDir);

      const oauthClientPath = resolve(outputPath, 'src/auth/oauth-client.ts');
      await writeFile(oauthClientPath, oauthClientCode);

      logger.info('✅ OAuth client generated');
    }
  }

  // Step 5: Generate HTTP client
  logger.info('⚙️  Step 5/5: Generating HTTP client...');
  progress.update(++currentStep, 'Creating HTTP client...');

  // Generate OAuth import if needed
  const oauthImport = hasOAuth ? "import { getAccessToken } from './auth/oauth-client.js';\n" : '';

  const clientCode = `/**
 * HTTP Client
 * Configured for ${result.document.info.title}
 */

import axios from 'axios';
${oauthImport}
export const baseURL = '${serverResult.defaultServer.baseURL}';

// Configure HTTP client with base URL
export const httpClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
httpClient.interceptors.request.use(async (config) => {
  ${
    Object.keys(securityResult.schemes).length > 0
      ? `// Apply authentication based on security schemes
  const authSchemes = ${JSON.stringify(securityResult.schemes, null, 2)};

  for (const [name, scheme] of Object.entries(authSchemes)) {
    const schemeTyped = scheme as any;
    switch (schemeTyped.type) {
      case 'apiKey':
        // API Key authentication
        const apiKeyValue = process.env[name.toUpperCase()] || process.env[\`\${name.toUpperCase()}_API_KEY\`];
        if (apiKeyValue) {
          if (schemeTyped.in === 'header') {
            config.headers = config.headers || {};
            config.headers[schemeTyped.paramName] = apiKeyValue;
          } else if (schemeTyped.in === 'query') {
            config.params = config.params || {};
            config.params[schemeTyped.paramName] = apiKeyValue;
          }
        }
        break;

      case 'http':
        // HTTP authentication (Bearer or Basic)
        if (schemeTyped.scheme === 'bearer') {
          const bearerToken = process.env.BEARER_TOKEN || process.env[\`\${name.toUpperCase()}_TOKEN\`];
          if (bearerToken) {
            config.headers = config.headers || {};
            config.headers.Authorization = \`Bearer \${bearerToken}\`;
          }
        } else if (schemeTyped.scheme === 'basic') {
          const username = process.env.BASIC_USER || process.env[\`\${name.toUpperCase()}_USER\`];
          const password = process.env.BASIC_PASS || process.env[\`\${name.toUpperCase()}_PASS\`];
          if (username && password) {
            const credentials = Buffer.from(\`\${username}:\${password}\`).toString('base64');
            config.headers = config.headers || {};
            config.headers.Authorization = \`Basic \${credentials}\`;
          }
        }
        break;

      case 'oauth2':
        // OAuth2 authentication with automatic token management
        try {
          const token = await getAccessToken();
          config.headers = config.headers || {};
          config.headers.Authorization = \`Bearer \${token}\`;
        } catch (error: any) {
          console.error('[http-client] OAuth authentication error:', error.message);
          throw error;
        }
        break;

      default:
        console.warn(\`Unsupported authentication scheme: \${schemeTyped.type}\`);
    }
  }`
      : '// No authentication configured'
  }

  return config;
});

// Add response interceptor for error handling${
    hasOAuth
      ? ` and token refresh
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = await getAccessToken();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = \`Bearer \${token}\`;
        return httpClient(originalRequest);
      } catch (refreshError: any) {
        console.error('[http-client] Token refresh failed:', refreshError.message);
        throw error;
      }
    }

    console.error('[http-client] API request failed:', error.message);
    throw error;
  }
);`
      : `
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API request failed:', error.message);
    throw error;
  }
);`
  }
`;

  const clientFilePath = resolve(outputPath, 'src/http-client.ts');
  await writeFile(clientFilePath, clientCode);

  logger.info('✅ HTTP client generated');

    // Mark generation as complete
    progress.complete();
  } catch (error) {
    // Stop progress on error
    progress.stop();
    throw error;
  }
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
      'authentication type (deprecated: use --auth-override instead)'
    )
    .option(
      '--auth-override <auth>',
      'override authentication when OpenAPI spec is missing securitySchemes\n' +
        '  Formats:\n' +
        '    apiKey:header:X-API-Key   - API Key in header\n' +
        '    apiKey:query:api_key      - API Key in query parameter\n' +
        '    bearer                    - Bearer token\n' +
        '    bearer:JWT                - Bearer with format\n' +
        '    basic                     - HTTP Basic auth\n' +
        '    oauth2-client-credentials:https://auth.example.com/token\n' +
        '    bearer+apiKey:header:X-Key - Multiple schemes (AND logic)'
    )
    .option(
      '--auth-config <path>',
      'path to JSON file with complex auth configuration\n' +
        '  Use this for OAuth2, OpenID Connect, or multi-scheme setups'
    )
    .option('--force', 'overwrite output directory if it exists')
    .option('--debug', 'enable debug mode with detailed error information')
    .addHelpText(
      'after',
      `
Examples:
  Basic generation:
    $ openapi-to-mcp generate petstore.yaml --output ./my-server

  With auth override (when spec missing securitySchemes):
    $ openapi-to-mcp generate api.json -o ./server --auth-override bearer
    $ openapi-to-mcp generate api.json -o ./server --auth-override "apiKey:header:X-API-Key"
    $ openapi-to-mcp generate api.json -o ./server --auth-override "oauth2-client-credentials:https://auth.example.com/token"

  With auth config file:
    $ openapi-to-mcp generate api.json -o ./server --auth-config ./auth.json

  Multiple schemes (AND logic):
    $ openapi-to-mcp generate api.json -o ./server --auth-override "bearer+apiKey:header:X-Key"

  Debug mode:
    $ openapi-to-mcp generate api.json -o ./server --debug`
    )
    .action(async (openapiPath: string, options: GenerateOptions) => {
      try {
        // Set verbose mode for error handling
        if (options.verbose) {
          process.env.VERBOSE = 'true';
        }

        // Set debug mode
        if (options.debug) {
          process.env.DEBUG = '*';
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

      // Declare variables for parsed metadata (will be populated in try block)
      let result: Awaited<ReturnType<typeof loadOpenAPIDocument>>;
      let schemaMap: SchemaMap;
      let operations: OperationMetadata[];
      let securityResult: SecurityExtractionResult;
      let tagResult: TagExtractionResult;
      let serverResult: ServerExtractionResult;

      // Load and parse OpenAPI document (Story 2.1)
      logger.info('Loading OpenAPI document...');
      try {
        result = await loadOpenAPIDocument(resolvedPath);

        if (options.verbose) {
           
          console.log(`✓ Loaded OpenAPI document from: ${result.filePath}`);
           
          console.log(`  Format: ${result.format}`);
           
          console.log(`  Size: ${result.size} bytes`);
           
          console.log(`  OpenAPI version: ${'openapi' in result.document ? result.document.openapi : 'N/A'}`);
           
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
           
          console.log('\n⚠️  OpenAPI schema warnings:');
          validationResult.warnings.forEach((issue: ValidationIssue, index: number) => {
             
            console.log(`  ${index + 1}. [${issue.path}] ${issue.message}`);
          });
           
          console.log('\nUse --force to bypass warnings\n');
        }

        if (options.verbose) {
           
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
           
          console.log(`✓ Resolved ${resolutionResult.resolved} $ref references`);
        }

        logger.debug(`Successfully resolved ${resolutionResult.resolved} references`);

        // Use resolved document for subsequent processing
        const resolvedDocument = resolutionResult.document;
        logger.debug('Document fully resolved and ready for schema extraction');

        // Story 2.4: Extract and normalize schemas
        logger.info('Extracting and normalizing schemas...');
        schemaMap = extractSchemas(resolvedDocument);

        if (options.verbose) {
           
          console.log(`✓ Extracted ${schemaMap.size} schemas`);
        }

        logger.debug(`Extracted ${schemaMap.size} schemas from document`);

        // Story 2.5: Extract operations
        logger.info('Extracting operations...');
        operations = extractOperations(resolvedDocument);

        if (options.verbose) {
           
          console.log(`✓ Extracted ${operations.length} operations`);
        }

        logger.debug(`Extracted ${operations.length} operations from document`);

        // Parse auth override configuration (if provided)
        let authOverride: AuthOverrideConfig | null = null;

        if (options.authOverride && options.authConfig) {
          throw new ValidationError(
            'Cannot use both --auth-override and --auth-config. Choose one.',
            'Use --auth-override for simple cases or --auth-config for complex configurations'
          );
        }

        if (options.authOverride) {
          logger.info('Parsing auth override configuration...');
          try {
            authOverride = parseAuthOverride(options.authOverride);
            logger.debug(`Parsed auth override: ${JSON.stringify(authOverride.schemes)}`);

            if (options.verbose) {
              console.log('\n🔐 Auth override configuration:');
              Object.entries(authOverride.schemes).forEach(([name, scheme]) => {
                console.log(`  - ${name}: ${scheme.type}`);
              });
            }
          } catch (error) {
            throw new ValidationError(
              `Invalid auth override format: ${(error as Error).message}`,
              'Check --help for supported auth override formats'
            );
          }
        }

        if (options.authConfig) {
          logger.info('Loading auth configuration from file...');
          try {
            authOverride = loadAuthConfig(options.authConfig);
            logger.debug(`Loaded auth config: ${JSON.stringify(authOverride.schemes)}`);

            if (options.verbose) {
              console.log('\n🔐 Auth configuration loaded:');
              Object.entries(authOverride.schemes).forEach(([name, scheme]) => {
                console.log(`  - ${name}: ${scheme.type}`);
              });
            }
          } catch (error) {
            throw new ValidationError(
              `Failed to load auth config file: ${(error as Error).message}`,
              `Ensure the file exists and contains valid JSON: ${options.authConfig}`
            );
          }
        }

        // Apply auth override to OpenAPI document if provided
        if (authOverride && Object.keys(authOverride.schemes).length > 0) {
          logger.info('Applying auth override to OpenAPI document...');

          // Inject security schemes into document
          if (!resolvedDocument.components) {
            resolvedDocument.components = {};
          }
          if (!resolvedDocument.components.securitySchemes) {
            resolvedDocument.components.securitySchemes = {};
          }

          // Add override schemes (override takes precedence)
          Object.assign(resolvedDocument.components.securitySchemes, authOverride.schemes);

          // Apply global security requirement if specified
          if (authOverride.security && authOverride.security.length > 0) {
            resolvedDocument.security = authOverride.security;
          }

          logger.debug(
            `Applied ${Object.keys(authOverride.schemes).length} auth override scheme(s)`
          );
        }

        // Story 2.6: Extract security schemes
        logger.info('Extracting security schemes...');
        securityResult = extractSecuritySchemes(
          resolvedDocument,
          operations
        );

        const schemeCount = Object.keys(securityResult.schemes).length;
        if (options.verbose) {
           
          console.log(`✓ Extracted ${schemeCount} security schemes`);

          if (securityResult.warnings.length > 0) {
            securityResult.warnings.forEach((warning) => {
               
              console.log(`  ⚠️  ${warning}`);
            });
          }

          Object.entries(securityResult.schemes).forEach(([name, scheme]) => {
            const supportStatus = scheme.supported ? 'supported' : 'manual implementation required';
             
            console.log(`  - ${name}: ${scheme.classification} (${supportStatus})`);
          });
        }

        logger.debug(`Extracted ${schemeCount} security schemes`);

        // Story 4.6: Analyze security requirements and generate guidance
        if (schemeCount > 0) {
          logger.info('Analyzing security requirements...');

          // Convert security schemes to template data format
          const securitySchemeData = Object.entries(securityResult.schemes).map(
            ([name, scheme]) => ({
              name,
              type: scheme.type,
              scheme: scheme.scheme,
              bearerFormat: scheme.bearerFormat,
              in: scheme.in,
              paramName: scheme.paramName,
              flows: scheme.flows,
              classification: scheme.classification,
              supported: scheme.supported,
              metadata: scheme.metadata,  // BUGFIX: Include metadata for OAuth2 primaryFlow
            })
          );

          // Analyze security requirements
          const securityGuidance = analyzeSecurityRequirements(
            securitySchemeData,
            resolvedDocument.security || [],
            securityResult.hasOperationSecurity
          );

          // Display security guidance to user
          if (options.verbose || securityGuidance.unsupported.length > 0) {
             
            console.log('\n' + formatSecurityGuidance(securityGuidance));
          }

          logger.debug('Security guidance generated successfully');
        }

        // Story 2.7: Extract tags
        logger.info('Extracting tags...');
        tagResult = extractTags(resolvedDocument, operations);

        if (options.verbose) {
           
          console.log(`✓ Extracted ${tagResult.tags.length} tags`);

          if (tagResult.warnings.length > 0) {
            tagResult.warnings.forEach((warning) => {
               
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
             
            console.log(`  - ${tag.name}: ${tag.operationCount} operations (${sourceLabel})`);
          });
        }

        logger.debug(`Extracted ${tagResult.tags.length} tags`);

        // Story 2.8: Extract servers
        logger.info('Extracting servers...');
        serverResult = extractServers(resolvedDocument);

        if (options.verbose) {
           
          console.log(`✓ Extracted ${serverResult.servers.length} server(s)`);
           
          console.log(`  Default server: ${serverResult.defaultServer.baseURL || 'relative URLs'}`);

          if (serverResult.warnings.length > 0) {
            serverResult.warnings.forEach((warning) => {
               
              console.log(`  ⚠️  ${warning}`);
            });
          }

          serverResult.servers.forEach((server) => {
             
            console.log(
              `  - ${server.baseURL} (${server.environment}, priority: ${server.priority})`
            );
            if (server.variables) {
              Object.entries(server.variables).forEach(([name, variable]) => {
                 
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

      // Pre-generation validation (Story 5.8)
      logger.info('Validating output directory...');
      await validateOutputDirectory(outputPath, options.force || false);

      // Create temporary directory for atomic generation (Story 5.8)
      const tempDir = join(tmpdir(), `.tmp-generation-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      logger.debug(`Creating temporary directory: ${tempDir}`);

      try {
        await ensureDir(tempDir);

        // Generate MCP server to temporary location (Story 5.1 + 5.8)
        logger.info('🚀 Generating MCP server from OpenAPI specification (atomic mode)...');

        await generateMCPServer(
          tempDir,
          result,
          schemaMap,
          operations,
          securityResult,
          tagResult,
          serverResult
        );

        // Post-generation validation (Story 5.8)
        logger.info('Validating generated code...');
        const validation = await validateGeneratedCode(tempDir);

        if (!validation.valid) {
          logger.error(`Validation errors: ${validation.errors.join(', ')}`);
          throw new ValidationError(
            `Generated code validation failed: ${validation.errors.join('; ')}`,
            'Review OpenAPI specification for issues',
            validation.errors.join('\n')
          );
        }

        // Atomic move to final location (Story 5.8)
        logger.info('Moving to final location...');

        if (await pathExists(outputPath)) {
          if (options.force) {
            // Backup existing output before overwriting
            const backup = `${outputPath}.backup-${Date.now()}`;
            await move(outputPath, backup);
            logger.debug(`Backed up existing output to: ${backup}`);
          } else {
            throw new ValidationError(
              `Output directory already exists: ${outputPath}`,
              'Use --force flag to overwrite existing directory',
              `${process.argv.slice(0, 3).join(' ')} --force`
            );
          }
        }

        // Atomically move from temp to final location
        await move(tempDir, outputPath, { overwrite: options.force });
        logger.info('✅ Atomic generation transaction completed successfully');

      } catch (error) {
        // Rollback: cleanup temporary directory (Story 5.8)
        logger.error('Generation failed, rolling back...');
        await remove(tempDir).catch((cleanupError) => {
          logger.warn(`Cleanup warning: ${(cleanupError as Error).message}`);
        });

        // Re-throw the original error
        throw error;
      }

      // Success message with summary
       
      console.log('');
       
      console.log('═'.repeat(60));
       
      console.log('✅ MCP server generated successfully!');
       
      console.log('═'.repeat(60));
       
      console.log('');
       
      console.log(`📍 Output location: ${outputPath}`);
       
      console.log('');
       
      console.log('📊 Generation Summary:');
       
      console.log(`   • ${operations.length} MCP tools`);
       
      console.log(`   • ${schemaMap.size} TypeScript interfaces`);
       
      console.log(`   • ${Object.keys(securityResult.schemes).length} authentication scheme(s)`);
       
      console.log(`   • ${tagResult.tags.length} API categories`);
       
      console.log('');
       
      console.log('📝 Next steps:');
       
      console.log(`   1. cd ${outputPath}`);
       
      console.log('   2. npm install');
       
      console.log('   3. npm run build');
       
      console.log('   4. node dist/index.js');
       
      console.log('');
    } catch (error) {
        // Enhanced error handling with debug mode
        if (options.debug) {
           
          console.error('\n=== DEBUG INFORMATION ===');
           
          console.error('Error Name:', (error as Error).name);
           
          console.error('Error Message:', (error as Error).message);
           
          console.error('Stack Trace:', (error as Error).stack);
           
          console.error('\nOptions:', JSON.stringify(options, null, 2));
           
          console.error('\nEnvironment:');
           
          console.error('  Node Version:', process.version);
           
          console.error('  Platform:', process.platform);
           
          console.error('  CWD:', process.cwd());
           
          console.error('========================\n');
        }

        // Standard error handling
        if (error instanceof ValidationError) {
           
          console.error(`\n❌ ${error.message}\n`);
          if (!options.debug) {
             
            console.error('💡 Use --debug flag for detailed error information\n');
          }
        } else {
           
          console.error(`\n❌ Generation failed: ${(error as Error).message}\n`);
          if (!options.debug) {
             
            console.error('💡 Use --debug flag for detailed error information\n');
          }
        }

        process.exit(1);
      }
    });
}
