# EPIC-005: Fix MCP Server Generation Pipeline

**Status**: Draft
**Priority**: Critical
**Complexity**: Medium
**Estimated Effort**: 2-3 days
**Target Release**: v0.3.0

---

## Executive Summary

The OpenAPI-to-MCP generator currently produces hello-world (removed Story 6.3) template stubs instead of functional MCP servers from real OpenAPI specifications. This blocks the primary value proposition of the project: automated generation of MCP servers from API documentation.

**Business Impact**:
- **Blocker for v1.0 release** - Core functionality non-operational
- **User trust damage** - Generated output doesn't match documented behavior
- **Technical debt** - Parser works correctly but CLI ignores results
- **Lost productivity** - Manual MCP server creation still required

**Root Cause**: CLI command performs complete OpenAPI parsing (extracting 39 operations, 220 schemas, 12 tags) but template copying logic ignores parsed data and copies static hello-world template instead.

---

## Business Value

### Problem Statement

**Current State**:
- Users run: `generate swagger.json --output ./server`
- Expected: Functional MCP server with 39 API tools
- Actual: Hello-world stub with 1 dummy tool
- User experience: Complete failure of core feature

**Affected Stakeholders**:
- **Developers**: Cannot generate MCP servers from OpenAPI specs
- **API Providers**: Cannot offer MCP interfaces for their APIs
- **End Users**: Cannot access APIs through MCP protocol
- **Project Team**: Reputation damage, blocked roadmap

### Success Criteria

**Functional Requirements**:
- ✅ Generate complete MCP server from Ozon Performance API (39 tools)
- ✅ TypeScript interfaces for all 220 API schemas
- ✅ Tool definitions with proper parameter validation
- ✅ HTTP client with authentication support
- ✅ Generated server passes `npm run build` without errors

**Quality Requirements**:
- ✅ 100% of OpenAPI operations converted to MCP tools
- ✅ Generated code compiles without TypeScript errors
- ✅ Generated server starts and responds to MCP protocol
- ✅ Documentation accuracy: generated code matches templates

**Performance Requirements**:
- Generation time: <30 seconds for 260KB OpenAPI spec
- Memory usage: <500MB during generation
- Generated server startup: <3 seconds

---

## Technical Analysis

### Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ CLI Command (packages/cli/src/commands/generate.ts)        │
├─────────────────────────────────────────────────────────────┤
│ 1. Lines 115-350: Parse OpenAPI                            │
│    ✅ loadOpenAPIDocument()      → document                 │
│    ✅ extractSchemas()            → 220 schemas             │
│    ✅ extractOperations()         → 39 operations           │
│    ✅ extractSecuritySchemes()    → auth schemes            │
│    ✅ extractTags()               → 12 categories           │
│    ✅ extractServers()            → base URL                │
│                                                             │
│ 2. Lines 386-456: Template Copying                         │
│    ❌ copyTemplate('hello-world') → ignores parsed data     │
│    ❌ Result: 1 dummy tool instead of 39 real tools        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Generator Package (packages/generator/src/*)                │
├─────────────────────────────────────────────────────────────┤
│ ✅ generateInterfaces()      - TypeScript types from schemas│
│ ✅ generateToolDefinitions() - MCP tools from operations    │
│ ✅ generateMainServerFile()  - index.ts with tool registry  │
│ ✅ generateHttpClient()      - HTTP client for API calls    │
│ ✅ scaffoldProject()         - Project structure            │
│                                                              │
│ ⚠️  PROBLEM: CLI doesn't invoke these functions             │
└─────────────────────────────────────────────────────────────┘
```

### Root Cause

**File**: `packages/cli/src/commands/generate.ts:386-456`

**Problem**: Template copying logic replaces generation logic:
```typescript
// ❌ Current implementation (WRONG)
const templatePath = resolve(__dirname, '../../../packages/templates/hello-world');
await copyTemplate(templatePath, outputPath);
// Copies static hello-world template, ignores all parsed data

// ✅ Required implementation (CORRECT)
const { scaffoldProject, generateInterfaces, generateToolDefinitions } =
  await import('@openapi-to-mcp/generator');

await scaffoldProject({ /* use parsed metadata */ });
await generateInterfaces(schemaMap, { /* options */ });
await generateToolDefinitions(operations, { /* options */ });
// Generates real code from parsed OpenAPI data
```

**Why This Happened**:
1. Original development used templates for scaffolding (correct)
2. Generator functions were implemented later (correct)
3. CLI integration was never completed (oversight)
4. Template copying remained as placeholder (technical debt)

### Impact Analysis

**Affected Components**:
- ❌ CLI generate command (main issue)
- ✅ Parser package (works correctly)
- ✅ Generator package (works correctly)
- ❌ Templates package (outdated hello-world only)
- ⚠️  Documentation (describes behavior that doesn't exist)

**Data Flow Validation**:

| Stage | Component | Input | Output | Status |
|-------|-----------|-------|--------|--------|
| 1 | Parser | `swagger.json` (260KB) | ParseResult with 39 ops | ✅ Works |
| 2 | CLI | ParseResult | Metadata extraction | ✅ Works |
| 3 | **CLI → Generator** | **Metadata** | **Generation calls** | **❌ BROKEN** |
| 4 | Generator | Generation calls | Source code files | ✅ Works (unused) |
| 5 | Output | Source files | MCP server | ❌ Never reached |

---

## Epic Scope

### In Scope

**Primary Deliverables**:
1. Fix CLI to invoke generator functions with parsed data
2. Validate complete generation pipeline end-to-end
3. Test with Ozon Performance API (39 tools, 220 schemas)
4. Update documentation to match actual behavior
5. Add integration tests for generation pipeline

**Secondary Deliverables**:
6. Improve error handling in generation flow
7. Add progress reporting during generation
8. Validate generated code compiles and runs
9. Add examples of generated servers to repository

### Out of Scope

- New template creation (use existing generator functions)
- OpenAPI 3.1 support (separate Epic)
- Custom code generation options (future enhancement)
- UI/CLI improvements beyond fix (separate Epic)
- Performance optimization (acceptable at <30s)

---

## Story Breakdown

### Story 5.1: Refactor CLI Generation Flow ⚡ CRITICAL

**Priority**: P0 (Blocker)
**Effort**: 8 story points
**Dependencies**: None

**Description**: Replace template copying logic with proper generator function invocation.

**Tasks**:
1. Remove template copying code (lines 386-456)
2. Import generator functions from `@openapi-to-mcp/generator`
3. Call `scaffoldProject()` with parsed metadata
4. Call `generateInterfaces()` with schema map
5. Call `generateToolDefinitions()` with operations
6. Call `generateMainServerFile()` with tool definitions
7. Call `generateHttpClient()` with security schemes
8. Write generated files to output directory

**Acceptance Criteria**:
- [ ] CLI invokes all 5 generator functions in correct order
- [ ] Generated output directory contains `src/` folder with:
  - [ ] `index.ts` (main server file with tool registry)
  - [ ] `types.ts` (TypeScript interfaces for 220 schemas)
  - [ ] `tools.ts` (39 MCP tool definitions)
  - [ ] `http-client.ts` (HTTP client with auth support)
- [ ] `package.json` contains correct dependencies and scripts
- [ ] `tsconfig.json` configured for ES2022 + ESM
- [ ] `README.md` generated with API documentation
- [ ] No hello-world template code in output

**Technical Specifications**:
```typescript
// packages/cli/src/commands/generate.ts (after line 350)

// 1. Import generator functions
const {
  scaffoldProject,
  generateInterfaces,
  generateToolDefinitions,
  generateMainServerFile,
  generateHttpClient,
  writeFile
} = await import('@openapi-to-mcp/generator');

// 2. Check output directory
await checkOutputDirectory(outputPath, options.force || false);

// 3. Scaffold project structure
await scaffoldProject({
  outputDir: outputPath,
  apiName: result.document.info.title,
  apiVersion: result.document.info.version,
  apiDescription: result.document.info.description,
  baseURL: serverResult.defaultServer.baseURL,
  license: options.license || 'MIT',
  author: options.author,
  repository: options.repository,
  securitySchemes: Object.entries(securityResult.schemes).map(([name, scheme]) => ({
    name,
    type: scheme.type,
    classification: scheme.classification,
    supported: scheme.supported,
    metadata: scheme.metadata,
  })),
  tags: tagResult.tags.map(tag => ({
    name: tag.name,
    pascalName: tag.name,
    displayName: tag.displayName,
    description: tag.description,
    operationCount: tag.operationCount,
  })),
  operationCount: operations.length,
  externalDocsUrl: result.document.externalDocs?.url,
});

// 4. Generate TypeScript interfaces
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

// 5. Generate MCP tools
const toolResult = generateToolDefinitions(operations, {
  includeTags: true,
  includeSecurity: true,
  generateExecuteCode: true,
});

// 6. Generate tools.ts file
const toolsCode = generateToolsFile(toolResult.tools);
const toolsFilePath = resolve(outputPath, 'src/tools.ts');
await writeFile(toolsFilePath, toolsCode);

// 7. Generate main server file
const serverCode = await generateMainServerFile({
  apiName: result.document.info.title,
  toolCount: toolResult.tools.length,
  securitySchemes: securityResult.schemes,
});
const indexFilePath = resolve(outputPath, 'src/index.ts');
await writeFile(indexFilePath, serverCode);

// 8. Generate HTTP client
const clientCode = await generateHttpClient({
  baseURL: serverResult.defaultServer.baseURL,
  securitySchemes: securityResult.schemes,
});
const clientFilePath = resolve(outputPath, 'src/http-client.ts');
await writeFile(clientFilePath, clientCode);

logger.info(`✅ MCP server generated successfully at ${outputPath}`);
logger.info(`📊 Generated ${toolResult.tools.length} tools from ${operations.length} operations`);
logger.info(`📦 Generated ${interfaceResult.interfaceCount} TypeScript interfaces`);
```

**Edge Cases**:
- Missing optional metadata (description, externalDocs)
- Empty tag arrays
- No security schemes defined
- Duplicate operation IDs
- Invalid output directory permissions

---

### Story 5.2: Add End-to-End Integration Tests

**Priority**: P0 (Critical)
**Effort**: 5 story points
**Dependencies**: Story 5.1

**Description**: Create integration tests that validate entire generation pipeline with real OpenAPI specs.

**Tasks**:
1. Create test fixture: Ozon Performance API swagger.json
2. Create test fixture: Minimal valid OpenAPI spec
3. Test: Generate from Ozon API → verify 39 tools created
4. Test: Generated code compiles without TypeScript errors
5. Test: Generated server starts and responds to MCP protocol
6. Test: Generated HTTP client has correct base URL
7. Test: Generated types match OpenAPI schemas
8. Add CI/CD integration test step

**Acceptance Criteria**:
- [ ] Integration test suite in `packages/cli/tests/integration/`
- [ ] Test case: Ozon API generation produces 39 tools
- [ ] Test case: Generated `package.json` has correct dependencies
- [ ] Test case: Generated code passes `tsc --noEmit` type checking
- [ ] Test case: Generated server binary runs without crashes
- [ ] Test case: Tool definitions have correct input schemas
- [ ] All tests pass in CI/CD pipeline
- [ ] Tests run in <60 seconds

**Test Specifications**:
```typescript
// packages/cli/tests/integration/generate.test.ts

describe('MCP Server Generation Pipeline', () => {
  const fixturesDir = resolve(__dirname, '../fixtures');
  const outputDir = resolve(__dirname, '../output');

  beforeEach(async () => {
    await fs.ensureDir(outputDir);
  });

  afterEach(async () => {
    await fs.remove(outputDir);
  });

  test('generates complete MCP server from Ozon Performance API', async () => {
    const swaggerPath = resolve(fixturesDir, 'ozon-performance-swagger.json');
    const output = resolve(outputDir, 'ozon-mcp-server');

    // Execute generation
    await generateCommand({
      input: swaggerPath,
      output,
      force: true,
    });

    // Verify file structure
    expect(await fs.pathExists(resolve(output, 'package.json'))).toBe(true);
    expect(await fs.pathExists(resolve(output, 'src/index.ts'))).toBe(true);
    expect(await fs.pathExists(resolve(output, 'src/types.ts'))).toBe(true);
    expect(await fs.pathExists(resolve(output, 'src/tools.ts'))).toBe(true);
    expect(await fs.pathExists(resolve(output, 'src/http-client.ts'))).toBe(true);

    // Verify tool count
    const toolsContent = await fs.readFile(resolve(output, 'src/tools.ts'), 'utf-8');
    const toolExports = toolsContent.match(/export const \w+Tool: Tool =/g);
    expect(toolExports).toHaveLength(39);

    // Verify types count
    const typesContent = await fs.readFile(resolve(output, 'src/types.ts'), 'utf-8');
    const interfaceExports = typesContent.match(/export interface \w+/g);
    expect(interfaceExports?.length).toBeGreaterThanOrEqual(220);

    // Verify package.json
    const pkg = await fs.readJSON(resolve(output, 'package.json'));
    expect(pkg.name).toContain('ozon-performance');
    expect(pkg.dependencies).toHaveProperty('@modelcontextprotocol/sdk');
    expect(pkg.scripts).toHaveProperty('build');

    // Verify TypeScript compilation
    const { exitCode } = await execa('npx', ['tsc', '--noEmit'], {
      cwd: output,
      reject: false,
    });
    expect(exitCode).toBe(0);
  });

  test('generated server starts without errors', async () => {
    const swaggerPath = resolve(fixturesDir, 'ozon-performance-swagger.json');
    const output = resolve(outputDir, 'ozon-mcp-server');

    await generateCommand({ input: swaggerPath, output, force: true });

    // Install dependencies
    await execa('npm', ['install'], { cwd: output });

    // Build server
    await execa('npm', ['run', 'build'], { cwd: output });

    // Start server (with timeout)
    const serverProcess = execa('node', ['dist/index.js'], {
      cwd: output,
      timeout: 5000,
    });

    // Send initialize request via stdio
    serverProcess.stdin?.write(JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' },
      },
    }) + '\n');

    // Wait for response
    const response = await new Promise((resolve) => {
      serverProcess.stdout?.on('data', (data) => {
        resolve(JSON.parse(data.toString()));
      });
    });

    expect(response).toHaveProperty('result');
    expect(response.result).toHaveProperty('capabilities');

    serverProcess.kill();
  });

  test('handles minimal valid OpenAPI spec', async () => {
    const minimalSpec = {
      openapi: '3.0.0',
      info: { title: 'Minimal API', version: '1.0.0' },
      paths: {
        '/test': {
          get: {
            operationId: 'getTest',
            summary: 'Test endpoint',
            responses: { '200': { description: 'Success' } },
          },
        },
      },
    };

    const specPath = resolve(outputDir, 'minimal-spec.json');
    await fs.writeJSON(specPath, minimalSpec);

    const output = resolve(outputDir, 'minimal-server');
    await generateCommand({ input: specPath, output, force: true });

    const toolsContent = await fs.readFile(resolve(output, 'src/tools.ts'), 'utf-8');
    expect(toolsContent).toContain('getTestTool');
  });
});
```

---

### Story 5.3: Improve Error Handling and Validation

**Priority**: P1 (High)
**Effort**: 3 story points
**Dependencies**: Story 5.1

**Description**: Add comprehensive error handling and validation for generation pipeline edge cases.

**Tasks**:
1. Validate output directory write permissions before generation
2. Handle partial generation failures gracefully
3. Add rollback mechanism if generation fails mid-process
4. Validate generated code syntax before writing files
5. Add progress reporting for long-running operations
6. Improve error messages with actionable suggestions

**Acceptance Criteria**:
- [ ] Permission errors caught before file operations
- [ ] Partial failures don't leave corrupted output directory
- [ ] Progress bar shows generation stages (0-100%)
- [ ] Failed generation cleans up partial output
- [ ] Error messages include fix suggestions
- [ ] All error paths tested with integration tests

**Error Handling Requirements**:
```typescript
// Output directory validation
try {
  await fs.access(outputPath, fs.constants.W_OK);
} catch (error) {
  throw new Error(
    `Output directory is not writable: ${outputPath}\n` +
    `Suggestion: Check directory permissions or use --output with writable path`
  );
}

// Atomic generation with rollback
const tempDir = resolve(outputPath, '.tmp-generation');
try {
  await generateToTempDirectory(tempDir);
  await validateGeneratedCode(tempDir);
  await fs.move(tempDir, outputPath, { overwrite: force });
} catch (error) {
  await fs.remove(tempDir); // Cleanup on failure
  throw error;
}

// Progress reporting
const progressBar = createProgressBar({
  total: 7,
  format: 'Generating [{bar}] {percentage}% | {stage}',
});

progressBar.tick({ stage: 'Parsing OpenAPI spec' });
// ... parsing
progressBar.tick({ stage: 'Generating TypeScript interfaces' });
// ... interface generation
progressBar.tick({ stage: 'Generating MCP tools' });
// ... tool generation
```

---

### Story 5.4: Update Documentation and Examples

**Priority**: P1 (High)
**Effort**: 3 story points
**Dependencies**: Story 5.1, 5.2

**Description**: Update all documentation to reflect actual generation behavior and add working examples.

**Tasks**:
1. Update README.md with accurate generation workflow
2. Add example: Generated server from Ozon Performance API
3. Create tutorial: "From OpenAPI to MCP in 5 minutes"
4. Update API documentation with generation function details
5. Add troubleshooting guide for common generation issues
6. Create architecture diagram showing generation pipeline

**Acceptance Criteria**:
- [ ] README.md accurately describes generation output
- [ ] Examples directory contains generated Ozon MCP server
- [ ] Tutorial validated by external tester (5 min completion)
- [ ] API docs include all generator function signatures
- [ ] Troubleshooting guide covers 10+ common issues
- [ ] Architecture diagram shows Parser → CLI → Generator flow

**Documentation Structure**:
```markdown
# docs/guides/generation-pipeline.md

## Generation Pipeline Architecture

┌──────────────┐
│ OpenAPI Spec │
│ (JSON/YAML)  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Parser Package                       │
│ - Load and validate OpenAPI          │
│ - Extract schemas (220)              │
│ - Extract operations (39)            │
│ - Extract metadata                   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ CLI Command                          │
│ - Validate input                     │
│ - Coordinate generation              │
│ - Report progress                    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Generator Package                    │
│ - scaffoldProject()                  │
│ - generateInterfaces()               │
│ - generateToolDefinitions()          │
│ - generateMainServerFile()           │
│ - generateHttpClient()               │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ MCP Server (Generated Output)        │
│ - src/index.ts                       │
│ - src/types.ts (220 interfaces)      │
│ - src/tools.ts (39 tool definitions) │
│ - src/http-client.ts                 │
│ - package.json                       │
│ - tsconfig.json                      │
│ - README.md                          │
└──────────────────────────────────────┘

## Example: Generating Ozon Performance MCP Server

```bash
# 1. Generate server
npx @openapi-to-mcp/cli generate \
  swagger/swagger.json \
  --output ./ozon-mcp-server \
  --force

# Output:
# ✅ Parsing OpenAPI spec... (260KB)
# ✅ Extracted 39 operations across 12 tags
# ✅ Extracted 220 schema definitions
# ✅ Generating TypeScript interfaces... (220 types)
# ✅ Generating MCP tool definitions... (39 tools)
# ✅ Generating main server file...
# ✅ Generating HTTP client with ClientId/ClientSecret auth...
# ✅ MCP server generated successfully at ./ozon-mcp-server

# 2. Install dependencies
cd ozon-mcp-server
npm install

# 3. Build server
npm run build

# 4. Run server
node dist/index.js
# Ozon Performance API MCP server running on stdio

# 5. Test with Claude Desktop
# Add to claude_desktop_config.json:
{
  "mcpServers": {
    "ozon-performance": {
      "command": "node",
      "args": ["/path/to/ozon-mcp-server/dist/index.js"],
      "env": {
        "CLIENT_ID": "your_client_id",
        "CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
```

## Troubleshooting

### Issue: Generated server has TypeScript errors

**Cause**: OpenAPI spec contains incompatible schema definitions

**Solution**:
```bash
# Use --force flag to bypass strict validation
npx @openapi-to-mcp/cli generate swagger.json \
  --output ./server \
  --force

# Then manually fix TypeScript errors in generated code
```

### Issue: Generated tools not appearing in Claude

**Cause**: Server failed to start or MCP protocol error

**Solution**:
```bash
# 1. Test server manually
cd server
node dist/index.js

# 2. Check logs in Claude Desktop
tail -f ~/Library/Logs/Claude/mcp*.log

# 3. Verify tool registration in src/index.ts
grep "server.setRequestHandler" src/index.ts
```
```

---

## Technical Specifications

### Data Flow

```
Input: OpenAPI 3.0 Specification (JSON/YAML)
  │
  ▼
┌─────────────────────────────────────────────┐
│ Parser Phase                                │
│ - Validate OpenAPI schema                  │
│ - Resolve $ref pointers                    │
│ - Extract schemas → Map<string, Schema>    │
│ - Extract operations → Operation[]         │
│ - Extract security → SecurityScheme[]      │
│ - Extract tags → Tag[]                     │
│ - Extract servers → Server[]               │
└─────────────────┬───────────────────────────┘
                  │ ParseResult
                  ▼
┌─────────────────────────────────────────────┐
│ CLI Coordination Phase                      │
│ - Check output directory                   │
│ - Invoke generator functions               │
│ - Report progress                          │
│ - Handle errors                            │
└─────────────────┬───────────────────────────┘
                  │ Metadata
                  ▼
┌─────────────────────────────────────────────┐
│ Generation Phase                            │
│                                             │
│ 1. scaffoldProject()                        │
│    → package.json, tsconfig.json, README   │
│                                             │
│ 2. generateInterfaces(schemas)              │
│    → src/types.ts (TypeScript interfaces)  │
│                                             │
│ 3. generateToolDefinitions(operations)      │
│    → Tool[] (MCP tool objects)             │
│                                             │
│ 4. generateMainServerFile(tools)            │
│    → src/index.ts (server with registry)   │
│                                             │
│ 5. generateHttpClient(security)             │
│    → src/http-client.ts (API client)       │
└─────────────────┬───────────────────────────┘
                  │ Generated Files
                  ▼
┌─────────────────────────────────────────────┐
│ Output: Functional MCP Server               │
│                                             │
│ Structure:                                  │
│ ├── package.json                            │
│ ├── tsconfig.json                           │
│ ├── README.md                               │
│ └── src/                                    │
│     ├── index.ts      (server entry)        │
│     ├── types.ts      (220 interfaces)      │
│     ├── tools.ts      (39 tool definitions) │
│     └── http-client.ts (API client)         │
│                                             │
│ Capabilities:                               │
│ - npm install          ✅                   │
│ - npm run build        ✅                   │
│ - node dist/index.js   ✅                   │
│ - MCP protocol support ✅                   │
└─────────────────────────────────────────────┘
```

### File Modifications Required

#### Primary Changes

**File**: `packages/cli/src/commands/generate.ts`
- **Location**: Lines 386-456
- **Change Type**: Replace template copying with generator invocation
- **Lines Added**: ~150
- **Lines Removed**: ~70
- **Risk**: Low (well-isolated change)

**Before**:
```typescript
// Line 386
const templatePath = resolve(__dirname, '../../../packages/templates/hello-world');
await copyTemplate(templatePath, outputPath);
```

**After**:
```typescript
// Line 386
const {
  scaffoldProject,
  generateInterfaces,
  generateToolDefinitions,
  generateMainServerFile,
  generateHttpClient,
  writeFile
} = await import('@openapi-to-mcp/generator');

// ... ~140 lines of generation logic (see Story 5.1)
```

#### Supporting Changes

**File**: `packages/generator/src/index.ts`
- **Change**: Export `writeFile` utility function
- **Lines**: +2
- **Risk**: None

**File**: `packages/cli/tests/integration/generate.test.ts`
- **Change**: New file with integration tests
- **Lines**: +300
- **Risk**: None (test-only)

---

## Dependencies & Constraints

### Technical Dependencies

**Internal Dependencies**:
- ✅ `@openapi-to-mcp/parser` - Already working correctly
- ✅ `@openapi-to-mcp/generator` - All functions implemented
- ✅ `@openapi-to-mcp/cli` - Needs refactoring

**External Dependencies**:
- `@modelcontextprotocol/sdk` (already in package.json)
- `handlebars` (already in package.json)
- `zod` (already in package.json)
- No new dependencies required

### Build System

**Current**:
- TypeScript 5.7.2
- tsup for bundling
- ESM modules
- pnpm workspace monorepo

**Requirements**:
- No build system changes required
- Existing compilation pipeline works

### Environment Constraints

**Node.js**: >=18.0.0 (current requirement)
**TypeScript**: >=5.0.0 (current requirement)
**OS**: Cross-platform (macOS, Linux, Windows)
**Memory**: <500MB during generation
**Disk**: <50MB for generated output

---

## Risk Assessment & Mitigation

### Technical Risks

#### Risk 1: Generated Code Compilation Failures
**Probability**: Medium
**Impact**: High
**Mitigation**:
- Add TypeScript validation step before writing files
- Test with multiple OpenAPI specs (Ozon, Petstore, GitHub)
- Add integration test for `tsc --noEmit` validation
- Implement syntax checking with TypeScript API

**Fallback**: Revert to hello-world template if generation fails

#### Risk 2: Breaking Changes to Parser Interface
**Probability**: Low
**Impact**: Medium
**Mitigation**:
- Parser interface is stable (used successfully in current code)
- Add integration tests that validate parser output
- Version lock parser package during development

**Fallback**: Pin parser to known-good version

#### Risk 3: Performance Regression
**Probability**: Low
**Impact**: Low
**Mitigation**:
- Current parsing already handles 260KB specs efficiently
- Generator functions are synchronous and fast
- Add benchmark test (<30s for Ozon API)

**Fallback**: Add streaming/chunked generation if needed

### Process Risks

#### Risk 4: Incomplete Testing
**Probability**: Medium
**Impact**: High
**Mitigation**:
- Mandatory integration test coverage (Story 5.2)
- Test with real-world OpenAPI specs
- Manual QA with generated servers
- CI/CD enforcement of test passage

**Fallback**: Extended QA period before release

#### Risk 5: Documentation Drift
**Probability**: High
**Impact**: Medium
**Mitigation**:
- Documentation update is mandatory story (Story 5.4)
- Include examples in repository
- Validate tutorial with external tester
- Add CI check for documentation accuracy

**Fallback**: Community contributions for doc fixes

---

## Success Metrics

### Functional Metrics

**Generation Success Rate**:
- Target: 95% of valid OpenAPI 3.0 specs generate successfully
- Measurement: Integration test pass rate
- Baseline: 0% (current state)

**Tool Coverage**:
- Target: 100% of OpenAPI operations → MCP tools
- Measurement: `tool_count === operation_count`
- Baseline: 2.6% (1/39 for Ozon API)

**Type Coverage**:
- Target: 100% of schemas → TypeScript interfaces
- Measurement: `interface_count >= schema_count`
- Baseline: 0% (no types generated)

### Quality Metrics

**Generated Code Quality**:
- Target: 0 TypeScript errors in generated code
- Measurement: `tsc --noEmit` exit code
- Baseline: N/A (not generated)

**Server Functionality**:
- Target: Generated server starts and responds to MCP protocol
- Measurement: Integration test success
- Baseline: 0% (hello-world only)

### Performance Metrics

**Generation Time**:
- Target: <30 seconds for 260KB OpenAPI spec (39 tools)
- Measurement: End-to-end pipeline execution time
- Baseline: ~2 seconds (template copy only)

**Memory Usage**:
- Target: <500MB peak during generation
- Measurement: Node.js heap usage monitoring
- Baseline: ~50MB (template copy only)

### User Experience Metrics

**Documentation Accuracy**:
- Target: 100% match between docs and actual behavior
- Measurement: Manual validation checklist
- Baseline: 0% (docs describe non-existent behavior)

**Error Message Quality**:
- Target: 90% of errors include actionable fix suggestion
- Measurement: Error message review
- Baseline: 60% (generic errors)

---

## Testing Strategy

### Unit Tests

**Coverage Target**: 80% line coverage for modified code

**Key Test Areas**:
- Generator function invocation with parsed data
- Error handling for missing metadata
- File writing with correct paths
- Progress reporting accuracy

### Integration Tests

**Coverage Target**: 5 end-to-end scenarios

**Test Cases**:
1. **Ozon Performance API** (39 tools, 220 schemas)
   - Verify tool count
   - Verify type count
   - Verify compilation
   - Verify server startup

2. **Minimal OpenAPI Spec** (1 tool, 0 schemas)
   - Edge case: no schemas
   - Edge case: minimal metadata
   - Verify basic functionality

3. **Petstore API** (10 tools, 15 schemas)
   - Common reference spec
   - Verify standard patterns
   - Verify documentation generation

4. **GitHub API** (subset: 20 tools, 50 schemas)
   - Complex authentication
   - Nested schemas
   - Multiple security schemes

5. **Invalid Specs** (error cases)
   - Missing operationId
   - Invalid $ref pointers
   - Unsupported OpenAPI version

### Acceptance Testing

**Test Plan**:
1. Generate MCP server from Ozon Performance API
2. Build generated server (`npm install && npm run build`)
3. Start server (`node dist/index.js`)
4. Configure Claude Desktop with generated server
5. Invoke tools from Claude interface
6. Verify API calls succeed (with mock responses)

**Success Criteria**:
- All 6 steps complete without errors
- Tools appear in Claude tool list
- Tool invocation triggers HTTP client
- Error messages are user-friendly

---

## Rollout Plan

### Phase 1: Development (Days 1-2)

**Tasks**:
- Complete Story 5.1 (refactor CLI)
- Complete Story 5.2 (integration tests)
- Internal testing with Ozon API

**Gate**: All integration tests passing

### Phase 2: Validation (Day 2)

**Tasks**:
- Complete Story 5.3 (error handling)
- Manual QA with generated servers
- Performance benchmarking

**Gate**: QA signoff + benchmarks within targets

### Phase 3: Documentation (Day 3)

**Tasks**:
- Complete Story 5.4 (documentation)
- External tutorial validation
- Example server generation

**Gate**: Documentation review approved

### Phase 4: Release (Day 3)

**Tasks**:
- Merge to main branch
- Tag version v0.3.0
- Publish to npm
- Announce on GitHub

**Gate**: CI/CD green + npm publish success

---

## Acceptance Criteria (Epic Level)

### Functional Requirements

- [ ] **FR1**: CLI generates complete MCP server from Ozon Performance API (39 tools, 220 schemas)
- [ ] **FR2**: Generated server compiles without TypeScript errors (`tsc --noEmit` passes)
- [ ] **FR3**: Generated server starts and responds to MCP protocol (`initialize` request succeeds)
- [ ] **FR4**: Generated `package.json` contains correct dependencies and scripts
- [ ] **FR5**: Generated `README.md` includes API documentation and usage instructions
- [ ] **FR6**: All 5 generator functions invoked in correct order (scaffold → interfaces → tools → server → client)
- [ ] **FR7**: Progress reporting shows generation stages to user

### Quality Requirements

- [ ] **QR1**: Integration test suite with 5 end-to-end scenarios (all passing)
- [ ] **QR2**: Unit test coverage ≥80% for modified code
- [ ] **QR3**: Error messages include actionable fix suggestions (90%+ of cases)
- [ ] **QR4**: Generated code follows TypeScript best practices (ESLint passing)
- [ ] **QR5**: No hello-world template code in generated output (0 occurrences)

### Performance Requirements

- [ ] **PR1**: Generation time <30 seconds for 260KB OpenAPI spec (39 tools)
- [ ] **PR2**: Memory usage <500MB during generation
- [ ] **PR3**: Generated server startup time <3 seconds

### Documentation Requirements

- [ ] **DR1**: README.md accurately describes generation behavior (100% match)
- [ ] **DR2**: Tutorial "From OpenAPI to MCP in 5 minutes" validated by external tester
- [ ] **DR3**: Troubleshooting guide covers 10+ common issues
- [ ] **DR4**: Architecture diagram shows Parser → CLI → Generator flow
- [ ] **DR5**: Examples directory contains working Ozon MCP server

### Release Requirements

- [ ] **RR1**: All stories (5.1, 5.2, 5.3, 5.4) completed and merged
- [ ] **RR2**: CI/CD pipeline green (all tests passing)
- [ ] **RR3**: Version tagged as v0.3.0
- [ ] **RR4**: Published to npm registry
- [ ] **RR5**: Release notes published on GitHub

---

## Open Questions for Product Manager

1. **Priority Alignment**: Is fixing this blocker the #1 priority for v0.3.0 release?

2. **Scope Creep**: Should we include hello-world template deprecation in this Epic or separate issue?

3. **Breaking Changes**: Generated output structure will change significantly. Do we need migration guide for existing users?

4. **Performance**: Is 30-second generation time acceptable or should we target <10 seconds?

5. **Validation**: Should `--force` flag bypass ALL validation or only non-critical warnings?

6. **Templates**: Should we keep template system for future use or remove entirely?

7. **Examples**: Should generated Ozon server be committed to repository (large files) or in separate examples repo?

8. **Security**: Generated servers will need API credentials. Should we include `.env` template or rely on documentation?

9. **Testing**: Should acceptance testing include real API calls to Ozon Performance API or use mocks only?

10. **Release**: Can we release v0.3.0 with ONLY this fix or wait for other planned features?

---

## Appendix

### Referenced Files

**Primary Code Files**:
- `packages/cli/src/commands/generate.ts` - Main fix location
- `packages/generator/src/mcp-generator.ts` - Generator functions
- `packages/parser/src/index.ts` - Parser (working correctly)

**Test Files**:
- `packages/cli/tests/integration/generate.test.ts` - New integration tests

**Configuration Files**:
- `packages/cli/package.json` - Build configuration
- `packages/generator/package.json` - Build configuration

**Documentation Files**:
- `README.md` - Project overview
- `docs/guides/generation-pipeline.md` - New guide (to create)

### Related Epics

- **EPIC-001**: Project Repository Setup ✅ Completed
- **EPIC-002**: OpenAPI Parser Implementation ✅ Completed
- **EPIC-003**: MCP Generator Implementation ✅ Completed
- **EPIC-004**: CI/CD Pipeline ✅ Completed
- **EPIC-005**: Fix MCP Generation Pipeline ⬅️ **THIS EPIC**
- **EPIC-006**: OpenAPI 3.1 Support (future)
- **EPIC-007**: Custom Code Generation Options (future)

### Glossary

- **MCP**: Model Context Protocol - Protocol for AI tool integration
- **OpenAPI**: Specification format for REST APIs (formerly Swagger)
- **Tool**: MCP concept - callable function exposed to AI
- **Schema**: OpenAPI data structure definition
- **Operation**: OpenAPI endpoint definition (path + method)
- **Generation Pipeline**: Parser → CLI → Generator → Output
- **Hello-world Template**: Static stub used for scaffolding

---

**Document Version**: 1.0
**Last Updated**: 2025-01-06
**Author**: Technical Analysis Team
**Status**: Ready for PM Review
