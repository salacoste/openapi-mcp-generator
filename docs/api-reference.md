# API Reference

**Project:** OpenAPI-to-MCP Generator
**Version:** 0.1.0 (MVP)
**Last Updated:** 2025-01-02

---

## Table of Contents

1. [CLI Commands](#1-cli-commands)
2. [Parser API](#2-parser-api)
3. [Generator API](#3-generator-api)
4. [Shared Utilities](#4-shared-utilities)
5. [Generated MCP Server API](#5-generated-mcp-server-api)
6. [Type Definitions](#6-type-definitions)

---

## 1. CLI Commands

### 1.1 `generate`

Generate MCP server from OpenAPI specification.

**Usage**:
```bash
openapi-to-mcp generate <input> [options]
```

**Arguments**:
- `<input>` - Path to OpenAPI specification file (JSON or YAML)

**Options**:
- `-o, --output <dir>` - Output directory (default: `./generated`)
- `-n, --name <name>` - Package name override (default: from spec title)
- `-f, --filter <tags>` - Comma-separated list of tags to include
- `--no-types` - Skip TypeScript types generation
- `--no-client` - Skip HTTP client generation
- `-v, --verbose` - Verbose logging
- `-h, --help` - Display help

**Examples**:
```bash
# Basic usage
openapi-to-mcp generate ./swagger/swagger.json

# Custom output directory
openapi-to-mcp generate ./api-spec.yaml -o ./my-mcp-server

# Filter by tags
openapi-to-mcp generate ./spec.json -f "Campaign,Statistics"

# Custom name with verbose logging
openapi-to-mcp generate ./spec.json -n my-api-server -v
```

**Exit Codes**:
- `0` - Success
- `1` - Invalid input file
- `2` - Parsing error
- `3` - Generation error
- `4` - File write error

---

### 1.2 `validate`

Validate OpenAPI specification without generating code.

**Usage**:
```bash
openapi-to-mcp validate <input> [options]
```

**Arguments**:
- `<input>` - Path to OpenAPI specification file

**Options**:
- `--strict` - Enable strict validation (fail on warnings)
- `-v, --verbose` - Verbose output
- `-h, --help` - Display help

**Examples**:
```bash
# Basic validation
openapi-to-mcp validate ./swagger.json

# Strict mode
openapi-to-mcp validate ./spec.yaml --strict
```

**Output**:
```
✓ Valid OpenAPI 3.0.0 specification
✓ 39 paths found
✓ 87 schemas found
✓ All $refs resolved successfully
⚠ 2 operations without operationId
```

---

### 1.3 `init`

Initialize new MCP server project from template.

**Usage**:
```bash
openapi-to-mcp init <name> [options]
```

**Arguments**:
- `<name>` - Project name

**Options**:
- `-t, --template <type>` - Template type: `basic` | `advanced` (default: `basic`)
- `-d, --directory <dir>` - Target directory (default: `./<name>`)
- `-h, --help` - Display help

**Examples**:
```bash
# Create basic project
openapi-to-mcp init my-api-server

# Create advanced project
openapi-to-mcp init my-api-server -t advanced
```

---

## 2. Parser API

### 2.1 `OpenAPIParser`

Main parser class for OpenAPI specifications.

#### Constructor

```typescript
constructor(spec: unknown, options?: ParserOptions)
```

**Parameters**:
- `spec` - Raw OpenAPI specification object
- `options` - Optional parser configuration

**Options**:
```typescript
interface ParserOptions {
  strict?: boolean;           // Strict validation (default: false)
  resolveRefs?: boolean;      // Auto-resolve $refs (default: true)
  allowCircular?: boolean;    // Allow circular refs (default: false)
  maxDepth?: number;          // Max $ref depth (default: 10)
}
```

**Example**:
```typescript
import { OpenAPIParser } from '@openapi-to-mcp/parser';

const spec = JSON.parse(fs.readFileSync('./swagger.json', 'utf-8'));
const parser = new OpenAPIParser(spec, { strict: true });
```

---

#### `parse()`

Parse OpenAPI specification and return structured data.

```typescript
async parse(): Promise<ParsedOpenAPI>
```

**Returns**: Promise resolving to parsed OpenAPI structure

**Throws**:
- `UnsupportedVersionError` - If OpenAPI version is not 3.0.x
- `ValidationError` - If spec is invalid
- `CircularReferenceError` - If circular $refs detected

**Example**:
```typescript
try {
  const parsed = await parser.parse();
  console.log(`Parsed ${Object.keys(parsed.paths).length} paths`);
} catch (error) {
  if (error instanceof UnsupportedVersionError) {
    console.error('Only OpenAPI 3.0 is supported');
  }
}
```

---

#### `validate()`

Validate specification without full parsing.

```typescript
validate(): ValidationResult
```

**Returns**:
```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

**Example**:
```typescript
const result = parser.validate();
if (!result.valid) {
  result.errors.forEach(err => console.error(err.message));
}
```

---

### 2.2 `RefResolver`

Reference resolver for $ref objects.

#### Constructor

```typescript
constructor(spec: OpenAPISpec)
```

#### `resolve()`

Resolve a $ref to its target object.

```typescript
resolve(ref: string): any
```

**Parameters**:
- `ref` - Reference string (e.g., `"#/components/schemas/Campaign"`)

**Returns**: Resolved object

**Throws**:
- `CircularReferenceError` - If circular reference detected
- `InvalidReferenceError` - If reference path is invalid
- `ReferenceNotFoundError` - If target doesn't exist

**Example**:
```typescript
import { RefResolver } from '@openapi-to-mcp/parser';

const resolver = new RefResolver(spec);
const schema = resolver.resolve('#/components/schemas/Campaign');
console.log(schema.type); // "object"
```

---

#### `reset()`

Reset visited references tracking.

```typescript
reset(): void
```

**Example**:
```typescript
resolver.reset();
const schema1 = resolver.resolve('#/components/schemas/A');
resolver.reset();
const schema2 = resolver.resolve('#/components/schemas/A'); // Fresh resolution
```

---

### 2.3 Utility Functions

#### `validateOpenAPIVersion()`

```typescript
function validateOpenAPIVersion(version: string): void
```

**Throws**: `UnsupportedVersionError` if version is not 3.0.x

---

#### `validateRequiredFields()`

```typescript
function validateRequiredFields(
  obj: any,
  fields: string[],
  objectName?: string
): void
```

**Throws**: `MissingFieldsError` if any required field is missing

---

## 3. Generator API

### 3.1 `TypeGenerator`

Generate TypeScript types from OpenAPI schemas.

#### Constructor

```typescript
constructor(options?: TypeGeneratorOptions)
```

**Options**:
```typescript
interface TypeGeneratorOptions {
  prefix?: string;           // Prefix for all types (default: "")
  suffix?: string;           // Suffix for all types (default: "")
  enumStyle?: 'enum' | 'union';  // Enum generation style (default: "union")
  optionalStyle?: '?' | 'undefined';  // Optional field style (default: "?")
}
```

---

#### `generate()`

Generate TypeScript types from schemas.

```typescript
generate(schemas: Record<string, SchemaObject>): string
```

**Parameters**:
- `schemas` - Map of schema name to schema object

**Returns**: TypeScript code as string

**Example**:
```typescript
import { TypeGenerator } from '@openapi-to-mcp/generator';

const generator = new TypeGenerator({ suffix: 'Type' });
const types = generator.generate(parsed.components.schemas);

fs.writeFileSync('./types.ts', types);
```

---

#### `generateInterface()`

Generate single TypeScript interface.

```typescript
generateInterface(name: string, schema: SchemaObject): string
```

**Example**:
```typescript
const interfaceCode = generator.generateInterface('Campaign', schema);
// Output: "export interface Campaign { ... }"
```

---

### 3.2 `ToolGenerator`

Generate MCP tools from OpenAPI operations.

#### Constructor

```typescript
constructor(options?: ToolGeneratorOptions)
```

**Options**:
```typescript
interface ToolGeneratorOptions {
  includeDeprecated?: boolean;     // Include deprecated operations (default: true)
  operationIdRequired?: boolean;   // Require operationId (default: false)
  categoryTagIndex?: number;       // Which tag to use for category (default: 0)
}
```

---

#### `generate()`

Generate MCP tools from paths.

```typescript
generate(
  paths: ParsedPaths,
  components: ParsedComponents
): MCPTool[]
```

**Returns**: Array of MCP tool definitions

**Example**:
```typescript
import { ToolGenerator } from '@openapi-to-mcp/generator';

const generator = new ToolGenerator();
const tools = generator.generate(parsed.paths, parsed.components);

console.log(`Generated ${tools.length} tools`);
```

---

#### `generateTool()`

Generate single MCP tool from operation.

```typescript
generateTool(
  path: string,
  method: HttpMethod,
  operation: OperationObject
): MCPTool
```

**Example**:
```typescript
const tool = generator.generateTool(
  '/api/client/campaign',
  'get',
  operation
);
```

---

### 3.3 `ClientGenerator`

Generate HTTP client for API calls.

#### Constructor

```typescript
constructor(options?: ClientGeneratorOptions)
```

**Options**:
```typescript
interface ClientGeneratorOptions {
  clientLibrary?: 'axios' | 'fetch';   // HTTP library (default: "axios")
  timeout?: number;                     // Request timeout ms (default: 30000)
  retries?: number;                     // Retry attempts (default: 0)
}
```

---

#### `generate()`

Generate HTTP client code.

```typescript
generate(parsed: ParsedOpenAPI): string
```

**Returns**: TypeScript code as string

**Example**:
```typescript
import { ClientGenerator } from '@openapi-to-mcp/generator';

const generator = new ClientGenerator({ timeout: 60000 });
const client = generator.generate(parsed);

fs.writeFileSync('./client.ts', client);
```

---

### 3.4 `ServerGenerator`

Generate complete MCP server file.

#### `generate()`

```typescript
generate(
  tools: MCPTool[],
  client: string,
  types: string,
  config: ServerConfig
): string
```

**Parameters**:
- `tools` - Array of MCP tool definitions
- `client` - HTTP client code
- `types` - TypeScript types code
- `config` - Server configuration

**Returns**: Complete server.ts code

**Example**:
```typescript
import { ServerGenerator } from '@openapi-to-mcp/generator';

const generator = new ServerGenerator();
const server = generator.generate(tools, client, types, {
  name: 'ozon-performance',
  version: '1.0.0',
  baseURL: 'https://api-performance.ozon.ru:443',
});

fs.writeFileSync('./server.ts', server);
```

---

## 4. Shared Utilities

### 4.1 Naming Utilities

#### `camelCase()`

```typescript
function camelCase(str: string): string
```

Convert string to camelCase.

**Example**:
```typescript
import { camelCase } from '@openapi-to-mcp/shared';

camelCase('list-campaigns'); // "listCampaigns"
camelCase('GET_API_CLIENT'); // "getApiClient"
```

---

#### `pascalCase()`

```typescript
function pascalCase(str: string): string
```

Convert string to PascalCase.

**Example**:
```typescript
import { pascalCase } from '@openapi-to-mcp/shared';

pascalCase('campaign-object'); // "CampaignObject"
```

---

#### `sanitizePackageName()`

```typescript
function sanitizePackageName(name: string): string
```

Sanitize string for npm package name.

**Example**:
```typescript
import { sanitizePackageName } from '@openapi-to-mcp/shared';

sanitizePackageName('Ozon Performance API'); // "ozon-performance-api"
```

---

### 4.2 Type Mapping

#### `mapOpenAPIType()`

```typescript
function mapOpenAPIType(schema: SchemaObject): string
```

Map OpenAPI type to TypeScript type.

**Example**:
```typescript
import { mapOpenAPIType } from '@openapi-to-mcp/shared';

mapOpenAPIType({ type: 'string' });                    // "string"
mapOpenAPIType({ type: 'integer' });                   // "number"
mapOpenAPIType({ type: 'array', items: { type: 'string' } }); // "string[]"
```

---

### 4.3 Validation Utilities

#### `isValidURL()`

```typescript
function isValidURL(url: string): boolean
```

Validate URL format.

---

#### `isValidSemver()`

```typescript
function isValidSemver(version: string): boolean
```

Validate semantic version format.

---

## 5. Generated MCP Server API

The generated MCP server exposes the following runtime API.

### 5.1 Server Initialization

```typescript
import { createServer } from './server';

const server = createServer({
  bearerToken: process.env.OZON_API_TOKEN,
  baseURL: 'https://api-performance.ozon.ru:443',
});

server.listen();
```

---

### 5.2 Configuration

```typescript
interface ServerConfig {
  // Authentication
  bearerToken?: string;
  apiKey?: string;
  apiKeyName?: string;
  username?: string;
  password?: string;

  // Server
  baseURL?: string;
  timeout?: number;

  // Features
  enableCaching?: boolean;
  cacheMaxAge?: number;
  rateLimitPerMinute?: number;
}
```

---

### 5.3 Tool Methods

All generated tools follow this interface:

```typescript
async function toolName(input: ToolInput): Promise<ToolOutput>
```

**Example** (for Ozon API):
```typescript
// List campaigns
const campaigns = await server.listCampaigns({
  page: 1,
  pageSize: 10,
});

// Get campaign by ID
const campaign = await server.getCampaign({
  campaignId: '12345',
});
```

---

### 5.4 Meta Tools

#### `listMethods()`

List available API methods with filtering.

```typescript
async listMethods(input?: {
  category?: string;
  search?: string;
}): Promise<MethodInfo[]>
```

**Example**:
```typescript
// List all methods
const all = await server.listMethods();

// Filter by category
const campaigns = await server.listMethods({ category: 'Campaign' });

// Search
const stats = await server.listMethods({ search: 'statistics' });
```

---

#### `listCategories()`

List all available categories (tags).

```typescript
async listCategories(): Promise<CategoryInfo[]>
```

**Returns**:
```typescript
interface CategoryInfo {
  name: string;
  description?: string;
  methodCount: number;
}
```

**Example**:
```typescript
const categories = await server.listCategories();
// [
//   { name: 'Campaign', methodCount: 15 },
//   { name: 'Statistics', methodCount: 12 },
//   ...
// ]
```

---

## 6. Type Definitions

### 6.1 Core Types

#### `ParsedOpenAPI`

```typescript
interface ParsedOpenAPI {
  openapi: string;
  info: ParsedInfo;
  servers: ParsedServer[];
  paths: ParsedPaths;
  components: ParsedComponents;
  tags?: ParsedTag[];
  externalDocs?: ExternalDocumentation;
}
```

---

#### `ParsedInfo`

```typescript
interface ParsedInfo {
  title: string;
  version: string;
  description?: string;
  termsOfService?: string;
  contact?: ContactObject;
  license?: LicenseObject;
}
```

---

#### `ParsedServer`

```typescript
interface ParsedServer {
  url: string;
  description?: string;
  variables?: Record<string, ServerVariable>;
}
```

---

#### `ParsedPaths`

```typescript
type ParsedPaths = Record<string, PathItemObject>;

interface PathItemObject {
  get?: OperationObject;
  post?: OperationObject;
  put?: OperationObject;
  delete?: OperationObject;
  patch?: OperationObject;
  options?: OperationObject;
  head?: OperationObject;
  trace?: OperationObject;
  parameters?: ParameterObject[];
}
```

---

#### `OperationObject`

```typescript
interface OperationObject {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: ExternalDocumentation;
  operationId?: string;
  parameters?: (ParameterObject | ReferenceObject)[];
  requestBody?: RequestBodyObject | ReferenceObject;
  responses: ResponsesObject;
  deprecated?: boolean;
  security?: SecurityRequirementObject[];
  servers?: ServerObject[];
}
```

---

#### `ParsedComponents`

```typescript
interface ParsedComponents {
  schemas?: Record<string, SchemaObject>;
  responses?: Record<string, ResponseObject>;
  parameters?: Record<string, ParameterObject>;
  requestBodies?: Record<string, RequestBodyObject>;
  headers?: Record<string, HeaderObject>;
  securitySchemes?: Record<string, SecuritySchemeObject>;
}
```

---

### 6.2 MCP Types

#### `MCPTool`

```typescript
interface MCPTool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  metadata?: {
    path?: string;
    method?: string;
    tags?: string[];
    category?: string;
    operationId?: string;
    deprecated?: boolean;
    [key: string]: any;
  };
}
```

---

#### `JSONSchema`

```typescript
interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema;
  enum?: any[];
  format?: string;
  description?: string;
  default?: any;
  example?: any;
  $ref?: string;
}
```

---

### 6.3 Error Types

#### `OpenAPIError`

Base error class.

```typescript
class OpenAPIError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'OpenAPIError';
  }
}
```

---

#### `UnsupportedVersionError`

```typescript
class UnsupportedVersionError extends OpenAPIError {
  constructor(version: string) {
    super(
      `Unsupported OpenAPI version: ${version}. Only 3.0.x is supported.`,
      'UNSUPPORTED_VERSION'
    );
  }
}
```

---

#### `ValidationError`

```typescript
class ValidationError extends OpenAPIError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR');
  }
}
```

---

#### `CircularReferenceError`

```typescript
class CircularReferenceError extends OpenAPIError {
  constructor(ref: string) {
    super(
      `Circular reference detected: ${ref}`,
      'CIRCULAR_REFERENCE'
    );
  }
}
```

---

#### `ReferenceNotFoundError`

```typescript
class ReferenceNotFoundError extends OpenAPIError {
  constructor(ref: string) {
    super(
      `Reference not found: ${ref}`,
      'REFERENCE_NOT_FOUND'
    );
  }
}
```

---

## Usage Examples

### Complete Generation Flow

```typescript
import { OpenAPIParser } from '@openapi-to-mcp/parser';
import { TypeGenerator, ToolGenerator, ClientGenerator, ServerGenerator } from '@openapi-to-mcp/generator';
import fs from 'fs';

// 1. Load spec
const spec = JSON.parse(fs.readFileSync('./swagger.json', 'utf-8'));

// 2. Parse
const parser = new OpenAPIParser(spec);
const parsed = await parser.parse();

// 3. Generate types
const typeGen = new TypeGenerator();
const types = typeGen.generate(parsed.components.schemas);

// 4. Generate tools
const toolGen = new ToolGenerator();
const tools = toolGen.generate(parsed.paths, parsed.components);

// 5. Generate client
const clientGen = new ClientGenerator();
const client = clientGen.generate(parsed);

// 6. Generate server
const serverGen = new ServerGenerator();
const server = serverGen.generate(tools, client, types, {
  name: 'my-api',
  version: '1.0.0',
  baseURL: parsed.servers[0].url,
});

// 7. Write files
fs.writeFileSync('./output/types.ts', types);
fs.writeFileSync('./output/client.ts', client);
fs.writeFileSync('./output/server.ts', server);
```

---

## See Also

- [Architecture Documentation](./architecture.md) - System design and patterns
- [User Guide](./user-guide.md) - Getting started guide
- [Examples](./examples.md) - Example usage and recipes
