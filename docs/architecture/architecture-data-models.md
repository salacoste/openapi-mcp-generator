# OpenAPI-to-MCP Generator - Data Models Specification

**Version:** 1.0
**Status:** ✅ Ready for Development
**Last Updated:** 2025-01-03
**Parent Document:** [Main Architecture](./architecture.md)

## Table of Contents

1. [Overview](#overview)
2. [Data Model Catalog](#data-model-catalog)
3. [Model Specifications](#model-specifications)
4. [Transformation Pipeline](#transformation-pipeline)
5. [Type Mappings](#type-mappings)
6. [Validation Rules](#validation-rules)
7. [Examples](#examples)

---

## Overview

The OpenAPI-to-MCP Generator processes data through a multi-stage transformation pipeline. This document provides comprehensive specifications for all data models used throughout the system.

**Related Documents:**
- [Main Architecture](./architecture.md) - Complete system architecture
- [Workflows](./architecture-workflows.md) - Data flow diagrams and sequence interactions
- [Validation Report](./architecture-validation.md) - Architecture quality assessment

**Design Principles:**
1. **Immutability**: All intermediate models are immutable once created
2. **Type Safety**: Strict TypeScript types with Zod runtime validation
3. **Single Responsibility**: Each model represents one stage of transformation
4. **Self-Documenting**: Rich metadata for AI-readability and debugging

---

## Data Model Catalog

| Model | Purpose | Package | Stage | Validation |
|-------|---------|---------|-------|------------|
| **OpenAPIDocument** | Raw OpenAPI spec | `parser` | Input | Zod + JSON Schema |
| **NormalizedOperation** | Parsed API operation | `parser` | Normalization | Zod |
| **TypeScriptInterface** | Generated TypeScript types | `generator` | Type Generation | ts-morph |
| **MCPToolDefinition** | MCP tool metadata | `generator` | Tool Generation | MCP SDK |
| **AuthConfiguration** | Authentication config | `generator` | Security | Zod |
| **GeneratedMCPServer** | Complete server code | `generator` | Output | TypeScript Compiler |

---

## Model Specifications

### 1. OpenAPIDocument

**Purpose:** Represents the raw OpenAPI 3.0 specification after initial parsing and `$ref` resolution.

**Location:** `packages/parser/src/models/OpenAPIDocument.ts`

**Schema:**
```typescript
import { z } from 'zod';

export const OpenAPIDocumentSchema = z.object({
  openapi: z.string().regex(/^3\.0\.\d+$/),
  info: z.object({
    title: z.string().min(1),
    version: z.string().min(1),
    description: z.string().optional(),
    contact: z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      url: z.string().url().optional(),
    }).optional(),
  }),
  servers: z.array(z.object({
    url: z.string().url(),
    description: z.string().optional(),
  })).min(1),
  paths: z.record(z.string(), z.record(z.string(), z.any())),
  components: z.object({
    schemas: z.record(z.string(), z.any()).optional(),
    securitySchemes: z.record(z.string(), z.any()).optional(),
  }).optional(),
  security: z.array(z.record(z.string(), z.array(z.string()))).optional(),
  tags: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
  })).optional(),
});

export type OpenAPIDocument = z.infer<typeof OpenAPIDocumentSchema>;
```

**Validation Rules:**
- Must be OpenAPI 3.0.x (not 3.1.x for MVP)
- At least one server URL required
- All `$ref` pointers must be resolved before validation
- HTTPS-only server URLs enforced in production mode

**Metadata Fields:**
- `info.title` → Used for generated package name
- `info.description` → Included in MCP server README
- `servers[0].url` → Default base URL for API calls
- `tags` → Used for MCP tool categorization

---

### 2. NormalizedOperation

**Purpose:** Represents a single API operation (endpoint + HTTP method) with normalized metadata for code generation.

**Location:** `packages/parser/src/models/NormalizedOperation.ts`

**Schema:**
```typescript
import { z } from 'zod';

export const NormalizedOperationSchema = z.object({
  // Identity
  operationId: z.string().min(1),
  method: z.enum(['get', 'post', 'put', 'patch', 'delete', 'head', 'options']),
  path: z.string().startsWith('/'),

  // Metadata
  summary: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  deprecated: z.boolean().default(false),

  // Parameters
  parameters: z.array(z.object({
    name: z.string(),
    in: z.enum(['query', 'header', 'path', 'cookie']),
    required: z.boolean().default(false),
    schema: z.any(),
    description: z.string().optional(),
  })).default([]),

  // Request Body
  requestBody: z.object({
    required: z.boolean().default(false),
    content: z.record(z.string(), z.object({
      schema: z.any(),
    })),
    description: z.string().optional(),
  }).optional(),

  // Responses
  responses: z.record(z.string(), z.object({
    description: z.string(),
    content: z.record(z.string(), z.object({
      schema: z.any(),
    })).optional(),
  })),

  // Security
  security: z.array(z.record(z.string(), z.array(z.string()))).optional(),

  // AI Optimization
  aiOptimized: z.object({
    toolName: z.string(), // Normalized function name
    toolDescription: z.string(), // AI-readable description
    category: z.string().optional(), // Tag-based category
  }),
});

export type NormalizedOperation = z.infer<typeof NormalizedOperationSchema>;
```

**Transformation Logic:**
1. `operationId` → `camelCase` for tool name
2. `summary` + `description` → Combined AI-readable description
3. `tags[0]` → Primary category for filtering
4. `parameters` → Flattened and deduplicated
5. `security` → Merged with global security schemes

**Example Transformation:**
```typescript
// Input: OpenAPI Operation
{
  "operationId": "getUserById",
  "summary": "Get user by ID",
  "parameters": [
    { "name": "userId", "in": "path", "required": true, "schema": { "type": "string" } }
  ]
}

// Output: NormalizedOperation
{
  operationId: "getUserById",
  method: "get",
  path: "/users/{userId}",
  aiOptimized: {
    toolName: "getUserById",
    toolDescription: "Get user by ID. Retrieves detailed user information including profile data.",
    category: "users"
  }
}
```

---

### 3. TypeScriptInterface

**Purpose:** Represents generated TypeScript interfaces for request/response types.

**Location:** `packages/generator/src/models/TypeScriptInterface.ts`

**Schema:**
```typescript
import { z } from 'zod';

export const TypeScriptInterfaceSchema = z.object({
  name: z.string().regex(/^[A-Z][a-zA-Z0-9]*$/), // PascalCase
  properties: z.array(z.object({
    name: z.string(),
    type: z.string(), // TypeScript type string
    required: z.boolean(),
    description: z.string().optional(),
    defaultValue: z.string().optional(),
  })),
  extends: z.array(z.string()).optional(),
  generics: z.array(z.string()).optional(),
  exportType: z.enum(['interface', 'type', 'enum']).default('interface'),
  jsdoc: z.string().optional(),
});

export type TypeScriptInterface = z.infer<typeof TypeScriptInterfaceSchema>;
```

**Generation Rules:**
- All interfaces use `PascalCase` naming
- Optional properties use `?:` syntax
- Nested objects become separate interfaces with `_` suffix
- Arrays use `Array<T>` syntax (not `T[]`)
- Enums use `const enum` for tree-shaking

**Example:**
```typescript
// Input: OpenAPI Schema
{
  "type": "object",
  "required": ["id", "email"],
  "properties": {
    "id": { "type": "string" },
    "email": { "type": "string", "format": "email" },
    "age": { "type": "integer" }
  }
}

// Output: TypeScriptInterface
{
  name: "User",
  properties: [
    { name: "id", type: "string", required: true },
    { name: "email", type: "string", required: true },
    { name: "age", type: "number", required: false }
  ],
  exportType: "interface"
}

// Generated Code:
export interface User {
  id: string;
  email: string;
  age?: number;
}
```

---

### 4. MCPToolDefinition

**Purpose:** MCP-compliant tool definition with JSON Schema for parameters.

**Location:** `packages/generator/src/models/MCPToolDefinition.ts`

**Schema:**
```typescript
import { z } from 'zod';

export const MCPToolDefinitionSchema = z.object({
  name: z.string().regex(/^[a-z][a-zA-Z0-9]*$/), // camelCase
  description: z.string().min(10).max(500), // AI-optimized length
  inputSchema: z.object({
    type: z.literal('object'),
    properties: z.record(z.string(), z.any()),
    required: z.array(z.string()).optional(),
    additionalProperties: z.boolean().default(false),
  }),
  category: z.string().optional(),
  deprecated: z.boolean().default(false),

  // Runtime execution metadata
  httpMetadata: z.object({
    method: z.string(),
    path: z.string(),
    baseUrl: z.string().url(),
    authType: z.enum(['none', 'apiKey', 'bearer', 'basic']),
  }),
});

export type MCPToolDefinition = z.infer<typeof MCPToolDefinitionSchema>;
```

**MCP SDK Integration:**
```typescript
// Generated code using @modelcontextprotocol/sdk
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: mcpToolDefinitions.map(tool => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  })),
}));
```

**AI Optimization Rules:**
- Description length: 10-500 characters (Claude optimal range)
- Use imperative verbs: "Get", "Create", "Update", "Delete"
- Include context: what data is returned, side effects
- Avoid technical jargon in descriptions
- Parameter names use `snake_case` for consistency with MCP conventions

---

### 5. AuthConfiguration

**Purpose:** Authentication configuration for generated MCP server.

**Location:** `packages/generator/src/models/AuthConfiguration.ts`

**Schema:**
```typescript
import { z } from 'zod';

export const AuthConfigurationSchema = z.object({
  type: z.enum(['none', 'apiKey', 'bearer', 'basic']),

  // API Key auth
  apiKey: z.object({
    headerName: z.string().default('X-API-Key'),
    envVarName: z.string().regex(/^[A-Z_]+$/),
    description: z.string(),
  }).optional(),

  // Bearer token auth
  bearer: z.object({
    envVarName: z.string().regex(/^[A-Z_]+$/),
    description: z.string(),
  }).optional(),

  // Basic auth
  basic: z.object({
    usernameEnvVar: z.string().regex(/^[A-Z_]+$/),
    passwordEnvVar: z.string().regex(/^[A-Z_]+$/),
    description: z.string(),
  }).optional(),
});

export type AuthConfiguration = z.infer<typeof AuthConfigurationSchema>;
```

**Environment Variable Naming:**
```typescript
// API Key example
{
  type: 'apiKey',
  apiKey: {
    headerName: 'X-API-Key',
    envVarName: 'MYAPI_API_KEY',
    description: 'Your MyAPI API key from https://myapi.com/settings'
  }
}

// Generated .env.example:
# Your MyAPI API key from https://myapi.com/settings
MYAPI_API_KEY=your_api_key_here
```

**Security Requirements:**
- All secrets loaded via `dotenv` at runtime
- No default values or examples in code
- Environment variable names prefixed with API name
- Generated README includes setup instructions

---

### 6. GeneratedMCPServer

**Purpose:** Complete representation of generated MCP server output.

**Location:** `packages/generator/src/models/GeneratedMCPServer.ts`

**Schema:**
```typescript
import { z } from 'zod';

export const GeneratedMCPServerSchema = z.object({
  metadata: z.object({
    packageName: z.string().regex(/^[a-z0-9-]+$/),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    description: z.string(),
    sourceSpec: z.string(), // Path to original OpenAPI file
    generatedAt: z.string().datetime(),
  }),

  files: z.array(z.object({
    path: z.string(), // Relative path in output directory
    content: z.string(),
    type: z.enum(['typescript', 'json', 'markdown', 'env', 'config']),
  })),

  dependencies: z.object({
    runtime: z.record(z.string(), z.string()), // Exact versions
    dev: z.record(z.string(), z.string()),
  }),

  toolCount: z.number().int().positive(),
  authType: z.enum(['none', 'apiKey', 'bearer', 'basic']),
});

export type GeneratedMCPServer = z.infer<typeof GeneratedMCPServerSchema>;
```

**Output Structure:**
```
<output-dir>/
├── src/
│   ├── index.ts          (MCP server entry point)
│   ├── types.ts          (Generated TypeScript interfaces)
│   ├── tools/            (One file per MCP tool)
│   │   ├── getUserById.ts
│   │   └── createUser.ts
│   └── auth.ts           (Authentication helpers)
├── package.json          (Generated with exact versions)
├── tsconfig.json         (TypeScript configuration)
├── .env.example          (Environment template)
└── README.md             (Setup and usage instructions)
```

---

## Transformation Pipeline

**Overview:** Data flows through 4 stages from OpenAPI spec to deployable MCP server.

```
[OpenAPI File]
      ↓
[1. Parse & Validate] (@apidevtools/swagger-parser)
      ↓
[OpenAPIDocument] (Zod validation)
      ↓
[2. Normalize Operations] (Parser package)
      ↓
[NormalizedOperation[]] (AI optimization)
      ↓
[3. Generate Types & Tools] (Generator package)
      ↓
[TypeScriptInterface[], MCPToolDefinition[]]
      ↓
[4. Render Templates] (Handlebars + ts-morph)
      ↓
[GeneratedMCPServer] (File output)
      ↓
[TypeScript Compilation] (Validation)
      ↓
[Deployable MCP Server]
```

### Stage 1: Parse & Validate
**Input:** OpenAPI JSON/YAML file
**Output:** `OpenAPIDocument`
**Tool:** `@apidevtools/swagger-parser 10.1.0`
**Operations:**
- Resolve all `$ref` pointers (including external files)
- Validate against OpenAPI 3.0 schema
- Normalize to JSON representation
- Extract global security schemes

### Stage 2: Normalize Operations
**Input:** `OpenAPIDocument`
**Output:** `NormalizedOperation[]`
**Package:** `packages/parser`
**Operations:**
- Extract all path + method combinations
- Flatten parameters (merge path/query/header)
- Generate AI-optimized descriptions
- Assign categories from tags
- Merge operation-level and global security

### Stage 3: Generate Types & Tools
**Input:** `NormalizedOperation[]`
**Output:** `TypeScriptInterface[]`, `MCPToolDefinition[]`
**Package:** `packages/generator`
**Operations:**
- Map OpenAPI schemas → TypeScript interfaces
- Generate MCP tool definitions with JSON Schema
- Create authentication configuration
- Build runtime HTTP metadata

### Stage 4: Render Templates
**Input:** `TypeScriptInterface[]`, `MCPToolDefinition[]`, `AuthConfiguration`
**Output:** `GeneratedMCPServer`
**Tools:** Handlebars 4.7.8, ts-morph 21.0.1
**Operations:**
- Render Handlebars templates for boilerplate
- Use ts-morph for complex TypeScript generation
- Generate package.json with exact versions
- Create .env.example and README.md
- Run `tsc --noEmit` to validate output

---

## Type Mappings

**OpenAPI → TypeScript Type Conversion Table:**

| OpenAPI Type | Format | TypeScript Type | Notes |
|--------------|--------|-----------------|-------|
| `string` | - | `string` | Default |
| `string` | `date` | `string` | ISO 8601 date string |
| `string` | `date-time` | `string` | ISO 8601 datetime string |
| `string` | `email` | `string` | Email validation at runtime |
| `string` | `uri` | `string` | URL validation at runtime |
| `string` | `uuid` | `string` | UUID v4 format |
| `number` | - | `number` | JavaScript number |
| `integer` | - | `number` | JavaScript number |
| `boolean` | - | `boolean` | JavaScript boolean |
| `array` | - | `Array<T>` | Generic array type |
| `object` | - | `{ [key: string]: T }` | Record or interface |
| `null` | - | `null` | Explicit null |
| `enum` | - | `'value1' \| 'value2'` | Union of string literals |
| `oneOf` | - | `Type1 \| Type2` | Discriminated union |
| `anyOf` | - | `Type1 \| Type2` | Union type |
| `allOf` | - | `Type1 & Type2` | Intersection type |

**Special Cases:**
- `additionalProperties: true` → `Record<string, unknown>`
- `nullable: true` → `T | null`
- Missing type → `unknown`
- Circular references → `interface` with self-reference

---

## Validation Rules

### Parser Package Validation
1. All `$ref` pointers must resolve successfully
2. At least one server URL must be defined
3. All operations must have unique `operationId`
4. Path parameters must be declared in `parameters`
5. Security schemes referenced in operations must exist in `components.securitySchemes`

### Generator Package Validation
1. All TypeScript interfaces must compile without errors
2. Generated tool names must be unique across the MCP server
3. All required parameters must be marked in JSON Schema
4. Environment variable names must follow `UPPER_SNAKE_CASE`
5. Generated `package.json` must pass `npm install` validation

### Runtime Validation
1. All API requests validated against input schema (Zod)
2. Authentication credentials checked before HTTP calls
3. Response status codes validated (2xx = success)
4. Response bodies validated against expected schema
5. Network errors wrapped with helpful context

---

## Examples

### Example 1: Simple GET Operation

**Input OpenAPI:**
```yaml
paths:
  /users/{userId}:
    get:
      operationId: getUserById
      summary: Retrieve user by ID
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: User found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

components:
  schemas:
    User:
      type: object
      required: [id, email]
      properties:
        id:
          type: string
        email:
          type: string
          format: email
        name:
          type: string
```

**Generated NormalizedOperation:**
```typescript
{
  operationId: "getUserById",
  method: "get",
  path: "/users/{userId}",
  summary: "Retrieve user by ID",
  parameters: [
    {
      name: "userId",
      in: "path",
      required: true,
      schema: { type: "string" }
    }
  ],
  responses: {
    "200": {
      description: "User found",
      content: {
        "application/json": {
          schema: { /* User schema */ }
        }
      }
    }
  },
  aiOptimized: {
    toolName: "getUserById",
    toolDescription: "Retrieve user by ID. Returns user profile including email and name.",
    category: "users"
  }
}
```

**Generated TypeScriptInterface:**
```typescript
export interface User {
  id: string;
  email: string;
  name?: string;
}
```

**Generated MCPToolDefinition:**
```typescript
{
  name: "getUserById",
  description: "Retrieve user by ID. Returns user profile including email and name.",
  inputSchema: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "User identifier"
      }
    },
    required: ["userId"],
    additionalProperties: false
  },
  httpMetadata: {
    method: "GET",
    path: "/users/{userId}",
    baseUrl: "https://api.example.com",
    authType: "apiKey"
  }
}
```

**Generated Tool Implementation (src/tools/getUserById.ts):**
```typescript
import { z } from 'zod';
import { makeApiRequest } from '../client';
import type { User } from '../types';

const InputSchema = z.object({
  userId: z.string(),
});

export async function getUserById(input: unknown): Promise<User> {
  const params = InputSchema.parse(input);

  const response = await makeApiRequest({
    method: 'GET',
    path: `/users/${params.userId}`,
  });

  return response.data as User;
}
```

---

### Example 2: POST with Request Body

**Input OpenAPI:**
```yaml
paths:
  /users:
    post:
      operationId: createUser
      summary: Create new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email]
              properties:
                email:
                  type: string
                  format: email
                name:
                  type: string
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

**Generated NormalizedOperation:**
```typescript
{
  operationId: "createUser",
  method: "post",
  path: "/users",
  summary: "Create new user",
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
            name: { type: "string" }
          }
        }
      }
    }
  },
  responses: { /* ... */ },
  aiOptimized: {
    toolName: "createUser",
    toolDescription: "Create new user. Requires email address. Returns created user with ID.",
    category: "users"
  }
}
```

**Generated MCPToolDefinition:**
```typescript
{
  name: "createUser",
  description: "Create new user. Requires email address. Returns created user with ID.",
  inputSchema: {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
        description: "User email address"
      },
      name: {
        type: "string",
        description: "User name (optional)"
      }
    },
    required: ["email"],
    additionalProperties: false
  },
  httpMetadata: {
    method: "POST",
    path: "/users",
    baseUrl: "https://api.example.com",
    authType: "apiKey"
  }
}
```

**Generated Tool Implementation (src/tools/createUser.ts):**
```typescript
import { z } from 'zod';
import { makeApiRequest } from '../client';
import type { User } from '../types';

const InputSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export async function createUser(input: unknown): Promise<User> {
  const params = InputSchema.parse(input);

  const response = await makeApiRequest({
    method: 'POST',
    path: '/users',
    body: params,
  });

  return response.data as User;
}
```

---

## Summary

This document provides comprehensive specifications for all 6 data models used in the OpenAPI-to-MCP Generator:

1. **OpenAPIDocument** - Raw input with validation
2. **NormalizedOperation** - Parsed operations with AI optimization
3. **TypeScriptInterface** - Generated type definitions
4. **MCPToolDefinition** - MCP-compliant tool metadata
5. **AuthConfiguration** - Security configuration
6. **GeneratedMCPServer** - Complete output representation

**Key Takeaways:**
- All models use Zod for runtime validation
- Transformation pipeline has 4 distinct stages
- Type mappings cover all OpenAPI data types
- Generated code must compile before output
- Examples demonstrate real-world usage patterns

**Related Documents:**
- [Main Architecture](./architecture.md) - Complete system overview
- [Workflows](./architecture-workflows.md) - Sequence diagrams showing data flow
- [Validation Report](./architecture-validation.md) - Quality assessment results
