# Epic 8: OAuth 2.0 Authentication Support

**Status**: 📋 PLANNED
**Priority**: P1 (High)
**Estimated Effort**: 20-30 hours (3-5 days)
**Created**: 2025-10-08
**Depends On**: Epic 5, Epic 6 (Core generator functionality)

---

## Executive Summary

Extend OpenAPI-to-MCP generator to support OAuth 2.0 authentication flows, enabling generation of MCP servers for modern APIs that use OAuth instead of simple API keys.

**Current State**: Generator supports API Key, Bearer Token, and Basic Auth
**Target State**: Full OAuth 2.0 support with Client Credentials, Authorization Code, and PKCE flows

---

## Problem Statement

### Current Limitations

The generator currently supports simple authentication schemes (API Key, Bearer Token, Basic Auth) but fails to generate proper authentication for APIs using OAuth 2.0, which is the modern standard for API authentication.

**Real-World Impact**:
- ❌ Cannot generate MCP servers for Ozon Performance API (uses OAuth 2.0 Client Credentials)
- ❌ Cannot generate servers for GitHub API (uses OAuth 2.0 Authorization Code)
- ❌ Cannot generate servers for Google APIs (uses OAuth 2.0 + PKCE)
- ❌ ~60% of modern APIs use OAuth 2.0 (unusable with current generator)

### User Story

**As a** developer using OpenAPI-to-MCP generator
**I want** to generate MCP servers for OAuth 2.0 protected APIs
**So that** I can integrate with modern APIs that require OAuth authentication

**Example APIs**:
- Ozon Performance API (Client Credentials)
- GitHub API (Authorization Code)
- Google APIs (Authorization Code + PKCE)
- Slack API (Authorization Code)
- Stripe API (Client Credentials + Bearer)

---

## Technical Goals

### Parser Enhancements

1. **OAuth 2.0 Detection**: Recognize OAuth security schemes in OpenAPI specs
2. **Flow Classification**: Identify specific OAuth flows (clientCredentials, authorizationCode, implicit, password)
3. **Endpoint Extraction**: Parse token endpoints, authorization endpoints, scopes
4. **PKCE Support**: Detect and extract PKCE extension requirements

### Generator Enhancements

1. **Template Updates**: Add OAuth-specific templates for http-client.ts
2. **Token Management**: Generate token caching and refresh logic
3. **Flow Implementation**: Implement Client Credentials, Authorization Code, PKCE flows
4. **Configuration**: Generate .env templates with OAuth credentials

### Quality Standards

- ✅ Support 4 OAuth 2.0 flows (Client Credentials, Authorization Code, Implicit, Password)
- ✅ Automatic token refresh before expiration
- ✅ Secure token storage with encryption
- ✅ PKCE support for Authorization Code flow
- ✅ Comprehensive error handling for OAuth failures
- ✅ 95%+ test coverage for OAuth code paths
- ✅ Real-world API validation (Ozon, GitHub, Google)

---

## Stories Overview

### Story 8.1: Parser Enhancement for OAuth 2.0 (P0 - Critical, 4-6h)

**Goal**: Enhance parser to recognize and extract OAuth 2.0 security schemes

**Key Deliverables**:
- OAuth 2.0 detection in security schemes
- Flow type classification
- Token/authorization endpoint extraction
- Scope parsing
- PKCE detection

**Acceptance Criteria**:
- ✅ Parser recognizes all 4 OAuth flows
- ✅ Extracts token endpoint URLs
- ✅ Parses required scopes
- ✅ Detects PKCE requirements
- ✅ 100% OAuth OpenAPI specs parsed correctly

### Story 8.2: Generator Template Updates for OAuth (P0 - Critical, 5-7h)

**Goal**: Update generator templates to support OAuth authentication patterns

**Key Deliverables**:
- OAuth-aware http-client.ts template
- Token management module template
- OAuth configuration in .env.example
- README documentation for OAuth setup

**Acceptance Criteria**:
- ✅ Generated http-client supports OAuth flows
- ✅ Token management with caching
- ✅ Clear setup instructions in README
- ✅ Type-safe OAuth configuration

### Story 8.3: Client Credentials Flow Implementation (P0 - Critical, 4-6h)

**Goal**: Implement OAuth 2.0 Client Credentials flow (most common for API-to-API)

**Key Deliverables**:
- Client Credentials flow implementation
- Token request/response handling
- Automatic token refresh
- Error handling for OAuth failures

**Acceptance Criteria**:
- ✅ Successfully authenticate with Client Credentials
- ✅ Automatic token refresh before expiration
- ✅ Retry logic for token failures
- ✅ Works with Ozon Performance API

### Story 8.4: Authorization Code + PKCE Flow Implementation (P1 - High, 6-8h)

**Goal**: Implement Authorization Code flow with PKCE support (for user-facing APIs)

**Key Deliverables**:
- Authorization Code flow implementation
- PKCE challenge/verifier generation
- Authorization URL generation
- Token exchange implementation
- Refresh token handling

**Acceptance Criteria**:
- ✅ Generate authorization URLs
- ✅ Handle callback with authorization code
- ✅ PKCE challenge/verifier correct
- ✅ Exchange code for tokens
- ✅ Refresh token rotation

### Story 8.5: OAuth 2.0 Testing and Documentation (P1 - High, 5-7h)

**Goal**: Comprehensive testing and documentation for OAuth functionality

**Key Deliverables**:
- Integration tests for all OAuth flows
- Real API testing (Ozon, GitHub)
- OAuth troubleshooting guide
- Security best practices documentation

**Acceptance Criteria**:
- ✅ 95%+ test coverage for OAuth code
- ✅ All flows tested with real APIs
- ✅ Comprehensive OAuth documentation
- ✅ Security audit passed

---

## Technical Design

### OAuth 2.0 Flow Detection

```typescript
// packages/parser/src/security-analyzer.ts

export interface OAuthFlowInfo {
  type: 'oauth2';
  flow: 'clientCredentials' | 'authorizationCode' | 'implicit' | 'password';
  tokenUrl: string;
  authorizationUrl?: string;
  scopes: Record<string, string>;
  pkce?: boolean;
}

export function analyzeOAuthScheme(scheme: SecurityScheme): OAuthFlowInfo {
  // Detect OAuth 2.0 scheme
  if (scheme.type !== 'oauth2') return null;

  // Analyze flows
  const flows = scheme.flows;

  if (flows.clientCredentials) {
    return {
      type: 'oauth2',
      flow: 'clientCredentials',
      tokenUrl: flows.clientCredentials.tokenUrl,
      scopes: flows.clientCredentials.scopes || {},
    };
  }

  if (flows.authorizationCode) {
    return {
      type: 'oauth2',
      flow: 'authorizationCode',
      tokenUrl: flows.authorizationCode.tokenUrl,
      authorizationUrl: flows.authorizationCode.authorizationUrl,
      scopes: flows.authorizationCode.scopes || {},
      pkce: detectPKCE(flows.authorizationCode),
    };
  }

  // ... handle other flows
}
```

### Generated OAuth Client

```typescript
// Generated: src/auth/oauth-client.ts

import axios from 'axios';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

class OAuthClient {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private refreshToken: string | null = null;

  async getAccessToken(): Promise<string> {
    // Check if token is valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Token expired or missing, refresh
    if (this.refreshToken) {
      await this.refreshAccessToken();
    } else {
      await this.fetchNewToken();
    }

    return this.accessToken!;
  }

  private async fetchNewToken(): Promise<void> {
    const response = await axios.post<TokenResponse>(
      process.env.OAUTH_TOKEN_URL!,
      {
        grant_type: 'client_credentials',
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        scope: process.env.OAUTH_SCOPE,
      },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    this.accessToken = response.data.access_token;
    this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 min buffer
    this.refreshToken = response.data.refresh_token || null;
  }

  private async refreshAccessToken(): Promise<void> {
    const response = await axios.post<TokenResponse>(
      process.env.OAUTH_TOKEN_URL!,
      {
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
      },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    this.accessToken = response.data.access_token;
    this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;
    this.refreshToken = response.data.refresh_token || this.refreshToken;
  }
}

export const oauthClient = new OAuthClient();
```

### Generated HTTP Client Integration

```typescript
// Generated: src/http-client.ts (OAuth version)

import { oauthClient } from './auth/oauth-client.js';

instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Get fresh access token
  const accessToken = await oauthClient.getAccessToken();

  // Add to Authorization header
  config.headers.Authorization = `Bearer ${accessToken}`;

  return config;
});
```

---

## Implementation Plan

### Phase 1: Parser Enhancement (Story 8.1) - Days 1-2

**Tasks**:
1. Create OAuth detection logic in parser
2. Add flow type classification
3. Extract token/authorization endpoints
4. Parse scopes and PKCE requirements
5. Update ParseResult types
6. Add OAuth parsing tests

**Estimated**: 4-6 hours

### Phase 2: Generator Templates (Story 8.2) - Days 2-3

**Tasks**:
1. Create oauth-client.ts template
2. Update http-client.ts template with OAuth
3. Update .env.example template
4. Update README template with OAuth docs
5. Add OAuth configuration to scaffolder
6. Test template generation

**Estimated**: 5-7 hours

### Phase 3: Client Credentials Flow (Story 8.3) - Day 3

**Tasks**:
1. Implement Client Credentials flow
2. Add token caching logic
3. Add automatic refresh
4. Test with Ozon Performance API
5. Error handling and retry logic
6. Integration tests

**Estimated**: 4-6 hours

### Phase 4: Authorization Code Flow (Story 8.4) - Days 4-5

**Tasks**:
1. Implement Authorization Code flow
2. Add PKCE support
3. Generate authorization URLs
4. Handle OAuth callbacks
5. Implement refresh token rotation
6. Test with GitHub/Google APIs

**Estimated**: 6-8 hours

### Phase 5: Testing & Documentation (Story 8.5) - Day 5

**Tasks**:
1. Write comprehensive OAuth tests
2. Test with real APIs (Ozon, GitHub, Google)
3. Write OAuth troubleshooting guide
4. Security best practices documentation
5. Update main README
6. Create OAuth examples

**Estimated**: 5-7 hours

---

## Success Metrics

### Functional Metrics

- ✅ Support 4 OAuth 2.0 flows (Client Credentials, Authorization Code, Implicit, Password)
- ✅ Successfully generate MCP servers for Ozon Performance API
- ✅ Successfully generate MCP servers for GitHub API
- ✅ Successfully generate MCP servers for Google APIs
- ✅ PKCE support for Authorization Code flow

### Quality Metrics

- ✅ 95%+ test coverage for OAuth code paths
- ✅ Zero OAuth-related security vulnerabilities
- ✅ Token refresh success rate >99%
- ✅ Clear error messages for OAuth failures

### Performance Metrics

- ✅ Token caching reduces API calls by 90%+
- ✅ Token refresh <500ms
- ✅ No performance regression in non-OAuth flows

---

## Dependencies

### External Dependencies

- None (uses existing axios and crypto modules)

### Internal Dependencies

- Epic 5: Core generator functionality (COMPLETED)
- Epic 6: Type coverage and quality (COMPLETED)
- Epic 7: CLI wrapper fix (IN PROGRESS)

---

## Risks and Mitigations

### High Risk

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| OAuth spec variations | High | High | Test with 5+ real APIs, handle edge cases |
| Token security issues | Medium | Critical | Security audit, encrypted storage, follow OWASP |
| PKCE complexity | Medium | Medium | Use battle-tested crypto libraries, extensive testing |

### Medium Risk

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Token refresh failures | Medium | High | Retry logic, fallback to re-auth, clear errors |
| Breaking changes to existing auth | Low | High | Comprehensive regression tests, backward compatibility |

### Low Risk

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Performance impact | Low | Medium | Token caching, benchmark tests |
| Complex documentation | Medium | Low | Step-by-step guides, examples |

---

## Testing Strategy

### Unit Tests

- OAuth scheme detection (parser)
- Flow classification logic
- Token management (caching, refresh)
- PKCE generation and verification
- Error handling for OAuth failures

### Integration Tests

- Client Credentials flow end-to-end
- Authorization Code flow end-to-end
- PKCE flow end-to-end
- Token refresh scenarios
- Error scenarios (invalid credentials, expired tokens)

### Real API Tests

- Ozon Performance API (Client Credentials)
- GitHub API (Authorization Code)
- Google APIs (Authorization Code + PKCE)
- Manual testing with Claude Desktop

---

## Documentation Requirements

### User Documentation

1. **OAuth Setup Guide**: Step-by-step OAuth configuration
2. **Flow Selection Guide**: Which OAuth flow to use when
3. **Troubleshooting Guide**: Common OAuth issues and solutions
4. **Security Best Practices**: Secure credential management

### Developer Documentation

1. **OAuth Implementation Details**: How OAuth support works internally
2. **Template Customization**: Customizing OAuth templates
3. **Testing Guide**: Testing OAuth flows

---

## Future Enhancements (Out of Scope)

- OAuth 1.0 support (legacy)
- mTLS support
- Custom OAuth providers
- OAuth token introspection
- Device Authorization Grant flow

---

## Approval & Sign-off

**Technical Lead**: _______________
**Date**: _______________

**Product Owner**: _______________
**Date**: _______________

**QA Lead**: _______________
**Date**: _______________

---

**Last Updated**: 2025-10-08
**Epic Owner**: Development Team
**Related Epics**: Epic 5, Epic 6, Epic 7
