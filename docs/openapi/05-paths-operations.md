# Paths Object & Operations

[◀ Back to Index](./README.md) | [◀ Prev: Components](./04-components-object.md) | [Next: Security ▶](./06-security.md)

---

## Paths Object Specification

Paths Object содержит relative paths к individual endpoints и их операциям.

**Path construction:** `server.url + path = full URL`

### Ozon API Statistics

```
Total paths: 39
HTTP methods:
  - GET: ~25 endpoints (list, retrieve)
  - POST: ~14 endpoints (create, query with body)
  - PUT/DELETE: ~0 endpoints (not exposed)
```

---

## Path Item Object

Describes operations available on a single path.

### Fixed Fields

| Field | Type | Description |
|-------|------|-------------|
| `summary` | string | Summary for all operations |
| `description` | string | Description (CommonMark) |
| **HTTP Methods:** | | |
| `get` | Operation Object | GET operation |
| `post` | Operation Object | POST operation |
| `put` | Operation Object | PUT operation |
| `delete` | Operation Object | DELETE operation |
| `patch` | Operation Object | PATCH operation |
| `parameters` | [Parameter \| Reference] | Shared parameters |
| `servers` | [Server Object] | Alternative servers |

---

## Operation Object

Describes a single API operation on a path.

### Fixed Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tags` | [string] | Optional | Теги для группировки |
| `summary` | string | Optional | Краткое описание |
| `description` | string | Optional | Подробное описание |
| `operationId` | string | Recommended | Unique identifier для операции |
| `parameters` | [Parameter \| Ref] | Optional | Parameters для операции |
| `requestBody` | Request Body \| Ref | Optional | Request body |
| `responses` | Responses Object | ✅ REQUIRED | Возможные responses |
| `security` | [Security Requirement] | Optional | Override global security |

---

## Ozon API Example

### Path: `/api/client/campaign`

```json
{
  "/api/client/campaign": {
    "get": {
      "tags": ["Campaign"],
      "summary": "Список кампаний",
      "operationId": "ListCampaigns",
      "parameters": [
        {
          "name": "campaignIds",
          "in": "query",
          "schema": {
            "type": "array",
            "items": { "type": "string", "format": "uint64" }
          }
        },
        {
          "name": "state",
          "in": "query",
          "schema": {
            "type": "string",
            "enum": ["RUNNING", "PLANNED", "STOPPED"]
          }
        },
        {
          "name": "page",
          "in": "query",
          "schema": { "type": "integer" }
        }
      ],
      "responses": {
        "200": {
          "description": "OK",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CampaignListResponse"
              }
            }
          }
        }
      }
    }
  }
}
```

---

## MCP Tool Generation

### From Operation → MCP Tool

```typescript
function generateMCPTool(
  path: string,
  method: string,
  operation: OperationObject
): MCPTool {
  return {
    name: operation.operationId || generateToolName(path, method),
    description: operation.summary || operation.description,
    inputSchema: {
      type: 'object',
      properties: buildPropertiesFromParams(operation.parameters),
      required: getRequiredParams(operation.parameters)
    }
  };
}
```

### Generated MCP Tool Example

```typescript
{
  name: 'listCampaigns',
  description: 'Список кампаний',
  inputSchema: {
    type: 'object',
    properties: {
      campaignIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Список идентификаторов кампаний'
      },
      state: {
        type: 'string',
        enum: ['RUNNING', 'PLANNED', 'STOPPED']
      },
      page: {
        type: 'integer',
        description: 'Номер страницы'
      }
    }
  }
}
```

---

## Parameters

### Parameter Types

| Location (`in`) | Description |
|-----------------|-------------|
| `query` | Query string parameters |
| `path` | Path parameters (e.g., `/users/{id}`) |
| `header` | Custom headers |
| `cookie` | Cookie parameters |

### Parameter Object

```typescript
interface Parameter {
  name: string;         // REQUIRED
  in: 'query' | 'path' | 'header' | 'cookie';  // REQUIRED
  description?: string;
  required?: boolean;   // REQUIRED if in=path
  schema: SchemaObject; // Type definition
  explode?: boolean;    // Array/object expansion
}
```

### Ozon Example: Path Parameter

```json
{
  "name": "campaignId",
  "in": "path",
  "required": true,
  "schema": {
    "type": "string",
    "format": "uint64"
  },
  "description": "Идентификатор кампании"
}
```

---

## Request Body Object

Describes a single request body.

```typescript
interface RequestBody {
  description?: string;
  content: {
    [mediaType: string]: {
      schema: SchemaObject | Reference;
      examples?: { [name: string]: Example };
    };
  };
  required?: boolean;
}
```

### Ozon Example

```json
{
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "$ref": "#/components/schemas/CreateCampaignRequest"
        }
      }
    }
  }
}
```

---

## Responses Object

Map of status codes → Response Object.

```typescript
interface Responses {
  [statusCode: string]: ResponseObject | Reference;
  default?: ResponseObject | Reference;
}
```

### Response Object

```typescript
interface ResponseObject {
  description: string;  // REQUIRED
  content?: {
    [mediaType: string]: {
      schema: SchemaObject | Reference;
    };
  };
  headers?: { [name: string]: Header | Reference };
}
```

---

## Implementation Strategy

### Phase 1: Parse Paths
```typescript
function parsePaths(spec: OpenAPISpec): Map<string, PathItem> {
  const paths = new Map();

  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    if (!path.startsWith('/')) {
      console.warn(`Invalid path (must start with /): ${path}`);
      continue;
    }

    paths.set(path, parsePathItem(pathItem));
  }

  return paths;
}
```

### Phase 2: Generate MCP Tools
```typescript
function generateMCPTools(paths: Map<string, PathItem>): MCPTool[] {
  const tools: MCPTool[] = [];

  for (const [path, pathItem] of paths) {
    for (const [method, operation] of getOperations(pathItem)) {
      tools.push(generateMCPTool(path, method, operation));
    }
  }

  return tools;
}
```

### Phase 3: Smart Method Filtering

```typescript
// Group by tags for smart discovery
function groupToolsByTags(tools: MCPTool[]): Map<string, MCPTool[]> {
  const grouped = new Map();

  for (const tool of tools) {
    for (const tag of tool.tags || []) {
      if (!grouped.has(tag)) grouped.set(tag, []);
      grouped.get(tag).push(tool);
    }
  }

  return grouped;
}

// Generate listMethods tool
function generateListMethodsTool(tags: string[]): MCPTool {
  return {
    name: 'listMethods',
    description: 'Search and filter API methods by category',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: tags,
          description: 'Filter methods by category'
        }
      }
    }
  };
}
```

---

## MVP Scope

| Feature | MVP | Post-MVP |
|---------|-----|----------|
| Parse paths & operations | ✅ | - |
| Generate MCP tools | ✅ | - |
| Handle query/path parameters | ✅ | - |
| Handle request bodies | ✅ | - |
| Parse responses | ✅ | - |
| Tag-based grouping | ✅ | - |
| Smart method filtering | ✅ | - |
| Header/cookie parameters | ❌ | ✅ |
| Multiple response types | ❌ | ✅ |

---

## Summary

✅ **Analyzed:** Paths, operations, parameters, request bodies, responses
✅ **Validated:** Ozon API (39 paths, GET/POST operations)
✅ **Decided:** Full path parsing + MCP tool generation
✅ **Implemented:** Parser, tool generator, smart filtering

**Status:** Ready for MCP tool generation

---

[◀ Back to Index](./README.md) | [◀ Prev: Components](./04-components-object.md) | [Next: Security ▶](./06-security.md)
[See also: MCP Integration →](./mcp-integration.md)
