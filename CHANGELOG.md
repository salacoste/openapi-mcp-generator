# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Epic 6: Technical Debt Resolution Phase 2 (2025-01-08)

#### Added
- Type coverage enforcement in CI pipeline (≥95% threshold)
- Type coverage measurement tooling (type-coverage v2.29.7)
- New npm scripts for type checking and quality gates:
  - `type-check`: Run TypeScript compilation check
  - `type-coverage`: Enforce 95% type coverage threshold
  - `type-coverage:detail`: Generate detailed type coverage report
  - `quality`: Combined quality gate (lint + type-check + type-coverage)

#### Changed
- **[BREAKING]** Removed duplicate `NormalizedSchema` type definition from generator package
- **[BREAKING]** Generator now imports canonical types from `@openapi-to-mcp/parser`
- Updated composition handling to use `schema.composition` metadata structure
- Improved type safety in `mapSchemaToTypeScript` function with proper type narrowing

#### Fixed
- Type definition mismatch between generator and parser packages
- Type safety bypass using `as any` workaround in mcp-generator.ts
- Type coverage gap (87.59% → 99.38%, +11.79% improvement)

#### Removed
- Duplicate `NormalizedSchema` interface from interface-generator.ts (30 lines)
- `as any` type cast workaround from mcp-generator.ts

#### Type Coverage Achievements
- **Overall**: 99.38% (target: 95%, exceeded by +4.38%)
- **Parser Package**: 99.91% (target: 95%, exceeded by +4.91%)
- **CLI Package**: 99.69% (target: 95%, exceeded by +4.69%)
- **Generator Package**: 99.11% (target: 95%, exceeded by +4.11%)

#### Technical Debt Resolved
- ✅ Type definition duplication eliminated
- ✅ Type safety bypasses removed
- ✅ Single source of truth for type definitions established
- ✅ Automated quality gates configured

#### Documentation
- Added Epic 6 completion summary (`docs/epic-6-completion-summary.md`)
- Added QA handoff document (`docs/qa/epic-6-qa-handoff.md`)
- Updated Story 6.1 with implementation details
- Updated Story 6.2 with coverage measurements
- Documented Story 6.3 deferral (Q1 2025)

---

### Epic 5: Polish & Technical Debt Resolution (2025-01-10)

#### Added
- Comprehensive integration testing infrastructure
- End-to-end testing for server runtime validation
- Error handling infrastructure with custom error classes
- Progress reporter for CLI operations
- Authentication integration tests
- Security guidance integration tests
- Validation utilities and error handlers

#### Changed
- Refactored CLI generation flow for better modularity
- Improved error handling and user feedback
- Enhanced logging system with better formatting
- Updated documentation with architectural improvements

#### Fixed
- CLI generation bugs and edge cases
- Error handling consistency
- Type compilation issues in generator package
- Integration test reliability

#### Removed
- Hello-world template from CLI usage (directory deferred to Q1 2025)

#### Documentation
- Updated README with comprehensive documentation
- Added Epic 5 completion summary
- Updated technical debt tracking documentation
- Added QA validation gates
- Improved architecture documentation

---

## [0.1.0] - 2025-01-06

### Initial Release

#### Added
- OpenAPI 3.x to MCP Server code generation
- TypeScript interface generation from OpenAPI schemas
- MCP tool definition generation
- HTTP client generation with authentication support
- CLI tool for code generation
- Comprehensive parser for OpenAPI specifications
- Template-based code generation system
- Support for multiple authentication schemes:
  - API Key (header, query, cookie)
  - HTTP Bearer tokens
  - HTTP Basic authentication
  - OAuth 2.0 flows
- Monorepo structure with pnpm workspaces
- CI/CD pipeline with GitHub Actions
- Unit and integration testing infrastructure

#### Packages
- `@openapi-to-mcp/cli`: Command-line interface
- `@openapi-to-mcp/parser`: OpenAPI specification parser
- `@openapi-to-mcp/generator`: Code generation engine
- `@openapi-to-mcp/templates`: Code generation templates

#### Features
- Automatic schema extraction and normalization
- Operation extraction with parameter handling
- Security scheme analysis and code generation
- Server URL extraction and configuration
- Tag-based operation organization
- Validation and error reporting
- TypeScript strict mode compliance
- ESM module support

---

## Version History

- **[Unreleased]**: Epic 6 (Type Coverage & Safety) + Epic 5 (Polish & Testing)
- **[0.1.0]**: Initial release with core functionality

---

**Note**: This project is under active development. Breaking changes may occur between versions until v1.0.0 release.
