# Authentication Override Examples

This directory contains example authentication configuration files for the OpenAPI-to-MCP CLI generator.

## When to Use Auth Override

Use authentication override when your OpenAPI specification:

- **Missing `components.securitySchemes`** - API requires auth but spec doesn't define it
- **Incomplete security definitions** - Spec has partial or incorrect auth info
- **Testing with different auth** - Want to try different auth mechanisms than spec defines

### Example: Ozon Performance API

The Ozon API swagger.json is missing `components.securitySchemes`, but the API requires OAuth2 Client Credentials. Solution:

```bash
pnpm run generate swagger.json --output ./mcp-server \
  --auth-override "oauth2-client-credentials:https://api-seller.ozon.ru/oauth/token"
```

---

## Quick Reference: Simple Auth Override Flags

### API Key Authentication

```bash
# API Key in header
--auth-override "apiKey:header:X-API-Key"

# API Key in query parameter
--auth-override "apiKey:query:api_key"

# API Key in cookie
--auth-override "apiKey:cookie:session"
```

**Generated Environment Variables:**
- `X_API_KEY` or `APIKEY_API_KEY`

---

### Bearer Token Authentication

```bash
# Bearer token (default JWT format)
--auth-override "bearer"

# Bearer token with custom format
--auth-override "bearer:JWT"
--auth-override "bearer:CustomToken"
```

**Generated Environment Variables:**
- `BEARER_TOKEN` or `BEARERAUTH_TOKEN`

---

### HTTP Basic Authentication

```bash
# Basic authentication
--auth-override "basic"
```

**Generated Environment Variables:**
- `BASIC_USER`
- `BASIC_PASS`

---

### OAuth2 Client Credentials

```bash
# OAuth2 Client Credentials flow
--auth-override "oauth2-client-credentials:https://auth.example.com/token"

# Real-world example: Ozon API
--auth-override "oauth2-client-credentials:https://api-seller.ozon.ru/oauth/token"
```

**Generated Environment Variables:**
- `OAUTH_TOKEN` or `OAUTH2CLIENTCREDENTIALS_TOKEN`

---

### OAuth2 Authorization Code

```bash
# OAuth2 Authorization Code flow
--auth-override "oauth2-authorization-code:https://auth.example.com/authorize:https://auth.example.com/token"
```

**Generated Environment Variables:**
- `OAUTH_TOKEN` or `OAUTH2AUTHORIZATIONCODE_TOKEN`

---

### OAuth2 Password Flow

```bash
# OAuth2 Resource Owner Password Credentials
--auth-override "oauth2-password:https://auth.example.com/token"
```

**Generated Environment Variables:**
- `OAUTH_TOKEN` or `OAUTH2PASSWORD_TOKEN`

---

### OAuth2 Implicit Flow

```bash
# OAuth2 Implicit flow
--auth-override "oauth2-implicit:https://auth.example.com/authorize"
```

**Generated Environment Variables:**
- `OAUTH_TOKEN` or `OAUTH2IMPLICIT_TOKEN`

---

### Multi-Scheme Authentication (AND Logic)

```bash
# Require BOTH Bearer token AND API Key
--auth-override "bearer+apiKey:header:X-API-Key"

# Require THREE auth methods
--auth-override "bearer+basic+apiKey:query:key"
```

**Generated Environment Variables:**
All variables from combined schemes

---

## Complex Auth: JSON Config Files

For OAuth2 with scopes, OpenID Connect, or complex multi-scheme setups, use a JSON config file:

```bash
pnpm run generate api.json --output ./mcp-server \
  --auth-config ./auth-config.json
```

### Example 1: Bearer Token

**File:** `bearer-auth.json`

```json
{
  "schemes": {
    "BearerAuth": {
      "type": "http",
      "scheme": "bearer",
      "bearerFormat": "JWT",
      "description": "Bearer token authentication"
    }
  },
  "security": [
    {
      "BearerAuth": []
    }
  ]
}
```

**Usage:**
```bash
pnpm run generate api.json -o ./server --auth-config examples/auth-configs/bearer-auth.json
```

---

### Example 2: OAuth2 Client Credentials with Scopes

**File:** `oauth2-client-credentials.json`

```json
{
  "schemes": {
    "OAuth2ClientCredentials": {
      "type": "oauth2",
      "description": "OAuth2 Client Credentials Flow",
      "flows": {
        "clientCredentials": {
          "tokenUrl": "https://auth.example.com/oauth/token",
          "scopes": {
            "read:data": "Read access to data",
            "write:data": "Write access to data",
            "admin": "Administrator access"
          }
        }
      }
    }
  },
  "security": [
    {
      "OAuth2ClientCredentials": [
        "read:data",
        "write:data"
      ]
    }
  ]
}
```

**Usage:**
```bash
pnpm run generate api.json -o ./server --auth-config examples/auth-configs/oauth2-client-credentials.json
```

**Generated Environment Variables:**
- Token will be obtained automatically using OAuth2 flow
- Configure: `OAUTH2_CLIENT_ID` and `OAUTH2_CLIENT_SECRET`

---

### Example 3: Multi-Scheme (AND Logic)

**File:** `multi-scheme-and-logic.json`

Requires BOTH Bearer token AND API Key:

```json
{
  "schemes": {
    "BearerAuth": {
      "type": "http",
      "scheme": "bearer",
      "bearerFormat": "JWT",
      "description": "Bearer token for user authentication"
    },
    "ApiKeyAuth": {
      "type": "apiKey",
      "in": "header",
      "name": "X-API-Key",
      "description": "API Key for application authentication"
    }
  },
  "security": [
    {
      "BearerAuth": [],
      "ApiKeyAuth": []
    }
  ]
}
```

**Usage:**
```bash
pnpm run generate api.json -o ./server --auth-config examples/auth-configs/multi-scheme-and-logic.json
```

**Generated Environment Variables:**
- `BEARER_TOKEN` or `BEARERAUTH_TOKEN`
- `X_API_KEY` or `APIKEYAUTH_API_KEY`

---

## JSON Config Schema

### Structure

```json
{
  "schemes": {
    "<SchemeName>": {
      "type": "apiKey" | "http" | "oauth2",
      "description": "Optional description",
      ...type-specific fields
    }
  },
  "security": [
    {
      "<SchemeName>": ["scope1", "scope2"]
    }
  ]
}
```

### Type: API Key

```json
{
  "type": "apiKey",
  "in": "header" | "query" | "cookie",
  "name": "Parameter name",
  "description": "Optional description"
}
```

### Type: HTTP (Bearer or Basic)

```json
{
  "type": "http",
  "scheme": "bearer" | "basic",
  "bearerFormat": "JWT",  // Optional, only for bearer
  "description": "Optional description"
}
```

### Type: OAuth2

```json
{
  "type": "oauth2",
  "description": "Optional description",
  "flows": {
    "clientCredentials": {
      "tokenUrl": "https://auth.example.com/token",
      "refreshUrl": "https://auth.example.com/refresh",  // Optional
      "scopes": {
        "scope:name": "Scope description"
      }
    },
    "authorizationCode": {
      "authorizationUrl": "https://auth.example.com/authorize",
      "tokenUrl": "https://auth.example.com/token",
      "refreshUrl": "https://auth.example.com/refresh",  // Optional
      "scopes": {}
    },
    "implicit": {
      "authorizationUrl": "https://auth.example.com/authorize",
      "scopes": {}
    },
    "password": {
      "tokenUrl": "https://auth.example.com/token",
      "scopes": {}
    }
  }
}
```

---

## Common Use Cases

### Use Case 1: API Spec Missing Auth (Ozon API)

**Problem:** OpenAPI spec doesn't define `securitySchemes` but API requires OAuth2

**Solution:**
```bash
pnpm run generate swagger.json -o ./mcp-server \
  --auth-override "oauth2-client-credentials:https://api-seller.ozon.ru/oauth/token"
```

---

### Use Case 2: Testing Different Auth Mechanisms

**Problem:** Spec defines OAuth2 but you want to test with simple Bearer token

**Solution:**
```bash
pnpm run generate api.json -o ./test-server \
  --auth-override "bearer:TestToken"
```

---

### Use Case 3: Multi-Tenant API with Dual Auth

**Problem:** API requires both user token AND application key

**Solution:**
```bash
pnpm run generate api.json -o ./mcp-server \
  --auth-override "bearer+apiKey:header:X-App-Key"
```

---

## Validation & Error Handling

### Validation Errors

The CLI validates auth configurations and provides clear error messages:

```bash
# ❌ Invalid location
--auth-override "apiKey:body:key"
# Error: Invalid API Key location. Use: header, query, or cookie

# ❌ Missing parameter
--auth-override "apiKey:header"
# Error: API Key parameter name is required

# ❌ Invalid JSON
--auth-config invalid.json
# Error: Invalid JSON in auth config file: Unexpected token...

# ❌ Both flags provided
--auth-override "bearer" --auth-config auth.json
# Error: Cannot use both --auth-override and --auth-config
```

### Testing Your Configuration

1. **Generate with verbose output:**
```bash
pnpm run generate api.json -o ./test-server \
  --auth-override "bearer" \
  --verbose
```

2. **Check generated files:**
- `src/http-client.ts` - Auth interceptor implementation
- `.env.example` - Required environment variables
- `SECURITY.md` - Authentication setup instructions

3. **Test the MCP server:**
```bash
cd test-server
npm install
npm run build
# Set environment variables
node dist/index.js
```

---

## Advanced: Programmatic Usage

You can also use auth override utilities programmatically:

```typescript
import { parseAuthOverride, loadAuthConfig } from '@openapi-to-mcp/cli/utils/auth-override';

// Parse simple override
const config = parseAuthOverride('bearer');

// Load JSON config
const complex = loadAuthConfig('./auth-config.json');

// Inject into OpenAPI document
document.components = document.components || {};
document.components.securitySchemes = config.schemes;
document.security = config.security;
```

---

## Troubleshooting

### Issue: Generated server returns 401 Unauthorized

**Cause:** Environment variables not set

**Solution:**
1. Check `.env.example` for required variables
2. Create `.env` file with actual credentials
3. Verify variable names match exactly

---

### Issue: OAuth2 token not refreshing

**Cause:** Generated code uses placeholder for OAuth2

**Solution:**
- OAuth2 implementation requires manual setup
- See generated `SECURITY.md` for implementation guide
- Consider using auth-config.json with full OAuth2 configuration

---

### Issue: Multi-scheme auth not working

**Cause:** Missing one of the required auth credentials

**Solution:**
1. Verify ALL environment variables are set
2. Check `src/http-client.ts` for required auth headers
3. Test each auth method individually first

---

## See Also

- [CLI Documentation](../../packages/cli/README.md)
- [Generator Documentation](../../packages/generator/README.md)
- [OpenAPI Security Scheme Spec](https://swagger.io/specification/#security-scheme-object)

---

**Generated:** 2025-10-09
**Author:** James (Dev Agent)
**Project:** OpenAPI-to-MCP Generator
