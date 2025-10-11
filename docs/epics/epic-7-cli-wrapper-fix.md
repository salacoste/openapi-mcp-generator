# Epic 7: CLI Wrapper Bug Fix

**Status**: PLANNED
**Priority**: P1 (High)
**Created**: 2025-10-08
**Target**: Q4 2025

## Overview

Fix critical bug in CLI wrapper where command-line argument parsing fails with "Path is not a file:" error, preventing users from using the CLI to generate MCP servers. The core generator works perfectly via programmatic API - this is purely a CLI wrapper issue.

## Problem Statement

### Current Behavior
When attempting to generate an MCP server using the CLI:

```bash
node packages/cli/dist/index.js generate \
  packages/generator/__tests__/fixtures/minimal-api.json \
  --output test-output/minimal-mcp-server \
  --force
```

**Error**:
```
❌ Path is not a file:
```

### Expected Behavior
- CLI should successfully parse command-line arguments
- File path should be properly resolved and validated
- Generation should proceed normally

### Root Cause Analysis

**Evidence from Testing**:
1. ✅ Core generator works perfectly (36/36 integration tests passing)
2. ✅ File paths are valid and exist
3. ❌ CLI wrapper fails with empty path string
4. ❌ Error occurs in `generate.ts:516` during file validation

**Hypothesis**:
- Problem occurs after rollback functionality when temp directory is deleted
- `openapiPath` variable becomes empty string
- Commander.js argument parsing may have issue with path resolution
- Error message formatting loses the original path value

**Code Location**:
```typescript
// packages/cli/src/commands/generate.ts:516
const stats = statSync(resolvedPath);
if (!stats.isFile()) {
  throw new ValidationError(`Path is not a file: ${openapiPath}`);
  // openapiPath is empty string here ^
}
```

## Business Impact

### Current State
- **Severity**: High - CLI is primary user interface
- **Workaround**: Use programmatic API directly
- **User Impact**: 100% of CLI users affected
- **Reputation**: Poor first-time user experience

### Success Metrics
- ✅ CLI generates MCP servers successfully
- ✅ Error messages show full context
- ✅ Integration tests for CLI cover all scenarios
- ✅ Documentation reflects working CLI

## Technical Goals

### Primary Goals
1. **Fix Argument Parsing**: Ensure Commander.js correctly passes arguments to action handler
2. **Improve Error Messages**: Show full path and context in all error messages
3. **Add CLI Tests**: Create integration tests specifically for CLI wrapper
4. **Update Documentation**: Ensure all examples work end-to-end

### Secondary Goals
1. Add CLI smoke tests to CI/CD pipeline
2. Improve debug output for troubleshooting
3. Add telemetry for error tracking

## Stories

### Story 7.1: Fix CLI Argument Parsing
**Priority**: P0 (Critical)
**Effort**: 2-4 hours

**Acceptance Criteria**:
- [ ] CLI correctly receives `openapiPath` argument
- [ ] Path resolution works with relative and absolute paths
- [ ] All Commander.js options are properly passed
- [ ] Rollback doesn't affect argument values

**Tasks**:
1. Debug Commander.js action handler argument passing
2. Add defensive checks for undefined/empty arguments
3. Preserve original argument values through execution
4. Test with various path formats (relative, absolute, tilde)

---

### Story 7.2: Improve Error Messages and Context
**Priority**: P1 (High)
**Effort**: 1-2 hours

**Acceptance Criteria**:
- [ ] Error messages include full file paths
- [ ] Stack traces show operation context
- [ ] Debug mode provides detailed execution trace
- [ ] User-friendly suggestions for common errors

**Tasks**:
1. Enhance ValidationError to preserve all context
2. Add operation ID to error messages
3. Improve debug output formatting
4. Create error message catalog

---

### Story 7.3: Add CLI Integration Tests
**Priority**: P1 (High)
**Effort**: 3-4 hours

**Acceptance Criteria**:
- [ ] Test CLI with minimal API fixture
- [ ] Test CLI with simplified Ozon API
- [ ] Test all CLI flags (--force, --verbose, --debug, --output)
- [ ] Test error scenarios (missing file, invalid path, etc.)
- [ ] Tests run in CI/CD pipeline

**Tasks**:
1. Create `packages/cli/tests/integration/` directory
2. Write CLI invocation tests using child_process
3. Test success and failure scenarios
4. Add to CI/CD workflow

---

### Story 7.4: Update Documentation and Examples
**Priority**: P2 (Medium)
**Effort**: 1 hour

**Acceptance Criteria**:
- [ ] README examples verified to work
- [ ] Troubleshooting guide updated
- [ ] CLI help text accurate
- [ ] Example commands tested

**Tasks**:
1. Verify all README examples
2. Add troubleshooting section
3. Update CLI help text
4. Add more usage examples

## Dependencies

### Prerequisites
- Epic 6 completion (✅ Complete)
- All core generator tests passing (✅ Complete)

### External Dependencies
- None

### Internal Dependencies
- Commander.js v11.1.0 (current)
- Node.js v20+ (current)

## Risks and Mitigation

### Technical Risks

**Risk 1**: Commander.js version incompatibility
- **Probability**: Low
- **Impact**: High
- **Mitigation**: Test with multiple Commander.js versions

**Risk 2**: Path resolution differs across OS
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**: Test on macOS, Linux, Windows

**Risk 3**: Rollback mechanism interferes with argument state
- **Probability**: High
- **Impact**: High
- **Mitigation**: Separate argument parsing from rollback logic

## Success Criteria

### Functional Requirements
- [x] Core generator works (already passing)
- [ ] CLI successfully generates MCP servers
- [ ] All CLI flags work correctly
- [ ] Error messages are helpful

### Quality Requirements
- [ ] 100% of CLI integration tests passing
- [ ] Zero regressions in core generator tests
- [ ] Documentation examples work end-to-end
- [ ] Error messages rated 8/10+ for helpfulness

### Performance Requirements
- [ ] CLI overhead <100ms
- [ ] No impact on core generator performance
- [ ] Error handling doesn't slow execution

## Testing Strategy

### Unit Tests
- Test argument parsing logic
- Test path resolution
- Test error formatting

### Integration Tests
```bash
# Test successful generation
test_cli_generate_minimal_api
test_cli_generate_with_flags
test_cli_generate_force_overwrite

# Test error scenarios
test_cli_missing_file
test_cli_invalid_path
test_cli_permission_denied
test_cli_invalid_openapi
```

### E2E Tests
- Generate MCP server from Ozon API
- Install dependencies in generated server
- Run generated server
- Verify MCP protocol communication

## Implementation Plan

### Phase 1: Investigation (1-2 hours)
1. Add extensive debug logging to CLI
2. Trace argument flow through Commander.js
3. Identify exact point where path becomes empty
4. Document findings

### Phase 2: Fix Core Issue (2-3 hours)
1. Implement argument preservation
2. Separate concerns (parsing vs. validation vs. execution)
3. Add defensive checks
4. Test fix manually

### Phase 3: Testing (2-3 hours)
1. Create CLI integration tests
2. Test all scenarios
3. Verify on multiple OS platforms
4. Add to CI/CD

### Phase 4: Documentation (1 hour)
1. Update README
2. Add troubleshooting guide
3. Verify all examples
4. Update CLI help

**Total Estimated Effort**: 8-12 hours (1-2 days)

## QA Checklist

See: `docs/qa/gates/7.0-cli-wrapper-fix.yml`

### Pre-Deployment
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] CLI generates from minimal-api.json
- [ ] CLI generates from ozon-api-simplified.yaml
- [ ] Error messages tested
- [ ] Documentation verified

### Post-Deployment
- [ ] Smoke test on production CLI
- [ ] Monitor error rates
- [ ] Collect user feedback
- [ ] Track success metrics

## Rollback Plan

### Trigger Conditions
- CLI breaks core functionality
- Performance degrades >20%
- New regressions introduced

### Rollback Steps
1. Revert CLI changes to Epic 6 state
2. Core generator remains functional via API
3. Document issue for future fix
4. Communicate to users

### Recovery Time
- **RTO**: <1 hour (git revert)
- **RPO**: Zero data loss (stateless operation)

## Future Enhancements

### Post-Epic 7
1. Add telemetry for usage tracking
2. Create CLI wizard for interactive generation
3. Add validation before full generation
4. Support multiple input files
5. Add `--dry-run` flag for preview

## References

### Related Documentation
- [Epic 6 Completion Summary](./epic-6-completion-summary.md)
- [CLI Design](../architecture/cli-design.md)
- [Error Handling Strategy](../architecture/error-handling.md)

### Code References
- `packages/cli/src/commands/generate.ts` - Main CLI command
- `packages/cli/src/utils/validation.ts` - Validation utilities
- `packages/generator/src/mcp-generator.ts` - Core generator (working)

### External Resources
- [Commander.js Documentation](https://github.com/tj/commander.js)
- [Node.js path module](https://nodejs.org/api/path.html)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)

---

**Last Updated**: 2025-10-08
**Owner**: Development Team
**Stakeholders**: CLI Users, Integration Partners
