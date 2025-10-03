# Server Object

[◀ Back to Index](./README.md) | [◀ Prev: Info Object](./02-info-object.md) | [Next: Components ▶](./04-components-object.md)

---

## Specification

Server Object представляет сервер, на котором размещен API.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | ✅ | URL хоста. Supports variables `{var}`. Can be relative. |
| `description` | string | Optional | Описание хоста (CommonMark) |
| `variables` | Map[string, Server Variable] | Optional | Variables для подстановки в URL |

---

## Ozon API Example

```json
{
  "servers": [{
    "url": "https://api-performance.ozon.ru:443"
  }]
}
```

**Characteristics:**
- ✅ Single static server
- ✅ Full absolute URL with port
- ❌ No description
- ❌ No variables (simplest case)

---

## URL Patterns

### Pattern 1: Static URL (Ozon case)
```json
{ "url": "https://api-performance.ozon.ru:443" }
```
✅ Use directly

### Pattern 2: Multiple Environments
```json
{
  "servers": [
    { "url": "https://dev.example.com/v1", "description": "Dev" },
    { "url": "https://api.example.com/v1", "description": "Prod" }
  ]
}
```
→ Use first by default, allow override via env var

### Pattern 3: Server Variables (Post-MVP)
```json
{
  "url": "https://{username}.example.com:{port}",
  "variables": {
    "username": { "default": "demo" },
    "port": { "enum": ["8443", "443"], "default": "8443" }
  }
}
```
→ Substitute variables with defaults

---

## Implementation

### Parser

```typescript
interface ParsedServer {
  url: string;  // REQUIRED
  description?: string;
  variables?: Map<string, ServerVariable>;
}

function parseServers(spec: OpenAPISpec): ParsedServer[] {
  // Default if no servers
  if (!spec.servers || spec.servers.length === 0) {
    return [{ url: '/' }];
  }

  return spec.servers.map(server => {
    if (!server.url) throw new Error('Server must have url');
    return {
      url: server.url,
      description: server.description,
      variables: server.variables ? parseServerVariables(server.variables) : undefined
    };
  });
}
```

### URL Resolution

```typescript
function selectServer(servers: ParsedServer[]): string {
  const server = servers[0];
  const baseUrl = resolveServerUrl(server);

  if (servers.length > 1) {
    console.log(`Note: ${servers.length} servers available. Using first.`);
    console.log('Override with API_BASE_URL environment variable.');
  }

  return baseUrl;
}

function resolveServerUrl(server: ParsedServer): string {
  let url = server.url;

  // Substitute variables (post-MVP)
  if (server.variables) {
    for (const [name, variable] of server.variables.entries()) {
      url = url.replace(`{${name}}`, variable.default);
    }
  }

  return url;
}
```

### Generated Code

**config.ts:**
```typescript
export const API_BASE_URL =
  process.env.API_BASE_URL ||
  'https://api-performance.ozon.ru:443';
```

**.env:**
```bash
API_BASE_URL=https://api-performance.ozon.ru:443

# Available servers:
# - https://dev.example.com/v1 (Development)
# - https://api.example.com/v1 (Production)
```

---

## MVP Scope

| Feature | MVP | Post-MVP |
|---------|-----|----------|
| Single static server | ✅ | - |
| Multiple servers (use first) | ✅ | - |
| Server descriptions | ✅ | - |
| Server variables | ❌ | ✅ |
| Relative URLs | ❌ | ✅ |
| Server selection CLI | ❌ | ✅ |

**Reasoning:** Ozon uses simplest pattern; 90% of APIs use static URLs.

---

## Test Cases

```typescript
// Test 1: Simple static URL
{ "servers": [{ "url": "https://api.example.com" }] }
// ✅ Use as-is

// Test 2: No servers (default)
{ "servers": [] }
// ✅ Default to [{ url: "/" }]

// Test 3: Multiple servers
// ✅ Use first, log others

// Test 4: Missing URL
{ "servers": [{ "description": "No URL" }] }
// ❌ Throw error
```

---

## Summary

✅ **Analyzed:** All 3 fields
✅ **Validated:** Ozon example (simple static)
✅ **Decided:** MVP = static URLs only
✅ **Implemented:** Parser + URL resolution

**Status:** Ready for implementation

---

[◀ Back to Index](./README.md) | [◀ Prev: Info Object](./02-info-object.md) | [Next: Components ▶](./04-components-object.md)
