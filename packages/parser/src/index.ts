/**
 * @openapi-to-mcp/parser
 * OpenAPI 3.0 parser with format detection and document loading
 * @module @openapi-to-mcp/parser
 */

export const version = '0.1.0';

// Export loader functions
export { loadOpenAPIDocument, loadOpenAPI } from './loader.js';

// Export validator functions
export { validateOpenAPISchema, normalizeDocument } from './validator.js';

// Export reference resolver functions
export { resolveReferences } from './ref-resolver.js';

// Export types
export type { OpenAPIObject, LoaderOptions, LoaderResult, FileFormat } from './types.js';

// Export validation types
export type { ValidationResult, ValidationIssue, ValidationSeverity } from './validation-types.js';

// Export reference resolution types
export type { ResolutionResult, ResolutionError } from './ref-resolver.js';

// Export schema extractor functions
export { extractSchemas, serializeSchemaMap, deserializeSchemaMap } from './schema-extractor.js';

// Export schema types
export type {
  NormalizedSchema,
  PropertySchema,
  SchemaMap,
  CompositionMetadata,
  DiscriminatorInfo,
  SchemaConstraints,
  PropertyConstraints,
  SchemaType,
} from './schema-types.js';

// Export operation extractor functions
export { extractOperations } from './operation-extractor.js';

// Export operation types
export type {
  OperationMetadata,
  ParameterMetadata,
  RequestBodyMetadata,
  ResponseMetadata,
  HttpMethod,
  ParameterLocation,
} from './operation-types.js';

// Export security extractor functions
export {
  extractSecuritySchemes,
  classifySecurityScheme,
  extractSecurityRequirements,
  isApiKeyScheme,
  isHttpBearerScheme,
  isHttpBasicScheme,
  isOAuth2Scheme,
  isOpenIdConnectScheme,
} from './security-extractor.js';

// Export security types
export type {
  SecuritySchemeMap,
  ClassifiedSecurityScheme,
  SecurityClassification,
  SecurityMetadata,
  ApiKeyMetadata,
  HttpBearerMetadata,
  HttpBasicMetadata,
  OAuth2Metadata,
  OAuth2Flows,
  OAuth2Flow,
  OpenIdConnectMetadata,
  SecurityRequirement,
  SecurityExtractionResult,
} from './security-extractor.js';

// Export tag extractor functions
export {
  extractTags,
  normalizeTagName,
  generateTagFromPath,
} from './tag-extractor.js';

// Export tag types
export type {
  TagMetadata,
  ExternalDocs,
  TagComplexity,
  MethodDistribution,
  TagExtractionResult,
} from './tag-extractor.js';

// Export server extractor functions
export {
  extractServers,
  extractBasePath,
  resolveServerUrl,
  inferServerEnvironment,
  generateEnvVarSuggestions,
} from './server-extractor.js';

// Export server types
export type {
  ServerMetadata,
  ServerVariables,
  ServerVariable,
  ServerEnvironment,
  ServerExtractionResult,
} from './server-extractor.js';

// Export errors
export {
  ParserError,
  FileSystemError,
  ParseError,
  UnsupportedFormatError,
  FileSizeError,
} from './errors.js';

// ============================================================================
// Unified Parser Entry Point (Story 2.9)
// ============================================================================

import { loadOpenAPIDocument } from './loader.js';
import { validateOpenAPISchema } from './validator.js';
import { resolveReferences } from './ref-resolver.js';
import { extractSchemas } from './schema-extractor.js';
import { extractOperations } from './operation-extractor.js';
import { extractSecuritySchemes } from './security-extractor.js';
import { extractTags } from './tag-extractor.js';
import { extractServers } from './server-extractor.js';
import { dirname } from 'node:path';
import type { OpenAPI } from 'openapi-types';
import type { SchemaMap } from './schema-types.js';
import type { OperationMetadata } from './operation-types.js';
import type { SecurityExtractionResult } from './security-extractor.js';
import type { TagExtractionResult } from './tag-extractor.js';
import type { ServerExtractionResult } from './server-extractor.js';
import type { ValidationIssue } from './validation-types.js';
import type { ResolutionError } from './ref-resolver.js';

/**
 * Parser execution metadata and performance metrics
 */
export interface ParseMetadata {
  /** API name from document */
  apiName: string;
  /** API version from document */
  apiVersion: string;
  /** Total parse time in milliseconds */
  parseTime: number;
  /** Number of schemas extracted */
  schemaCount: number;
  /** Number of operations extracted */
  operationCount: number;
  /** Number of tags extracted */
  tagCount: number;
  /** Number of servers extracted */
  serverCount: number;
}

/**
 * Complete parser output with all extracted metadata
 */
export interface ParseResult {
  /** Fully resolved OpenAPI document */
  document: OpenAPI.Document;
  /** Extracted and normalized schemas */
  schemas: SchemaMap;
  /** Extracted operations with metadata */
  operations: OperationMetadata[];
  /** Extracted security schemes and requirements */
  security: SecurityExtractionResult;
  /** Extracted tags with operation mapping */
  tags: TagExtractionResult;
  /** Extracted servers with URL resolution */
  servers: ServerExtractionResult;
  /** Validation and parsing errors */
  errors: Array<ValidationIssue | ResolutionError | Error>;
  /** Warnings from all pipeline stages */
  warnings: string[];
  /** Performance and metadata */
  metadata: ParseMetadata;
}

/**
 * Parse OpenAPI document through complete pipeline
 *
 * Executes all parser stages in sequence:
 * 1. Load document (Story 2.1)
 * 2. Validate schema (Story 2.2)
 * 3. Resolve references (Story 2.3)
 * 4. Extract schemas (Story 2.4)
 * 5. Extract operations (Story 2.5)
 * 6. Extract security (Story 2.6)
 * 7. Extract tags (Story 2.7)
 * 8. Extract servers (Story 2.8)
 *
 * @param filePath - Path to OpenAPI document (JSON or YAML)
 * @returns Complete parse result with all extracted metadata
 * @throws Error if validation or parsing fails
 *
 * @example
 * ```typescript
 * const result = await parseOpenAPIDocument('./api.yaml');
 * console.log(`Parsed ${result.metadata.operationCount} operations`);
 * console.log(`Parse time: ${result.metadata.parseTime}ms`);
 * ```
 */
export interface ParseOptions {
  /** Skip OpenAPI schema validation */
  skipValidation?: boolean;
}

export async function parseOpenAPIDocument(
  filePath: string,
  options?: ParseOptions
): Promise<ParseResult> {
  const startTime = Date.now();
  const errors: Array<ValidationIssue | ResolutionError | Error> = [];
  const warnings: string[] = [];

  // Story 2.1: Load document
  const loaderResult = await loadOpenAPIDocument(filePath);
  const document = loaderResult.document;

  // Story 2.2: Validate schema
  if (!options?.skipValidation) {
    const validationResult = await validateOpenAPISchema(document);
    if (!validationResult.valid) {
      errors.push(...validationResult.errors);
      throw new Error(
        `OpenAPI validation failed with ${validationResult.errors.length} error(s)`
      );
    }
    warnings.push(
      ...validationResult.warnings.map((issue) => `${issue.path}: ${issue.message}`)
    );
  } else {
    warnings.push('OpenAPI validation skipped (skipValidation: true)');
  }

  // Story 2.3: Resolve references
  const basePath = dirname(filePath);
  const resolutionResult = await resolveReferences(document, basePath);
  if (resolutionResult.errors.length > 0) {
    errors.push(...resolutionResult.errors);
    throw new Error(
      `Reference resolution failed with ${resolutionResult.errors.length} error(s)`
    );
  }
  const resolvedDocument = resolutionResult.document;

  // Story 2.4: Extract schemas
  const schemas = extractSchemas(resolvedDocument);

  // Story 2.5: Extract operations
  const operations = extractOperations(resolvedDocument);

  // Story 2.6: Extract security
  const security = extractSecuritySchemes(resolvedDocument, operations);
  warnings.push(...security.warnings);

  // Story 2.7: Extract tags
  const tags = extractTags(resolvedDocument, operations);
  warnings.push(...tags.warnings);

  // Story 2.8: Extract servers
  const servers = extractServers(resolvedDocument);
  warnings.push(...servers.warnings);

  const parseTime = Date.now() - startTime;

  return {
    document: resolvedDocument,
    schemas,
    operations,
    security,
    tags,
    servers,
    errors,
    warnings,
    metadata: {
      apiName: document.info.title,
      apiVersion: document.info.version,
      parseTime,
      schemaCount: schemas.size,
      operationCount: operations.length,
      tagCount: tags.tags.length,
      serverCount: servers.servers.length,
    },
  };
}
