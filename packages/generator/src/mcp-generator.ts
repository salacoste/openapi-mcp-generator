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
    const parseResult: ParseResult = await parseOpenAPIDocument(
      options.openApiPath,
      { skipValidation: options.skipValidation }
    );

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
      securitySchemes: Object.entries(parseResult.security.schemes).map(([name, scheme]) => {
        return {
          name,
          type: scheme.type,
          classification: scheme.classification,
          supported: scheme.supported,
          metadata: scheme.metadata,
        };
      }),
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

    const interfaceResult = generateInterfaces(schemaRecord, {
      includeComments: true,
      includeExamples: false,
      exportAll: true,
    });

    const typesFilePath = resolve(options.outputDir, 'src/types.ts');
    await writeFile(typesFilePath, interfaceResult.code);

    log(`Generated ${interfaceResult.interfaces.length} type definitions`);

    // Step 4: Generate MCP tools
    log('Step 4: Generating MCP tools...');

    const toolResult = generateToolDefinitions(parseResult.operations, parseResult.schemas, {
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

// Tool execution map for fast lookup
const toolMap = new Map<string, Tool>(tools.map(tool => [tool.name, tool]));

/**
 * Execute tool by name with dynamic code execution
 */
export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const tool = toolMap.get(name);

  if (!tool) {
    throw new Error(\`Tool not found: \${name}\`);
  }

  if (!tool.executeCode) {
    throw new Error(\`Tool \${name} has no executable code\`);
  }

  try {
    // Create execution context with HTTP client
    const client = httpClient;

    // Execute the tool's code dynamically using Function constructor
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const executor = new AsyncFunction('client', 'args', tool.executeCode) as (client: typeof httpClient, args: Record<string, unknown>) => Promise<{ content: Array<{ type: string; text: string }> }>;

    const result = await executor(client, args);
    return result;
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { status?: number; data?: unknown } };

    // Format error for MCP protocol
    const errorMessage = {
      error: true,
      tool: name,
      message: err.message || 'Unknown error',
      status: err.response?.status,
      data: err.response?.data,
      timestamp: new Date().toISOString()
    };

    throw new Error(JSON.stringify(errorMessage, null, 2));
  }
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

    // Step 6.5: Generate OAuth client if OAuth authentication is used (Epic 8)
    const hasOAuth = Object.values(parseResult.security.schemes).some((s) => s.classification === 'oauth2');
    if (hasOAuth) {
      log('Step 6.5: Generating OAuth client...');
      const oauthClientCode = generateOAuthClient(parseResult);
      if (oauthClientCode) {
        // Create auth directory
        const { createDirectory } = await import('./fs-utils.js');
        await createDirectory(resolve(options.outputDir, 'src/auth'));

        // Write OAuth client file
        const oauthClientPath = resolve(options.outputDir, 'src/auth/oauth-client.ts');
        await writeFile(oauthClientPath, oauthClientCode);
        log('OAuth client generated successfully');
      }
    }

    const duration = Date.now() - startTime;
    log(`✅ MCP server generation complete in ${duration}ms`);

    const filesGenerated = [
      'package.json',
      'tsconfig.json',
      'src/index.ts',
      'src/types.ts',
      'src/tools.ts',
      'src/http-client.ts',
      '.env.example',
      '.gitignore',
      'README.md',
    ];

    // Add OAuth client to file list if generated
    if (hasOAuth) {
      filesGenerated.push('src/auth/oauth-client.ts');
    }

    return {
      success: true,
      outputDir: options.outputDir,
      filesGenerated,
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
server.setRequestHandler(ListToolsRequestSchema, async (): Promise<{ tools: typeof tools }> => {
  return {
    tools,
  };
});

// Handle call tool request
server.setRequestHandler(
  CallToolRequestSchema,
  async (
    request: { params: { name: string; arguments?: Record<string, unknown> } }
  ): Promise<{
    content: Array<{ type: string; text: string }>;
    isError?: boolean;
  }> => {
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
  }
);

// Start server
async function main(): Promise<void> {
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
  const hasOAuth = authSchemes.some((s) => s.classification === 'oauth2');

  let authImports = '';
  let authInterceptor = '';

  if (hasOAuth) {
    // OAuth2 authentication (Epic 8)
    authImports = `import { getAccessToken } from './auth/oauth-client.js';`;
    authInterceptor = `
  // OAuth2 authentication
  instance.interceptors.request.use(async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
    try {
      const token = await getAccessToken();
      if (config.headers) {
        config.headers.Authorization = \`Bearer \${token}\`;
      }
    } catch (error: any) {
      console.error('[http-client] OAuth authentication error:', error.message);
      throw error;
    }
    return config;
  });

  // OAuth2 token refresh on 401 errors
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If 401 and not already retried, try to refresh token
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const token = await getAccessToken();
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = \`Bearer \${token}\`;
          }
          return instance(originalRequest);
        } catch (refreshError: any) {
          console.error('[http-client] Token refresh failed:', refreshError.message);
          throw error;
        }
      }

      throw error;
    }
  );`;
  } else if (hasApiKey) {
    authInterceptor = `
  // API Key authentication
  instance.interceptors.request.use((config: AxiosRequestConfig): AxiosRequestConfig => {
    const apiKey = process.env.API_KEY;
    if (apiKey && config.headers) {
      config.headers['X-API-Key'] = apiKey;
    }
    return config;
  });`;
  } else if (hasBearer) {
    authInterceptor = `
  // Bearer token authentication
  instance.interceptors.request.use((config: AxiosRequestConfig): AxiosRequestConfig => {
    const token = process.env.BEARER_TOKEN;
    if (token && config.headers) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  });`;
  } else if (hasBasic) {
    authInterceptor = `
  // Basic authentication
  instance.interceptors.request.use((config: AxiosRequestConfig): AxiosRequestConfig => {
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
${authImports}

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

/**
 * Generate OAuth2 client file (Epic 8)
 * @public - Exported for use by CLI
 */
export function generateOAuthClient(parseResult: ParseResult): string {
  const { security } = parseResult;

  // Find OAuth scheme
  const oauth2Scheme = Object.values(security.schemes).find((s) => s.classification === 'oauth2');
  if (!oauth2Scheme) {
    return '';
  }

  const metadata = oauth2Scheme.metadata as any;
  const primaryFlow = metadata.primaryFlow || {};

  // BUGFIX: Validate flow type exists instead of silent default
  if (!primaryFlow.type) {
    throw new Error(
      `OAuth2 scheme missing flow type. ` +
      `Scheme: ${oauth2Scheme.name}, ` +
      `Flows available: ${Object.keys(metadata.flows || {}).join(', ')}`
    );
  }

  const flowType = primaryFlow.type;
  const tokenUrl = primaryFlow.tokenUrl || '';
  const authorizationUrl = primaryFlow.authorizationUrl || '';
  const isPKCE = primaryFlow.pkce || false;

  // Generate Client Credentials flow code
  if (flowType === 'clientCredentials') {
    return `/**
 * OAuth 2.0 Client - Client Credentials Flow
 * Handles automatic token management with caching and refresh
 */

import axios from 'axios';

/** Token cache */
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get OAuth2 access token using Client Credentials flow
 * Automatically caches and refreshes tokens
 */
export async function getAccessToken(): Promise<string> {
  const now = Date.now();

  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && tokenExpiry > now + 300000) {
    if (process.env.DEBUG === 'true') {
      console.error('[oauth-client] Using cached token');
    }
    return cachedToken;
  }

  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'OAuth2 credentials missing. ' +
      'Please set OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET in your .env file'
    );
  }

  try {
    if (process.env.DEBUG === 'true') {
      console.error('[oauth-client] Requesting new access token');
    }

    // Request access token from OAuth server
    const response = await axios.post(
      '${tokenUrl}',
      {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 30000,
      }
    );

    const accessToken = response.data.access_token as string;
    if (!accessToken) {
      throw new Error('No access_token in OAuth2 response');
    }

    // Cache token with expiration
    cachedToken = accessToken;
    const expiresIn = response.data.expires_in || 3600; // Default 1 hour
    tokenExpiry = now + (expiresIn * 1000);

    if (process.env.DEBUG === 'true') {
      console.error(\`[oauth-client] Token obtained, expires in \${expiresIn} seconds\`);
    }

    return accessToken;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error_description || error.message;
    console.error('[oauth-client] Failed to obtain access token:', errorMessage);
    throw new Error(\`OAuth2 authentication failed: \${errorMessage}\`);
  }
}

/**
 * Clear cached token (useful for testing or forced refresh)
 */
export function clearTokenCache(): void {
  cachedToken = null;
  tokenExpiry = 0;
  if (process.env.DEBUG === 'true') {
    console.error('[oauth-client] Token cache cleared');
  }
}
`;
  }

  // Generate Authorization Code flow code
  if (flowType === 'authorizationCode') {
    return `/**
 * OAuth 2.0 Client - Authorization Code Flow${isPKCE ? ' with PKCE' : ''}
 * Handles authorization flow and automatic token refresh
 */

import axios from 'axios';
${isPKCE ? "import crypto from 'crypto';" : ''}

/** Token cache */
let cachedToken: string | null = null;
let tokenExpiry: number = 0;
let refreshToken: string | null = null;

/**
 * Get OAuth2 access token
 * Automatically refreshes using refresh token if available
 */
export async function getAccessToken(): Promise<string> {
  const now = Date.now();

  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && tokenExpiry > now + 300000) {
    if (process.env.DEBUG === 'true') {
      console.error('[oauth-client] Using cached token');
    }
    return cachedToken;
  }

  // Try refresh token first if available
  if (refreshToken) {
    try {
      return await refreshAccessToken();
    } catch (error) {
      console.error('[oauth-client] Token refresh failed, need new authorization');
      refreshToken = null;
    }
  }

  // Need new authorization code
  return await exchangeAuthorizationCode();
}

/**
 * Exchange authorization code for access token
 */
async function exchangeAuthorizationCode(): Promise<string> {
  const authCode = process.env.OAUTH_AUTHORIZATION_CODE;
  const clientId = process.env.OAUTH_CLIENT_ID;
  ${!isPKCE ? "const clientSecret = process.env.OAUTH_CLIENT_SECRET;" : ''}
  const redirectUri = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/callback';
  ${isPKCE ? "const codeVerifier = process.env.OAUTH_CODE_VERIFIER || generateCodeVerifier();" : ''}

  if (!authCode) {
    throw new Error(
      'Missing authorization code. Please authorize first by visiting:\\n' +
      getAuthorizationUrl()
    );
  }

  if (!clientId${!isPKCE ? ' || !clientSecret' : ''}) {
    throw new Error('OAuth2 credentials missing in .env file');
  }

  try {
    const response = await axios.post(
      '${tokenUrl}',
      {
        grant_type: 'authorization_code',
        code: authCode,
        client_id: clientId,
        ${!isPKCE ? 'client_secret: clientSecret,' : ''}
        redirect_uri: redirectUri,
        ${isPKCE ? 'code_verifier: codeVerifier,' : ''}
      },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 30000,
      }
    );

    return cacheToken(response.data);
  } catch (error: any) {
    const errorMessage = error.response?.data?.error_description || error.message;
    throw new Error(\`OAuth2 token exchange failed: \${errorMessage}\`);
  }
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<string> {
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const clientId = process.env.OAUTH_CLIENT_ID;
  ${!isPKCE ? "const clientSecret = process.env.OAUTH_CLIENT_SECRET;" : ''}

  try {
    const response = await axios.post(
      '${tokenUrl}',
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        ${!isPKCE ? 'client_secret: clientSecret,' : ''}
      },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 30000,
      }
    );

    return cacheToken(response.data);
  } catch (error: any) {
    const errorMessage = error.response?.data?.error_description || error.message;
    throw new Error(\`Token refresh failed: \${errorMessage}\`);
  }
}

/**
 * Cache token and update expiration
 */
function cacheToken(tokenResponse: any): string {
  const accessToken = tokenResponse.access_token;
  if (!accessToken) {
    throw new Error('No access_token in response');
  }

  cachedToken = accessToken;
  const expiresIn = tokenResponse.expires_in || 3600;
  tokenExpiry = Date.now() + (expiresIn * 1000);

  if (tokenResponse.refresh_token) {
    refreshToken = tokenResponse.refresh_token;
  }

  if (process.env.DEBUG === 'true') {
    console.error(\`[oauth-client] Token cached, expires in \${expiresIn}s\`);
  }

  return accessToken;
}

/**
 * Get authorization URL for user consent
 */
export function getAuthorizationUrl(): string {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const redirectUri = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/callback';
  const state = generateState();
  ${isPKCE ? 'const codeVerifier = process.env.OAUTH_CODE_VERIFIER || generateCodeVerifier();' : ''}
  ${isPKCE ? 'const codeChallenge = generateCodeChallenge(codeVerifier);' : ''}

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId || '',
    redirect_uri: redirectUri,
    state,
    ${isPKCE ? 'code_challenge: codeChallenge,' : ''}
    ${isPKCE ? "code_challenge_method: 'S256'," : ''}
  });

  return \`${authorizationUrl}?\${params.toString()}\`;
}

${isPKCE ? `
/**
 * Generate PKCE code verifier
 */
function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Generate PKCE code challenge from verifier
 */
function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}
` : ''}

/**
 * Generate random state for CSRF protection
 */
function generateState(): string {
  return ${isPKCE ? "crypto.randomBytes(16).toString('hex')" : "Math.random().toString(36).substring(7)"};
}

/**
 * Clear token cache
 */
export function clearTokenCache(): void {
  cachedToken = null;
  tokenExpiry = 0;
  refreshToken = null;
}
`;
  }

  // Fallback for other flows (implicit, password)
  return `/**
 * OAuth 2.0 Client - ${flowType} Flow
 * Note: This flow type requires manual implementation
 */

export async function getAccessToken(): Promise<string> {
  throw new Error('${flowType} flow is not fully implemented. Please implement manually.');
}

export function clearTokenCache(): void {
  // No-op for unsupported flows
}
`;
}
