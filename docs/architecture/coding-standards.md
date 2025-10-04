# Coding Standards

**OpenAPI-to-MCP Generator Project**
**Version:** 1.0
**Last Updated:** 2025-01-04

---

## Purpose

This document defines **mandatory coding standards** for all developers (human and AI) working on the OpenAPI-to-MCP Generator project. These standards ensure code quality, maintainability, type safety, and consistency across the monorepo.

⚠️ **CRITICAL**: All code must comply with these standards before merging to main branch.

---

## Table of Contents

1. [Language & Runtime Standards](#language--runtime-standards)
2. [TypeScript Configuration](#typescript-configuration)
3. [Module System & Imports](#module-system--imports)
4. [Code Style & Formatting](#code-style--formatting)
5. [Naming Conventions](#naming-conventions)
6. [Error Handling](#error-handling)
7. [Async Patterns](#async-patterns)
8. [Type Safety Rules](#type-safety-rules)
9. [File Operations](#file-operations)
10. [Security Requirements](#security-requirements)
11. [Testing Standards](#testing-standards)
12. [Documentation Requirements](#documentation-requirements)
13. [Code Review Checklist](#code-review-checklist)

---

## Language & Runtime Standards

### Required Versions

```json
{
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.15.1"
  }
}
```

**Language:** TypeScript 5.3.3 (strict mode)
**Runtime:** Node.js 20.11.0 LTS (minimum 18.0.0)
**Package Manager:** pnpm 8.15.1

**Rationale:**
- Node.js 18+ required for MCP SDK compatibility
- TypeScript 5.3.3 provides latest type system features
- pnpm workspaces for monorepo management

### Module System

**MANDATORY:** ESM (ECMAScript Modules) only

```typescript
// ✅ CORRECT - ESM imports
import { readFile } from 'node:fs/promises';
import type { OpenAPIObject } from 'openapi-types';

// ❌ INCORRECT - CommonJS (forbidden)
const fs = require('fs');
```

**package.json requirement:**
```json
{
  "type": "module"
}
```

---

## TypeScript Configuration

### Strict Mode (Non-Negotiable)

All packages must use strict TypeScript configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "lib": ["ES2022"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### Critical Compiler Flags

| Flag | Purpose | Why Mandatory |
|------|---------|---------------|
| `strict: true` | Enables all strict type-checking | Prevents runtime type errors |
| `noUncheckedIndexedAccess: true` | Array/object access returns `T \| undefined` | Prevents null reference errors |
| `noUnusedLocals: true` | Flag unused variables | Code cleanliness |
| `module: "NodeNext"` | Modern Node.js ESM support | Correct import resolution |

---

## Module System & Imports

### Import Order (Enforced by ESLint)

```typescript
// 1. Node.js built-in modules (with 'node:' prefix)
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// 2. External dependencies
import { Command } from 'commander';
import SwaggerParser from '@apidevtools/swagger-parser';

// 3. Internal packages (monorepo)
import { parseOpenAPI } from '@openapi-to-mcp/parser';
import type { ParsedOpenAPI } from '@openapi-to-mcp/parser';

// 4. Relative imports (same package)
import { formatError } from './utils/errors.js';
import type { GenerateOptions } from './types.js';
```

### Type-Only Imports

**MANDATORY:** Use `import type` for types when possible

```typescript
// ✅ CORRECT
import type { OpenAPIObject } from 'openapi-types';
import { parseOpenAPI } from '@openapi-to-mcp/parser';

// ❌ INCORRECT (mixing types and values)
import { OpenAPIObject, parseOpenAPI } from '@openapi-to-mcp/parser';
```

**Rationale:** Improves tree-shaking and clarifies intent

### File Extensions in Imports

**MANDATORY:** Include `.js` extension in relative imports (TypeScript ESM requirement)

```typescript
// ✅ CORRECT
import { helper } from './utils.js';

// ❌ INCORRECT
import { helper } from './utils';
```

---

## Code Style & Formatting

### Automated Formatting

**Tools:** ESLint 8.56.0 + Prettier 3.2.4

**Configuration:** `.prettierrc.json`
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

**Pre-commit Hook:** All code must pass `prettier --check` before commit

### ESLint Configuration

**Extends:**
- `@typescript-eslint/recommended`
- `prettier` (disables conflicting rules)

**Critical Rules:**
```javascript
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "no-console": "error" // Use debug library instead
  }
}
```

---

## Naming Conventions

### Files and Directories

```
✅ kebab-case for files:     parse-openapi.ts, http-client.ts
✅ kebab-case for folders:   http-client/, type-mapper/
❌ camelCase:                parseOpenapi.ts
❌ PascalCase:               ParseOpenAPI.ts
```

### Variables and Functions

```typescript
// ✅ CORRECT - camelCase
const apiVersion = '3.0.0';
function parseSchema(schema: unknown): ParsedSchema { }

// ❌ INCORRECT - snake_case
const api_version = '3.0.0';
```

### Types, Interfaces, Classes

```typescript
// ✅ CORRECT - PascalCase
interface ParsedOpenAPI { }
type GenerateOptions = { };
class OpenAPIParser { }

// ❌ INCORRECT - camelCase
interface parsedOpenAPI { }
```

### Constants

```typescript
// ✅ CORRECT - SCREAMING_SNAKE_CASE for true constants
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT_MS = 10000;

// ✅ CORRECT - camelCase for config objects
const defaultOptions = { verbose: false };
```

### Boolean Variables

```typescript
// ✅ CORRECT - is/has/should prefix
const isValid = true;
const hasErrors = false;
const shouldRetry = true;

// ❌ INCORRECT - unclear
const valid = true;
const errors = false;
```

---

## Error Handling

### Error Hierarchy

**MANDATORY:** Use typed error classes

```typescript
// Base error class
export class BaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
export class ParserError extends BaseError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'PARSER_ERROR', context);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', context);
  }
}
```

### Error Handling Patterns

#### Async Functions (Mandatory Try-Catch)

```typescript
// ✅ CORRECT
async function parseFile(path: string): Promise<ParsedOpenAPI> {
  try {
    const content = await readFile(path, 'utf-8');
    return parseOpenAPI(content);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ParserError('Invalid JSON', { path, originalError: error });
    }
    throw error;
  }
}

// ❌ INCORRECT - no error handling
async function parseFile(path: string): Promise<ParsedOpenAPI> {
  const content = await readFile(path, 'utf-8');
  return parseOpenAPI(content);
}
```

#### Callbacks (Node.js Style)

```typescript
// ✅ CORRECT - error-first callback
function readConfig(callback: (err: Error | null, config?: Config) => void): void {
  fs.readFile('config.json', (err, data) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null, JSON.parse(data.toString()));
  });
}
```

### Never Suppress Errors Silently

```typescript
// ❌ FORBIDDEN - silent error suppression
try {
  doSomething();
} catch (error) {
  // Empty catch block
}

// ✅ CORRECT - log or rethrow
try {
  doSomething();
} catch (error) {
  debug('Operation failed: %o', error);
  throw new InternalError('Operation failed', { originalError: error });
}
```

---

## Async Patterns

### Prefer async/await over Promises

```typescript
// ✅ CORRECT
async function loadAPI(path: string): Promise<OpenAPIObject> {
  const content = await readFile(path, 'utf-8');
  const parsed = await SwaggerParser.validate(content);
  return parsed;
}

// ❌ INCORRECT - promise chaining
function loadAPI(path: string): Promise<OpenAPIObject> {
  return readFile(path, 'utf-8')
    .then((content) => SwaggerParser.validate(content));
}
```

### Parallel Operations

```typescript
// ✅ CORRECT - parallel execution
const [schemas, operations] = await Promise.all([
  extractSchemas(openapi),
  extractOperations(openapi),
]);

// ❌ INCORRECT - sequential (slower)
const schemas = await extractSchemas(openapi);
const operations = await extractOperations(openapi);
```

### Error Handling in Promise.all

```typescript
// ✅ CORRECT - handle failures
const results = await Promise.allSettled([
  fetchSchema(url1),
  fetchSchema(url2),
]);

for (const result of results) {
  if (result.status === 'rejected') {
    debug('Failed to fetch schema: %o', result.reason);
  }
}
```

---

## Type Safety Rules

### Rule 1: Never use `any`

```typescript
// ❌ FORBIDDEN
function process(data: any): void { }

// ✅ CORRECT
function process(data: unknown): void {
  if (typeof data === 'string') {
    console.log(data.toUpperCase());
  }
}
```

### Rule 2: Avoid Non-Null Assertions

```typescript
// ❌ FORBIDDEN
const value = map.get(key)!;

// ✅ CORRECT
const value = map.get(key);
if (!value) {
  throw new ValidationError('Missing required key', { key });
}
```

### Rule 3: Use Type Guards

```typescript
// ✅ CORRECT
function isOpenAPIObject(value: unknown): value is OpenAPIObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    'openapi' in value &&
    typeof value.openapi === 'string'
  );
}

// Usage
if (isOpenAPIObject(data)) {
  console.log(data.openapi); // TypeScript knows this is safe
}
```

### Rule 4: Exhaustive Switch Statements

```typescript
type Status = 'pending' | 'success' | 'error';

function handleStatus(status: Status): string {
  switch (status) {
    case 'pending':
      return 'Processing...';
    case 'success':
      return 'Done!';
    case 'error':
      return 'Failed';
    default:
      // TypeScript enforces exhaustiveness
      const _exhaustive: never = status;
      throw new Error(`Unhandled status: ${_exhaustive}`);
  }
}
```

---

## File Operations

### Use Absolute Paths

```typescript
// ✅ CORRECT
import { resolve } from 'node:path';

const absolutePath = resolve(process.cwd(), relativePath);
const content = await readFile(absolutePath, 'utf-8');

// ❌ INCORRECT - relative path (security risk)
const content = await readFile(relativePath, 'utf-8');
```

### Atomic File Writes

```typescript
// ✅ CORRECT - atomic write
import { writeFile, rename } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

async function writeFileSafe(path: string, content: string): Promise<void> {
  const tempPath = join(tmpdir(), `temp-${Date.now()}.tmp`);
  try {
    await writeFile(tempPath, content, 'utf-8');
    await rename(tempPath, path);
  } catch (error) {
    await unlink(tempPath).catch(() => {}); // Cleanup temp file
    throw error;
  }
}
```

---

## Security Requirements

### Rule 1: No Hardcoded Secrets

```typescript
// ❌ FORBIDDEN
const API_KEY = 'sk-1234567890';

// ✅ CORRECT
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error('API_KEY environment variable is required');
}
```

### Rule 2: Input Validation

```typescript
// ✅ CORRECT - validate with Zod
import { z } from 'zod';

const GenerateOptionsSchema = z.object({
  output: z.string().min(1),
  verbose: z.boolean().optional(),
  authType: z.enum(['apiKey', 'bearer', 'basic']).optional(),
});

function validateOptions(raw: unknown): GenerateOptions {
  return GenerateOptionsSchema.parse(raw);
}
```

### Rule 3: Sanitize Dynamic Code

```typescript
// ✅ CORRECT - sanitize operationId for code generation
function sanitizeOperationId(id: string): string {
  return id
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/^(\d)/, '_$1'); // Ensure doesn't start with number
}
```

### Rule 4: HTTPS Only for External $refs

```typescript
// ✅ CORRECT
function isSecureUrl(url: string): boolean {
  return url.startsWith('https://');
}

async function fetchExternalRef(url: string): Promise<unknown> {
  if (!isSecureUrl(url)) {
    throw new ValidationError('External $refs must use HTTPS', { url });
  }
  const response = await fetch(url);
  return response.json();
}
```

---

## Testing Standards

### Coverage Requirements

- **Unit Tests:** ≥80% line coverage
- **Integration Tests:** ≥70% workflow coverage
- **E2E Tests:** 100% CLI commands

### Test Structure (AAA Pattern)

```typescript
import { describe, it, expect } from 'vitest';

describe('parseOpenAPI', () => {
  it('should parse valid OpenAPI 3.0 document', async () => {
    // Arrange
    const input = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {},
    };

    // Act
    const result = await parseOpenAPI(input);

    // Assert
    expect(result).toMatchObject({
      version: '3.0.0',
      info: expect.objectContaining({ title: 'Test API' }),
    });
  });
});
```

### Mocking External Dependencies

```typescript
// ✅ CORRECT - mock file system
import { vi } from 'vitest';
import { vol } from 'memfs';

vi.mock('node:fs/promises');

it('should read OpenAPI file', async () => {
  vol.fromJSON({
    '/test/openapi.json': JSON.stringify({ openapi: '3.0.0' }),
  });

  const result = await loadOpenAPIFile('/test/openapi.json');
  expect(result.openapi).toBe('3.0.0');
});
```

---

## Documentation Requirements

### JSDoc for Public APIs

```typescript
/**
 * Parses and validates an OpenAPI 3.0 document.
 *
 * @param input - OpenAPI document as object or JSON string
 * @param options - Parser configuration options
 * @returns Normalized OpenAPI object with resolved $refs
 * @throws {ParserError} If document is invalid or $refs cannot be resolved
 *
 * @example
 * ```typescript
 * const parsed = await parseOpenAPI({ openapi: '3.0.0', ... });
 * console.log(parsed.version); // '3.0.0'
 * ```
 */
export async function parseOpenAPI(
  input: string | unknown,
  options?: ParserOptions
): Promise<ParsedOpenAPI> {
  // Implementation
}
```

### Inline Comments

```typescript
// ✅ CORRECT - explain WHY, not WHAT
// Use Set for O(1) lookup performance with large tag lists
const seenTags = new Set<string>();

// ❌ INCORRECT - obvious comment
// Create a new Set
const seenTags = new Set<string>();
```

---

## Code Review Checklist

Before submitting code for review, ensure:

- [ ] All TypeScript compiles without errors (`tsc --noEmit`)
- [ ] ESLint passes with no warnings (`pnpm lint`)
- [ ] Prettier formatting applied (`pnpm format`)
- [ ] All tests pass (`pnpm test`)
- [ ] Test coverage ≥80% for new code
- [ ] No `console.log` statements (use `debug` library)
- [ ] No hardcoded secrets or credentials
- [ ] All async functions have try-catch blocks
- [ ] No use of `any` type (use `unknown` instead)
- [ ] No non-null assertions (`!`) without justification
- [ ] All file operations use absolute paths
- [ ] JSDoc comments for all public APIs
- [ ] Error messages include context for debugging

---

## Enforcement

**Automated Checks:**
- Pre-commit hook: ESLint + Prettier
- CI Pipeline: TypeScript compilation + tests + linting
- Pull Request: Coverage reports + manual review

**Violations:**
- Breaking changes to main branch: **Revert immediately**
- Security violations: **Block merge + security review**
- Style violations: **Request changes**

---

**Document Version:** 1.0
**Status:** ✅ Active - All developers must comply
**Next Review:** After Epic 2 completion

---

*Generated by Winston (Architect Agent) for the OpenAPI-to-MCP Generator project.*
