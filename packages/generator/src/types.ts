/**
 * Type definitions for the code generation engine
 */

/**
 * Template data model interface
 * This is the data structure passed to templates for rendering
 */
export interface TemplateDataModel {
  // API Metadata
  apiName: string;
  apiVersion: string;
  apiDescription?: string;

  // From parser
  schemas: SchemaTemplateData[];
  operations: OperationTemplateData[];
  securitySchemes: SecuritySchemeTemplateData[];
  tags: TagTemplateData[];
  servers: ServerTemplateData[];

  // Computed properties
  hasAuthentication: boolean;
  primaryServer: ServerTemplateData;
  packageName: string;

  // Metadata
  generatedAt: string;
  generatorVersion: string;
}

/**
 * Schema template data for TypeScript interface generation
 */
export interface SchemaTemplateData {
  name: string;
  pascalName: string;
  camelName: string;
  description?: string;
  properties: PropertyTemplateData[];
  required: string[];
  hasRequired: boolean;
  type: string;
  isEnum?: boolean;
  enumValues?: string[];
}

/**
 * Property template data for schema properties
 */
export interface PropertyTemplateData {
  name: string;
  camelName: string;
  type: string;
  tsType: string;
  description?: string;
  required: boolean;
  nullable?: boolean;
  format?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  items?: PropertyTemplateData;
  properties?: PropertyTemplateData[];
}

/**
 * Operation template data for MCP tool generation
 */
export interface OperationTemplateData {
  operationId: string;
  camelName: string;
  pascalName: string;
  method: string;
  path: string;
  summary?: string;
  description?: string;
  tags: string[];
  parameters: ParameterTemplateData[];
  requestBody?: RequestBodyTemplateData;
  responses: ResponseTemplateData[];
  security?: SecurityRequirementTemplateData[];
  hasParameters: boolean;
  hasRequestBody: boolean;
  hasPathParams: boolean;
  hasQueryParams: boolean;
  hasHeaderParams: boolean;
}

/**
 * Parameter template data
 */
export interface ParameterTemplateData {
  name: string;
  camelName: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  description?: string;
  required: boolean;
  type: string;
  tsType: string;
  format?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
}

/**
 * Request body template data
 */
export interface RequestBodyTemplateData {
  description?: string;
  required: boolean;
  contentType: string;
  schema: PropertyTemplateData;
}

/**
 * Response template data
 */
export interface ResponseTemplateData {
  statusCode: string;
  description?: string;
  contentType?: string;
  schema?: PropertyTemplateData;
}

/**
 * Security scheme template data
 */
export interface SecuritySchemeTemplateData {
  name: string;
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  scheme?: string;
  bearerFormat?: string;
  in?: 'header' | 'query' | 'cookie';
  paramName?: string;
  flows?: Record<string, unknown>;
  classification?: string;
  supported?: boolean;
  metadata?: any;  // Full metadata from parser (includes primaryFlow for OAuth)
}

/**
 * Security requirement template data
 */
export interface SecurityRequirementTemplateData {
  name: string;
  scopes: string[];
}

/**
 * Tag template data
 */
export interface TagTemplateData {
  name: string;
  description?: string;
  pascalName: string;
}

/**
 * Server template data
 */
export interface ServerTemplateData {
  url: string;
  description?: string;
  variables?: Record<string, ServerVariableTemplateData>;
}

/**
 * Server variable template data
 */
export interface ServerVariableTemplateData {
  default: string;
  description?: string;
  enum?: string[];
}

/**
 * Generator options
 */
export interface GeneratorOptions {
  outputDir: string;
  templateDir?: string;
  prettierConfig?: PrettierConfig;
  verbose?: boolean;
  force?: boolean;
}

/**
 * Prettier configuration
 */
export interface PrettierConfig {
  parser?: string;
  semi?: boolean;
  singleQuote?: boolean;
  trailingComma?: 'none' | 'es5' | 'all';
  printWidth?: number;
  tabWidth?: number;
  arrowParens?: 'avoid' | 'always';
}

/**
 * Generator result
 */
export interface GeneratorResult {
  success: boolean;
  outputDir: string;
  filesGenerated: string[];
  errors: GenerationErrorInfo[];
  warnings: string[];
  duration: number;
}

/**
 * Generation error information
 */
export interface GenerationErrorInfo {
  message: string;
  code: string;
  context?: Record<string, unknown>;
  templatePath?: string;
  lineNumber?: number;
}

/**
 * MCP Server generation options
 */
export interface GenerationOptions {
  /** Path to OpenAPI specification file */
  openApiPath: string;
  /** Output directory for generated MCP server */
  outputDir: string;
  /** License for generated package (default: MIT) */
  license?: string;
  /** Author name for package.json */
  author?: string;
  /** Repository URL for package.json */
  repository?: string;
  /** Skip OpenAPI validation (use with caution) */
  skipValidation?: boolean;
}

/**
 * MCP Server generation result
 */
export interface GenerationResult {
  success: boolean;
  outputDir: string;
  filesGenerated: string[];
  metadata: {
    apiName: string;
    apiVersion: string;
    operationCount: number;
    schemaCount: number;
    generationTime: number;
  };
  warnings: string[];
}
