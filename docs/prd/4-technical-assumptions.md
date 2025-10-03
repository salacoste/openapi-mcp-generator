# 4. Technical Assumptions

## 4.1 Repository Structure: Monorepo

**Decision:** Single repository with multiple packages using workspaces

**Structure:**
```
openapi-to-mcp/
├── packages/
│   ├── cli/              # CLI tool (npx openapi-to-mcp)
│   ├── parser/           # OpenAPI parsing logic
│   ├── generator/        # Code generation engine
│   └── templates/        # Code templates for generation
├── examples/             # Example swagger files + generated servers
├── docs/                 # Documentation
└── tests/                # Integration tests
```

**Rationale:**
- Simplifies dependency management and versioning
- Enables code sharing between packages (parser used by both CLI and generator)
- Single CI/CD pipeline for all components
- Easier for contributors (one repo to clone)

**Package Manager:** npm workspaces or pnpm workspaces (to be decided based on performance testing)

## 4.2 Service Architecture: Modular Monolith within Monorepo

**Architecture Pattern:** CLI orchestrator → Parser module → Generator module → File system output

**Key Modules:**

1. **CLI Package** (`packages/cli/`)
   - Command-line interface using Commander.js
   - Argument parsing and validation
   - Orchestrates parser and generator
   - Handles user interaction (prompts, progress, errors)

2. **Parser Package** (`packages/parser/`)
   - OpenAPI 3.0 validation using `@apidevtools/swagger-parser`
   - `$ref` resolution (internal and external)
   - Schema normalization and transformation
   - Exports parsed AST for generator

3. **Generator Package** (`packages/generator/`)
   - Template-based code generation
   - AST manipulation using `ts-morph`
   - File writing and directory structure creation
   - Customizable generation strategies

4. **Templates Package** (`packages/templates/`)
   - MCP server boilerplate templates
   - Authentication handler templates
   - Type generation templates
   - `package.json` and documentation templates

**Data Flow:**
```
OpenAPI File → Parser (validate + normalize) → Generator (transform + render) → MCP Server Files
```

**Plugin Architecture (Future):** Design with extension points for custom generators, auth handlers, and response formatters

## 4.3 Testing Requirements: Full Testing Pyramid

**Testing Strategy:** Unit tests, integration tests, and end-to-end testing

**Test Levels:**

1. **Unit Tests** (Target: >80% coverage)
   - Parser logic: schema validation, `$ref` resolution, type mapping
   - Generator logic: template rendering, AST manipulation, file creation
   - CLI: argument parsing, error handling
   - Test framework: Jest or Vitest

2. **Integration Tests** (Target: >70% coverage)
   - Full generation pipeline: OpenAPI → MCP server output
   - Test against 10+ real-world OpenAPI documents (various complexity levels)
   - Validate generated code compiles successfully
   - Test framework: Jest with fixture files

3. **End-to-End Tests** (Critical paths only)
   - CLI command execution in real terminal environment
   - Generated MCP server can connect to Claude Desktop
   - Generated server successfully calls actual API (using test API/mocks)
   - Test framework: Playwright or custom bash scripts

4. **Snapshot Testing**
   - Generated code snapshots for regression detection
   - Ensure code generation changes are intentional

**Continuous Integration:**
- Run all tests on every PR
- TypeScript compilation check
- Linting (ESLint) and formatting (Prettier)
- npm audit for dependency vulnerabilities

**Manual Testing Requirements:**
- Beta testers validate generated servers with their own OpenAPI docs
- Usability testing: "Time to first success" metric tracking

## 4.4 Additional Technical Assumptions and Requests

**Language & Runtime:**
- **TypeScript 5.x** for all packages (strict mode enabled)
- **Node.js ≥18.0.0** (LTS) - required for MCP SDK compatibility
- **ECMAScript modules (ESM)** for all packages

**Build & Tooling:**
- **Compiler:** `tsc` (TypeScript compiler)
- **Bundler:** `tsup` for CLI bundling (fast, zero-config)
- **CLI Framework:** Commander.js (battle-tested, excellent docs)
- **Linter:** ESLint with TypeScript plugin
- **Formatter:** Prettier (standard config)

**Generated MCP Server Dependencies:**
- **MCP SDK:** `@modelcontextprotocol/sdk` (official Anthropic SDK)
- **HTTP Client:** `axios` (typed requests/responses, interceptors)
- **Config Management:** `dotenv` for environment variables
- **Type Generation:** Fully typed from OpenAPI schemas

**OpenAPI Parsing:**
- **Primary:** `@apidevtools/swagger-parser` (validation + bundling + dereferencing)
- **Fallback:** Consider `openapi-typescript` for type generation

**Code Generation Strategy:**
- **Template Engine:** Handlebars or EJS for simple templates
- **AST Manipulation:** `ts-morph` for complex TypeScript code generation
- **Approach:** Hybrid - templates for boilerplate, AST for dynamic types

**Error Handling:**
- All async operations use try-catch with typed errors
- Custom error classes: `ParseError`, `GenerationError`, `ValidationError`
- Errors include context: file location, line number, suggested fix

**Logging:**
- Development: verbose logging to stderr
- Production: minimal output unless `--verbose` flag
- Library: `debug` package for namespaced logging

**Security:**
- No API credentials in generated code (environment variables only)
- Sanitize OpenAPI input to prevent code injection
- Regular `npm audit` and Dependabot integration
- SAST (Static Application Security Testing) in CI

**Distribution:**
- **npm Registry:** Primary distribution (`npx openapi-to-mcp`)
- **GitHub Releases:** Secondary (downloadable binaries via pkg or nexe)
- **Versioning:** Semantic versioning (semver)
- **License:** MIT (open source, permissive)

**Documentation:**
- **README.md:** Quick start, installation, basic usage
- **docs/ folder:** Architecture decisions (ADRs), API reference, contributing guide
- **Generated README:** Setup instructions, usage examples, troubleshooting
- **Hosting:** GitHub Pages (static site via MkDocs or Docusaurus)

**CI/CD:**
- **Platform:** GitHub Actions
- **Workflows:** Test on PR, publish to npm on tag, build docs on main branch
- **Environments:** Test on Node.js 18, 20, 22 (LTS versions)

**Performance Optimization:**
- Lazy loading of generator templates
- Caching of parsed OpenAPI documents
- Parallel processing for multiple file generation
- Stream-based file writing for large outputs

---
