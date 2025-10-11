# Story 5.3 Task Breakdown: Improve Error Handling and Validation

**Story**: Story 5.3 - Improve Error Handling and Validation
**Epic**: EPIC-005 - Fix MCP Generation Pipeline
**Total Effort**: 3 story points
**Estimated Time**: 5-6 hours

---

## Task Overview

| Task | Description | Effort | Dependencies |
|------|-------------|--------|--------------|
| 5.3.1 | Create validation utility module | 0.5 SP | Story 5.1 complete |
| 5.3.2 | Create progress reporting utility | 0.5 SP | None (parallel) |
| 5.3.3 | Implement atomic generation with rollback | 1 SP | 5.3.1, 5.3.2 |
| 5.3.4 | Add specific error handlers | 0.5 SP | 5.3.1 |
| 5.3.5 | Add debug mode and enhanced logging | 0.25 SP | 5.3.4 |
| 5.3.6 | Write tests for error handling | 0.25 SP | 5.3.3, 5.3.4 |

**Total**: 3 story points

---

## Task 5.3.1: Create Validation Utility Module

**Effort**: 0.5 story points (1 hour)
**Priority**: Critical (blocking)
**Dependencies**: Story 5.1 complete

### Description
Create a dedicated validation utility module with custom error types and validation functions.

### Acceptance Criteria
- [ ] `ValidationError` class created with suggestion and command fields
- [ ] `validateOutputDirectory()` function implemented
- [ ] `validateGeneratedCode()` function implemented
- [ ] All validation functions return meaningful errors
- [ ] Functions handle edge cases (missing dirs, permissions, etc.)

### Implementation Steps

1. **Create validation utility file** `packages/cli/src/utils/validation.ts`:
   ```typescript
   import fs from 'fs-extra';
   import { resolve } from 'path';

   /**
    * Custom error class for validation failures with actionable suggestions
    */
   export class ValidationError extends Error {
     constructor(
       message: string,
       public suggestion?: string,
       public command?: string
     ) {
       super(message);
       this.name = 'ValidationError';
       Error.captureStackTrace(this, ValidationError);
     }
   }

   /**
    * Validate output directory permissions and existence
    */
   export async function validateOutputDirectory(
     outputPath: string,
     force: boolean
   ): Promise<void> {
     const absolutePath = resolve(outputPath);

     // Check if directory exists
     const exists = await fs.pathExists(absolutePath);

     if (exists && !force) {
       throw new ValidationError(
         `Output directory already exists: ${absolutePath}`,
         'Use --force flag to overwrite existing directory',
         `${process.argv.slice(0, 3).join(' ')} --force`
       );
     }

     if (exists) {
       // Check write permissions on existing directory
       try {
         await fs.access(absolutePath, fs.constants.W_OK);
       } catch (error) {
         throw new ValidationError(
           `Output directory is not writable: ${absolutePath}`,
           'Check directory permissions or use --output with writable path',
           `chmod 755 ${absolutePath}`
         );
       }
     } else {
       // Check parent directory exists and is writable
       const parentDir = resolve(absolutePath, '..');
       const parentExists = await fs.pathExists(parentDir);

       if (!parentExists) {
         throw new ValidationError(
           `Parent directory does not exist: ${parentDir}`,
           'Create parent directory first',
           `mkdir -p ${parentDir}`
         );
       }

       try {
         await fs.access(parentDir, fs.constants.W_OK);
       } catch (error) {
         throw new ValidationError(
           `Parent directory is not writable: ${parentDir}`,
           'Check directory permissions',
           `chmod 755 ${parentDir}`
         );
       }
     }
   }

   /**
    * Validate generated code structure and syntax
    */
   export async function validateGeneratedCode(
     outputPath: string
   ): Promise<{ valid: boolean; errors: string[] }> {
     const errors: string[] = [];

     // Check all required files exist
     const requiredFiles = [
       'src/index.ts',
       'src/types.ts',
       'src/tools.ts',
       'src/http-client.ts',
       'package.json',
       'tsconfig.json',
     ];

     for (const file of requiredFiles) {
       const filePath = resolve(outputPath, file);
       const exists = await fs.pathExists(filePath);
       if (!exists) {
         errors.push(`Missing required file: ${file}`);
       }
     }

     if (errors.length > 0) {
       return { valid: false, errors };
     }

     // Basic syntax validation on generated TypeScript files
     try {
       const indexContent = await fs.readFile(
         resolve(outputPath, 'src/index.ts'),
         'utf-8'
       );

       // Check for obvious syntax issues
       if (indexContent.length < 100) {
         errors.push('Generated index.ts appears incomplete');
       }

       // Check for unresolved template variables
       if (indexContent.includes('{{') || indexContent.includes('}}')) {
         errors.push('Generated code contains unresolved template variables');
       }
     } catch (error) {
       errors.push(`Failed to read generated files: ${error.message}`);
     }

     return { valid: errors.length === 0, errors };
   }
   ```

2. **Add type definitions** if needed:
   ```typescript
   export interface ValidationResult {
     valid: boolean;
     errors: string[];
   }
   ```

3. **Add unit tests** `packages/cli/tests/unit/utils/validation.test.ts`:
   ```typescript
   import { describe, test, expect, beforeEach, afterEach } from 'vitest';
   import fs from 'fs-extra';
   import { validateOutputDirectory, ValidationError } from '../../../src/utils/validation';

   describe('validateOutputDirectory', () => {
     const testDir = '/tmp/validation-test';

     afterEach(async () => {
       await fs.remove(testDir);
     });

     test('throws error if directory exists without force', async () => {
       await fs.ensureDir(testDir);

       await expect(
         validateOutputDirectory(testDir, false)
       ).rejects.toThrow(ValidationError);
     });

     test('succeeds if directory exists with force', async () => {
       await fs.ensureDir(testDir);

       await expect(
         validateOutputDirectory(testDir, true)
       ).resolves.not.toThrow();
     });

     test('succeeds if directory does not exist', async () => {
       await expect(
         validateOutputDirectory(testDir, false)
       ).resolves.not.toThrow();
     });

     test('includes suggestion in error', async () => {
       await fs.ensureDir(testDir);

       try {
         await validateOutputDirectory(testDir, false);
       } catch (error) {
         expect(error).toBeInstanceOf(ValidationError);
         expect(error.suggestion).toContain('--force');
       }
     });
   });
   ```

### Testing
- [ ] ValidationError class works correctly
- [ ] validateOutputDirectory handles all cases
- [ ] validateGeneratedCode detects missing files
- [ ] Unit tests pass

### Manual Test
```bash
# Run validation tests
cd packages/cli
pnpm test:unit -- validation.test.ts
```

---

## Task 5.3.2: Create Progress Reporting Utility

**Effort**: 0.5 story points (1 hour)
**Priority**: High
**Dependencies**: None (can be done in parallel)

### Description
Create a progress reporting utility that shows generation progress in interactive terminals.

### Acceptance Criteria
- [ ] `ProgressReporter` class created
- [ ] Detects if stdout is TTY (interactive)
- [ ] Shows progress bar in TTY mode
- [ ] Silent in non-TTY (CI/CD) environments
- [ ] Supports stage updates
- [ ] Clean completion and cleanup

### Implementation Steps

1. **Install dependency**:
   ```bash
   cd packages/cli
   pnpm add cli-progress
   pnpm add -D @types/cli-progress
   ```

2. **Create progress utility** `packages/cli/src/utils/progress.ts`:
   ```typescript
   import cliProgress from 'cli-progress';

   export class ProgressReporter {
     private progressBar: cliProgress.SingleBar | null = null;
     private isTTY: boolean;
     private currentStage: string = '';
     private currentValue: number = 0;
     private totalValue: number = 0;

     constructor() {
       // Only show progress bar in interactive terminals
       this.isTTY = process.stdout.isTTY || false;
     }

     /**
      * Start progress reporting
      */
     start(totalItems: number, initialStage: string = 'Starting...'): void {
       if (!this.isTTY) return;

       this.totalValue = totalItems;
       this.currentStage = initialStage;

       this.progressBar = new cliProgress.SingleBar(
         {
           format: 'Progress [{bar}] {percentage}% | {stage}',
           barCompleteChar: '\u2588',
           barIncompleteChar: '\u2591',
           hideCursor: true,
           clearOnComplete: false,
           stopOnComplete: true,
         },
         cliProgress.Presets.shades_classic
       );

       this.progressBar.start(totalItems, 0, { stage: initialStage });
     }

     /**
      * Update progress
      */
     update(current: number, stage: string): void {
       if (!this.isTTY || !this.progressBar) return;

       this.currentValue = current;
       this.currentStage = stage;
       this.progressBar.update(current, { stage });
     }

     /**
      * Increment progress by 1
      */
     increment(stage?: string): void {
       const newValue = this.currentValue + 1;
       this.update(newValue, stage || this.currentStage);
     }

     /**
      * Complete and stop progress bar
      */
     complete(): void {
       if (!this.isTTY || !this.progressBar) return;

       this.progressBar.update(this.totalValue, { stage: 'Complete' });
       this.progressBar.stop();
     }

     /**
      * Stop progress bar (on error)
      */
     stop(): void {
       if (!this.isTTY || !this.progressBar) return;

       this.progressBar.stop();
     }

     /**
      * Check if running in TTY mode
      */
     isInteractive(): boolean {
       return this.isTTY;
     }
   }
   ```

3. **Add example usage documentation**:
   ```typescript
   /**
    * Example usage:
    *
    * const progress = new ProgressReporter();
    * progress.start(100, 'Parsing...');
    *
    * for (let i = 0; i < 100; i++) {
    *   // Do work
    *   progress.update(i + 1, `Processing item ${i}`);
    * }
    *
    * progress.complete();
    */
   ```

### Testing
- [ ] Progress bar shows in interactive terminal
- [ ] Silent in CI/CD environment
- [ ] Updates work correctly
- [ ] Complete cleans up properly

### Manual Test
```bash
# Create test script
cat > /tmp/test-progress.ts << 'EOF'
import { ProgressReporter } from './src/utils/progress';

const progress = new ProgressReporter();
progress.start(50, 'Starting...');

for (let i = 0; i < 50; i++) {
  await new Promise(resolve => setTimeout(resolve, 50));
  progress.update(i + 1, `Processing ${i + 1}/50`);
}

progress.complete();
console.log('Done!');
EOF

# Run in interactive terminal
npx tsx /tmp/test-progress.ts
# Should show progress bar

# Run in non-TTY
npx tsx /tmp/test-progress.ts < /dev/null
# Should be silent
```

---

## Task 5.3.3: Implement Atomic Generation with Rollback

**Effort**: 1 story point (2 hours)
**Priority**: Critical
**Dependencies**: Task 5.3.1, 5.3.2

### Description
Refactor generation to use temporary directory and atomic move, with rollback on failure.

### Acceptance Criteria
- [ ] Generation uses `.tmp-generation` temporary directory
- [ ] All files written to temp location first
- [ ] Atomic move to final location on success
- [ ] Temp directory cleaned up on failure
- [ ] Progress reported during generation
- [ ] Original directory unchanged if error occurs

### Implementation Steps

1. **Refactor generate command** to use atomic generation:
   ```typescript
   // In packages/cli/src/commands/generate.ts

   import { validateOutputDirectory, validateGeneratedCode, ValidationError } from '../utils/validation';
   import { ProgressReporter } from '../utils/progress';

   async function generateWithRollback(
     outputPath: string,
     options: GenerateOptions,
     parseResult: ParseResult,
     // ... other parsed data
   ): Promise<void> {
     const tempDir = resolve(outputPath + '.tmp-generation');
     const progress = new ProgressReporter();

     try {
       // Pre-generation validation
       logger.info('⚙️  Validating output directory...');
       await validateOutputDirectory(outputPath, options.force || false);

       // Calculate total items for progress
       const totalItems =
         1 + // parsing (already done)
         1 + // scaffolding
         schemaMap.size + // interfaces
         operations.length + // tools
         2 + // server files
         1; // validation

       progress.start(totalItems, 'Parsing complete');
       let current = 1;

       // Ensure clean temp directory
       await fs.remove(tempDir);
       await fs.ensureDir(tempDir);

       // Stage 1: Scaffold project
       progress.update(++current, 'Scaffolding project...');
       await scaffoldProject({
         outputDir: tempDir, // Write to temp directory
         // ... other options
       });

       // Stage 2: Generate interfaces
       logger.info('🔧 Generating TypeScript interfaces...');
       const schemaRecord: Record<string, NormalizedSchema> = {};
       schemaMap.forEach((schema, name) => {
         schemaRecord[name] = schema;
       });

       const interfaceResult = generateInterfaces(schemaRecord, {
         includeComments: true,
         includeExamples: false,
         exportAll: true,
       });

       const typesFilePath = resolve(tempDir, 'src/types.ts');
       await fs.ensureDir(resolve(tempDir, 'src'));
       await writeFile(typesFilePath, interfaceResult.code);

       progress.update(current + schemaMap.size, 'Interfaces generated');
       current += schemaMap.size;

       // Stage 3: Generate tools
       logger.info('🔧 Generating MCP tools...');
       const toolResult = generateToolDefinitions(operations, {
         includeTags: true,
         includeSecurity: true,
         generateExecuteCode: true,
       });

       const toolsCode = generateToolsFile(toolResult.tools);
       const toolsFilePath = resolve(tempDir, 'src/tools.ts');
       await writeFile(toolsFilePath, toolsCode);

       progress.update(current + operations.length, 'Tools generated');
       current += operations.length;

       // Stage 4: Generate server files
       progress.update(++current, 'Generating server files...');

       const serverCode = await generateMainServerFile({
         apiName: result.document.info.title,
         toolCount: toolResult.tools.length,
         securitySchemes: securityResult.schemes,
       });
       await writeFile(resolve(tempDir, 'src/index.ts'), serverCode);

       const clientCode = await generateHttpClient({
         baseURL: serverResult.defaultServer.baseURL,
         securitySchemes: securityResult.schemes,
       });
       await writeFile(resolve(tempDir, 'src/http-client.ts'), clientCode);

       progress.update(++current, 'Server files generated');

       // Stage 5: Validation
       progress.update(++current, 'Validating generated code...');
       const validation = await validateGeneratedCode(tempDir);

       if (!validation.valid) {
         throw new ValidationError(
           'Generated code validation failed',
           'Check OpenAPI specification for issues',
           validation.errors.join('\n')
         );
       }

       progress.complete();

       // Atomic move to final location
       logger.info('📦 Finalizing generation...');
       await fs.move(tempDir, outputPath, { overwrite: options.force || false });

       logger.success(`✅ MCP server generated successfully at ${outputPath}`);
       logger.info(`📊 Generated ${toolResult.tools.length} tools from ${operations.length} operations`);
       logger.info(`📦 Generated ${interfaceResult.interfaceCount} TypeScript interfaces`);

     } catch (error) {
       progress.stop();

       // Cleanup temporary directory on failure
       await fs.remove(tempDir).catch(() => {
         // Ignore cleanup errors
       });

       // Re-throw for upper error handling
       throw error;
     }
   }
   ```

2. **Update main generate command** to use new function:
   ```typescript
   export async function generateCommand(options: GenerateOptions): Promise<void> {
     try {
       // ... parsing logic (existing)

       // Replace direct generation with atomic generation
       await generateWithRollback(
         outputPath,
         options,
         result,
         schemaMap,
         operations,
         // ... other parsed data
       );

     } catch (error) {
       if (error instanceof ValidationError) {
         logger.error(`❌ ${error.message}`);
         if (error.suggestion) {
           logger.info(`💡 Suggestion: ${error.suggestion}`);
         }
         if (error.command) {
           logger.info(`   Run: ${error.command}`);
         }
       } else {
         logger.error(`❌ Generation failed: ${error.message}`);
         logger.info('💡 Use --debug flag for detailed error information');
       }

       process.exit(1);
     }
   }
   ```

### Testing
- [ ] Temp directory created during generation
- [ ] Files written to temp directory first
- [ ] Atomic move works on success
- [ ] Temp directory cleaned up on failure
- [ ] Progress bar shows during generation

### Manual Test
```bash
# Test successful generation
generate swagger.json --output /tmp/test-server --force

# Verify no temp directory left behind
ls /tmp/test-server.tmp-generation
# Should not exist

# Test failed generation (invalid spec)
generate invalid-spec.json --output /tmp/test-fail

# Verify temp directory cleaned up
ls /tmp/test-fail.tmp-generation
# Should not exist
```

---

## Task 5.3.4: Add Specific Error Handlers

**Effort**: 0.5 story points (1 hour)
**Priority**: High
**Dependencies**: Task 5.3.1

### Description
Add specific error handlers for common failure scenarios with actionable messages.

### Acceptance Criteria
- [ ] Parser errors handled with context
- [ ] File system errors handled with suggestions
- [ ] Network errors handled gracefully
- [ ] All errors provide actionable guidance
- [ ] Error messages tested

### Implementation Steps

1. **Create error handler utilities** in `packages/cli/src/utils/error-handlers.ts`:
   ```typescript
   import { ValidationError } from './validation';

   /**
    * Handle parser errors with user-friendly context
    */
   export function handleParserError(error: Error): never {
     if (error.message.includes('Invalid OpenAPI version')) {
       throw new ValidationError(
         'Unsupported OpenAPI version detected',
         'This tool supports OpenAPI 3.0.x specifications',
         'Convert your spec to OpenAPI 3.0: https://swagger.io/tools/swagger-converter/'
       );
     }

     if (error.message.includes('Missing operationId')) {
       throw new ValidationError(
         'OpenAPI operations must have unique operationId',
         'Add operationId to each operation in your spec',
         'See: https://swagger.io/specification/#operation-object'
       );
     }

     if (error.message.includes('$ref') || error.message.includes('reference')) {
       throw new ValidationError(
         'Failed to resolve schema reference in OpenAPI spec',
         'Check that all $ref pointers are valid',
         'Validate spec: swagger-cli validate your-spec.json'
       );
     }

     // Generic parser error
     throw new ValidationError(
       `OpenAPI parsing failed: ${error.message}`,
       'Validate your OpenAPI specification',
       'Use: swagger-cli validate your-spec.json'
     );
   }

   /**
    * Handle file system errors with actionable context
    */
   export function handleFileSystemError(
     error: NodeJS.ErrnoException,
     path: string
   ): never {
     switch (error.code) {
       case 'EACCES':
         throw new ValidationError(
           `Permission denied: ${path}`,
           'Check file/directory permissions',
           `chmod 755 ${path}`
         );

       case 'ENOENT':
         throw new ValidationError(
           `Path does not exist: ${path}`,
           'Verify the path is correct',
           `ls -la ${path}`
         );

       case 'ENOSPC':
         throw new ValidationError(
           'No space left on device',
           'Free up disk space or use different output directory',
           'df -h'
         );

       case 'EMFILE':
       case 'ENFILE':
         throw new ValidationError(
           'Too many open files',
           'Increase system file descriptor limit',
           'ulimit -n 4096'
         );

       case 'EISDIR':
         throw new ValidationError(
           `Expected file but found directory: ${path}`,
           'Check that the path points to a file',
           `ls -la ${path}`
         );

       default:
         throw new ValidationError(
           `File system error: ${error.message}`,
           'Check system logs for details',
           error.code ? `Error code: ${error.code}` : undefined
         );
     }
   }

   /**
    * Handle network/fetch errors
    */
   export function handleNetworkError(error: Error, url?: string): never {
     if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
       throw new ValidationError(
         'Network connection failed',
         url ? `Cannot reach: ${url}` : 'Check network connection',
         'Verify internet connection or use local file'
       );
     }

     if (error.message.includes('timeout')) {
       throw new ValidationError(
         'Request timeout',
         'Network request took too long',
         'Try again or use local file'
       );
     }

     throw new ValidationError(
       `Network error: ${error.message}`,
       'Check network connection',
       url || undefined
     );
   }
   ```

2. **Integrate error handlers** into generate command:
   ```typescript
   // In generate.ts
   import { handleParserError, handleFileSystemError, handleNetworkError } from '../utils/error-handlers';

   try {
     // Parser operations
     const result = await loadOpenAPIDocument(input);
   } catch (error) {
     handleParserError(error);
   }

   try {
     // File operations
     await fs.writeFile(path, content);
   } catch (error) {
     handleFileSystemError(error, path);
   }
   ```

### Testing
- [ ] Parser errors provide helpful messages
- [ ] File system errors include fix commands
- [ ] Network errors handled gracefully
- [ ] Error messages are user-friendly

---

## Task 5.3.5: Add Debug Mode and Enhanced Logging

**Effort**: 0.25 story points (30 minutes)
**Priority**: Medium
**Dependencies**: Task 5.3.4

### Description
Add `--debug` flag support for detailed error information and stack traces.

### Acceptance Criteria
- [ ] `--debug` flag added to CLI options
- [ ] Debug mode shows full stack traces
- [ ] Debug mode logs additional context
- [ ] Normal mode hides technical details
- [ ] Debug output is well-formatted

### Implementation Steps

1. **Add debug option** to CLI:
   ```typescript
   // In packages/cli/src/commands/generate.ts
   interface GenerateOptions {
     input: string;
     output: string;
     force?: boolean;
     debug?: boolean; // Add debug flag
     // ... other options
   }
   ```

2. **Add debug logging**:
   ```typescript
   export async function generateCommand(options: GenerateOptions): Promise<void> {
     try {
       // ... generation logic
     } catch (error) {
       if (options.debug) {
         // Full debug output
         console.error('\n=== DEBUG INFORMATION ===');
         console.error('Error Name:', error.name);
         console.error('Error Message:', error.message);
         console.error('Stack Trace:', error.stack);
         console.error('\nOptions:', JSON.stringify(options, null, 2));
         console.error('\nEnvironment:');
         console.error('  Node Version:', process.version);
         console.error('  Platform:', process.platform);
         console.error('  CWD:', process.cwd());
         console.error('========================\n');
       }

       // Standard error handling
       if (error instanceof ValidationError) {
         logger.error(`❌ ${error.message}`);
         if (error.suggestion) {
           logger.info(`💡 Suggestion: ${error.suggestion}`);
         }
         if (error.command) {
           logger.info(`   Run: ${error.command}`);
         }
       } else {
         logger.error(`❌ Generation failed: ${error.message}`);
         if (!options.debug) {
           logger.info('💡 Use --debug flag for detailed error information');
         }
       }

       process.exit(1);
     }
   }
   ```

3. **Update CLI definition** to accept --debug:
   ```typescript
   // In CLI command definition
   .option('--debug', 'Enable debug mode with detailed error information')
   ```

### Testing
- [ ] --debug flag works
- [ ] Debug output shows full details
- [ ] Normal mode hides stack traces
- [ ] Debug output is readable

### Manual Test
```bash
# Without debug
generate invalid-spec.json --output /tmp/test
# Should show friendly error

# With debug
generate invalid-spec.json --output /tmp/test --debug
# Should show stack trace and context
```

---

## Task 5.3.6: Write Tests for Error Handling

**Effort**: 0.25 story points (30 minutes)
**Priority**: Medium
**Dependencies**: Task 5.3.3, 5.3.4

### Description
Add integration tests to verify error handling and rollback behavior.

### Acceptance Criteria
- [ ] Test for permission denied scenario
- [ ] Test for invalid spec scenario
- [ ] Test for temp directory cleanup
- [ ] Test for validation failure
- [ ] All error tests pass

### Implementation Steps

1. **Add error handling tests** to `packages/cli/tests/integration/error-handling.test.ts`:
   ```typescript
   import { describe, test, expect, afterEach } from 'vitest';
   import fs from 'fs-extra';
   import { resolve } from 'path';
   import { generateCommand } from '../../src/commands/generate';
   import { ValidationError } from '../../src/utils/validation';

   describe('Error Handling and Validation', () => {
     afterEach(async () => {
       // Cleanup test directories
       await fs.remove('/tmp/test-error-handling');
     });

     test('cleans up temp directory on generation failure', async () => {
       const output = '/tmp/test-error-handling/output';
       const tempDir = output + '.tmp-generation';

       // Create invalid spec
       const invalidSpec = resolve(__dirname, '../fixtures/invalid-spec.json');

       // Trigger generation failure
       await expect(
         generateCommand({
           input: invalidSpec,
           output,
           force: true,
         })
       ).rejects.toThrow();

       // Verify temp directory was cleaned up
       const tempExists = await fs.pathExists(tempDir);
       expect(tempExists).toBe(false);
     });

     test('provides actionable error for permission denied', async () => {
       const readonlyDir = '/tmp/test-error-handling/readonly';
       await fs.ensureDir(readonlyDir);
       await fs.chmod(readonlyDir, 0o444);

       try {
         await generateCommand({
           input: 'swagger.json',
           output: `${readonlyDir}/server`,
           force: true,
         });

         // Should not reach here
         expect(true).toBe(false);
       } catch (error) {
         expect(error).toBeInstanceOf(ValidationError);
         expect(error.message).toContain('not writable');
         expect(error.suggestion).toBeTruthy();
         expect(error.command).toContain('chmod');
       } finally {
         await fs.chmod(readonlyDir, 0o755);
       }
     });

     test('handles invalid OpenAPI spec gracefully', async () => {
       const invalidSpec = resolve(__dirname, '../fixtures/invalid-missing-operationid.json');
       const output = '/tmp/test-error-handling/invalid-output';

       await expect(
         generateCommand({
           input: invalidSpec,
           output,
           force: true,
         })
       ).rejects.toThrow(/operationId/i);

       // Verify no output created
       const outputExists = await fs.pathExists(output);
       expect(outputExists).toBe(false);
     });

     test('validates generated code before finalizing', async () => {
       // This test would require mocking generator to produce invalid output
       // Implementation depends on testing strategy
     });
   });
   ```

### Testing
- [ ] All error tests pass
- [ ] Temp cleanup verified
- [ ] Error messages validated
- [ ] Tests run reliably

---

## Development Workflow

### Recommended Order
1. Task 5.3.1 - Validation utilities (foundation)
2. Task 5.3.2 - Progress reporting (parallel)
3. Task 5.3.3 - Atomic generation (core feature)
4. Task 5.3.4 - Error handlers (polish)
5. Task 5.3.5 - Debug mode (enhancement)
6. Task 5.3.6 - Error tests (validation)

### Testing Strategy
- **After 5.3.1**: Unit tests for validation
- **After 5.3.3**: Integration test for rollback
- **After 5.3.4**: Error message review
- **After 5.3.6**: Full error handling coverage

### Commit Strategy
```bash
git commit -m "feat(cli): add validation utilities with custom error types"
git commit -m "feat(cli): add progress reporting for generation"
git commit -m "feat(cli): implement atomic generation with rollback"
git commit -m "feat(cli): add specific error handlers with suggestions"
git commit -m "feat(cli): add debug mode for detailed error output"
git commit -m "test(cli): add error handling integration tests"
```

### Definition of Done
- [ ] All 6 tasks completed
- [ ] Validation catches errors early
- [ ] Progress shows during generation
- [ ] Rollback works on failure
- [ ] Error messages are actionable
- [ ] Debug mode provides details
- [ ] All tests pass

---

**Task Breakdown Version**: 1.0
**Created**: 2025-01-06
**Story Reference**: docs/stories/story-5.3-error-handling.md
