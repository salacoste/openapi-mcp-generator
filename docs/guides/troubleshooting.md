# Troubleshooting Guide

> Common issues and solutions for the OpenAPI-to-MCP generator.

---

## Table of Contents

- [Generation Issues](#generation-issues)
- [TypeScript Compilation Errors](#typescript-compilation-errors)
- [Runtime Issues](#runtime-issues)
- [Authentication Problems](#authentication-problems)
- [Claude Desktop Integration](#claude-desktop-integration)
- [Getting Help](#getting-help)

---

## Generation Issues

### Issue 1: "Output directory already exists"

**Symptoms**:
```
❌ ValidationError: Output directory already exists: ./my-mcp-server
   Suggestion: Use --force flag to overwrite existing directory
```

**Solutions**:

1. **Use --force flag** (overwrites existing directory):
```bash
@openapi-to-mcp/cli generate swagger.json --output ./my-mcp-server --force
```

2. **Choose different output directory**:
```bash
@openapi-to-mcp/cli generate swagger.json --output ./my-mcp-server-v2
```

3. **Remove existing directory first**:
```bash
rm -rf ./my-mcp-server
@openapi-to-mcp/cli generate swagger.json --output ./my-mcp-server
```

---

### Issue 2: "Permission denied"

**Symptoms**:
```
❌ ValidationError: Parent directory is not writable: /path/to/directory
   Suggestion: Check directory permissions
   Run: chmod 755 /path/to/directory
```

**Solutions**:

1. **Fix directory permissions**:
```bash
chmod 755 /path/to/parent/directory
```

2. **Use a directory you have write access to**:
```bash
@openapi-to-mcp/cli generate swagger.json --output ~/my-mcp-server
```

3. **Run with elevated permissions** (not recommended):
```bash
sudo @openapi-to-mcp/cli generate swagger.json --output ./my-mcp-server
```

---

### Issue 3: "Invalid OpenAPI version"

**Symptoms**:
```
❌ ValidationError: Unsupported OpenAPI version
   Suggestion: This tool supports OpenAPI 3.0.x specifications
```

**Solutions**:

1. **Convert OpenAPI 2.0 (Swagger) to 3.0**:
```bash
# Using swagger2openapi
npx swagger2openapi swagger-v2.json > swagger-v3.json
@openapi-to-mcp/cli generate swagger-v3.json --output ./my-mcp-server
```

2. **Check your spec version**:
```bash
# Look for "openapi: 3.0.x" field
head -20 swagger.json | grep openapi
```

---

### Issue 4: "Missing operationId"

**Symptoms**:
```
❌ ValidationError: OpenAPI operations must have unique operationId
   Suggestion: Add operationId to each operation in your spec
```

**Solutions**:

1. **Add operationId to all operations** in your OpenAPI spec:
```yaml
paths:
  /users:
    get:
      operationId: getUsers  # Add this
      summary: List users
```

2. **Use a tool to auto-generate operationIds**:
```bash
# Example using openapi-generator
openapi-generator generate -i swagger.json -g openapi -o fixed-swagger.json
```

---

## TypeScript Compilation Errors

### Issue 5: "Type errors during npm run build"

**Symptoms**:
```
src/types.ts:42:3 - error TS2322: Type 'string' is not assignable to type 'number'
```

**Diagnosis**:
- OpenAPI spec has inconsistent or incorrect type definitions
- Generated types don't match actual API responses

**Solutions**:

1. **Fix OpenAPI spec types**:
```yaml
# Ensure types match actual API
properties:
  user_id:
    type: string  # Was incorrectly 'number'
```

2. **Use --debug for detailed info**:
```bash
@openapi-to-mcp/cli generate swagger.json --output ./server --debug
```

3. **Manual type fixes** (temporary workaround):
```typescript
// Edit src/types.ts
export interface User {
  user_id: string | number;  // Allow both types
}
```

---

### Issue 6: "Cannot find module '@modelcontextprotocol/sdk'"

**Symptoms**:
```
Error: Cannot find module '@modelcontextprotocol/sdk/server/index.js'
```

**Solutions**:

1. **Install dependencies**:
```bash
cd my-mcp-server
npm install
```

2. **Clear node_modules and reinstall**:
```bash
rm -rf node_modules package-lock.json
npm install
```

3. **Check Node.js version** (requires 18+):
```bash
node --version
# Should be v18.0.0 or higher
```

---

## Runtime Issues

### Issue 7: "Server starts but Claude Desktop doesn't see tools"

**Symptoms**:
- Server runs without errors
- Claude Desktop shows no tools available

**Solutions**:

1. **Verify server path in config**:
```json
{
  "mcpServers": {
    "my-api": {
      "command": "node",
      "args": ["/ABSOLUTE/path/to/server/dist/index.js"]  // Must be absolute!
    }
  }
}
```

2. **Test server manually**:
```bash
cd my-mcp-server
node dist/index.js
# Should start without errors
```

3. **Check Claude Desktop logs**:
```bash
# macOS
tail -f ~/Library/Logs/Claude/mcp.log

# Look for connection errors
```

4. **Restart Claude Desktop completely**:
- Quit Claude Desktop (Cmd+Q on macOS)
- Wait 5 seconds
- Restart Claude Desktop

---

### Issue 8: "Timeout errors when calling API"

**Symptoms**:
```
Error: Request timeout after 30000ms
```

**Solutions**:

1. **Increase timeout in http-client.ts**:
```typescript
export const httpClient = axios.create({
  baseURL: '...',
  timeout: 60000,  // Increase to 60 seconds
});
```

2. **Check API availability**:
```bash
curl -I https://api-example.com
# Should return 200 OK or 401 Unauthorized (not timeout)
```

3. **Check network connection**:
```bash
ping api-example.com
```

---

## Authentication Problems

### Issue 9: "401 Unauthorized"

**Symptoms**:
```
API Error: 401 Unauthorized
```

**Solutions**:

1. **Set environment variables in config**:
```json
{
  "mcpServers": {
    "my-api": {
      "command": "node",
      "args": ["/path/to/server/dist/index.js"],
      "env": {
        "API_KEY": "your-actual-api-key-here",
        "CLIENT_ID": "your-client-id",
        "CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

2. **Test authentication manually**:
```bash
# Export variables
export API_KEY="your-key"
export CLIENT_ID="your-id"
export CLIENT_SECRET="your-secret"

# Run server
node dist/index.js
```

3. **Check API key format**:
```bash
# Some APIs require "Bearer " prefix
curl -H "Authorization: Bearer YOUR_KEY" https://api-example.com
```

---

### Issue 10: "Missing API credentials"

**Symptoms**:
```
Error: Missing required environment variable: CLIENT_ID
```

**Solutions**:

1. **Create .env file** (for local testing):
```bash
cat > .env << EOF
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
API_KEY=your_api_key
EOF
```

2. **Load .env in code** (add to src/index.ts):
```typescript
import 'dotenv/config';  // Add at top of file
```

3. **Install dotenv**:
```bash
npm install dotenv
```

---

### Issue 11: "OpenAPI spec missing securitySchemes"

**Symptoms**:
```
⚠️  0 security schemes found
Generated server has no authentication configured
```

**Impact**:
- MCP server generates successfully but has no auth
- API calls return 401 Unauthorized at runtime

**Solutions**:

1. **Use auth override flag**:
```bash
# For Bearer token auth
@openapi-to-mcp/cli generate swagger.json \
  --output ./my-server \
  --auth-override "bearer"

# For OAuth2 Client Credentials
@openapi-to-mcp/cli generate swagger.json \
  --output ./my-server \
  --auth-override "oauth2-client-credentials:https://auth.example.com/token"

# For API Key in header
@openapi-to-mcp/cli generate swagger.json \
  --output ./my-server \
  --auth-override "apiKey:header:X-API-Key"
```

2. **Use JSON config for complex auth**:
```bash
# Create auth-config.json
cat > auth-config.json << 'EOF'
{
  "schemes": {
    "OAuth2ClientCredentials": {
      "type": "oauth2",
      "flows": {
        "clientCredentials": {
          "tokenUrl": "https://api-seller.ozon.ru/oauth/token",
          "scopes": {
            "read": "Read access",
            "write": "Write access"
          }
        }
      }
    }
  },
  "security": [{"OAuth2ClientCredentials": ["read", "write"]}]
}
EOF

# Generate with config
@openapi-to-mcp/cli generate swagger.json \
  --auth-config ./auth-config.json
```

3. **Real-world example - Ozon API**:
```bash
# Ozon API spec missing securitySchemes
@openapi-to-mcp/cli generate ./ozon-swagger.json \
  --output ./ozon-server \
  --auth-override "oauth2-client-credentials:https://api-seller.ozon.ru/oauth/token"
```

**See Also**: [Auth Override Examples](../../examples/auth-configs/README.md)

---

### Issue 12: "Invalid auth override format"

**Symptoms**:
```
❌ ValidationError: Invalid auth override format: Invalid API Key location
   Suggestion: Check --help for supported auth override formats
```

**Common Mistakes**:

1. **Wrong API Key location**:
```bash
# ❌ WRONG - "body" is not supported
--auth-override "apiKey:body:key"

# ✅ CORRECT - use header, query, or cookie
--auth-override "apiKey:header:X-API-Key"
--auth-override "apiKey:query:api_key"
--auth-override "apiKey:cookie:session"
```

2. **Missing OAuth2 URL**:
```bash
# ❌ WRONG - missing token URL
--auth-override "oauth2-client-credentials"

# ✅ CORRECT - include full token URL
--auth-override "oauth2-client-credentials:https://auth.example.com/token"
```

3. **Using both --auth-override and --auth-config**:
```bash
# ❌ WRONG - cannot use both
@openapi-to-mcp/cli generate swagger.json \
  --auth-override "bearer" \
  --auth-config auth.json

# ✅ CORRECT - choose one
@openapi-to-mcp/cli generate swagger.json --auth-override "bearer"
# OR
@openapi-to-mcp/cli generate swagger.json --auth-config auth.json
```

**Solutions**:
- Check `--help` for correct format
- See examples: `examples/auth-configs/README.md`
- Validate JSON config files

---

### Issue 13: "Multi-scheme authentication not working"

**Symptoms**:
- Generated code has multiple auth schemes
- API returns 401 even with credentials set

**Cause**: Multi-scheme (AND logic) requires ALL credentials

**Example**:
```bash
# This requires BOTH bearer token AND API key
@openapi-to-mcp/cli generate swagger.json \
  --auth-override "bearer+apiKey:header:X-API-Key"
```

**Solutions**:

1. **Set ALL required environment variables**:
```json
{
  "mcpServers": {
    "my-api": {
      "command": "node",
      "args": ["/path/to/server/dist/index.js"],
      "env": {
        "BEARER_TOKEN": "your-bearer-token",
        "X_API_KEY": "your-api-key"
      }
    }
  }
}
```

2. **Verify both credentials work individually**:
```bash
# Test bearer token
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.example.com/test

# Test API key
curl -H "X-API-Key: YOUR_KEY" https://api.example.com/test
```

3. **Check generated http-client.ts**:
```typescript
// Look for both auth methods being applied
if (bearerToken) {
  config.headers.Authorization = `Bearer ${bearerToken}`;
}
if (apiKey) {
  config.headers['X-API-Key'] = apiKey;
}
```

---

## Claude Desktop Integration

### Issue 14: "Changes to config not taking effect"

**Symptoms**:
- Updated claude_desktop_config.json
- No changes visible in Claude Desktop

**Solutions**:

1. **Completely quit and restart Claude Desktop**:
```bash
# macOS - force quit
killall Claude
# Then restart from Applications
```

2. **Verify config file location**:
```bash
# macOS
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

3. **Check JSON syntax**:
```bash
# Validate JSON
cat claude_desktop_config.json | python -m json.tool
# Should not show syntax errors
```

---

### Issue 15: "Server crashes when Claude Desktop connects"

**Symptoms**:
- Server starts fine manually
- Crashes immediately when Claude Desktop connects

**Solutions**:

1. **Check for unhandled promise rejections**:
```typescript
// Add to src/index.ts
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});
```

2. **Add error handling to tool handlers**:
```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    // Your tool execution
  } catch (error) {
    console.error('Tool execution error:', error);
    throw error;
  }
});
```

3. **Test with simple echo server first**:
```typescript
// Minimal test server
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  return {
    content: [{ type: 'text', text: 'Echo: ' + request.params.name }]
  };
});
```

---

## Getting Help

If these solutions don't resolve your issue:

### 1. Enable Debug Mode

```bash
@openapi-to-mcp/cli generate swagger.json --output ./server --debug
```

This will show:
- Full error stack traces
- Intermediate processing steps
- Performance metrics
- Environment information

### 2. Check Existing Issues

Search [GitHub Issues](https://github.com/your-org/openapi-to-mcp/issues) for similar problems.

### 3. File a New Issue

Include:
- **OpenAPI spec** (sanitized, remove secrets)
- **Full error message** (from --debug output)
- **System information**:
  ```bash
  node --version
  npm --version
  uname -a  # or systeminfo on Windows
  ```
- **Steps to reproduce**

### 4. Community Support

- [GitHub Discussions](https://github.com/your-org/openapi-to-mcp/discussions)
- [Documentation](../)

---

## Quick Diagnostic Commands

```bash
# Check Node.js version
node --version  # Should be v18+

# Validate OpenAPI spec
npx swagger-cli validate swagger.json

# Test generation with debug
@openapi-to-mcp/cli generate swagger.json --output /tmp/test --debug

# Test TypeScript compilation
cd my-mcp-server && npm run build

# Test server startup
cd my-mcp-server && timeout 5 node dist/index.js

# Check Claude Desktop config
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

---

**Last Updated**: 2025-10-07
**Version**: 1.0
