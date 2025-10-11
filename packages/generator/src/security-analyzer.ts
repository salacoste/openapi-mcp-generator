/**
 * Security Scheme Analysis and User Guidance
 *
 * Analyzes OpenAPI security requirements and generates clear user guidance
 * for credential configuration in generated MCP servers.
 *
 * @module security-analyzer
 */

import type { SecuritySchemeTemplateData } from './types.js';

/**
 * Environment variable configuration for authentication
 */
export interface EnvVarConfig {
  /** Environment variable name */
  name: string;
  /** Human-readable description */
  description: string;
  /** Example value (fake credential) */
  example: string;
  /** Is this variable required for the API to work? */
  required: boolean;
  /** Additional setup instructions */
  setupHint?: string;
}

/**
 * Unsupported security scheme with workaround guidance
 */
export interface UnsupportedScheme {
  /** Scheme name from OpenAPI */
  name: string;
  /** Security scheme type */
  type: string;
  /** Reason why it's unsupported */
  reason: string;
  /** Suggested workaround or manual implementation steps */
  workaround: string;
}

/**
 * Documentation link for obtaining credentials
 */
export interface DocumentationLink {
  /** Security scheme name */
  scheme: string;
  /** Documentation URL (if provided in OpenAPI) */
  url?: string;
  /** Human-readable link description */
  description: string;
}

/**
 * Complete security guidance for users
 */
export interface SecurityGuidance {
  /** Required authentication schemes */
  required: string[];
  /** Optional authentication schemes */
  optional: string[];
  /** Unsupported schemes with workarounds */
  unsupported: UnsupportedScheme[];
  /** Environment variables to configure */
  envVars: EnvVarConfig[];
  /** Documentation links for obtaining credentials */
  docLinks: DocumentationLink[];
  /** Has multiple security schemes (multi-auth) */
  hasMultipleSchemes: boolean;
  /** Uses AND logic (multiple schemes required) */
  usesAndLogic: boolean;
  /** Uses OR logic (alternative schemes) */
  usesOrLogic: boolean;
  /** General warnings or notices */
  warnings: string[];
}

/**
 * Analyze security requirements from OpenAPI specification
 *
 * Examines security schemes and global/operation-level requirements
 * to generate comprehensive user guidance for credential configuration.
 *
 * @param securitySchemes - Extracted security scheme data
 * @param globalSecurity - Global security requirements
 * @param hasOperationSecurity - Whether any operations have specific security
 * @returns Complete security guidance
 */
export function analyzeSecurityRequirements(
  securitySchemes: SecuritySchemeTemplateData[] = [],
  globalSecurity: unknown[] = [],
  hasOperationSecurity = false
): SecurityGuidance {
  const guidance: SecurityGuidance = {
    required: [],
    optional: [],
    unsupported: [],
    envVars: [],
    docLinks: [],
    hasMultipleSchemes: securitySchemes.length > 1,
    usesAndLogic: false,
    usesOrLogic: false,
    warnings: [],
  };

  if (securitySchemes.length === 0) {
    guidance.warnings.push(
      'No authentication schemes detected in OpenAPI specification. ' +
        'API may be public or authentication details are not documented.'
    );
    return guidance;
  }

  // Analyze each security scheme
  for (const scheme of securitySchemes) {
    analyzeScheme(scheme, guidance);
  }

  // Analyze global security requirements for AND/OR logic
  analyzeSecurityLogic(globalSecurity, securitySchemes, guidance);

  // Add warnings for multi-scheme complexity
  if (guidance.hasMultipleSchemes) {
    if (guidance.usesAndLogic) {
      guidance.warnings.push(
        'This API requires multiple authentication schemes simultaneously (AND logic). ' +
          'You must configure all required credentials.'
      );
    }
    if (guidance.usesOrLogic) {
      guidance.warnings.push(
        'This API supports alternative authentication schemes (OR logic). ' +
          'Configure at least one set of credentials.'
      );
    }
  }

  // Add warning for operation-specific security (independent of multi-scheme)
  if (hasOperationSecurity) {
    guidance.warnings.push(
      'Some operations have specific authentication requirements that override global settings.'
    );
  }

  return guidance;
}

/**
 * Analyze a single security scheme
 */
function analyzeScheme(scheme: SecuritySchemeTemplateData, guidance: SecurityGuidance): void {
  const { name, type } = scheme;

  // Handle supported schemes
  if (type === 'apiKey') {
    analyzeApiKeyScheme(scheme, guidance);
  } else if (type === 'http') {
    analyzeHttpScheme(scheme, guidance);
  } else if (type === 'oauth2') {
    analyzeOAuth2Scheme(scheme, guidance);
  } else if (type === 'openIdConnect') {
    analyzeOpenIdConnectScheme(scheme, guidance);
  } else {
    guidance.unsupported.push({
      name,
      type: type || 'unknown',
      reason: `Unknown security scheme type: ${type}`,
      workaround: 'Consult API documentation for authentication requirements.',
    });
  }
}

/**
 * Analyze API Key security scheme
 */
function analyzeApiKeyScheme(
  scheme: SecuritySchemeTemplateData,
  guidance: SecurityGuidance
): void {
  const { name, in: inLocation = 'header', paramName = 'X-API-Key' } = scheme;

  guidance.required.push(name);
  guidance.envVars.push({
    name: 'API_KEY',
    description: `API Key for ${name} authentication (${inLocation}: ${paramName})`,
    example: 'your-api-key-here',
    required: true,
    setupHint: `Add this key to the ${inLocation === 'header' ? paramName + ' header' : inLocation === 'query' ? paramName + ' query parameter' : paramName + ' cookie'}`,
  });

  const schemeData = scheme as unknown as Record<string, unknown>;
  if (schemeData.description) {
    guidance.docLinks.push({
      scheme: name,
      description: (schemeData.description as string) || `API Key authentication for ${name}`,
    });
  }
}

/**
 * Analyze HTTP authentication scheme (Bearer/Basic)
 */
function analyzeHttpScheme(
  scheme: SecuritySchemeTemplateData,
  guidance: SecurityGuidance
): void {
  const { name } = scheme;
  const schemeData = scheme as unknown as Record<string, unknown>;
  const httpScheme = schemeData.scheme as string;

  if (httpScheme === 'bearer') {
    const bearerFormat = schemeData.bearerFormat as string | undefined;

    guidance.required.push(name);
    guidance.envVars.push({
      name: 'BEARER_TOKEN',
      description: `Bearer Token for ${name} authentication${bearerFormat ? ` (${bearerFormat})` : ''}`,
      example: bearerFormat === 'JWT' ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' : 'your-bearer-token-here',
      required: true,
      setupHint: bearerFormat ? `Token format: ${bearerFormat}` : undefined,
    });

    guidance.docLinks.push({
      scheme: name,
      description: `Bearer Token authentication${bearerFormat ? ` (${bearerFormat} format)` : ''}`,
    });
  } else if (httpScheme === 'basic') {
    guidance.required.push(name);
    guidance.envVars.push(
      {
        name: 'BASIC_AUTH_USERNAME',
        description: `Username for ${name} Basic Authentication`,
        example: 'your-username',
        required: true,
      },
      {
        name: 'BASIC_AUTH_PASSWORD',
        description: `Password for ${name} Basic Authentication`,
        example: 'your-password',
        required: true,
        setupHint: 'Keep credentials secure and never commit to version control',
      }
    );

    guidance.docLinks.push({
      scheme: name,
      description: 'Basic Authentication (username and password)',
    });
  } else {
    guidance.unsupported.push({
      name,
      type: `http-${httpScheme}`,
      reason: `HTTP authentication scheme '${httpScheme}' is not supported`,
      workaround: 'Only Bearer and Basic authentication are currently supported. Contact support for other HTTP auth schemes.',
    });
  }
}

/**
 * Analyze OAuth2 security scheme (Epic 8: Now fully supported!)
 */
function analyzeOAuth2Scheme(
  scheme: SecuritySchemeTemplateData,
  guidance: SecurityGuidance
): void {
  const { name } = scheme;
  const schemeData = scheme as unknown as Record<string, unknown>;
  const metadata = schemeData.metadata as Record<string, unknown> | undefined;
  const primaryFlow = (metadata?.primaryFlow as Record<string, unknown>) || {};

  // BUGFIX: Validate flow type exists instead of silent default (same as mcp-generator.ts:476)
  if (!primaryFlow.type) {
    throw new Error(
      `OAuth2 scheme missing flow type. ` +
      `Scheme: ${name}, ` +
      `Flows available: ${Object.keys((metadata?.flows as Record<string, unknown>) || {}).join(', ')}`
    );
  }

  const flowType = primaryFlow.type as string;

  // OAuth2 is now supported - mark as required
  guidance.required.push(name);

  // Generate environment variables based on OAuth flow type
  if (flowType === 'clientCredentials') {
    // Client Credentials Flow (API-to-API)
    guidance.envVars.push(
      {
        name: 'OAUTH_CLIENT_ID',
        description: `OAuth2 Client ID for ${name} (Client Credentials flow)`,
        example: 'your-client-id',
        required: true,
        setupHint: 'Obtain from API provider\'s developer portal',
      },
      {
        name: 'OAUTH_CLIENT_SECRET',
        description: `OAuth2 Client Secret for ${name}`,
        example: 'your-client-secret',
        required: true,
        setupHint: 'Keep secret secure - never commit to version control',
      }
    );

    const tokenUrl = primaryFlow.tokenUrl as string | undefined;
    if (tokenUrl) {
      guidance.docLinks.push({
        scheme: name,
        description: `OAuth2 Client Credentials - Token endpoint: ${tokenUrl}`,
      });
    }
  } else if (flowType === 'authorizationCode') {
    // Authorization Code Flow (user-facing)
    const isPKCE = primaryFlow.pkce as boolean | undefined;

    guidance.envVars.push(
      {
        name: 'OAUTH_CLIENT_ID',
        description: `OAuth2 Client ID for ${name} (Authorization Code${isPKCE ? ' + PKCE' : ''} flow)`,
        example: 'your-client-id',
        required: true,
        setupHint: 'Obtain from API provider\'s developer portal',
      },
      {
        name: 'OAUTH_CLIENT_SECRET',
        description: `OAuth2 Client Secret for ${name}`,
        example: 'your-client-secret',
        required: !isPKCE, // Not required for PKCE (public clients)
        setupHint: isPKCE
          ? 'Optional for PKCE flow (public clients)'
          : 'Keep secret secure - never commit to version control',
      },
      {
        name: 'OAUTH_REDIRECT_URI',
        description: 'OAuth2 redirect URI (callback URL)',
        example: 'http://localhost:3000/callback',
        required: true,
        setupHint: 'Must match registered callback URL in OAuth application settings',
      },
      {
        name: 'OAUTH_AUTHORIZATION_CODE',
        description: 'Authorization code obtained from user authorization',
        example: 'authorization-code-from-callback',
        required: false,
        setupHint: 'Obtained after user authorizes the application',
      }
    );

    if (isPKCE) {
      guidance.envVars.push({
        name: 'OAUTH_CODE_VERIFIER',
        description: 'PKCE code verifier (auto-generated if not provided)',
        example: 'auto-generated-code-verifier',
        required: false,
        setupHint: 'Auto-generated by OAuth client - manually override if needed',
      });

      guidance.warnings.push(
        `OAuth2 ${name}: PKCE (Proof Key for Code Exchange) is enabled for enhanced security.`
      );
    }

    const authUrl = primaryFlow.authorizationUrl as string | undefined;
    const tokenUrl = primaryFlow.tokenUrl as string | undefined;
    if (authUrl || tokenUrl) {
      guidance.docLinks.push({
        scheme: name,
        description:
          `OAuth2 Authorization Code${isPKCE ? ' + PKCE' : ''} - ` +
          (authUrl ? `Authorization: ${authUrl}` : '') +
          (authUrl && tokenUrl ? ', ' : '') +
          (tokenUrl ? `Token: ${tokenUrl}` : ''),
      });
    }
  } else if (flowType === 'implicit') {
    // Implicit Flow (deprecated but still supported)
    guidance.envVars.push({
      name: 'OAUTH_CLIENT_ID',
      description: `OAuth2 Client ID for ${name} (Implicit flow - DEPRECATED)`,
      example: 'your-client-id',
      required: true,
      setupHint: 'Obtain from API provider. Note: Implicit flow is deprecated, consider Authorization Code + PKCE',
    });

    guidance.warnings.push(
      `OAuth2 ${name}: Implicit flow is deprecated. Consider using Authorization Code flow with PKCE instead.`
    );
  } else if (flowType === 'password') {
    // Password Flow (discouraged but still supported)
    guidance.envVars.push(
      {
        name: 'OAUTH_CLIENT_ID',
        description: `OAuth2 Client ID for ${name} (Password flow - DISCOURAGED)`,
        example: 'your-client-id',
        required: true,
      },
      {
        name: 'OAUTH_CLIENT_SECRET',
        description: `OAuth2 Client Secret for ${name}`,
        example: 'your-client-secret',
        required: true,
      },
      {
        name: 'OAUTH_USERNAME',
        description: 'Resource owner username',
        example: 'user@example.com',
        required: true,
      },
      {
        name: 'OAUTH_PASSWORD',
        description: 'Resource owner password',
        example: 'user-password',
        required: true,
        setupHint: 'Keep credentials secure - Password flow is discouraged, use Client Credentials or Authorization Code instead',
      }
    );

    guidance.warnings.push(
      `OAuth2 ${name}: Password flow is discouraged. Consider using Client Credentials or Authorization Code flow instead.`
    );
  }

  // Add general OAuth setup hint
  guidance.warnings.push(
    `OAuth2 ${name}: Automatic token management is enabled. Tokens are cached and refreshed automatically.`
  );
}

/**
 * Analyze OpenID Connect security scheme (unsupported - requires manual implementation)
 */
function analyzeOpenIdConnectScheme(
  scheme: SecuritySchemeTemplateData,
  guidance: SecurityGuidance
): void {
  const { name } = scheme;
  const schemeData = scheme as unknown as Record<string, unknown>;
  const openIdConnectUrl = schemeData.openIdConnectUrl as string | undefined;

  guidance.unsupported.push({
    name,
    type: 'openIdConnect',
    reason: 'OpenID Connect requires manual implementation due to discovery and token validation',
    workaround:
      'OpenID Connect implementation steps:\n' +
      `1. Fetch OpenID configuration from: ${openIdConnectUrl || 'discovery URL not specified'}\n` +
      '2. Implement authentication flow (authorization code flow recommended)\n' +
      '3. Validate ID token and extract claims\n' +
      '4. Store access token in BEARER_TOKEN environment variable\n' +
      '5. Implement token refresh mechanism\n' +
      '\n' +
      'See README.md for Bearer Token setup instructions.',
  });

  // Add hint to use Bearer Token once OIDC flow is complete
  guidance.optional.push(name);
  guidance.envVars.push({
    name: 'BEARER_TOKEN',
    description: `Access token obtained via OpenID Connect (${name})`,
    example: 'oidc-access-token-here',
    required: false,
    setupHint:
      'After completing OpenID Connect flow manually, store the access token here. ' +
      'Token refresh and ID token validation must be implemented separately.',
  });

  if (openIdConnectUrl) {
    guidance.docLinks.push({
      scheme: name,
      url: openIdConnectUrl,
      description: 'OpenID Connect Discovery URL',
    });
  }
}

/**
 * Analyze security logic (AND/OR) from global requirements
 */
function analyzeSecurityLogic(
  globalSecurity: unknown[],
  _securitySchemes: SecuritySchemeTemplateData[],
  guidance: SecurityGuidance
): void {
  if (!globalSecurity || globalSecurity.length === 0) {
    return;
  }

  // Check for OR logic (multiple security requirements)
  if (globalSecurity.length > 1) {
    guidance.usesOrLogic = true;
  }

  // Check for AND logic (multiple schemes in one requirement)
  for (const requirement of globalSecurity) {
    if (typeof requirement === 'object' && requirement !== null) {
      const schemeCount = Object.keys(requirement).length;
      if (schemeCount > 1) {
        guidance.usesAndLogic = true;
        break;
      }
    }
  }
}

/**
 * Format security guidance as human-readable text
 *
 * Generates a summary suitable for CLI output or console logging.
 *
 * @param guidance - Security guidance to format
 * @returns Formatted guidance text
 */
export function formatSecurityGuidance(guidance: SecurityGuidance): string {
  const lines: string[] = [];

  lines.push('📋 Security Requirements Summary');
  lines.push('=================================');
  lines.push('');

  if (guidance.required.length > 0) {
    lines.push('✅ Required Authentication:');
    for (const scheme of guidance.required) {
      lines.push(`   - ${scheme}`);
    }
    lines.push('');
  }

  if (guidance.optional.length > 0) {
    lines.push('⚙️  Optional Authentication:');
    for (const scheme of guidance.optional) {
      lines.push(`   - ${scheme}`);
    }
    lines.push('');
  }

  if (guidance.unsupported.length > 0) {
    lines.push('⚠️  Unsupported Schemes (Manual Implementation Required):');
    for (const unsupported of guidance.unsupported) {
      lines.push(`   - ${unsupported.name} (${unsupported.type})`);
      lines.push(`     Reason: ${unsupported.reason}`);
    }
    lines.push('');
  }

  if (guidance.envVars.length > 0) {
    lines.push('🔐 Environment Variables to Configure:');
    for (const envVar of guidance.envVars) {
      const requiredLabel = envVar.required ? ' (REQUIRED)' : ' (optional)';
      lines.push(`   ${envVar.name}${requiredLabel}`);
      lines.push(`     ${envVar.description}`);
      if (envVar.setupHint) {
        lines.push(`     Hint: ${envVar.setupHint}`);
      }
    }
    lines.push('');
  }

  if (guidance.warnings.length > 0) {
    lines.push('⚡ Important Notes:');
    for (const warning of guidance.warnings) {
      lines.push(`   - ${warning}`);
    }
    lines.push('');
  }

  lines.push('📚 Next Steps:');
  lines.push('   1. Copy .env.example to .env');
  lines.push('   2. Configure required environment variables');
  lines.push('   3. See README.md for detailed setup instructions');
  lines.push('');

  return lines.join('\n');
}
