# Testing Strategy

**Project:** OpenAPI-to-MCP Generator
**Version:** 0.1.0 (MVP)
**Last Updated:** 2025-01-02

---

## Table of Contents

1. [Testing Overview](#1-testing-overview)
2. [Test Environment Setup](#2-test-environment-setup)
3. [Unit Testing](#3-unit-testing)
4. [Integration Testing](#4-integration-testing)
5. [End-to-End Testing](#5-end-to-end-testing)
6. [Test Fixtures](#6-test-fixtures)
7. [Coverage Requirements](#7-coverage-requirements)
8. [CI/CD Integration](#8-cicd-integration)

---

## 1. Testing Overview

### 1.1 Testing Philosophy

**Principles**:
- **Comprehensive Coverage**: Test all critical paths and edge cases
- **Fast Feedback**: Unit tests run in < 1s, full suite in < 10s
- **Isolation**: Each test is independent and repeatable
- **Real-World Validation**: Test with actual OpenAPI specs (Ozon, GitHub, Stripe)
- **Regression Prevention**: Add test for every bug fix

### 1.2 Testing Pyramid

```
        ╱╲
       ╱  ╲
      ╱ E2E ╲           10%  - Complete workflow tests
     ╱────────╲
    ╱          ╲
   ╱ Integration╲       30%  - Component integration tests
  ╱──────────────╲
 ╱                ╲
╱   Unit Tests     ╲    60%  - Function-level tests
╲__________________╱
```

### 1.3 Test Framework

**Technology Stack**:
- **Test Runner**: Vitest
- **Assertions**: Vitest built-in
- **Mocking**: Vitest vi
- **Coverage**: Istanbul (via Vitest)
- **Fixtures**: JSON/YAML test files

---

## 2. Test Environment Setup

### 2.1 Installation

```bash
# Install test dependencies
npm install --save-dev vitest @vitest/coverage-v8

# Install type definitions
npm install --save-dev @types/node
```

### 2.2 Configuration

**vitest.config.ts**:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    include: ['**/*.test.ts'],
    exclude: ['node_modules/', 'dist/'],
  },
});
```

### 2.3 NPM Scripts

**package.json**:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

---

## 3. Unit Testing

### 3.1 Parser Tests

**File**: `packages/parser/src/parser.test.ts`

#### Test: Parse Valid OpenAPI Spec

```typescript
import { describe, it, expect } from 'vitest';
import { OpenAPIParser } from './parser';

describe('OpenAPIParser', () => {
  it('should parse valid OpenAPI 3.0 spec', async () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths: {},
    };

    const parser = new OpenAPIParser(spec);
    const result = await parser.parse();

    expect(result.openapi).toBe('3.0.0');
    expect(result.info.title).toBe('Test API');
    expect(result.info.version).toBe('1.0.0');
  });

  it('should throw on unsupported version', async () => {
    const spec = {
      openapi: '2.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };

    const parser = new OpenAPIParser(spec);

    await expect(parser.parse()).rejects.toThrow('Unsupported OpenAPI version');
  });

  it('should validate required fields', async () => {
    const spec = {
      openapi: '3.0.0',
      // Missing info and paths
    };

    const parser = new OpenAPIParser(spec);

    await expect(parser.parse()).rejects.toThrow('Missing required field');
  });
});
```

#### Test: Info Object Parsing

```typescript
describe('OpenAPIParser - Info Object', () => {
  it('should parse complete info object', async () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Ozon Performance API',
        version: '2.0',
        description: 'API for advertising campaigns',
        contact: {
          name: 'Support',
          email: 'support@ozon.ru',
        },
        license: {
          name: 'Proprietary',
        },
      },
      paths: {},
    };

    const parser = new OpenAPIParser(spec);
    const result = await parser.parse();

    expect(result.info.title).toBe('Ozon Performance API');
    expect(result.info.version).toBe('2.0');
    expect(result.info.description).toBe('API for advertising campaigns');
    expect(result.info.contact?.name).toBe('Support');
    expect(result.info.contact?.email).toBe('support@ozon.ru');
    expect(result.info.license?.name).toBe('Proprietary');
  });

  it('should handle minimal info object', async () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Minimal API',
        version: '1.0.0',
      },
      paths: {},
    };

    const parser = new OpenAPIParser(spec);
    const result = await parser.parse();

    expect(result.info.title).toBe('Minimal API');
    expect(result.info.contact).toBeUndefined();
    expect(result.info.license).toBeUndefined();
  });
});
```

---

### 3.2 RefResolver Tests

**File**: `packages/parser/src/ref-resolver.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { RefResolver } from './ref-resolver';
import { CircularReferenceError, ReferenceNotFoundError } from './errors';

describe('RefResolver', () => {
  const spec = {
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
        Campaign: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            owner: { $ref: '#/components/schemas/User' },
          },
        },
      },
    },
  };

  let resolver: RefResolver;

  beforeEach(() => {
    resolver = new RefResolver(spec);
  });

  it('should resolve simple reference', () => {
    const result = resolver.resolve('#/components/schemas/User');

    expect(result.type).toBe('object');
    expect(result.properties.id.type).toBe('string');
  });

  it('should resolve nested reference', () => {
    const campaign = resolver.resolve('#/components/schemas/Campaign');

    expect(campaign.properties.owner).toBeDefined();
    // $ref should be resolved to actual User schema
    const owner = resolver.resolve(campaign.properties.owner.$ref);
    expect(owner.properties.name).toBeDefined();
  });

  it('should detect circular references', () => {
    const circularSpec = {
      components: {
        schemas: {
          A: {
            type: 'object',
            properties: {
              b: { $ref: '#/components/schemas/B' },
            },
          },
          B: {
            type: 'object',
            properties: {
              a: { $ref: '#/components/schemas/A' },
            },
          },
        },
      },
    };

    const circularResolver = new RefResolver(circularSpec);

    expect(() => {
      circularResolver.resolve('#/components/schemas/A');
      // This will try to resolve B, which references A again
    }).toThrow(CircularReferenceError);
  });

  it('should throw on invalid reference', () => {
    expect(() => {
      resolver.resolve('#/components/schemas/NonExistent');
    }).toThrow(ReferenceNotFoundError);
  });

  it('should reset visited references', () => {
    resolver.resolve('#/components/schemas/User');
    resolver.reset();

    // Should not throw (visited set cleared)
    const result = resolver.resolve('#/components/schemas/User');
    expect(result).toBeDefined();
  });
});
```

---

### 3.3 Type Generator Tests

**File**: `packages/generator/src/generators/type-generator.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { TypeGenerator } from './type-generator';

describe('TypeGenerator', () => {
  const generator = new TypeGenerator();

  it('should generate interface from schema', () => {
    const schemas = {
      Campaign: {
        type: 'object',
        required: ['id', 'title'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          budget: { type: 'number' },
        },
      },
    };

    const result = generator.generate(schemas);

    expect(result).toContain('export interface Campaign');
    expect(result).toContain('id: string;');
    expect(result).toContain('title: string;');
    expect(result).toContain('budget?: number;'); // Optional
  });

  it('should handle array types', () => {
    const schemas = {
      CampaignList: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    };

    const result = generator.generate(schemas);

    expect(result).toContain('items?: string[];');
  });

  it('should handle enum types', () => {
    const schemas = {
      Status: {
        type: 'object',
        properties: {
          state: {
            type: 'string',
            enum: ['ACTIVE', 'PAUSED', 'ARCHIVED'],
          },
        },
      },
    };

    const result = generator.generate(schemas);

    expect(result).toContain("state?: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';");
  });

  it('should handle nested objects', () => {
    const schemas = {
      Campaign: {
        type: 'object',
        properties: {
          metadata: {
            type: 'object',
            properties: {
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    };

    const result = generator.generate(schemas);

    expect(result).toContain('metadata?: {');
    expect(result).toContain('createdAt?: Date;');
  });
});
```

---

### 3.4 Tool Generator Tests

**File**: `packages/generator/src/generators/tool-generator.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { ToolGenerator } from './tool-generator';

describe('ToolGenerator', () => {
  const generator = new ToolGenerator();

  it('should generate tool from operation', () => {
    const paths = {
      '/api/client/campaign': {
        get: {
          operationId: 'ListCampaigns',
          summary: 'List all campaigns',
          tags: ['Campaign'],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer' },
            },
          ],
          responses: {
            '200': { description: 'Success' },
          },
        },
      },
    };

    const tools = generator.generate(paths, {});

    expect(tools).toHaveLength(2); // 1 real tool + listMethods meta-tool
    expect(tools[0].name).toBe('listCampaigns');
    expect(tools[0].description).toContain('List all campaigns');
    expect(tools[0].inputSchema.properties.page).toBeDefined();
    expect(tools[0].metadata.tags).toContain('Campaign');
  });

  it('should generate tool name from path if no operationId', () => {
    const paths = {
      '/users/{userId}/posts': {
        get: {
          // No operationId
          responses: { '200': { description: 'OK' } },
        },
      },
    };

    const tools = generator.generate(paths, {});

    // Should generate name like "getUsersPosts"
    expect(tools[0].name).toMatch(/get.*users.*posts/i);
  });

  it('should extract path parameters', () => {
    const paths = {
      '/campaigns/{campaignId}': {
        get: {
          operationId: 'GetCampaign',
          parameters: [],
          responses: { '200': { description: 'OK' } },
        },
      },
    };

    const tools = generator.generate(paths, {});

    expect(tools[0].inputSchema.properties.campaignId).toBeDefined();
    expect(tools[0].inputSchema.required).toContain('campaignId');
  });

  it('should mark deprecated operations', () => {
    const paths = {
      '/legacy/endpoint': {
        get: {
          operationId: 'LegacyMethod',
          deprecated: true,
          responses: { '200': { description: 'OK' } },
        },
      },
    };

    const tools = generator.generate(paths, {});

    expect(tools[0].description).toContain('⚠️ DEPRECATED');
    expect(tools[0].metadata.deprecated).toBe(true);
  });

  it('should generate listMethods meta-tool', () => {
    const paths = {
      '/endpoint1': { get: { responses: { '200': {} } } },
      '/endpoint2': { post: { responses: { '200': {} } } },
    };

    const tools = generator.generate(paths, {});

    const metaTool = tools.find(t => t.name === 'listMethods');
    expect(metaTool).toBeDefined();
    expect(metaTool?.metadata?.isMetaTool).toBe(true);
  });
});
```

---

## 4. Integration Testing

### 4.1 Parser + Generator Integration

**File**: `tests/integration/parser-generator.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { OpenAPIParser } from '@openapi-to-mcp/parser';
import { TypeGenerator, ToolGenerator } from '@openapi-to-mcp/generator';
import fs from 'fs';
import path from 'path';

describe('Parser + Generator Integration', () => {
  it('should parse Ozon spec and generate tools', async () => {
    // Load real Ozon OpenAPI spec
    const specPath = path.join(__dirname, '../fixtures/ozon-swagger.json');
    const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));

    // Parse
    const parser = new OpenAPIParser(spec);
    const parsed = await parser.parse();

    // Validate parsing
    expect(parsed.info.title).toBe('Ozon Performance API');
    expect(Object.keys(parsed.paths).length).toBe(39);
    expect(Object.keys(parsed.components.schemas).length).toBe(87);

    // Generate types
    const typeGen = new TypeGenerator();
    const types = typeGen.generate(parsed.components.schemas);

    expect(types).toContain('export interface');
    expect(types).toContain('Campaign'); // Known schema

    // Generate tools
    const toolGen = new ToolGenerator();
    const tools = toolGen.generate(parsed.paths, parsed.components);

    expect(tools.length).toBeGreaterThan(39); // 39 + meta-tools
    expect(tools.find(t => t.name === 'listCampaigns')).toBeDefined();
    expect(tools.find(t => t.name === 'listMethods')).toBeDefined();
  });

  it('should handle GitHub API spec', async () => {
    const specPath = path.join(__dirname, '../fixtures/github-api.json');
    const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));

    const parser = new OpenAPIParser(spec);
    const parsed = await parser.parse();

    const toolGen = new ToolGenerator();
    const tools = toolGen.generate(parsed.paths, parsed.components);

    // GitHub API should have many tools
    expect(tools.length).toBeGreaterThan(100);
  });
});
```

---

### 4.2 Full Generation Pipeline Test

**File**: `tests/integration/full-pipeline.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { generateMCPServer } from '@openapi-to-mcp/cli';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('Full Generation Pipeline', () => {
  const outputDir = path.join(__dirname, '../temp/generated');

  it('should generate complete MCP server', async () => {
    const specPath = path.join(__dirname, '../fixtures/ozon-swagger.json');

    // Generate
    await generateMCPServer({
      input: specPath,
      output: outputDir,
      name: 'test-api',
    });

    // Verify files exist
    expect(fs.existsSync(path.join(outputDir, 'package.json'))).toBe(true);
    expect(fs.existsSync(path.join(outputDir, 'src/server.ts'))).toBe(true);
    expect(fs.existsSync(path.join(outputDir, 'src/types.ts'))).toBe(true);
    expect(fs.existsSync(path.join(outputDir, 'src/client.ts'))).toBe(true);

    // Verify package.json
    const pkg = JSON.parse(
      fs.readFileSync(path.join(outputDir, 'package.json'), 'utf-8')
    );
    expect(pkg.name).toBe('test-api');

    // Build generated code
    const { stdout } = await execAsync('npm run build', { cwd: outputDir });
    expect(stdout).toContain('Successfully compiled');

    // Verify compiled output
    expect(fs.existsSync(path.join(outputDir, 'dist/server.js'))).toBe(true);
  });
});
```

---

## 5. End-to-End Testing

### 5.1 Real API Call Test

**File**: `tests/e2e/ozon-api.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { createServer } from '../../generated/ozon-performance/src/server';

describe('Ozon API E2E', () => {
  const server = createServer({
    bearerToken: process.env.OZON_API_TOKEN,
  });

  it('should list campaigns', async () => {
    const result = await server.listCampaigns({
      page: 1,
      pageSize: 5,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result.list)).toBe(true);
    expect(result.total).toBeGreaterThan(0);
  });

  it('should handle authentication error', async () => {
    const badServer = createServer({
      bearerToken: 'invalid-token',
    });

    await expect(
      badServer.listCampaigns({ page: 1 })
    ).rejects.toThrow('401');
  });

  it('should validate input schema', async () => {
    await expect(
      server.listCampaigns({ page: -1 }) // Invalid page number
    ).rejects.toThrow('Validation error');
  });
});
```

---

### 5.2 MCP Protocol Test

**File**: `tests/e2e/mcp-protocol.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { MCPClient } from '@modelcontextprotocol/sdk/client';
import { spawn } from 'child_process';

describe('MCP Protocol E2E', () => {
  it('should communicate via MCP protocol', async () => {
    // Spawn MCP server process
    const serverProcess = spawn('node', [
      './generated/ozon-performance/dist/server.js'
    ], {
      env: {
        ...process.env,
        OZON_API_TOKEN: process.env.OZON_API_TOKEN,
      },
    });

    // Create MCP client
    const client = new MCPClient({
      stdin: serverProcess.stdin,
      stdout: serverProcess.stdout,
    });

    // List tools
    const tools = await client.listTools();
    expect(tools.length).toBeGreaterThan(0);
    expect(tools.find(t => t.name === 'listCampaigns')).toBeDefined();

    // Call tool
    const result = await client.callTool('listCampaigns', {
      page: 1,
      pageSize: 5,
    });

    expect(result).toBeDefined();

    // Cleanup
    serverProcess.kill();
  });
});
```

---

## 6. Test Fixtures

### 6.1 Minimal OpenAPI Spec

**File**: `tests/fixtures/minimal-spec.json`

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Minimal API",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://api.example.com"
    }
  ],
  "paths": {
    "/hello": {
      "get": {
        "operationId": "sayHello",
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {}
  }
}
```

---

### 6.2 Complex OpenAPI Spec

**File**: `tests/fixtures/complex-spec.json`

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Complex API",
    "version": "2.0.0",
    "description": "Test spec with all features"
  },
  "servers": [
    {
      "url": "https://api.example.com"
    }
  ],
  "paths": {
    "/users/{userId}": {
      "get": {
        "operationId": "getUser",
        "tags": ["Users"],
        "parameters": [
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "schema": { "type": "string" }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/User"
                }
              }
            }
          }
        }
      }
    },
    "/users": {
      "post": {
        "operationId": "createUser",
        "tags": ["Users"],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateUserRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Created"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "required": ["id", "email"],
        "properties": {
          "id": { "type": "string" },
          "email": { "type": "string", "format": "email" },
          "name": { "type": "string" },
          "createdAt": { "type": "string", "format": "date-time" }
        }
      },
      "CreateUserRequest": {
        "type": "object",
        "required": ["email"],
        "properties": {
          "email": { "type": "string", "format": "email" },
          "name": { "type": "string" }
        }
      }
    }
  }
}
```

---

## 7. Coverage Requirements

### 7.1 Coverage Thresholds

**Minimum requirements**:
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 75%
- **Statements**: 80%

**Per-package targets**:

| Package | Lines | Functions | Branches | Statements |
|---------|-------|-----------|----------|------------|
| parser | 85% | 85% | 80% | 85% |
| generator | 80% | 80% | 75% | 80% |
| shared | 90% | 90% | 85% | 90% |
| cli | 70% | 70% | 65% | 70% |

### 7.2 Running Coverage

```bash
# Full coverage report
npm run test:coverage

# Per-package coverage
cd packages/parser
npm run test:coverage

# View HTML report
open coverage/index.html
```

### 7.3 Coverage Reports

**CI/CD Integration**:
```yaml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

---

## 8. CI/CD Integration

### 8.1 GitHub Actions Workflow

**File**: `.github/workflows/test.yml`

```yaml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm test

      - name: Run integration tests
        run: npm run test:integration

      - name: Generate coverage
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

      - name: Build packages
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          OZON_API_TOKEN: ${{ secrets.OZON_API_TOKEN }}
```

### 8.2 Pre-commit Hooks

**File**: `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run linter
npm run lint

# Run tests
npm test

# Check coverage
npm run test:coverage -- --reporter=text-summary
```

---

## Test Execution Guide

### Quick Reference

```bash
# Run all tests
npm test

# Watch mode (development)
npm run test:watch

# Coverage report
npm run test:coverage

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e

# UI mode (interactive)
npm run test:ui

# Specific test file
npm test parser.test.ts

# Specific test case
npm test -t "should parse valid OpenAPI spec"
```

---

## Next Steps

- **[Development Guide](./development.md)** - Implementation workflow
- **[API Reference](./api-reference.md)** - API documentation
- **[Examples](./examples.md)** - Usage examples
