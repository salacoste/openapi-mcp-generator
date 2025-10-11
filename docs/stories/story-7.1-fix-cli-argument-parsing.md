# Story 7.1: Fix CLI Argument Parsing

**Epic**: Epic 7 - CLI Wrapper Bug Fix
**Status**: PLANNED
**Priority**: P0 (Critical)
**Effort**: 2-4 hours
**Created**: 2025-10-08

## User Story

**As a** developer using the OpenAPI-to-MCP CLI
**I want** to generate MCP servers using command-line arguments
**So that** I can quickly create servers without writing code

## Current Problem

### Symptom
```bash
$ node packages/cli/dist/index.js generate \
    packages/generator/__tests__/fixtures/minimal-api.json \
    --output test-output/minimal-mcp-server \
    --force

❌ Path is not a file:
```

### Analysis
1. **Error Location**: `packages/cli/src/commands/generate.ts:516`
2. **Root Cause**: `openapiPath` argument becomes empty string
3. **Impact**: 100% CLI failure rate
4. **Workaround**: Use programmatic API (not acceptable for CLI users)

### Evidence
```typescript
// Current code that fails
.action(async (openapiPath: string, options: GenerateOptions) => {
  // ... validation logic ...
  const stats = statSync(resolvedPath);
  if (!stats.isFile()) {
    throw new ValidationError(`Path is not a file: ${openapiPath}`);
    // openapiPath is "" here - this is the bug!
  }
})
```

## Acceptance Criteria

### Functional Requirements
- [ ] **AC1**: CLI accepts file path as first positional argument
  ```bash
  openapi-to-mcp generate ./api.json --output ./server
  ✅ Should work
  ```

- [ ] **AC2**: CLI works with relative paths
  ```bash
  openapi-to-mcp generate ../specs/api.yaml -o ./output
  ✅ Should work
  ```

- [ ] **AC3**: CLI works with absolute paths
  ```bash
  openapi-to-mcp generate /Users/dev/specs/api.json -o ./output
  ✅ Should work
  ```

- [ ] **AC4**: CLI works with tilde paths (macOS/Linux)
  ```bash
  openapi-to-mcp generate ~/specs/api.json -o ./output
  ✅ Should work
  ```

- [ ] **AC5**: Argument values preserved through entire execution
  ```typescript
  // Debug output should show:
  // openapiPath: "packages/generator/__tests__/fixtures/minimal-api.json"
  // NOT: openapiPath: ""
  ```

### Quality Requirements
- [ ] **AC6**: Error messages show full file path
- [ ] **AC7**: Debug mode traces argument flow
- [ ] **AC8**: No regressions in core generator (994/1005 tests still passing)

### Edge Cases
- [ ] **AC9**: Handle paths with spaces
  ```bash
  openapi-to-mcp generate "path with spaces/api.json" -o ./output
  ```

- [ ] **AC10**: Handle paths with special characters
  ```bash
  openapi-to-mcp generate "./specs/api-v2.0.json" -o ./output
  ```

## Technical Design

### Investigation Findings

**Commander.js Action Handler Signature**:
```typescript
.action(async (openapiPath: string, options: GenerateOptions) => {
  // openapiPath should be first positional argument
  // options should be parsed flags
})
```

**Problem Hypothesis**:
1. ✅ Commander.js is parsing correctly (evidence: help text works)
2. ❌ Argument is lost during rollback mechanism
3. ❌ Error occurs in catch block where original context is lost
4. ❌ ValidationError thrown after rollback clears temp directory

### Root Cause

**File**: `packages/cli/src/commands/generate.ts`

**Current Flow**:
```typescript
.action(async (openapiPath: string, options: GenerateOptions) => {
  try {
    // 1. Argument received correctly
    const resolvedPath = resolve(openapiPath); // ✅ Works

    // 2. Validation happens
    const stats = statSync(resolvedPath); // ✅ Works

    // 3. Generation starts with temp directory
    const tempDir = join(tmpdir(), `.tmp-generation-${Date.now()}`);

    // 4. Generation fails (e.g., template issue)
    // throw new Error("Generated code contains unresolved template variables");

    // 5. Rollback happens
    await remove(tempDir);

    // 6. ERROR: Somehow openapiPath becomes empty here
    // throw new ValidationError(`Path is not a file: ${openapiPath}`);
    //                                                   ^^^ empty!
  } catch (error) {
    // Error handler loses original context
  }
})
```

**Suspected Issue**: Variable scope or async/await issue in error handling

### Solution Design

#### Option 1: Preserve Arguments in Closure (Recommended)
```typescript
.action(async (openapiPath: string, options: GenerateOptions) => {
  // Immediately capture arguments in const to prevent loss
  const originalArgs = {
    openApiPath: openapiPath,
    outputPath: options.output,
    force: options.force,
    verbose: options.verbose,
    debug: options.debug,
    format: options.format,
    authType: options.authType,
  };

  try {
    // Use originalArgs throughout
    const resolvedPath = resolve(originalArgs.openApiPath);

    // ... rest of logic ...

  } catch (error) {
    // Error messages use originalArgs
    logger.error('Generation failed', {
      args: originalArgs,
      error,
    });
    throw error;
  }
})
```

**Pros**:
- Simple fix
- Preserves all context
- Works with existing code

**Cons**:
- Slightly more verbose

#### Option 2: Refactor to Separate Functions
```typescript
.action(async (openapiPath: string, options: GenerateOptions) => {
  // Delegate to separate function
  await executeGenerate({
    openapiPath,
    ...options,
  });
})

async function executeGenerate(args: GenerateArgs): Promise<void> {
  // All logic here with args always in scope
}
```

**Pros**:
- Better separation of concerns
- Easier to test
- Cleaner code structure

**Cons**:
- More refactoring required
- Higher risk of regressions

#### Option 3: Add Debug Tracing
```typescript
.action(async (openapiPath: string, options: GenerateOptions) => {
  logger.debug('Action called with:', { openapiPath, options });

  // Add checkpoints throughout
  logger.debug('Checkpoint 1: openapiPath =', openapiPath);

  try {
    logger.debug('Checkpoint 2: openapiPath =', openapiPath);
    // ... logic ...
    logger.debug('Checkpoint 3: openapiPath =', openapiPath);
  } catch (error) {
    logger.debug('Checkpoint 4 (error): openapiPath =', openapiPath);
    throw error;
  }
})
```

**Pros**:
- Helps identify exact failure point
- Useful for debugging

**Cons**:
- Doesn't fix the bug
- Only diagnostic

### Recommended Approach

**Phase 1**: Add Debug Tracing (Option 3)
- Identify exact point where argument is lost
- Understand the failure mechanism

**Phase 2**: Implement Fix (Option 1)
- Capture arguments immediately
- Use throughout execution
- Verify in tests

**Phase 3**: Refactor if Needed (Option 2)
- Clean up code structure
- Improve testability
- Document patterns

## Implementation Tasks

### Task 1: Add Comprehensive Debug Logging
**Effort**: 30 minutes

```typescript
// Add to generate.ts
.action(async (openapiPath: string, options: GenerateOptions) => {
  const traceId = `trace-${Date.now()}`;

  logger.debug(`[${traceId}] Action invoked`);
  logger.debug(`[${traceId}] openapiPath:`, openapiPath);
  logger.debug(`[${traceId}] options:`, JSON.stringify(options, null, 2));

  // Add checkpoint logging throughout execution
  // Track openapiPath at each major step
})
```

**Test**:
```bash
node packages/cli/dist/index.js generate \
  packages/generator/__tests__/fixtures/minimal-api.json \
  --output test-output/test \
  --force \
  --debug
```

**Expected**: See full trace of openapiPath value at each checkpoint

---

### Task 2: Implement Argument Preservation
**Effort**: 1 hour

```typescript
// packages/cli/src/commands/generate.ts

.action(async (openapiPath: string, options: GenerateOptions) => {
  // Capture arguments immediately to prevent scope issues
  const executionContext = {
    args: {
      openapiPath,
      outputPath: options.output,
      force: options.force || false,
      verbose: options.verbose || false,
      debug: options.debug || false,
      format: options.format,
      authType: options.authType,
    },
    startTime: Date.now(),
    traceId: generateTraceId(),
  };

  logger.debug(`[${executionContext.traceId}] Execution context:`, executionContext);

  try {
    // Set verbose/debug modes
    if (executionContext.args.verbose) {
      process.env.VERBOSE = 'true';
    }
    if (executionContext.args.debug) {
      process.env.DEBUG = '*';
      process.env.VERBOSE = 'true';
    }

    // Validate openapi-path exists
    const resolvedPath = resolve(executionContext.args.openapiPath);
    if (!existsSync(resolvedPath)) {
      throw new ValidationError(
        `OpenAPI file not found: ${executionContext.args.openapiPath}`,
        `Check that the file exists at: ${resolvedPath}`,
        `ls -la ${resolvedPath}`
      );
    }

    // Validate openapi-path is a file
    const stats = statSync(resolvedPath);
    if (!stats.isFile()) {
      throw new ValidationError(
        `Path is not a file: ${executionContext.args.openapiPath}`,
        `The path must point to a file, not a directory`,
        `file ${resolvedPath}`
      );
    }

    // ... rest of implementation using executionContext.args ...

  } catch (error) {
    // Error handler has full context
    logger.error(`[${executionContext.traceId}] Generation failed:`, {
      error: error instanceof Error ? error.message : String(error),
      args: executionContext.args,
      duration: Date.now() - executionContext.startTime,
    });

    throw error;
  }
});
```

---

### Task 3: Add Path Resolution Tests
**Effort**: 1 hour

```typescript
// packages/cli/tests/unit/path-resolution.test.ts

import { describe, it, expect } from 'vitest';
import { resolve, join } from 'path';

describe('Path Resolution', () => {
  it('should resolve relative paths correctly', () => {
    const input = './api.json';
    const resolved = resolve(input);
    expect(resolved).toMatch(/\/api\.json$/);
  });

  it('should resolve parent directory paths', () => {
    const input = '../specs/api.json';
    const resolved = resolve(input);
    expect(resolved).toMatch(/\/specs\/api\.json$/);
  });

  it('should preserve absolute paths', () => {
    const input = '/absolute/path/api.json';
    const resolved = resolve(input);
    expect(resolved).toBe(input);
  });

  it('should handle paths with spaces', () => {
    const input = './path with spaces/api.json';
    const resolved = resolve(input);
    expect(resolved).toContain('path with spaces');
  });
});
```

---

### Task 4: Manual Testing
**Effort**: 30 minutes

**Test Cases**:
```bash
# Test 1: Minimal API with relative path
node packages/cli/dist/index.js generate \
  packages/generator/__tests__/fixtures/minimal-api.json \
  -o test-output/test1 --force

# Test 2: Absolute path
node packages/cli/dist/index.js generate \
  /Users/r2d2/Documents/Code_Projects/spacechemical-nextjs/ozon-performance-sdk/packages/generator/__tests__/fixtures/minimal-api.json \
  -o test-output/test2 --force

# Test 3: Parent directory reference
cd packages/cli
node dist/index.js generate \
  ../generator/__tests__/fixtures/minimal-api.json \
  -o ../../test-output/test3 --force

# Test 4: YAML file
node packages/cli/dist/index.js generate \
  packages/parser/__tests__/fixtures/ozon-api-simplified.yaml \
  -o test-output/test4 --force

# Test 5: With all flags
node packages/cli/dist/index.js generate \
  packages/generator/__tests__/fixtures/minimal-api.json \
  --output test-output/test5 \
  --force \
  --verbose \
  --debug
```

**Success Criteria**:
- All test cases generate successfully
- No "Path is not a file:" errors
- Output directories created with full MCP server structure

---

### Task 5: Create CLI Integration Test
**Effort**: 1 hour

```typescript
// packages/cli/tests/integration/cli-generate.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import { rm, pathExists } from 'fs-extra';
import { resolve } from 'path';

const execAsync = promisify(exec);

describe('CLI Generate Command', () => {
  const testOutputBase = resolve(__dirname, '../../test-output');

  afterEach(async () => {
    // Cleanup test outputs
    await rm(testOutputBase, { recursive: true, force: true });
  });

  it('should generate MCP server from minimal API', async () => {
    const { stdout, stderr } = await execAsync(
      'node packages/cli/dist/index.js generate ' +
      'packages/generator/__tests__/fixtures/minimal-api.json ' +
      '--output test-output/cli-test-1 ' +
      '--force'
    );

    // Check output
    expect(stderr).not.toContain('Path is not a file:');
    expect(await pathExists('test-output/cli-test-1/package.json')).toBe(true);
    expect(await pathExists('test-output/cli-test-1/src/index.ts')).toBe(true);
  }, 30000);

  it('should work with relative paths', async () => {
    const { stderr } = await execAsync(
      'node packages/cli/dist/index.js generate ' +
      './packages/generator/__tests__/fixtures/minimal-api.json ' +
      '-o test-output/cli-test-2 ' +
      '--force'
    );

    expect(stderr).not.toContain('Path is not a file:');
    expect(await pathExists('test-output/cli-test-2/package.json')).toBe(true);
  }, 30000);

  it('should show helpful error for missing file', async () => {
    try {
      await execAsync(
        'node packages/cli/dist/index.js generate ' +
        'nonexistent-file.json ' +
        '-o test-output/cli-test-error'
      );
      expect.fail('Should have thrown error');
    } catch (error: any) {
      expect(error.stderr).toContain('OpenAPI file not found');
      expect(error.stderr).toContain('nonexistent-file.json');
    }
  });
});
```

## Testing Strategy

### Unit Tests
- Path resolution logic
- Argument validation
- Error message formatting

### Integration Tests
- Full CLI execution with various paths
- Success and failure scenarios
- Cross-platform compatibility

### Manual Tests
- Test on macOS (primary)
- Test on Linux (CI)
- Test on Windows (optional)

## Success Metrics

### Before Fix
- ❌ 0% CLI success rate
- ❌ All generation attempts fail
- ❌ Error messages unhelpful

### After Fix
- ✅ 100% CLI success rate for valid inputs
- ✅ All test cases pass
- ✅ Error messages show full context

### Acceptance
- [ ] All 5 manual test cases pass
- [ ] Integration tests pass
- [ ] No regression in core generator tests
- [ ] Documentation examples work

## Risks and Mitigation

### Risk 1: Fix breaks existing tests
- **Mitigation**: Run full test suite after each change
- **Rollback**: Revert to previous version

### Risk 2: Path resolution differs across OS
- **Mitigation**: Test on Linux CI
- **Fallback**: OS-specific handling

### Risk 3: Commander.js version update needed
- **Mitigation**: Check Commander.js changelog
- **Decision**: Upgrade only if necessary

## Dependencies

- Commander.js v11.1.0
- Node.js v20+
- Core generator (working)

## Definition of Done

- [ ] Code implemented and reviewed
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Manual test cases verified
- [ ] Documentation updated
- [ ] QA gate approved
- [ ] Merged to main branch

---

**Created**: 2025-10-08
**Last Updated**: 2025-10-08
**Owner**: Development Team
