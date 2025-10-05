# Pull Request

## Description

<!-- Provide a clear and concise description of your changes -->

## Related Issue

<!-- Link to related issue(s) using #issue_number -->
Closes #

## Type of Change

<!-- Mark the relevant option with an "x" -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🔧 Refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] ✅ Test update
- [ ] 🏗️ Build/CI update

## Changes Made

<!-- List the specific changes in this PR -->

-
-
-

## Testing

<!-- Describe the tests you ran and how to reproduce them -->

### Test Plan

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed
- [ ] All existing tests pass

### Test Commands

```bash
# Commands used to test changes
pnpm test
pnpm test:coverage
```

### Test Results

<!-- Include relevant test output or screenshots -->

```
# Paste test results here
```

## Coverage

<!-- Report test coverage for your changes -->

- **Current Coverage:** _%
- **Coverage Change:** +/-_%
- **Meets Threshold:** [ ] Yes / [ ] No (≥65% lines, ≥70% branches)

## Breaking Changes

<!-- If this PR includes breaking changes, describe them and the migration path -->

**Breaking Changes:**
-

**Migration Guide:**
-

## Checklist

<!-- Mark completed items with an "x" -->

### Code Quality

- [ ] My code follows the project's code style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings or errors
- [ ] No console.log statements left in code (unless intentional with eslint-disable)

### Testing

- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Test coverage meets or exceeds the 65% threshold
- [ ] I have tested edge cases and error scenarios

### Documentation

- [ ] I have updated the documentation accordingly
- [ ] I have updated the README.md if needed
- [ ] I have added/updated JSDoc comments for new functions
- [ ] API changes are documented in relevant README files

### Dependencies

- [ ] I have checked for dependency vulnerabilities (`pnpm audit`)
- [ ] All new dependencies are necessary and justified
- [ ] I have updated package.json version constraints appropriately
- [ ] Lock file (pnpm-lock.yaml) is updated

### Git

- [ ] My commits follow the conventional commit format
- [ ] Commit messages are clear and descriptive
- [ ] No merge conflicts with main branch
- [ ] Branch is up to date with main

### CI/CD

- [ ] All CI checks pass (tests, lint, build)
- [ ] No TypeScript compilation errors (`pnpm tsc --noEmit`)
- [ ] ESLint passes with no errors (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)

## Additional Context

<!-- Add any other context, screenshots, or information about the PR here -->

## Reviewer Notes

<!-- Any specific areas you'd like reviewers to focus on? -->

---

**For Reviewers:**

### Review Checklist

- [ ] Code follows project standards and best practices
- [ ] Logic is sound and efficient
- [ ] Tests adequately cover the changes
- [ ] Documentation is clear and complete
- [ ] No security vulnerabilities introduced
- [ ] Performance implications considered
- [ ] Breaking changes properly documented

### Review Comments

<!-- Reviewers: Add your comments and feedback here -->
