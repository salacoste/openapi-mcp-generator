# Epic 7: CLI Wrapper Bug Fix - Quick Summary

**Status**: 📋 PLANNED
**Priority**: P1 (High)
**Estimated Effort**: 8-12 hours (1-2 days)

## Problem

CLI wrapper fails with "Path is not a file:" error even when file exists:

```bash
❌ Path is not a file:
```

**Root Cause**: `openapiPath` argument becomes empty string during execution

## Impact

- **Severity**: High - CLI is unusable
- **Users Affected**: 100% of CLI users
- **Workaround**: Use programmatic API (not acceptable for CLI users)
- **Core Generator**: ✅ Works perfectly (994/1005 tests passing)

## Solution Overview

### Story 7.1: Fix CLI Argument Parsing (P0 - Critical)
**Effort**: 2-4 hours

Fix Commander.js action handler to preserve arguments throughout execution.

**Key Change**:
```typescript
.action(async (openapiPath: string, options: GenerateOptions) => {
  // Capture arguments immediately to prevent loss
  const executionContext = {
    args: { openapiPath, ...options },
    traceId: generateTraceId(),
  };

  // Use executionContext.args throughout
})
```

### Story 7.2: Improve Error Messages (P1 - High)
**Effort**: 1-2 hours

Make error messages helpful with full context and actionable suggestions.

**Example**:
```bash
❌ OpenAPI file not found: api.json
💡 Check that the file exists at: /full/path/to/api.json
🔧 Try: ls -la /full/path/to/api.json
```

### Story 7.3: Add CLI Integration Tests (P1 - High)
**Effort**: 3-4 hours

Create comprehensive CLI tests to prevent regressions.

**Coverage**:
- Success scenarios (various path formats)
- Error scenarios (missing files, invalid OpenAPI)
- All CLI flags (--force, --verbose, --debug)
- CI/CD integration

## Success Criteria

- ✅ CLI generates MCP servers successfully
- ✅ Error messages are helpful (8/10+ rating)
- ✅ 100% CLI integration tests passing
- ✅ Test coverage ≥90%
- ✅ No regressions in core generator
- ✅ Documentation examples work

## Files Created

1. **Epic Documentation**
   - `docs/epics/epic-7-cli-wrapper-fix.md` - Full epic specification

2. **Stories**
   - `docs/stories/story-7.1-fix-cli-argument-parsing.md` - Detailed implementation plan
   - `docs/stories/story-7.2-improve-error-messages.md` - Error handling improvements
   - `docs/stories/story-7.3-add-cli-integration-tests.md` - Test strategy

3. **QA Gate**
   - `docs/qa/gates/7.0-cli-wrapper-fix.yml` - Comprehensive QA checklist

## Quick Start for Implementation

### Phase 1: Investigation (1-2 hours)
```bash
# Add debug logging and identify exact failure point
node packages/cli/dist/index.js generate \
  packages/generator/__tests__/fixtures/minimal-api.json \
  --output test-output/debug-test \
  --debug --force
```

### Phase 2: Fix (2-3 hours)
1. Implement argument preservation in `packages/cli/src/commands/generate.ts`
2. Add defensive checks for undefined/empty arguments
3. Test with all path formats

### Phase 3: Testing (2-3 hours)
1. Create `packages/cli/tests/integration/cli-generate.test.ts`
2. Write comprehensive test scenarios
3. Add to CI/CD pipeline

### Phase 4: Documentation (1 hour)
1. Update README examples
2. Add troubleshooting guide
3. Verify all examples work

## Timeline

```
Week 1:
  Mon: Story 7.1 implementation (2-4h)
  Tue: Story 7.2 implementation (1-2h)
  Wed: Story 7.3 implementation (3-4h)
  Thu: QA testing and documentation (2-3h)
  Fri: Review, fixes, and approval
```

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Fix breaks existing tests | Low | High | Run full suite after each change |
| Cross-platform issues | Medium | Medium | Test on Linux CI |
| Commander.js compatibility | Low | High | Check changelog, upgrade if needed |

## Current Test Results

**Before Epic 7**:
- ❌ CLI: 0% success rate
- ✅ Core Generator: 994/1005 tests passing (99%)
- ✅ Type Coverage: 99.38%
- ✅ ESLint: 0 errors

**Target After Epic 7**:
- ✅ CLI: 100% success rate
- ✅ Core Generator: No regressions
- ✅ CLI Tests: >90% coverage
- ✅ User Satisfaction: 8/10+ for error messages

## Next Steps

1. **Start Story 7.1** - Fix CLI argument parsing (highest priority)
2. **Create branch** - `epic-7/cli-wrapper-fix`
3. **Follow implementation plan** - See Story 7.1 for detailed tasks
4. **Run QA gate** - Use `docs/qa/gates/7.0-cli-wrapper-fix.yml`
5. **Get approvals** - Technical lead + QA lead

## References

- **Epic Documentation**: `docs/epics/epic-7-cli-wrapper-fix.md`
- **QA Gate**: `docs/qa/gates/7.0-cli-wrapper-fix.yml`
- **Code Location**: `packages/cli/src/commands/generate.ts:494-830`
- **Commander.js Docs**: https://github.com/tj/commander.js

---

**Created**: 2025-10-08
**Last Updated**: 2025-10-08
**Owner**: Development Team
