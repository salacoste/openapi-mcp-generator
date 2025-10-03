# 2. Requirements

## 2.1 Functional Requirements

**FR1:** The system shall parse OpenAPI 3.0 JSON and YAML documents with full validation against the specification

**FR2:** The system shall resolve `$ref` references (both internal and external) within OpenAPI documents

**FR3:** The system shall generate TypeScript MCP server code with tool definitions for each `path + method` combination from the OpenAPI specification

**FR4:** The system shall generate type-safe TypeScript interfaces from `components/schemas` in the OpenAPI document

**FR5:** The system shall generate authentication handlers for API Key (header/query), Bearer Token, and Basic Auth schemes based on `securitySchemes`

**FR6:** The system shall create AI-optimized tool descriptions by transforming OpenAPI `summary` and `description` fields into AI-readable format

**FR7:** The system shall implement tag-based method categorization using OpenAPI `tags` for semantic organization

**FR8:** The system shall provide a `listMethods(category?, search?)` MCP tool for AI to discover and filter available API methods

**FR9:** The system shall format API responses for AI consumption by structuring data, abbreviating large arrays, and presenting human-readable representations

**FR10:** The system shall generate a complete MCP server package including `package.json`, `README.md`, and `.env.example` files

**FR11:** The CLI shall provide a `generate <swagger-path> --output <dir>` command for one-step server generation

**FR12:** The CLI shall support `--format json|yaml`, `--verbose`, and `--auth-type` flags for configuration

**FR13:** The system shall provide clear error messages when OpenAPI parsing fails with specific validation issues

**FR14:** The generated MCP server shall use environment variables (via `.env` files) for API credential configuration

**FR15:** The system shall generate compilable TypeScript code that passes `tsc` validation without errors

## 2.2 Non-Functional Requirements

**NFR1:** The CLI shall complete generation in <30 seconds for OpenAPI documents with 50 methods

**NFR2:** The CLI shall complete generation in <2 minutes for OpenAPI documents with 300+ methods

**NFR3:** The CLI shall consume <512MB RAM during the generation process

**NFR4:** The generated MCP server shall add <100ms latency overhead above actual API response time

**NFR5:** The system shall achieve ≥85% generation success rate for valid OpenAPI 3.0 documents

**NFR6:** The generated TypeScript code shall compile with 100% success rate (zero compilation errors)

**NFR7:** The system shall support Node.js ≥18.0.0 runtime environment

**NFR8:** The system shall run on macOS, Linux, and Windows (WSL or native Node.js)

**NFR9:** The generated code shall never hardcode API credentials—all authentication data must use environment variables

**NFR10:** The system shall sanitize user input from OpenAPI documents to prevent code injection vulnerabilities

**NFR11:** The generated MCP server shall enable AI to work with APIs containing 200+ methods without context window overflow

**NFR12:** The documentation shall enable ≥70% of users to complete onboarding without support

---
