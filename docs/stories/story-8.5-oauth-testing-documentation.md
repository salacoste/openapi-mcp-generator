# Story 8.5: OAuth 2.0 Testing and Documentation

**Epic**: Epic 8 - OAuth 2.0 Authentication Support
**Status**: PLANNED
**Priority**: P1 (High)
**Effort**: 5-7 hours
**Created**: 2025-10-08
**Depends On**: Story 8.1, 8.2, 8.3, 8.4

---

## User Story

**As a** developer using OAuth-enabled MCP servers
**I want** comprehensive tests and documentation
**So that** I can confidently use and troubleshoot OAuth functionality

---

## Acceptance Criteria

- [ ] **AC1**: 95%+ test coverage for all OAuth code paths
- [ ] **AC2**: Integration tests with real APIs (Ozon, GitHub, Google)
- [ ] **AC3**: OAuth troubleshooting guide created
- [ ] **AC4**: Security best practices documented
- [ ] **AC5**: Example OAuth specs in test fixtures
- [ ] **AC6**: CI/CD pipeline includes OAuth tests
- [ ] **AC7**: Performance benchmarks for token operations

---

## Testing Strategy

### Unit Tests

```typescript
// packages/parser/__tests__/oauth-analyzer.test.ts
- OAuth scheme detection (all 4 flows)
- PKCE detection
- Scope parsing
- URL validation
- Error handling

// packages/generator/__tests__/oauth-template.test.ts
- Template generation with OAuth
- OAuth client code generation
- Environment variable generation
- README generation
```

### Integration Tests

```typescript
// packages/generator/__tests__/integration/oauth-integration.test.ts
describe('OAuth Integration', () => {
  it('generates working Ozon MCP server', async () => {
    await generateMCPServer({
      openApiPath: 'fixtures/ozon-api.json',
      outputDir: 'test-output/ozon-oauth',
    });

    // Verify OAuth files generated
    expect(existsSync('test-output/ozon-oauth/src/auth/oauth-client.ts')).toBe(true);

    // Build and test
    execSync('npm install && npm run build', { cwd: 'test-output/ozon-oauth' });

    // Test token acquisition
    const { oauth2Client } = require('test-output/ozon-oauth/dist/auth/oauth-client.js');
    const token = await oauth2Client.getAccessToken();
    expect(token).toBeTruthy();
  });
});
```

### Real API Tests

```typescript
// __tests__/real-apis/ozon.test.ts
test('Ozon Performance API OAuth', async () => {
  // Requires real credentials in CI secrets
  const token = await oauth2Client.getAccessToken();
  const response = await httpClient.get('/campaigns');
  expect(response.status).toBe(200);
});

// __tests__/real-apis/github.test.ts
test('GitHub API OAuth', async () => {
  // Test Authorization Code + PKCE
});

// __tests__/real-apis/google.test.ts
test('Google APIs OAuth', async () => {
  // Test Authorization Code + PKCE
});
```

---

## Documentation Tasks

### Task 1: OAuth Troubleshooting Guide (2h)

**File**: `docs/guides/oauth-troubleshooting.md`

```markdown
# OAuth 2.0 Troubleshooting Guide

## Common Issues

### "Missing OAuth credentials" Error
**Cause**: Environment variables not set
**Solution**:
1. Check `.env` file exists
2. Verify `OAUTH_CLIENT_ID` and `OAUTH_CLIENT_SECRET` are set
3. Ensure no extra spaces or quotes

### "Token refresh failed" Error
**Cause**: Network issue or invalid credentials
**Solution**:
1. Enable debug logging: `DEBUG=true npm start`
2. Check token endpoint is reachable
3. Verify credentials are correct and not expired
4. Check API rate limits

### Token Expiration Issues
**Cause**: Clock skew or caching issues
**Solution**:
1. Clear token cache: `oauth2Client.clearCache()`
2. Check system clock is synchronized
3. Verify `expires_in` value in token response
```

### Task 2: Security Best Practices (1h)

**File**: `docs/guides/oauth-security.md`

- Secure credential storage
- Token encryption at rest
- PKCE for public clients
- Scope limitation principles
- Regular credential rotation
- Monitoring and alerting

### Task 3: Update Main README (1h)

- Add OAuth support badge
- Link to OAuth examples
- Quick start for OAuth APIs
- Supported flows table

### Task 4: Create OAuth Examples (1h)

**Files**:
- `examples/oauth-client-credentials/` - Ozon example
- `examples/oauth-authorization-code/` - GitHub example
- `examples/oauth-pkce/` - Google example

---

## Test Coverage Goals

- Parser OAuth detection: 100%
- OAuth client generation: 95%
- Client Credentials flow: 95%
- Authorization Code flow: 95%
- Token management: 95%
- Error handling: 90%

---

## Performance Benchmarks

```typescript
// OAuth performance tests
benchmark('Token acquisition', () => {
  await oauth2Client.getAccessToken();
  // Target: <500ms
});

benchmark('Token cache hit', () => {
  await oauth2Client.getAccessToken(); // cached
  // Target: <5ms
});

benchmark('Token refresh', () => {
  await oauth2Client.refreshToken();
  // Target: <500ms
});
```

---

## CI/CD Integration

```yaml
# .github/workflows/test.yml
- name: Test OAuth with real APIs
  env:
    OZON_CLIENT_ID: ${{ secrets.OZON_CLIENT_ID }}
    OZON_CLIENT_SECRET: ${{ secrets.OZON_CLIENT_SECRET }}
    GITHUB_OAUTH_TOKEN: ${{ secrets.GITHUB_OAUTH_TOKEN }}
  run: pnpm test:oauth
```

---

## Definition of Done

- [ ] All unit tests written and passing
- [ ] Integration tests with real APIs passing
- [ ] Test coverage ≥95%
- [ ] Troubleshooting guide complete
- [ ] Security best practices documented
- [ ] Main README updated
- [ ] OAuth examples created
- [ ] CI/CD includes OAuth tests
- [ ] Performance benchmarks met

---

**Created**: 2025-10-08
**Owner**: Development Team
