# @openapi-to-mcp/parser

OpenAPI 3.0 document loader with automatic format detection and comprehensive error handling.

## Features

- ✅ **Automatic Format Detection** - Supports JSON and YAML formats (.json, .yaml, .yml)
- ✅ **Case-Insensitive Extensions** - Handles .JSON, .YAML, .YML extensions
- ✅ **Comprehensive Error Handling** - Detailed error messages with line numbers
- ✅ **UTF-8 Support** - Proper Unicode and encoding handling
- ✅ **Path Security** - Automatic path normalization and validation
- ✅ **File Size Limits** - Configurable maximum file size (default: 10MB)
- ✅ **TypeScript First** - Full type safety with OpenAPI types
- ✅ **Server Extraction** - Extract and normalize server URLs with environment detection

## Installation

```bash
pnpm add @openapi-to-mcp/parser
```

## Usage

### Basic Usage

```typescript
import { loadOpenAPIDocument } from '@openapi-to-mcp/parser';

// Load JSON OpenAPI file
const result = await loadOpenAPIDocument('./api.json');
console.log(result.document.info.title); // API title
console.log(result.format); // 'json'
console.log(result.size); // File size in bytes
```

### Load YAML Files

```typescript
import { loadOpenAPIDocument } from '@openapi-to-mcp/parser';

const result = await loadOpenAPIDocument('./api.yaml');
console.log(result.document.openapi); // '3.0.0'
console.log(result.format); // 'yaml'
```

### Convenience Function

```typescript
import { loadOpenAPI } from '@openapi-to-mcp/parser';

// Returns only the document (no metadata)
const document = await loadOpenAPI('./api.json');
console.log(document.info.version);
```

### Server Extraction

```typescript
import { extractServers } from '@openapi-to-mcp/parser';

const document = await loadOpenAPI('./api.json');
const serverResult = extractServers(document);

console.log(`Found ${serverResult.servers.length} servers`);
console.log(`Default: ${serverResult.defaultServer.baseURL}`);

serverResult.servers.forEach((server) => {
  console.log(`- ${server.baseURL} (${server.environment})`);
  console.log(`  Base path: ${server.basePath}`);
  console.log(`  Priority: ${server.priority}`);

  if (server.variables) {
    Object.entries(server.variables).forEach(([name, variable]) => {
      console.log(`  Variable {${name}}: default="${variable.default}"`);
    });
  }
});
```

### With Options

```typescript
import { loadOpenAPIDocument } from '@openapi-to-mcp/parser';

const result = await loadOpenAPIDocument('./api.json', {
  maxFileSize: 5 * 1024 * 1024, // 5MB limit
});
```

## API Reference

### `loadOpenAPIDocument(filePath, options?)`

Load and parse an OpenAPI document from a file with metadata.

**Parameters:**
- `filePath` (string) - Path to OpenAPI file (relative or absolute)
- `options` (LoaderOptions, optional)
  - `maxFileSize` (number) - Maximum file size in bytes (default: 10MB)

**Returns:** `Promise<LoaderResult>`
- `document` (OpenAPIObject) - Parsed OpenAPI document
- `filePath` (string) - Absolute path to the file
- `format` ('json' | 'yaml') - Detected file format
- `size` (number) - File size in bytes

**Throws:**
- `FileSystemError` - File not found, not accessible, or not a file
- `UnsupportedFormatError` - File extension not .json, .yaml, or .yml
- `FileSizeError` - File exceeds maximum size
- `ParseError` - Invalid JSON or YAML syntax

### `loadOpenAPI(filePath, options?)`

Convenience function that returns only the parsed document.

**Parameters:**
- Same as `loadOpenAPIDocument`

**Returns:** `Promise<OpenAPIObject>`

**Throws:**
- Same errors as `loadOpenAPIDocument`

### `extractServers(document)`

Extract and configure server URLs from an OpenAPI document.

**Parameters:**
- `document` (OpenAPI.Document) - Fully resolved OpenAPI document

**Returns:** `ServerExtractionResult`
- `servers` (ServerMetadata[]) - All extracted servers with metadata
- `defaultServer` (ServerMetadata) - First server (default)
- `hasMultipleServers` (boolean) - Whether multiple servers are defined
- `warnings` (string[]) - Any warnings generated during extraction

**Server Metadata:**
- `url` (string) - Original URL template
- `baseURL` (string) - Resolved URL with variables substituted
- `basePath` (string) - Extracted path component (normalized)
- `environment` (ServerEnvironment) - Inferred environment type
- `priority` (number) - Server priority (0 = default)
- `variables` (ServerVariables?) - Server variables with defaults
- `envVarSuggestions` (Record<string, string>?) - Environment variable name suggestions

**Environment Types:**
- `production` - Detected from 'prod' keyword
- `staging` - Detected from 'staging' or 'stg' keyword
- `development` - Detected from 'dev' or 'development' keyword
- `local` - Detected from localhost or 127.0.0.1
- `unknown` - No environment indicators found

### `extractBasePath(url)`

Extract base path from a server URL.

**Parameters:**
- `url` (string) - Server URL

**Returns:** `string` - Normalized base path (e.g., '/v1', '/')

### `resolveServerUrl(urlTemplate, variables?)`

Resolve server URL variables with defaults.

**Parameters:**
- `urlTemplate` (string) - URL template with variables
- `variables` (ServerVariables?) - Variable definitions

**Returns:** `string` - Resolved URL with variables substituted

### `inferServerEnvironment(url, description?)`

Infer server environment from URL and description.

**Parameters:**
- `url` (string) - Server URL
- `description` (string?) - Server description

**Returns:** `ServerEnvironment` - Inferred environment type

### `generateEnvVarSuggestions(variables?)`

Generate environment variable name suggestions for server variables.

**Parameters:**
- `variables` (ServerVariables?) - Server variables

**Returns:** `Record<string, string>` - Map of variable name to environment variable name

## Error Handling

### FileSystemError

Thrown when file operations fail:

```typescript
import { FileSystemError } from '@openapi-to-mcp/parser';

try {
  await loadOpenAPIDocument('./missing.json');
} catch (error) {
  if (error instanceof FileSystemError) {
    console.error(`File error: ${error.message}`);
    console.error(`Path: ${error.path}`);
  }
}
```

### ParseError

Thrown when JSON or YAML parsing fails:

```typescript
import { ParseError } from '@openapi-to-mcp/parser';

try {
  await loadOpenAPIDocument('./invalid.yaml');
} catch (error) {
  if (error instanceof ParseError) {
    console.error(`Parse error: ${error.message}`);
    if (error.line) {
      console.error(`Line: ${error.line}, Column: ${error.column}`);
    }
  }
}
```

### UnsupportedFormatError

Thrown for unsupported file extensions:

```typescript
import { UnsupportedFormatError } from '@openapi-to-mcp/parser';

try {
  await loadOpenAPIDocument('./api.txt');
} catch (error) {
  if (error instanceof UnsupportedFormatError) {
    console.error(`Unsupported format: ${error.extension}`);
  }
}
```

### FileSizeError

Thrown when file exceeds size limit:

```typescript
import { FileSizeError } from '@openapi-to-mcp/parser';

try {
  await loadOpenAPIDocument('./huge.json', { maxFileSize: 1024 }); // 1KB limit
} catch (error) {
  if (error instanceof FileSizeError) {
    console.error(`File too large: ${error.actualSize} bytes`);
    console.error(`Maximum: ${error.maxSize} bytes`);
  }
}
```

## Supported Formats

| Format | Extensions | Description |
|--------|-----------|-------------|
| JSON | `.json`, `.JSON` | Standard JSON format |
| YAML | `.yaml`, `.yml`, `.YAML`, `.YML` | YAML 1.2 format |

## Security

- **Path Normalization**: All paths are resolved to absolute paths to prevent traversal attacks
- **File Size Limits**: Default 10MB limit prevents memory exhaustion
- **UTF-8 Encoding**: All files must be valid UTF-8 encoded text

## TypeScript Support

Full TypeScript support with OpenAPI 3.0 types:

```typescript
import type { OpenAPIObject, LoaderResult } from '@openapi-to-mcp/parser';

const result: LoaderResult = await loadOpenAPIDocument('./api.json');
const document: OpenAPIObject = result.document;
```

## License

MIT

## Related Packages

- `@openapi-to-mcp/cli` - Command-line interface
- `@openapi-to-mcp/generator` - MCP server code generation
- `@openapi-to-mcp/templates` - Server templates
