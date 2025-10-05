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
      metadata = extractOAuth2Metadata(scheme);
      supported = false;
      warnings.push(
        `OAuth2 scheme '${name}' requires manual implementation. ` +
        `Generated code provides placeholder. See Epic 4 authentication documentation.`
      );
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
 * Extract OAuth2 metadata
 */
function extractOAuth2Metadata(scheme: RawSecurityScheme): OAuth2Metadata {
  return {
    flows: scheme.flows as OAuth2Flows
  };
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
