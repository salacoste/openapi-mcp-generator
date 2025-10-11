# Story 8.4: Authorization Code + PKCE Flow Implementation

**Epic**: Epic 8 - OAuth 2.0 Authentication Support
**Status**: PLANNED
**Priority**: P1 (High)
**Effort**: 6-8 hours
**Created**: 2025-10-08
**Depends On**: Story 8.1, Story 8.2, Story 8.3

---

## User Story

**As a** developer integrating with user-facing OAuth APIs
**I want** the generated MCP server to support Authorization Code flow with PKCE
**So that** I can securely authenticate users for APIs like GitHub and Google

---

## Acceptance Criteria

- [ ] **AC1**: Generate authorization URL with PKCE challenge
- [ ] **AC2**: Exchange authorization code for access token
- [ ] **AC3**: PKCE code verifier correctly generated
- [ ] **AC4**: Refresh token rotation implemented
- [ ] **AC5**: Works with GitHub API
- [ ] **AC6**: Works with Google APIs
- [ ] **AC7**: State parameter for CSRF protection
- [ ] **AC8**: Clear authorization instructions in README

---

## Technical Implementation

### Authorization Code Flow with PKCE

```
1. Generate code_verifier (random 43-128 char string)
2. Generate code_challenge = BASE64URL(SHA256(code_verifier))
3. Build authorization URL with:
   - client_id, redirect_uri, scope
   - code_challenge, code_challenge_method=S256
   - state (CSRF protection)
4. User authorizes → Redirect to callback with code
5. Exchange code + code_verifier for tokens
6. Cache access_token + refresh_token
7. Use refresh_token to get new access_token when expired
```

### PKCE Implementation

```typescript
// Generate code verifier (43-128 characters)
const codeVerifier = crypto.randomBytes(64).toString('base64url').slice(0, 128);

// Generate code challenge
const challenge = crypto
  .createHash('sha256')
  .update(codeVerifier)
  .digest('base64url');

// Authorization URL
const authUrl = `${AUTHORIZATION_URL}?${new URLSearchParams({
  response_type: 'code',
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  code_challenge: challenge,
  code_challenge_method: 'S256',
  scope: 'read write',
  state: crypto.randomBytes(16).toString('hex'),
})}`;

// Token exchange
const tokenResponse = await axios.post(TOKEN_URL, {
  grant_type: 'authorization_code',
  code: authorizationCode,
  code_verifier: codeVerifier,
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
});
```

---

## Implementation Tasks

### Task 1: PKCE Generation (2h)
- [ ] Code verifier generation
- [ ] Code challenge calculation
- [ ] State generation for CSRF

### Task 2: Authorization URL (1h)
- [ ] Build authorization URL
- [ ] Add helper CLI command
- [ ] Update README with instructions

### Task 3: Token Exchange (2h)
- [ ] Exchange authorization code for tokens
- [ ] Validate code verifier
- [ ] Cache access + refresh tokens

### Task 4: Refresh Token Rotation (1h)
- [ ] Implement refresh token usage
- [ ] Handle token rotation
- [ ] Update cached tokens

### Task 5: Real API Testing (2h)
- [ ] Test with GitHub API
- [ ] Test with Google APIs
- [ ] Validate PKCE compliance

---

## Test Cases

```typescript
describe('Authorization Code + PKCE Flow', () => {
  it('generates valid PKCE code verifier', () => {
    const verifier = generateCodeVerifier();
    expect(verifier).toHaveLength(128);
    expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('generates correct code challenge', () => {
    const verifier = 'test-verifier';
    const challenge = generateCodeChallenge(verifier);
    expect(challenge).toBe(base64url(sha256('test-verifier')));
  });

  it('builds authorization URL correctly', () => {
    const url = oauth2Client.getAuthorizationUrl();
    expect(url).toContain('response_type=code');
    expect(url).toContain('code_challenge=');
    expect(url).toContain('code_challenge_method=S256');
  });

  it('exchanges code for tokens', async () => {
    process.env.OAUTH_AUTHORIZATION_CODE = 'test-code';
    const token = await oauth2Client.getAccessToken();
    expect(token).toBeTruthy();
  });
});
```

---

## Definition of Done

- [ ] PKCE generation implemented
- [ ] Authorization URL generation working
- [ ] Code exchange working
- [ ] Refresh token rotation working
- [ ] Tested with GitHub and Google APIs
- [ ] Documentation complete

---

**Created**: 2025-10-08
**Owner**: Development Team
