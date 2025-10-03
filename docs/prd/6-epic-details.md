# 6. Epic Details

This document contains the detailed epic breakdown and user stories for the OpenAPI-to-MCP Generator project.

---

## Epic List Overview

**Epic 1: Foundation & Core CLI Infrastructure**
Establish project setup, monorepo structure, CLI framework, and basic command parsing with initial "hello world" generation capability to validate end-to-end pipeline.

**Epic 2: OpenAPI Parsing & Validation Engine**
Build robust OpenAPI 3.0 parser with validation, `$ref` resolution, and schema normalization that handles real-world API specifications.

**Epic 3: TypeScript Code Generation System**
Implement template-based code generator that produces MCP server boilerplate, type-safe interfaces, and compilable TypeScript output.

**Epic 4: Authentication & Security Handlers**
Generate authentication code for API Key, Bearer Token, and Basic Auth schemes with secure credential management via environment variables.

**Epic 5: AI-Optimized Tool Descriptions & Response Formatting**
Transform OpenAPI metadata into AI-readable tool descriptions and implement smart response formatting for improved AI comprehension.

**Epic 6: Smart Method Filtering & Discovery**
Implement tag-based categorization, search functionality, and `listMethods` MCP tool to prevent AI context overflow for large APIs.

**Epic 7: Error Handling, Validation & Polish**
Add comprehensive error messages, generation validation, compilation checks, and UX improvements for production readiness.

**Epic 8: Documentation, Examples & Release**
Create comprehensive documentation, example projects, and prepare for npm publication with beta testing and community launch.

---

## Epic 1: Foundation & Core CLI Infrastructure

**Epic Goal:** Establish project infrastructure, monorepo structure, CI/CD pipeline, and basic CLI framework with minimal "hello world" MCP server generation capability. This epic delivers the foundational development environment and proves the end-to-end pipeline works (CLI input → code generation → file output), enabling all subsequent feature development.

### Story 1.1: Project Repository Setup and Monorepo Structure

**As a** developer,
**I want** a properly configured monorepo with workspaces, linting, and TypeScript setup,
**so that** I have a solid foundation for developing multiple packages with shared tooling.

#### Acceptance Criteria

1. Repository created with monorepo structure (`packages/cli`, `packages/parser`, `packages/generator`, `packages/templates`)
2. Package manager (npm/pnpm workspaces) configured for cross-package dependencies
3. Root `package.json` with workspace configuration and shared dev dependencies
4. TypeScript configured with `tsconfig.json` (strict mode, ES modules)
5. ESLint and Prettier configured with consistent rules across all packages
6. Git repository initialized with `.gitignore` for `node_modules`, `dist`, `.env`
7. Basic `README.md` with project overview and development setup instructions
8. All packages can be installed with single command (`npm install` at root)

### Story 1.2: CI/CD Pipeline with GitHub Actions

**As a** developer,
**I want** automated testing and build verification on every commit,
**so that** code quality is maintained and breaking changes are caught early.

#### Acceptance Criteria

1. GitHub Actions workflow created for pull request validation
2. Workflow runs on Node.js 18, 20, 22 (LTS versions) in matrix
3. Workflow executes: `npm install`, TypeScript compilation (`tsc`), linting (`eslint`), unit tests
4. Workflow fails if any step fails (compilation errors, lint errors, test failures)
5. Workflow runs on macOS, Linux, Windows environments
6. Status checks required to pass before PR merge
7. Workflow caches `node_modules` for faster builds
8. Build status badge added to `README.md`

### Story 1.3: CLI Framework with Commander.js

**As a** user,
**I want** a command-line interface that accepts commands and flags,
**so that** I can interact with the OpenAPI-to-MCP generator.

#### Acceptance Criteria

1. CLI package (`packages/cli`) created with entry point (`src/index.ts`)
2. Commander.js integrated for command parsing
3. `generate` command registered with signature: `generate <openapi-path> --output <dir>`
4. Flags implemented: `--format [json|yaml]`, `--verbose`, `--auth-type [apiKey|bearer|basic]`, `--help`, `--version`
5. `--help` displays usage examples and flag descriptions
6. `--version` displays package version from `package.json`
7. Invalid arguments show helpful error messages with usage hint
8. CLI executable via `npx openapi-to-mcp` (bin configuration in `package.json`)
9. CLI can be invoked locally during development (`npm run cli` from workspace root)

### Story 1.4: Basic File System Operations and Output Structure

**As a** developer,
**I want** utilities for creating directories and writing files,
**so that** the generator can output MCP server code to the file system.

#### Acceptance Criteria

1. File system utility module created (`packages/generator/src/fs-utils.ts`)
2. Function `createDirectory(path)` creates directory with parent directories if needed
3. Function `writeFile(path, content)` writes string content to file with UTF-8 encoding
4. Function `copyTemplate(source, dest)` copies template files to output directory
5. Error handling for file system errors (permissions, disk space) with clear messages
6. Output directory structure validated: `<output-dir>/src/`, `<output-dir>/package.json`, `<output-dir>/README.md`
7. If output directory exists, prompt user for confirmation or use `--force` flag to overwrite
8. All file operations logged in verbose mode (`--verbose`)

### Story 1.5: Hello World MCP Server Template and Generation

**As a** user,
**I want** the CLI to generate a minimal "hello world" MCP server,
**so that** I can verify the end-to-end pipeline works before building full features.

#### Acceptance Criteria

1. Template created in `packages/templates/hello-world/` with minimal MCP server code
2. Template includes: `src/index.ts` (MCP server with one `hello` tool), `package.json`, `README.md`, `.env.example`
3. CLI `generate` command copies hello-world template to output directory
4. Generated `package.json` includes correct dependencies: `@modelcontextprotocol/sdk`, `dotenv`
5. Generated `README.md` includes setup instructions and example usage
6. Generated code compiles successfully with TypeScript (`tsc`)
7. Generated MCP server can be started with `node dist/index.js`
8. Generated MCP server responds to `hello` tool invocation with "Hello from MCP!"
9. Success message displayed after generation: "✅ MCP server generated successfully at <output-dir>"
10. Verbose mode shows step-by-step generation progress

### Story 1.6: Unit Testing Framework Setup

**As a** developer,
**I want** a testing framework configured for all packages,
**so that** I can write and run unit tests for code validation.

#### Acceptance Criteria

1. Jest (or Vitest) installed as dev dependency at workspace root
2. Jest configuration file (`jest.config.js`) created with TypeScript support
3. Test script added to root `package.json`: `npm test` runs all package tests
4. Each package has `__tests__/` directory for test files
5. Example test file created for CLI command parsing (validates `generate` command registration)
6. Example test file created for file system utilities (validates directory creation, file writing)
7. Tests run successfully in CI/CD pipeline
8. Test coverage reporting configured (Istanbul/c8)
9. Coverage thresholds set: ≥80% for new code (enforced in CI)

### Story 1.7: Error Handling and Logging System

**As a** user,
**I want** clear error messages when something goes wrong,
**so that** I can understand and fix issues quickly.

#### Acceptance Criteria

1. Custom error classes created: `CLIError`, `FileSystemError`, `ValidationError`
2. Error messages include: error type, description, file/location context, suggested fix
3. Errors displayed in red color with clear formatting
4. Logging utility created with log levels: `error`, `warn`, `info`, `debug`
5. Default log level: `info` (shows important messages only)
6. `--verbose` flag enables `debug` level (shows detailed execution flow)
7. `--quiet` flag suppresses all output except errors
8. Stack traces shown only in `--verbose` mode
9. Exit codes: 0 for success, 1 for user errors, 2 for internal errors
10. All errors caught at top level with graceful handling (no unhandled promise rejections)

### Story 1.8: Development Documentation and Contributing Guide

**As a** contributor,
**I want** clear documentation on how to set up the development environment and contribute,
**so that** I can start working on the project efficiently.

#### Acceptance Criteria

1. `CONTRIBUTING.md` created with development setup instructions
2. Documentation includes: prerequisites (Node.js version), installation steps, running tests, building packages
3. Code style guidelines documented (ESLint/Prettier usage)
4. PR process described: branch naming, commit message format, review requirements
5. Architecture overview added to `docs/architecture.md` explaining monorepo structure
6. Each package has its own `README.md` explaining its purpose and API
7. Example development workflow documented: make change → run tests → create PR
8. Troubleshooting section for common development issues

---

**📋 Note:** This is a partial excerpt. The complete epic details with all 72 user stories are available in the full PRD documentation.

---
