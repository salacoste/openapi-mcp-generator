# Source Tree

**OpenAPI-to-MCP Generator Project**
**Version:** 1.0
**Last Updated:** 2025-01-04

---

## Purpose

This document provides a **comprehensive reference** for the OpenAPI-to-MCP Generator repository structure. It details every directory, file purpose, naming conventions, and organizational principles to guide both human and AI developers.

⚠️ **CRITICAL**: This structure must be maintained consistently across all packages to ensure developer productivity and AI-assisted development effectiveness.

---

## Table of Contents

1. [Repository Overview](#repository-overview)
2. [Root-Level Structure](#root-level-structure)
3. [Package Structure](#package-structure)
4. [File Naming Conventions](#file-naming-conventions)
5. [Directory Purposes](#directory-purposes)
6. [Configuration Files](#configuration-files)
7. [Documentation Structure](#documentation-structure)
8. [Testing Organization](#testing-organization)
9. [Generated Code Structure](#generated-code-structure)
10. [Development Workflow](#development-workflow)

---

## Repository Overview

### Monorepo Type
**pnpm Workspaces** with 4 specialized packages

### Root Structure Philosophy
- **Separation of Concerns:** Each package has single responsibility
- **Discoverability:** Clear naming, logical grouping
- **Tooling Consistency:** Shared configurations at root, package-specific at package level
- **AI-Friendly:** Predictable paths, standard conventions

---

## Root-Level Structure

```
openapi-to-mcp/
├── .github/                    # GitHub-specific configurations
│   ├── workflows/              # CI/CD pipelines
│   │   ├── test.yml            # Test workflow (multi-OS, multi-Node)
│   │   └── publish.yml         # npm publishing workflow
│   ├── dependabot.yml          # Dependency update automation
│   └── ISSUE_TEMPLATE/         # Issue templates
├── packages/                   # Monorepo packages (see below)
│   ├── cli/                    # Command-line interface
│   ├── parser/                 # OpenAPI 3.0 parsing
│   ├── generator/              # Code generation engine
│   └── templates/              # Boilerplate templates
├── examples/                   # Real-world test cases
│   ├── petstore/               # OpenAPI Petstore example
│   │   ├── openapi.json        # Input OpenAPI spec
│   │   └── generated/          # Generated MCP server output
│   ├── github-api/             # GitHub API subset
│   └── ozon-performance/       # Ozon Performance API (300+ methods)
├── tests/                      # Cross-package integration tests
│   ├── integration/            # Integration test suites
│   │   ├── full-pipeline.test.ts
│   │   └── cli-commands.test.ts
│   ├── e2e/                    # End-to-end tests
│   │   └── generated-server.test.ts
│   └── fixtures/               # Test data
│       ├── openapi/            # Sample OpenAPI specs
│       └── expected-output/    # Expected generated code
├── docs/                       # Project documentation
│   ├── architecture/           # Architecture documents
│   │   ├── architecture.md     # Main architecture doc
│   │   ├── coding-standards.md # TypeScript coding standards
│   │   ├── tech-stack.md       # Technology decisions
│   │   └── source-tree.md      # THIS DOCUMENT
│   ├── prd/                    # Product requirements
│   ├── api/                    # Generated API docs (TypeDoc)
│   └── guides/                 # User guides
├── scripts/                    # Development scripts
│   ├── setup-dev.sh            # Development environment setup
│   ├── publish-all.sh          # Publish all packages
│   └── clean-all.sh            # Clean build artifacts
├── .vscode/                    # VS Code workspace settings
│   ├── settings.json           # Editor settings
│   ├── extensions.json         # Recommended extensions
│   └── launch.json             # Debug configurations
├── .husky/                     # Git hooks (via husky)
│   └── pre-commit              # Pre-commit linting
├── pnpm-workspace.yaml         # pnpm workspace configuration
├── package.json                # Root package.json (workspace scripts)
├── tsconfig.json               # Base TypeScript configuration
├── tsconfig.build.json         # Build-specific TS config
├── vitest.config.ts            # Vitest configuration
├── .eslintrc.json              # ESLint configuration
├── .prettierrc.json            # Prettier configuration
├── .gitignore                  # Git ignore patterns
├── .npmignore                  # npm publish ignore patterns
├── LICENSE                     # MIT License
└── README.md                   # Project overview
```

---

## Package Structure

### Standard Package Layout

Each package follows this consistent structure:

```
packages/<package-name>/
├── src/                        # Source code (TypeScript)
│   ├── index.ts                # Public API entry point
│   ├── types.ts                # Shared type definitions
│   ├── errors.ts               # Custom error classes
│   └── <feature>/              # Feature-based organization
│       ├── feature.ts          # Main implementation
│       ├── feature.test.ts     # Unit tests (co-located)
│       └── utils.ts            # Helper functions
├── __tests__/                  # Additional tests (if needed)
│   ├── integration/            # Integration tests
│   └── fixtures/               # Test data
├── dist/                       # Build output (ignored by git)
│   ├── index.js                # ESM JavaScript
│   ├── index.d.ts              # Type definitions
│   └── index.d.ts.map          # Source maps
├── package.json                # Package configuration
├── tsconfig.json               # Package-specific TS config (extends root)
├── vitest.config.ts            # Package-specific test config
└── README.md                   # Package documentation
```

---

## Package Details

### 1. CLI Package (`packages/cli/`)

**Responsibility:** Command-line interface, user interaction, pipeline orchestration

```
packages/cli/
├── src/
│   ├── index.ts                # CLI entry point (shebang, bin)
│   ├── cli.ts                  # Commander.js setup
│   ├── types.ts                # CLI-specific types
│   ├── errors.ts               # CLI error classes
│   ├── commands/               # Command implementations
│   │   ├── generate.ts         # 'generate' command logic
│   │   └── validate.ts         # 'validate' command (future)
│   ├── ui/                     # Terminal UI components
│   │   ├── progress.ts         # Progress bars (ora)
│   │   ├── errors.ts           # Error formatting (chalk)
│   │   └── prompts.ts          # User prompts (inquirer - future)
│   └── validation/             # Input validation
│       └── options.ts          # CLI argument validation (zod)
├── __tests__/
│   ├── cli.test.ts
│   └── commands/
│       └── generate.test.ts
├── dist/
├── package.json                # Includes "bin" field
├── tsconfig.json
└── README.md
```

**Key Files:**
- `index.ts`: Shebang (`#!/usr/bin/env node`), imports `cli.ts`
- `cli.ts`: Commander setup, command registration
- `commands/generate.ts`: Main generation workflow

---

### 2. Parser Package (`packages/parser/`)

**Responsibility:** OpenAPI 3.0 validation, $ref resolution, normalization

```
packages/parser/
├── src/
│   ├── index.ts                # Public API: parseOpenAPI()
│   ├── parser.ts               # Main parser class
│   ├── types.ts                # ParsedOpenAPI, NormalizedOperation types
│   ├── errors.ts               # ParserError, ValidationError
│   ├── validators/             # OpenAPI validation
│   │   ├── schema-validator.ts # JSON Schema validation (ajv)
│   │   └── security-validator.ts
│   ├── normalizers/            # Data normalization
│   │   ├── operation-normalizer.ts
│   │   ├── parameter-normalizer.ts
│   │   └── schema-normalizer.ts
│   ├── resolvers/              # $ref resolution
│   │   ├── ref-resolver.ts     # Internal $refs
│   │   └── external-resolver.ts # External $refs (HTTPS)
│   └── extractors/             # Data extraction
│       ├── security-extractor.ts
│       ├── tag-extractor.ts
│       └── operation-extractor.ts
├── __tests__/
│   ├── parser.test.ts
│   ├── validators/
│   ├── normalizers/
│   └── fixtures/               # Sample OpenAPI specs
│       ├── valid/
│       └── invalid/
├── dist/
├── package.json
├── tsconfig.json
└── README.md
```

**Key Files:**
- `parser.ts`: Orchestrates validation → resolution → normalization
- `resolvers/ref-resolver.ts`: Core $ref resolution logic
- `normalizers/operation-normalizer.ts`: Transforms paths into operations

---

### 3. Generator Package (`packages/generator/`)

**Responsibility:** Code generation, template rendering, TypeScript AST manipulation

```
packages/generator/
├── src/
│   ├── index.ts                # Public API: generateMCPServer()
│   ├── generator.ts            # Main generator orchestrator
│   ├── types.ts                # GeneratorOptions, GeneratedMCPServer types
│   ├── errors.ts               # GeneratorError, CompilationError
│   ├── strategies/             # Code generation strategies
│   │   ├── template-strategy.ts # Handlebars-based generation
│   │   └── ast-strategy.ts     # ts-morph AST generation
│   ├── renderers/              # Template rendering
│   │   ├── handlebars-renderer.ts
│   │   └── helpers.ts          # Handlebars custom helpers
│   ├── type-mapper/            # OpenAPI → TypeScript type mapping
│   │   ├── type-mapper.ts
│   │   ├── primitive-mapper.ts
│   │   └── object-mapper.ts
│   ├── file-writer/            # File system operations
│   │   ├── file-writer.ts
│   │   └── atomic-writer.ts    # Atomic file writes (temp + rename)
│   └── validation/             # Generated code validation
│       └── typescript-validator.ts # tsc --noEmit check
├── __tests__/
│   ├── generator.test.ts
│   ├── type-mapper/
│   └── fixtures/
│       └── expected-output/
├── dist/
├── package.json
├── tsconfig.json
└── README.md
```

**Key Files:**
- `generator.ts`: Orchestrates template rendering + AST generation
- `type-mapper/type-mapper.ts`: OpenAPI schemas → TypeScript interfaces
- `file-writer/atomic-writer.ts`: Ensures atomic file writes

---

### 4. Templates Package (`packages/templates/`)

**Responsibility:** Handlebars templates for MCP server boilerplate

```
packages/templates/
├── src/
│   ├── index.ts                # Template registry
│   ├── types.ts                # Template data types
│   ├── mcp-server/             # MCP server templates
│   │   ├── index.hbs           # Main server entry point
│   │   ├── tools.hbs           # MCP tool definitions
│   │   └── package-json.hbs    # Generated package.json
│   ├── auth/                   # Authentication handlers
│   │   ├── api-key.hbs         # API Key auth
│   │   ├── bearer.hbs          # Bearer token auth
│   │   └── basic.hbs           # Basic auth
│   ├── http/                   # HTTP client templates
│   │   ├── client.hbs          # axios client setup
│   │   └── interceptors.hbs    # Auth interceptors
│   ├── config/                 # Configuration templates
│   │   ├── env.hbs             # .env.example
│   │   └── gitignore.hbs       # .gitignore
│   └── docs/                   # Documentation templates
│       └── readme.hbs          # Generated README.md
├── __tests__/
│   └── templates.test.ts
├── dist/
├── package.json
├── tsconfig.json
└── README.md
```

**Key Files:**
- `mcp-server/index.hbs`: Main MCP server template
- `auth/*.hbs`: Authentication strategy templates
- `docs/readme.hbs`: Generated server README

---

## File Naming Conventions

### TypeScript Files

| Type | Convention | Example |
|------|-----------|---------|
| **Source Files** | `kebab-case.ts` | `parse-openapi.ts` |
| **Test Files** | `kebab-case.test.ts` | `parse-openapi.test.ts` |
| **Type Definitions** | `types.ts` | `packages/parser/src/types.ts` |
| **Error Classes** | `errors.ts` | `packages/cli/src/errors.ts` |
| **Barrel Exports** | `index.ts` | `packages/parser/src/index.ts` |

### Template Files

| Type | Convention | Example |
|------|-----------|---------|
| **Handlebars Templates** | `kebab-case.hbs` | `api-key.hbs`, `package-json.hbs` |

### Configuration Files

| Type | Convention | Example |
|------|-----------|---------|
| **JSON Configs** | `lowercase.json` | `tsconfig.json`, `package.json` |
| **YAML Configs** | `kebab-case.yaml` | `pnpm-workspace.yaml` |
| **Dotfiles** | `.lowercase` | `.eslintrc.json`, `.prettierrc.json` |

### Documentation Files

| Type | Convention | Example |
|------|-----------|---------|
| **Markdown Docs** | `kebab-case.md` | `coding-standards.md` |
| **Uppercase Docs** | `UPPERCASE.md` | `README.md`, `LICENSE` |

---

## Directory Purposes

### `/packages/`
**Purpose:** Monorepo packages (each independently publishable to npm)

**Organization:** By responsibility (CLI, Parser, Generator, Templates)

**Rules:**
- Each package has `package.json` with unique name (`@openapi-to-mcp/<name>`)
- Packages can depend on each other (e.g., CLI depends on Parser + Generator)
- No circular dependencies allowed

### `/examples/`
**Purpose:** Real-world OpenAPI specs + generated outputs for validation

**Organization:** By API name

**Contents:**
- `openapi.json` or `openapi.yaml`: Input spec
- `generated/`: Output MCP server (for manual inspection)

**Usage:**
- Integration testing (compare generated output)
- Documentation examples
- Debugging edge cases

### `/tests/`
**Purpose:** Cross-package integration and E2E tests

**Organization:**
- `integration/`: Multi-package workflows
- `e2e/`: Full CLI execution tests
- `fixtures/`: Shared test data

**Why Separate?** Package-level `__tests__/` for unit tests, root-level for cross-cutting tests

### `/docs/`
**Purpose:** Project documentation (architecture, guides, API references)

**Organization:**
- `architecture/`: Technical design docs
- `prd/`: Product requirements
- `api/`: Generated TypeDoc API documentation
- `guides/`: User-facing tutorials

### `/scripts/`
**Purpose:** Development automation scripts

**Examples:**
- `setup-dev.sh`: Install dependencies, setup git hooks
- `publish-all.sh`: Publish all packages to npm
- `clean-all.sh`: Remove `node_modules` and `dist/`

### `/.github/`
**Purpose:** GitHub-specific configurations

**Contents:**
- `workflows/`: CI/CD pipelines (GitHub Actions)
- `dependabot.yml`: Automated dependency updates
- `ISSUE_TEMPLATE/`: Issue templates

### `/.vscode/`
**Purpose:** VS Code workspace settings

**Contents:**
- `settings.json`: Editor formatting, TypeScript settings
- `extensions.json`: Recommended extensions (ESLint, Prettier)
- `launch.json`: Debug configurations

---

## Configuration Files

### Root-Level Configurations

#### `pnpm-workspace.yaml`
**Purpose:** Define monorepo packages

```yaml
packages:
  - 'packages/*'
```

#### `tsconfig.json` (Base)
**Purpose:** Shared TypeScript configuration for all packages

**Key Settings:**
- `strict: true`
- `module: "NodeNext"`
- `target: "ES2022"`

**Package Inheritance:**
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

#### `vitest.config.ts`
**Purpose:** Test configuration (coverage thresholds, globals)

```typescript
export default defineConfig({
  test: {
    coverage: {
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    },
  },
});
```

#### `.eslintrc.json`
**Purpose:** Linting rules (TypeScript ESLint + Prettier integration)

#### `.prettierrc.json`
**Purpose:** Code formatting rules (semi, singleQuote, printWidth: 100)

---

## Documentation Structure

### `/docs/architecture/`

| File | Purpose | Audience |
|------|---------|----------|
| `architecture.md` | Main architecture document | Developers, AI agents |
| `coding-standards.md` | TypeScript coding conventions | All contributors |
| `tech-stack.md` | Technology decisions | Architects, PMs |
| `source-tree.md` | Repository structure (this doc) | New developers |
| `architecture-data-models.md` | Data model specifications | Backend developers |
| `architecture-workflows.md` | Sequence diagrams | System integrators |
| `architecture-validation.md` | Checklist results | QA, architects |

### `/docs/prd/`

Product Requirements Documentation (sharded):
- `index.md`: PRD overview
- `1-goals-and-background-context.md`
- `2-requirements.md`
- `3-user-interface-design-goals.md`
- ...

### `/docs/api/`

Generated TypeDoc API documentation (auto-generated from TSDoc comments)

**Build Command:**
```bash
pnpm typedoc --entryPoints packages/*/src/index.ts --out docs/api
```

---

## Testing Organization

### Unit Tests (Co-Located)

```
packages/<package>/src/
├── feature/
│   ├── feature.ts
│   └── feature.test.ts        # ✅ Co-located with source
```

**Rationale:** Easier to maintain, clear ownership

### Integration Tests (Root-Level)

```
tests/integration/
├── full-pipeline.test.ts       # CLI → Parser → Generator → Output
├── auth-handlers.test.ts       # Test all auth types
└── error-handling.test.ts      # Error propagation
```

### E2E Tests (Root-Level)

```
tests/e2e/
├── generated-server.test.ts    # Run generated MCP server
└── cli-commands.test.ts        # Test CLI commands in real shell
```

### Test Fixtures

```
tests/fixtures/
├── openapi/
│   ├── petstore.json           # Simple API (10 methods)
│   ├── github-api.json         # Medium API (50 methods)
│   └── ozon-performance.json   # Large API (300+ methods)
└── expected-output/
    └── petstore/
        ├── index.ts
        ├── types.ts
        └── package.json
```

---

## Generated Code Structure

### MCP Server Output

When running `openapi-to-mcp generate ./spec.json --output ./my-server`, the generated structure is:

```
my-server/
├── src/
│   ├── index.ts                # MCP server entry point
│   ├── types.ts                # Generated TypeScript interfaces
│   ├── tools.ts                # MCP tool definitions
│   ├── http-client.ts          # axios client with auth
│   └── auth/
│       └── bearer.ts           # Auth handler (if Bearer token)
├── package.json                # Dependencies: @modelcontextprotocol/sdk, axios, dotenv
├── tsconfig.json               # TypeScript configuration
├── .env.example                # Example environment variables
├── .gitignore                  # Ignore .env, node_modules
└── README.md                   # Usage instructions
```

**Installation Flow:**
```bash
cd my-server
npm install
npm run build
# Configure .env
node dist/index.js
```

---

## Development Workflow

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/<org>/openapi-to-mcp.git
cd openapi-to-mcp

# 2. Install dependencies
pnpm install

# 3. Build all packages
pnpm --filter "*" build

# 4. Run tests
pnpm test

# 5. Verify CLI
pnpm --filter "@openapi-to-mcp/cli" dev
```

### Development Loop

```bash
# 1. Make changes to package (e.g., parser)
cd packages/parser
# Edit src/parser.ts

# 2. Run tests in watch mode
pnpm test:watch

# 3. Build package
pnpm build

# 4. Test CLI with changes
cd ../cli
pnpm dev -- generate ../../examples/petstore/openapi.json --output /tmp/test-output

# 5. Verify generated code
cd /tmp/test-output
npm install
npm run build
```

### Adding a New Package

```bash
# 1. Create package directory
mkdir packages/new-package
cd packages/new-package

# 2. Initialize package.json
pnpm init

# 3. Create standard structure
mkdir -p src __tests__ dist
touch src/index.ts src/types.ts src/errors.ts

# 4. Create tsconfig.json (extends root)
cat > tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "__tests__"]
}
EOF

# 5. Update pnpm-workspace.yaml (if needed)
# Already includes 'packages/*'
```

---

## Version History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-04 | 1.0 | Initial source tree documentation | Winston (Architect) |

---

## Related Documents

- **[Architecture](./architecture.md)** - System design overview
- **[Coding Standards](./coding-standards.md)** - TypeScript conventions
- **[Tech Stack](./tech-stack.md)** - Technology decisions

---

**Document Status:** ✅ Active - Single source of truth for repository structure
**Maintenance:** Update when adding new packages or reorganizing structure

---

*Generated by Winston (Architect Agent) for the OpenAPI-to-MCP Generator project.*
