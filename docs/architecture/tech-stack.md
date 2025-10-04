# Tech Stack

**OpenAPI-to-MCP Generator Project**
**Version:** 1.0
**Last Updated:** 2025-01-04

---

## Purpose

This document provides the **single source of truth** for all technology decisions in the OpenAPI-to-MCP Generator project. It details every library, framework, tool, and platform used across development, testing, and deployment.

⚠️ **CRITICAL**: This is a **read-only reference** during development. Any technology changes must be approved via architecture review.

---

## Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [Core Development Stack](#core-development-stack)
3. [Package Details](#package-details)
4. [Development Tools](#development-tools)
5. [Testing Infrastructure](#testing-infrastructure)
6. [Build & Deployment](#build--deployment)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Documentation Tools](#documentation-tools)
9. [Technology Decision Log](#technology-decision-log)
10. [Upgrade Policy](#upgrade-policy)

---

## Tech Stack Overview

### Architecture Type
**Monorepo CLI Tool** - Backend-only, no frontend/UI components

### Primary Technology Pillars

| Pillar | Technology | Version | Rationale |
|--------|-----------|---------|-----------|
| **Language** | TypeScript | 5.3.3 | Type safety, excellent tooling, prevents 90% of runtime bugs |
| **Runtime** | Node.js | 20.11.0 LTS | MCP SDK compatibility (≥18.0.0), stable through 2026 |
| **Package Manager** | pnpm | 8.15.1 | 30-50% faster installs, strict dependency resolution, monorepo support |
| **Module System** | ESM | Native | Modern standard, better tree-shaking, required by MCP SDK |

### Distribution Model
- **Primary:** npm Registry (public package)
- **Delivery:** CDN via npm's infrastructure
- **Installation:** `npx @openapi-to-mcp/cli generate <spec>`

---

## Core Development Stack

### Language & Compilation

#### TypeScript 5.3.3
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

**Key Features Used:**
- Strict mode type checking
- `import type` syntax for type-only imports
- Template literal types for code generation
- Conditional types for parser utilities

**Why TypeScript?**
- NFR6 requirement: 100% TypeScript compilation success rate
- Prevents runtime type errors (90%+ bug reduction)
- Superior IDE support (IntelliSense, refactoring)
- Self-documenting code through types

#### Node.js 20.11.0 LTS

**Engines Constraint:**
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Critical Features:**
- Native ESM support (`import`/`export`)
- `node:` protocol for built-in modules
- `fetch` API (global, no dependencies)
- Stable ABI for native modules

**LTS Timeline:**
- Active LTS: Until October 2024
- Maintenance: Until April 2026

**Why Node.js 20?**
- MCP SDK requires Node.js ≥18.0.0
- Cutting-edge features (fetch, test runner)
- Long support window for stability

### Package Management

#### pnpm 8.15.1

**Workspace Configuration:** `pnpm-workspace.yaml`
```yaml
packages:
  - 'packages/*'
```

**Performance Benefits:**
- **Install Speed:** 30-50% faster than npm/yarn
- **Disk Space:** Content-addressable storage (hard links)
- **Dependency Isolation:** Strict resolution prevents phantom dependencies

**Why pnpm?**
- Monorepo-first design
- Stricter than npm (catches missing dependencies)
- Growing adoption in TypeScript ecosystem

---

## Package Details

### CLI Packages (All Packages)

| Category | Package | Version | Purpose | License |
|----------|---------|---------|---------|---------|
| **CLI Framework** | commander | 11.1.0 | Command-line argument parsing | MIT |
| **CLI UI** | ora | 8.0.1 | Terminal spinners and progress indicators | MIT |
| **CLI UI** | chalk | 5.3.0 | Terminal string styling and colors | MIT |
| **Logging** | debug | 4.3.4 | Namespaced debugging output | MIT |

### Parser Package Dependencies

| Category | Package | Version | Purpose | License |
|----------|---------|---------|---------|---------|
| **OpenAPI Parser** | @apidevtools/swagger-parser | 10.1.0 | OpenAPI validation + $ref resolution | MIT |
| **Type Definitions** | openapi-types | 12.1.3 | TypeScript types for OpenAPI 3.0 | MIT |
| **Schema Validation** | ajv | 8.12.0 | JSON Schema validation | MIT |

**Why swagger-parser?**
- De-facto standard (1M+ weekly downloads)
- Handles complex $ref resolution (local + remote)
- Comprehensive OpenAPI 3.0 validation
- Battle-tested on thousands of real-world specs

### Generator Package Dependencies

| Category | Package | Version | Purpose | License |
|----------|---------|---------|---------|---------|
| **Template Engine** | handlebars | 4.7.8 | Boilerplate code generation | MIT |
| **AST Manipulation** | ts-morph | 21.0.1 | TypeScript AST for type generation | MIT |
| **File Operations** | fs-extra | 11.2.0 | Enhanced file system utilities | MIT |
| **Input Validation** | zod | 3.22.4 | Runtime type validation | MIT |

**Why Handlebars?**
- Logic-less templates (maintainability)
- Partials for code reuse
- No eval() security risks

**Why ts-morph?**
- High-level TypeScript AST API
- Handles complex type generation (generics, unions)
- Ensures 100% valid TypeScript output

### Generated MCP Server Dependencies

These are installed in the **generated** MCP server (not in the CLI itself):

| Category | Package | Version | Purpose | License |
|----------|---------|---------|---------|---------|
| **MCP Protocol** | @modelcontextprotocol/sdk | 0.5.0 | Official MCP implementation | MIT |
| **HTTP Client** | axios | 1.6.7 | API requests with interceptors | MIT |
| **Config** | dotenv | 16.4.1 | Environment variable loading | BSD-2-Clause |

**Why axios?**
- Interceptor support for auth injection
- TypeScript-friendly
- Request/response transformation

**Why MCP SDK 0.5.0?**
- Official Anthropic SDK
- Stable API (pre-1.0 but production-ready)
- Active maintenance

---

## Development Tools

### Code Quality & Linting

| Tool | Version | Purpose | Configuration |
|------|---------|---------|---------------|
| **ESLint** | 8.56.0 | TypeScript linting | `.eslintrc.json` |
| **Prettier** | 3.2.4 | Code formatting | `.prettierrc.json` |
| **TypeScript ESLint** | 6.15.0 | TypeScript-specific rules | Extends `@typescript-eslint/recommended` |

**ESLint Plugins:**
- `@typescript-eslint/eslint-plugin` 6.15.0
- `eslint-plugin-security` 1.7.1 (SAST)
- `eslint-config-prettier` 9.1.0 (disable conflicts)

**Prettier Configuration:**
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

### Build Tools

| Tool | Version | Purpose | Usage |
|------|---------|---------|-------|
| **TypeScript Compiler** | 5.3.3 | Type checking | `tsc --noEmit` |
| **tsup** | 8.0.1 | CLI bundling | `tsup src/index.ts --format esm --dts` |

**Why tsup?**
- ESM-first bundler
- Zero-config for TypeScript
- Generates `.d.ts` files automatically
- 10x faster than `tsc` for bundling

### Git Hooks

| Tool | Version | Purpose |
|------|---------|---------|
| **husky** | 8.0.3 | Git hook manager |
| **lint-staged** | 15.2.0 | Run linters on staged files |

**Pre-commit Hook:**
```json
{
  "*.ts": ["eslint --fix", "prettier --write"]
}
```

---

## Testing Infrastructure

### Testing Framework

| Tool | Version | Purpose | Why Chosen |
|------|---------|---------|------------|
| **Vitest** | 1.2.0 | Unit + integration tests | 2-5x faster than Jest, native ESM |
| **memfs** | 4.6.0 | In-memory file system mocking | Faster than disk I/O |
| **@vitest/coverage-v8** | 1.2.0 | Code coverage reports | Built-in V8 coverage |

**Vitest Configuration:** `vitest.config.ts`
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    },
    globals: true,
    environment: 'node',
  },
});
```

**Why Vitest?**
- Native ESM support (no configuration)
- Vite-powered (instant test reruns)
- Compatible API with Jest (easy migration)
- Superior TypeScript integration

### Test Fixtures

**Real-world OpenAPI Specs:**
- Petstore (OpenAPI official example)
- GitHub API v3
- Ozon Performance API (300+ methods)
- Stripe API subset

**Location:** `tests/fixtures/openapi/`

---

## Build & Deployment

### Build Process

**Monorepo Build Order:**
```bash
# 1. Build all packages (dependency order)
pnpm --filter "@openapi-to-mcp/parser" build
pnpm --filter "@openapi-to-mcp/templates" build
pnpm --filter "@openapi-to-mcp/generator" build
pnpm --filter "@openapi-to-mcp/cli" build

# 2. Run tests
pnpm test

# 3. Create tarball
pnpm pack
```

**CLI Bundle Output:**
```
packages/cli/dist/
├── index.js           # ESM bundle
├── index.d.ts         # Type definitions
└── index.d.ts.map     # Source maps
```

### npm Publishing

**Registry:** https://registry.npmjs.org/

**Package Name:** `@openapi-to-mcp/cli`

**Provenance:** Enabled via GitHub Actions

```yaml
- name: Publish to npm
  run: |
    npm config set //registry.npmjs.org/:_authToken=${{ secrets.NPM_TOKEN }}
    npm publish --provenance --access public
```

**Versioning:** Semantic Versioning (semver)
- Major: Breaking changes
- Minor: New features
- Patch: Bug fixes

---

## CI/CD Pipeline

### Platform

**Provider:** GitHub Actions (free for open source)

**Runner:** `ubuntu-latest` (Ubuntu 22.04)

### Workflows

#### 1. Test Workflow (`.github/workflows/test.yml`)

**Triggers:** Push to any branch, Pull Requests

**Matrix Strategy:**
```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]
    os: [ubuntu-latest, macos-latest]
```

**Steps:**
1. Checkout code
2. Setup Node.js + pnpm
3. Install dependencies (`pnpm install --frozen-lockfile`)
4. Run linter (`pnpm lint`)
5. Run tests (`pnpm test`)
6. Upload coverage to Codecov

#### 2. Publish Workflow (`.github/workflows/publish.yml`)

**Trigger:** Git tags (`v*.*.*`)

**Steps:**
1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies
4. Build packages
5. Run tests
6. Publish to npm with provenance
7. Create GitHub Release

#### 3. Dependabot (`.github/dependabot.yml`)

**Update Schedule:** Weekly

**Targets:**
- npm dependencies
- GitHub Actions

**Security Policy:**
- Critical/High: Auto-merge if tests pass
- Medium: Create PR for review

---

## Documentation Tools

### API Documentation

| Tool | Version | Purpose |
|------|---------|---------|
| **TypeDoc** | 0.25.7 | Generate API docs from TSDoc comments |
| **MkDocs Material** | 9.5.6 | Documentation site generator |

**TypeDoc Configuration:**
```json
{
  "entryPoints": ["packages/*/src/index.ts"],
  "out": "docs/api",
  "theme": "default"
}
```

### Documentation Hosting

**Platform:** GitHub Pages

**Domain:** `https://<username>.github.io/openapi-to-mcp/`

**Build:** Automated via GitHub Actions on main branch push

---

## Technology Decision Log

### Major Decisions

| Date | Decision | Rationale | Alternatives Considered |
|------|----------|-----------|-------------------------|
| 2025-01-03 | TypeScript 5.3.3 | Type safety, NFR6 compliance | JavaScript (rejected: no type safety) |
| 2025-01-03 | pnpm workspaces | Monorepo support, speed | npm workspaces, Yarn, Lerna |
| 2025-01-03 | Vitest over Jest | Native ESM, 2-5x faster | Jest (requires ts-jest), Mocha |
| 2025-01-03 | swagger-parser | De-facto standard, proven | openapi-parser (less mature) |
| 2025-01-03 | ts-morph | High-level AST API | ts-codegen (lower level), string templates |
| 2025-01-03 | Handlebars | Logic-less, maintainable | EJS (logic in templates), Mustache |
| 2025-01-03 | axios | Interceptors for auth | fetch (no interceptors), node-fetch |

### Rejected Technologies

| Technology | Reason for Rejection |
|------------|---------------------|
| **JavaScript** | No type safety, fails NFR6 (100% compilation) |
| **CommonJS** | Legacy module system, MCP SDK requires ESM |
| **Jest** | Requires ts-jest transformation, slower than Vitest |
| **Webpack** | Overkill for CLI bundling, tsup simpler |
| **OAuth2 Libraries** | Out of scope for MVP (deferred to post-MVP) |

---

## Upgrade Policy

### Semantic Versioning Compliance

**Dependencies:** Exact versions (no `^` or `~`)

**Why?** Reproducible builds, prevent supply chain attacks

**package.json Example:**
```json
{
  "dependencies": {
    "commander": "11.1.0",
    "axios": "1.6.7"
  }
}
```

### Update Schedule

| Type | Schedule | Approval Required |
|------|----------|-------------------|
| **Security Patches (Critical/High)** | Within 48 hours | No (auto-merge if tests pass) |
| **Security Patches (Medium)** | Within 2 weeks | Code review |
| **Minor Version Bumps** | Monthly | Architecture review |
| **Major Version Bumps** | Quarterly | Architecture + PM approval |

### Testing Requirements for Upgrades

Before merging dependency updates:

1. ✅ All unit tests pass
2. ✅ Integration tests pass
3. ✅ E2E CLI tests pass
4. ✅ Generated code compiles successfully
5. ✅ No new ESLint warnings
6. ✅ TypeScript compilation successful

### Security Scanning

**Tools:**
- `npm audit` (run on every PR)
- Dependabot (weekly scans)
- Snyk (optional, consider for production)

**Policy:**
- **Critical/High vulnerabilities:** Block merge
- **Medium vulnerabilities:** Create issue, fix within 2 weeks
- **Low vulnerabilities:** Track, fix opportunistically

---

## Version History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-04 | 1.0 | Initial tech stack documentation | Winston (Architect) |

---

## Related Documents

- **[Coding Standards](./coding-standards.md)** - TypeScript coding conventions
- **[Architecture](./architecture.md)** - System design overview
- **[Source Tree](./source-tree.md)** - Repository structure

---

**Document Status:** ✅ Active - Single source of truth for tech decisions
**Review Frequency:** After each Epic completion
**Change Process:** Architecture review → PR → Approval

---

*Generated by Winston (Architect Agent) for the OpenAPI-to-MCP Generator project.*
