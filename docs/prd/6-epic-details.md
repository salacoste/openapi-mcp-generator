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

1. Template created in `packages/templates/hello-world (removed Story 6.3)/` with minimal MCP server code
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

## Epic 2: OpenAPI Parsing & Validation Engine

**Epic Goal:** Build robust OpenAPI 3.0 parser with validation, `$ref` resolution, and schema normalization that handles real-world API specifications. This epic delivers a production-grade parser capable of processing complex OpenAPI documents (including the Ozon Performance API with 300+ methods), properly resolving all references, and producing normalized, validated data structures ready for code generation.

### Story 2.1: OpenAPI Document Loading and Format Detection

**As a** CLI user,
**I want** the tool to automatically detect and load OpenAPI documents in JSON or YAML format,
**so that** I don't have to manually specify the file format.

#### Acceptance Criteria

1. Parser module created (`packages/parser/src/loader.ts`) with document loading functionality
2. Function `loadOpenAPIDocument(filePath)` accepts file path and returns parsed document object
3. Automatic format detection based on file extension (`.json`, `.yaml`, `.yml`)
4. YAML parsing using `js-yaml` library with proper error handling
5. JSON parsing using native `JSON.parse()` with validation
6. File existence validation with clear error message if file not found
7. File read errors (permissions, encoding issues) handled with descriptive messages
8. Support for both absolute and relative file paths
9. UTF-8 encoding enforced for all document loading
10. Verbose mode logs: file path, detected format, document size in bytes

### Story 2.2: OpenAPI 3.0 Schema Validation

**As a** developer,
**I want** the parser to validate OpenAPI documents against the OpenAPI 3.0 specification,
**so that** invalid or malformed documents are rejected early with clear error messages.

#### Acceptance Criteria

1. OpenAPI 3.0 JSON schema integrated (from `openapi3-ts` or similar library)
2. Function `validateOpenAPISchema(document)` validates document structure
3. Validation checks: required fields (`openapi`, `info`, `paths`), correct version format (`3.0.x`)
4. Field type validation: `info.title` is string, `paths` is object, `servers` is array, etc.
5. Version compatibility check: accepts `3.0.0`, `3.0.1`, `3.0.2`, `3.0.3`
6. Validation errors include: field path (e.g., `paths./users.get.responses`), expected type, actual value
7. Multiple validation errors collected and reported together (not fail-fast)
8. Warning for deprecated OpenAPI 3.0 features (with suggestion to upgrade to 3.1 if applicable)
9. Custom validation rules for common mistakes (e.g., missing `operationId`, duplicate paths)
10. Test suite with valid and invalid OpenAPI documents (at least 10 test cases)

### Story 2.3: Reference Resolution ($ref Handling)

**As a** developer,
**I want** the parser to resolve all `$ref` references in the OpenAPI document,
**so that** schemas, parameters, and responses are fully expanded for code generation.

#### Acceptance Criteria

1. Reference resolver module created (`packages/parser/src/ref-resolver.ts`)
2. Function `resolveReferences(document)` returns document with all `$ref` expanded
3. Internal reference resolution: `#/components/schemas/User` → actual schema object
4. External reference resolution: `./common.yaml#/schemas/Error` → loaded from file
5. Recursive reference handling: nested `$ref` within resolved schemas
6. Circular reference detection with error message (prevent infinite loops)
7. Reference cache to avoid resolving same reference multiple times
8. Path normalization for external references (relative to document location)
9. Error handling for missing references with clear message: "Reference not found: #/components/schemas/Missing"
10. Support for references in: schemas, parameters, responses, examples, request bodies
11. Test suite with documents containing complex reference structures (at least 5 test cases)

### Story 2.4: Schema Extraction and Normalization

**As a** code generator,
**I want** normalized schema objects extracted from the OpenAPI document,
**so that** I can generate TypeScript interfaces consistently.

#### Acceptance Criteria

1. Schema extractor module created (`packages/parser/src/schema-extractor.ts`)
2. Function `extractSchemas(document)` returns map of schema name → normalized schema object
3. Schema normalization: convert all schemas to consistent structure (handle `allOf`, `oneOf`, `anyOf`)
4. `allOf` composition: merge all schemas into single object with combined properties
5. `oneOf`/`anyOf` handling: create union types or discriminated unions where possible
6. Inline schema extraction: anonymous schemas from request/response bodies assigned generated names
7. Schema name generation for inline schemas: `{path}_{method}_{location}Schema` (e.g., `GetUsers200ResponseSchema`)
8. Property metadata extraction: required fields, default values, descriptions, formats, enums
9. Nested object handling: recursively extract nested schemas with proper naming
10. Array schema handling: extract `items` schema with proper type information
11. Output validation: all schemas have unique names, no `$ref` in normalized output
12. Test suite with complex schemas: compositions, nested objects, arrays, enums (at least 8 test cases)

### Story 2.5: Path and Operation Extraction

**As a** code generator,
**I want** structured path and operation data extracted from the OpenAPI document,
**so that** I can generate MCP tool definitions for each API endpoint.

#### Acceptance Criteria

1. Operation extractor module created (`packages/parser/src/operation-extractor.ts`)
2. Function `extractOperations(document)` returns array of operation objects
3. Operation object structure: `{ path, method, operationId, summary, description, tags, parameters, requestBody, responses, security }`
4. Path parameter extraction from path template: `/users/{userId}` → parameter `userId`
5. Query parameter extraction with metadata: name, type, required, description, default
6. Header parameter extraction for custom headers beyond authentication
7. Request body extraction: media type (JSON/XML/form), schema reference, required flag
8. Response extraction: status codes, descriptions, media types, schema references
9. `operationId` generation if missing: `{method}{PascalCasePath}` (e.g., `getUserById`)
10. Tag assignment: use operation tags or infer from path (e.g., `/users/*` → `Users` tag)
11. Deprecated operation flagging with warning message
12. Parameter deduplication: merge path-level and operation-level parameters
13. Test suite with various operation types: CRUD, file uploads, complex parameters (at least 10 test cases)

### Story 2.6: Security Scheme Extraction and Classification

**As a** code generator,
**I want** security schemes extracted and classified by authentication type,
**so that** I can generate appropriate authentication handlers.

#### Acceptance Criteria

1. Security extractor module created (`packages/parser/src/security-extractor.ts`)
2. Function `extractSecuritySchemes(document)` returns map of scheme name → classified scheme object
3. Security scheme classification: API Key (header/query/cookie), HTTP (bearer/basic), OAuth2, OpenID Connect
4. API Key scheme metadata: parameter name, location (header/query/cookie)
5. HTTP Bearer scheme identification: `scheme: bearer`, `bearerFormat: JWT` detection
6. HTTP Basic scheme identification: `scheme: basic`
7. OAuth2 scheme handling: flows (implicit, authorizationCode, clientCredentials, password), scopes
8. OpenID Connect scheme handling: `openIdConnectUrl` extraction
9. Security requirement extraction per operation: which schemes apply, required scopes
10. Multi-scheme detection: operations requiring multiple auth methods (AND/OR logic)
11. Global vs. operation-level security: merge global `security` with operation-specific overrides
12. Warning for unsupported schemes with guidance: "OAuth2 implicit flow requires manual implementation"
13. Test suite with various auth configurations (at least 6 test cases)

### Story 2.7: Tag Extraction and Categorization

**As a** code generator,
**I want** tags extracted and organized for semantic categorization,
**so that** I can implement tag-based method filtering for AI discovery.

#### Acceptance Criteria

1. Tag extractor module created (`packages/parser/src/tag-extractor.ts`)
2. Function `extractTags(document)` returns array of tag objects with metadata
3. Tag object structure: `{ name, description, externalDocs, operationCount }`
4. Tag extraction from `tags` root-level array with descriptions
5. Tag extraction from operations: collect all unique tags used across operations
6. Auto-generated tags for untagged operations based on path: `/users/*` → `Users`, `/api/v1/products/*` → `Products`
7. Tag normalization: consistent casing (PascalCase), special character handling
8. Tag grouping logic: assign operations to tags, count operations per tag
9. External documentation links preserved: `externalDocs.url` and `externalDocs.description`
10. Tag priority ordering: root-level tags first, then auto-generated tags
11. Warning for operations without tags: suggest adding tags for better organization
12. Test suite with tagged and untagged operations (at least 5 test cases)

### Story 2.8: Server URL Extraction and Base Path Handling

**As a** code generator,
**I want** server URLs and base paths extracted from the OpenAPI document,
**so that** the generated MCP server can make requests to the correct API endpoints.

#### Acceptance Criteria

1. Server extractor module created (`packages/parser/src/server-extractor.ts`)
2. Function `extractServers(document)` returns array of server objects
3. Server object structure: `{ url, description, variables }`
4. Server URL extraction from `servers` array at root level
5. Server URL variable resolution: `{protocol}://api.example.com/{version}` → template with variables
6. Default server handling: if no `servers` specified, use empty string (relative URLs)
7. Multi-server detection: production vs. staging vs. development environments
8. Server selection strategy: use first server as default, allow override via config
9. Base path extraction from server URL: `https://api.example.com/v1` → base path `/v1`
10. Server variable defaults: extract default values from `variables` object
11. Environment variable mapping suggestion: `{environment}` variable → `API_ENVIRONMENT` env var
12. Test suite with various server configurations (at least 4 test cases)

### Story 2.9: Parser Output Validation and Testing with Real-World API

**As a** project stakeholder,
**I want** the parser validated against the Ozon Performance API specification,
**so that** I have confidence it handles real-world complexity.

#### Acceptance Criteria

1. Integration test created using Ozon Performance API OpenAPI specification
2. Test validates successful parsing: no errors, all operations extracted
3. Assertion: ≥300 operations extracted from Ozon API document
4. Assertion: all `$ref` references resolved without errors
5. Assertion: all security schemes classified correctly (API Key, Bearer Token, etc.)
6. Assertion: all tags extracted with operation counts matching actual distribution
7. Assertion: server URLs extracted with correct base paths
8. Assertion: complex schemas normalized (nested objects, arrays, compositions)
9. Performance test: parsing completes in <5 seconds for 300+ method API
10. Memory test: parsing consumes <256MB RAM
11. Edge case testing: missing `operationId`, untagged operations, empty descriptions
12. Error recovery testing: malformed documents, missing required fields, invalid references
13. Regression test suite: lock down parser output structure with snapshot testing
14. Documentation: parser architecture diagram, data flow, API reference in `docs/parser-architecture.md`
15. CI integration: parser tests run on every commit with 100% pass rate required

---

**📋 Epic 2 Complete** - Parser foundation ready for code generation (Epic 3)

---

## Epic 3: TypeScript Code Generation System

**Epic Goal:** Implement template-based code generator that produces MCP server boilerplate, type-safe interfaces, and compilable TypeScript output. This epic delivers the core generation engine that transforms parsed OpenAPI data into production-ready TypeScript code, including full MCP server implementation, type-safe interfaces, HTTP client setup, and complete project scaffolding with all configuration files.

### Story 3.1: Code Generation Architecture and Template Engine Setup

**As a** developer,
**I want** a template engine architecture for generating code from parsed OpenAPI data,
**so that** I can produce consistent, maintainable TypeScript code.

#### Acceptance Criteria

1. Code generator package created (`packages/generator/src/`) with main entry point
2. Template engine selected and integrated (Handlebars, EJS, or similar)
3. Template directory structure: `packages/templates/mcp-server/` with subdirectories for components
4. Generator architecture: `parseData → templateData → renderTemplate → writeOutput` pipeline
5. Function `generateFromTemplate(templatePath, data, outputPath)` as core rendering function
6. Template helper functions: camelCase, PascalCase, kebab-case, type conversion utilities
7. Template data model: `{ apiName, operations, schemas, securitySchemes, servers, metadata }`
8. Code formatting integration: Prettier configured for generated TypeScript output
9. Template validation: ensure all required data fields present before rendering
10. Error handling: template rendering errors include template name, line number, missing variable
11. Test suite: validate template rendering with sample data (at least 5 test cases)

### Story 3.2: TypeScript Interface Generation from OpenAPI Schemas

**As a** code generator,
**I want** to generate TypeScript interfaces from OpenAPI schemas,
**so that** the generated MCP server has type-safe data structures.

#### Acceptance Criteria

1. Interface generator module created (`packages/generator/src/interface-generator.ts`)
2. Function `generateInterfaces(schemas)` produces TypeScript interface code
3. Basic type mapping: `string` → `string`, `number`/`integer` → `number`, `boolean` → `boolean`, `array` → `T[]`, `object` → interface
4. Nullable handling: `nullable: true` → `T | null`
5. Enum generation: OpenAPI enum → TypeScript string literal union type
6. Required vs. optional properties: required → `property: Type`, optional → `property?: Type`
7. Nested object handling: generate separate interfaces for nested objects with meaningful names
8. Array type generation: `items.type` → `Array<Type>` or `Type[]`
9. `allOf` composition: merge interfaces using TypeScript intersection types (`A & B`)
10. `oneOf`/`anyOf`: generate union types (`A | B`) with type guards where possible
11. JSDoc comments: include OpenAPI `description`, `format`, `example` in interface documentation
12. Import management: track interface dependencies and generate import statements
13. Output structure: one file per schema or grouped by tag (configurable)
14. Test suite: validate interface generation for complex schemas (at least 8 test cases)

### Story 3.3: HTTP Client Base Implementation with Axios

**As a** generated MCP server,
**I want** an HTTP client configured for making API requests,
**so that** I can communicate with the target API.

#### Acceptance Criteria

1. HTTP client template created (`packages/templates/mcp-server/http-client.ts.hbs`)
2. Axios integration as HTTP library with TypeScript support
3. Base client class: `ApiClient` with configurable base URL, timeout, headers
4. Client initialization: accept config object `{ baseURL, timeout, headers, auth }`
5. Request interceptor support: pre-process requests (add auth headers, log, etc.)
6. Response interceptor support: post-process responses (error handling, data extraction)
7. Error handling: wrap Axios errors in custom `ApiError` class with status code, message, response data
8. Timeout configuration: default 30 seconds, configurable via environment variable
9. Retry logic: exponential backoff for 5xx errors (configurable retry count)
10. Request/response logging: log requests in debug mode (include method, URL, headers, body)
11. Type-safe request methods: `get<T>()`, `post<T>()`, `put<T>()`, `delete<T>()` with generic return types
12. Base URL handling: resolve relative paths, handle trailing slashes, merge with operation paths
13. Test suite: validate client functionality with mocked API responses (at least 6 test cases)

### Story 3.4: MCP Server Boilerplate Generation

**As a** code generator,
**I want** to generate MCP server boilerplate code,
**so that** the server can communicate with Claude using the MCP protocol.

#### Acceptance Criteria

1. MCP server template created (`packages/templates/mcp-server/index.ts.hbs`)
2. MCP SDK integration: import `@modelcontextprotocol/sdk` types and utilities
3. Server initialization: `new Server({ name, version })` with metadata from OpenAPI `info`
4. Stdio transport setup: `StdioServerTransport` for Claude integration
5. Tool registration: dynamic tool definitions from parsed operations
6. Request handler: `server.setRequestHandler(ListToolsRequestSchema, async () => ...)` for tool listing
7. Call handler: `server.setRequestHandler(CallToolRequestSchema, async (request) => ...)` for tool execution
8. Tool execution routing: map `request.params.name` to corresponding API operation
9. Error handling: catch API errors, format for MCP response with `isError: true`
10. Server lifecycle: `server.connect(transport)` with graceful shutdown on SIGINT/SIGTERM
11. Environment loading: `dotenv` configuration at server startup
12. Logging integration: structured logging with operation name, parameters, response time
13. Test suite: validate MCP server starts and responds to tool requests (at least 4 test cases)

### Story 3.5: MCP Tool Definition Generation from OpenAPI Operations

**As a** code generator,
**I want** to generate MCP tool definitions from OpenAPI operations,
**so that** Claude can discover and invoke API methods.

#### Acceptance Criteria

1. Tool definition generator module created (`packages/generator/src/tool-generator.ts`)
2. Function `generateToolDefinitions(operations)` produces array of MCP tool objects
3. Tool structure: `{ name, description, inputSchema }` conforming to MCP protocol
4. Tool naming: use `operationId` or generate from `{method}_{path}` (e.g., `get_users_by_id`)
5. Tool description: AI-optimized text from OpenAPI `summary` and `description`
6. Input schema: JSON Schema from operation parameters and request body
7. Parameter mapping: query/path/header parameters → JSON Schema properties
8. Request body mapping: `requestBody.content['application/json'].schema` → input schema
9. Required parameters: mark as required in JSON Schema, optional parameters without `required`
10. Parameter types: map OpenAPI types to JSON Schema types correctly
11. Parameter descriptions: include in JSON Schema for AI comprehension
12. Tag-based grouping: optionally group tools by tags in tool definitions
13. Security requirements: document auth requirements in tool description
14. Test suite: validate tool definitions match OpenAPI operations (at least 7 test cases)

### Story 3.6: Request Parameter Mapping and Validation

**As a** generated MCP server,
**I want** to map MCP tool inputs to API request parameters with validation,
**so that** API calls are correctly formatted and valid.

#### Acceptance Criteria

1. Parameter mapper module created (`packages/generator/src/parameter-mapper.ts`)
2. Function `mapToolInputToRequest(toolInput, operation)` produces request config object
3. Request config structure: `{ url, method, params, data, headers }`
4. Path parameter substitution: `/users/{userId}` + `{ userId: 123 }` → `/users/123`
5. Query parameter mapping: `params` object for `in: query` parameters
6. Header parameter mapping: `headers` object for `in: header` parameters
7. Request body mapping: `data` object from `requestBody` schema
8. Parameter validation: check required parameters present, types match schema
9. Type coercion: string → number/boolean conversion where schema specifies
10. Default values: apply parameter defaults if not provided in tool input
11. Array parameter handling: serialize arrays per OpenAPI `style` (form, spaceDelimited, pipeDelimited)
12. Validation errors: clear messages indicating missing/invalid parameters with expected format
13. Test suite: validate parameter mapping for various operation types (at least 8 test cases)

### Story 3.7: Response Processing and Type Casting

**As a** generated MCP server,
**I want** to process API responses and cast to TypeScript types,
**so that** data is properly typed and formatted for MCP responses.

#### Acceptance Criteria

1. Response processor module created (`packages/generator/src/response-processor.ts`)
2. Function `processApiResponse(response, operation)` produces typed MCP response
3. Response schema lookup: match status code to OpenAPI response schema
4. Type casting: apply TypeScript interface to response data
5. Success response: status 2xx → return data with type information
6. Error response: status 4xx/5xx → format error for MCP with error details
7. Response data extraction: handle different content types (JSON, text, binary)
8. Null/undefined handling: normalize missing fields per schema defaults
9. Array response formatting: handle large arrays with truncation in AI-optimized mode
10. Response validation: validate response matches schema (optional strict mode)
11. Error enrichment: add context to errors (operation name, request params, timestamp)
12. Response metadata: include status code, headers (if relevant) in MCP response
13. Test suite: validate response processing for various scenarios (at least 6 test cases)

### Story 3.8: Project Scaffolding (package.json, README, Config Files)

**As a** user,
**I want** the generator to create a complete project structure,
**so that** the generated MCP server is immediately usable.

#### Acceptance Criteria

1. Scaffolding generator module created (`packages/generator/src/scaffolder.ts`)
2. Function `scaffoldProject(outputDir, metadata)` creates full project structure
3. `package.json` generation: name from API title, version, dependencies, scripts
4. Dependencies included: `@modelcontextprotocol/sdk`, `axios`, `dotenv`, TypeScript types
5. Scripts included: `build` (TypeScript compile), `start` (run server), `dev` (watch mode)
6. `tsconfig.json` generation: strict mode, ES2020, module resolution, output to `dist/`
7. `.env.example` generation: template environment variables for API credentials
8. `.gitignore` generation: ignore `node_modules`, `dist`, `.env`
9. `README.md` generation: API overview, setup instructions, usage examples, environment variables
10. Directory structure: `src/` (source code), `dist/` (compiled output)
11. ESLint configuration: `.eslintrc.json` with TypeScript rules
12. Prettier configuration: `.prettierrc` with consistent formatting rules
13. License file: MIT license (or configurable) with copyright info
14. Test suite: validate all scaffold files created correctly (at least 5 test cases)

### Story 3.9: Generated Code Compilation and Integration Testing

**As a** project stakeholder,
**I want** the generated code to compile successfully and work end-to-end,
**so that** I have confidence in the generator's output quality.

#### Acceptance Criteria

1. Integration test suite created for full generation pipeline
2. Test workflow: parse Ozon API OpenAPI → generate code → compile TypeScript → run server
3. Compilation test: `tsc` runs without errors on generated code
4. Type safety test: all generated interfaces properly typed, no `any` types (except where explicitly needed)
5. Linting test: `eslint` passes with zero errors on generated code
6. Runtime test: generated MCP server starts successfully
7. Tool listing test: server responds to `ListToolsRequest` with all operations
8. Tool execution test: server handles `CallToolRequest` for sample operation
9. Authentication test: server includes auth headers in API requests
10. Error handling test: server handles API errors gracefully
11. Performance test: generation completes in <30 seconds for 50-method API
12. Regression test: lock down generated code structure with snapshot testing
13. Edge case test: generate from minimal OpenAPI (1 operation), validate output
14. Documentation: generation architecture diagram, template guide in `docs/generation-architecture.md`
15. CI integration: end-to-end generation test runs on every commit

---

**📋 Epic 3 Complete** - Code generation engine ready for authentication (Epic 4)

---

## Epic 4: Authentication & Security Handlers

**Epic Goal:** Generate authentication code for API Key, Bearer Token, and Basic Auth schemes with secure credential management via environment variables. This epic delivers comprehensive authentication support, enabling the generated MCP server to securely authenticate against protected APIs using industry-standard auth methods, with proper credential handling, request interceptor architecture, and security best practices documentation.

### Story 4.1: Environment Variable Configuration System

**As a** generated MCP server,
**I want** a configuration system that loads API credentials from environment variables,
**so that** sensitive credentials are never hardcoded in the source code.

#### Acceptance Criteria

1. Configuration module created (`packages/templates/mcp-server/config.ts.hbs`)
2. `dotenv` integration: load `.env` file at server startup
3. Configuration interface: `{ apiKey?, bearerToken?, basicAuth?: { username, password }, baseURL, timeout }`
4. Environment variable mapping: `API_KEY`, `BEARER_TOKEN`, `BASIC_AUTH_USERNAME`, `BASIC_AUTH_PASSWORD`, `API_BASE_URL`, `API_TIMEOUT`
5. Configuration validation: check required auth credentials present based on security scheme
6. Default values: provide sensible defaults for non-auth config (timeout: 30s, etc.)
7. Type safety: TypeScript types for all configuration options
8. `.env.example` generation: template file with all required environment variables documented
9. Environment variable documentation in README: describe each variable, required vs. optional, example values
10. Error handling: clear error message if required auth credentials missing at runtime
11. Security: never log credential values, mask in debug output
12. Test suite: validate configuration loading with various env setups (at least 5 test cases)

### Story 4.2: API Key Authentication Handler

**As a** generated MCP server,
**I want** to add API Key authentication to requests,
**so that** I can access APIs that require API Key auth.

#### Acceptance Criteria

1. API Key auth module created (`packages/templates/mcp-server/auth/api-key.ts.hbs`)
2. Function `addApiKeyAuth(request, config)` adds API Key to request
3. Header-based API Key: add to `headers` object (e.g., `X-API-Key: <key>`)
4. Query parameter API Key: add to `params` object (e.g., `?api_key=<key>`)
5. Cookie-based API Key: add to `Cookie` header (e.g., `Cookie: api_key=<key>`)
6. Configuration: API Key name and location from OpenAPI `securitySchemes`
7. Environment variable: load API Key from `API_KEY` env var
8. Request interceptor integration: automatically add API Key to all requests
9. Error handling: throw error if API Key required but not configured
10. Security: API Key never logged or exposed in error messages
11. Template generation: auth code generated based on OpenAPI security scheme definition
12. Test suite: validate API Key auth for header/query/cookie locations (at least 3 test cases)

### Story 4.3: Bearer Token Authentication Handler

**As a** generated MCP server,
**I want** to add Bearer Token authentication to requests,
**so that** I can access APIs that require JWT or OAuth2 bearer tokens.

#### Acceptance Criteria

1. Bearer Token auth module created (`packages/templates/mcp-server/auth/bearer.ts.hbs`)
2. Function `addBearerAuth(request, config)` adds Bearer Token to request
3. Authorization header format: `Authorization: Bearer <token>`
4. Environment variable: load token from `BEARER_TOKEN` env var
5. Token format validation: basic check for JWT format (three base64 parts) if `bearerFormat: JWT`
6. Request interceptor integration: automatically add Bearer Token to all requests
7. Token refresh handling: placeholder for future token refresh logic (documented in comments)
8. Error handling: throw error if Bearer Token required but not configured
9. Security: token never logged or exposed in error messages
10. Template generation: auth code generated when OpenAPI specifies `scheme: bearer`
11. Bearer format support: handle `bearerFormat: JWT` with appropriate documentation
12. Test suite: validate Bearer Token auth with valid and invalid tokens (at least 4 test cases)

### Story 4.4: Basic Authentication Handler

**As a** generated MCP server,
**I want** to add Basic Authentication to requests,
**so that** I can access APIs that require username/password auth.

#### Acceptance Criteria

1. Basic Auth module created (`packages/templates/mcp-server/auth/basic.ts.hbs`)
2. Function `addBasicAuth(request, config)` adds Basic Auth to request
3. Authorization header format: `Authorization: Basic <base64(username:password)>`
4. Base64 encoding: properly encode `username:password` credentials
5. Environment variables: load from `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD`
6. Credential validation: ensure both username and password present
7. Request interceptor integration: automatically add Basic Auth to all requests
8. Error handling: throw error if credentials required but not configured
9. Security: credentials never logged, Base64 encoding only (not encryption, document this)
10. Template generation: auth code generated when OpenAPI specifies `scheme: basic`
11. Character encoding: handle special characters in username/password (UTF-8)
12. Test suite: validate Basic Auth with various username/password combinations (at least 4 test cases)

### Story 4.5: Multi-Scheme Security Handling

**As a** generated MCP server,
**I want** to support APIs that use multiple authentication schemes,
**so that** I can handle complex security configurations.

#### Acceptance Criteria

1. Multi-auth module created (`packages/templates/mcp-server/auth/multi-scheme.ts.hbs`)
2. Support for AND logic: apply multiple auth schemes to single request (e.g., API Key + Bearer Token)
3. Support for OR logic: allow alternative auth schemes (user chooses one)
4. Security requirement parsing: extract security requirements from OpenAPI operations
5. Operation-level auth: override global auth with operation-specific requirements
6. Auth composition: combine multiple auth handlers in request interceptor
7. Configuration validation: ensure all required auth schemes have credentials configured
8. Documentation generation: README explains which auth schemes are required/optional
9. Error handling: clear message indicating which auth credentials are missing
10. Template logic: generate appropriate auth code based on security scheme combinations
11. Priority handling: apply auth schemes in defined order (deterministic)
12. Test suite: validate multi-scheme scenarios (at least 5 test cases)

### Story 4.6: Security Scheme Detection and User Guidance

**As a** user,
**I want** clear guidance on which authentication credentials I need to provide,
**so that** I can configure the generated MCP server correctly.

#### Acceptance Criteria

1. Security analyzer module created (`packages/generator/src/security-analyzer.ts`)
2. Function `analyzeSecurityRequirements(openapi)` produces security guidance report
3. Report includes: required auth schemes, credential names, environment variable names
4. Detection of global vs. operation-level security requirements
5. Identification of optional vs. required auth schemes
6. Warning for unsupported auth schemes (OAuth2 flows, OpenID Connect) with workaround guidance
7. `.env.example` generation: include all detected auth credentials with comments
8. README section generation: "Authentication Setup" with step-by-step credential configuration
9. CLI output: display security requirements after parsing OpenAPI document
10. Example values: provide example (fake) credentials in `.env.example`
11. Security documentation: explain what each auth scheme does and when it's used
12. Test suite: validate security guidance for various OpenAPI security configurations (at least 6 test cases)

### Story 4.7: Request Interceptor Architecture for Auth

**As a** generated MCP server,
**I want** a request interceptor architecture that applies authentication consistently,
**so that** all API requests are properly authenticated without code duplication.

#### Acceptance Criteria

1. Request interceptor module created (`packages/templates/mcp-server/interceptors/auth.ts.hbs`)
2. Axios request interceptor: `axios.interceptors.request.use(authInterceptor)`
3. Interceptor function: apply auth based on operation security requirements
4. Dynamic auth selection: use correct auth method for each operation
5. Auth caching: cache auth headers/params to avoid recomputation
6. Interceptor registration: register during HTTP client initialization
7. Error handling: interceptor errors include operation name and auth type
8. Logging: log auth method used in debug mode (without credential values)
9. Extensibility: support for custom auth schemes via plugin architecture
10. Template generation: interceptor code generated based on detected auth schemes
11. Order of operations: apply auth after other request modifications (logging, etc.)
12. Test suite: validate interceptor applies auth correctly for various operations (at least 5 test cases)

### Story 4.8: Credential Security Best Practices Documentation

**As a** user,
**I want** documentation on credential security best practices,
**so that** I can securely manage API credentials for the generated MCP server.

#### Acceptance Criteria

1. Security documentation created in generated `SECURITY.md` file
2. Environment variable security: explain why `.env` files must never be committed
3. `.gitignore` verification: ensure `.env` is ignored by git
4. Credential rotation: document how to rotate credentials safely
5. Production deployment: guidance on secret management (AWS Secrets Manager, HashiCorp Vault, etc.)
6. Least privilege principle: document using minimal credential scopes when possible
7. Logging security: explain why credentials should never appear in logs
8. Error message security: document avoiding credential exposure in error messages
9. HTTPS requirement: emphasize using HTTPS for API communication
10. Local development: best practices for local `.env` file management
11. Team collaboration: guidance on sharing `.env.example` (not `.env`) with team
12. Credential storage: warn against storing credentials in code or version control
13. Checklist: security checklist for users to verify before deployment
14. External references: link to industry security standards (OWASP, NIST)

### Story 4.9: Authentication Integration Testing with Ozon Performance API

**As a** project stakeholder,
**I want** authentication validated against the Ozon Performance API,
**so that** I have confidence the auth implementation works with real APIs.

#### Acceptance Criteria

1. Integration test created for Ozon API authentication
2. Test setup: generate MCP server from Ozon API OpenAPI specification
3. Test configuration: provide test API credentials via environment variables
4. Authentication test: verify auth headers added correctly to requests
5. API call test: make actual API request to Ozon API with authentication
6. Response validation: verify API returns 200 (not 401/403 auth errors)
7. Multi-endpoint test: validate auth works across different API operations
8. Negative test: verify 401 error when auth credentials invalid
9. Auth scheme detection: confirm correct auth type detected from Ozon OpenAPI spec
10. Security validation: verify credentials not logged or exposed in test output
11. CI integration: authentication tests run with mock credentials in CI (real credentials in manual testing only)
12. Performance test: auth interceptor adds <10ms overhead to requests
13. Documentation: authentication architecture diagram in `docs/auth-architecture.md`
14. Regression test: lock down auth implementation with snapshot testing
15. User guide: example Ozon API setup with step-by-step credential configuration

---

**📋 Epic 4 Complete** - Authentication ready for AI optimization (Epic 5)

---

## Epic 5: AI-Optimized Tool Descriptions & Response Formatting

**Epic Goal:** Transform OpenAPI metadata into AI-readable tool descriptions and implement smart response formatting for improved AI comprehension. This epic delivers AI-first enhancements that make the generated MCP server's tools easy for Claude to understand and use, including enhanced descriptions, parameter documentation, response summarization, and contextual hints that maximize AI effectiveness.

### Story 5.1: AI-Optimized Tool Description Generation

**As a** Claude AI,
**I want** clear, concise tool descriptions that explain what each API operation does,
**so that** I can accurately decide when to use each tool.

#### Acceptance Criteria

1. Description optimizer module created (`packages/generator/src/ai-optimizer.ts`)
2. Function `optimizeToolDescription(operation)` produces AI-friendly description text
3. Description structure: one-line summary + detailed explanation (if needed)
4. Summary extraction: use OpenAPI `summary` field as primary source
5. Description enhancement: append OpenAPI `description` for context (truncate if >200 chars)
6. Action verb emphasis: ensure descriptions start with action verbs (e.g., "Retrieves", "Creates", "Updates")
7. Entity clarification: make resource types explicit (e.g., "user", "product", "order")
8. Parameter mention: reference key parameters in description (e.g., "by ID", "with filters")
9. Response indication: briefly mention what's returned (e.g., "Returns user profile object")
10. Jargon removal: replace technical jargon with plain language where possible
11. Length optimization: keep descriptions under 150 chars for summary, 300 chars for full description
12. Template generation: apply optimization during tool definition generation
13. Test suite: validate AI-optimized descriptions for various operation types (at least 8 test cases)

### Story 5.2: Enhanced Parameter Documentation for AI

**As a** Claude AI,
**I want** clear parameter descriptions with type information and examples,
**so that** I can provide correct inputs when calling tools.

#### Acceptance Criteria

1. Parameter documenter module created (`packages/generator/src/parameter-documenter.ts`)
2. Function `documentParameter(param)` produces enhanced parameter documentation
3. Documentation structure: `name` (type, required/optional) - description
4. Type clarity: explicit type information (string, number, boolean, array, object)
5. Required/optional indicator: clear marking of required vs. optional parameters
6. Format hints: include format info (e.g., "date-time", "email", "uuid") in description
7. Enum documentation: list allowed values for enum parameters (e.g., "one of: active, inactive, pending")
8. Default values: document default values if specified (e.g., "defaults to 10")
9. Constraints: include min/max, pattern, minLength/maxLength in description
10. Example values: generate example values from OpenAPI `example` or schema
11. Relationship hints: indicate parameter relationships (e.g., "required if status is 'active'")
12. Array handling: document array item types and constraints (e.g., "array of user IDs")
13. Test suite: validate enhanced parameter docs for various parameter types (at least 10 test cases)

### Story 5.3: Response Schema Summarization

**As a** Claude AI,
**I want** concise summaries of API response structures,
**so that** I can understand what data I'll receive without reading full schemas.

#### Acceptance Criteria

1. Response summarizer module created (`packages/generator/src/response-summarizer.ts`)
2. Function `summarizeResponse(responseSchema)` produces concise schema summary
3. Summary structure: "Returns {type}: {key fields}" (e.g., "Returns object: id, name, email, created_at")
4. Type indication: clearly state response type (object, array, string, number, etc.)
5. Key field extraction: list 3-5 most important fields from response schema
6. Nested object handling: indicate nested objects with notation (e.g., "user.profile.avatar")
7. Array response handling: "Returns array of {itemType}: {key fields per item}"
8. Pagination indication: flag paginated responses (e.g., "Returns paginated list with total, page, items")
9. Field prioritization: prioritize ID fields, names, timestamps, status fields
10. Schema complexity handling: truncate with "..." for schemas with >10 fields
11. Multiple response codes: summarize success (2xx) responses, note error possibilities
12. Integration with tool descriptions: append response summary to tool description
13. Test suite: validate response summarization for various schema types (at least 7 test cases)

### Story 5.4: Smart Field Prioritization in Responses

**As a** Claude AI,
**I want** API responses with important fields highlighted and verbose data summarized,
**so that** I can quickly extract relevant information without overwhelming context.

#### Acceptance Criteria

1. Response formatter module created (`packages/templates/mcp-server/response-formatter.ts.hbs`)
2. Function `formatResponse(data, schema)` produces AI-optimized response
3. Field prioritization: order fields by importance (IDs, names, statuses first)
4. Large array truncation: show first 5 items + count for arrays with >10 items
5. Truncation notation: use "... and N more items" for truncated arrays
6. Nested object flattening: option to flatten nested objects for readability
7. Null/undefined handling: show null fields with "(not set)" or omit entirely (configurable)
8. Timestamp formatting: convert ISO timestamps to readable format (e.g., "2024-01-15 14:30 UTC")
9. Boolean clarity: represent booleans as "Yes"/"No" or "Enabled"/"Disabled" in summaries
10. Size indication: add metadata for large responses (e.g., "Response size: 1500 items, showing first 5")
11. Key field highlighting: mark critical fields (IDs, statuses) with prefix in debug mode
12. Configuration: allow users to customize truncation limits and formatting preferences
13. Test suite: validate response formatting for various data structures (at least 6 test cases)

### Story 5.5: Error Response Enhancement

**As a** Claude AI,
**I want** error responses formatted with actionable information,
**so that** I can understand what went wrong and how to fix it.

#### Acceptance Criteria

1. Error formatter module created (`packages/templates/mcp-server/error-formatter.ts.hbs`)
2. Function `formatError(error, operation)` produces AI-friendly error response
3. Error structure: `{ error: true, code, message, details, suggestion }`
4. HTTP status code: include status code with meaning (e.g., "404 - Not Found")
5. Error message enhancement: convert technical errors to plain language
6. Context inclusion: add operation name, parameters used, timestamp
7. Actionable suggestions: provide next steps based on error type
8. Common error patterns: detect and handle common API errors (auth, rate limit, validation)
9. API error passthrough: preserve original API error details in `details` field
10. Validation error formatting: list all validation failures clearly for 400 errors
11. Auth error guidance: suggest checking credentials for 401/403 errors
12. Rate limit handling: include retry-after information for 429 errors
13. Network error handling: distinguish between network errors and API errors
14. Test suite: validate error formatting for various error scenarios (at least 8 test cases)

### Story 5.6: Example Generation from OpenAPI Spec

**As a** Claude AI,
**I want** example tool invocations in tool documentation,
**so that** I can see how to use each tool correctly.

#### Acceptance Criteria

1. Example generator module created (`packages/generator/src/example-generator.ts`)
2. Function `generateToolExample(operation)` produces example tool invocation
3. Example structure: JSON object matching tool input schema
4. Parameter value generation: realistic example values based on parameter types
5. Example sources: use OpenAPI `example` field if available, generate otherwise
6. Type-based examples: string → "example text", number → 123, boolean → true, etc.
7. Format-based examples: email → "user@example.com", date → "2024-01-15", uuid → generated UUID
8. Enum examples: use first enum value as example
9. Required vs. optional: include all required parameters, optionally include some optional ones
10. Nested object examples: generate realistic nested structures
11. Array examples: show array with 1-2 example items
12. Path parameter examples: use realistic IDs (e.g., "12345", "user-abc-123")
13. Documentation integration: include examples in tool descriptions or separate examples section
14. Test suite: validate example generation for various operation types (at least 8 test cases)

### Story 5.7: Tag-Based Semantic Organization

**As a** Claude AI,
**I want** tools organized by semantic categories (tags),
**so that** I can discover related operations efficiently.

#### Acceptance Criteria

1. Tag organizer module created (`packages/generator/src/tag-organizer.ts`)
2. Function `organizeToolsByTags(operations)` produces tag-based tool groupings
3. Tag grouping: group tools by OpenAPI tags (e.g., "Users", "Products", "Orders")
4. Tag metadata: include tag descriptions in MCP tool metadata
5. Tag hierarchy: support nested tag structures if present in OpenAPI spec
6. Untagged handling: assign "General" or "Miscellaneous" tag to untagged operations
7. Multi-tag support: tools with multiple tags appear in all relevant groups
8. Tag-based tool listing: MCP `listTools` can filter by tag
9. Tag documentation: generate README section explaining tag organization
10. Semantic naming: ensure tag names are AI-friendly (clear, descriptive, consistent casing)
11. Tool count per tag: include operation count in tag metadata
12. Discovery optimization: order tags by operation count (most used first)
13. Test suite: validate tag organization for various OpenAPI tag configurations (at least 5 test cases)

### Story 5.8: Contextual Hints and Usage Patterns

**As a** Claude AI,
**I want** contextual hints about when and how to use tools,
**so that** I can make better decisions about tool selection.

#### Acceptance Criteria

1. Context hint generator module created (`packages/generator/src/context-hints.ts`)
2. Function `generateContextHints(operation)` produces usage hints
3. Hint categories: when to use, prerequisites, common patterns, related operations
4. "When to use" hints: describe scenarios where tool is applicable (e.g., "Use this to retrieve a single user by ID")
5. Prerequisite hints: indicate required prior actions (e.g., "Requires authentication token from login")
6. Common patterns: document typical usage flows (e.g., "Often used after creating a resource to retrieve full details")
7. Related operations: suggest complementary tools (e.g., "See also: updateUser, deleteUser")
8. Data dependency hints: indicate data requirements (e.g., "Requires valid user ID from getUsers")
9. Sequence suggestions: recommend operation ordering for workflows (e.g., "1. Create, 2. Update, 3. Publish")
10. Performance hints: warn about expensive operations (e.g., "Large result set, consider using filters")
11. Deprecation notices: flag deprecated operations with migration guidance
12. Best practices: include API-specific best practices from OpenAPI description
13. Integration: add hints to tool descriptions or metadata
14. Test suite: validate context hint generation for various operation scenarios (at least 6 test cases)

### Story 5.9: AI Interaction Testing with Claude

**As a** project stakeholder,
**I want** the AI optimizations validated with actual Claude interactions,
**so that** I have confidence the enhancements improve AI comprehension.

#### Acceptance Criteria

1. AI interaction test suite created with real Claude usage scenarios
2. Test setup: generate MCP server from Ozon API with AI optimizations enabled
3. Tool discovery test: Claude successfully discovers relevant tools using descriptions
4. Parameter understanding test: Claude provides correct parameters based on documentation
5. Error comprehension test: Claude interprets error messages and suggests fixes
6. Response interpretation test: Claude extracts key information from formatted responses
7. Example usage test: Claude uses provided examples as reference for tool invocation
8. Tag navigation test: Claude uses tags to find related operations
9. Context hints test: Claude applies contextual hints when selecting tools
10. Comparison test: measure comprehension improvement vs. non-optimized version
11. User study: conduct usability testing with developers using Claude + generated MCP server
12. Metrics collection: track tool usage success rate, error recovery rate, task completion time
13. Iteration: refine AI optimizations based on test results
14. Documentation: document AI optimization patterns and effectiveness in `docs/ai-optimization.md`
15. Best practices guide: create guide for future AI-first MCP server development

---

**📋 Epic 5 Complete** - AI optimizations ready for filtering (Epic 6)

---

## Epic 6: Smart Method Filtering & Discovery

**Epic Goal:** Implement tag-based categorization, search functionality, and `listMethods` MCP tool to prevent AI context overflow for large APIs. This epic delivers intelligent method discovery and filtering capabilities that enable Claude to work efficiently with APIs containing 200+ methods, preventing context window overflow while maintaining full API access through progressive discovery.

### Story 6.1: Tool Registry and Metadata System

**As a** generated MCP server,
**I want** a centralized tool registry with comprehensive metadata,
**so that** I can support advanced filtering and discovery features.

#### Acceptance Criteria

1. Tool registry module created (`packages/templates/mcp-server/tool-registry.ts.hbs`)
2. Registry data structure: `Map<toolName, ToolMetadata>`
3. ToolMetadata interface: `{ name, description, category, tags, parameters, searchKeywords, deprecated, complexity }`
4. Registry initialization: populate from parsed OpenAPI operations at server startup
5. Category assignment: primary category from first tag, fallback to path-based category
6. Tag extraction: all OpenAPI tags associated with operation
7. Search keyword generation: extract keywords from summary, description, path, operation name
8. Complexity scoring: simple (0-2 params), moderate (3-5 params), complex (6+ params)
9. Deprecation flagging: mark deprecated operations with deprecation notice
10. Registry query methods: `getByCategory()`, `getByTag()`, `search()`, `getAll()`, `getById()`
11. Metadata caching: cache registry for fast lookups
12. Dynamic updates: support runtime registry updates (for future extensibility)
13. Test suite: validate registry operations with various tool sets (at least 6 test cases)

### Story 6.2: Tag-Based Tool Categorization

**As a** Claude AI,
**I want** tools organized by categories and tags,
**so that** I can discover relevant tools without seeing all 300+ methods at once.

#### Acceptance Criteria

1. Category manager module created (`packages/templates/mcp-server/category-manager.ts.hbs`)
2. Function `getCategories()` returns list of all categories with tool counts
3. Function `getToolsByCategory(category)` returns tools in specific category
4. Category structure: `{ name, description, toolCount, tags, tools }`
5. Category names: normalized from OpenAPI tags (PascalCase, no special chars)
6. Category descriptions: from OpenAPI tag descriptions or auto-generated
7. Hierarchical categories: support parent/child category relationships if present
8. Tool count: accurate count of tools per category for AI decision-making
9. Multi-category tools: tools appear in all relevant categories
10. Category ordering: alphabetical or by tool count (configurable)
11. Empty category handling: hide categories with 0 tools
12. Category metadata: include representative tool examples in category description
13. Test suite: validate categorization for various tag structures (at least 5 test cases)

### Story 6.3: Semantic Search Implementation

**As a** Claude AI,
**I want** to search for tools by keywords or functionality,
**so that** I can find the right tool without knowing exact names.

#### Acceptance Criteria

1. Search engine module created (`packages/templates/mcp-server/search-engine.ts.hbs`)
2. Function `searchTools(query)` returns relevant tools ranked by relevance
3. Search fields: tool name, description, summary, tags, parameter names
4. Keyword matching: case-insensitive partial matching on search fields
5. Relevance scoring: prioritize matches in name (3x), summary (2x), description (1x), tags (1.5x)
6. Multi-word search: support "user profile" → match tools with both "user" AND "profile"
7. Fuzzy matching: tolerate minor typos using Levenshtein distance (optional)
8. Search result structure: `{ tool, relevanceScore, matchedFields }`
9. Result ranking: order by relevance score (highest first)
10. Result limiting: return top 10 results by default, configurable limit
11. No results handling: return empty array with suggestion to broaden search
12. Search performance: <50ms for search across 300+ tools
13. Test suite: validate search accuracy and performance (at least 8 test cases)

### Story 6.4: listMethods MCP Tool Implementation

**As a** Claude AI,
**I want** a `listMethods` tool to discover available API operations,
**so that** I can progressively explore the API without overwhelming my context.

#### Acceptance Criteria

1. `listMethods` tool implemented as special MCP tool in generated server
2. Tool signature: `listMethods({ category?, tag?, search?, limit? })`
3. Parameter: `category` (optional) - filter by category name
4. Parameter: `tag` (optional) - filter by tag name
5. Parameter: `search` (optional) - search query string
6. Parameter: `limit` (optional) - max results to return (default: 20)
7. Response structure: `{ methods: [...], total, hasMore, categories? }`
8. Method summary: `{ name, summary, category, tags, paramCount }`
9. Category listing: if no filters, return category list with tool counts
10. Filtering logic: apply all provided filters (AND logic)
11. Pagination support: `hasMore` flag indicates more results available
12. Performance optimization: lazy-load full tool details only when needed
13. Tool description: clear explanation of how to use `listMethods` for discovery
14. Documentation: README section on progressive API discovery workflow
15. Test suite: validate `listMethods` functionality with various filter combinations (at least 10 test cases)

### Story 6.5: Progressive Tool Loading Strategy

**As a** generated MCP server,
**I want** to load tools progressively based on AI requests,
**so that** I minimize initial context usage while maintaining full API access.

#### Acceptance Criteria

1. Progressive loader module created (`packages/templates/mcp-server/progressive-loader.ts.hbs`)
2. Initial tool set: load only `listMethods` and 5-10 most common operations on startup
3. On-demand loading: load full tool details when requested via `listMethods`
4. Lazy tool registration: register tools with MCP SDK only when discovered
5. Category-based loading: load entire category when AI requests tools from that category
6. Search-based loading: load matching tools when AI performs search
7. Cache strategy: cache loaded tools to avoid reloading
8. Memory optimization: unload rarely-used tools after inactivity (configurable threshold)
9. Loading indicators: log tool loading events in debug mode
10. Performance: tool loading adds <20ms latency to first invocation
11. Fallback strategy: if progressive loading fails, load all tools
12. Configuration: allow users to disable progressive loading (load all tools upfront)
13. Test suite: validate progressive loading behavior and performance (at least 6 test cases)

### Story 6.6: Tool Discovery Workflow Documentation

**As a** user,
**I want** documentation explaining how to use tool discovery features,
**so that** I can effectively work with large APIs through Claude.

#### Acceptance Criteria

1. Discovery guide created in generated `DISCOVERY.md` file
2. Overview: explain progressive discovery concept and benefits
3. `listMethods` usage: step-by-step examples of discovering tools
4. Category navigation: guide to browsing tools by category
5. Search usage: examples of effective search queries
6. Filtering combinations: examples combining category + search + limit
7. Workflow examples: common discovery patterns (e.g., "Find all user-related operations")
8. Integration with Claude: how to ask Claude to discover and use tools
9. Large API strategies: best practices for APIs with 100+ operations
10. Troubleshooting: common issues and solutions (e.g., "No results found")
11. Performance tips: how to minimize context usage during discovery
12. Visual examples: include sample `listMethods` responses with annotations
13. Quick reference: cheat sheet of discovery commands
14. README integration: add discovery section to main README

### Story 6.7: Context Window Optimization

**As a** generated MCP server,
**I want** to minimize context window usage during tool listing,
**so that** Claude can work effectively with large APIs without running out of context.

#### Acceptance Criteria

1. Context optimizer module created (`packages/generator/src/context-optimizer.ts`)
2. Tool description compression: reduce verbose descriptions to essential information
3. Parameter schema compression: simplify JSON Schema for initial tool listings
4. Metadata pruning: exclude non-essential metadata from tool listings
5. Deferred details: provide full details only when tool is invoked
6. Batch optimization: optimize multiple tools together for context efficiency
7. Token estimation: estimate context usage for tool listings
8. Adaptive verbosity: reduce detail level when tool count >50
9. Summary mode: ultra-compact tool listings for APIs with >200 methods
10. Full detail mode: option to get complete tool information when needed
11. Context budget: allow configuration of max context allocation for tool listings
12. Metrics tracking: monitor context usage and optimize thresholds
13. Test suite: validate context optimization effectiveness (at least 5 test cases)

### Story 6.8: Filtering Edge Cases and Error Handling

**As a** generated MCP server,
**I want** robust error handling for tool filtering operations,
**so that** discovery features work reliably in all scenarios.

#### Acceptance Criteria

1. Error handling for invalid category names: suggest valid categories
2. Error handling for invalid tag names: suggest similar tags (fuzzy match)
3. Error handling for empty search results: suggest alternative queries
4. Error handling for invalid filter combinations: explain valid combinations
5. Validation: check `limit` parameter is positive integer, max 100
6. Validation: check `search` query is non-empty string, max 100 chars
7. Validation: check `category`/`tag` match existing values (case-insensitive)
8. Empty result handling: return helpful message with discovery suggestions
9. Performance edge cases: handle queries that match all tools gracefully
10. Concurrent request handling: ensure thread-safe registry access
11. Malformed input handling: sanitize inputs to prevent injection attacks
12. Timeout handling: abort long-running searches after configurable timeout
13. Logging: log all filtering operations for debugging in verbose mode
14. Test suite: validate error handling for all edge cases (at least 10 test cases)

### Story 6.9: Filtering System Integration Testing with Ozon API

**As a** project stakeholder,
**I want** the filtering system validated against the Ozon Performance API (300+ methods),
**so that** I have confidence it scales to real-world large APIs.

#### Acceptance Criteria

1. Integration test created using Ozon Performance API OpenAPI specification
2. Test validation: MCP server with 300+ tools generates successfully
3. `listMethods` test: retrieve categories, verify all categories returned
4. Category filtering test: filter by category, verify correct tools returned
5. Tag filtering test: filter by tag, verify correct tools returned
6. Search test: search by keyword, verify relevant tools ranked correctly
7. Combination test: combine category + search, verify AND logic works
8. Pagination test: request tools with limit, verify `hasMore` flag accurate
9. Performance test: `listMethods` responds in <100ms for 300+ tool API
10. Context usage test: measure context tokens used, verify <2000 tokens for initial listing
11. Progressive loading test: verify only essential tools loaded initially
12. Discovery workflow test: simulate full discovery workflow from category browse to tool invocation
13. Stress test: rapid consecutive `listMethods` calls, verify no performance degradation
14. Documentation: filtering architecture diagram in `docs/filtering-architecture.md`
15. Scalability report: document filtering performance at 100, 300, 500+ method scale

---

**📋 Epic 6 Complete** - Filtering ready for production polish (Epic 7)

---

## Epic 7: Error Handling, Validation & Polish

**Epic Goal:** Add comprehensive error messages, generation validation, compilation checks, and UX improvements for production readiness. This epic delivers the quality assurance layer that ensures generated MCP servers are robust, user-friendly, and production-grade, with comprehensive validation, helpful error messages, and polished user experience throughout the generation workflow.

### Story 7.1: Comprehensive CLI Error Messages

**As a** CLI user,
**I want** clear, actionable error messages when something goes wrong,
**so that** I can quickly understand and fix issues.

#### Acceptance Criteria

1. Error message framework created (`packages/cli/src/errors.ts`)
2. Error classes: `CLIError`, `ValidationError`, `FileSystemError`, `ParseError`, `GenerationError`
3. Error message structure: `[ERROR TYPE] Message | Context | Suggested Fix`
4. File path errors: include full path, check existence, permissions, format
5. OpenAPI validation errors: show specific field path, expected vs. actual value, line number (if available)
6. Generation errors: include operation name, template name, error location
7. Dependency errors: check Node.js version, npm/pnpm availability, package installations
8. Network errors: distinguish between connection issues and API errors
9. Color coding: red for errors, yellow for warnings, blue for info
10. Error code system: unique error codes for categorization (e.g., E001, E002)
11. Verbose mode: show stack traces and debug info with `--verbose` flag
12. Error recovery suggestions: provide actionable next steps for each error type
13. Help references: link to docs or GitHub issues for complex errors
14. Test suite: validate error messages for all error scenarios (at least 15 test cases)

### Story 7.2: Pre-Generation Validation Checks

**As a** CLI user,
**I want** the tool to validate inputs before starting generation,
**so that** I catch issues early and avoid wasted time.

#### Acceptance Criteria

1. Pre-validation module created (`packages/cli/src/pre-validator.ts`)
2. Validation checklist: file existence, OpenAPI validity, required fields, output directory
3. File existence check: verify OpenAPI file exists and is readable
4. Format validation: verify file is valid JSON or YAML before parsing
5. OpenAPI version check: verify version is 3.0.x, warn if not supported
6. Required field check: ensure `openapi`, `info`, `paths` fields present
7. Output directory check: verify write permissions, warn if directory exists
8. Dependency check: verify required Node.js version (>=18.0.0)
9. Security scheme check: validate security schemes are supported, warn about unsupported types
10. Path validation: check for valid HTTP methods, parameter syntax, response definitions
11. Reference validation: verify all `$ref` references are resolvable
12. Validation summary: display all validation issues before prompting to continue
13. Force mode: `--force` flag bypasses warnings (not errors)
14. Validation report: optionally save validation report to file with `--report` flag
15. Test suite: validate pre-checks for various invalid inputs (at least 12 test cases)

### Story 7.3: Post-Generation Validation Pipeline

**As a** CLI user,
**I want** the generated code automatically validated after generation,
**so that** I'm confident the output is correct before using it.

#### Acceptance Criteria

1. Post-validation module created (`packages/cli/src/post-validator.ts`)
2. Validation pipeline: file creation check → TypeScript compilation → linting → structure validation
3. File creation check: verify all expected files created (package.json, tsconfig.json, src/, etc.)
4. TypeScript compilation: run `tsc --noEmit` to check for type errors
5. ESLint validation: run `eslint` to check for code quality issues
6. Package.json validation: verify valid JSON, required fields, correct dependencies
7. Import validation: verify all imports are resolvable
8. Structure validation: verify directory structure matches expected layout
9. Template validation: verify templates were applied correctly (no unreplaced placeholders)
10. Dependency validation: verify all required dependencies are listed in package.json
11. Validation summary: display validation results with pass/fail for each check
12. Auto-fix option: `--fix` flag auto-fixes linting issues
13. Validation report: save detailed validation report to `validation-report.json`
14. Rollback on failure: option to rollback generation if validation fails
15. Test suite: validate post-validation pipeline with various generated outputs (at least 10 test cases)

### Story 7.4: Generation Progress Indicators

**As a** CLI user,
**I want** visual progress indicators during generation,
**so that** I know the tool is working and can estimate completion time.

#### Acceptance Criteria

1. Progress indicator module created (`packages/cli/src/progress.ts`)
2. Progress library integration: `ora`, `cli-progress`, or similar
3. Generation phases: parsing → resolving → generating → writing → validating
4. Phase indicators: spinner or progress bar for each phase
5. Progress messages: descriptive messages for current operation (e.g., "Parsing OpenAPI document...")
6. Time estimation: show estimated time remaining for long operations
7. Operation count: show progress fraction (e.g., "Generating tools: 45/120")
8. Success indicators: green checkmark for completed phases
9. Error indicators: red X for failed phases with error summary
10. Quiet mode: `--quiet` flag suppresses progress indicators
11. Verbose mode: `--verbose` flag shows detailed sub-step progress
12. Terminal support: fallback to simple dots for non-TTY terminals
13. Performance: progress updates add <5ms overhead to generation
14. Test suite: validate progress indicators in various terminal environments (at least 4 test cases)

### Story 7.5: Dependency Version Management

**As a** generated MCP server,
**I want** correctly versioned dependencies in package.json,
**so that** the server installs and runs without version conflicts.

#### Acceptance Criteria

1. Dependency manager module created (`packages/generator/src/dependency-manager.ts`)
2. Core dependencies: `@modelcontextprotocol/sdk`, `axios`, `dotenv` with pinned versions
3. TypeScript dependencies: `typescript`, `@types/node` with compatible versions
4. Dev dependencies: `eslint`, `prettier`, `ts-node` with latest stable versions
5. Version pinning strategy: use exact versions for critical deps, caret for dev deps
6. Peer dependency handling: verify peer dependencies are compatible
7. Node.js version constraint: set `engines.node` to `>=18.0.0` in package.json
8. Package manager support: ensure compatibility with npm, pnpm, yarn
9. Security audit: check dependencies for known vulnerabilities (optional `--audit` flag)
10. Dependency documentation: README section explaining key dependencies
11. Update guidance: document how to update dependencies safely
12. Lock file generation: generate package-lock.json or pnpm-lock.yaml
13. Template updates: keep dependency versions updated in templates
14. Test suite: validate dependency configuration for various setups (at least 5 test cases)

### Story 7.6: Helpful Generation Summary and Next Steps

**As a** CLI user,
**I want** a summary of what was generated and clear next steps,
**so that** I know how to use the generated MCP server.

#### Acceptance Criteria

1. Summary generator module created (`packages/cli/src/summary.ts`)
2. Generation summary: file count, tool count, lines of code, generation time
3. File listing: show key generated files with brief descriptions
4. Tool statistics: total tools, tools by category, auth requirements
5. Configuration summary: base URL, auth type, environment variables needed
6. Next steps section: numbered list of actions to take (install deps, configure env, run server)
7. Quick start commands: show exact commands to copy-paste (e.g., `cd output-dir && npm install`)
8. Environment setup: highlight required environment variables with examples
9. Testing instructions: how to test the generated server with Claude
10. Documentation links: reference to generated README and DISCOVERY.md
11. Success message: celebratory message with ASCII art or emoji (optional, configurable)
12. Warning highlights: show any warnings or limitations from generation
13. Color formatting: use colors for readability (green for success, yellow for warnings)
14. Summary export: option to save summary to file with `--summary-file` flag
15. Test suite: validate summary generation for various scenarios (at least 5 test cases)

### Story 7.7: Enhanced TypeScript Type Safety

**As a** generated MCP server,
**I want** strict TypeScript types throughout the codebase,
**so that** I benefit from compile-time type checking and IDE support.

#### Acceptance Criteria

1. Type safety module created (`packages/generator/src/type-safety.ts`)
2. Strict mode enforcement: `tsconfig.json` includes all strict flags
3. No implicit any: eliminate `any` types, use proper types or `unknown`
4. Null safety: explicit handling of `null` and `undefined` values
5. Type guards: generate type guard functions for union types
6. Generic types: use generics for reusable, type-safe functions
7. Interface exports: export all generated interfaces for external use
8. Type-only imports: use `import type` for type-only imports
9. Return type annotations: explicit return types for all functions
10. Parameter type annotations: explicit types for all function parameters
11. Const assertions: use `as const` for literal types where appropriate
12. Discriminated unions: use discriminated unions for polymorphic types
13. Type testing: include type tests to verify type correctness
14. Documentation: JSDoc comments with `@param` and `@returns` for complex types
15. Test suite: validate type safety with various TypeScript configurations (at least 8 test cases)

### Story 7.8: User Feedback Collection Mechanism

**As a** project maintainer,
**I want** to collect user feedback on generated servers,
**so that** I can improve the tool based on real usage.

#### Acceptance Criteria

1. Feedback mechanism: prompt user for optional feedback after successful generation
2. Feedback prompts: "Was this helpful?", "Any issues encountered?", "Suggestions?"
3. Feedback collection: save feedback to local file or send to analytics endpoint (opt-in)
4. Privacy: no personally identifiable information collected without consent
5. Opt-out: `--no-feedback` flag disables feedback prompts
6. Feedback format: structured JSON with generation metadata (tool version, API size, errors encountered)
7. Anonymous metrics: optional anonymous usage metrics (tool version, OpenAPI size, generation time)
8. Error reporting: option to submit error reports with sanitized stack traces
9. Telemetry consent: clear consent prompt on first use, saved in config file
10. Feedback review: internal dashboard or tool to review collected feedback
11. Privacy policy: link to privacy policy explaining data collection
12. Feedback incentives: thank users for feedback, acknowledge contributions
13. Community feedback: link to GitHub discussions or issue tracker for detailed feedback
14. Test suite: validate feedback mechanism respects user preferences (at least 4 test cases)

### Story 7.9: End-to-End Polish and User Acceptance Testing

**As a** project stakeholder,
**I want** comprehensive end-to-end testing with real users,
**so that** I'm confident the tool is production-ready.

#### Acceptance Criteria

1. UAT plan created: define test scenarios, acceptance criteria, user personas
2. Beta user recruitment: recruit 10-20 beta testers from target audience
3. Test scenario 1: Generate MCP server from Ozon API, configure, deploy, use with Claude
4. Test scenario 2: Generate from minimal OpenAPI (5 methods), verify correctness
5. Test scenario 3: Generate from large OpenAPI (300+ methods), verify performance and usability
6. Test scenario 4: Generate with various auth types (API Key, Bearer, Basic), verify auth works
7. Test scenario 5: Error scenarios - invalid OpenAPI, missing fields, unsupported features
8. Usability testing: observe users completing tasks, collect qualitative feedback
9. Performance testing: measure generation time, memory usage, generated code size
10. Documentation testing: verify users can complete setup using only generated docs
11. Integration testing: verify generated servers work with Claude in real workflows
12. Bug tracking: collect and prioritize bugs discovered during UAT
13. Success metrics: ≥80% task completion rate, ≥4/5 satisfaction score, <5 critical bugs
14. Iteration: fix critical issues, re-test, refine based on feedback
15. UAT report: document findings, recommendations, readiness assessment

---

**📋 Epic 7 Complete** - Production polish ready for documentation and release (Epic 8)

---

**📋 Note:** Epic 8 (Documentation, Examples & Release) requires similar detailed expansion. The complete epic with all user stories follows the same structure.

---
