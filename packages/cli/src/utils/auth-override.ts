/**
 * Authentication Override Utilities
 * Parse and validate CLI auth override flags
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Supported authentication types
 */
export type AuthType = 'apiKey' | 'bearer' | 'basic' | 'oauth2';

/**
 * API Key location
 */
export type ApiKeyLocation = 'header' | 'query' | 'cookie';

/**
 * OAuth2 flow types
 */
export type OAuth2Flow =
  | 'clientCredentials'
  | 'authorizationCode'
  | 'implicit'
  | 'password';

/**
 * Base security scheme
 */
export interface SecuritySchemeBase {
  type: string;
  description?: string;
}

/**
 * API Key security scheme
 */
export interface ApiKeySecurityScheme extends SecuritySchemeBase {
  type: 'apiKey';
  in: ApiKeyLocation;
  name: string;
}

/**
 * HTTP security scheme (Bearer or Basic)
 */
export interface HttpSecurityScheme extends SecuritySchemeBase {
  type: 'http';
  scheme: 'bearer' | 'basic';
  bearerFormat?: string;
}

/**
 * OAuth2 security scheme
 */
export interface OAuth2SecurityScheme extends SecuritySchemeBase {
  type: 'oauth2';
  flows: {
    [key in OAuth2Flow]?: {
      tokenUrl?: string;
      authorizationUrl?: string;
      refreshUrl?: string;
      scopes: Record<string, string>;
    };
  };
}

/**
 * Union type for all security schemes
 */
export type SecurityScheme =
  | ApiKeySecurityScheme
  | HttpSecurityScheme
  | OAuth2SecurityScheme;

/**
 * Auth override configuration
 */
export interface AuthOverrideConfig {
  schemes: Record<string, SecurityScheme>;
  security?: Array<Record<string, string[]>>;
}

/**
 * Parse simple auth override string
 *
 * Supported formats:
 * - "apiKey:header:X-API-Key"
 * - "apiKey:query:api_key"
 * - "apiKey:cookie:session"
 * - "bearer"
 * - "bearer:JWT"
 * - "basic"
 * - "oauth2-client-credentials:https://auth.example.com/token"
 * - "bearer+apiKey:header:X-API-Key" (multi-scheme AND logic)
 *
 * @param override - Auth override string
 * @returns Parsed auth configuration
 */
export function parseAuthOverride(override: string): AuthOverrideConfig {
  // Check for multi-scheme (AND logic with +)
  if (override.includes('+')) {
    return parseMultiSchemeAuth(override);
  }

  const parts = override.split(':');
  const authType = parts[0]?.toLowerCase();

  if (!authType) {
    throw new Error('Invalid auth override format: empty string');
  }

  const schemes: Record<string, SecurityScheme> = {};
  const security: Array<Record<string, string[]>> = [];

  // API Key authentication
  if (authType === 'apikey') {
    const location = parts[1] as ApiKeyLocation;
    const paramName = parts[2];

    if (!location || !['header', 'query', 'cookie'].includes(location)) {
      throw new Error(
        'Invalid API Key location. Use: apiKey:header:X-API-Key or apiKey:query:api_key'
      );
    }

    if (!paramName) {
      throw new Error('API Key parameter name is required. Use: apiKey:header:X-API-Key');
    }

    schemes.ApiKeyAuth = {
      type: 'apiKey',
      in: location,
      name: paramName,
      description: 'API Key authentication (CLI override)',
    };

    security.push({ ApiKeyAuth: [] });
  }
  // Bearer token authentication
  else if (authType === 'bearer') {
    const bearerFormat = parts[1] || 'JWT';

    schemes.BearerAuth = {
      type: 'http',
      scheme: 'bearer',
      bearerFormat,
      description: 'Bearer token authentication (CLI override)',
    };

    security.push({ BearerAuth: [] });
  }
  // Basic authentication
  else if (authType === 'basic') {
    schemes.BasicAuth = {
      type: 'http',
      scheme: 'basic',
      description: 'HTTP Basic authentication (CLI override)',
    };

    security.push({ BasicAuth: [] });
  }
  // OAuth2 Client Credentials
  else if (authType === 'oauth2-client-credentials') {
    // Join remaining parts to handle URLs with :// correctly
    const tokenUrl = parts.slice(1).join(':');

    if (!tokenUrl) {
      throw new Error(
        'OAuth2 token URL is required. Use: oauth2-client-credentials:https://auth.example.com/token'
      );
    }

    schemes.OAuth2ClientCredentials = {
      type: 'oauth2',
      flows: {
        clientCredentials: {
          tokenUrl,
          scopes: {},
        },
      },
      description: 'OAuth2 Client Credentials flow (CLI override)',
    };

    security.push({ OAuth2ClientCredentials: [] });
  }
  // OAuth2 Authorization Code
  else if (authType === 'oauth2-authorization-code') {
    // Need to split on first : to get auth type, then parse two URLs
    const urlPart = parts.slice(1).join(':');
    const urlMatch = urlPart.match(/^(https?:\/\/[^:]+)(:(https?:\/\/.+))?$/);

    if (!urlMatch || !urlMatch[1]) {
      throw new Error(
        'OAuth2 authorization and token URLs are required. Use: oauth2-authorization-code:https://auth.example.com/authorize:https://auth.example.com/token'
      );
    }

    const authorizationUrl = urlMatch[1];
    const tokenUrl = urlMatch[3] || '';

    if (!tokenUrl) {
      throw new Error(
        'OAuth2 authorization and token URLs are required. Use: oauth2-authorization-code:https://auth.example.com/authorize:https://auth.example.com/token'
      );
    }

    schemes.OAuth2AuthorizationCode = {
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl,
          tokenUrl,
          scopes: {},
        },
      },
      description: 'OAuth2 Authorization Code flow (CLI override)',
    };

    security.push({ OAuth2AuthorizationCode: [] });
  }
  // OAuth2 Password
  else if (authType === 'oauth2-password') {
    // Join remaining parts to handle URLs with :// correctly
    const tokenUrl = parts.slice(1).join(':');

    if (!tokenUrl) {
      throw new Error(
        'OAuth2 token URL is required. Use: oauth2-password:https://auth.example.com/token'
      );
    }

    schemes.OAuth2Password = {
      type: 'oauth2',
      flows: {
        password: {
          tokenUrl,
          scopes: {},
        },
      },
      description: 'OAuth2 Password flow (CLI override)',
    };

    security.push({ OAuth2Password: [] });
  }
  // OAuth2 Implicit
  else if (authType === 'oauth2-implicit') {
    // Join remaining parts to handle URLs with :// correctly
    const authorizationUrl = parts.slice(1).join(':');

    if (!authorizationUrl) {
      throw new Error(
        'OAuth2 authorization URL is required. Use: oauth2-implicit:https://auth.example.com/authorize'
      );
    }

    schemes.OAuth2Implicit = {
      type: 'oauth2',
      flows: {
        implicit: {
          authorizationUrl,
          scopes: {},
        },
      },
      description: 'OAuth2 Implicit flow (CLI override)',
    };

    security.push({ OAuth2Implicit: [] });
  } else {
    throw new Error(
      `Unsupported auth type: ${authType}. Supported: apiKey, bearer, basic, oauth2-client-credentials, oauth2-authorization-code, oauth2-password, oauth2-implicit`
    );
  }

  return { schemes, security };
}

/**
 * Parse multi-scheme authentication (AND logic)
 *
 * Example: "bearer+apiKey:header:X-API-Key"
 *
 * @param override - Multi-scheme override string
 * @returns Parsed auth configuration with multiple schemes
 */
function parseMultiSchemeAuth(override: string): AuthOverrideConfig {
  const schemeParts = override.split('+');
  const allSchemes: Record<string, SecurityScheme> = {};
  const securityRequirement: Record<string, string[]> = {};

  for (const part of schemeParts) {
    const parsed = parseAuthOverride(part.trim());

    // Merge schemes
    Object.assign(allSchemes, parsed.schemes);

    // Add to security requirement (AND logic)
    if (parsed.security && parsed.security.length > 0) {
      Object.assign(securityRequirement, parsed.security[0]);
    }
  }

  return {
    schemes: allSchemes,
    security: [securityRequirement],
  };
}

/**
 * Load auth configuration from JSON file
 *
 * @param configPath - Path to auth config JSON file
 * @returns Parsed auth configuration
 */
export function loadAuthConfig(configPath: string): AuthOverrideConfig {
  try {
    const resolvedPath = resolve(configPath);
    const content = readFileSync(resolvedPath, 'utf-8');
    const config = JSON.parse(content) as AuthOverrideConfig;

    // Validate config structure
    if (!config.schemes || typeof config.schemes !== 'object') {
      throw new Error('Invalid auth config: missing or invalid "schemes" field');
    }

    // Validate each scheme
    for (const [name, scheme] of Object.entries(config.schemes)) {
      validateSecurityScheme(name, scheme);
    }

    return config;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in auth config file: ${(error as Error).message}`);
    }
    throw error;
  }
}

/**
 * Validate security scheme structure
 *
 * @param name - Scheme name
 * @param scheme - Security scheme to validate
 */
function validateSecurityScheme(name: string, scheme: SecurityScheme): void {
  if (!scheme.type) {
    throw new Error(`Invalid security scheme "${name}": missing "type" field`);
  }

  switch (scheme.type) {
    case 'apiKey': {
      const apiKeyScheme = scheme as ApiKeySecurityScheme;
      if (!apiKeyScheme.in || !['header', 'query', 'cookie'].includes(apiKeyScheme.in)) {
        throw new Error(
          `Invalid API Key scheme "${name}": "in" must be one of: header, query, cookie`
        );
      }
      if (!apiKeyScheme.name) {
        throw new Error(`Invalid API Key scheme "${name}": missing "name" field`);
      }
      break;
    }

    case 'http': {
      const httpScheme = scheme as HttpSecurityScheme;
      if (!httpScheme.scheme || !['bearer', 'basic'].includes(httpScheme.scheme)) {
        throw new Error(
          `Invalid HTTP scheme "${name}": "scheme" must be one of: bearer, basic`
        );
      }
      break;
    }

    case 'oauth2': {
      const oauth2Scheme = scheme as OAuth2SecurityScheme;
      if (!oauth2Scheme.flows || typeof oauth2Scheme.flows !== 'object') {
        throw new Error(`Invalid OAuth2 scheme "${name}": missing or invalid "flows" field`);
      }

      // Validate at least one flow exists
      const flowKeys = Object.keys(oauth2Scheme.flows);
      if (flowKeys.length === 0) {
        throw new Error(`Invalid OAuth2 scheme "${name}": at least one flow is required`);
      }

      // Validate each flow
      for (const [flowType, flowConfig] of Object.entries(oauth2Scheme.flows)) {
        if (
          !['clientCredentials', 'authorizationCode', 'implicit', 'password'].includes(flowType)
        ) {
          throw new Error(
            `Invalid OAuth2 scheme "${name}": unsupported flow type "${flowType}"`
          );
        }

        // Validate required URLs for each flow type
        if (flowType === 'clientCredentials' || flowType === 'password') {
          if (!flowConfig?.tokenUrl) {
            throw new Error(
              `Invalid OAuth2 scheme "${name}": "${flowType}" flow requires "tokenUrl"`
            );
          }
        }

        if (flowType === 'authorizationCode') {
          if (!flowConfig?.authorizationUrl || !flowConfig?.tokenUrl) {
            throw new Error(
              `Invalid OAuth2 scheme "${name}": "authorizationCode" flow requires "authorizationUrl" and "tokenUrl"`
            );
          }
        }

        if (flowType === 'implicit') {
          if (!flowConfig?.authorizationUrl) {
            throw new Error(
              `Invalid OAuth2 scheme "${name}": "implicit" flow requires "authorizationUrl"`
            );
          }
        }
      }
      break;
    }

    default:
      throw new Error(
        `Invalid security scheme "${name}": unsupported type "${scheme.type}"`
      );
  }
}

/**
 * Merge auth override config with OpenAPI security schemes
 *
 * @param openapiSchemes - Security schemes from OpenAPI spec
 * @param overrideConfig - Auth override configuration
 * @returns Merged security schemes
 */
export function mergeAuthConfig(
  openapiSchemes: Record<string, SecurityScheme>,
  overrideConfig: AuthOverrideConfig
): AuthOverrideConfig {
  // If OpenAPI has schemes, use them unless override is provided
  if (Object.keys(openapiSchemes).length > 0 && Object.keys(overrideConfig.schemes).length === 0) {
    return {
      schemes: openapiSchemes,
      security: overrideConfig.security,
    };
  }

  // Override takes precedence
  return overrideConfig;
}
