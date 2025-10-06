# Code Generation Architecture

**OpenAPI-to-MCP Generator Project**
**Version:** 1.0
**Last Updated:** 2025-01-05

---

## Purpose

This document describes the **code generation architecture** for the OpenAPI-to-MCP Generator project. It details the template engine integration, rendering pipeline, data transformation, and code formatting system that produces TypeScript MCP servers from OpenAPI specifications.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Template Engine Integration](#template-engine-integration)
3. [Code Generation Pipeline](#code-generation-pipeline)
4. [Data Transformation](#data-transformation)
5. [Template Helper Functions](#template-helper-functions)
6. [Code Formatting](#code-formatting)
7. [Template Development Guide](#template-development-guide)
8. [Error Handling](#error-handling)
9. [Performance Optimization](#performance-optimization)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     MCP Generator                            │
│  ┌───────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │ Parse OpenAPI │→ │ Transform Data │→ │ Generate Code  │ │
│  │  (Parser Pkg) │  │  (Data Model)  │  │  (Templates)   │ │
│  └───────────────┘  └────────────────┘  └────────────────┘ │
│         ↓                   ↓                     ↓          │
│  ┌───────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │  ParseResult  │  │ TemplateData   │  │ TypeScript     │ │
│  │  Validation   │  │ Transformation │  │ Code Output    │ │
│  └───────────────┘  └────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Package Structure

```
packages/generator/
├── src/
│   ├── generator.ts           # Core CodeGenerator class
│   ├── mcp-generator.ts       # Main orchestration pipeline
│   ├── helpers.ts             # Handlebars helper functions
│   ├── interface-generator.ts # TypeScript interface generation
│   ├── tool-generator.ts      # MCP tool generation
│   ├── scaffolder.ts          # Project scaffolding
│   ├── types.ts               # Type definitions
│   ├── errors.ts              # Error classes
│   └── fs-utils.ts            # File system utilities
├── __tests__/                 # Test suite
└── package.json
```

---

## Template Engine Integration

### Selected Engine: Handlebars 4.7.8

**Rationale:**
- ✅ Logic-less templates (maintainability)
- ✅ Strong TypeScript support
- ✅ Excellent performance (precompiled templates)
- ✅ Rich helper function system
- ✅ Partial templates for code reuse
- ✅ Active community support (10M+ weekly downloads)

### CodeGenerator Class

```typescript
import Handlebars from 'handlebars';
import { registerHelpers } from './helpers.js';

export class CodeGenerator {
  private templateEngine: typeof Handlebars;
  private templateCache: Map<string, HandlebarsTemplateDelegate>;
  private prettierConfig: PrettierConfig;

  constructor(options: Partial<GeneratorOptions> = {}) {
    // Create isolated Handlebars instance
    this.templateEngine = Handlebars.create();

    // Register all helper functions
    registerHelpers(this.templateEngine);

    // Initialize template cache
    this.templateCache = new Map();

    // Configure Prettier
    this.prettierConfig = {
      ...DEFAULT_PRETTIER_CONFIG,
      ...options.prettierConfig,
    };
  }

  async generateFromTemplate(
    templatePath: string,
    data: TemplateDataModel | Record<string, unknown>,
    outputPath?: string
  ): Promise<string> {
    // Validate → Load → Compile → Render → Format
    await this.validateTemplateExists(templatePath);
    const template = await this.loadTemplate(templatePath);
    this.validateTemplateData(data);
    const rendered = this.renderTemplate(template, data, templatePath);
    const formatted = await this.formatCode(rendered);
    return formatted;
  }
}
```

### Template Caching Strategy

**Problem:** Compiling templates is expensive (5-20ms per template)

**Solution:** In-memory template cache with precompiled functions

**Benefits:**
- ⚡ First render: ~15ms (compile + render)
- ⚡ Cached renders: ~1-2ms (render only)
- ⚡ 10x performance improvement for repeated generations

---

## Code Generation Pipeline

### Five-Stage Pipeline

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ 1. Parse     │ → │ 2. Transform │ → │ 3. Scaffold  │
│   OpenAPI    │    │    Data      │    │   Project    │
└──────────────┘    └──────────────┘    └──────────────┘
                             ↓
┌──────────────┐    ┌──────────────┐
│ 5. Format    │ ← │ 4. Render    │
│    Code      │    │   Templates  │
└──────────────┘    └──────────────┘
```

### Stage Details

#### Stage 1: Parse OpenAPI (Epic 2)
- Input: OpenAPI 3.0 specification file
- Output: `ParseResult` with normalized data
- Tools: `@openapi-to-mcp/parser` package
- Duration: ~50-200ms (depending on spec size)

#### Stage 2: Transform Data
- Input: `ParseResult` from parser
- Output: `TemplateDataModel` (template-friendly format)
- Transformations:
  - Map schemas to TypeScript types
  - Extract operation metadata
  - Process security schemes
  - Compute derived properties
- Duration: ~10-50ms

#### Stage 3: Scaffold Project
- Input: API metadata
- Output: Directory structure + static files
- Files created:
  - `package.json` (dependencies, scripts)
  - `tsconfig.json` (TypeScript configuration)
  - `.gitignore`, `.env.example`
  - `README.md` (usage instructions)
- Duration: ~20-100ms

#### Stage 4: Render Templates
- Input: `TemplateDataModel` + Handlebars templates
- Output: Generated TypeScript code
- Templates rendered:
  - `src/index.ts` (main MCP server)
  - `src/types.ts` (TypeScript interfaces)
  - `src/tools.ts` (MCP tool definitions)
  - `src/http-client.ts` (API client)
- Duration: ~50-200ms (cached: ~10-30ms)

#### Stage 5: Format Code
- Input: Raw rendered code
- Output: Formatted TypeScript code
- Tool: Prettier 3.2.4
- Configuration:
  - Semi: true
  - Single quotes: true
  - Trailing commas: es5
  - Print width: 100 characters
  - Tab width: 2 spaces
- Duration: ~30-100ms per file

---

## Data Transformation

### ParseResult → TemplateDataModel

The `mcp-generator.ts` orchestrates data transformation from parser output to template-friendly format.

#### Schema Transformation

```typescript
// Parser output (NormalizedSchema)
const parseResult: ParseResult = {
  schemas: Map<string, NormalizedSchema>,
  operations: NormalizedOperation[],
  // ...
};

// Template data (TemplateDataModel)
const templateData: TemplateDataModel = {
  schemas: SchemaTemplateData[],
  operations: OperationTemplateData[],
  // ...
};
```

#### Computed Properties

The transformation adds computed properties for template convenience:

```typescript
interface SchemaTemplateData {
  name: string;           // Original name
  pascalName: string;     // PascalCase (for interface names)
  camelName: string;      // camelCase (for variable names)
  hasRequired: boolean;   // Does schema have required fields?
  // ...
}

interface OperationTemplateData {
  operationId: string;
  camelName: string;      // camelCase (for function names)
  pascalName: string;     // PascalCase (for type names)
  hasParameters: boolean;
  hasRequestBody: boolean;
  hasPathParams: boolean;
  hasQueryParams: boolean;
  hasHeaderParams: boolean;
  // ...
}
```

---

## Template Helper Functions

### Case Conversion Helpers

All registered in `helpers.ts` and available in all templates:

#### `{{camelCase string}}`
```handlebars
{{camelCase "user-name"}}     → userName
{{camelCase "user_name"}}     → userName
{{camelCase "UserName"}}      → userName
```

#### `{{PascalCase string}}`
```handlebars
{{PascalCase "user-name"}}    → UserName
{{PascalCase "api_response"}} → ApiResponse
```

#### `{{kebabCase string}}`
```handlebars
{{kebabCase "userName"}}      → user-name
{{kebabCase "UserName"}}      → user-name
```

#### `{{snakeCase string}}`
```handlebars
{{snakeCase "userName"}}      → user_name
{{snakeCase "UserName"}}      → user_name
```

#### `{{screamingSnakeCase string}}`
```handlebars
{{screamingSnakeCase "userName"}} → USER_NAME
```

### Type Conversion Helper

#### `{{toTsType openApiType format}}`

Converts OpenAPI types to TypeScript types:

```handlebars
{{toTsType "string"}}              → string
{{toTsType "number"}}              → number
{{toTsType "integer"}}             → number
{{toTsType "boolean"}}             → boolean
{{toTsType "array"}}               → Array
{{toTsType "object"}}              → object
{{toTsType "string" "date-time"}}  → string
{{toTsType "string" "uuid"}}       → string
{{toTsType "string" "binary"}}     → Buffer
```

### String Utilities

#### `{{capitalize string}}`
```handlebars
{{capitalize "hello"}}        → Hello
```

#### `{{pluralize string}}`
```handlebars
{{pluralize "user"}}          → users
{{pluralize "query"}}         → queries
{{pluralize "status"}}        → statuses
```

#### `{{escapeComment string}}`
```handlebars
{{escapeComment "*/comment"}} → *\/comment
```

### Code Formatting Helpers

#### `{{formatComment text indent}}`
```handlebars
{{formatComment "API endpoint description" 0}}
```
Output:
```typescript
/** API endpoint description */
```

Multi-line:
```handlebars
{{formatComment "Line 1\nLine 2\nLine 3" 2}}
```
Output:
```typescript
  /**
   * Line 1
   * Line 2
   * Line 3
   */
```

### Comparison Helpers

```handlebars
{{#if (eq type "string")}}...{{/if}}
{{#if (ne status "error")}}...{{/if}}
{{#if (gt count 0)}}...{{/if}}
{{#if (gte value 10)}}...{{/if}}
{{#if (lt index length)}}...{{/if}}
{{#if (lte size maxSize)}}...{{/if}}
```

### Logical Helpers

```handlebars
{{#if (and isRequired isNullable)}}...{{/if}}
{{#if (or hasQuery hasPath)}}...{{/if}}
{{#if (not isEmpty)}}...{{/if}}
```

---

## Code Formatting

### Prettier Integration

All generated code is automatically formatted with Prettier to ensure consistency.

### Configuration

```typescript
const DEFAULT_PRETTIER_CONFIG: PrettierConfig = {
  parser: 'typescript',
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  printWidth: 100,
  tabWidth: 2,
  arrowParens: 'always',
};
```

### Formatting Pipeline

```typescript
private async formatCode(code: string): Promise<string> {
  try {
    return await prettierFormat(code, this.prettierConfig);
  } catch (error) {
    // Fallback: return unformatted code
    // (can happen with partial code or non-TypeScript content)
    return code;
  }
}
```

**Note:** Formatting failures are gracefully handled to prevent generation errors from non-TypeScript templates (e.g., plain text README.md).

---

## Template Development Guide

### Creating New Templates

#### Step 1: Create Template File

Location: `packages/templates/mcp-server/`

Naming: Use `.hbs` extension (e.g., `index.ts.hbs`)

#### Step 2: Define Data Requirements

Document expected data structure in template comments:

```handlebars
{{!
  Template: MCP Server Index
  Data Required:
    - apiName: string
    - apiVersion: string
    - operations: OperationTemplateData[]
    - hasAuthentication: boolean
}}
```

#### Step 3: Write Template Logic

```handlebars
/**
 * {{apiName}} MCP Server
 * Version: {{apiVersion}}
 * Generated: {{generatedAt}}
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { tools, executeTool } from './tools.js';
{{#if hasAuthentication}}
import { setupAuth } from './auth.js';
{{/if}}

const server = new Server({
  name: '{{kebabCase apiName}}',
  version: '{{apiVersion}}',
}, {
  capabilities: {
    tools: {},
  },
});

// Register tools
{{#each operations}}
server.tool('{{camelName}}', {{camelName}}Tool);
{{/each}}

export { server };
```

#### Step 4: Test Template

Create test case in `__tests__/generator.test.ts`:

```typescript
it('should render new template correctly', async () => {
  const templatePath = resolve(__dirname, '../../../templates/mcp-server/new-template.hbs');

  const data = {
    apiName: 'Test API',
    apiVersion: '1.0.0',
    operations: [/* ... */],
    hasAuthentication: true,
  };

  const result = await generator.generateFromTemplate(templatePath, data);

  expect(result).toContain('Test API MCP Server');
  expect(result).toContain("import { setupAuth } from './auth.js';");
});
```

---

## Error Handling

### Error Classes

All generation errors extend `GenerationError` base class:

```typescript
export class TemplateNotFoundError extends GenerationError {
  constructor(templatePath: string) {
    super(`Template not found: ${templatePath}`, 'TEMPLATE_NOT_FOUND', { templatePath });
  }
}

export class TemplateRenderError extends GenerationError {
  constructor(message: string, templatePath: string, lineNumber?: number, context?: Record<string, unknown>) {
    super(message, 'TEMPLATE_RENDER_ERROR', {
      templatePath,
      lineNumber,
      ...context,
    });
  }
}

export class DataValidationError extends GenerationError {
  constructor(message: string, missingFields: string[], context?: Record<string, unknown>) {
    super(message, 'DATA_VALIDATION_ERROR', {
      missingFields,
      ...context,
    });
  }
}
```

### Error Context

All errors include rich context for debugging:

```typescript
try {
  await generator.generateFromTemplate(templatePath, data);
} catch (error) {
  if (error instanceof TemplateRenderError) {
    console.error('Template:', error.context?.templatePath);
    console.error('Line:', error.context?.lineNumber);
    console.error('Original:', error.context?.originalError);
  }
}
```

---

## Performance Optimization

### Template Compilation Caching

**Problem:** Handlebars compilation is expensive

**Solution:** Cache compiled templates in memory

```typescript
private async loadTemplate(templatePath: string): Promise<HandlebarsTemplateDelegate> {
  // Check cache
  const cached = this.templateCache.get(templatePath);
  if (cached) {
    return cached; // ⚡ Fast path: ~0.1ms
  }

  // Compile and cache
  const templateContent = await readFile(templatePath, 'utf-8');
  const compiled = this.templateEngine.compile(templateContent);
  this.templateCache.set(templatePath, compiled);

  return compiled; // Slow path: ~15ms
}
```

**Performance Impact:**
- First render: ~15ms (compile + render)
- Subsequent renders: ~1-2ms (90% faster)

### Parallel Template Rendering

For multiple independent templates:

```typescript
const [types, tools, client] = await Promise.all([
  generator.generateFromTemplate('types.ts.hbs', data),
  generator.generateFromTemplate('tools.ts.hbs', data),
  generator.generateFromTemplate('http-client.ts.hbs', data),
]);
```

### Benchmarks

Performance targets (tested with 300+ operation API):

| Operation | Target | Actual |
|-----------|--------|--------|
| Template compilation | <20ms | ~15ms |
| Template rendering (cached) | <5ms | ~1-2ms |
| Code formatting | <100ms | ~30-80ms |
| Full generation pipeline | <30s | ~3-5s |

---

## Troubleshooting

### Common Issues

#### Issue: "Template not found" error

**Cause:** Invalid template path

**Solution:** Verify template file exists and path is absolute

```typescript
const templatePath = resolve(__dirname, '../templates/my-template.hbs');
await generator.generateFromTemplate(templatePath, data);
```

#### Issue: "Missing variable" error during rendering

**Cause:** Template references undefined variable

**Solution:** Check data includes all required fields

```typescript
// Template: {{apiName}} {{apiVersion}}
// Data must include:
const data = {
  apiName: 'My API',
  apiVersion: '1.0.0',
};
```

#### Issue: Prettier formatting fails

**Cause:** Generated code has syntax errors

**Solution:** Check template syntax and data types

```handlebars
{{!-- BAD: Missing quotes --}}
const value = {{name}};

{{!-- GOOD: Proper string literal --}}
const value = '{{name}}';
```

#### Issue: Template cache not clearing during development

**Cause:** Cached templates don't reflect file changes

**Solution:** Clear cache manually

```typescript
generator.clearCache(); // Clear all cached templates
```

---

## Related Documents

- **[Coding Standards](./architecture/coding-standards.md)** - TypeScript coding conventions
- **[Tech Stack](./architecture/tech-stack.md)** - Technology decisions
- **[Source Tree](./architecture/source-tree.md)** - Repository structure

---

**Document Status:** ✅ Active - Template development reference
**Maintenance:** Update when adding new helpers or templates
**Review Frequency:** After each Epic completion

---

*Generated for Story 3.1: Code Generation Architecture and Template Engine Setup*
