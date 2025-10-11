# OAuth 2.0 Troubleshooting Guide

This guide helps you diagnose and resolve common OAuth 2.0 authentication issues in generated MCP servers.

## Table of Contents

- [Common Issues](#common-issues)
- [Error Messages](#error-messages)
- [Debugging Tools](#debugging-tools)
- [Configuration Issues](#configuration-issues)
- [Network Issues](#network-issues)
- [Token Issues](#token-issues)
- [Best Practices](#best-practices)

## Common Issues

### 1. Missing OAuth Credentials

**Symptoms:**
```
Error: OAuth2 credentials missing. Please set OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET in your .env file
```

**Cause:** Environment variables `OAUTH_CLIENT_ID` and/or `OAUTH_CLIENT_SECRET` are not set.

**Solutions:**
1. **Create `.env` file** from `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. **Add your credentials** to `.env`:
   ```bash
   OAUTH_CLIENT_ID=your-actual-client-id
   OAUTH_CLIENT_SECRET=your-actual-client-secret
   ```

3. **Verify file location**: `.env` must be in the root directory of your MCP server (same directory as `package.json`)

4. **Check for typos**: Variable names are case-sensitive
   - ✅ Correct: `OAUTH_CLIENT_ID`
   - ❌ Wrong: `oauth_client_id`, `OAUTH_CLIENT_Id`

5. **Restart the server** after updating `.env`:
   ```bash
   npm run build
   npm start
   ```

### 2. Authentication Failed (401 Unauthorized)

**Symptoms:**
```
[oauth-client] Failed to obtain access token: 401 Unauthorized
Error: OAuth2 authentication failed: invalid_client
```

**Causes & Solutions:**

#### Invalid Credentials
- **Verify credentials** are correct in your API provider's dashboard
- **Check for extra spaces** in `.env` file:
  ```bash
  # ❌ Wrong (trailing space)
  OAUTH_CLIENT_ID=abc123

  # ✅ Correct
  OAUTH_CLIENT_ID=abc123
  ```

#### Expired Credentials
- **Rotate credentials** in your API provider's dashboard
- **Update `.env`** with new credentials
- **Clear token cache**:
  ```typescript
  import { clearTokenCache } from './src/auth/oauth-client.js';
  clearTokenCache();
  ```

#### Wrong Token Endpoint
- **Check OpenAPI spec** has correct `tokenUrl`
- **Verify token endpoint** matches API documentation
- **Regenerate server** if token URL changed:
  ```bash
  openapi-to-mcp generate api-spec.json -o ./server --force
  ```

### 3. Token Expired Too Quickly

**Symptoms:**
```
[http-client] Token refresh failed
API request failed: 401 Unauthorized
```

**Causes & Solutions:**

#### Server Time Mismatch
- **Check system time** is synchronized:
  ```bash
  # macOS/Linux
  date

  # Windows
  time
  ```
- **Enable NTP** (Network Time Protocol) to sync time automatically

#### Token Cache Issue
- **Default buffer**: 5 minutes before expiry
- **Manual refresh**: Clear cache to force refresh
  ```typescript
  import { clearTokenCache } from './src/auth/oauth-client.js';
  clearTokenCache();
  ```

### 4. Network / Connection Errors

**Symptoms:**
```
[oauth-client] Failed to obtain access token: ECONNREFUSED
[oauth-client] Failed to obtain access token: ETIMEDOUT
```

**Causes & Solutions:**

#### Firewall / Proxy
- **Check firewall** allows outbound HTTPS to token endpoint
- **Configure proxy** if behind corporate firewall:
  ```bash
  # Set proxy environment variables
  export HTTP_PROXY=http://proxy.company.com:8080
  export HTTPS_PROXY=http://proxy.company.com:8080
  ```

#### Network Issues
- **Test connectivity**:
  ```bash
  curl -I https://auth.example.com/oauth/token
  ```
- **Check DNS resolution**:
  ```bash
  nslookup auth.example.com
  ```

#### Token Endpoint Down
- **Check API status page** for service outages
- **Contact API provider** if endpoint is unreachable

### 5. Invalid Token Format

**Symptoms:**
```
[http-client] OAuth authentication error: Invalid token format
API request failed: 401 Unauthorized
```

**Causes & Solutions:**

#### Token Not a String
- **Check response parsing** in `oauth-client.ts`:
  ```typescript
  const accessToken = response.data.access_token as string;
  if (!accessToken) {
    throw new Error('No access_token in OAuth2 response');
  }
  ```

#### Malformed Response
- **Enable debug mode** to see full response:
  ```bash
  DEBUG=true npm start
  ```
- **Check OAuth server response** matches RFC 6749:
  ```json
  {
    "access_token": "abc123",
    "token_type": "Bearer",
    "expires_in": 3600
  }
  ```

### 6. Multiple API Calls Fail Simultaneously

**Symptoms:**
- Multiple 401 errors at the same time
- Token refresh happens repeatedly

**Causes & Solutions:**

#### Race Condition
- **Token cache** prevents race conditions
- **Sequential retry** ensures only one refresh attempt
- **Check `_retry` flag** in response interceptor:
  ```typescript
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    // Only retry once
  }
  ```

#### Token Expiry During Burst
- **Increase cache buffer** if needed (default: 5 minutes)
- **Monitor token lifecycle**:
  ```bash
  DEBUG=true npm start
  # Watch for: [oauth-client] Token obtained, expires in X seconds
  ```

## Error Messages

### OAuth Client Errors

| Error Message | Meaning | Solution |
|--------------|---------|----------|
| `OAuth2 credentials missing` | `OAUTH_CLIENT_ID` or `OAUTH_CLIENT_SECRET` not set | Add credentials to `.env` file |
| `No access_token in OAuth2 response` | OAuth server response missing `access_token` field | Check OAuth server response format |
| `OAuth2 authentication failed: invalid_client` | Invalid credentials | Verify credentials in API dashboard |
| `OAuth2 authentication failed: invalid_grant` | Grant type not supported | Check OpenAPI spec `flows` configuration |
| `OAuth2 authentication failed: unauthorized_client` | Client not authorized for this grant type | Enable Client Credentials flow in API dashboard |

### HTTP Client Errors

| Error Message | Meaning | Solution |
|--------------|---------|----------|
| `[http-client] OAuth authentication error` | Failed to fetch token before request | Check network connectivity and credentials |
| `[http-client] Token refresh failed` | Failed to refresh token on 401 | Check credentials and token endpoint |
| `API request failed: 401 Unauthorized` | Invalid or expired token | Clear token cache and retry |

## Debugging Tools

### Enable Debug Logging

Add to `.env`:
```bash
DEBUG=true
```

You'll see detailed logs:
```
[oauth-client] Requesting new access token
[oauth-client] Token obtained, expires in 3600 seconds
[oauth-client] Using cached token
[http-client] OAuth authentication error: ...
```

### Inspect Token

**Do NOT log actual tokens in production**, but you can inspect structure:
```typescript
// For debugging only - remove after troubleshooting
const token = await getAccessToken();
console.error('[DEBUG] Token length:', token.length);
console.error('[DEBUG] Token starts with:', token.substring(0, 10));
```

### Test OAuth Endpoint Manually

Use `curl` to verify token endpoint:
```bash
curl -X POST https://auth.example.com/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
```

Expected response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### Check Token Expiry

Monitor token lifecycle:
```bash
DEBUG=true npm start 2>&1 | grep "expires in"
```

### Network Tracing

Capture HTTP traffic (for debugging only):
```bash
# Using mitmproxy
mitmproxy -p 8080

# Configure proxy
export HTTPS_PROXY=http://localhost:8080
npm start
```

## Configuration Issues

### Invalid OpenAPI Specification

**Symptoms:**
- OAuth client not generated
- No `src/auth/oauth-client.ts` file

**Verify OpenAPI spec:**
```yaml
components:
  securitySchemes:
    oauth2ClientCredentials:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://auth.example.com/oauth/token
          scopes: {}

security:
  - oauth2ClientCredentials: []
```

**Regenerate server:**
```bash
openapi-to-mcp generate api-spec.yaml -o ./server --force
```

### Missing Security Requirement

**Symptoms:**
- OAuth detected but not applied to requests
- No Authorization header added

**Add global security:**
```yaml
security:
  - oauth2ClientCredentials: []
```

Or per-operation:
```yaml
paths:
  /users:
    get:
      security:
        - oauth2ClientCredentials: []
```

### Wrong Grant Type

**Symptoms:**
- `unsupported_grant_type` error
- `invalid_grant` error

**Supported:** Client Credentials flow only (currently)

**Check OpenAPI spec uses `clientCredentials`:**
```yaml
flows:
  clientCredentials:  # ✅ Supported
    tokenUrl: ...
  authorizationCode:  # ❌ Not yet supported
    authorizationUrl: ...
```

## Network Issues

### SSL/TLS Certificate Errors

**Symptoms:**
```
Error: unable to verify the first certificate
Error: self signed certificate in certificate chain
```

**Solutions:**

#### Production (Recommended)
- **Fix certificate chain** on OAuth server
- **Use valid SSL certificate** from trusted CA

#### Development Only (NOT for production)
```javascript
// For local development ONLY
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
```

⚠️ **Never use in production** - disables SSL security

### Timeout Errors

**Symptoms:**
```
Error: timeout of 30000ms exceeded
```

**Increase timeout** in `oauth-client.ts`:
```typescript
const response = await axios.post(tokenUrl, data, {
  timeout: 60000, // Increase to 60 seconds
});
```

## Token Issues

### Token Not Cached

**Symptoms:**
- Token fetched on every request
- Excessive OAuth server calls

**Debug:**
```bash
DEBUG=true npm start 2>&1 | grep "Requesting new access token"
```

**Verify cache logic:**
```typescript
// Check if cache is working
if (cachedToken && tokenExpiry > now + 300000) {
  console.error('[oauth-client] Using cached token'); // Should see this
  return cachedToken;
}
```

### Token Refresh Loop

**Symptoms:**
- Continuous 401 errors
- Token refresh never succeeds

**Check:**
1. **Credentials are valid** for token refresh
2. **Token endpoint** returns valid tokens
3. **No retry flag** preventing infinite loops:
   ```typescript
   if (!originalRequest._retry) {
     originalRequest._retry = true; // Prevents infinite loop
   }
   ```

## Best Practices

### 1. Use Debug Mode During Setup

Enable debug logging while setting up OAuth:
```bash
DEBUG=true npm start
```

Disable in production:
```bash
DEBUG=false npm start
```

### 2. Monitor Token Expiry

Watch for tokens expiring too quickly:
```bash
DEBUG=true npm start 2>&1 | grep "expires in"
```

Default is 3600 seconds (1 hour).

### 3. Test OAuth Endpoint First

Before starting MCP server, verify OAuth endpoint works:
```bash
curl -X POST https://auth.example.com/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=YOUR_ID&client_secret=YOUR_SECRET"
```

### 4. Rotate Credentials Regularly

- **Set calendar reminders** to rotate OAuth credentials
- **Update `.env`** with new credentials
- **Clear token cache** after rotation
- **Monitor logs** for authentication errors

### 5. Use Environment-Specific Credentials

```bash
# .env.development
OAUTH_CLIENT_ID=dev-client-id
OAUTH_CLIENT_SECRET=dev-secret

# .env.production
OAUTH_CLIENT_ID=prod-client-id
OAUTH_CLIENT_SECRET=prod-secret
```

Load appropriate config:
```bash
# Development
npm run dev

# Production
npm run start
```

### 6. Implement Health Checks

Add OAuth health check:
```typescript
// src/health.ts
import { getAccessToken } from './auth/oauth-client.js';

export async function checkOAuthHealth(): Promise<boolean> {
  try {
    await getAccessToken();
    return true;
  } catch (error) {
    console.error('OAuth health check failed:', error);
    return false;
  }
}
```

## Getting Help

If you're still experiencing issues:

1. **Check debug logs** with `DEBUG=true`
2. **Review error messages** against this guide
3. **Verify credentials** in API provider's dashboard
4. **Test OAuth endpoint** manually with `curl`
5. **Check OpenAPI spec** has correct OAuth configuration
6. **Open an issue** at [GitHub Issues](https://github.com/your-org/openapi-to-mcp/issues) with:
   - Error messages (redact credentials)
   - Debug logs (redact tokens)
   - OpenAPI spec (redact sensitive URLs)
   - Steps to reproduce

## Related Documentation

- [OAuth Security Best Practices](./oauth-security-best-practices.md)
- [OpenAPI OAuth 2.0 Specification](https://swagger.io/docs/specification/authentication/oauth2/)
- [RFC 6749 - OAuth 2.0 Framework](https://datatracker.ietf.org/doc/html/rfc6749)
