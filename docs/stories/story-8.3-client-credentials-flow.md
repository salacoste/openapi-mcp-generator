# Story 8.3: Client Credentials Flow Implementation

**Epic**: Epic 8 - OAuth 2.0 Authentication Support
**Status**: PLANNED
**Priority**: P0 (Critical)
**Effort**: 4-6 hours
**Created**: 2025-10-08
**Depends On**: Story 8.1, Story 8.2

---

## User Story

**As a** developer integrating with API-to-API OAuth services
**I want** the generated MCP server to automatically handle Client Credentials flow
**So that** I can focus on using the API without managing tokens manually

---

## Acceptance Criteria

- [ ] **AC1**: Generated server automatically requests access token on startup
- [ ] **AC2**: Token is cached and reused until near expiration
- [ ] **AC3**: Token automatically refreshes 60s before expiration
- [ ] **AC4**: Works with Ozon Performance API (real-world validation)
- [ ] **AC5**: Handles token request failures gracefully
- [ ] **AC6**: Retries token requests with exponential backoff
- [ ] **AC7**: Clear error messages for configuration issues
- [ ] **AC8**: Debug logging shows token lifecycle events

---

## Technical Implementation

### Client Credentials Flow Sequence

```
1. Server starts → Check for cached valid token
2. No valid token → Request new token from OAuth server
3. OAuth server validates client_id + client_secret
4. OAuth server returns access_token + expires_in
5. Cache token with expiration timestamp
6. For each API request:
   - Check if token still valid
   - If expiring soon (<60s), refresh
   - Add token to Authorization header
```

### Ozon Performance API Integration

```typescript
// Test with real Ozon API
const OZON_TOKEN_URL = 'https://performance.ozon.ru/api/client/token';
const OZON_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const OZON_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;

// Token request
POST https://performance.ozon.ru/api/client/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id={OZON_CLIENT_ID}
&client_secret={OZON_CLIENT_SECRET}

// Expected response
{
  "access_token": "eyJhbGciOi...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

---

## Implementation Tasks

### Task 1: Implement Token Request (2h)

- [ ] Create token request function with proper error handling
- [ ] Add retry logic with exponential backoff (3 retries)
- [ ] Validate response structure
- [ ] Extract and cache access token
- [ ] Calculate expiration timestamp

### Task 2: Implement Token Caching (1h)

- [ ] Create in-memory token cache
- [ ] Add expiration checking
- [ ] Implement token refresh logic
- [ ] Add cache invalidation on errors

### Task 3: Test with Ozon API (2h)

- [ ] Generate MCP server for Ozon Performance API
- [ ] Configure OAuth credentials
- [ ] Test token acquisition
- [ ] Test token refresh
- [ ] Test API calls with token
- [ ] Verify token expiration handling

### Task 4: Error Handling (1h)

- [ ] Handle invalid credentials (401)
- [ ] Handle network errors
- [ ] Handle malformed responses
- [ ] Add retry logic
- [ ] Clear error messages

---

## Test Cases

```typescript
describe('Client Credentials Flow', () => {
  it('should fetch access token on first request', async () => {
    const token = await oauth2Client.getAccessToken();
    expect(token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
  });

  it('should cache and reuse valid token', async () => {
    const token1 = await oauth2Client.getAccessToken();
    const token2 = await oauth2Client.getAccessToken();
    expect(token1).toBe(token2);
  });

  it('should refresh token near expiration', async () => {
    // Set token to expire in 30s
    oauth2Client['tokenCache'] = {
      accessToken: 'old-token',
      expiresAt: Date.now() + 30000,
    };

    const token = await oauth2Client.getAccessToken();
    expect(token).not.toBe('old-token');
  });

  it('should handle invalid credentials', async () => {
    process.env.OAUTH_CLIENT_SECRET = 'invalid';
    await expect(oauth2Client.getAccessToken()).rejects.toThrow('OAuth token refresh failed');
  });

  it('should work with Ozon Performance API', async () => {
    // Real API test with actual credentials
    const token = await oauth2Client.getAccessToken();
    expect(token).toBeTruthy();

    // Use token to make API call
    const response = await httpClient.get('/campaigns');
    expect(response.status).toBe(200);
  });
});
```

---

## Success Metrics

- ✅ Token acquisition success rate >99%
- ✅ Token cached reduces requests by >90%
- ✅ Automatic refresh prevents auth failures
- ✅ Works with real Ozon Performance API
- ✅ Clear errors guide user to fix issues

---

## Definition of Done

- [ ] Client Credentials flow implemented
- [ ] Token caching working
- [ ] Automatic refresh working
- [ ] Tested with Ozon Performance API
- [ ] All tests passing
- [ ] Error handling comprehensive
- [ ] Code review completed

---

**Created**: 2025-10-08
**Owner**: Development Team
