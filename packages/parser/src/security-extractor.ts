/**
 * Security Scheme Extraction and Classification
 * @module security-extractor
 */

import type { OperationMetadata } from './operation-types.js';

/**
 * Map of security scheme names to classified security schemes
 */
export interface SecuritySchemeMap {
  [schemeName: string]: ClassifiedSecurityScheme;
}

/**
 * Classified security scheme with authentication type and metadata
 */
export interface ClassifiedSecurityScheme {
  /** Scheme name from OpenAPI document */
  name: string;
  /** OpenAPI security scheme type */
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  /** Detailed classification for code generation */
  classification: SecurityClassification;
  /** Type-specific metadata */
  metadata: SecurityMetadata;
  /** Is this scheme supported for automatic code generation? */
  supported: boolean;
  /** Warnings for manual implementation or limitations */
  warnings?: string[];
}

/**
 * Security scheme classification by authentication type
 */
export type SecurityClassification =
  | 'api-key-header'    // API Key in header
  | 'api-key-query'     // API Key in query parameter
  | 'api-key-cookie'    // API Key in cookie
  | 'http-bearer'       // HTTP Bearer token
  | 'http-basic'        // HTTP Basic authentication
  | 'oauth2'            // OAuth2 (requires manual implementation)
  | 'openid-connect';   // OpenID Connect (requires manual implementation)

/**
 * Discriminated union of security metadata types
 */
export type SecurityMetadata =
  | ApiKeyMetadata
  | HttpBearerMetadata
  | HttpBasicMetadata
  | OAuth2Metadata
  | OpenIdConnectMetadata;

/**
 * API Key authentication metadata
 * @example
 * {
 *   name: 'X-API-Key',
 *   in: 'header'
 * }
 */
export interface ApiKeyMetadata {
  /** Parameter name for the API key */
  name: string;
  /** Where the API key should be sent */
  in: 'header' | 'query' | 'cookie';
}

/**
 * HTTP Bearer token metadata
 * @example
 * {
 *   scheme: 'bearer',
 *   bearerFormat: 'JWT'
 * }
 */
export interface HttpBearerMetadata {
  /** HTTP authentication scheme */
  scheme: 'bearer';
  /** Format hint for the bearer token (e.g., JWT) */
  bearerFormat?: string;
}

/**
 * HTTP Basic authentication metadata
 */
export interface HttpBasicMetadata {
  /** HTTP authentication scheme */
  scheme: 'basic';
}

/**
 * OAuth2 authentication metadata
 */
export interface OAuth2Metadata {
  /** OAuth2 flows configuration */
  flows: OAuth2Flows;
  /** Primary OAuth flow for code generation */
  primaryFlow?: OAuth2FlowConfig;
  /** Additional OAuth flows (if multiple defined) */
  additionalFlows?: OAuth2FlowConfig[];
}

/**
 * OAuth2 flows configuration
 */
export interface OAuth2Flows {
  /** Implicit flow */
  implicit?: OAuth2Flow;
  /** Authorization code flow */
  authorizationCode?: OAuth2Flow;
  /** Client credentials flow */
  clientCredentials?: OAuth2Flow;
  /** Password flow */
  password?: OAuth2Flow;
}

/**
 * OAuth2 flow details
 */
export interface OAuth2Flow {
  /** Authorization endpoint URL */
  authorizationUrl?: string;
  /** Token endpoint URL */
  tokenUrl?: string;
  /** Token refresh URL */
  refreshUrl?: string;
  /** Available scopes and their descriptions */
  scopes: Record<string, string>;
}

/**
 * OAuth2 flow configuration for code generation
 */
export interface OAuth2FlowConfig {
  /** OAuth 2.0 flow type */
  type: 'clientCredentials' | 'authorizationCode' | 'implicit' | 'password';
  /** Token endpoint URL (required for all flows except implicit) */
  tokenUrl: string;
  /** Authorization endpoint URL (required for authorizationCode, implicit) */
  authorizationUrl?: string;
  /** Refresh endpoint URL (optional) */
  refreshUrl?: string;
  /** Available scopes with descriptions */
  scopes: Record<string, string>;
  /** PKCE required (for authorizationCode flow) */
  pkce?: boolean;
}

/**
 * OpenID Connect authentication metadata
 */
export interface OpenIdConnectMetadata {
  /** OpenID Connect discovery URL */
  openIdConnectUrl: string;
}

/**
 * Security requirement for operations
 */
export interface SecurityRequirement {
  /** Scheme names required */
  schemes: string[];
  /** Scopes required per scheme */
  scopes: Record<string, string[]>;
  /** Logical combination of schemes */
  logic: 'AND' | 'OR';
}

/**
 * Complete security extraction result
 */
export interface SecurityExtractionResult {
  /** Classified security schemes */
  schemes: SecuritySchemeMap;
  /** Global security requirements */
  globalRequirements: SecurityRequirement[];
  /** Per-operation security requirements */
  operationRequirements: Map<string, SecurityRequirement[]>;
  /** Warnings and notices */
  warnings: string[];
}

/**
 * OpenAPI document structure (minimal interface for security extraction)
 */
interface OpenAPIDocument {
  components?: {
    securitySchemes?: Record<string, unknown>;
  };
  security?: unknown[];
}

/**
 * Extract and classify security schemes from OpenAPI document
 *
 * @param document - Fully resolved OpenAPI document
 * @param operations - Extracted operations metadata
 * @returns Complete security extraction result
 */
export function extractSecuritySchemes(
  document: OpenAPIDocument,
  operations: OperationMetadata[]
): SecurityExtractionResult {
  const schemes: SecuritySchemeMap = {};
  const warnings: string[] = [];

  // Extract and classify security schemes from components
  if (document.components?.securitySchemes) {
    for (const [name, rawScheme] of Object.entries(document.components.securitySchemes)) {
      const classifiedScheme = classifySecurityScheme(name, rawScheme as RawSecurityScheme);
      schemes[name] = classifiedScheme;

      if (classifiedScheme.warnings) {
        warnings.push(...classifiedScheme.warnings);
      }
    }
  }

  // Extract global security requirements
  const globalRequirements = document.security
    ? extractSecurityRequirements(document.security as SecurityObject[])
    : [];

  // Extract operation-level security requirements
  const operationRequirements = new Map<string, SecurityRequirement[]>();

  for (const operation of operations) {
    const opWithSecurity = operation as OperationMetadata & { security?: SecurityObject[] };
    const opSecurity = getOperationSecurity(opWithSecurity, globalRequirements);
    if (opSecurity.length > 0) {
      operationRequirements.set(operation.operationId, opSecurity);
    }
  }

  // Validate all security references
  validateSecurityReferences(schemes, globalRequirements, operationRequirements, warnings);

  return {
    schemes,
    globalRequirements,
    operationRequirements,
    warnings
  };
}

/**
 * Raw security scheme from OpenAPI document
 */
interface RawSecurityScheme {
  type: string;
  name?: string;
  in?: string;
  scheme?: string;
  bearerFormat?: string;
  flows?: unknown;
  openIdConnectUrl?: string;
}

/**
 * Classify a single security scheme by type
 *
 * @param name - Scheme name from OpenAPI document
 * @param scheme - Raw security scheme object
 * @returns Classified security scheme with metadata
 */
export function classifySecurityScheme(
  name: string,
  scheme: RawSecurityScheme
): ClassifiedSecurityScheme {
  let classification: SecurityClassification;
  let supported = true;
  const warnings: string[] = [];
  let metadata: SecurityMetadata;

  switch (scheme.type) {
    case 'apiKey':
      classification = `api-key-${scheme.in}` as SecurityClassification;
      metadata = extractApiKeyMetadata(scheme);
      break;

    case 'http':
      if (scheme.scheme === 'bearer') {
        classification = 'http-bearer';
        metadata = extractHttpBearerMetadata(scheme);
      } else if (scheme.scheme === 'basic') {
        classification = 'http-basic';
        metadata = extractHttpBasicMetadata();
      } else {
        classification = 'http-bearer';
        metadata = { scheme: 'bearer' };
        warnings.push(`Unsupported HTTP scheme '${scheme.scheme}' for '${name}'. Treating as bearer.`);
      }
      break;

    case 'oauth2':
      classification = 'oauth2';
      metadata = extractOAuth2Metadata(scheme, name, warnings);
      supported = true; // Epic 8: OAuth2 now fully supported
      break;

    case 'openIdConnect':
      classification = 'openid-connect';
      metadata = extractOpenIdConnectMetadata(scheme);
      supported = false;
      warnings.push(
        `OpenID Connect scheme '${name}' requires manual implementation. ` +
        `Configure OIDC provider at: ${scheme.openIdConnectUrl}`
      );
      break;

    default:
      throw new Error(
        `Unknown security scheme type '${scheme.type}' for '${name}'. ` +
        `Supported types: apiKey, http, oauth2, openIdConnect.`
      );
  }

  return {
    name,
    type: scheme.type,
    classification,
    metadata,
    supported,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Extract API Key metadata
 */
function extractApiKeyMetadata(scheme: RawSecurityScheme): ApiKeyMetadata {
  return {
    name: scheme.name || '',
    in: (scheme.in as 'header' | 'query' | 'cookie') || 'header'
  };
}

/**
 * Extract HTTP Bearer metadata
 */
function extractHttpBearerMetadata(scheme: RawSecurityScheme): HttpBearerMetadata {
  return {
    scheme: 'bearer',
    bearerFormat: scheme.bearerFormat
  };
}

/**
 * Extract HTTP Basic metadata
 */
function extractHttpBasicMetadata(): HttpBasicMetadata {
  return {
    scheme: 'basic'
  };
}

/**
 * Extract OAuth2 metadata with flow classification
 */
function extractOAuth2Metadata(
  scheme: RawSecurityScheme,
  schemeName: string,
  warnings: string[]
): OAuth2Metadata {
  const flows = scheme.flows as OAuth2Flows;

  if (!flows) {
    throw new Error(`OAuth2 scheme '${schemeName}' has no flows defined`);
  }

  const flowConfigs: OAuth2FlowConfig[] = [];

  // Client Credentials Flow (highest priority for automatic code generation)
  if (flows.clientCredentials) {
    const flow = flows.clientCredentials;
    if (!flow.tokenUrl) {
      warnings.push(`OAuth2 scheme '${schemeName}': Client Credentials flow missing tokenUrl`);
    }
    flowConfigs.push({
      type: 'clientCredentials',
      tokenUrl: flow.tokenUrl || '',
      refreshUrl: flow.refreshUrl,
      scopes: flow.scopes || {},
    });
  }

  // Authorization Code Flow (second priority)
  if (flows.authorizationCode) {
    const flow = flows.authorizationCode;
    if (!flow.tokenUrl) {
      warnings.push(`OAuth2 scheme '${schemeName}': Authorization Code flow missing tokenUrl`);
    }
    if (!flow.authorizationUrl) {
      warnings.push(`OAuth2 scheme '${schemeName}': Authorization Code flow missing authorizationUrl`);
    }

    // Detect PKCE requirement
    const pkce = detectPKCERequirement(scheme, flow, schemeName, warnings);

    flowConfigs.push({
      type: 'authorizationCode',
      tokenUrl: flow.tokenUrl || '',
      authorizationUrl: flow.authorizationUrl,
      refreshUrl: flow.refreshUrl,
      scopes: flow.scopes || {},
      pkce,
    });
  }

  // Implicit Flow (discouraged but still supported)
  if (flows.implicit) {
    const flow = flows.implicit;
    if (!flow.authorizationUrl) {
      warnings.push(`OAuth2 scheme '${schemeName}': Implicit flow missing authorizationUrl`);
    }
    warnings.push(
      `OAuth2 scheme '${schemeName}': Implicit flow is deprecated. ` +
      `Consider using Authorization Code flow with PKCE instead.`
    );

    flowConfigs.push({
      type: 'implicit',
      tokenUrl: '', // Implicit doesn't use token endpoint
      authorizationUrl: flow.authorizationUrl,
      scopes: flow.scopes || {},
    });
  }

  // Password Flow (discouraged but still supported)
  if (flows.password) {
    const flow = flows.password;
    if (!flow.tokenUrl) {
      warnings.push(`OAuth2 scheme '${schemeName}': Password flow missing tokenUrl`);
    }
    warnings.push(
      `OAuth2 scheme '${schemeName}': Password flow is discouraged. ` +
      `Consider using Client Credentials or Authorization Code flow instead.`
    );

    flowConfigs.push({
      type: 'password',
      tokenUrl: flow.tokenUrl || '',
      refreshUrl: flow.refreshUrl,
      scopes: flow.scopes || {},
    });
  }

  // Validate at least one flow exists
  if (flowConfigs.length === 0) {
    throw new Error(`OAuth2 scheme '${schemeName}' has no valid flows defined`);
  }

  // Primary flow is the first one (preference order: clientCredentials > authorizationCode > others)
  const [primaryFlow, ...additionalFlows] = flowConfigs;

  return {
    flows,
    primaryFlow,
    additionalFlows: additionalFlows.length > 0 ? additionalFlows : undefined,
  };
}

/**
 * Detect if PKCE is required for Authorization Code flow
 */
function detectPKCERequirement(
  scheme: RawSecurityScheme,
  flow: OAuth2Flow,
  schemeName: string,
  warnings: string[]
): boolean {
  // Check for PKCE extension at scheme level (e.g., x-pkce: true)
  const schemeWithExtensions = scheme as RawSecurityScheme & { 'x-pkce'?: boolean; 'x-pkce-required'?: boolean };
  if (schemeWithExtensions['x-pkce'] !== undefined) {
    return schemeWithExtensions['x-pkce'];
  }
  if (schemeWithExtensions['x-pkce-required'] !== undefined) {
    return schemeWithExtensions['x-pkce-required'];
  }

  // Check for explicit PKCE extension at flow level (vendor-specific)
  const flowWithExtensions = flow as OAuth2Flow & { 'x-pkce-required'?: boolean; 'x-pkce'?: boolean };
  if (flowWithExtensions['x-pkce-required'] !== undefined) {
    return flowWithExtensions['x-pkce-required'];
  }
  if (flowWithExtensions['x-pkce'] !== undefined) {
    return flowWithExtensions['x-pkce'];
  }

  // Check description for PKCE mentions
  const flowWithDescription = flow as OAuth2Flow & { description?: string };
  const description = flowWithDescription.description || '';
  if (description.toLowerCase().includes('pkce')) {
    return true;
  }

  // Recommend PKCE as best practice
  warnings.push(
    `OAuth2 scheme '${schemeName}': Consider enabling PKCE for Authorization Code flow. ` +
    `Add 'x-pkce: true' to the security scheme definition for enhanced security.`
  );

  return false; // Default to false, but recommend enabling
}

/**
 * Extract OpenID Connect metadata
 */
function extractOpenIdConnectMetadata(scheme: RawSecurityScheme): OpenIdConnectMetadata {
  return {
    openIdConnectUrl: scheme.openIdConnectUrl || ''
  };
}

/**
 * Security object from OpenAPI document
 */
interface SecurityObject {
  [schemeName: string]: string[];
}

/**
 * Extract security requirements from OpenAPI security array
 *
 * @example
 * // AND logic: both schemes required
 * [{ apiKey: [], bearerAuth: [] }]
 *
 * @example
 * // OR logic: either scheme acceptable
 * [{ apiKey: [] }, { bearerAuth: [] }]
 *
 * @param securityArray - Security array from OpenAPI document
 * @returns Array of security requirements
 */
export function extractSecurityRequirements(
  securityArray: SecurityObject[]
): SecurityRequirement[] {
  return securityArray.map(securityObj => {
    const schemes = Object.keys(securityObj);
    const scopes: Record<string, string[]> = {};

    schemes.forEach(scheme => {
      scopes[scheme] = securityObj[scheme] || [];
    });

    // Multiple schemes in one object = AND logic (all required)
    // Multiple objects in array = OR logic (any acceptable)
    const logic = schemes.length > 1 ? 'AND' : 'OR';

    return { schemes, scopes, logic };
  });
}

/**
 * Get effective security requirements for an operation
 * - If operation.security is defined: use it (even if empty)
 * - If operation.security is undefined: inherit global
 *
 * @param operation - Operation metadata
 * @param globalRequirements - Global security requirements
 * @returns Effective security requirements for the operation
 */
function getOperationSecurity(
  operation: { security?: SecurityObject[] },
  globalRequirements: SecurityRequirement[]
): SecurityRequirement[] {
  // Check if operation has explicit security
  if ('security' in operation && operation.security) {
    // Empty array [] means no authentication required
    if (operation.security.length === 0) {
      return [];
    }
    // Non-empty array means operation-level override
    return extractSecurityRequirements(operation.security);
  }

  // No explicit security means inherit global
  return globalRequirements;
}

/**
 * Validate that all security requirements reference existing schemes
 *
 * @param schemes - Available security schemes
 * @param globalRequirements - Global security requirements
 * @param operationRequirements - Per-operation security requirements
 * @param warnings - Array to append warnings to
 */
function validateSecurityReferences(
  schemes: SecuritySchemeMap,
  globalRequirements: SecurityRequirement[],
  operationRequirements: Map<string, SecurityRequirement[]>,
  warnings: string[]
): void {
  const schemeNames = new Set(Object.keys(schemes));

  // Validate global requirements
  for (const requirement of globalRequirements) {
    for (const schemeName of requirement.schemes) {
      if (!schemeNames.has(schemeName)) {
        warnings.push(
          `Global security requirement references unknown scheme '${schemeName}'. ` +
          `Available schemes: ${Array.from(schemeNames).join(', ')}`
        );
      }
    }
  }

  // Validate operation requirements
  for (const [operationId, requirements] of operationRequirements.entries()) {
    for (const requirement of requirements) {
      for (const schemeName of requirement.schemes) {
        if (!schemeNames.has(schemeName)) {
          warnings.push(
            `Operation '${operationId}' references unknown scheme '${schemeName}'. ` +
            `Available schemes: ${Array.from(schemeNames).join(', ')}`
          );
        }
      }
    }
  }
}

/**
 * Type guards for runtime checking
 */
export function isApiKeyScheme(scheme: unknown): scheme is { type: 'apiKey'; name: string; in: 'header' | 'query' | 'cookie' } {
  const s = scheme as RawSecurityScheme;
  return s?.type === 'apiKey' && typeof s.name === 'string' && ['header', 'query', 'cookie'].includes(s.in || '');
}

export function isHttpBearerScheme(scheme: unknown): scheme is { type: 'http'; scheme: 'bearer'; bearerFormat?: string } {
  const s = scheme as RawSecurityScheme;
  return s?.type === 'http' && s.scheme === 'bearer';
}

export function isHttpBasicScheme(scheme: unknown): scheme is { type: 'http'; scheme: 'basic' } {
  const s = scheme as RawSecurityScheme;
  return s?.type === 'http' && s.scheme === 'basic';
}

export function isOAuth2Scheme(scheme: unknown): scheme is { type: 'oauth2'; flows: OAuth2Flows } {
  const s = scheme as RawSecurityScheme;
  return s?.type === 'oauth2' && s.flows !== undefined;
}

export function isOpenIdConnectScheme(scheme: unknown): scheme is { type: 'openIdConnect'; openIdConnectUrl: string } {
  const s = scheme as RawSecurityScheme;
  return s?.type === 'openIdConnect' && typeof s.openIdConnectUrl === 'string';
}
