/**
 * Server URL extraction and base path handling
 * Story 2.8: Server URL Extraction and Base Path Handling
 */

import type { OpenAPI } from 'openapi-types';

/**
 * Server variable definition from OpenAPI spec
 */
export interface ServerVariable {
  /** Default value for the variable */
  default: string;
  /** Allowed values (optional enum) */
  enum?: string[];
  /** Description of the variable */
  description?: string;
}

/**
 * Server variables collection
 */
export interface ServerVariables {
  [name: string]: ServerVariable;
}

/**
 * Server environment classification
 */
export type ServerEnvironment = 'production' | 'staging' | 'development' | 'local' | 'unknown';

/**
 * Server metadata for HTTP client configuration
 */
export interface ServerMetadata {
  /** Original URL template from OpenAPI spec */
  url: string;
  /** Server description */
  description?: string;
  /** Server variables for URL template substitution */
  variables?: ServerVariables;
  /** Extracted path component (normalized) */
  basePath: string;
  /** Concrete URL with defaults applied */
  baseURL: string;
  /** Inferred server environment type */
  environment: ServerEnvironment;
  /** Priority (0 = default/first server) */
  priority: number;
  /** Environment variable name suggestions for variables */
  envVarSuggestions?: Record<string, string>;
}

/**
 * Complete server extraction result
 */
export interface ServerExtractionResult {
  /** All extracted servers */
  servers: ServerMetadata[];
  /** Default server (first in array) */
  defaultServer: ServerMetadata;
  /** Whether multiple servers are defined */
  hasMultipleServers: boolean;
  /** Warnings generated during extraction */
  warnings: string[];
}

/**
 * Extract base path from server URL
 *
 * @param url - Server URL to extract base path from
 * @returns Normalized base path (e.g., '/v1', '/')
 *
 * @example
 * ```typescript
 * extractBasePath('https://api.example.com/v1') // → '/v1'
 * extractBasePath('https://api.example.com/v1/') // → '/v1'
 * extractBasePath('https://api.example.com') // → '/'
 * ```
 */
export function extractBasePath(url: string): string {
  if (!url) {
    return '/';
  }

  try {
    const urlObj = new URL(url);
    let path = urlObj.pathname;

    // Remove trailing slash (except for root)
    if (path.endsWith('/') && path.length > 1) {
      path = path.slice(0, -1);
    }

    // Default to '/' if no path
    return path || '/';
  } catch {
    // Invalid URL or relative URL
    return '/';
  }
}

/**
 * Resolve server URL variables with defaults
 *
 * @param urlTemplate - URL template with variables (e.g., '{protocol}://api.example.com/{version}')
 * @param variables - Variable definitions with defaults
 * @returns Resolved URL with variables substituted
 *
 * @example
 * ```typescript
 * resolveServerUrl('{protocol}://api.example.com/{version}', {
 *   protocol: { default: 'https' },
 *   version: { default: 'v1' }
 * }) // → 'https://api.example.com/v1'
 * ```
 */
export function resolveServerUrl(
  urlTemplate: string,
  variables?: ServerVariables
): string {
  if (!variables) {
    return urlTemplate;
  }

  let resolvedUrl = urlTemplate;

  for (const [name, variable] of Object.entries(variables)) {
    const value = variable.default || '';
    resolvedUrl = resolvedUrl.replace(new RegExp(`\\{${name}\\}`, 'g'), value);
  }

  return resolvedUrl;
}

/**
 * Infer server environment from URL and description
 *
 * @param url - Server URL
 * @param description - Optional server description
 * @returns Inferred environment type
 *
 * @example
 * ```typescript
 * inferServerEnvironment('https://api.example.com', 'Production server') // → 'production'
 * inferServerEnvironment('https://staging-api.example.com') // → 'staging'
 * inferServerEnvironment('http://localhost:8080') // → 'local'
 * ```
 */
export function inferServerEnvironment(
  url: string,
  description?: string
): ServerEnvironment {
  const combined = `${url} ${description || ''}`.toLowerCase();

  // Check localhost/IP first (highest priority for local detection)
  if (
    url.includes('localhost') ||
    url.includes('127.0.0.1')
  ) {
    return 'local';
  }

  // Check for explicit 'local' keyword
  if (combined.includes('local')) {return 'local';}

  // Other environment checks
  if (combined.includes('prod')) {return 'production';}
  if (combined.includes('staging') || combined.includes('stg')) {return 'staging';}
  if (combined.includes('dev') || combined.includes('development')) {return 'development';}

  return 'unknown';
}

/**
 * Generate environment variable name suggestions for server variables
 *
 * @param variables - Server variables
 * @returns Map of variable name to suggested environment variable name
 *
 * @example
 * ```typescript
 * generateEnvVarSuggestions({ environment: { default: 'prod' } })
 * // → { environment: 'API_ENVIRONMENT' }
 * ```
 */
export function generateEnvVarSuggestions(
  variables?: ServerVariables
): Record<string, string> {
  if (!variables) {
    return {};
  }

  const suggestions: Record<string, string> = {};

  for (const varName of Object.keys(variables)) {
    // Convert to SCREAMING_SNAKE_CASE
    const envVarName = `API_${varName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')}`;
    suggestions[varName] = envVarName;
  }

  return suggestions;
}

/**
 * Validate server extraction output
 *
 * @param servers - Extracted servers
 * @param warnings - Warnings array to append to
 */
function validateServerOutput(
  servers: ServerMetadata[],
  warnings: string[]
): void {
  for (const server of servers) {
    // Validate URL is well-formed
    if (server.baseURL) {
      try {
        new URL(server.baseURL);
      } catch {
        warnings.push(
          `Server URL '${server.baseURL}' is not a valid URL. ` +
          `Requests may fail without a valid base URL.`
        );
      }
    }

    // Validate all variables have defaults
    if (server.variables) {
      for (const [name, variable] of Object.entries(server.variables)) {
        if (!variable.default) {
          warnings.push(
            `Server variable '${name}' has no default value. ` +
            `URL template may not resolve correctly.`
          );
        }
      }
    }

    // Validate environment variable names
    if (server.envVarSuggestions) {
      for (const envVarName of Object.values(server.envVarSuggestions)) {
        if (!/^[A-Z][A-Z0-9_]*$/.test(envVarName)) {
          warnings.push(
            `Generated environment variable name '${envVarName}' is not a valid identifier.`
          );
        }
      }
    }
  }
}

/**
 * Extract and configure servers from OpenAPI document
 *
 * @param document - Fully resolved OpenAPI document
 * @returns Server extraction result with metadata and warnings
 *
 * @example
 * ```typescript
 * const result = extractServers(document);
 * console.log(`Extracted ${result.servers.length} servers`);
 * console.log(`Default: ${result.defaultServer.baseURL}`);
 * ```
 */
export function extractServers(
  document: OpenAPI.Document
): ServerExtractionResult {
  const warnings: string[] = [];
  const servers: ServerMetadata[] = [];

  // Type assertion for servers property
  const docServers = (document as { servers?: unknown[] }).servers;

  // Handle missing servers array
  if (!docServers || docServers.length === 0) {
    warnings.push(
      'No servers defined in OpenAPI document. Using empty string as base URL (relative URLs).'
    );

    const defaultServer: ServerMetadata = {
      url: '',
      baseURL: '',
      basePath: '/',
      environment: 'unknown',
      priority: 0
    };

    return {
      servers: [defaultServer],
      defaultServer,
      hasMultipleServers: false,
      warnings
    };
  }

  // Extract each server
  for (let i = 0; i < docServers.length; i++) {
    const server = docServers[i] as {
      url: string;
      description?: string;
      variables?: ServerVariables;
    };

    // Resolve variables to get concrete URL
    const baseURL = resolveServerUrl(server.url, server.variables);

    // Extract base path
    const basePath = extractBasePath(baseURL);

    // Infer environment
    const environment = inferServerEnvironment(baseURL, server.description);

    // Generate environment variable suggestions
    const envVarSuggestions = server.variables
      ? generateEnvVarSuggestions(server.variables)
      : undefined;

    servers.push({
      url: server.url,
      description: server.description,
      variables: server.variables,
      basePath,
      baseURL,
      environment,
      priority: i,
      envVarSuggestions
    });
  }

  // Validate servers
  validateServerOutput(servers, warnings);

  // defaultServer is guaranteed to exist because servers array is never empty
  // (we always create at least one default server if missing)
  const defaultServer = servers[0];
  if (!defaultServer) {
    throw new Error('Internal error: servers array is empty');
  }

  return {
    servers,
    defaultServer,
    hasMultipleServers: servers.length > 1,
    warnings
  };
}
