# Story 5.2 Task Breakdown: Add End-to-End Integration Tests

**Story**: Story 5.2 - Add End-to-End Integration Tests
**Epic**: EPIC-005 - Fix MCP Generation Pipeline
**Total Effort**: 5 story points
**Estimated Time**: 8-10 hours

---

## Task Overview

| Task | Description | Effort | Dependencies |
|------|-------------|--------|--------------|
| 5.2.1 | Create test infrastructure and setup | 1 SP | Story 5.1 complete |
| 5.2.2 | Create test fixtures (OpenAPI specs) | 0.5 SP | None (parallel) |
| 5.2.3 | Implement Ozon API generation test | 1 SP | 5.2.1, 5.2.2 |
| 5.2.4 | Implement TypeScript compilation test | 0.5 SP | 5.2.3 |
| 5.2.5 | Implement server startup and MCP protocol test | 1 SP | 5.2.4 |
| 5.2.6 | Implement minimal spec edge case test | 0.5 SP | 5.2.3 |
| 5.2.7 | Implement error case tests | 0.5 SP | 5.2.3 |
| 5.2.8 | Integrate tests into CI/CD pipeline | 0.5 SP | 5.2.5 |

**Total**: 5 story points

---

## Task 5.2.1: Create Test Infrastructure and Setup

**Effort**: 1 story point (2 hours)
**Priority**: Critical (blocking)
**Dependencies**: Story 5.1 complete

### Description
Set up the integration test infrastructure with proper directory structure, test runner configuration, and reusable helper functions.

### Acceptance Criteria
- [ ] Test file created: `packages/cli/tests/integration/generate.test.ts`
- [ ] Test directories: `../fixtures/`, `../output/` configured
- [ ] Proper setup/teardown functions implemented
- [ ] Helper functions for common assertions
- [ ] Test runner configured to run integration tests

### Implementation Steps

1. **Create directory structure**:
   ```bash
   mkdir -p packages/cli/tests/integration
   mkdir -p packages/cli/tests/fixtures
   mkdir -p packages/cli/tests/output
   ```

2. **Create test file** `packages/cli/tests/integration/generate.test.ts`:
   ```typescript
   import { describe, test, expect, beforeEach, afterEach } from 'vitest';
   import { resolve } from 'path';
   import { execa } from 'execa';
   import fs from 'fs-extra';
   import { generateCommand } from '../../src/commands/generate';

   describe('MCP Server Generation Pipeline', () => {
     const fixturesDir = resolve(__dirname, '../fixtures');
     const outputDir = resolve(__dirname, '../output');

     beforeEach(async () => {
       // Ensure clean output directory before each test
       await fs.ensureDir(outputDir);
     });

     afterEach(async () => {
       // Cleanup generated files after each test
       await fs.remove(outputDir);
     });

     // Helper functions
     async function countToolsInFile(filePath: string): Promise<number> {
       const content = await fs.readFile(filePath, 'utf-8');
       const matches = content.match(/export const \w+Tool: Tool =/g);
       return matches ? matches.length : 0;
     }

     async function countInterfacesInFile(filePath: string): Promise<number> {
       const content = await fs.readFile(filePath, 'utf-8');
       const matches = content.match(/export interface \w+/g);
       return matches ? matches.length : 0;
     }

     async function verifyFileStructure(outputPath: string): Promise<void> {
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
         const exists = await fs.pathExists(resolve(outputPath, file));
         expect(exists).toBe(true);
       }
     }

     async function verifyNoHelloWorld(outputPath: string): Promise<void> {
       const srcFiles = await fs.readdir(resolve(outputPath, 'src'));
       for (const file of srcFiles) {
         const content = await fs.readFile(
           resolve(outputPath, 'src', file),
           'utf-8'
         );
         expect(content).not.toContain('hello-world (removed Story 6.3)');
         expect(content).not.toContain('exampleTool');
       }
     }

     // Tests will go here...
   });
   ```

3. **Update package.json** scripts:
   ```json
   {
     "scripts": {
       "test": "vitest run",
       "test:unit": "vitest run --testPathPattern=tests/unit",
       "test:integration": "vitest run --testPathPattern=tests/integration",
       "test:watch": "vitest watch"
     }
   }
   ```

4. **Install test dependencies** (if not already present):
   ```bash
   cd packages/cli
   pnpm add -D vitest execa fs-extra @types/fs-extra
   ```

5. **Create .gitignore** for test outputs:
   ```bash
   echo "packages/cli/tests/output/" >> .gitignore
   ```

### Testing
- [ ] Run `pnpm test:integration` (should find test file but have 0 tests)
- [ ] Verify fixtures and output directories created
- [ ] Verify beforeEach/afterEach work correctly
- [ ] Verify helper functions compile without errors

### Manual Test
```bash
cd packages/cli

# Run integration tests (should pass with 0 tests)
pnpm test:integration

# Verify test file is found
pnpm vitest list --testPathPattern=integration
# Should show: generate.test.ts
```

---

## Task 5.2.2: Create Test Fixtures (OpenAPI Specs)

**Effort**: 0.5 story points (1 hour)
**Priority**: Critical
**Dependencies**: None (can be done in parallel)

### Description
Create OpenAPI specification files to use as test fixtures, including real-world and edge case examples.

### Acceptance Criteria
- [ ] Ozon Performance API spec in fixtures
- [ ] Minimal valid OpenAPI spec created
- [ ] Petstore API spec added (optional)
- [ ] Invalid spec examples created (for error tests)
- [ ] All fixtures validated as proper JSON

### Implementation Steps

1. **Copy Ozon Performance API spec**:
   ```bash
   cp swagger/swagger.json packages/cli/tests/fixtures/ozon-performance-swagger.json
   ```

2. **Create minimal spec** `packages/cli/tests/fixtures/minimal-spec.json`:
   ```json
   {
     "openapi": "3.0.0",
     "info": {
       "title": "Minimal API",
       "version": "1.0.0",
       "description": "Minimal valid OpenAPI spec for testing"
     },
     "servers": [
       {
         "url": "https://api.example.com"
       }
     ],
     "paths": {
       "/test": {
         "get": {
           "operationId": "getTest",
           "summary": "Test endpoint",
           "description": "Simple test endpoint",
           "responses": {
             "200": {
               "description": "Success",
               "content": {
                 "application/json": {
                   "schema": {
                     "type": "object",
                     "properties": {
                       "message": { "type": "string" }
                     }
                   }
                 }
               }
             }
           }
         }
       }
     }
   }
   ```

3. **Create invalid spec** (missing operationId) `packages/cli/tests/fixtures/invalid-missing-operationid.json`:
   ```json
   {
     "openapi": "3.0.0",
     "info": {
       "title": "Invalid API",
       "version": "1.0.0"
     },
     "paths": {
       "/test": {
         "get": {
           "summary": "Test endpoint",
           "responses": {
             "200": { "description": "Success" }
           }
         }
       }
     }
   }
   ```

4. **Create unsupported version spec** `packages/cli/tests/fixtures/swagger-2.0.json`:
   ```json
   {
     "swagger": "2.0",
     "info": {
       "title": "Old API",
       "version": "1.0.0"
     },
     "paths": {}
   }
   ```

5. **Validate all fixtures**:
   ```bash
   # Install validator
   npm install -g @apidevtools/swagger-cli

   # Validate valid specs
   swagger-cli validate packages/cli/tests/fixtures/ozon-performance-swagger.json
   swagger-cli validate packages/cli/tests/fixtures/minimal-spec.json

   # Invalid specs should fail validation (expected)
   swagger-cli validate packages/cli/tests/fixtures/invalid-missing-operationid.json
   swagger-cli validate packages/cli/tests/fixtures/swagger-2.0.json
   ```

### Testing
- [ ] All fixture files exist
- [ ] Valid specs pass OpenAPI validation
- [ ] Invalid specs fail validation as expected
- [ ] Files are valid JSON syntax

### Manual Test
```bash
# Verify fixtures exist
ls -la packages/cli/tests/fixtures/
# Should show: ozon-performance-swagger.json, minimal-spec.json, etc.

# Verify JSON syntax
jq . packages/cli/tests/fixtures/minimal-spec.json
# Should output formatted JSON

# Check file sizes
du -h packages/cli/tests/fixtures/*
# Ozon should be ~260KB, minimal should be ~1KB
```

---

## Task 5.2.3: Implement Ozon API Generation Test

**Effort**: 1 story point (2 hours)
**Priority**: Critical
**Dependencies**: Task 5.2.1, 5.2.2

### Description
Implement comprehensive test that generates complete MCP server from Ozon Performance API and validates all outputs.

### Acceptance Criteria
- [ ] Test generates from 260KB OpenAPI spec
- [ ] Verifies exactly 39 tools generated
- [ ] Verifies 220+ interfaces generated
- [ ] Verifies package.json structure
- [ ] Verifies no hello-world remnants
- [ ] Test completes in <30 seconds

### Implementation Steps

1. **Add test to generate.test.ts**:
   ```typescript
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
     await verifyFileStructure(output);

     // Verify tool count
     const toolCount = await countToolsInFile(resolve(output, 'src/tools.ts'));
     expect(toolCount).toBe(39);

     // Verify types count
     const interfaceCount = await countInterfacesInFile(
       resolve(output, 'src/types.ts')
     );
     expect(interfaceCount).toBeGreaterThanOrEqual(220);

     // Verify package.json
     const pkg = await fs.readJSON(resolve(output, 'package.json'));
     expect(pkg.name).toContain('ozon-performance');
     expect(pkg.dependencies).toHaveProperty('@modelcontextprotocol/sdk');
     expect(pkg.scripts).toHaveProperty('build');
     expect(pkg.scripts).toHaveProperty('dev');

     // Verify no hello-world remnants
     await verifyNoHelloWorld(output);

     // Verify specific expected tools
     const toolsContent = await fs.readFile(
       resolve(output, 'src/tools.ts'),
       'utf-8'
     );
     expect(toolsContent).toContain('postBotsSendMessageTool');
     expect(toolsContent).toContain('postPerformanceReportsTool');

     // Verify specific expected types
     const typesContent = await fs.readFile(
       resolve(output, 'src/types.ts'),
       'utf-8'
     );
     expect(typesContent).toContain('BotSendMessageRequest');
     expect(typesContent).toContain('PerformanceReportRequest');
   }, 30000); // 30 second timeout
   ```

2. **Add detailed assertion messages**:
   ```typescript
   expect(toolCount).toBe(39);
   // becomes:
   expect(toolCount, `Expected 39 tools, got ${toolCount}`).toBe(39);
   ```

3. **Add performance logging**:
   ```typescript
   const startTime = Date.now();
   await generateCommand({ /* ... */ });
   const duration = Date.now() - startTime;
   console.log(`Generation completed in ${duration}ms`);
   expect(duration).toBeLessThan(30000); // <30s
   ```

### Testing
- [ ] Run test with `pnpm test:integration`
- [ ] Test passes consistently
- [ ] Test completes in <30 seconds
- [ ] All assertions pass

### Manual Test
```bash
cd packages/cli

# Run specific test
pnpm vitest run --testPathPattern=integration --grep="Ozon Performance API"

# Should output:
# ✓ generates complete MCP server from Ozon Performance API (15000ms)
```

---

## Task 5.2.4: Implement TypeScript Compilation Test

**Effort**: 0.5 story points (1 hour)
**Priority**: Critical
**Dependencies**: Task 5.2.3

### Description
Add test to verify that generated code compiles without TypeScript errors.

### Acceptance Criteria
- [ ] Test runs `tsc --noEmit` on generated code
- [ ] Verifies exit code is 0
- [ ] Captures and reports TypeScript errors
- [ ] Test passes for valid generation

### Implementation Steps

1. **Add compilation test**:
   ```typescript
   test('generated code compiles without TypeScript errors', async () => {
     const swaggerPath = resolve(fixturesDir, 'ozon-performance-swagger.json');
     const output = resolve(outputDir, 'ozon-mcp-server');

     // Generate server
     await generateCommand({ input: swaggerPath, output, force: true });

     // Run TypeScript compiler in check mode
     const { exitCode, stdout, stderr } = await execa(
       'npx',
       ['tsc', '--noEmit'],
       {
         cwd: output,
         reject: false,
       }
     );

     // If compilation failed, log errors for debugging
     if (exitCode !== 0) {
       console.error('TypeScript compilation errors:');
       console.error('STDOUT:', stdout);
       console.error('STDERR:', stderr);
     }

     expect(exitCode, 'TypeScript compilation should succeed').toBe(0);
   }, 20000); // 20 second timeout
   ```

2. **Add helper to check for common TS errors**:
   ```typescript
   function parseTypeScriptErrors(output: string): string[] {
     const errorRegex = /error TS\d+:/g;
     const matches = output.match(errorRegex);
     return matches || [];
   }
   ```

3. **Add error categorization**:
   ```typescript
   if (exitCode !== 0) {
     const errors = parseTypeScriptErrors(stderr);
     console.error(`Found ${errors.length} TypeScript errors`);

     // Categorize common errors
     const missingTypes = stderr.includes('Cannot find name');
     const syntaxErrors = stderr.includes('Expected');

     if (missingTypes) console.error('  - Missing type definitions');
     if (syntaxErrors) console.error('  - Syntax errors in generated code');
   }
   ```

### Testing
- [ ] Test passes for valid generation
- [ ] Test reports clear errors if compilation fails
- [ ] Error messages are helpful for debugging

### Manual Test
```bash
# Run compilation test
pnpm vitest run --testPathPattern=integration --grep="compiles without"

# Should pass with exit code 0
```

---

## Task 5.2.5: Implement Server Startup and MCP Protocol Test

**Effort**: 1 story point (2 hours)
**Priority**: High
**Dependencies**: Task 5.2.4

### Description
Add test that starts the generated MCP server and validates it responds to MCP protocol requests.

### Acceptance Criteria
- [ ] Test spawns generated server process
- [ ] Sends MCP `initialize` request via stdio
- [ ] Validates response structure
- [ ] Verifies server capabilities
- [ ] Properly terminates server process
- [ ] No process leaks

### Implementation Steps

1. **Add server startup test**:
   ```typescript
   test('generated server starts and responds to MCP protocol', async () => {
     const swaggerPath = resolve(fixturesDir, 'ozon-performance-swagger.json');
     const output = resolve(outputDir, 'ozon-mcp-server');

     // Generate server
     await generateCommand({ input: swaggerPath, output, force: true });

     // Install dependencies
     console.log('Installing dependencies...');
     await execa('npm', ['install', '--silent'], { cwd: output });

     // Build server
     console.log('Building server...');
     await execa('npm', ['run', 'build'], { cwd: output });

     // Verify build output exists
     const distExists = await fs.pathExists(resolve(output, 'dist/index.js'));
     expect(distExists).toBe(true);

     // Start server process
     console.log('Starting server...');
     const serverProcess = execa('node', ['dist/index.js'], {
       cwd: output,
       timeout: 10000,
     });

     try {
       // Send MCP initialize request
       const initializeRequest = {
         jsonrpc: '2.0',
         id: 1,
         method: 'initialize',
         params: {
           protocolVersion: '2024-11-05',
           capabilities: {},
           clientInfo: { name: 'test-client', version: '1.0.0' },
         },
       };

       serverProcess.stdin?.write(
         JSON.stringify(initializeRequest) + '\n'
       );

       // Wait for response
       const response = await new Promise((resolve, reject) => {
         const timeout = setTimeout(() => {
           reject(new Error('Server response timeout after 5s'));
         }, 5000);

         let buffer = '';
         serverProcess.stdout?.on('data', (data) => {
           buffer += data.toString();

           // Try to parse JSON response
           try {
             const lines = buffer.split('\n');
             for (const line of lines) {
               if (line.trim()) {
                 const json = JSON.parse(line);
                 if (json.id === 1) {
                   clearTimeout(timeout);
                   resolve(json);
                   return;
                 }
               }
             }
           } catch (e) {
             // Not complete JSON yet, keep buffering
           }
         });

         serverProcess.stderr?.on('data', (data) => {
           console.error('Server error:', data.toString());
         });
       });

       // Validate response structure
       expect(response).toHaveProperty('result');
       expect(response.result).toHaveProperty('capabilities');
       expect(response.result).toHaveProperty('serverInfo');
       expect(response.result.serverInfo).toHaveProperty('name');

       console.log('Server responded successfully:', response.result.serverInfo.name);
     } finally {
       // Cleanup: kill server process
       serverProcess.kill();
       await serverProcess.catch(() => {
         // Ignore kill errors
       });
     }
   }, 30000); // 30 second timeout
   ```

2. **Add helper for process cleanup**:
   ```typescript
   async function cleanupProcess(proc: any): Promise<void> {
     if (proc && !proc.killed) {
       proc.kill('SIGTERM');

       // Wait up to 2s for graceful shutdown
       await new Promise(resolve => setTimeout(resolve, 2000));

       if (!proc.killed) {
         proc.kill('SIGKILL');
       }
     }
   }
   ```

### Testing
- [ ] Server starts without errors
- [ ] Server responds to initialize request
- [ ] Response has correct structure
- [ ] Server process is properly terminated
- [ ] No zombie processes left behind

### Manual Test
```bash
# Run server startup test
pnpm vitest run --testPathPattern=integration --grep="server starts"

# Check for zombie processes after test
ps aux | grep "node.*index.js"
# Should not show any running servers
```

---

## Task 5.2.6: Implement Minimal Spec Edge Case Test

**Effort**: 0.5 story points (1 hour)
**Priority**: Medium
**Dependencies**: Task 5.2.3

### Description
Add test for edge case of minimal valid OpenAPI spec (1 operation, no schemas).

### Acceptance Criteria
- [ ] Test generates from minimal spec
- [ ] Verifies single tool generated
- [ ] Handles absence of complex types
- [ ] Generated code compiles
- [ ] Test passes consistently

### Implementation Steps

1. **Add minimal spec test**:
   ```typescript
   test('handles minimal valid OpenAPI spec', async () => {
     const specPath = resolve(fixturesDir, 'minimal-spec.json');
     const output = resolve(outputDir, 'minimal-server');

     // Generate from minimal spec
     await generateCommand({ input: specPath, output, force: true });

     // Verify basic structure
     await verifyFileStructure(output);

     // Verify single tool generated
     const toolCount = await countToolsInFile(resolve(output, 'src/tools.ts'));
     expect(toolCount).toBe(1);

     // Verify tool name
     const toolsContent = await fs.readFile(
       resolve(output, 'src/tools.ts'),
       'utf-8'
     );
     expect(toolsContent).toContain('getTestTool');

     // Verify types file exists (even if minimal)
     const typesExists = await fs.pathExists(resolve(output, 'src/types.ts'));
     expect(typesExists).toBe(true);

     // Verify package.json
     const pkg = await fs.readJSON(resolve(output, 'package.json'));
     expect(pkg.name).toContain('minimal');

     // Verify compilation
     const { exitCode } = await execa('npx', ['tsc', '--noEmit'], {
       cwd: output,
       reject: false,
     });
     expect(exitCode, 'Minimal spec should compile').toBe(0);
   }, 20000);
   ```

### Testing
- [ ] Test passes for minimal spec
- [ ] Single tool generated correctly
- [ ] No errors with minimal schema set
- [ ] Code compiles successfully

---

## Task 5.2.7: Implement Error Case Tests

**Effort**: 0.5 story points (1 hour)
**Priority**: Medium
**Dependencies**: Task 5.2.3

### Description
Add tests for invalid OpenAPI specifications to ensure proper error handling.

### Acceptance Criteria
- [ ] Test for missing operationId
- [ ] Test for unsupported OpenAPI version
- [ ] Tests throw appropriate errors
- [ ] Error messages are descriptive

### Implementation Steps

1. **Add missing operationId test**:
   ```typescript
   test('handles missing operationId gracefully', async () => {
     const specPath = resolve(fixturesDir, 'invalid-missing-operationid.json');
     const output = resolve(outputDir, 'invalid-server');

     // Should throw error about missing operationId
     await expect(
       generateCommand({ input: specPath, output, force: true })
     ).rejects.toThrow(/operationId/i);

     // Verify output directory was not created or was cleaned up
     const outputExists = await fs.pathExists(resolve(output, 'src'));
     expect(outputExists).toBe(false);
   });
   ```

2. **Add unsupported version test**:
   ```typescript
   test('handles unsupported OpenAPI version', async () => {
     const specPath = resolve(fixturesDir, 'swagger-2.0.json');
     const output = resolve(outputDir, 'unsupported-server');

     // Should throw error about OpenAPI version
     await expect(
       generateCommand({ input: specPath, output, force: true })
     ).rejects.toThrow(/OpenAPI 3\.0/i);

     // Verify cleanup
     const outputExists = await fs.pathExists(resolve(output, 'src'));
     expect(outputExists).toBe(false);
   });
   ```

3. **Add invalid file test**:
   ```typescript
   test('handles invalid JSON file', async () => {
     const specPath = resolve(outputDir, 'invalid.json');
     await fs.writeFile(specPath, '{ invalid json');

     const output = resolve(outputDir, 'invalid-json-server');

     await expect(
       generateCommand({ input: specPath, output, force: true })
     ).rejects.toThrow(/JSON/i);
   });
   ```

### Testing
- [ ] All error tests pass
- [ ] Errors have descriptive messages
- [ ] No partial output left behind

---

## Task 5.2.8: Integrate Tests into CI/CD Pipeline

**Effort**: 0.5 story points (1 hour)
**Priority**: High
**Dependencies**: Task 5.2.5

### Description
Add integration tests to CI/CD pipeline and ensure they run on every commit.

### Acceptance Criteria
- [ ] Tests run in GitHub Actions workflow
- [ ] Tests have appropriate timeout
- [ ] Test artifacts are cleaned up
- [ ] Failures block PR merge
- [ ] Test execution time tracked

### Implementation Steps

1. **Update `.github/workflows/test.yml`**:
   ```yaml
   name: Test

   on:
     push:
       branches: [main, develop]
     pull_request:
       branches: [main, develop]

   jobs:
     test:
       runs-on: ubuntu-latest

       steps:
         - uses: actions/checkout@v3

         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'

         - name: Install pnpm
           uses: pnpm/action-setup@v2
           with:
             version: 8

         - name: Install dependencies
           run: pnpm install

         - name: Run unit tests
           run: pnpm test:unit

         - name: Run integration tests
           run: pnpm test:integration
           timeout-minutes: 5

         - name: Cleanup test outputs
           if: always()
           run: |
             rm -rf packages/cli/tests/output
             rm -rf /tmp/test-*
   ```

2. **Add test script to root package.json**:
   ```json
   {
     "scripts": {
       "test": "pnpm -r test",
       "test:unit": "pnpm -r test:unit",
       "test:integration": "pnpm -r test:integration"
     }
   }
   ```

3. **Configure Vitest for CI**:
   ```typescript
   // vitest.config.ts
   export default {
     test: {
       globals: true,
       environment: 'node',
       testTimeout: 30000, // 30s default
       hookTimeout: 10000, // 10s for setup/teardown
       teardownTimeout: 5000,
     },
   };
   ```

### Testing
- [ ] Tests run successfully in CI
- [ ] Timeouts are appropriate
- [ ] Cleanup happens on success and failure
- [ ] Test results are reported clearly

### Manual Test
```bash
# Simulate CI environment
CI=true pnpm test:integration

# Check test execution time
time pnpm test:integration
# Should complete in <60 seconds
```

---

## Development Workflow

### Recommended Order
1. Task 5.2.1 - Set up infrastructure (critical foundation)
2. Task 5.2.2 - Create fixtures (parallel with 5.2.1)
3. Task 5.2.3 - Core Ozon API test (primary test case)
4. Task 5.2.4 - Compilation test (builds on 5.2.3)
5. Task 5.2.5 - Server startup test (most complex)
6. Task 5.2.6 - Minimal spec test (edge case)
7. Task 5.2.7 - Error tests (validation)
8. Task 5.2.8 - CI/CD integration (final polish)

### Testing Strategy
- **After 5.2.1**: Verify test infrastructure works
- **After 5.2.3**: First real test should pass
- **After 5.2.5**: Full server validation works
- **After 5.2.8**: CI pipeline runs all tests

### Commit Strategy
```bash
# Task 5.2.1
git commit -m "test(cli): add integration test infrastructure"

# Task 5.2.2
git commit -m "test(cli): add OpenAPI spec fixtures for testing"

# Task 5.2.3
git commit -m "test(cli): add Ozon API generation integration test"

# Task 5.2.4
git commit -m "test(cli): add TypeScript compilation validation test"

# Task 5.2.5
git commit -m "test(cli): add server startup and MCP protocol test"

# Task 5.2.6
git commit -m "test(cli): add minimal spec edge case test"

# Task 5.2.7
git commit -m "test(cli): add error handling validation tests"

# Task 5.2.8
git commit -m "ci: integrate integration tests into CI/CD pipeline"
```

### Definition of Done (All Tasks Complete)
- [ ] All 8 tasks completed
- [ ] 6+ integration tests passing
- [ ] Tests cover happy path, edge cases, and errors
- [ ] Tests run in <60 seconds total
- [ ] CI/CD pipeline runs tests automatically
- [ ] Test failures block PR merges
- [ ] No flaky tests (100% pass rate over 10 runs)
- [ ] Test output is clear and actionable

---

**Task Breakdown Version**: 1.0
**Created**: 2025-01-06
**Story Reference**: docs/stories/story-5.2-integration-tests.md
