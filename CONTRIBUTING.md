# Contributing to OpenAPI-to-MCP Generator

Thank you for your interest in contributing! This guide will help you get started.

## Prerequisites

- **Node.js**: 20.11.0 LTS or higher (≥18.0.0 supported)
- **pnpm**: 8.15.1 or higher
- **Git**: Latest version
- **TypeScript**: 5.3.3 (installed via pnpm)

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-org/openapi-to-mcp.git
cd openapi-to-mcp

# 2. Install dependencies
pnpm install

# 3. Build all packages
pnpm build

# 4. Run tests
pnpm test

# 5. Run linting
pnpm lint
```

## Monorepo Structure

This project uses pnpm workspaces for monorepo management:

```
openapi-to-mcp/
├── packages/
│   ├── cli/              # Command-line interface
│   ├── parser/           # OpenAPI parsing (Coming in Epic 2)
│   ├── generator/        # Code generation engine
│   └── templates/        # Boilerplate templates
├── docs/                 # Documentation
├── tests/                # Cross-package tests
└── examples/             # Example projects
```

Each package is independently versioned and can be published separately.

## Development Workflow

### 1. Create a Branch

```bash
# Feature branches
git checkout -b feature/story-1.X-description

# Bug fixes
git checkout -b fix/issue-description

# Documentation
git checkout -b docs/description
```

### 2. Make Changes

- Follow TypeScript strict mode
- Use ESLint and Prettier (configs provided)
- Write tests for new code
- Update documentation as needed

### 3. Run Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage

# Package-specific tests
pnpm test --filter @openapi-to-mcp/cli
```

### 4. Build and Lint

```bash
# Build all packages
pnpm build

# Lint code
pnpm lint

# Format code
pnpm format
```

### 5. Create Pull Request

```bash
# Commit your changes
git add .
git commit -m "feat: add feature description"

# Push to your fork
git push origin feature/story-1.X-description
```

Then create a PR on GitHub.

## Code Style

### TypeScript

- **Strict mode**: Enabled (`strict: true`)
- **ESM modules**: Use `import/export`, not `require()`
- **Type safety**: Avoid `any`, use `unknown` for errors
- **Explicit types**: Use explicit return types for functions

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase` (no `I` prefix)

### Import/Export Patterns

```typescript
// ✅ Good - ESM with .js extension
import { something } from './module.js';

// ❌ Bad - missing .js extension
import { something } from './module';

// ✅ Good - explicit exports
export { Class1, function1 };

// ✅ Good - barrel exports in index.ts
export * from './module1.js';
```

### Error Handling

```typescript
// ✅ Good - custom error classes
throw new ValidationError('Invalid input', { field: 'title' }, 'Add a title field');

// ❌ Bad - throwing strings
throw 'Error message';

// ✅ Good - proper async error handling
try {
  await someAsyncFunction();
} catch (error) {
  logger.error('Operation failed', error);
  throw new InternalError('Failed to process');
}
```

## Testing Guidelines

### Test Organization

- **Unit tests**: `packages/*/__ tests__/*.test.ts`
- **Integration tests**: `tests/integration/`
- **E2E tests**: `tests/e2e/`

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### Coverage Requirements

- **Lines**: ≥65% (current baseline), target 80%
- **Functions**: ≥65%
- **Branches**: ≥70%
- **Statements**: ≥65%

## Commit Messages

Follow conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test changes
- `refactor`: Code refactoring
- `chore`: Build/tooling changes

**Examples**:
```
feat(cli): add --verbose flag for debug logging
fix(generator): correct template path resolution
docs: update contributing guide
test(cli): add error handling tests
```

## Pull Request Process

1. **Create PR** with descriptive title
2. **Fill out PR template** (if provided)
3. **Ensure CI passes**:
   - TypeScript compilation
   - ESLint (no errors)
   - Tests pass (≥65% coverage)
   - Build succeeds
4. **Request review** from maintainers
5. **Address feedback** if any
6. **Merge** once approved

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added/updated for changes
- [ ] Documentation updated if needed
- [ ] All CI checks pass
- [ ] No merge conflicts with main
- [ ] Commit messages follow convention

## Troubleshooting

### pnpm Workspace Issues

```bash
# Clear pnpm cache
pnpm store prune

# Reinstall dependencies
rm -rf node_modules packages/*/node_modules
pnpm install
```

### TypeScript Errors

```bash
# Check for type errors
pnpm tsc --noEmit

# Build specific package
pnpm --filter @openapi-to-mcp/cli build
```

### Test Failures

```bash
# Run with verbose output
pnpm test --reporter=verbose

# Run specific test file
pnpm test packages/cli/__tests__/cli.test.ts

# Debug with UI
pnpm test:ui
```

### CI Failures

- **TypeScript errors**: Run `pnpm tsc --noEmit` locally
- **Lint errors**: Run `pnpm lint --fix`
- **Test failures**: Run `pnpm test` locally
- **Build failures**: Check for missing dependencies

## Getting Help

- **Documentation**: See `docs/` directory
- **Architecture**: `docs/architecture/`
- **Testing**: `docs/testing.md`
- **Issues**: [GitHub Issues](https://github.com/your-org/openapi-to-mcp/issues)

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
