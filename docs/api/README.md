**OpenAPI-to-MCP Generator API v0.1.0**

***

# OpenAPI-to-MCP Generator API Reference

Welcome to the API documentation for the OpenAPI-to-MCP Generator. This documentation is automatically generated from TypeScript source code and TSDoc comments.

## Overview

The OpenAPI-to-MCP Generator is a modular tool that converts OpenAPI 3.0 specifications into Model Context Protocol (MCP) servers. The codebase is organized into three main packages:

### 📦 Packages

#### [@openapi-to-mcp/parser](./modules/_openapi_to_mcp_parser.md)
OpenAPI parsing, validation, and metadata extraction.

**Key Features:**
- Load and parse OpenAPI 3.0 JSON/YAML files
- Validate specifications against OpenAPI schema
- Resolve `$ref` references (local and remote)
- Extract schemas, operations, security schemes, tags, and servers
- Normalize schemas for code generation

**Main Functions:**
- `loadOpenAPIDocument()` - Load and parse OpenAPI files
- `validateOpenAPISchema()` - Validate OpenAPI specifications
- `resolveReferences()` - Resolve $ref pointers
- `extractSchemas()` - Extract and normalize schemas
- `extractOperations()` - Extract API operations
- `extractSecuritySchemes()` - Extract security configurations

#### [@openapi-to-mcp/generator](./modules/_openapi_to_mcp_generator.md)
Code generation for MCP servers, TypeScript interfaces, and tooling.

**Key Features:**
- Scaffold complete MCP server projects
- Generate TypeScript interfaces from OpenAPI schemas
- Generate MCP tool definitions from operations
- Template-based code generation
- Security scheme integration

**Main Functions:**
- `scaffoldProject()` - Create project structure
- `generateInterfaces()` - Generate TypeScript types
- `generateToolDefinitions()` - Create MCP tools
- `analyzeSecurityRequirements()` - Analyze auth requirements
- `formatSecurityGuidance()` - Generate security documentation

#### [@openapi-to-mcp/cli](./modules/_openapi_to_mcp_cli.md)
Command-line interface for end-to-end generation workflow.

**Key Features:**
- Interactive CLI with Commander.js
- Atomic generation with automatic rollback
- Progress reporting with visual feedback
- Comprehensive error handling
- Pre/post validation

**Main Commands:**
- `generate` - Generate MCP server from OpenAPI spec

## Getting Started

### Installation

```bash
npm install @openapi-to-mcp/parser @openapi-to-mcp/generator
```

### Basic Usage

#### Using the CLI

```bash
npx @openapi-to-mcp/cli generate petstore.json --output ./my-server
```

#### Programmatic Usage

```typescript
import { loadOpenAPIDocument, extractSchemas } from '@openapi-to-mcp/parser';
import { generateInterfaces } from '@openapi-to-mcp/generator';

// Load and parse OpenAPI specification
const result = await loadOpenAPIDocument('./petstore.json');

// Extract schemas
const schemas = extractSchemas(result.document);

// Generate TypeScript interfaces
const interfaces = generateInterfaces(schemas, {
  includeComments: true,
  exportAll: true
});

console.log(interfaces.code);
```

## Common Workflows

### Complete Server Generation

```typescript
import { loadOpenAPIDocument, extractSchemas, extractOperations } from '@openapi-to-mcp/parser';
import { scaffoldProject, generateInterfaces, generateToolDefinitions } from '@openapi-to-mcp/generator';

// 1. Load and parse
const spec = await loadOpenAPIDocument('./api.json');

// 2. Extract metadata
const schemas = extractSchemas(spec.document);
const operations = extractOperations(spec.document);

// 3. Generate code
await scaffoldProject({
  outputDir: './output',
  apiName: spec.document.info.title,
  apiVersion: spec.document.info.version,
  operationCount: operations.length
});

const interfaces = generateInterfaces(schemas);
const tools = generateToolDefinitions(operations);
```

### Validation and Error Handling

```typescript
import { validateOpenAPISchema, resolveReferences } from '@openapi-to-mcp/parser';

// Validate specification
const validation = await validateOpenAPISchema(document);

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  return;
}

// Resolve references
const resolution = await resolveReferences(document, basePath);

if (resolution.errors.length > 0) {
  console.error('Resolution errors:', resolution.errors);
  return;
}
```

## Architecture

The generator follows a clean architecture with clear separation of concerns:

```
┌─────────────┐
│     CLI     │  User-facing commands
└──────┬──────┘
       │
┌──────▼──────┐
│  Generator  │  Code generation logic
└──────┬──────┘
       │
┌──────▼──────┐
│   Parser    │  OpenAPI parsing & validation
└─────────────┘
```

## TypeScript Support

All packages are written in TypeScript and include:
- Full type definitions
- JSDoc/TSDoc comments
- Exported types and interfaces
- Strict type checking

## Error Handling

The packages use custom error types for better error handling:

- `ValidationError` - Input validation failures
- `ParseError` - OpenAPI parsing errors
- `FileSystemError` - File I/O errors
- `UnsupportedFormatError` - Unsupported file formats

## Contributing

When contributing to the API:

1. **Add TSDoc comments** to all public functions
2. **Include examples** in your documentation
3. **Use proper tags**: `@param`, `@returns`, `@throws`, `@example`
4. **Run docs generation**: `pnpm docs`
5. **Verify no warnings**: Check TypeDoc output

## Additional Resources

- [Main Documentation](../../README.md)
- [Architecture Guide](../architecture/)
- [User Guide](../guides/)
- [GitHub Repository](https://github.com/your-org/openapi-to-mcp)

## License

MIT License - See [LICENSE](../../LICENSE) for details.
