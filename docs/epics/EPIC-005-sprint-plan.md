# EPIC-005 Sprint Planning Summary

**Epic**: Fix MCP Generation Pipeline
**Target Release**: v0.3.0
**Total Effort**: 19 story points
**Estimated Duration**: 2-3 sprints (2-3 weeks)
**Priority**: P0 - Critical Blocker

---

## Executive Summary

This sprint plan breaks down the critical work to fix the MCP server generation pipeline. The epic is divided into 4 stories with 30 total tasks, delivering a complete transformation from a non-functional hello-world (removed Story 6.3) stub to a production-ready generator.

**Key Deliverables**:
- ✅ Functional CLI that generates real MCP servers (39 tools, 220 types)
- ✅ Comprehensive integration test suite (6+ test cases)
- ✅ Robust error handling with rollback mechanisms
- ✅ Complete documentation with working examples

**Business Impact**:
- Unblocks v1.0 release
- Restores user trust (docs match behavior)
- Eliminates manual MCP server creation
- Reduces support burden through better error messages

---

## Story Overview

| Story | Priority | Effort | Duration | Dependencies | Risk |
|-------|----------|--------|----------|--------------|------|
| 5.1: Refactor CLI | P0 | 8 SP | 12-16h | None | Medium |
| 5.2: Integration Tests | P0 | 5 SP | 8-10h | Story 5.1 | Low |
| 5.3: Error Handling | P1 | 3 SP | 5-6h | Story 5.1 | Low |
| 5.4: Documentation | P1 | 3 SP | 5-6h | Stories 5.1, 5.2 | Low |
| **TOTAL** | | **19 SP** | **30-38h** | | |

**Velocity Assumptions**: 1 SP = 2 hours of focused development time

---

## Sprint 1: Foundation (Week 1)

**Goal**: Get basic generation working end-to-end

**Duration**: 5 working days
**Capacity**: 8-10 story points
**Focus**: Story 5.1 (CLI Refactoring)

### Sprint 1 Backlog

#### Week 1, Days 1-2: Setup & Scaffolding
**Effort**: 3 SP (6 hours)

- [ ] **Task 5.1.1**: Remove template copying logic (0.5 SP, 1h)
- [ ] **Task 5.1.2**: Import generator functions (0.5 SP, 1h)
- [ ] **Task 5.1.3**: Implement output directory validation (1 SP, 2h)
- [ ] **Task 5.1.4**: Implement scaffoldProject() invocation (1 SP, 2h)

**Milestone**: Project structure generation works

#### Week 1, Days 3-4: Code Generation
**Effort**: 4 SP (8 hours)

- [ ] **Task 5.1.5**: Implement generateInterfaces() invocation (1.5 SP, 3h)
- [ ] **Task 5.1.6**: Implement generateToolDefinitions() invocation (1.5 SP, 3h)
- [ ] **Task 5.1.7**: Implement generateMainServerFile() invocation (1 SP, 2h)

**Milestone**: TypeScript code generation complete

#### Week 1, Day 5: Polish & Verification
**Effort**: 1.5 SP (3 hours)

- [ ] **Task 5.1.8**: Implement generateHttpClient() invocation (1 SP, 2h)
- [ ] **Task 5.1.9**: Export writeFile utility from generator (0.5 SP, 1h)
- [ ] **Task 5.1.10**: Add comprehensive logging (0.5 SP, 1h) - START ONLY

**Milestone**: End-to-end generation works

**Sprint 1 Deliverable**:
```bash
# This should work at sprint end:
generate swagger.json --output ./test-server --force
cd test-server
npm install
npm run build
node dist/index.js
# → Server runs and responds to MCP protocol
```

### Sprint 1 Risks & Mitigation

**Risk 1**: Generated code doesn't compile
- **Probability**: Medium
- **Mitigation**: Test with Ozon API spec early (Day 3)
- **Fallback**: Implement basic syntax validation before file write

**Risk 2**: Generator function integration issues
- **Probability**: Low
- **Mitigation**: Generator package already tested independently
- **Fallback**: Fix generator package issues in parallel

**Risk 3**: Time overrun on interface generation
- **Probability**: Low
- **Mitigation**: Task 5.1.5 has detailed implementation steps
- **Fallback**: Reduce logging verbosity to save time

---

## Sprint 2: Quality & Documentation (Week 2)

**Goal**: Add comprehensive testing and robust error handling

**Duration**: 5 working days
**Capacity**: 8-10 story points
**Focus**: Story 5.2 (Integration Tests) + Story 5.3 (Error Handling)

### Sprint 2 Backlog

#### Week 2, Days 1-2: Test Infrastructure
**Effort**: 3 SP (6 hours)

- [ ] **Task 5.1.10**: Complete comprehensive logging (CARRY OVER, 0h)
- [ ] **Task 5.2.1**: Create test infrastructure and setup (1 SP, 2h)
- [ ] **Task 5.2.2**: Create test fixtures (0.5 SP, 1h)
- [ ] **Task 5.2.3**: Implement Ozon API generation test (1 SP, 2h)
- [ ] **Task 5.2.4**: Implement TypeScript compilation test (0.5 SP, 1h)

**Milestone**: Core integration tests passing

#### Week 2, Days 3-4: Advanced Testing & Error Handling
**Effort**: 3.5 SP (7 hours)

- [ ] **Task 5.2.5**: Implement server startup test (1 SP, 2h)
- [ ] **Task 5.2.6**: Implement minimal spec test (0.5 SP, 1h)
- [ ] **Task 5.2.7**: Implement error case tests (0.5 SP, 1h)
- [ ] **Task 5.3.1**: Create validation utility module (0.5 SP, 1h)
- [ ] **Task 5.3.2**: Create progress reporting utility (0.5 SP, 1h)
- [ ] **Task 5.3.3**: Implement atomic generation with rollback (1 SP, 2h)

**Milestone**: Full test coverage + error handling foundation

#### Week 2, Day 5: Error Handling & CI/CD
**Effort**: 1.5 SP (3 hours)

- [ ] **Task 5.3.4**: Add specific error handlers (0.5 SP, 1h)
- [ ] **Task 5.3.5**: Add debug mode (0.25 SP, 0.5h)
- [ ] **Task 5.3.6**: Write error handling tests (0.25 SP, 0.5h)
- [ ] **Task 5.2.8**: Integrate tests into CI/CD (0.5 SP, 1h)

**Milestone**: Complete test suite + error handling in CI/CD

**Sprint 2 Deliverable**:
```bash
# All tests pass
pnpm test:integration
# → 6+ integration tests passing in <60s

# Error handling works
generate invalid-spec.json --output ./test
# → Clear error with actionable suggestion

# CI/CD enforces quality
git push
# → GitHub Actions runs all tests automatically
```

### Sprint 2 Risks & Mitigation

**Risk 1**: Server startup test flaky
- **Probability**: Medium
- **Mitigation**: Proper timeout handling and process cleanup
- **Fallback**: Increase timeouts or split into separate test

**Risk 2**: CI/CD integration issues
- **Probability**: Low
- **Mitigation**: Test locally with `CI=true` environment
- **Fallback**: Run tests manually until CI fixed

---

## Sprint 3: Documentation & Polish (Week 3)

**Goal**: Complete documentation and prepare for release

**Duration**: 3-5 working days
**Capacity**: 3-5 story points
**Focus**: Story 5.4 (Documentation)

### Sprint 3 Backlog

#### Week 3, Days 1-2: Core Documentation
**Effort**: 2 SP (4 hours)

- [ ] **Task 5.4.1**: Update main README.md (0.5 SP, 1h)
- [ ] **Task 5.4.2**: Create quick-start tutorial (0.5 SP, 1h)
- [ ] **Task 5.4.3**: Create generation pipeline guide (0.5 SP, 1h)
- [ ] **Task 5.4.5**: Generate and document example server (0.5 SP, 1h)

**Milestone**: Core documentation complete

#### Week 3, Days 3-4: Advanced Documentation
**Effort**: 0.75 SP (1.5 hours)

- [ ] **Task 5.4.4**: Create troubleshooting guide (0.75 SP, 1.5h)

**Milestone**: Comprehensive troubleshooting available

#### Week 3, Day 5: Validation & Release Prep
**Effort**: 0.25 SP (0.5 hours)

- [ ] **Task 5.4.6**: Validate tutorial with external tester (0.25 SP, 0.5h)
- [ ] **Release preparation**: Version bump, changelog, release notes
- [ ] **Final QA**: Manual testing of complete workflow

**Milestone**: Ready for v0.3.0 release

**Sprint 3 Deliverable**:
```bash
# Documentation is complete and accurate
open README.md
open docs/guides/quick-start.md
open examples/ozon-performance-mcp/

# External tester completes tutorial in <5 minutes
# All links work, all examples tested
```

### Sprint 3 Risks & Mitigation

**Risk 1**: External tester unavailable
- **Probability**: Low
- **Mitigation**: Line up tester early in sprint
- **Fallback**: Internal team member from different project

**Risk 2**: Documentation takes longer than estimated
- **Probability**: Medium
- **Mitigation**: Use templates from story details
- **Fallback**: Prioritize README and quick-start, defer architecture guide

---

## Task Dependencies Graph

```
Sprint 1 (Week 1):
5.1.1 (Remove template)
  → 5.1.2 (Import functions)
    → 5.1.3 (Validation)
      → 5.1.4 (Scaffold)
        → 5.1.5 (Interfaces) ──┐
        → 5.1.6 (Tools) ───────┼→ 5.1.7 (Server)
        → 5.1.8 (Client) ──────┘    → 5.1.10 (Logging)

5.1.9 (writeFile export) [PARALLEL - no dependencies]

Sprint 2 (Week 2):
5.1.10 (Complete logging)
  → 5.2.1 (Test infrastructure)
    → 5.2.2 (Fixtures) [PARALLEL]
      → 5.2.3 (Ozon test)
        → 5.2.4 (Compilation test)
        → 5.2.5 (Server test)
        → 5.2.6 (Minimal test)
        → 5.2.7 (Error tests)
        → 5.2.8 (CI/CD)

5.3.1 (Validation utils) [PARALLEL]
5.3.2 (Progress utils) [PARALLEL]
  → 5.3.3 (Atomic generation)
    → 5.3.4 (Error handlers)
      → 5.3.5 (Debug mode)
      → 5.3.6 (Error tests)

Sprint 3 (Week 3):
5.4.1 (README)
  → 5.4.2 (Quick-start)
    → 5.4.6 (External validation)
  → 5.4.3 (Architecture guide)
  → 5.4.4 (Troubleshooting)

5.4.5 (Example server) [PARALLEL - only needs 5.1 complete]
```

---

## Resource Allocation

### Single Developer Plan

**Total Duration**: 3 weeks (15 working days)
**Daily Capacity**: 6 hours focused development
**Total Capacity**: 90 hours

**Allocation**:
- Sprint 1: 40 hours (8 days) - Story 5.1 complete
- Sprint 2: 35 hours (5 days) - Stories 5.2 & 5.3 complete
- Sprint 3: 15 hours (2 days) - Story 5.4 complete + release prep

**Buffer**: 10% (9 hours) for unexpected issues

### Two Developer Plan

**Total Duration**: 1.5-2 weeks (8-10 working days)
**Daily Capacity**: 12 hours (6h × 2 devs)
**Total Capacity**: 96-120 hours

**Allocation**:

**Developer 1** (Backend/CLI focus):
- Week 1: Story 5.1 (Tasks 5.1.1-5.1.10)
- Week 2: Story 5.3 (Tasks 5.3.1-5.3.6)

**Developer 2** (Testing/Docs focus):
- Week 1: Assist with 5.1, prepare for 5.2
- Week 2: Story 5.2 (Tasks 5.2.1-5.2.8)
- Week 2-3: Story 5.4 (Tasks 5.4.1-5.4.6)

**Parallel Work**:
- Week 1, Days 1-3: Both on Story 5.1 (critical path)
- Week 1, Days 4-5: Dev1 finishes 5.1, Dev2 sets up tests
- Week 2: Dev1 on error handling, Dev2 on tests (parallel)

---

## Quality Gates

### Gate 1: End of Sprint 1
**Criteria**:
- [ ] CLI generates complete MCP server (39 tools, 220 types)
- [ ] Generated code compiles without TypeScript errors
- [ ] Generated server starts and accepts stdio input
- [ ] No hello-world template code in output
- [ ] Manual testing successful with Ozon API

**Decision**: Proceed to Sprint 2 or extend Sprint 1

---

### Gate 2: End of Sprint 2
**Criteria**:
- [ ] All 6+ integration tests passing
- [ ] Tests complete in <60 seconds
- [ ] CI/CD pipeline runs tests automatically
- [ ] Error handling provides actionable messages
- [ ] Rollback works on generation failure
- [ ] No test flakiness (100% pass rate over 10 runs)

**Decision**: Proceed to Sprint 3 or fix quality issues

---

### Gate 3: Pre-Release
**Criteria**:
- [ ] All stories 5.1-5.4 complete
- [ ] External tester completes tutorial in <5 minutes
- [ ] All documentation links work
- [ ] Example server runs successfully
- [ ] CHANGELOG.md updated
- [ ] Version tagged (v0.3.0)

**Decision**: Release or defer for additional polish

---

## Success Metrics

### Functional Metrics

**Tool Generation Success**:
- Target: 100% of operations → tools
- Measurement: `tool_count === operation_count`
- Current: 2.6% (1/39 for Ozon API)
- **Sprint 1 Exit**: 100% (39/39)

**Type Generation Success**:
- Target: 100% of schemas → interfaces
- Measurement: `interface_count >= schema_count`
- Current: 0% (no types generated)
- **Sprint 1 Exit**: 100% (220+/220)

**Test Coverage**:
- Target: 6+ end-to-end integration tests
- Measurement: Test suite size
- Current: 0 integration tests
- **Sprint 2 Exit**: 6+ tests passing

### Quality Metrics

**Generated Code Quality**:
- Target: 0 TypeScript errors
- Measurement: `tsc --noEmit` exit code
- Current: N/A (not generated)
- **Sprint 1 Exit**: 0 errors

**Error Message Quality**:
- Target: 90% include actionable suggestions
- Measurement: Manual review
- Current: ~60% (generic errors)
- **Sprint 2 Exit**: 90%+

**Documentation Accuracy**:
- Target: 100% match between docs and behavior
- Measurement: Manual validation
- Current: 0% (docs describe non-existent behavior)
- **Sprint 3 Exit**: 100%

### Performance Metrics

**Generation Time**:
- Target: <30 seconds for 260KB spec
- Measurement: End-to-end pipeline time
- Current: ~2 seconds (template copy only)
- **Sprint 1 Exit**: <30 seconds

**Test Execution Time**:
- Target: <60 seconds for full suite
- Measurement: CI/CD test duration
- Current: N/A
- **Sprint 2 Exit**: <60 seconds

---

## Risk Management

### High Priority Risks

**Risk 1: Generated Code Compilation Failures**
- **Impact**: High - Blocks core functionality
- **Probability**: Medium
- **Mitigation Sprint 1**: Test with multiple OpenAPI specs early
- **Mitigation Sprint 2**: Add compilation validation in tests
- **Owner**: Developer 1

**Risk 2: Time Estimation Accuracy**
- **Impact**: Medium - May delay release
- **Probability**: Medium
- **Mitigation**: 10% time buffer, daily standup check-ins
- **Fallback**: Defer Story 5.4 to post-release if needed
- **Owner**: Project Manager

**Risk 3: Test Flakiness**
- **Impact**: Medium - CI/CD reliability
- **Probability**: Medium
- **Mitigation Sprint 2**: Proper timeout handling, process cleanup
- **Fallback**: Increase timeouts, retry logic
- **Owner**: Developer 2 (if 2-dev) or Developer 1

### Medium Priority Risks

**Risk 4: External Tester Unavailability**
- **Impact**: Low - Can use internal tester
- **Probability**: Low
- **Mitigation**: Line up tester early
- **Fallback**: Internal team member
- **Owner**: Product Manager

**Risk 5: Documentation Scope Creep**
- **Impact**: Low - Delays release
- **Probability**: Medium
- **Mitigation**: Use templates from story details
- **Fallback**: Defer architecture guide
- **Owner**: Developer 2 or Technical Writer

---

## Daily Standup Format

**Questions**:
1. What did you complete yesterday?
2. What will you work on today?
3. Any blockers or risks?

**Example** (Week 1, Day 3):
- **Completed**: Tasks 5.1.1-5.1.4 (scaffold working)
- **Today**: Tasks 5.1.5-5.1.6 (interface and tool generation)
- **Blockers**: None. On track for Sprint 1 completion.

---

## Definition of Done (Epic Level)

### Story 5.1: Refactor CLI
- [ ] All 10 tasks complete
- [ ] CLI generates complete MCP server
- [ ] Generated code compiles
- [ ] Generated server runs
- [ ] Code review approved

### Story 5.2: Integration Tests
- [ ] All 8 tasks complete
- [ ] 6+ integration tests passing
- [ ] Tests in CI/CD pipeline
- [ ] <60 second execution time
- [ ] Code review approved

### Story 5.3: Error Handling
- [ ] All 6 tasks complete
- [ ] Validation catches errors early
- [ ] Rollback works on failure
- [ ] Error messages actionable
- [ ] Code review approved

### Story 5.4: Documentation
- [ ] All 6 tasks complete
- [ ] External tester validates tutorial
- [ ] All links work
- [ ] Example server runs
- [ ] Documentation review approved

### Epic Complete
- [ ] All 4 stories complete
- [ ] All quality gates passed
- [ ] Version tagged (v0.3.0)
- [ ] CHANGELOG.md updated
- [ ] Release notes published
- [ ] npm package published

---

## Communication Plan

### Daily Updates
- **Format**: Slack/Discord standup
- **Time**: 9:00 AM daily
- **Participants**: Developers, PM, Tech Lead
- **Duration**: 15 minutes

### Sprint Review
- **Format**: Demo meeting
- **Time**: End of each sprint (Friday)
- **Participants**: Full team, stakeholders
- **Duration**: 30 minutes
- **Agenda**: Demo working features, discuss blockers

### Sprint Retrospective
- **Format**: Team reflection
- **Time**: After sprint review
- **Participants**: Development team
- **Duration**: 30 minutes
- **Focus**: What went well, what to improve

---

## Release Checklist

### Pre-Release (Week 3, Day 5)
- [ ] All stories complete and merged to `main`
- [ ] All tests passing in CI/CD
- [ ] Version bumped to v0.3.0
- [ ] CHANGELOG.md updated
- [ ] README.md verified
- [ ] Example server tested
- [ ] Documentation links verified

### Release (Week 3, Day 5)
- [ ] Git tag created: `v0.3.0`
- [ ] GitHub release created
- [ ] npm package published
- [ ] Release notes published
- [ ] Documentation site updated
- [ ] Announcement posted

### Post-Release (Week 4, Day 1)
- [ ] Monitor for issues
- [ ] Respond to user feedback
- [ ] Track adoption metrics
- [ ] Plan next epic

---

## Appendix: Task Quick Reference

### Story 5.1: Refactor CLI (8 SP, 10 tasks)
1. Remove template copying (0.5 SP)
2. Import generator functions (0.5 SP)
3. Output directory validation (1 SP)
4. scaffoldProject() invocation (1 SP)
5. generateInterfaces() invocation (1.5 SP)
6. generateToolDefinitions() invocation (1.5 SP)
7. generateMainServerFile() invocation (1 SP)
8. generateHttpClient() invocation (1 SP)
9. Export writeFile utility (0.5 SP)
10. Comprehensive logging (0.5 SP)

### Story 5.2: Integration Tests (5 SP, 8 tasks)
1. Test infrastructure (1 SP)
2. Test fixtures (0.5 SP)
3. Ozon API test (1 SP)
4. Compilation test (0.5 SP)
5. Server startup test (1 SP)
6. Minimal spec test (0.5 SP)
7. Error case tests (0.5 SP)
8. CI/CD integration (0.5 SP)

### Story 5.3: Error Handling (3 SP, 6 tasks)
1. Validation utilities (0.5 SP)
2. Progress reporting (0.5 SP)
3. Atomic generation (1 SP)
4. Error handlers (0.5 SP)
5. Debug mode (0.25 SP)
6. Error tests (0.25 SP)

### Story 5.4: Documentation (3 SP, 6 tasks)
1. Update README (0.5 SP)
2. Quick-start tutorial (0.5 SP)
3. Architecture guide (0.5 SP)
4. Troubleshooting guide (0.75 SP)
5. Example server (0.5 SP)
6. External validation (0.25 SP)

---

**Sprint Plan Version**: 1.0
**Created**: 2025-01-06
**Epic Reference**: docs/epics/EPIC-005-Fix-MCP-Generation-Pipeline.md
**Next Review**: Start of Sprint 1
