# Story 8.2: Generator Template Updates for OAuth 2.0

**Epic**: Epic 8 - OAuth 2.0 Authentication Support
**Status**: PLANNED
**Priority**: P0 (Critical)
**Effort**: 5-7 hours
**Created**: 2025-10-08

---

## User Story

**As a** developer using the OpenAPI-to-MCP generator
**I want** the generator to create OAuth-enabled MCP servers
**So that** I can use the generated server with OAuth 2.0 protected APIs

---

## Acceptance Criteria

### Functional Requirements

- [ ] **AC1**: Generator creates OAuth client module when OAuth scheme detected
- [ ] **AC2**: HTTP client integrates with OAuth token management
- [ ] **AC3**: .env.example includes OAuth configuration variables
- [ ] **AC4**: README includes OAuth setup instructions
- [ ] **AC5**: Generated code supports Client Credentials flow
- [ ] **AC6**: Generated code supports Authorization Code flow
- [ ] **AC7**: Token caching reduces unnecessary token requests
- [ ] **AC8**: Automatic token refresh before expiration

### Quality Requirements

- [ ] **AC9**: Type-safe OAuth configuration
- [ ] **AC10**: Comprehensive error handling for OAuth failures
- [ ] **AC11**: Clear logging for OAuth operations (when DEBUG=true)
- [ ] **AC12**: Generated code passes TypeScript compilation
- [ ] **AC13**: Generated code passes ESLint checks

---

## Technical Design

### 1. OAuth Client Template

**File**: `packages/templates/src/oauth-client.ts.hbs`

```typescript
/**
 * OAuth 2.0 Client for {{apiName}}
 * Handles token management and OAuth flows
 */

import axios, { AxiosError } from 'axios';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

interface TokenCache {
  accessToken: string;
  tokenType: string;
  expiresAt: number;
  refreshToken?: string;
}

/**
 * OAuth 2.0 Client
 * Manages token lifecycle and authentication
 */
class OAuth2Client {
  private tokenCache: TokenCache | null = null;
  private tokenRefreshPromise: Promise<string> | null = null;

  /**
   * Get valid access token
   * Automatically refreshes if expired
   */
  async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      this.logDebug('Using cached access token');
      return this.tokenCache.accessToken;
    }

    // If refresh already in progress, wait for it
    if (this.tokenRefreshPromise) {
      this.logDebug('Waiting for token refresh in progress');
      return this.tokenRefreshPromise;
    }

    // Start token refresh
    this.tokenRefreshPromise = this.refreshToken();

    try {
      const token = await this.tokenRefreshPromise;
      return token;
    } finally {
      this.tokenRefreshPromise = null;
    }
  }

  /**
   * Refresh or fetch new access token
   */
  private async refreshToken(): Promise<string> {
    try {
      // Try refresh token first if available
      if (this.tokenCache?.refreshToken) {
        this.logDebug('Attempting token refresh with refresh_token');
        return await this.useRefreshToken();
      }

      // Otherwise fetch new token
      this.logDebug('Fetching new access token');
      return await this.fetchNewToken();
    } catch (error) {
      this.logError('Token refresh failed', error);
      // Clear cache on failure
      this.tokenCache = null;
      throw new Error(`OAuth token refresh failed: ${this.getErrorMessage(error)}`);
    }
  }

{{#if (eq oauthFlow.type "clientCredentials")}}
  /**
   * Fetch new access token using Client Credentials flow
   */
  private async fetchNewToken(): Promise<string> {
    const clientId = process.env.OAUTH_CLIENT_ID;
    const clientSecret = process.env.OAUTH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Missing OAuth credentials: OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET required');
    }

    this.logDebug('Requesting token with Client Credentials flow');

    const response = await axios.post<TokenResponse>(
      '{{oauthFlow.tokenUrl}}',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        {{#if oauthFlow.scopes}}
        scope: '{{join (keys oauthFlow.scopes) " "}}',
        {{/if}}
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return this.cacheToken(response.data);
  }
{{/if}}

{{#if (eq oauthFlow.type "authorizationCode")}}
  /**
   * Fetch new access token using Authorization Code flow
   * Note: This requires authorization_code from user authorization
   */
  private async fetchNewToken(): Promise<string> {
    const authCode = process.env.OAUTH_AUTHORIZATION_CODE;

    if (!authCode) {
      throw new Error(
        'Missing authorization code. Please authorize first by visiting:\n' +
        this.getAuthorizationUrl()
      );
    }

    const clientId = process.env.OAUTH_CLIENT_ID;
    const clientSecret = process.env.OAUTH_CLIENT_SECRET;
    const redirectUri = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/callback';

    this.logDebug('Exchanging authorization code for access token');

    const response = await axios.post<TokenResponse>(
      '{{oauthFlow.tokenUrl}}',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        {{#if oauthFlow.pkce}}
        code_verifier: process.env.OAUTH_CODE_VERIFIER || '',
        {{/if}}
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return this.cacheToken(response.data);
  }

  /**
   * Get authorization URL for user consent
   */
  getAuthorizationUrl(): string {
    const clientId = process.env.OAUTH_CLIENT_ID;
    const redirectUri = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/callback';
    const state = this.generateState();

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId!,
      redirect_uri: redirectUri,
      state,
      {{#if oauthFlow.scopes}}
      scope: '{{join (keys oauthFlow.scopes) " "}}',
      {{/if}}
      {{#if oauthFlow.pkce}}
      code_challenge: this.generateCodeChallenge(),
      code_challenge_method: 'S256',
      {{/if}}
    });

    return `{{oauthFlow.authorizationUrl}}?${params.toString()}`;
  }

  {{#if oauthFlow.pkce}}
  /**
   * Generate PKCE code challenge
   */
  private generateCodeChallenge(): string {
    const verifier = process.env.OAUTH_CODE_VERIFIER || this.generateCodeVerifier();
    const crypto = require('crypto');
    const challenge = crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64url');
    return challenge;
  }

  /**
   * Generate PKCE code verifier
   */
  private generateCodeVerifier(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('base64url');
  }
  {{/if}}

  /**
   * Generate random state for CSRF protection
   */
  private generateState(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('hex');
  }
{{/if}}

  /**
   * Use refresh token to get new access token
   */
  private async useRefreshToken(): Promise<string> {
    const clientId = process.env.OAUTH_CLIENT_ID;
    const clientSecret = process.env.OAUTH_CLIENT_SECRET;

    if (!this.tokenCache?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post<TokenResponse>(
      '{{oauthFlow.tokenUrl}}',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.tokenCache.refreshToken,
        client_id: clientId!,
        client_secret: clientSecret!,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return this.cacheToken(response.data);
  }

  /**
   * Cache token and calculate expiration
   */
  private cacheToken(tokenResponse: TokenResponse): string {
    // Calculate expiration with 60 second buffer
    const expiresIn = tokenResponse.expires_in || 3600;
    const expiresAt = Date.now() + (expiresIn - 60) * 1000;

    this.tokenCache = {
      accessToken: tokenResponse.access_token,
      tokenType: tokenResponse.token_type || 'Bearer',
      expiresAt,
      refreshToken: tokenResponse.refresh_token,
    };

    this.logDebug(`Token cached, expires in ${expiresIn}s`);

    return this.tokenCache.accessToken;
  }

  /**
   * Clear token cache (for logout)
   */
  clearCache(): void {
    this.logDebug('Clearing token cache');
    this.tokenCache = null;
  }

  /**
   * Debug logging (only when DEBUG=true)
   */
  private logDebug(message: string): void {
    if (process.env.DEBUG === 'true') {
      console.log(`[OAuth2Client] ${message}`);
    }
  }

  /**
   * Error logging
   */
  private logError(message: string, error: unknown): void {
    console.error(`[OAuth2Client] ${message}:`, this.getErrorMessage(error));
  }

  /**
   * Extract error message from various error types
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      return error.response?.data?.error_description || error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}

// Export singleton instance
export const oauth2Client = new OAuth2Client();
```

### 2. Updated HTTP Client Template

**File**: `packages/templates/src/http-client.ts.hbs` (OAuth section)

```typescript
{{#if hasOAuth}}
import { oauth2Client } from './auth/oauth-client.js';

/**
 * Create configured axios instance
 */
function createHttpClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // OAuth 2.0 authentication
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
      try {
        // Get fresh access token
        const accessToken = await oauth2Client.getAccessToken();

        // Add to Authorization header
        config.headers.Authorization = `Bearer ${accessToken}`;

        if (process.env.DEBUG === 'true') {
          console.log('[HTTP] Request with OAuth token', {
            method: config.method,
            url: config.url,
          });
        }
      } catch (error) {
        console.error('[HTTP] OAuth token fetch failed:', error);
        throw error;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
}
{{else}}
// ... existing non-OAuth code
{{/if}}
```

### 3. Updated .env.example Template

**File**: `packages/templates/.env.example.hbs` (OAuth section)

```bash
{{#if hasOAuth}}
# =============================================================================
# OAUTH 2.0 AUTHENTICATION
# =============================================================================
# This API uses OAuth 2.0 {{oauthFlow.type}} flow
# =============================================================================

{{#if (eq oauthFlow.type "clientCredentials")}}
# OAuth Client Credentials
# Obtain from: [provide link to developer portal]
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=

# OAuth Token Endpoint
OAUTH_TOKEN_URL={{oauthFlow.tokenUrl}}

{{#if oauthFlow.scopes}}
# Available Scopes:
{{#each oauthFlow.scopes}}
#   - {{@key}}: {{this}}
{{/each}}
{{/if}}
{{/if}}

{{#if (eq oauthFlow.type "authorizationCode")}}
# OAuth Authorization Code Flow
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=

# OAuth Endpoints
OAUTH_AUTHORIZATION_URL={{oauthFlow.authorizationUrl}}
OAUTH_TOKEN_URL={{oauthFlow.tokenUrl}}

# Redirect URI (must match registered callback)
OAUTH_REDIRECT_URI=http://localhost:3000/callback

# Authorization code (obtained after user authorization)
OAUTH_AUTHORIZATION_CODE=

{{#if oauthFlow.pkce}}
# PKCE Code Verifier (generated, see README for instructions)
OAUTH_CODE_VERIFIER=
{{/if}}

{{#if oauthFlow.scopes}}
# Available Scopes:
{{#each oauthFlow.scopes}}
#   - {{@key}}: {{this}}
{{/each}}
{{/if}}
{{/if}}

# Debug Mode
DEBUG=false
{{/if}}
```

### 4. Updated README Template

**File**: `packages/templates/README.md.hbs` (OAuth section)

```markdown
{{#if hasOAuth}}
## OAuth 2.0 Authentication Setup

This API uses **OAuth 2.0 {{oauthFlow.type}}** authentication.

### Required Credentials

1. **Obtain OAuth Credentials**:
   - Register your application at [API Developer Portal URL]
   - Note your `client_id` and `client_secret`

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```

{{#if (eq oauthFlow.type "clientCredentials")}}
3. **Client Credentials Flow Setup**:

   Edit `.env` and add:
   ```bash
   OAUTH_CLIENT_ID=your-client-id
   OAUTH_CLIENT_SECRET=your-client-secret
   ```

   The MCP server will automatically request access tokens using these credentials.
{{/if}}

{{#if (eq oauthFlow.type "authorizationCode")}}
3. **Authorization Code Flow Setup**:

   a. Edit `.env` and add:
   ```bash
   OAUTH_CLIENT_ID=your-client-id
   OAUTH_CLIENT_SECRET=your-client-secret
   OAUTH_REDIRECT_URI=http://localhost:3000/callback
   ```

   b. Get authorization code:
   ```bash
   npm run authorize
   ```
   This will print an authorization URL. Open it in your browser and authorize the application.

   c. Copy the `code` parameter from the callback URL and add to `.env`:
   ```bash
   OAUTH_AUTHORIZATION_CODE=the-code-from-callback
   ```

   {{#if oauthFlow.pkce}}
   d. PKCE is enabled. The code verifier will be generated automatically.
   {{/if}}
{{/if}}

### Testing OAuth Setup

```bash
npm run test:oauth
```

This will attempt to fetch an access token and verify authentication works.

### Troubleshooting OAuth

#### "Missing OAuth credentials" error
- Verify `OAUTH_CLIENT_ID` and `OAUTH_CLIENT_SECRET` are set in `.env`
- Check credentials are correct (no extra spaces)

#### "Token refresh failed" error
- Check OAuth endpoints are reachable
- Verify client credentials have correct permissions
- Enable debug logging: `DEBUG=true npm start`

{{#if (eq oauthFlow.type "authorizationCode")}}
#### "Missing authorization code" error
- Run `npm run authorize` to get authorization URL
- Authorize application in browser
- Copy `code` from callback URL to `.env`
{{/if}}

### OAuth Security Best Practices

- ✅ **Never commit** `.env` file to version control
- ✅ **Rotate credentials** regularly (every 90 days)
- ✅ **Use HTTPS** for all OAuth endpoints (production)
- ✅ **Limit scopes** to minimum required permissions
- ✅ **Monitor access logs** for suspicious activity
{{/if}}
```

---

## Implementation Tasks

### Task 1: Create OAuth Client Template (2h)

- [ ] Create `packages/templates/src/oauth-client.ts.hbs`
- [ ] Implement Client Credentials flow logic
- [ ] Implement Authorization Code flow logic
- [ ] Add PKCE support for Authorization Code
- [ ] Add token caching logic
- [ ] Add comprehensive error handling
- [ ] Add debug logging

### Task 2: Update HTTP Client Template (1h)

- [ ] Add OAuth conditional logic to `http-client.ts.hbs`
- [ ] Integrate with OAuth client
- [ ] Add request interceptor for token injection
- [ ] Maintain backward compatibility with non-OAuth

### Task 3: Update .env.example Template (0.5h)

- [ ] Add OAuth configuration section to `.env.example.hbs`
- [ ] Add conditional logic for different flows
- [ ] Document all OAuth environment variables

### Task 4: Update README Template (1h)

- [ ] Add OAuth setup instructions to `README.md.hbs`
- [ ] Add flow-specific instructions
- [ ] Add troubleshooting section
- [ ] Add security best practices

### Task 5: Update Scaffolder (1h)

**File**: `packages/generator/src/scaffolder.ts`

- [ ] Detect OAuth schemes in ParseResult
- [ ] Pass OAuth info to templates
- [ ] Create `src/auth/` directory when OAuth present
- [ ] Generate OAuth client file
- [ ] Update http-client generation logic

### Task 6: Update Template Data Model (0.5h)

**File**: `packages/generator/src/types.ts`

- [ ] Add OAuth fields to TemplateDataModel
- [ ] Add OAuth flow configuration types
- [ ] Update template context types

### Task 7: Testing (1h)

- [ ] Test OAuth template generation
- [ ] Verify generated code compiles
- [ ] Test with Ozon OAuth spec
- [ ] Test with GitHub OAuth spec
- [ ] Integration tests

---

## Success Metrics

- ✅ Generated OAuth client compiles without errors
- ✅ Generated code passes all quality checks (ESLint, TypeScript)
- ✅ README provides clear OAuth setup instructions
- ✅ .env.example documents all required OAuth variables
- ✅ Templates work for both Client Credentials and Authorization Code flows

---

## Definition of Done

- [ ] OAuth client template created and tested
- [ ] HTTP client template updated with OAuth support
- [ ] .env.example template includes OAuth configuration
- [ ] README template includes OAuth setup instructions
- [ ] Scaffolder updated to generate OAuth files
- [ ] All generated code compiles successfully
- [ ] Integration tests passing
- [ ] Code review completed
- [ ] Documentation updated

---

**Created**: 2025-10-08
**Owner**: Development Team
