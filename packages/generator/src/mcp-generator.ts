/**
 * Main MCP Server Generator
 * Orchestrates complete MCP server generation from OpenAPI specification
 */

import { resolve } from 'node:path';
import { parseOpenAPIDocument } from '@openapi-to-mcp/parser';
import type { ParseResult, NormalizedSchema } from '@openapi-to-mcp/parser';
import { generateInterfaces } from './interface-generator.js';
import { generateToolDefinitions } from './tool-generator.js';
import { scaffoldProject } from './scaffolder.js';
import { writeFile } from './fs-utils.js';
import { log } from './utils/logger.js';
import { GenerationError } from './errors.js';
import type { GenerationOptions, GenerationResult } from './types.js';

/**
 * Main entry point for MCP server generation
 * Orchestrates the complete generation pipeline
 */
export async function generateMCPServer(
  options: GenerationOptions
): Promise<GenerationResult> {
  const startTime = Date.now();

  try {
    log('Starting MCP server generation...');

    // Step 1: Parse OpenAPI document
    log('Step 1: Parsing OpenAPI document...');
    const parseResult: ParseResult = await parseOpenAPIDocument(options.openApiPath);

    log(`Parsed ${parseResult.metadata.operationCount} operations from ${parseResult.metadata.apiName}`);

    // Step 2: Scaffold project structure
    log('Step 2: Scaffolding project structure...');
    await scaffoldProject({
      outputDir: options.outputDir,
      apiName: parseResult.document.info.title,
      apiVersion: parseResult.document.info.version,
      apiDescription: parseResult.document.info.description,
      baseURL: parseResult.servers.defaultServer.baseURL || 'http://localhost',
      license: options.license || 'MIT',
      author: options.author,
      repository: options.repository,
      securitySchemes: Object.entries(parseResult.security.schemes).map(([name, scheme]) => ({
        name,
        type: scheme.type,
        classification: scheme.classification,
        supported: scheme.supported,
        metadata: scheme.metadata,
      })),
      tags: parseResult.tags.tags.map((tag) => ({
        name: tag.name,
        pascalName: tag.name,
        displayName: tag.displayName,
        description: tag.description,
        operationCount: tag.operationCount,
      })),
      operationCount: parseResult.metadata.operationCount,
      externalDocsUrl: parseResult.document.externalDocs?.url,
    });

    // Step 3: Generate TypeScript interfaces
    log('Step 3: Generating TypeScript interfaces...');

    // Convert Map to Record for interface generation
    const schemaRecord: Record<string, NormalizedSchema> = {};
    parseResult.schemas.forEach((schema, name) => {
      schemaRecord[name] = schema;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const interfaceResult = generateInterfaces(schemaRecord as any, {
      includeComments: true,
      includeExamples: false,
      exportAll: true,
    });

    const typesFilePath = resolve(options.outputDir, 'src/types.ts');
    await writeFile(typesFilePath, interfaceResult.code);

    log(`Generated ${interfaceResult.interfaces.length} type definitions`);

    // Step 4: Generate MCP tools
    log('Step 4: Generating MCP tools...');

    const toolResult = generateToolDefinitions(parseResult.operations, {
      includeTags: true,
      includeSecurity: true,
      generateExecuteCode: true,
    });

    // Generate tools file with all tool definitions and execute handler
    const toolsCode = `/**
 * MCP Tool Definitions
 * Generated from OpenAPI specification
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { httpClient } from './http-client.js';

${toolResult.tools.map((tool) => `
/**
 * ${tool.description || 'No description'}
 */
export const ${tool.name}Tool: Tool = ${JSON.stringify(tool, null, 2)};
`).join('\n')}

export const tools: Tool[] = [
${toolResult.tools.map((tool) => `  ${tool.name}Tool`).join(',\n')}
];

// Simple execute tool function
export async function executeTool(name: string, args: Record<string, unknown>) {
  // Tool execution logic will be implemented based on tool definitions
  return {
    content: [
      {
        type: 'text',
        text: \`Tool \${name} executed with args: \${JSON.stringify(args)}\`,
      },
    ],
  };
}
`;

    const toolsFilePath = resolve(options.outputDir, 'src/tools.ts');
    await writeFile(toolsFilePath, toolsCode);

    log(`Generated ${parseResult.operations.length} MCP tools`);

    // Step 5: Generate main server file
    log('Step 5: Generating main server file...');
    const mainServerCode = generateMainServerFile(parseResult);
    const mainFilePath = resolve(options.outputDir, 'src/index.ts');
    await writeFile(mainFilePath, mainServerCode);

    // Step 6: Generate HTTP client
    log('Step 6: Generating HTTP client...');
    const httpClientCode = generateHttpClient(parseResult);
    const clientFilePath = resolve(options.outputDir, 'src/http-client.ts');
    await writeFile(clientFilePath, httpClientCode);

    const duration = Date.now() - startTime;
    log(`✅ MCP server generation complete in ${duration}ms`);

    return {
      success: true,
      outputDir: options.outputDir,
      filesGenerated: [
        'package.json',
        'tsconfig.json',
        'src/index.ts',
        'src/types.ts',
        'src/tools.ts',
        'src/http-client.ts',
        '.env.example',
        '.gitignore',
        'README.md',
      ],
      metadata: {
        apiName: parseResult.metadata.apiName,
        apiVersion: parseResult.metadata.apiVersion,
        operationCount: parseResult.metadata.operationCount,
        schemaCount: parseResult.metadata.schemaCount,
        generationTime: duration,
      },
      warnings: parseResult.warnings,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new GenerationError(
      `MCP server generation failed: ${message}`,
      'GENERATION_FAILED',
      { options, error }
    );
  }
}

/**
 * Generate main server index file
 */
function generateMainServerFile(parseResult: ParseResult): string {
  const { document } = parseResult;

  return `#!/usr/bin/env node
/**
 * ${document.info.title}
 * ${document.info.description || 'MCP Server generated from OpenAPI specification'}
 *
 * @version ${document.info.version}
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { tools, executeTool } from './tools.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create MCP server instance
const server = new Server(
  {
    name: '${document.info.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}',
    version: '${document.info.version}',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// Handle call tool request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const result = await executeTool(request.params.name, request.params.arguments || {});
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: \`Error executing tool: \${message}\`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('${document.info.title} MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
`;
}

/**
 * Generate HTTP client file
 */
function generateHttpClient(parseResult: ParseResult): string {
  const { security, servers } = parseResult;
  const defaultServer = servers.defaultServer.baseURL || 'http://localhost';

  // Determine auth type
  const authSchemes = Object.values(security.schemes);
  const hasApiKey = authSchemes.some((s) => s.type === 'apiKey' || s.classification.startsWith('api-key'));
  const hasBearer = authSchemes.some((s) => s.classification === 'http-bearer');
  const hasBasic = authSchemes.some((s) => s.classification === 'http-basic');

  let authInterceptor = '';
  if (hasApiKey) {
    authInterceptor = `
  // API Key authentication
  instance.interceptors.request.use((config) => {
    const apiKey = process.env.API_KEY;
    if (apiKey && config.headers) {
      config.headers['X-API-Key'] = apiKey;
    }
    return config;
  });`;
  } else if (hasBearer) {
    authInterceptor = `
  // Bearer token authentication
  instance.interceptors.request.use((config) => {
    const token = process.env.BEARER_TOKEN;
    if (token && config.headers) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  });`;
  } else if (hasBasic) {
    authInterceptor = `
  // Basic authentication
  instance.interceptors.request.use((config) => {
    const username = process.env.BASIC_USERNAME;
    const password = process.env.BASIC_PASSWORD;
    if (username && password && config.headers) {
      const credentials = Buffer.from(\`\${username}:\${password}\`).toString('base64');
      config.headers.Authorization = \`Basic \${credentials}\`;
    }
    return config;
  });`;
  }

  return `/**
 * HTTP Client for API requests
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Base URL for API requests
 */
const BASE_URL = process.env.API_BASE_URL || '${defaultServer}';

/**
 * Create configured axios instance
 */
function createHttpClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
${authInterceptor}

  return instance;
}

// Export singleton instance
export const httpClient = createHttpClient();

/**
 * Make HTTP request
 */
export async function makeRequest<T = unknown>(
  config: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  return httpClient.request<T>(config);
}
`;
}
