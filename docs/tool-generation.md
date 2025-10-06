# MCP Tool Generation Guide

Complete guide to MCP tool generation from OpenAPI specifications.

## Table of Contents

- [Overview](#overview)
- [Generation Workflow](#generation-workflow)
- [Tool Definition Structure](#tool-definition-structure)
- [Parameter Mapping](#parameter-mapping)
- [Best Practices](#best-practices)
- [Advanced Scenarios](#advanced-scenarios)
- [Troubleshooting](#troubleshooting)
- [Integration Patterns](#integration-patterns)

## Overview

The tool generator transforms OpenAPI operations into MCP (Model Context Protocol) tool definitions that Claude can discover and invoke.

### What is an MCP Tool?

An MCP tool is a structured function definition that:
- Describes what the tool does (from OpenAPI summary/description)
- Defines input parameters with JSON Schema validation
- Provides metadata for tool discovery via `tools/list`
- Enables execution via `tools/call` requests

### Generation Pipeline

```
OpenAPI Operation → Tool Definition → MCP Registration → Claude Integration
```

## Generation Workflow

### 1. OpenAPI Operation Analysis

The generator analyzes each OpenAPI operation:

```yaml
# OpenAPI Specification
paths:
  /users/{userId}:
    get:
      operationId: getUser
      summary: Get user by ID
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: string
```

### 2. Tool Definition Creation

Generates MCP-compliant tool definition:

```typescript
{
  name: "getUser",
  description: "Get user by ID",
  inputSchema: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "User ID parameter"
      }
    },
    required: ["userId"]
  }
}
```

### 3. Tool Registration

Registers tool with MCP server:

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "getUser",
      description: "Get user by ID",
      inputSchema: { /* ... */ }
    }
  ]
}));
```

### 4. Tool Execution

Handles `tools/call` requests:

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "getUser":
      return await executeGetUser(request.params.arguments);
  }
});
```

## Tool Definition Structure

### Required Fields

#### 1. Tool Name

**Source**: OpenAPI `operationId`
**Requirements**:
- Must be unique across all tools
- Valid JavaScript identifier (letters, numbers, underscore)
- camelCase convention

**Example**:
```typescript
name: "createUser"      // ✅ Valid
name: "create-user"     // ❌ Invalid (contains hyphen)
name: "create user"     // ❌ Invalid (contains space)
```

#### 2. Tool Description

**Source**: OpenAPI `summary` or `description`
**Fallback**: Generated from operationId if missing

**Examples**:
```typescript
// Best: Uses summary
description: "Create a new user account"

// Good: Uses description if no summary
description: "Creates a new user account in the system with the provided details"

// Fallback: Generated from operationId
description: "Execute createUser operation"
```

#### 3. Input Schema

**Source**: Combines all OpenAPI parameters
**Format**: JSON Schema object

**Structure**:
```typescript
{
  type: "object",
  properties: {
    // Parameter definitions
  },
  required: [
    // Required parameter names
  ]
}
```

### Optional Fields

#### Tags (for Grouping)

```typescript
{
  name: "createUser",
  description: "Create a new user account",
  tags: ["users", "authentication"],  // From OpenAPI tags
  inputSchema: { /* ... */ }
}
```

## Parameter Mapping

### Parameter Locations

OpenAPI parameters from different locations are merged:

#### Path Parameters

```yaml
parameters:
  - name: userId
    in: path
    required: true
    schema:
      type: string
```

**Maps to**:
```typescript
properties: {
  userId: {
    type: "string",
    description: "User ID from path parameter"
  }
}
```

#### Query Parameters

```yaml
parameters:
  - name: limit
    in: query
    required: false
    schema:
      type: integer
      minimum: 1
      maximum: 100
```

**Maps to**:
```typescript
properties: {
  limit: {
    type: "integer",
    description: "Limit from query parameter",
    minimum: 1,
    maximum: 100
  }
}
```

#### Header Parameters

```yaml
parameters:
  - name: X-API-Version
    in: header
    required: true
    schema:
      type: string
```

**Maps to**:
```typescript
properties: {
  xApiVersion: {
    type: "string",
    description: "X-API-Version from header parameter"
  }
}
```

#### Request Body

```yaml
requestBody:
  required: true
  content:
    application/json:
      schema:
        type: object
        properties:
          name:
            type: string
          email:
            type: string
```

**Maps to**:
```typescript
properties: {
  requestBody: {
    type: "object",
    properties: {
      name: { type: "string" },
      email: { type: "string" }
    }
  }
}
```

### Type Mapping

OpenAPI types map to JSON Schema types:

| OpenAPI Type | Format | JSON Schema Type | Notes |
|--------------|--------|------------------|-------|
| `string` | - | `string` | Default string |
| `string` | `date` | `string` | ISO 8601 date |
| `string` | `date-time` | `string` | ISO 8601 datetime |
| `string` | `uuid` | `string` | UUID format |
| `string` | `email` | `string` | Email validation |
| `integer` | - | `integer` | Whole numbers |
| `integer` | `int32` | `integer` | 32-bit integer |
| `integer` | `int64` | `integer` | 64-bit integer |
| `number` | - | `number` | Decimal numbers |
| `number` | `float` | `number` | Single precision |
| `number` | `double` | `number` | Double precision |
| `boolean` | - | `boolean` | true/false |
| `array` | - | `array` | List of items |
| `object` | - | `object` | Key-value pairs |

### Validation Rules

Validation constraints are preserved:

```yaml
# OpenAPI
schema:
  type: string
  minLength: 3
  maxLength: 50
  pattern: '^[a-z]+$'
```

**Maps to**:
```typescript
{
  type: "string",
  minLength: 3,
  maxLength: 50,
  pattern: "^[a-z]+$"
}
```

## Best Practices

### 1. Descriptive Tool Names

✅ **Good**: `getUserById`, `createOrder`, `deleteProduct`
❌ **Bad**: `get1`, `operation2`, `func3`

**Why**: Claude relies on tool names to understand capabilities

### 2. Clear Descriptions

✅ **Good**: "Retrieve detailed user information including profile data and preferences"
❌ **Bad**: "Get user"

**Why**: Detailed descriptions help Claude choose the right tool

### 3. Parameter Documentation

```typescript
// ✅ Good - Clear parameter descriptions
properties: {
  userId: {
    type: "string",
    description: "Unique identifier for the user (UUID format)"
  },
  includeDeleted: {
    type: "boolean",
    description: "Whether to include soft-deleted users in results (default: false)"
  }
}

// ❌ Bad - Missing descriptions
properties: {
  userId: { type: "string" },
  includeDeleted: { type: "boolean" }
}
```

### 4. Use Tags for Organization

```typescript
{
  name: "createUser",
  tags: ["users", "admin"],  // Helps with tool discovery
  description: "Create a new user account"
}
```

### 5. Handle Optional Parameters

```typescript
{
  type: "object",
  properties: {
    userId: { type: "string" },      // Required
    limit: { type: "integer" }       // Optional
  },
  required: ["userId"]               // Only userId is required
}
```

## Advanced Scenarios

### Name Collision Handling

When multiple operations have the same `operationId`, the generator adds numeric suffixes:

```typescript
// First occurrence
{ name: "getUser", ... }

// Second occurrence (collision!)
{ name: "getUser2", ... }

// Third occurrence
{ name: "getUser3", ... }
```

**Prevention**: Ensure unique `operationId` values in your OpenAPI spec

### Complex Request Bodies

Nested object structures are fully supported:

```typescript
properties: {
  requestBody: {
    type: "object",
    properties: {
      user: {
        type: "object",
        properties: {
          profile: {
            type: "object",
            properties: {
              firstName: { type: "string" },
              lastName: { type: "string" }
            }
          }
        }
      }
    }
  }
}
```

### Array Parameters

```yaml
parameters:
  - name: tags
    in: query
    schema:
      type: array
      items:
        type: string
```

**Maps to**:
```typescript
properties: {
  tags: {
    type: "array",
    items: { type: "string" },
    description: "Tags from query parameter"
  }
}
```

### Enum Values

```yaml
parameters:
  - name: status
    in: query
    schema:
      type: string
      enum: [active, inactive, pending]
```

**Maps to**:
```typescript
properties: {
  status: {
    type: "string",
    enum: ["active", "inactive", "pending"],
    description: "Status from query parameter"
  }
}
```

## Troubleshooting

### Issue: "Tool name collision detected"

**Cause**: Multiple operations with same `operationId`

**Solution**:
```yaml
# ❌ Bad - Duplicate operationId
paths:
  /users:
    get:
      operationId: getUsers
  /admin/users:
    get:
      operationId: getUsers  # Collision!

# ✅ Good - Unique operationId
paths:
  /users:
    get:
      operationId: getUsers
  /admin/users:
    get:
      operationId: getAdminUsers
```

### Issue: "Missing operation description"

**Cause**: No `summary` or `description` in OpenAPI operation

**Solution**:
```yaml
# ❌ Bad - No description
paths:
  /users/{userId}:
    get:
      operationId: getUser

# ✅ Good - Clear description
paths:
  /users/{userId}:
    get:
      operationId: getUser
      summary: Get user by ID
      description: Retrieve detailed user information by unique identifier
```

### Issue: "Invalid parameter type"

**Cause**: Unsupported or malformed parameter schema

**Solution**: Verify parameter schema follows OpenAPI 3.0/3.1 spec:
```yaml
# ✅ Valid parameter
parameters:
  - name: userId
    in: path
    required: true
    schema:
      type: string
```

### Issue: "Tool not appearing in Claude"

**Checklist**:
1. ✅ Tool registered in `ListTools` handler
2. ✅ Server running and connected via stdio
3. ✅ Claude Desktop configured correctly
4. ✅ No errors in server logs (`DEBUG=true npm start`)

## Integration Patterns

### Pattern 1: CRUD Operations

```typescript
// Standard CRUD tool set
const crudTools = [
  { name: "createUser", description: "Create a new user" },
  { name: "getUser", description: "Get user by ID" },
  { name: "updateUser", description: "Update user details" },
  { name: "deleteUser", description: "Delete a user" },
  { name: "listUsers", description: "List all users with pagination" }
];
```

### Pattern 2: Search and Filter

```typescript
// Search tool with flexible parameters
{
  name: "searchUsers",
  description: "Search users with filters",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query" },
      filters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["active", "inactive"] },
          role: { type: "string" },
          createdAfter: { type: "string", format: "date" }
        }
      },
      limit: { type: "integer", minimum: 1, maximum: 100 },
      offset: { type: "integer", minimum: 0 }
    },
    required: ["query"]
  }
}
```

### Pattern 3: Batch Operations

```typescript
// Batch update tool
{
  name: "batchUpdateUsers",
  description: "Update multiple users in a single request",
  inputSchema: {
    type: "object",
    properties: {
      userIds: {
        type: "array",
        items: { type: "string" },
        description: "List of user IDs to update"
      },
      updates: {
        type: "object",
        description: "Fields to update on all users"
      }
    },
    required: ["userIds", "updates"]
  }
}
```

### Pattern 4: Tagged Tool Groups

Organize tools by feature domain:

```typescript
// User management tools
const userTools = operations
  .filter(op => op.tags.includes('users'))
  .map(op => generateToolDefinition(op));

// Admin tools
const adminTools = operations
  .filter(op => op.tags.includes('admin'))
  .map(op => generateToolDefinition(op));
```

## Testing Tool Generation

### Manual Testing

```bash
# Generate tools from OpenAPI spec
npm run generate -- \
  --openapi path/to/spec.json \
  --output ./test-output

# Inspect generated tools
cat ./test-output/src/index.ts | grep -A 20 "ListToolsRequestSchema"
```

### Automated Testing

```typescript
import { generateToolDefinition } from './tool-generator';

describe('Tool Generation', () => {
  it('should generate tool from operation', () => {
    const operation = {
      operationId: 'getUser',
      summary: 'Get user by ID',
      parameters: [
        { name: 'userId', in: 'path', required: true, schema: { type: 'string' } }
      ]
    };

    const tool = generateToolDefinition(operation);

    expect(tool.name).toBe('getUser');
    expect(tool.description).toBe('Get user by ID');
    expect(tool.inputSchema.properties.userId.type).toBe('string');
    expect(tool.inputSchema.required).toContain('userId');
  });
});
```

## Performance Considerations

### Tool Count Limits

**Recommendation**: Keep tool count under 100 per server

**Why**: Large tool lists impact Claude's context window

**Solution**: Split large APIs into multiple MCP servers by domain:
```
mcp-server-users/     # User management (20 tools)
mcp-server-orders/    # Order management (30 tools)
mcp-server-products/  # Product catalog (25 tools)
```

### Parameter Complexity

**Recommendation**: Limit nested object depth to 3 levels

**Example**:
```typescript
// ✅ Good - 2 levels
{ user: { profile: { name: "..." } } }

// ⚠️ Acceptable - 3 levels
{ data: { user: { profile: { settings: { ... } } } } }

// ❌ Too deep - 4+ levels
{ a: { b: { c: { d: { e: "..." } } } } }
```

## Additional Resources

- **[MCP Specification](https://spec.modelcontextprotocol.io/)** - Official MCP protocol specification
- **[OpenAPI 3.1 Spec](https://spec.openapis.org/oas/v3.1.0)** - OpenAPI specification reference
- **[JSON Schema](https://json-schema.org/)** - JSON Schema validation reference
- **[Generation Architecture](./generation-architecture.md)** - Code generation pipeline documentation
- **[Interface Generation](./interface-generation.md)** - TypeScript interface generation guide

## Summary

The tool generator provides:
- ✅ Automatic MCP tool generation from OpenAPI operations
- ✅ JSON Schema-based parameter validation
- ✅ Name collision detection and resolution
- ✅ Tag-based tool organization
- ✅ Comprehensive parameter mapping (path, query, header, body)
- ✅ Type-safe tool definitions with full TypeScript support

For implementation details, see `packages/generator/src/tool-generator.ts`.
