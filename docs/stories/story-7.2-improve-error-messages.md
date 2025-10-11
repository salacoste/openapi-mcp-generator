# Story 7.2: Improve Error Messages and Context

**Epic**: Epic 7 - CLI Wrapper Bug Fix
**Status**: PLANNED
**Priority**: P1 (High)
**Effort**: 1-2 hours
**Created**: 2025-10-08

## User Story

**As a** developer encountering CLI errors
**I want** clear error messages with full context
**So that** I can quickly understand and fix the problem

## Acceptance Criteria

### Functional Requirements

- [ ] **AC1**: Error messages include full file paths
  ```bash
  ❌ OpenAPI file not found: packages/api.json
  💡 Check that the file exists at: /Users/dev/project/packages/api.json
  ```

- [ ] **AC2**: Error messages include actionable suggestions
  ```bash
  ❌ Invalid OpenAPI format
  💡 Expected JSON or YAML, got: text/plain
  🔧 Suggested fix: Rename file to .json or .yaml extension
  ```

- [ ] **AC3**: Stack traces include operation context
  ```typescript
  Error: Template rendering failed
    at renderTemplate (template.ts:45)
    Context: {
      operation: "generateMCPServer",
      file: "/path/to/openapi.json",
      phase: "Step 4/5: Generating server entry point"
    }
  ```

- [ ] **AC4**: Debug mode shows detailed execution trace
  ```bash
  2025-10-08T10:30:15.123Z [INFO] Starting generation
  2025-10-08T10:30:15.125Z [DEBUG] Resolved path: /abs/path/to/api.json
  2025-10-08T10:30:15.130Z [DEBUG] Validation passed
  2025-10-08T10:30:15.150Z [ERROR] Template error at line 42
  ```

### Quality Requirements

- [ ] **AC5**: All error classes preserve original context
- [ ] **AC6**: Error catalog documents common errors
- [ ] **AC7**: User satisfaction >8/10 for error helpfulness

## Implementation Tasks

### Task 1: Enhance ValidationError Class
```typescript
// packages/cli/src/errors/validation.ts

export class ValidationError extends Error {
  constructor(
    message: string,
    public context?: ErrorContext,
    public suggestion?: string,
    public command?: string
  ) {
    super(message);
    this.name = 'ValidationError';
    Error.captureStackTrace(this, ValidationError);
  }

  toString(): string {
    let output = `❌ ${this.message}\n`;

    if (this.context) {
      output += `\n📍 Context:\n`;
      output += Object.entries(this.context)
        .map(([key, value]) => `  ${key}: ${value}`)
        .join('\n');
      output += '\n';
    }

    if (this.suggestion) {
      output += `\n💡 ${this.suggestion}\n`;
    }

    if (this.command) {
      output += `\n🔧 Try: ${this.command}\n`;
    }

    return output;
  }
}
```

### Task 2: Create Error Message Catalog
```typescript
// packages/cli/src/errors/catalog.ts

export const ERROR_CATALOG = {
  FILE_NOT_FOUND: {
    code: 'E001',
    template: 'OpenAPI file not found: {path}',
    suggestion: 'Check that the file exists at: {resolvedPath}',
    command: 'ls -la {resolvedPath}',
  },
  INVALID_FILE_TYPE: {
    code: 'E002',
    template: 'Path is not a file: {path}',
    suggestion: 'The path must point to a file, not a directory',
    command: 'file {resolvedPath}',
  },
  INVALID_OPENAPI: {
    code: 'E003',
    template: 'Invalid OpenAPI specification',
    suggestion: 'See validation errors above for details',
    command: 'openapi-to-mcp validate {path}',
  },
  // ... more error definitions
};
```

### Task 3: Improve Debug Logging Format
```typescript
// packages/cli/src/logging/formatter.ts

export function formatDebugLog(level: string, message: string, data?: any): string {
  const timestamp = new Date().toISOString();
  const prefix = `${timestamp} [${level.toUpperCase()}]`;

  if (data && Object.keys(data).length > 0) {
    return `${prefix} ${message}\n${JSON.stringify(data, null, 2)}`;
  }

  return `${prefix} ${message}`;
}
```

## Testing

### Unit Tests
- Test error formatting
- Test context preservation
- Test catalog lookups

### Integration Tests
```typescript
it('should show helpful error for missing file', async () => {
  try {
    await cli.generate('missing.json');
  } catch (error) {
    expect(error.message).toContain('OpenAPI file not found');
    expect(error.message).toContain('missing.json');
    expect(error.suggestion).toBeDefined();
  }
});
```

## Success Metrics

- Error message clarity rated 8/10+
- Users can resolve errors without support
- Debug logs enable quick troubleshooting

---

**Created**: 2025-10-08
**Owner**: Development Team
