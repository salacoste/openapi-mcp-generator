# OAuth 2.0 Security Best Practices

This guide outlines security best practices for OAuth 2.0 Client Credentials flow in generated MCP servers.

## Table of Contents

- [Credential Management](#credential-management)
- [Token Security](#token-security)
- [Network Security](#network-security)
- [Code Security](#code-security)
- [Operational Security](#operational-security)
- [Compliance](#compliance)
- [Security Checklist](#security-checklist)

## Credential Management

### 1. Never Commit Credentials to Version Control

**❌ NEVER DO THIS:**
```bash
# .env committed to git
OAUTH_CLIENT_ID=abc123
OAUTH_CLIENT_SECRET=xyz789
```

**✅ DO THIS:**

1. **Add `.env` to `.gitignore`:**
   ```gitignore
   # Credentials
   .env
   .env.local
   .env.*.local

   # Do NOT ignore
   !.env.example
   ```

2. **Use `.env.example` as template:**
   ```bash
   # .env.example (safe to commit)
   OAUTH_CLIENT_ID=your-client-id-here
   OAUTH_CLIENT_SECRET=your-client-secret-here
   ```

3. **Verify before commits:**
   ```bash
   git status
   # Ensure .env is not in staged files
   ```

### 2. Rotate Credentials Regularly

**Schedule:**
- **High-security APIs**: Every 30-60 days
- **Standard APIs**: Every 90 days
- **After security incident**: Immediately

**Rotation Process:**
```bash
# 1. Generate new credentials in API dashboard
# 2. Update .env with new credentials
OAUTH_CLIENT_ID=new-client-id
OAUTH_CLIENT_SECRET=new-client-secret

# 3. Clear token cache
# 4. Restart server
npm run build
npm start

# 5. Monitor for errors
DEBUG=true npm start 2>&1 | grep -i error

# 6. Deactivate old credentials after verification
```

### 3. Use Separate Credentials per Environment

**❌ NEVER share credentials between environments:**
```bash
# ❌ Same credentials for dev and prod
OAUTH_CLIENT_ID=shared-client-id
```

**✅ Use environment-specific credentials:**
```bash
# Development
.env.development:
  OAUTH_CLIENT_ID=dev-client-id
  OAUTH_CLIENT_SECRET=dev-secret

# Staging
.env.staging:
  OAUTH_CLIENT_ID=staging-client-id
  OAUTH_CLIENT_SECRET=staging-secret

# Production
.env.production:
  OAUTH_CLIENT_ID=prod-client-id
  OAUTH_CLIENT_SECRET=prod-secret
```

### 4. Use Secrets Management Systems

**For Production:**

#### AWS Secrets Manager
```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'us-east-1' });
const response = await client.send(
  new GetSecretValueCommand({ SecretId: 'oauth/client-credentials' })
);

const credentials = JSON.parse(response.SecretString);
process.env.OAUTH_CLIENT_ID = credentials.clientId;
process.env.OAUTH_CLIENT_SECRET = credentials.clientSecret;
```

#### HashiCorp Vault
```bash
# Fetch credentials from Vault
vault kv get secret/oauth/client-credentials

# Set environment variables
export OAUTH_CLIENT_ID=$(vault kv get -field=clientId secret/oauth/client-credentials)
export OAUTH_CLIENT_SECRET=$(vault kv get -field=clientSecret secret/oauth/client-credentials)
```

#### Azure Key Vault
```typescript
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';

const vaultUrl = 'https://your-vault.vault.azure.net';
const client = new SecretClient(vaultUrl, new DefaultAzureCredential());

const clientId = await client.getSecret('oauth-client-id');
const clientSecret = await client.getSecret('oauth-client-secret');

process.env.OAUTH_CLIENT_ID = clientId.value;
process.env.OAUTH_CLIENT_SECRET = clientSecret.value;
```

### 5. Limit Credential Scope

**Request minimum required scopes:**
```yaml
# OpenAPI specification
flows:
  clientCredentials:
    tokenUrl: https://auth.example.com/oauth/token
    scopes:
      read:users: Read user data  # ✅ Specific scope
      # ❌ Don't request: admin:* (too broad)
```

**Verify scope in token:**
```typescript
// Decode JWT token (do NOT do this with sensitive data)
const tokenParts = token.split('.');
const payload = JSON.parse(atob(tokenParts[1]));
console.error('[DEBUG] Token scopes:', payload.scope);
```

### 6. Monitor Credential Usage

**Track authentication events:**
```typescript
// Log successful authentications (without credentials)
async function getAccessToken(): Promise<string> {
  // ... fetch token ...

  console.error('[oauth-client] Token obtained successfully', {
    timestamp: new Date().toISOString(),
    expiresIn: expiresIn,
    // ❌ NEVER log: clientId, clientSecret, token
  });

  return accessToken;
}
```

**Alert on anomalies:**
- Sudden spike in token requests
- Authentication failures
- Token requests from unexpected locations
- Off-hours usage patterns

## Token Security

### 1. Never Log Tokens

**❌ NEVER DO THIS:**
```typescript
console.log('Token:', token);
console.log(`Authorization: Bearer ${token}`);
console.error('Debug token:', accessToken);
```

**✅ DO THIS:**
```typescript
// Log token metadata only
console.error('[oauth-client] Token obtained', {
  length: token.length,
  expiresIn: expiresIn,
  timestamp: Date.now()
});

// For debugging, show only first few characters
console.error('[DEBUG] Token prefix:', token.substring(0, 10) + '...');
```

### 2. Use HTTPS for All OAuth Requests

**Generated code uses HTTPS by default:**
```typescript
const tokenUrl = 'https://auth.example.com/oauth/token'; // ✅ HTTPS
```

**Verify in OpenAPI spec:**
```yaml
components:
  securitySchemes:
    oauth2:
      flows:
        clientCredentials:
          tokenUrl: https://auth.example.com/oauth/token  # ✅ HTTPS
          # ❌ NEVER: http://auth.example.com/oauth/token
```

**Reject HTTP in production:**
```typescript
// Add validation
if (tokenUrl.startsWith('http://') && process.env.NODE_ENV === 'production') {
  throw new Error('HTTP OAuth endpoints not allowed in production');
}
```

### 3. Implement Token Expiration

**Default implementation includes expiration:**
```typescript
// Token expires after specified time
const expiresIn = response.data.expires_in || 3600;
tokenExpiry = now + (expiresIn * 1000);

// 5-minute buffer before expiry
if (cachedToken && tokenExpiry > now + 300000) {
  return cachedToken;
}
```

**Verify expiry is enforced:**
```bash
# Monitor token lifecycle
DEBUG=true npm start 2>&1 | grep "expires in"
```

### 4. Clear Tokens on Shutdown

**Add cleanup handler:**
```typescript
// src/index.ts
import { clearTokenCache } from './auth/oauth-client.js';

process.on('SIGTERM', () => {
  console.error('Received SIGTERM, cleaning up...');
  clearTokenCache();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.error('Received SIGINT, cleaning up...');
  clearTokenCache();
  process.exit(0);
});
```

### 5. Validate Token Format

**Implement validation:**
```typescript
function validateToken(token: string): boolean {
  // Basic validation
  if (!token || typeof token !== 'string') {
    return false;
  }

  // Check minimum length
  if (token.length < 20) {
    console.error('[oauth-client] Token too short, possible error');
    return false;
  }

  // For JWT tokens, verify structure
  if (token.includes('.')) {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('[oauth-client] Invalid JWT structure');
      return false;
    }
  }

  return true;
}
```

### 6. Implement Token Refresh Retry Limits

**Prevent infinite refresh loops:**
```typescript
// Response interceptor with retry limit
const MAX_RETRIES = 1;

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Limit retries
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Only retry once

      try {
        const token = await getAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return httpClient(originalRequest);
      } catch (refreshError) {
        console.error('[http-client] Token refresh failed');
        throw error; // Don't retry again
      }
    }

    throw error;
  }
);
```

## Network Security

### 1. Use Certificate Pinning (Production)

**Pin OAuth server certificate:**
```typescript
import https from 'https';
import { readFileSync } from 'fs';

const agent = new https.Agent({
  ca: readFileSync('./certificates/oauth-server.pem')
});

const response = await axios.post(tokenUrl, data, {
  httpsAgent: agent
});
```

### 2. Implement Request Timeout

**Prevent hanging requests:**
```typescript
const response = await axios.post(tokenUrl, data, {
  timeout: 30000, // 30 second timeout
});
```

**Handle timeout errors:**
```typescript
try {
  const response = await axios.post(tokenUrl, data, { timeout: 30000 });
} catch (error: any) {
  if (error.code === 'ECONNABORTED') {
    throw new Error('OAuth token request timed out');
  }
  throw error;
}
```

### 3. Validate OAuth Server Identity

**Verify SSL certificate:**
```typescript
import https from 'https';

const agent = new https.Agent({
  rejectUnauthorized: true, // ✅ Verify certificates
  // ❌ NEVER in production: rejectUnauthorized: false
});

const response = await axios.post(tokenUrl, data, {
  httpsAgent: agent
});
```

### 4. Use Secure DNS

**Prevent DNS hijacking:**
- Use DNS over HTTPS (DoH)
- Use DNS over TLS (DoT)
- Validate DNS responses

**For Node.js:**
```bash
# Use secure DNS resolver
export NODE_OPTIONS="--dns-result-order=ipv4first"
```

## Code Security

### 1. Avoid Inline Credentials

**❌ NEVER hardcode credentials:**
```typescript
const clientId = 'abc123'; // ❌ NEVER
const clientSecret = 'xyz789'; // ❌ NEVER
```

**✅ Always use environment variables:**
```typescript
const clientId = process.env.OAUTH_CLIENT_ID;
const clientSecret = process.env.OAUTH_CLIENT_SECRET;
```

### 2. Validate Environment Variables

**Add startup validation:**
```typescript
function validateOAuthConfig(): void {
  const required = ['OAUTH_CLIENT_ID', 'OAUTH_CLIENT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required OAuth configuration: ${missing.join(', ')}\n` +
      'Please set these environment variables in your .env file'
    );
  }
}

// Call before starting server
validateOAuthConfig();
```

### 3. Use Type Safety

**Enforce types:**
```typescript
interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
}

function getOAuthConfig(): OAuthConfig {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('OAuth credentials not configured');
  }

  return {
    clientId,
    clientSecret,
    tokenUrl: 'https://auth.example.com/oauth/token'
  };
}
```

### 4. Sanitize Error Messages

**❌ Don't expose credentials in errors:**
```typescript
throw new Error(`Failed with client ${clientId}`); // ❌ Exposes ID
```

**✅ Sanitize error messages:**
```typescript
function sanitizeError(error: any): string {
  const message = error.message || String(error);

  // Remove potential credentials
  return message
    .replace(/client_id=[^&\s]+/g, 'client_id=***')
    .replace(/client_secret=[^&\s]+/g, 'client_secret=***')
    .replace(/Bearer\s+[^\s]+/g, 'Bearer ***');
}

try {
  await getAccessToken();
} catch (error) {
  console.error('[oauth-client] Error:', sanitizeError(error));
}
```

### 5. Implement Rate Limiting

**Prevent token request abuse:**
```typescript
class RateLimiter {
  private attempts: number = 0;
  private resetTime: number = 0;
  private readonly maxAttempts = 10;
  private readonly windowMs = 60000; // 1 minute

  async checkLimit(): Promise<void> {
    const now = Date.now();

    if (now > this.resetTime) {
      this.attempts = 0;
      this.resetTime = now + this.windowMs;
    }

    if (this.attempts >= this.maxAttempts) {
      throw new Error(
        'Rate limit exceeded for OAuth token requests. ' +
        'Please wait before retrying.'
      );
    }

    this.attempts++;
  }
}

const rateLimiter = new RateLimiter();

async function getAccessToken(): Promise<string> {
  await rateLimiter.checkLimit();
  // ... rest of implementation
}
```

## Operational Security

### 1. Monitor OAuth Usage

**Track metrics:**
```typescript
interface OAuthMetrics {
  tokenRequests: number;
  tokenSuccesses: number;
  tokenFailures: number;
  cacheHits: number;
  cacheMisses: number;
  lastTokenTime: number;
}

const metrics: OAuthMetrics = {
  tokenRequests: 0,
  tokenSuccesses: 0,
  tokenFailures: 0,
  cacheHits: 0,
  cacheMisses: 0,
  lastTokenTime: 0
};

async function getAccessToken(): Promise<string> {
  metrics.tokenRequests++;

  if (cachedToken && tokenExpiry > now + 300000) {
    metrics.cacheHits++;
    return cachedToken;
  }

  metrics.cacheMisses++;

  try {
    const token = await fetchToken();
    metrics.tokenSuccesses++;
    metrics.lastTokenTime = Date.now();
    return token;
  } catch (error) {
    metrics.tokenFailures++;
    throw error;
  }
}

// Export metrics
export function getOAuthMetrics(): OAuthMetrics {
  return { ...metrics };
}
```

### 2. Implement Audit Logging

**Log security events:**
```typescript
function auditLog(event: string, details: Record<string, unknown>): void {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    ...details,
    // ❌ NEVER log: credentials, tokens
  }));
}

async function getAccessToken(): Promise<string> {
  auditLog('oauth.token.request', { source: 'cache-miss' });

  try {
    const token = await fetchToken();
    auditLog('oauth.token.success', { expiresIn });
    return token;
  } catch (error) {
    auditLog('oauth.token.failure', {
      error: error.message,
      // ❌ Don't log full error which might contain credentials
    });
    throw error;
  }
}
```

### 3. Secure Log Storage

**Best practices:**
- **Encrypt logs** at rest
- **Redact credentials** from logs
- **Limit log retention** (30-90 days)
- **Restrict log access** (need-to-know basis)
- **Monitor log access** (audit the audits)

### 4. Implement Health Checks

**OAuth health endpoint:**
```typescript
import { getAccessToken } from './auth/oauth-client.js';

export async function healthCheck(): Promise<{
  status: string;
  oauth: string;
  timestamp: number;
}> {
  const timestamp = Date.now();

  try {
    await getAccessToken();
    return {
      status: 'healthy',
      oauth: 'connected',
      timestamp
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      oauth: 'disconnected',
      timestamp
    };
  }
}
```

### 5. Disaster Recovery

**Backup plan:**
1. **Document token endpoints** and configuration
2. **Store backup credentials** securely (encrypted, offline)
3. **Test credential rotation** process regularly
4. **Have escalation contacts** for OAuth provider
5. **Monitor expiry dates** for credentials

## Compliance

### 1. Follow OAuth 2.0 RFC 6749

**Key requirements:**
- ✅ Use HTTPS for token endpoint
- ✅ Use `application/x-www-form-urlencoded` content type
- ✅ Include `grant_type=client_credentials`
- ✅ Validate token response format
- ✅ Implement token expiration

### 2. GDPR Compliance

**If handling personal data:**
- **Document token lifecycle** (creation, storage, deletion)
- **Implement data retention** policies
- **Provide audit trail** for OAuth usage
- **Secure credential storage**
- **Right to erasure** (delete cached tokens on request)

### 3. PCI DSS (if handling payments)

**Requirements:**
- **Encrypt credentials** at rest and in transit
- **Implement access controls** for credentials
- **Audit OAuth usage** regularly
- **Restrict credential access** (need-to-know)
- **Regular security testing**

### 4. SOC 2 Compliance

**Controls:**
- **Access logging** for OAuth operations
- **Credential rotation** procedures
- **Incident response** plan
- **Monitoring and alerting**
- **Change management** for OAuth configuration

## Security Checklist

### Development
- [ ] `.env` is in `.gitignore`
- [ ] No credentials hardcoded in source
- [ ] Tokens never logged to console
- [ ] Error messages sanitized
- [ ] Type safety enforced
- [ ] Rate limiting implemented

### Testing
- [ ] Test with invalid credentials
- [ ] Test token expiration
- [ ] Test token refresh on 401
- [ ] Test network failures
- [ ] Test rate limiting
- [ ] Security scan performed

### Deployment
- [ ] Separate credentials per environment
- [ ] Credentials stored in secrets manager
- [ ] HTTPS enforced
- [ ] Certificate validation enabled
- [ ] Monitoring configured
- [ ] Alerts configured

### Operations
- [ ] Credential rotation scheduled
- [ ] Health checks implemented
- [ ] Audit logging enabled
- [ ] Log retention configured
- [ ] Incident response plan documented
- [ ] Security contacts documented

### Compliance
- [ ] OAuth 2.0 RFC 6749 compliance verified
- [ ] GDPR requirements met (if applicable)
- [ ] PCI DSS requirements met (if applicable)
- [ ] SOC 2 controls implemented (if applicable)
- [ ] Regular security audits scheduled

## Related Documentation

- [OAuth Troubleshooting Guide](./oauth-troubleshooting.md)
- [RFC 6749 - OAuth 2.0 Framework](https://datatracker.ietf.org/doc/html/rfc6749)
- [OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [OWASP OAuth 2.0 Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html)
