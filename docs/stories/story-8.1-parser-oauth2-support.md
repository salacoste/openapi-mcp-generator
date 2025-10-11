# Story 8.1: Parser Enhancement for OAuth 2.0

**Epic**: Epic 8 - OAuth 2.0 Authentication Support
**Status**: PLANNED
**Priority**: P0 (Critical)
**Effort**: 4-6 hours
**Created**: 2025-10-08

---

## User Story

**As a** developer using the OpenAPI-to-MCP generator
**I want** the parser to recognize and extract OAuth 2.0 security schemes
**So that** the generator can produce OAuth-enabled MCP servers

---

## Acceptance Criteria

### Functional Requirements

- [ ] **AC1**: Parser detects OAuth 2.0 security schemes in OpenAPI specs
- [ ] **AC2**: Parser correctly classifies OAuth flow types (clientCredentials, authorizationCode, implicit, password)
- [ ] **AC3**: Parser extracts token endpoint URLs
- [ ] **AC4**: Parser extracts authorization endpoint URLs (when present)
- [ ] **AC5**: Parser extracts and categorizes OAuth scopes
- [ ] **AC6**: Parser detects PKCE requirements in Authorization Code flow
- [ ] **AC7**: Parser handles multiple OAuth schemes in single spec
- [ ] **AC8**: Parser provides validation warnings for invalid OAuth configurations

### Quality Requirements

- [ ] **AC9**: 100% of valid OAuth 2.0 OpenAPI specs parsed correctly
- [ ] **AC10**: Comprehensive unit tests for all OAuth detection logic
- [ ] **AC11**: Type-safe OAuth data structures
- [ ] **AC12**: Clear error messages for malformed OAuth configurations

---

## Technical Design

### 1. OAuth Detection Interface

```typescript
// packages/parser/src/types.ts

export interface OAuth2FlowConfig {
  /** OAuth 2.0 flow type */
  type: 'clientCredentials' | 'authorizationCode' | 'implicit' | 'password';

  /** Token endpoint URL (required for all flows) */
  tokenUrl: string;

  /** Authorization endpoint URL (required for authorizationCode, implicit) */
  authorizationUrl?: string;

  /** Refresh endpoint URL (optional) */
  refreshUrl?: string;

  /** Available scopes with descriptions */
  scopes: Record<string, string>;

  /** PKCE required (for authorizationCode flow) */
  pkce?: boolean;
}

export interface OAuth2SecurityScheme {
  type: 'oauth2';
  classification: 'oauth2';
  supported: true;

  /** Primary OAuth flow */
  primaryFlow: OAuth2FlowConfig;

  /** Additional OAuth flows (if multiple defined) */
  additionalFlows?: OAuth2FlowConfig[];

  /** OpenID Connect discovery URL (if applicable) */
  openIdConnectUrl?: string;
}
```

### 2. OAuth Detection Algorithm

```typescript
// packages/parser/src/oauth-analyzer.ts

/**
 * Analyze OAuth 2.0 security scheme from OpenAPI spec
 */
export function analyzeOAuth2Scheme(
  schemeName: string,
  scheme: any
): OAuth2SecurityScheme | null {
  // Validate it's OAuth 2.0
  if (scheme.type !== 'oauth2') {
    return null;
  }

  // Extract flows
  const flows = scheme.flows || {};
  const flowConfigs: OAuth2FlowConfig[] = [];

  // Client Credentials Flow
  if (flows.clientCredentials) {
    flowConfigs.push({
      type: 'clientCredentials',
      tokenUrl: flows.clientCredentials.tokenUrl,
      refreshUrl: flows.clientCredentials.refreshUrl,
      scopes: flows.clientCredentials.scopes || {},
    });
  }

  // Authorization Code Flow
  if (flows.authorizationCode) {
    flowConfigs.push({
      type: 'authorizationCode',
      tokenUrl: flows.authorizationCode.tokenUrl,
      authorizationUrl: flows.authorizationCode.authorizationUrl,
      refreshUrl: flows.authorizationCode.refreshUrl,
      scopes: flows.authorizationCode.scopes || {},
      pkce: detectPKCERequirement(flows.authorizationCode),
    });
  }

  // Implicit Flow
  if (flows.implicit) {
    flowConfigs.push({
      type: 'implicit',
      authorizationUrl: flows.implicit.authorizationUrl,
      tokenUrl: '', // Implicit doesn't use token endpoint
      scopes: flows.implicit.scopes || {},
    });
  }

  // Password Flow (discouraged but still used)
  if (flows.password) {
    flowConfigs.push({
      type: 'password',
      tokenUrl: flows.password.tokenUrl,
      refreshUrl: flows.password.refreshUrl,
      scopes: flows.password.scopes || {},
    });
  }

  // Validate at least one flow exists
  if (flowConfigs.length === 0) {
    throw new ValidationError(
      `OAuth 2.0 scheme "${schemeName}" has no flows defined`
    );
  }

  // Return OAuth scheme info
  return {
    type: 'oauth2',
    classification: 'oauth2',
    supported: true,
    primaryFlow: flowConfigs[0],
    additionalFlows: flowConfigs.slice(1),
    openIdConnectUrl: scheme.openIdConnectUrl,
  };
}

/**
 * Detect if PKCE is required for Authorization Code flow
 */
function detectPKCERequirement(flow: any): boolean {
  // Check for explicit PKCE extension
  if (flow.extensions && flow.extensions['x-pkce-required']) {
    return flow.extensions['x-pkce-required'];
  }

  // Check description for PKCE mentions
  const description = flow.description || '';
  if (description.toLowerCase().includes('pkce')) {
    return true;
  }

  // Default to false (will be overridden by best practices later)
  return false;
}
```

### 3. Integration with Existing Parser

```typescript
// packages/parser/src/security-extractor.ts (UPDATE)

import { analyzeOAuth2Scheme, OAuth2SecurityScheme } from './oauth-analyzer.js';

export function extractSecuritySchemes(
  spec: OpenAPIDocument
): SecurityAnalysis {
  const schemes: Record<string, SecuritySchemeInfo> = {};

  const securitySchemes = spec.components?.securitySchemes || {};

  for (const [name, scheme] of Object.entries(securitySchemes)) {
    // Try OAuth 2.0 analysis first
    const oauth2Info = analyzeOAuth2Scheme(name, scheme);
    if (oauth2Info) {
      schemes[name] = oauth2Info;
      continue;
    }

    // Fall back to existing analysis (API Key, Bearer, Basic)
    schemes[name] = analyzeSecurityScheme(name, scheme);
  }

  return {
    schemes,
    globalSecurity: extractGlobalSecurity(spec.security, schemes),
  };
}
```

### 4. Validation Rules

```typescript
// packages/parser/src/oauth-validator.ts

export interface OAuthValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate OAuth 2.0 configuration
 */
export function validateOAuthConfig(
  schemeName: string,
  scheme: OAuth2SecurityScheme
): OAuthValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const flow = scheme.primaryFlow;

  // Validate token URL
  if (!flow.tokenUrl && flow.type !== 'implicit') {
    errors.push(`OAuth scheme "${schemeName}": Missing tokenUrl for ${flow.type} flow`);
  }

  // Validate authorization URL
  if ((flow.type === 'authorizationCode' || flow.type === 'implicit') && !flow.authorizationUrl) {
    errors.push(`OAuth scheme "${schemeName}": Missing authorizationUrl for ${flow.type} flow`);
  }

  // Validate URL format
  if (flow.tokenUrl && !isValidUrl(flow.tokenUrl)) {
    errors.push(`OAuth scheme "${schemeName}": Invalid tokenUrl format`);
  }

  if (flow.authorizationUrl && !isValidUrl(flow.authorizationUrl)) {
    errors.push(`OAuth scheme "${schemeName}": Invalid authorizationUrl format`);
  }

  // Security warnings
  if (flow.type === 'implicit') {
    warnings.push(`OAuth scheme "${schemeName}": Implicit flow is deprecated, consider Authorization Code + PKCE`);
  }

  if (flow.type === 'password') {
    warnings.push(`OAuth scheme "${schemeName}": Password flow is discouraged, consider Client Credentials or Authorization Code`);
  }

  if (flow.type === 'authorizationCode' && !flow.pkce) {
    warnings.push(`OAuth scheme "${schemeName}": Consider enabling PKCE for enhanced security`);
  }

  // Check for HTTPS
  if (flow.tokenUrl && !flow.tokenUrl.startsWith('https://')) {
    warnings.push(`OAuth scheme "${schemeName}": Token URL should use HTTPS`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
```

---

## Implementation Tasks

### Task 1: Create OAuth Type Definitions (1h)

**File**: `packages/parser/src/types.ts`

- [ ] Add OAuth2FlowConfig interface
- [ ] Add OAuth2SecurityScheme interface
- [ ] Update SecuritySchemeInfo union type
- [ ] Add OAuth-related enums

### Task 2: Implement OAuth Analyzer (2h)

**File**: `packages/parser/src/oauth-analyzer.ts`

- [ ] Create analyzeOAuth2Scheme function
- [ ] Implement flow detection logic
- [ ] Add PKCE detection
- [ ] Handle multiple flows
- [ ] Add error handling

### Task 3: Implement OAuth Validator (1h)

**File**: `packages/parser/src/oauth-validator.ts`

- [ ] Create validateOAuthConfig function
- [ ] Add URL validation
- [ ] Add security warnings
- [ ] Add best practices checks

### Task 4: Integrate with Security Extractor (0.5h)

**File**: `packages/parser/src/security-extractor.ts`

- [ ] Update extractSecuritySchemes function
- [ ] Add OAuth analysis before fallback
- [ ] Maintain backward compatibility

### Task 5: Add Comprehensive Tests (1.5h)

**File**: `packages/parser/__tests__/oauth-analyzer.test.ts`

- [ ] Test Client Credentials flow detection
- [ ] Test Authorization Code flow detection
- [ ] Test PKCE detection
- [ ] Test multiple flows
- [ ] Test validation rules
- [ ] Test error cases
- [ ] Test real-world OAuth specs (Ozon, GitHub, Google)

---

## Test Cases

### Test Case 1: Client Credentials Flow

```yaml
# Input OpenAPI
securitySchemes:
  oauthClientCreds:
    type: oauth2
    flows:
      clientCredentials:
        tokenUrl: https://oauth.example.com/token
        scopes:
          read: Read access
          write: Write access

# Expected Output
{
  type: 'oauth2',
  classification: 'oauth2',
  supported: true,
  primaryFlow: {
    type: 'clientCredentials',
    tokenUrl: 'https://oauth.example.com/token',
    scopes: {
      read: 'Read access',
      write: 'Write access'
    }
  }
}
```

### Test Case 2: Authorization Code + PKCE

```yaml
# Input OpenAPI
securitySchemes:
  oauthAuthCode:
    type: oauth2
    flows:
      authorizationCode:
        authorizationUrl: https://oauth.example.com/authorize
        tokenUrl: https://oauth.example.com/token
        scopes:
          profile: User profile access
        x-pkce-required: true

# Expected Output
{
  type: 'oauth2',
  classification: 'oauth2',
  supported: true,
  primaryFlow: {
    type: 'authorizationCode',
    authorizationUrl: 'https://oauth.example.com/authorize',
    tokenUrl: 'https://oauth.example.com/token',
    scopes: {
      profile: 'User profile access'
    },
    pkce: true
  }
}
```

### Test Case 3: Real Ozon Performance API

```yaml
# Input (from Ozon OpenAPI spec)
securitySchemes:
  oauth2ClientCredentials:
    type: oauth2
    flows:
      clientCredentials:
        tokenUrl: https://performance.ozon.ru/api/client/token
        scopes: {}

# Expected Output
{
  type: 'oauth2',
  classification: 'oauth2',
  supported: true,
  primaryFlow: {
    type: 'clientCredentials',
    tokenUrl: 'https://performance.ozon.ru/api/client/token',
    scopes: {}
  }
}
```

### Test Case 4: Multiple Flows

```yaml
# Input OpenAPI
securitySchemes:
  oauthMulti:
    type: oauth2
    flows:
      clientCredentials:
        tokenUrl: https://oauth.example.com/token
        scopes:
          api: API access
      authorizationCode:
        authorizationUrl: https://oauth.example.com/authorize
        tokenUrl: https://oauth.example.com/token
        scopes:
          profile: User profile

# Expected Output
{
  type: 'oauth2',
  classification: 'oauth2',
  supported: true,
  primaryFlow: {
    type: 'clientCredentials',
    tokenUrl: 'https://oauth.example.com/token',
    scopes: { api: 'API access' }
  },
  additionalFlows: [{
    type: 'authorizationCode',
    authorizationUrl: 'https://oauth.example.com/authorize',
    tokenUrl: 'https://oauth.example.com/token',
    scopes: { profile: 'User profile' }
  }]
}
```

---

## Success Metrics

- ✅ 100% of valid OAuth 2.0 specs parsed correctly
- ✅ All 4 OAuth flows detected correctly
- ✅ PKCE detection accuracy >95%
- ✅ Zero false positives in OAuth detection
- ✅ Comprehensive test coverage (>95%)

---

## Definition of Done

- [ ] All OAuth type definitions created
- [ ] OAuth analyzer implemented and tested
- [ ] OAuth validator implemented and tested
- [ ] Integration with security extractor complete
- [ ] All test cases passing
- [ ] Real API specs (Ozon, GitHub) parsed correctly
- [ ] Code review completed
- [ ] Documentation updated

---

**Created**: 2025-10-08
**Owner**: Development Team
