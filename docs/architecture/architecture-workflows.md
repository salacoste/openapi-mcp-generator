# OpenAPI-to-MCP Generator - Workflows and Interaction Patterns

**Version:** 1.0
**Status:** ✅ Ready for Development
**Last Updated:** 2025-01-03
**Parent Document:** [Main Architecture](./architecture.md)

## Table of Contents

1. [Overview](#overview)
2. [Core Workflows](#core-workflows)
3. [Component Interactions](#component-interactions)
4. [Error Handling Flows](#error-handling-flows)
5. [Performance Workflows](#performance-workflows)
6. [Security Workflows](#security-workflows)

---

## Overview

This document provides comprehensive sequence diagrams and interaction patterns for all critical workflows in the OpenAPI-to-MCP Generator system.

**Related Documents:**
- [Main Architecture](./architecture.md) - Complete system architecture
- [Data Models](./architecture-data-models.md) - Data transformation specifications
- [Validation Report](./architecture-validation.md) - Architecture quality assessment

**Workflow Categories:**
1. **Happy Path Generation** - Successful end-to-end code generation
2. **Error Handling** - Graceful degradation and recovery
3. **Runtime Execution** - MCP server operation
4. **Smart Filtering** - Tag-based tool discovery
5. **CI/CD Publishing** - Automated deployment

---

## Core Workflows

### Workflow 1: Happy Path Generation (End-to-End)

**Purpose:** Complete CLI invocation from OpenAPI spec to deployable MCP server.

**Trigger:** User runs `npx openapi-to-mcp generate petstore.yaml --output ./my-mcp-server`

**Sequence Diagram:**

```
┌─────┐                ┌─────┐              ┌────────┐            ┌───────────┐           ┌──────────┐
│ User│                │ CLI │              │ Parser │            │ Generator │           │ FS Utils │
└──┬──┘                └──┬──┘              └───┬────┘            └─────┬─────┘           └────┬─────┘
   │                      │                     │                       │                      │
   │ $ openapi-to-mcp     │                     │                       │                      │
   │ generate petstore... │                     │                       │                      │
   ├─────────────────────>│                     │                       │                      │
   │                      │                     │                       │                      │
   │                      │ 1. Validate args    │                       │                      │
   │                      │ (path, flags)       │                       │                      │
   │                      │                     │                       │                      │
   │                      │ 2. Parse OpenAPI    │                       │                      │
   │                      ├────────────────────>│                       │                      │
   │                      │                     │                       │                      │
   │                      │                     │ 3. Resolve $refs      │                      │
   │                      │                     │ (@apidevtools/...)    │                      │
   │                      │                     │                       │                      │
   │                      │                     │ 4. Validate schema    │                      │
   │                      │                     │ (Zod)                 │                      │
   │                      │                     │                       │                      │
   │                      │ OpenAPIDocument     │                       │                      │
   │                      │<────────────────────┤                       │                      │
   │                      │                     │                       │                      │
   │                      │ 5. Normalize ops    │                       │                      │
   │                      ├────────────────────>│                       │                      │
   │                      │                     │                       │                      │
   │                      │                     │ 6. Extract operations │                      │
   │                      │                     │ 7. AI optimize descs  │                      │
   │                      │                     │ 8. Assign categories  │                      │
   │                      │                     │                       │                      │
   │                      │ NormalizedOp[]      │                       │                      │
   │                      │<────────────────────┤                       │                      │
   │                      │                     │                       │                      │
   │                      │ 9. Generate code    │                       │                      │
   │                      ├─────────────────────┴──────────────────────>│                      │
   │                      │                                              │                      │
   │                      │                                              │ 10. Generate types   │
   │                      │                                              │ (ts-morph)           │
   │                      │                                              │                      │
   │                      │                                              │ 11. Generate tools   │
   │                      │                                              │ (Handlebars)         │
   │                      │                                              │                      │
   │                      │                                              │ 12. Generate configs │
   │                      │                                              │ (package.json, etc)  │
   │                      │                                              │                      │
   │                      │                     GeneratedMCPServer       │                      │
   │                      │<─────────────────────────────────────────────┤                      │
   │                      │                                              │                      │
   │                      │ 13. Write files                              │                      │
   │                      ├──────────────────────────────────────────────┴─────────────────────>│
   │                      │                                                                     │
   │                      │                                                     14. Create dirs  │
   │                      │                                                     15. Write files  │
   │                      │                                                                     │
   │                      │                                              Success                │
   │                      │<────────────────────────────────────────────────────────────────────┤
   │                      │                                                                     │
   │                      │ 16. Run tsc --noEmit                                                │
   │                      │ (validation)                                                        │
   │                      │                                                                     │
   │ ✅ Success message   │                                                                     │
   │ + next steps         │                                                                     │
   │<─────────────────────┤                                                                     │
   │                      │                                                                     │
```

**Step Details:**

1. **Validate Arguments** (CLI Package)
   - Check file path exists and is readable
   - Validate output directory is writable
   - Parse and validate flags (--format, --auth-type, etc.)
   - Set up logging level based on --verbose flag

2. **Parse OpenAPI** (Parser Package)
   - Load YAML/JSON file using @apidevtools/swagger-parser
   - Resolve all `$ref` pointers (local and remote)
   - Validate against OpenAPI 3.0 schema
   - Extract global metadata (info, servers, security)

3. **Validate Schema** (Parser Package)
   - Run Zod validation on OpenAPIDocument
   - Check for required fields (info.title, servers, paths)
   - Validate HTTPS-only server URLs (production mode)
   - Ensure all security schemes are defined

4. **Normalize Operations** (Parser Package)
   - Iterate through all paths and HTTP methods
   - Flatten parameters (merge path-level and operation-level)
   - Generate AI-optimized descriptions from summary + description
   - Assign primary category from tags[0]
   - Merge global and operation-level security

5. **Generate Types** (Generator Package)
   - Use ts-morph to create TypeScript AST
   - Map OpenAPI schemas → TypeScript interfaces
   - Generate PascalCase interface names
   - Handle nested objects and arrays
   - Add JSDoc comments from descriptions

6. **Generate Tools** (Generator Package)
   - Use Handlebars templates for MCP tool boilerplate
   - Create one tool file per operation
   - Generate JSON Schema for inputSchema
   - Add Zod runtime validation
   - Include HTTP request logic with error handling

7. **Generate Configs** (Generator Package)
   - Create package.json with exact dependency versions
   - Generate tsconfig.json with strict mode
   - Create .env.example with required variables
   - Generate README.md with setup instructions

8. **Write Files** (FS Utils)
   - Create output directory structure
   - Write all generated files with UTF-8 encoding
   - Copy static template files
   - Set correct file permissions

9. **Validate Output** (CLI Package)
   - Run `tsc --noEmit` to check TypeScript compilation
   - Fail generation if compilation errors found
   - Display clear error messages with file:line references

10. **Success Message** (CLI Package)
    - Display checkmark with output directory path
    - Show next steps (npm install, configure .env, npm run build)
    - Display tool count and authentication type

**Performance Targets:**
- Small APIs (<10 operations): <2 seconds
- Medium APIs (10-50 operations): <5 seconds
- Large APIs (50-200 operations): <15 seconds

---

### Workflow 2: Error Handling and Recovery

**Purpose:** Graceful error handling with actionable user feedback.

**Error Categories:**
1. **User Errors** - Invalid input, missing files, configuration issues
2. **Network Errors** - Failed HTTP requests, unreachable servers
3. **Validation Errors** - Invalid OpenAPI spec, schema violations
4. **Internal Errors** - Bugs, unexpected exceptions

**Sequence Diagram:**

```
┌─────┐                ┌─────┐              ┌────────┐            ┌───────────┐
│ User│                │ CLI │              │ Parser │            │ Generator │
└──┬──┘                └──┬──┘              └───┬────┘            └─────┬─────┘
   │                      │                     │                       │
   │ Invalid command      │                     │                       │
   ├─────────────────────>│                     │                       │
   │                      │                     │                       │
   │                      │ 1. Catch error      │                       │
   │                      │ 2. Determine type   │                       │
   │                      │                     │                       │
   │                      ├─── User Error? ─────┤                       │
   │                      │                     │                       │
   │                      │ 3a. Format message  │                       │
   │                      │ 3b. Add context     │                       │
   │                      │ 3c. Suggest fix     │                       │
   │                      │                     │                       │
   │ ❌ Error message     │                     │                       │
   │ + suggested fix      │                     │                       │
   │<─────────────────────┤                     │                       │
   │                      │                     │                       │
   │                      ├── Network Error? ───┤                       │
   │                      │                     │                       │
   │                      │ 4a. Log full error  │                       │
   │                      │ 4b. Check retry     │                       │
   │                      │ 4c. Exponential     │                       │
   │                      │     backoff         │                       │
   │                      │                     │                       │
   │ ⚠️  Retry message    │                     │                       │
   │<─────────────────────┤                     │                       │
   │                      │                     │                       │
   │                      │ 5. Retry attempt    │                       │
   │                      ├────────────────────>│                       │
   │                      │                     │                       │
   │                      │                     │ ❌ Still fails        │
   │                      │<────────────────────┤                       │
   │                      │                     │                       │
   │ ❌ Final error       │                     │                       │
   │ + offline suggestion │                     │                       │
   │<─────────────────────┤                     │                       │
   │                      │                     │                       │
   │                      ├─ Validation Error? ─┤                       │
   │                      │                     │                       │
   │                      │ 6a. Extract details │                       │
   │                      │ 6b. Show location   │                       │
   │                      │ 6c. Link to docs    │                       │
   │                      │                     │                       │
   │ ❌ Validation failed │                     │                       │
   │ at paths./users.get  │                     │                       │
   │ + docs link          │                     │                       │
   │<─────────────────────┤                     │                       │
```

**Error Message Format:**

```typescript
// User Error Example
❌ Error: OpenAPI file not found

File path: ./nonexistent.yaml
Location: /Users/username/project

Suggestion: Check the file path and try again.
Run 'npx openapi-to-mcp --help' for usage examples.

// Network Error Example
⚠️  Network Error: Failed to resolve external $ref

URL: https://api.example.com/schemas/user.yaml
Error: ENOTFOUND (DNS lookup failed)

Retrying in 2 seconds... (Attempt 2/3)

// Validation Error Example
❌ Validation Error: Invalid OpenAPI specification

Location: paths./users.get.responses.200
Issue: Missing 'description' field (required by OpenAPI 3.0)

Fix: Add a description to the 200 response.
Docs: https://spec.openapis.org/oas/v3.0.3#response-object

// Internal Error Example
🚨 Internal Error: Unexpected exception during code generation

Please report this issue at:
https://github.com/your-org/openapi-to-mcp/issues

Error details:
TypeError: Cannot read property 'schema' of undefined
  at generateTypes (generator/src/types.ts:45)
  at generate (generator/src/index.ts:23)
```

**Error Recovery Strategies:**

| Error Type | Strategy | Exit Code |
|------------|----------|-----------|
| User Error | Display message + suggestion | 1 |
| Network Error | Exponential backoff (3 retries) | 1 |
| Validation Error | Show location + fix | 1 |
| Internal Error | Log trace + issue link | 2 |

---

### Workflow 3: Runtime MCP Server Execution

**Purpose:** MCP server handling tool invocations from AI clients.

**Trigger:** Claude Desktop invokes `getUserById` tool via MCP protocol.

**Sequence Diagram:**

```
┌─────────────┐       ┌────────────┐       ┌─────────┐       ┌─────────┐
│ Claude      │       │ MCP Server │       │ Tool    │       │ External│
│ Desktop     │       │ (Generated)│       │ Handler │       │ API     │
└──────┬──────┘       └──────┬─────┘       └────┬────┘       └────┬────┘
       │                     │                   │                 │
       │ 1. list_tools       │                   │                 │
       ├────────────────────>│                   │                 │
       │                     │                   │                 │
       │                     │ 2. Return tools   │                 │
       │                     │ (MCPToolDef[])    │                 │
       │<────────────────────┤                   │                 │
       │                     │                   │                 │
       │ 3. call_tool        │                   │                 │
       │ {                   │                   │                 │
       │   name: "getUser"   │                   │                 │
       │   input: {userId:1} │                   │                 │
       │ }                   │                   │                 │
       ├────────────────────>│                   │                 │
       │                     │                   │                 │
       │                     │ 4. Validate input │                 │
       │                     │ (Zod schema)      │                 │
       │                     │                   │                 │
       │                     │ 5. Route to tool  │                 │
       │                     ├──────────────────>│                 │
       │                     │                   │                 │
       │                     │                   │ 6. Load .env    │
       │                     │                   │ (credentials)   │
       │                     │                   │                 │
       │                     │                   │ 7. Build HTTP   │
       │                     │                   │ request         │
       │                     │                   │                 │
       │                     │                   │ 8. Send request │
       │                     │                   ├────────────────>│
       │                     │                   │                 │
       │                     │                   │                 │ 9. Process
       │                     │                   │                 │
       │                     │                   │ 10. Response    │
       │                     │                   │<────────────────┤
       │                     │                   │                 │
       │                     │                   │ 11. Validate    │
       │                     │                   │ response schema │
       │                     │                   │                 │
       │                     │ 12. Return data   │                 │
       │                     │<──────────────────┤                 │
       │                     │                   │                 │
       │ 13. Tool result     │                   │                 │
       │ { content: [...] }  │                   │                 │
       │<────────────────────┤                   │                 │
       │                     │                   │                 │
```

**Step Details:**

1. **list_tools Request** (MCP Protocol)
   - Claude Desktop sends `list_tools` RPC request
   - MCP server returns all registered tools with metadata
   - Each tool includes: name, description, inputSchema

2. **call_tool Request** (MCP Protocol)
   - Claude Desktop sends `call_tool` with tool name + input params
   - MCP server validates tool exists
   - Input parameters validated against JSON Schema

3. **Input Validation** (Zod)
   - Parse input using Zod schema
   - Check required fields are present
   - Validate data types and formats
   - Return validation error if invalid

4. **Credential Loading** (dotenv)
   - Load `.env` file at server startup
   - Access credentials via `process.env.API_KEY`
   - Fail early if required credentials missing
   - Never log or expose credentials

5. **HTTP Request** (axios/fetch)
   - Build request URL with path parameters
   - Add query parameters
   - Set authentication headers
   - Set Content-Type for request body
   - Set timeout (30 seconds default)

6. **Response Processing**
   - Check HTTP status code (2xx = success)
   - Parse JSON response body
   - Validate against expected schema (optional)
   - Handle empty responses (204 No Content)

7. **Error Handling**
   - Network errors → Retry with exponential backoff
   - 4xx errors → Return user error message
   - 5xx errors → Log details and return server error
   - Timeout → Return timeout error with suggestion

8. **Return Result** (MCP Protocol)
   - Format response as MCP content block
   - Include text representation for AI readability
   - Return errors as MCP error responses
   - Log all requests in debug mode

**Performance Targets:**
- Tool invocation overhead: <10ms
- Input validation: <5ms
- Typical API request: <500ms
- Total round-trip: <600ms

---

### Workflow 4: Smart Method Filtering with listMethods

**Purpose:** Enable AI to discover available operations without loading all tools into context.

**Scenario:** Claude needs to find user-related operations from an API with 200 endpoints.

**Sequence Diagram:**

```
┌─────────────┐       ┌────────────┐       ┌─────────────┐
│ Claude      │       │ MCP Server │       │ listMethods │
│             │       │            │       │ Tool        │
└──────┬──────┘       └──────┬─────┘       └──────┬──────┘
       │                     │                     │
       │ 1. list_tools       │                     │
       ├────────────────────>│                     │
       │                     │                     │
       │ 2. Return tools     │                     │
       │ (includes           │                     │
       │  listMethods)       │                     │
       │<────────────────────┤                     │
       │                     │                     │
       │ 3. call_tool        │                     │
       │ {                   │                     │
       │   name:             │                     │
       │   "listMethods",    │                     │
       │   input: {          │                     │
       │     tag: "users"    │                     │
       │   }                 │                     │
       │ }                   │                     │
       ├────────────────────>│                     │
       │                     │                     │
       │                     │ 4. Route to handler │
       │                     ├────────────────────>│
       │                     │                     │
       │                     │                     │ 5. Filter by tag
       │                     │                     │
       │                     │                     │ 6. Format results
       │                     │                     │
       │                     │ 7. Return filtered  │
       │                     │ methods             │
       │                     │<────────────────────┤
       │                     │                     │
       │ 8. Result:          │                     │
       │ [                   │                     │
       │   "getUserById",    │                     │
       │   "createUser",     │                     │
       │   "updateUser"      │                     │
       │ ]                   │                     │
       │<────────────────────┤                     │
       │                     │                     │
       │ 9. call_tool        │                     │
       │ { name:             │                     │
       │   "getUserById" }   │                     │
       ├────────────────────>│                     │
       │                     │                     │
```

**listMethods Tool Specification:**

```typescript
// Generated tool: src/tools/listMethods.ts
export const listMethodsTool: MCPTool = {
  name: 'listMethods',
  description: 'Search and discover available API operations by tag, keyword, or category.',
  inputSchema: {
    type: 'object',
    properties: {
      tag: {
        type: 'string',
        description: 'Filter by OpenAPI tag (e.g., "users", "products")',
      },
      keyword: {
        type: 'string',
        description: 'Search tool names and descriptions (case-insensitive)',
      },
      category: {
        type: 'string',
        description: 'Filter by category (e.g., "read", "write", "delete")',
      },
    },
    additionalProperties: false,
  },
};

export async function listMethods(input: {
  tag?: string;
  keyword?: string;
  category?: string;
}): Promise<MCPToolSummary[]> {
  const allTools = getAllToolDefinitions();

  let filtered = allTools;

  // Filter by tag
  if (input.tag) {
    filtered = filtered.filter((tool) =>
      tool.metadata.tags.includes(input.tag)
    );
  }

  // Filter by keyword
  if (input.keyword) {
    const lower = input.keyword.toLowerCase();
    filtered = filtered.filter(
      (tool) =>
        tool.name.toLowerCase().includes(lower) ||
        tool.description.toLowerCase().includes(lower)
    );
  }

  // Filter by category
  if (input.category) {
    filtered = filtered.filter(
      (tool) => tool.metadata.category === input.category
    );
  }

  // Return summary (name + short description)
  return filtered.map((tool) => ({
    name: tool.name,
    description: tool.description.slice(0, 100), // Truncate for context efficiency
    tags: tool.metadata.tags,
    category: tool.metadata.category,
  }));
}
```

**Usage Example:**

```javascript
// Claude's workflow:

// 1. Discover user operations
const userOps = await listMethods({ tag: 'users' });
// Returns: ['getUserById', 'createUser', 'updateUser', 'deleteUser']

// 2. Find search operations
const searchOps = await listMethods({ keyword: 'search' });
// Returns: ['searchUsers', 'searchProducts', 'searchOrders']

// 3. Find read-only operations
const readOps = await listMethods({ category: 'read' });
// Returns: ['getUserById', 'getProductById', 'listOrders']

// 4. Invoke specific tool
const user = await getUserById({ userId: '123' });
```

**Benefits:**
- Reduces context usage for large APIs (200 tools → 1 listMethods tool)
- Enables progressive discovery of operations
- AI can explore API capabilities incrementally
- Improves response time for initial queries

---

### Workflow 5: CI/CD Publishing to npm Registry

**Purpose:** Automated deployment of CLI tool to npm on git tag push.

**Trigger:** Developer pushes git tag `v1.0.0` to GitHub.

**Sequence Diagram:**

```
┌──────────┐      ┌────────────┐      ┌─────────────┐      ┌─────────┐
│Developer │      │GitHub      │      │GitHub       │      │npm      │
│          │      │Repository  │      │Actions      │      │Registry │
└────┬─────┘      └──────┬─────┘      └──────┬──────┘      └────┬────┘
     │                   │                    │                  │
     │ 1. git tag v1.0.0 │                    │                  │
     ├──────────────────>│                    │                  │
     │                   │                    │                  │
     │ 2. git push       │                    │                  │
     │    --tags         │                    │                  │
     ├──────────────────>│                    │                  │
     │                   │                    │                  │
     │                   │ 3. Trigger workflow│                  │
     │                   │ (on: push tags)    │                  │
     │                   ├───────────────────>│                  │
     │                   │                    │                  │
     │                   │                    │ 4. Checkout code │
     │                   │                    │                  │
     │                   │                    │ 5. Setup Node 20 │
     │                   │                    │                  │
     │                   │                    │ 6. pnpm install  │
     │                   │                    │                  │
     │                   │                    │ 7. Run tests     │
     │                   │                    │ (pnpm test)      │
     │                   │                    │                  │
     │                   │                    │ ✅ Tests pass    │
     │                   │                    │                  │
     │                   │                    │ 8. Build packages│
     │                   │                    │ (pnpm build)     │
     │                   │                    │                  │
     │                   │                    │ 9. Lint check    │
     │                   │                    │ (pnpm lint)      │
     │                   │                    │                  │
     │                   │                    │ 10. Type check   │
     │                   │                    │ (tsc --noEmit)   │
     │                   │                    │                  │
     │                   │                    │ ✅ All checks pass│
     │                   │                    │                  │
     │                   │                    │ 11. npm publish  │
     │                   │                    │ (with NPM_TOKEN) │
     │                   │                    ├─────────────────>│
     │                   │                    │                  │
     │                   │                    │                  │ 12. Validate
     │                   │                    │                  │     package
     │                   │                    │                  │
     │                   │                    │                  │ 13. Publish
     │                   │                    │                  │     to registry
     │                   │                    │                  │
     │                   │                    │ ✅ Published     │
     │                   │                    │<─────────────────┤
     │                   │                    │                  │
     │                   │ 14. Create GitHub  │                  │
     │                   │ release            │                  │
     │                   │<───────────────────┤                  │
     │                   │                    │                  │
     │ 15. Notification  │                    │                  │
     │ (email/Slack)     │                    │                  │
     │<──────────────────┤                    │                  │
```

**GitHub Actions Workflow:**

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.11.0'
          registry-url: 'https://registry.npmjs.org'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8.15.1

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test

      - name: Build packages
        run: pnpm build

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm typecheck

      - name: Publish to npm
        run: pnpm publish --access public --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
```

**Quality Gates (Must Pass):**
1. ✅ All unit tests pass (≥80% coverage)
2. ✅ All integration tests pass
3. ✅ TypeScript compilation succeeds
4. ✅ ESLint passes with no errors
5. ✅ pnpm build succeeds for all packages
6. ✅ npm publish succeeds

**Rollback Strategy:**
- If publish fails → Workflow fails (no partial publish)
- If published but broken → `npm deprecate @scope/pkg@version`
- If critical bug → Publish patch version with fix

---

## Component Interactions

### CLI ↔ Parser Interaction

**Purpose:** CLI orchestrates parsing and passes data to generator.

**Key Operations:**
1. CLI validates command-line arguments
2. CLI invokes parser with OpenAPI file path
3. Parser returns `OpenAPIDocument` or throws error
4. CLI handles errors and displays messages

**Code Example:**

```typescript
// packages/cli/src/commands/generate.ts
import { parseOpenAPI } from '@openapi-mcp/parser';
import { generateMCPServer } from '@openapi-mcp/generator';

export async function generateCommand(
  openApiPath: string,
  options: GenerateOptions
) {
  try {
    // Parse OpenAPI spec
    logger.info(`Parsing OpenAPI spec: ${openApiPath}`);
    const openApiDoc = await parseOpenAPI(openApiPath, {
      validate: true,
      resolveRefs: true,
    });

    logger.info(`Found ${openApiDoc.paths.length} paths`);

    // Generate MCP server
    logger.info('Generating MCP server...');
    const generatedServer = await generateMCPServer(openApiDoc, {
      outputDir: options.output,
      authType: options.authType,
    });

    logger.success(`✅ Generated ${generatedServer.toolCount} tools`);
  } catch (error) {
    if (error instanceof CLIError) {
      logger.error(error.message);
      process.exit(1);
    } else {
      logger.error('Unexpected error:', error);
      process.exit(2);
    }
  }
}
```

---

### Parser ↔ Generator Interaction

**Purpose:** Parser provides normalized operations to generator.

**Key Operations:**
1. Parser normalizes OpenAPI operations
2. Parser returns `NormalizedOperation[]` array
3. Generator iterates operations to create tools
4. Generator requests type generation for schemas

**Code Example:**

```typescript
// packages/generator/src/index.ts
import { NormalizedOperation } from '@openapi-mcp/parser';

export async function generateMCPServer(
  operations: NormalizedOperation[],
  config: GeneratorConfig
): Promise<GeneratedMCPServer> {
  const typeGenerator = new TypeGenerator();
  const toolGenerator = new ToolGenerator();

  // Generate TypeScript interfaces
  const interfaces = operations.flatMap((op) => {
    const requestType = typeGenerator.generateRequestType(op);
    const responseType = typeGenerator.generateResponseType(op);
    return [requestType, responseType];
  });

  // Generate MCP tools
  const tools = operations.map((op) =>
    toolGenerator.generateTool(op, config.authType)
  );

  // Render templates
  const files = await renderTemplates({
    interfaces,
    tools,
    config,
  });

  return {
    metadata: { /* ... */ },
    files,
    dependencies: { /* ... */ },
    toolCount: tools.length,
    authType: config.authType,
  };
}
```

---

## Error Handling Flows

### Parser Error Flow

```
Parse OpenAPI
     ↓
File exists? ────NO───→ CLIError("File not found")
     ↓ YES
Valid YAML/JSON? ──NO──→ CLIError("Invalid YAML/JSON syntax")
     ↓ YES
Resolve $refs
     ↓
All refs resolve? ─NO──→ NetworkError("Failed to resolve $ref")
     ↓ YES
Validate schema
     ↓
Valid OpenAPI 3.0? NO──→ ValidationError("Invalid OpenAPI spec")
     ↓ YES
Return OpenAPIDocument
```

### Generator Error Flow

```
Generate Code
     ↓
Valid operations? ─NO──→ ValidationError("No operations found")
     ↓ YES
Generate types
     ↓
Valid TypeScript? ─NO──→ InternalError("Type generation failed")
     ↓ YES
Render templates
     ↓
Template exists? ──NO──→ InternalError("Template not found")
     ↓ YES
Write files
     ↓
Directory writable? NO─→ FileSystemError("Permission denied")
     ↓ YES
Compile TypeScript
     ↓
Compilation OK? ───NO──→ InternalError("Generated code doesn't compile")
     ↓ YES
Return GeneratedMCPServer
```

---

## Performance Workflows

### Performance Optimization Points

**1. Parallel Processing**
```typescript
// Parse and validate in parallel where possible
const [operations, schemas] = await Promise.all([
  parseOperations(openApiDoc),
  parseSchemas(openApiDoc.components.schemas),
]);
```

**2. Caching**
```typescript
// Cache resolved $refs to avoid redundant HTTP requests
const refCache = new Map<string, any>();

async function resolveRef(ref: string): Promise<any> {
  if (refCache.has(ref)) {
    return refCache.get(ref);
  }

  const resolved = await fetchExternalRef(ref);
  refCache.set(ref, resolved);
  return resolved;
}
```

**3. Streaming File Writes**
```typescript
// Write large files using streams
import { createWriteStream } from 'fs';

async function writeLargeFile(path: string, content: string) {
  const stream = createWriteStream(path);
  for (const chunk of chunkString(content, 1024)) {
    stream.write(chunk);
  }
  stream.end();
}
```

**Performance Targets:**
- OpenAPI parsing: <500ms for 200 operations
- Type generation: <100ms for 50 interfaces
- Template rendering: <200ms for 200 tools
- File I/O: <100ms for 20 files
- Total generation time: <2 seconds for typical API

---

## Security Workflows

### Credential Handling Flow

```
MCP Server Startup
     ↓
Load .env file (dotenv)
     ↓
Check required vars exist
     ↓
Missing vars? ──YES──→ Throw error + list missing vars
     ↓ NO
Store in process.env
     ↓
AI invokes tool
     ↓
Tool reads process.env.API_KEY
     ↓
Add to Authorization header
     ↓
Send HTTPS request
     ↓
Never log credentials
```

### HTTPS Enforcement Flow

```
Parse server URLs
     ↓
For each URL:
  Starts with https://? ──NO──→ Warn (dev) / Error (prod)
       ↓ YES
  Valid hostname? ──NO──→ ValidationError
       ↓ YES
  Accept URL
```

---

## Summary

This document provides comprehensive workflow specifications for the OpenAPI-to-MCP Generator:

**Core Workflows:**
1. **Happy Path Generation** - Complete CLI-to-output pipeline
2. **Error Handling** - Graceful degradation with actionable messages
3. **Runtime Execution** - MCP server handling tool invocations
4. **Smart Filtering** - Progressive discovery with listMethods
5. **CI/CD Publishing** - Automated deployment to npm

**Component Interactions:**
- CLI orchestrates parser and generator
- Parser provides normalized data
- Generator creates MCP server code

**Key Performance Targets:**
- Small API generation: <2 seconds
- Medium API generation: <5 seconds
- Large API generation: <15 seconds
- Tool invocation overhead: <10ms

**Related Documents:**
- [Main Architecture](./architecture.md) - Complete system overview
- [Data Models](./architecture-data-models.md) - Transformation specifications
- [Validation Report](./architecture-validation.md) - Quality assessment
