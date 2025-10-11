# EPIC-005: Completion Plan - Fix MCP Generation Pipeline

**Created**: 2025-10-07
**Target Completion**: 2025-10-21 (2 weeks)
**Status**: In Progress (50% complete)

---

## Executive Summary

**Goal**: Replace hello-world (removed Story 6.3) template copying with actual OpenAPI-to-MCP code generation.

**Current State**:
- ✅ 2 stories complete (5.3, 5.4)
- ❌ 2 stories pending (5.1, 5.2)
- 🚨 Core functionality broken

**Target State**:
- ✅ Generate 39 MCP tools from Ozon Performance API
- ✅ Generate 220 TypeScript interfaces
- ✅ Generated code compiles and runs
- ✅ Comprehensive test coverage
- ✅ Working example server

---

## Table of Contents

- [Overall Timeline](#overall-timeline)
- [Story 5.1 Plan: CLI Refactor](#story-51-plan-cli-refactor)
- [Story 5.2 Plan: Integration Tests](#story-52-plan-integration-tests)
- [Story 5.4 Completion: Example & Validation](#story-54-completion-example--validation)
- [Dependencies & Risks](#dependencies--risks)
- [Success Criteria](#success-criteria)
- [Daily Checklist](#daily-checklist)

---

## Overall Timeline

### Week 1: Core Implementation

**Day 1-3: Story 5.1 (CLI Refactor)**
- Day 1: Replace template copying with generator functions
- Day 2: Integrate all generation steps
- Day 3: Test with Ozon API, fix issues

**Day 4-5: Story 5.2 (Integration Tests)**
- Day 4: Create generation pipeline tests
- Day 5: Add compilation and runtime tests

### Week 2: Completion & Polish

**Day 6: Story 5.4 Completion**
- Generate Ozon example server
- Create example documentation

**Day 7: External Validation**
- External tester runs quick-start guide
- Collect feedback, fix issues

**Day 8-9: Epic Review & Merge**
- Final testing across all stories
- Documentation review
- Merge to main

**Day 10: Buffer/Contingency**
- Address any issues
- Performance optimization

---

## Story 5.1 Plan: CLI Refactor

**Priority**: 🚨 P0 CRITICAL
**Effort**: 8 story points (24 hours)
**Status**: Not Started
**Blocks**: Story 5.2, Story 5.4.5, Story 5.4.6

### Objective

Replace line 402 in `packages/cli/src/commands/generate.ts`:
```typescript
// REMOVE THIS:
await copyTemplate(templatePath, outputPath);

// REPLACE WITH:
await generateWithRollback(outputPath, options, metadata...);
```

### Prerequisites Check

Before starting, verify these packages are working:

```bash
# Parser package works (already verified)
pnpm --filter "@openapi-to-mcp/parser" test
# Should pass: 100+ tests

# Generator package works (already verified)
pnpm --filter "@openapi-to-mcp/generator" test
# Should pass: 800+ tests

# Check generator exports
grep "export.*scaffoldProject\|generateInterfaces\|generateToolDefinitions" \
  packages/generator/src/index.ts
# Should show exported functions
```

### Implementation Plan

#### Task 5.1.1: Remove Old Template Logic (2 hours)

**File**: `packages/cli/src/commands/generate.ts`

**Changes**:
1. Remove lines 382-420 (old template copying logic)
2. Remove `copyTemplate` import from line 12
3. Remove `__dirname` setup (lines 45-47, ESM equivalent)

**Verification**:
```bash
# Check imports
grep "copyTemplate\|__dirname" packages/cli/src/commands/generate.ts
# Should return nothing
```

#### Task 5.1.2: Import Generator Functions (30 minutes)

**File**: `packages/cli/src/commands/generate.ts`

**Add imports** after line 17:
```typescript
import {
  scaffoldProject,
  generateInterfaces,
  generateToolDefinitions,
  writeFile,
} from '@openapi-to-mcp/generator';
import type { NormalizedSchema } from '@openapi-to-mcp/parser';
```

**Verification**:
```bash
# Check imports compile
pnpm --filter "@openapi-to-mcp/cli" build
# Should succeed
```

#### Task 5.1.3: Implement Generation Function (4 hours)

**File**: `packages/cli/src/commands/generate.ts`

**Add function** after line 350 (after metadata extraction):

```typescript
/**
 * Generate MCP server from parsed metadata
 */
async function generateMCPServer(
  outputPath: string,
  result: any,
  schemaMap: SchemaMap,
  operations: OperationMetadata[],
  securityResult: SecurityExtractionResult,
  tagResult: TagExtractionResult,
  serverResult: ServerExtractionResult,
  options: GenerateOptions
): Promise<void> {
  logger.info('⚙️  Step 1/5: Scaffolding project structure...');

  // Step 1: Scaffold project
  await scaffoldProject({
    outputDir: outputPath,
    apiName: result.document.info.title,
    apiVersion: result.document.info.version,
    apiDescription: result.document.info.description || 'No description provided',
    baseURL: serverResult.defaultServer.baseURL,
    license: 'MIT',
    securitySchemes: Object.entries(securityResult.schemes).map(([name, scheme]) => ({
      name,
      type: scheme.type,
      classification: scheme.classification,
      supported: scheme.supported,
      metadata: scheme.metadata,
    })),
    tags: tagResult.tags.map((tag) => ({
      name: tag.name,
      pascalName: tag.name,
      displayName: tag.displayName,
      description: tag.description,
      operationCount: tag.operationCount,
    })),
    operationCount: operations.length,
    externalDocsUrl: result.document.externalDocs?.url,
  });

  logger.info('✅ Project structure scaffolded');

  // Step 2: Generate TypeScript interfaces
  logger.info('⚙️  Step 2/5: Generating TypeScript interfaces...');

  const schemaRecord: Record<string, NormalizedSchema> = {};
  schemaMap.forEach((schema, name) => {
    schemaRecord[name] = schema;
  });

  const interfaceResult = generateInterfaces(schemaRecord, {
    includeComments: true,
    includeExamples: false,
    exportAll: true,
  });

  const typesFilePath = resolve(outputPath, 'src/types.ts');
  await writeFile(typesFilePath, interfaceResult.code);

  logger.info(`✅ Generated ${interfaceResult.interfaces.length} TypeScript interfaces`);

  // Step 3: Generate MCP tool definitions
  logger.info('⚙️  Step 3/5: Generating MCP tool definitions...');

  const toolResult = generateToolDefinitions(operations, {
    includeTags: true,
    includeSecurity: true,
    generateExecuteCode: true,
  });

  const toolsCode = `/**
 * MCP Tool Definitions
 * Generated from OpenAPI specification
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as types from './types.js';

${toolResult.tools
  .map(
    (tool) => `export const ${tool.name}Tool: Tool = ${JSON.stringify(tool, null, 2)};`
  )
  .join('\n\n')}

// Export all tools as an array
export const allTools: Tool[] = [
${toolResult.tools.map((tool) => `  ${tool.name}Tool`).join(',\n')}
];
`;

  const toolsFilePath = resolve(outputPath, 'src/tools.ts');
  await writeFile(toolsFilePath, toolsCode);

  logger.info(`✅ Generated ${toolResult.tools.length} MCP tools`);

  // Step 4: Generate main server file
  logger.info('⚙️  Step 4/5: Generating server entry point...');

  const serverCode = `/**
 * MCP Server Entry Point
 * Generated from ${result.document.info.title} v${result.document.info.version}
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { allTools } from './tools.js';

// Create MCP server
const server = new Server(
  {
    name: '${result.document.info.title.replace(/'/g, "\\'")}',
    version: '${result.document.info.version}',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: allTools,
  };
});

// Register tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const tool = allTools.find((t) => t.name === toolName);

  if (!tool) {
    throw new Error(\`Unknown tool: \${toolName}\`);
  }

  // TODO: Implement actual API calls using http-client
  return {
    content: [
      {
        type: 'text',
        text: \`Tool \${toolName} called with arguments: \${JSON.stringify(request.params.arguments)}\`,
      },
    ],
  };
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('${result.document.info.title} MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
`;

  const indexFilePath = resolve(outputPath, 'src/index.ts');
  await writeFile(indexFilePath, serverCode);

  logger.info('✅ Server entry point generated');

  // Step 5: Generate HTTP client
  logger.info('⚙️  Step 5/5: Generating HTTP client...');

  const clientCode = `/**
 * HTTP Client
 * Configured for ${result.document.info.title}
 */

import axios from 'axios';

export const baseURL = '${serverResult.defaultServer.baseURL}';

// Configure HTTP client with base URL
export const httpClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
httpClient.interceptors.request.use((config) => {
  // TODO: Add authentication logic based on security schemes
  ${
    Object.keys(securityResult.schemes).length > 0
      ? `// Available auth schemes: ${Object.keys(securityResult.schemes).join(', ')}`
      : '// No authentication configured'
  }
  return config;
});

// Add response interceptor for error handling
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API request failed:', error.message);
    throw error;
  }
);
`;

  const clientFilePath = resolve(outputPath, 'src/http-client.ts');
  await writeFile(clientFilePath, clientCode);

  logger.info('✅ HTTP client generated');
}
```

**Verification**:
```bash
# Check function exists
grep "async function generateMCPServer" packages/cli/src/commands/generate.ts
# Should find the function
```

#### Task 5.1.4: Invoke Generation Function (1 hour)

**File**: `packages/cli/src/commands/generate.ts`

**Replace** old template copying (around line 350) with:

```typescript
        logger.debug('All metadata extracted and ready for code generation');

        // Generate MCP server from parsed metadata
        await generateMCPServer(
          outputPath,
          result,
          schemaMap,
          operations,
          securityResult,
          tagResult,
          serverResult,
          options
        );

        // Success message with summary
        // eslint-disable-next-line no-console
        console.log('');
        // eslint-disable-next-line no-console
        console.log('═'.repeat(60));
        // eslint-disable-next-line no-console
        console.log('✅ MCP server generated successfully!');
        // eslint-disable-next-line no-console
        console.log('═'.repeat(60));
        // eslint-disable-next-line no-console
        console.log('');
        // eslint-disable-next-line no-console
        console.log(`📍 Output location: ${outputPath}`);
        // eslint-disable-next-line no-console
        console.log('');
        // eslint-disable-next-line no-console
        console.log('📊 Generation Summary:');
        // eslint-disable-next-line no-console
        console.log(`   • ${operations.length} MCP tools`);
        // eslint-disable-next-line no-console
        console.log(`   • ${schemaMap.size} TypeScript interfaces`);
        // eslint-disable-next-line no-console
        console.log(`   • ${Object.keys(securityResult.schemes).length} authentication scheme(s)`);
        // eslint-disable-next-line no-console
        console.log(`   • ${tagResult.tags.length} API categories`);
        // eslint-disable-next-line no-console
        console.log('');
        // eslint-disable-next-line no-console
        console.log('📝 Next steps:');
        // eslint-disable-next-line no-console
        console.log(`   1. cd ${outputPath}`);
        // eslint-disable-next-line no-console
        console.log('   2. npm install');
        // eslint-disable-next-line no-console
        console.log('   3. npm run build');
        // eslint-disable-next-line no-console
        console.log('   4. node dist/index.js');
        // eslint-disable-next-line no-console
        console.log('');
```

**Verification**:
```bash
# Check invocation exists
grep "await generateMCPServer" packages/cli/src/commands/generate.ts
# Should find the invocation
```

#### Task 5.1.5: Test with Ozon API (4 hours)

**Test Script**:
```bash
#!/bin/bash
set -e

echo "=== Testing Story 5.1 Implementation ==="

# Clean up
rm -rf /tmp/test-ozon-mcp

# Build CLI
echo "Building CLI..."
pnpm --filter "@openapi-to-mcp/cli" build

# Generate from Ozon API
echo "Generating MCP server from Ozon API..."
pnpm --filter "@openapi-to-mcp/cli" start generate \
  swagger/swagger.json \
  --output /tmp/test-ozon-mcp \
  --verbose

# Verify tool count
echo "Verifying tool count..."
TOOL_COUNT=$(grep -c "export const.*Tool:" /tmp/test-ozon-mcp/src/tools.ts || echo "0")
echo "Generated $TOOL_COUNT tools"
if [ "$TOOL_COUNT" -lt 35 ]; then
  echo "❌ FAIL: Expected ~39 tools, got $TOOL_COUNT"
  exit 1
fi
echo "✅ PASS: Tool count looks good"

# Verify interface count
echo "Verifying interface count..."
INTERFACE_COUNT=$(grep -c "export interface" /tmp/test-ozon-mcp/src/types.ts || echo "0")
echo "Generated $INTERFACE_COUNT interfaces"
if [ "$INTERFACE_COUNT" -lt 200 ]; then
  echo "❌ FAIL: Expected ~220 interfaces, got $INTERFACE_COUNT"
  exit 1
fi
echo "✅ PASS: Interface count looks good"

# Verify files exist
echo "Verifying file structure..."
for file in src/index.ts src/types.ts src/tools.ts src/http-client.ts package.json tsconfig.json; do
  if [ ! -f "/tmp/test-ozon-mcp/$file" ]; then
    echo "❌ FAIL: Missing file: $file"
    exit 1
  fi
done
echo "✅ PASS: All required files present"

# Install and build
echo "Testing generated server builds..."
cd /tmp/test-ozon-mcp
npm install --silent
npm run build

if [ $? -ne 0 ]; then
  echo "❌ FAIL: Generated code does not compile"
  exit 1
fi
echo "✅ PASS: Generated code compiles successfully"

# Test server starts
echo "Testing server starts..."
timeout 5 node dist/index.js &
TIMEOUT_EXIT=$?
if [ $TIMEOUT_EXIT -eq 124 ]; then
  echo "✅ PASS: Server started successfully (timeout expected)"
else
  echo "❌ FAIL: Server failed to start"
  exit 1
fi

echo ""
echo "=== ✅ Story 5.1 Tests PASSED ==="
```

Save as `scripts/test-story-5.1.sh` and run:
```bash
chmod +x scripts/test-story-5.1.sh
./scripts/test-story-5.1.sh
```

#### Task 5.1.6: Fix Issues & Polish (2 hours)

**Common Issues**:

1. **Import errors**:
   - Check all generator functions are exported in `packages/generator/src/index.ts`
   - Verify path resolution for generated files

2. **Type errors**:
   - Ensure `NormalizedSchema` type is imported
   - Check metadata object types match function signatures

3. **Generation errors**:
   - Add try-catch around each generation step
   - Log helpful error messages

**Polishing**:
```typescript
// Add progress updates
logger.info(`Generating ${schemaMap.size} interfaces...`);
logger.info(`Generating ${operations.length} tools...`);
```

### Story 5.1 Success Criteria

**Must Have**:
- ✅ Generate 35+ tools from Ozon API (target: 39)
- ✅ Generate 200+ interfaces (target: 220)
- ✅ Generated code compiles without errors
- ✅ Generated server starts without crashing
- ✅ All required files present (package.json, src/*, tsconfig.json)
- ✅ CLI tests pass (22 tests)

**Verification Commands**:
```bash
# Generate and verify
pnpm --filter "@openapi-to-mcp/cli" start generate swagger/swagger.json -o /tmp/test
grep -c "Tool" /tmp/test/src/tools.ts  # Should be ~39
grep -c "interface" /tmp/test/src/types.ts  # Should be ~220
cd /tmp/test && npm install && npm run build  # Should succeed
```

### Story 5.1 Rollback Plan

If implementation fails:

1. **Preserve current state**:
   ```bash
   git stash  # Save work in progress
   git checkout HEAD packages/cli/src/commands/generate.ts  # Restore original
   ```

2. **Identify issue**:
   - Run `--debug` flag
   - Check generator package tests
   - Review error logs

3. **Fix incrementally**:
   - Test each generation step separately
   - Verify generator functions work in isolation
   - Add detailed logging

---

## Story 5.2 Plan: Integration Tests

**Priority**: P0 CRITICAL
**Effort**: 5 story points (16 hours)
**Status**: Not Started
**Dependency**: Story 5.1 must complete first

### Objective

Create comprehensive integration tests that verify:
1. Complete generation pipeline works
2. Generated code compiles
3. Generated server runs
4. Output matches OpenAPI spec (39 tools, 220 types)

### Prerequisites

Before starting:
```bash
# Story 5.1 must be complete and working
./scripts/test-story-5.1.sh
# Should pass all tests
```

### Implementation Plan

#### Task 5.2.1: Create Test Fixtures (2 hours)

**Directory**: `packages/cli/tests/fixtures/`

**Create test OpenAPI specs**:

1. **Simple spec** (`simple-api.json`):
```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Simple Test API",
    "version": "1.0.0"
  },
  "paths": {
    "/users": {
      "get": {
        "operationId": "getUsers",
        "summary": "List users",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { "$ref": "#/components/schemas/User" }
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" }
        }
      }
    }
  }
}
```

2. **Copy Ozon API spec** (`ozon-api.json`):
```bash
cp swagger/swagger.json packages/cli/tests/fixtures/ozon-api.json
```

3. **Edge case specs**:
   - `empty-api.json` - Minimal valid spec
   - `complex-schemas.json` - Nested objects, arrays
   - `all-auth-types.json` - Multiple authentication schemes

**Verification**:
```bash
ls packages/cli/tests/fixtures/
# Should show 5 JSON files
```

#### Task 5.2.2: Generation Pipeline Tests (4 hours)

**File**: `packages/cli/tests/integration/generation-pipeline.test.ts`

```typescript
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { resolve } from 'path';
import { execa } from 'execa';
import fs from 'fs-extra';

describe('Generation Pipeline Integration Tests', () => {
  const fixturesDir = resolve(__dirname, '../fixtures');
  const outputDir = resolve(__dirname, '../output');
  const cliPath = resolve(__dirname, '../../dist/index.js');

  beforeEach(async () => {
    await fs.ensureDir(outputDir);
    await fs.emptyDir(outputDir);
  });

  afterEach(async () => {
    await fs.remove(outputDir);
  });

  describe('Simple API Generation', () => {
    test('generates correct number of tools', async () => {
      const specPath = resolve(fixturesDir, 'simple-api.json');
      const output = resolve(outputDir, 'simple-mcp');

      await execa('node', [cliPath, 'generate', specPath, '--output', output]);

      const toolsFile = resolve(output, 'src/tools.ts');
      const content = await fs.readFile(toolsFile, 'utf-8');
      const toolCount = (content.match(/export const \w+Tool: Tool =/g) || []).length;

      expect(toolCount).toBe(1); // Simple API has 1 operation
    });

    test('generates correct number of interfaces', async () => {
      const specPath = resolve(fixturesDir, 'simple-api.json');
      const output = resolve(outputDir, 'simple-mcp');

      await execa('node', [cliPath, 'generate', specPath, '--output', output]);

      const typesFile = resolve(output, 'src/types.ts');
      const content = await fs.readFile(typesFile, 'utf-8');
      const interfaceCount = (content.match(/export interface \w+/g) || []).length;

      expect(interfaceCount).toBeGreaterThanOrEqual(1); // At least User interface
    });

    test('generates all required files', async () => {
      const specPath = resolve(fixturesDir, 'simple-api.json');
      const output = resolve(outputDir, 'simple-mcp');

      await execa('node', [cliPath, 'generate', specPath, '--output', output]);

      const requiredFiles = [
        'package.json',
        'tsconfig.json',
        'README.md',
        'src/index.ts',
        'src/types.ts',
        'src/tools.ts',
        'src/http-client.ts',
      ];

      for (const file of requiredFiles) {
        const filePath = resolve(output, file);
        expect(await fs.pathExists(filePath)).toBe(true);
      }
    });
  });

  describe('Ozon API Generation', () => {
    test('generates 39 tools from Ozon Performance API', async () => {
      const specPath = resolve(fixturesDir, 'ozon-api.json');
      const output = resolve(outputDir, 'ozon-mcp');

      await execa('node', [cliPath, 'generate', specPath, '--output', output]);

      const toolsFile = resolve(output, 'src/tools.ts');
      const content = await fs.readFile(toolsFile, 'utf-8');
      const toolCount = (content.match(/export const \w+Tool: Tool =/g) || []).length;

      expect(toolCount).toBeGreaterThanOrEqual(35); // Allow some variance
      expect(toolCount).toBeLessThanOrEqual(45);
    });

    test('generates 220+ interfaces from Ozon API', async () => {
      const specPath = resolve(fixturesDir, 'ozon-api.json');
      const output = resolve(outputDir, 'ozon-mcp');

      await execa('node', [cliPath, 'generate', specPath, '--output', output]);

      const typesFile = resolve(output, 'src/types.ts');
      const content = await fs.readFile(typesFile, 'utf-8');
      const interfaceCount = (content.match(/export interface \w+/g) || []).length;

      expect(interfaceCount).toBeGreaterThanOrEqual(200);
    });

    test('generates correct API metadata in package.json', async () => {
      const specPath = resolve(fixturesDir, 'ozon-api.json');
      const output = resolve(outputDir, 'ozon-mcp');

      await execa('node', [cliPath, 'generate', specPath, '--output', output]);

      const pkgPath = resolve(output, 'package.json');
      const pkg = await fs.readJson(pkgPath);

      expect(pkg.name).toContain('ozon');
      expect(pkg.dependencies).toHaveProperty('@modelcontextprotocol/sdk');
      expect(pkg.dependencies).toHaveProperty('axios');
    });
  });

  describe('Error Handling', () => {
    test('fails gracefully with invalid spec', async () => {
      const specPath = resolve(fixturesDir, 'invalid-spec.json');
      const output = resolve(outputDir, 'invalid-mcp');

      await expect(
        execa('node', [cliPath, 'generate', specPath, '--output', output])
      ).rejects.toThrow();
    });

    test('prevents overwriting without --force', async () => {
      const specPath = resolve(fixturesDir, 'simple-api.json');
      const output = resolve(outputDir, 'existing-mcp');

      // Create first time
      await execa('node', [cliPath, 'generate', specPath, '--output', output]);

      // Try to overwrite without force
      await expect(
        execa('node', [cliPath, 'generate', specPath, '--output', output])
      ).rejects.toThrow(/already exists/);
    });

    test('allows overwriting with --force', async () => {
      const specPath = resolve(fixturesDir, 'simple-api.json');
      const output = resolve(outputDir, 'force-mcp');

      // Create first time
      await execa('node', [cliPath, 'generate', specPath, '--output', output]);

      // Overwrite with force
      await expect(
        execa('node', [cliPath, 'generate', specPath, '--output', output, '--force'])
      ).resolves.not.toThrow();
    });
  });
});
```

**Run tests**:
```bash
pnpm --filter "@openapi-to-mcp/cli" test generation-pipeline.test.ts
```

#### Task 5.2.3: TypeScript Compilation Tests (3 hours)

**File**: `packages/cli/tests/integration/compilation.test.ts`

```typescript
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { resolve } from 'path';
import { execa } from 'execa';
import fs from 'fs-extra';

describe('Generated Code Compilation Tests', () => {
  const fixturesDir = resolve(__dirname, '../fixtures');
  const outputDir = resolve(__dirname, '../output');
  const cliPath = resolve(__dirname, '../../dist/index.js');

  beforeEach(async () => {
    await fs.ensureDir(outputDir);
    await fs.emptyDir(outputDir);
  });

  afterEach(async () => {
    await fs.remove(outputDir);
  });

  test('generated code compiles without TypeScript errors', async () => {
    const specPath = resolve(fixturesDir, 'simple-api.json');
    const output = resolve(outputDir, 'compile-test');

    // Generate server
    await execa('node', [cliPath, 'generate', specPath, '--output', output]);

    // Install dependencies
    await execa('npm', ['install', '--silent'], { cwd: output });

    // Compile TypeScript
    const { stdout, stderr } = await execa('npm', ['run', 'build'], { cwd: output });

    // Should not have TypeScript errors
    expect(stderr).not.toContain('error TS');
    expect(stdout).toContain('Successfully compiled');
  });

  test('generated code has no linting errors', async () => {
    const specPath = resolve(fixturesDir, 'ozon-api.json');
    const output = resolve(outputDir, 'lint-test');

    await execa('node', [cliPath, 'generate', specPath, '--output', output]);
    await execa('npm', ['install', '--silent'], { cwd: output });

    // Run TypeScript compiler in check mode
    const result = await execa('npx', ['tsc', '--noEmit'], {
      cwd: output,
      reject: false
    });

    expect(result.exitCode).toBe(0);
  });

  test('generated types are correct and importable', async () => {
    const specPath = resolve(fixturesDir, 'simple-api.json');
    const output = resolve(outputDir, 'types-test');

    await execa('node', [cliPath, 'generate', specPath, '--output', output]);

    // Create test file that imports generated types
    const testCode = `
      import { User } from './src/types.js';

      const user: User = {
        id: '123',
        name: 'Test User'
      };

      console.log('Types work:', user);
    `;

    await fs.writeFile(resolve(output, 'test-types.ts'), testCode);

    // Try to compile
    await execa('npm', ['install', '--silent'], { cwd: output });
    await expect(
      execa('npx', ['tsc', 'test-types.ts', '--noEmit'], { cwd: output })
    ).resolves.not.toThrow();
  });
});
```

#### Task 5.2.4: Runtime Behavior Tests (4 hours)

**File**: `packages/cli/tests/integration/runtime.test.ts`

```typescript
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { resolve } from 'path';
import { execa } from 'execa';
import { spawn } from 'child_process';
import fs from 'fs-extra';

describe('Generated Server Runtime Tests', () => {
  const fixturesDir = resolve(__dirname, '../fixtures');
  const outputDir = resolve(__dirname, '../output');
  const cliPath = resolve(__dirname, '../../dist/index.js');

  beforeEach(async () => {
    await fs.ensureDir(outputDir);
    await fs.emptyDir(outputDir);
  });

  afterEach(async () => {
    await fs.remove(outputDir);
  });

  test('generated server starts without errors', async () => {
    const specPath = resolve(fixturesDir, 'simple-api.json');
    const output = resolve(outputDir, 'runtime-test');

    await execa('node', [cliPath, 'generate', specPath, '--output', output]);
    await execa('npm', ['install', '--silent'], { cwd: output });
    await execa('npm', ['run', 'build'], { cwd: output });

    // Start server with timeout
    const serverProcess = spawn('node', ['dist/index.js'], {
      cwd: output,
      timeout: 5000,
    });

    let serverOutput = '';
    let serverError = '';

    serverProcess.stdout.on('data', (data) => {
      serverOutput += data.toString();
    });

    serverProcess.stderr.on('data', (data) => {
      serverError += data.toString();
    });

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Kill server
    serverProcess.kill();

    // Verify server started
    expect(serverError).toContain('MCP server running on stdio');
    expect(serverError).not.toContain('Error:');
  });

  test('server responds to list tools request', async () => {
    const specPath = resolve(fixturesDir, 'simple-api.json');
    const output = resolve(outputDir, 'tools-list-test');

    await execa('node', [cliPath, 'generate', specPath, '--output', output]);
    await execa('npm', ['install', '--silent'], { cwd: output });
    await execa('npm', ['run', 'build'], { cwd: output });

    // Start server
    const serverProcess = spawn('node', ['dist/index.js'], {
      cwd: output,
    });

    let response = '';
    serverProcess.stdout.on('data', (data) => {
      response += data.toString();
    });

    // Send MCP list tools request
    const listToolsRequest = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {},
    }) + '\n';

    serverProcess.stdin.write(listToolsRequest);

    // Wait for response
    await new Promise((resolve) => setTimeout(resolve, 1000));

    serverProcess.kill();

    // Verify response contains tools
    expect(response).toContain('getUsers');
  });

  test('server has all tools registered', async () => {
    const specPath = resolve(fixturesDir, 'ozon-api.json');
    const output = resolve(outputDir, 'all-tools-test');

    await execa('node', [cliPath, 'generate', specPath, '--output', output]);
    await execa('npm', ['install', '--silent'], { cwd: output });
    await execa('npm', ['run', 'build'], { cwd: output });

    // Check that allTools array is populated
    const indexFile = resolve(output, 'dist/index.js');
    const content = await fs.readFile(indexFile, 'utf-8');

    // Verify tools are registered
    expect(content).toContain('allTools');
    expect(content).toContain('ListToolsRequestSchema');
    expect(content).toContain('CallToolRequestSchema');
  });
});
```

#### Task 5.2.5: Performance Tests (3 hours)

**File**: `packages/cli/tests/integration/performance.test.ts`

```typescript
import { describe, test, expect } from 'vitest';
import { resolve } from 'path';
import { execa } from 'execa';
import fs from 'fs-extra';

describe('Performance Tests', () => {
  const fixturesDir = resolve(__dirname, '../fixtures');
  const outputDir = resolve(__dirname, '../output');
  const cliPath = resolve(__dirname, '../../dist/index.js');

  test('generates Ozon API server in under 30 seconds', async () => {
    const specPath = resolve(fixturesDir, 'ozon-api.json');
    const output = resolve(outputDir, 'perf-test');

    await fs.ensureDir(outputDir);
    await fs.emptyDir(outputDir);

    const startTime = Date.now();

    await execa('node', [cliPath, 'generate', specPath, '--output', output]);

    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(30000); // 30 seconds
  });

  test('generation uses less than 500MB memory', async () => {
    const specPath = resolve(fixturesDir, 'ozon-api.json');
    const output = resolve(outputDir, 'memory-test');

    await fs.ensureDir(outputDir);
    await fs.emptyDir(outputDir);

    // Run generation and monitor memory
    const result = await execa('node', [
      '--expose-gc',
      '--max-old-space-size=500',
      cliPath,
      'generate',
      specPath,
      '--output',
      output,
    ]);

    // If memory exceeded, process would crash
    expect(result.exitCode).toBe(0);
  });

  test('generated server starts in under 3 seconds', async () => {
    const specPath = resolve(fixturesDir, 'simple-api.json');
    const output = resolve(outputDir, 'startup-perf');

    await fs.ensureDir(outputDir);
    await fs.emptyDir(outputDir);

    await execa('node', [cliPath, 'generate', specPath, '--output', output]);
    await execa('npm', ['install', '--silent'], { cwd: output });
    await execa('npm', ['run', 'build'], { cwd: output });

    const startTime = Date.now();

    const serverProcess = spawn('node', ['dist/index.js'], { cwd: output });

    await new Promise((resolve) => {
      serverProcess.stderr.on('data', (data) => {
        if (data.toString().includes('running on stdio')) {
          resolve();
        }
      });
    });

    const startupTime = Date.now() - startTime;
    serverProcess.kill();

    expect(startupTime).toBeLessThan(3000); // 3 seconds
  });
});
```

### Story 5.2 Success Criteria

**Must Have**:
- ✅ All generation pipeline tests pass
- ✅ Generated code compiles in tests
- ✅ Generated server starts in tests
- ✅ Performance tests pass (<30s generation)
- ✅ Test coverage >80% for integration scenarios

**Verification**:
```bash
pnpm --filter "@openapi-to-mcp/cli" test
# All tests should pass
```

---

## Story 5.4 Completion: Example & Validation

**Priority**: P1 HIGH
**Effort**: 1 story point (3 hours)
**Status**: Deferred
**Dependency**: Story 5.1 must complete first

### Task 5.4.5: Generate Ozon Example Server (2 hours)

**Objective**: Create working example server from Ozon Performance API

**Steps**:

1. **Generate example**:
```bash
mkdir -p examples/ozon-performance-mcp

pnpm --filter "@openapi-to-mcp/cli" start generate \
  swagger/swagger.json \
  --output ./examples/ozon-performance-mcp \
  --force
```

2. **Create example README** (`examples/ozon-performance-mcp/README.md`):
```markdown
# Ozon Performance API MCP Server (Example)

Complete working example of an MCP server generated from the Ozon Performance API.

## 📊 Generated Content

- **39 MCP Tools** - All Ozon Performance API operations
- **220 TypeScript Interfaces** - Complete type definitions
- **HTTP Client** - ClientId/ClientSecret authentication
- **Production Ready** - Compiles and runs out of the box

## 🚀 Usage

### 1. Install Dependencies

\```bash
npm install
\```

### 2. Configure Credentials

Create `.env` file:

\```env
CLIENT_ID=your_ozon_client_id
CLIENT_SECRET=your_ozon_client_secret
\```

### 3. Build

\```bash
npm run build
\```

### 4. Run

\```bash
node dist/index.js
\```

## 🔧 Integration with Claude Desktop

Add to `claude_desktop_config.json`:

\```json
{
  "mcpServers": {
    "ozon-performance": {
      "command": "node",
      "args": ["/absolute/path/to/examples/ozon-performance-mcp/dist/index.js"],
      "env": {
        "CLIENT_ID": "your_client_id",
        "CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
\```

Restart Claude Desktop to load the server.

## 📚 Available Tools

See `src/tools.ts` for complete list. Highlights:

- `postBotsSendMessage` - Send bot messages
- `postPerformanceReports` - Performance analytics
- `postProductsInfo` - Product information
- And 36 more...

## 📝 Generated Files

- `src/index.ts` - MCP server entry point
- `src/types.ts` - 220 TypeScript interfaces
- `src/tools.ts` - 39 MCP tool definitions
- `src/http-client.ts` - Authenticated HTTP client

## 🔗 API Documentation

[Ozon Performance API Docs](https://api-seller.ozon.ru/)
```

3. **Create .env.example**:
```bash
cat > examples/ozon-performance-mcp/.env.example << 'EOF'
# Ozon Performance API Credentials
CLIENT_ID=your_ozon_client_id_here
CLIENT_SECRET=your_ozon_client_secret_here

# Optional: API Base URL override
# API_BASE_URL=https://api-seller.ozon.ru
EOF
```

4. **Update .gitignore**:
```bash
cat > examples/ozon-performance-mcp/.gitignore << 'EOF'
.env
node_modules/
dist/
EOF
```

5. **Test example**:
```bash
cd examples/ozon-performance-mcp
npm install
npm run build
timeout 5 node dist/index.js  # Should start successfully
```

**Success Criteria**:
- ✅ Example generates successfully
- ✅ Example compiles without errors
- ✅ Example server starts
- ✅ README is clear and complete
- ✅ .env.example included

### Task 5.4.6: External Validation (1 hour)

**Objective**: Have external tester complete quick-start guide

**Process**:

1. **Find tester**:
   - Team member unfamiliar with project
   - Or external beta tester
   - Or community member

2. **Provide materials**:
   - Link to `docs/guides/quick-start.md`
   - Clean environment (no prior setup)
   - Feedback form

3. **Observe session** (if possible):
   - Note where they get stuck
   - Identify unclear instructions
   - Record completion time

4. **Collect feedback**:
   ```markdown
   ## External Tester Feedback Form

   **Tester**: [Name]
   **Date**: [Date]

   **Completion Time**: _____ minutes (target: <5 min)

   **Steps Completed**:
   - [ ] Step 1: Install CLI
   - [ ] Step 2: Get OpenAPI spec
   - [ ] Step 3: Generate server
   - [ ] Step 4: Inspect files
   - [ ] Step 5: Build and run
   - [ ] Step 6: Claude Desktop integration

   **Issues Encountered**:
   - Issue 1: _____
   - Issue 2: _____

   **Confusing Steps**:
   - _____

   **Clarity Rating** (1-5): _____

   **Suggestions**:
   - _____
   ```

5. **Update documentation** based on feedback:
   - Clarify confusing steps
   - Add missing prerequisites
   - Improve error messages
   - Add more troubleshooting tips

**Success Criteria**:
- ✅ External tester completes tutorial
- ✅ Completion time <5 minutes
- ✅ Feedback collected
- ✅ Documentation updated

---

## Dependencies & Risks

### Critical Path

```
Story 5.1 (CLI Refactor)
    ↓
Story 5.2 (Integration Tests)
    ↓
Story 5.4.5 (Example Server)
    ↓
Story 5.4.6 (External Validation)
```

**Blocker**: Story 5.1 must complete before any other work can proceed.

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Generator functions don't integrate cleanly | Medium | High | Test generator package separately first |
| Generated code has type errors | Medium | High | Use strict TypeScript checking in tests |
| Performance targets not met | Low | Medium | Profile and optimize generation steps |
| External tester unavailable | Low | Low | Use team member as backup |
| Integration tests flaky | Medium | Medium | Use deterministic test data |

### Risk Mitigation Strategies

1. **Technical Debt**:
   - Review generator package tests before starting
   - Ensure all generator functions work in isolation
   - Create test plan before coding

2. **Integration Issues**:
   - Incremental integration (test each step)
   - Comprehensive error handling
   - Detailed logging for debugging

3. **Time Overruns**:
   - Built-in buffer day (Day 10)
   - Prioritize must-have over nice-to-have
   - Daily progress tracking

---

## Success Criteria

### Epic 5 Complete When:

**Functional**:
- ✅ Generate 39 tools from Ozon Performance API
- ✅ Generate 220 TypeScript interfaces
- ✅ Generated code compiles without errors
- ✅ Generated server starts and runs
- ✅ Example server demonstrates functionality

**Quality**:
- ✅ All integration tests pass
- ✅ Test coverage >80%
- ✅ Performance <30s generation time
- ✅ Memory usage <500MB

**Documentation**:
- ✅ Quick-start guide validated by external tester
- ✅ Example server with complete documentation
- ✅ README accurately describes features

**Validation**:
```bash
# Must pass all these commands:

# 1. Generate from Ozon API
pnpm --filter "@openapi-to-mcp/cli" start generate swagger/swagger.json -o /tmp/epic5-test

# 2. Verify tool count
grep -c "Tool:" /tmp/epic5-test/src/tools.ts  # >= 35

# 3. Verify interface count
grep -c "interface" /tmp/epic5-test/src/types.ts  # >= 200

# 4. Compile generated code
cd /tmp/epic5-test && npm install && npm run build  # Must succeed

# 5. Start generated server
timeout 5 node dist/index.js  # Must start without errors

# 6. Run all tests
pnpm test  # All tests pass
```

---

## Daily Checklist

### Day 1: Story 5.1 Start
- [ ] Review Story 5.1 plan
- [ ] Verify prerequisites (generator package works)
- [ ] Complete Tasks 5.1.1-5.1.2 (remove old, add imports)
- [ ] Start Task 5.1.3 (implement generation function)
- [ ] Daily commit with progress

### Day 2: Story 5.1 Continue
- [ ] Complete Task 5.1.3 (generation function)
- [ ] Complete Task 5.1.4 (invoke generation)
- [ ] Start Task 5.1.5 (testing)
- [ ] Daily commit with progress

### Day 3: Story 5.1 Complete
- [ ] Complete Task 5.1.5 (testing)
- [ ] Complete Task 5.1.6 (polish)
- [ ] Run `./scripts/test-story-5.1.sh`
- [ ] All tests pass
- [ ] Update Story 5.1 status to "Complete"
- [ ] Commit and push

### Day 4: Story 5.2 Start
- [ ] Review Story 5.2 plan
- [ ] Complete Task 5.2.1 (fixtures)
- [ ] Complete Task 5.2.2 (pipeline tests)
- [ ] Daily commit with progress

### Day 5: Story 5.2 Complete
- [ ] Complete Task 5.2.3 (compilation tests)
- [ ] Complete Task 5.2.4 (runtime tests)
- [ ] Complete Task 5.2.5 (performance tests)
- [ ] All tests pass
- [ ] Update Story 5.2 status to "Complete"
- [ ] Commit and push

### Day 6: Story 5.4 Completion
- [ ] Complete Task 5.4.5 (example server)
- [ ] Test example server end-to-end
- [ ] Update Story 5.4 status to "Complete"
- [ ] Commit and push

### Day 7: External Validation
- [ ] Complete Task 5.4.6 (external tester)
- [ ] Update docs based on feedback
- [ ] Final documentation review
- [ ] Commit and push

### Day 8-9: Epic Review
- [ ] Run all Epic 5 success criteria checks
- [ ] Fix any remaining issues
- [ ] Final code review
- [ ] Update Epic status to "Complete"
- [ ] Prepare merge to main

### Day 10: Buffer
- [ ] Address any blockers
- [ ] Performance optimization if needed
- [ ] Final testing
- [ ] Merge to main

---

## Monitoring & Reporting

### Daily Standup Format

```markdown
## Day X Progress - [Date]

**Completed Today**:
- Task A
- Task B

**Blockers**:
- Issue 1
- Issue 2

**Plan for Tomorrow**:
- Task C
- Task D

**Risks**:
- Risk 1

**Metrics**:
- Tests passing: X/Y
- Story progress: X%
```

### Weekly Review

Every Friday, assess:
1. Stories completed vs planned
2. Blockers and risks
3. Timeline adjustments
4. Quality metrics

---

## Rollback & Contingency

### If Story 5.1 Takes Too Long

**Day 3 Checkpoint**:
- If Story 5.1 not complete by end of Day 3
- Assess issues and extend timeline
- Consider reducing scope (focus on Ozon API only)
- Add extra days from buffer

### If Integration Tests Fail

**Fallback Plan**:
- Prioritize manual testing
- Document test failures
- Create plan for test fixes
- Don't block Epic completion on tests

### If External Tester Unavailable

**Backup Plan**:
- Use team member
- Or defer validation
- Focus on internal testing

---

## Final Deliverables

When Epic 5 is complete:

1. **Code**:
   - ✅ Working CLI generation
   - ✅ Comprehensive tests
   - ✅ Example server

2. **Documentation**:
   - ✅ Updated README
   - ✅ Quick-start guide (validated)
   - ✅ Architecture guide
   - ✅ Troubleshooting guide

3. **Evidence**:
   - ✅ Test results
   - ✅ Generated Ozon server (39 tools, 220 types)
   - ✅ External tester feedback

4. **Reports**:
   - ✅ Epic completion report
   - ✅ Lessons learned
   - ✅ Performance benchmarks

---

**Plan Created**: 2025-10-07
**Target Completion**: 2025-10-21
**Total Effort**: 14 story points (2 weeks)
**Status**: Ready to Execute
