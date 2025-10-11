# Story 7.3: Add CLI Integration Tests

**Epic**: Epic 7 - CLI Wrapper Bug Fix
**Status**: PLANNED
**Priority**: P1 (High)
**Effort**: 3-4 hours
**Created**: 2025-10-08

## User Story

**As a** developer maintaining the CLI
**I want** comprehensive integration tests
**So that** we prevent CLI regressions and ensure reliability

## Acceptance Criteria

### Functional Requirements

- [ ] **AC1**: Test successful generation from minimal API
- [ ] **AC2**: Test all CLI flags (--force, --verbose, --debug, --output)
- [ ] **AC3**: Test error scenarios (missing file, invalid OpenAPI, permissions)
- [ ] **AC4**: Tests run in CI/CD pipeline
- [ ] **AC5**: Test coverage >90% for CLI code

### Test Scenarios

#### Success Scenarios
```typescript
describe('CLI Success Scenarios', () => {
  it('generates from minimal-api.json');
  it('generates from ozon-api-simplified.yaml');
  it('respects --output flag');
  it('overwrites with --force flag');
  it('shows verbose output with --verbose');
  it('shows debug trace with --debug');
});
```

#### Error Scenarios
```typescript
describe('CLI Error Scenarios', () => {
  it('fails gracefully for missing file');
  it('fails gracefully for invalid OpenAPI');
  it('fails gracefully for permission denied');
  it('fails gracefully for invalid output path');
  it('shows helpful error messages');
});
```

## Implementation

### Test Structure
```
packages/cli/
├── tests/
│   ├── integration/
│   │   ├── cli-generate.test.ts         # Main CLI tests
│   │   ├── cli-error-handling.test.ts   # Error scenarios
│   │   └── fixtures/
│   │       ├── minimal-api.json
│   │       └── invalid-api.json
│   └── unit/
│       ├── path-resolution.test.ts
│       └── validation.test.ts
```

### Task 1: Create CLI Test Helper
```typescript
// packages/cli/tests/helpers/cli-runner.ts

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function runCLI(args: string[]): Promise<CLIResult> {
  const command = `node packages/cli/dist/index.js ${args.join(' ')}`;

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      env: process.env,
    });

    return {
      success: true,
      stdout,
      stderr,
      exitCode: 0,
    };
  } catch (error: any) {
    return {
      success: false,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: error.code || 1,
      error: error.message,
    };
  }
}

export interface CLIResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  error?: string;
}
```

### Task 2: Create Main Integration Tests
```typescript
// packages/cli/tests/integration/cli-generate.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { runCLI } from '../helpers/cli-runner.js';
import { rm, pathExists } from 'fs-extra';
import { resolve } from 'path';

describe('CLI Generate Command - Success Cases', () => {
  const testOutput = 'test-output/cli-integration';

  afterEach(async () => {
    await rm(testOutput, { recursive: true, force: true });
  });

  it('should generate from minimal-api.json', async () => {
    const result = await runCLI([
      'generate',
      'packages/generator/__tests__/fixtures/minimal-api.json',
      '--output', `${testOutput}/test1`,
      '--force',
    ]);

    expect(result.success).toBe(true);
    expect(result.stderr).not.toContain('Path is not a file');

    // Verify generated files
    expect(await pathExists(`${testOutput}/test1/package.json`)).toBe(true);
    expect(await pathExists(`${testOutput}/test1/src/index.ts`)).toBe(true);
    expect(await pathExists(`${testOutput}/test1/src/types.ts`)).toBe(true);
    expect(await pathExists(`${testOutput}/test1/src/tools.ts`)).toBe(true);
  }, 30000);

  it('should respect --force flag', async () => {
    // Create directory first
    await runCLI([
      'generate',
      'packages/generator/__tests__/fixtures/minimal-api.json',
      '-o', `${testOutput}/test2`,
    ]);

    // Try again without --force (should fail)
    const resultWithoutForce = await runCLI([
      'generate',
      'packages/generator/__tests__/fixtures/minimal-api.json',
      '-o', `${testOutput}/test2`,
    ]);

    expect(resultWithoutForce.success).toBe(false);
    expect(resultWithoutForce.stderr).toContain('already exists');

    // Try with --force (should succeed)
    const resultWithForce = await runCLI([
      'generate',
      'packages/generator/__tests__/fixtures/minimal-api.json',
      '-o', `${testOutput}/test2`,
      '--force',
    ]);

    expect(resultWithForce.success).toBe(true);
  }, 60000);

  it('should show verbose output with --verbose flag', async () => {
    const result = await runCLI([
      'generate',
      'packages/generator/__tests__/fixtures/minimal-api.json',
      '-o', `${testOutput}/test3`,
      '--verbose',
      '--force',
    ]);

    expect(result.success).toBe(true);
    expect(result.stderr).toContain('OpenAPI path:');
    expect(result.stderr).toContain('Output directory:');
  }, 30000);
});

describe('CLI Generate Command - Error Cases', () => {
  it('should fail with helpful message for missing file', async () => {
    const result = await runCLI([
      'generate',
      'nonexistent-file.json',
      '-o', 'test-output/error1',
    ]);

    expect(result.success).toBe(false);
    expect(result.stderr).toContain('OpenAPI file not found');
    expect(result.stderr).toContain('nonexistent-file.json');
  });

  it('should fail with helpful message for directory path', async () => {
    const result = await runCLI([
      'generate',
      'packages/generator/__tests__/fixtures',  // directory, not file
      '-o', 'test-output/error2',
    ]);

    expect(result.success).toBe(false);
    expect(result.stderr).toContain('Path is not a file');
  });
});
```

### Task 3: Add to CI/CD Pipeline
```yaml
# .github/workflows/test.yml

jobs:
  test-cli:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build packages
        run: pnpm build

      - name: Run CLI integration tests
        run: pnpm --filter @openapi-to-mcp/cli test:integration
```

## Success Metrics

- ✅ 100% of test scenarios pass
- ✅ Tests run in <60 seconds
- ✅ Code coverage >90% for CLI
- ✅ Zero flaky tests
- ✅ Tests catch regressions

## Definition of Done

- [ ] All test scenarios implemented
- [ ] Tests passing locally
- [ ] Tests passing in CI
- [ ] Test coverage >90%
- [ ] Documentation updated

---

**Created**: 2025-10-08
**Owner**: Development Team
