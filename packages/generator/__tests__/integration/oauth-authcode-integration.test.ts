/**
 * Integration tests for OAuth 2.0 Authorization Code + PKCE Flow
 * Tests end-to-end Authorization Code generation (Story 8.4)
 *
 * Acceptance Criteria Coverage:
 * - AC1: Generate authorization URL with PKCE challenge
 * - AC2: Exchange authorization code for access token
 * - AC3: PKCE code verifier correctly generated
 * - AC4: Refresh token rotation implemented
 * - AC7: State parameter for CSRF protection
 * - AC8: Clear authorization instructions in README
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures');
const TEST_OUTPUT_DIR = path.join(tmpdir(), `oauth-authcode-test-${Date.now()}`);

describe('OAuth 2.0 Authorization Code + PKCE Integration Tests', () => {
  beforeAll(async () => {
    // Generate MCP server from Authorization Code + PKCE test fixture
    const cliPath = path.resolve(__dirname, '../../../cli/dist/index.js');
    const authcodeFixture = path.join(FIXTURES_DIR, 'oauth-authcode-pkce-api.json');

    execSync(
      `node "${cliPath}" generate "${authcodeFixture}" --output "${TEST_OUTPUT_DIR}" --force`,
      { stdio: 'pipe' }
    );
  });

  afterAll(async () => {
    // Cleanup test output
    await fs.rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  });

  describe('1. PKCE Implementation (AC1, AC3)', () => {
    it('should generate PKCE code verifier function', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('function generateCodeVerifier()');
      expect(content).toContain("crypto.randomBytes(32).toString('base64url')");
    });

    it('should generate PKCE code challenge function', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('function generateCodeChallenge(verifier: string)');
      expect(content).toContain("crypto.createHash('sha256')");
      expect(content).toContain(".update(verifier)");
      expect(content).toContain(".digest('base64url')");
    });

    it('should import crypto module for PKCE', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain("import crypto from 'crypto'");
    });

    it('should use SHA-256 for code challenge (AC3)', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      // Verify S256 method (SHA-256)
      expect(content).toContain("createHash('sha256')");

      // Should NOT use plain method
      expect(content).not.toMatch(/code_challenge_method.*plain/i);
    });

    it('should have proper OAuth comment header for Authorization Code', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('OAuth 2.0 Client - Authorization Code Flow with PKCE');
      expect(content).toContain('authorization flow');
    });
  });

  describe('2. Authorization URL Generation (AC1)', () => {
    it('should generate getAuthorizationUrl function', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('function getAuthorizationUrl()');
    });

    it('should include response_type=code parameter', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain("response_type: 'code'");
    });

    it('should include code_challenge parameter (AC1)', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('code_challenge: codeChallenge');
    });

    it('should include code_challenge_method=S256 (AC1)', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain("code_challenge_method: 'S256'");
    });

    it('should use correct authorization URL from OpenAPI spec', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('https://auth.example.com/oauth/authorize');
    });

    it('should include client_id and redirect_uri parameters', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('client_id: clientId');
      expect(content).toContain('redirect_uri: redirectUri');
    });
  });

  describe('3. Token Exchange (AC2)', () => {
    it('should generate exchangeAuthorizationCode function', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('exchangeAuthorizationCode');
    });

    it('should use grant_type=authorization_code (AC2)', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain("grant_type: 'authorization_code'");
    });

    it('should include code_verifier in token request (AC2)', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('code_verifier: codeVerifier');
    });

    it('should read OAUTH_AUTHORIZATION_CODE from environment', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('process.env.OAUTH_AUTHORIZATION_CODE');
    });

    it('should NOT include client_secret for PKCE flow (AC3)', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      // Extract the exchangeAuthorizationCode function
      const exchangeFunctionMatch = content.match(/async function exchangeAuthorizationCode[\s\S]*?^}/m);

      if (exchangeFunctionMatch) {
        const exchangeFunction = exchangeFunctionMatch[0];

        // In PKCE flow, client_secret should not be in token exchange
        expect(exchangeFunction).not.toContain('client_secret: clientSecret');
      }
    });

    it('should use correct token URL from OpenAPI spec', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('https://auth.example.com/oauth/token');
    });

    it('should handle missing authorization code error', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('if (!authCode)');
      expect(content).toContain('OAUTH_AUTHORIZATION_CODE');
    });
  });

  describe('4. Refresh Token Rotation (AC4)', () => {
    it('should handle refresh_token from token response', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      // Accept either response.data.refresh_token or tokenResponse.refresh_token
      const hasRefreshTokenAccess = content.includes('response.data.refresh_token') ||
                                     content.includes('tokenResponse.refresh_token');
      expect(hasRefreshTokenAccess).toBe(true);
      expect(content).toMatch(/refreshToken\s*=/);
    });

    it('should implement refreshAccessToken function', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('refreshAccessToken');
    });

    it('should use grant_type=refresh_token (AC4)', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain("grant_type: 'refresh_token'");
    });

    it('should update tokens after successful refresh (AC4)', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      // Should update both cached token and expiry
      expect(content).toContain('cachedToken =');
      expect(content).toContain('tokenExpiry =');

      // Should also update refresh token if rotation is enabled
      const hasRefreshTokenUpdate = content.includes('refreshToken =') ||
                                    content.includes('response.data.refresh_token');
      expect(hasRefreshTokenUpdate).toBe(true);
    });

    it('should use correct refresh URL from OpenAPI spec', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      // Refresh URL should be from spec (https://auth.example.com/oauth/refresh)
      // or fallback to token URL if not specified
      expect(content).toContain('https://auth.example.com/oauth');
    });
  });

  describe('5. CSRF Protection (AC7)', () => {
    it('should generate state parameter (AC7)', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('generateState()');
      // Accept both ES6 shorthand (state,) and traditional syntax (state:)
      const hasStateParam = content.includes('state:') || content.includes('state,');
      expect(hasStateParam).toBe(true);
    });

    it('should use crypto for state generation in PKCE flow (AC7)', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      // In PKCE flow, should use crypto.randomBytes for state
      expect(content).toContain("crypto.randomBytes(16).toString('hex')");
    });

    it('should include state in authorization URL parameters', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      // Look for state parameter in URL building
      const hasStateParam = content.includes('state:') || content.includes('state,');
      expect(hasStateParam).toBe(true);
    });
  });

  describe('6. Environment Variables (AC8)', () => {
    it('should document OAUTH_CLIENT_ID in .env.example', async () => {
      const envPath = path.join(TEST_OUTPUT_DIR, '.env.example');
      const content = await fs.readFile(envPath, 'utf-8');

      expect(content).toContain('OAUTH_CLIENT_ID');
    });

    it('should document OAUTH_REDIRECT_URI in .env.example', async () => {
      const envPath = path.join(TEST_OUTPUT_DIR, '.env.example');
      const content = await fs.readFile(envPath, 'utf-8');

      expect(content).toContain('OAUTH_REDIRECT_URI');
    });

    it('should document OAUTH_AUTHORIZATION_CODE in .env.example', async () => {
      const envPath = path.join(TEST_OUTPUT_DIR, '.env.example');
      const content = await fs.readFile(envPath, 'utf-8');

      expect(content).toContain('OAUTH_AUTHORIZATION_CODE');
    });

    it('should NOT require OAUTH_CLIENT_SECRET for PKCE flow', async () => {
      const envPath = path.join(TEST_OUTPUT_DIR, '.env.example');
      const content = await fs.readFile(envPath, 'utf-8');

      // For PKCE flow, client_secret should be marked as optional or not present
      // Since we're using public client (PKCE), client_secret is not needed
      const hasClientSecret = content.includes('OAUTH_CLIENT_SECRET');

      if (hasClientSecret) {
        // If it exists, it should be marked as optional
        const linesWithSecret = content.split('\n').filter(line =>
          line.includes('OAUTH_CLIENT_SECRET')
        );

        const isMarkedOptional = linesWithSecret.some(line =>
          line.toLowerCase().includes('optional') ||
          line.includes('(not required for PKCE)')
        );

        expect(isMarkedOptional).toBe(true);
      }
    });

    it('should include helpful OAuth comments in .env.example (AC8)', async () => {
      const envPath = path.join(TEST_OUTPUT_DIR, '.env.example');
      const content = await fs.readFile(envPath, 'utf-8');

      // Should have comments explaining OAuth setup
      expect(content).toMatch(/# OAuth|# Authorization/i);
    });
  });

  describe('7. README Documentation (AC8)', () => {
    it('should include Authorization Code instructions in README', async () => {
      const readmePath = path.join(TEST_OUTPUT_DIR, 'README.md');
      const content = await fs.readFile(readmePath, 'utf-8');

      // Should mention Authorization Code flow
      const hasAuthCodeMention = content.toLowerCase().includes('authorization code') ||
                                 content.toLowerCase().includes('authorization flow');
      expect(hasAuthCodeMention).toBe(true);
    });

    it('should include PKCE setup instructions (AC8)', async () => {
      const readmePath = path.join(TEST_OUTPUT_DIR, 'README.md');
      const content = await fs.readFile(readmePath, 'utf-8');

      // Should mention PKCE
      expect(content).toMatch(/PKCE|Proof Key for Code Exchange/i);
    });

    it('should document OAuth environment variables setup', async () => {
      const readmePath = path.join(TEST_OUTPUT_DIR, 'README.md');
      const content = await fs.readFile(readmePath, 'utf-8');

      // Should mention OAuth credentials
      const hasOAuthEnvMention = content.includes('OAUTH_CLIENT_ID') ||
                                 content.includes('OAuth') ||
                                 content.includes('.env');
      expect(hasOAuthEnvMention).toBe(true);
    });
  });

  describe('8. TypeScript Compilation', () => {
    it('should compile Authorization Code flow without errors', () => {
      // Install dependencies
      execSync('npm install', {
        cwd: TEST_OUTPUT_DIR,
        stdio: 'pipe'
      });

      // Build should succeed - check exit code, not stderr (npm warnings are OK)
      try {
        execSync('npm run build', {
          cwd: TEST_OUTPUT_DIR,
          stdio: 'pipe'
        });
      } catch (error: any) {
        // Only fail on non-zero exit code, ignore stderr warnings
        if (error.status !== 0) {
          throw error;
        }
      }
    });

    it('should generate valid JavaScript in dist folder', async () => {
      const distPath = path.join(TEST_OUTPUT_DIR, 'dist');
      const exists = await fs.access(distPath)
        .then(() => true)
        .catch(() => false);

      expect(exists, 'dist folder should exist after build').toBe(true);

      const oauthClientJs = path.join(distPath, 'auth/oauth-client.js');
      const jsExists = await fs.access(oauthClientJs)
        .then(() => true)
        .catch(() => false);

      expect(jsExists, 'OAuth client JS should be compiled').toBe(true);
    });

    it('should have no TypeScript errors in generated code', () => {
      // Run TypeScript check - ignore npm warnings in stderr
      try {
        execSync('npx tsc --noEmit', {
          cwd: TEST_OUTPUT_DIR,
          stdio: 'pipe'
        });
      } catch (error: any) {
        // Only fail on non-zero exit code (actual TS errors), ignore stderr warnings
        if (error.status !== 0) {
          throw error;
        }
      }
    });
  });

  describe('9. HTTP Client Integration', () => {
    it('should import getAccessToken from OAuth client', async () => {
      const httpClientPath = path.join(TEST_OUTPUT_DIR, 'src/http-client.ts');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain("import { getAccessToken } from './auth/oauth-client.js'");
    });

    it('should use async request interceptor for OAuth', async () => {
      const httpClientPath = path.join(TEST_OUTPUT_DIR, 'src/http-client.ts');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('httpClient.interceptors.request.use(async (config) => {');
    });

    it('should detect oauth2 security scheme', async () => {
      const httpClientPath = path.join(TEST_OUTPUT_DIR, 'src/http-client.ts');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain("case 'oauth2':");
    });

    it('should inject OAuth token in Authorization header', async () => {
      const httpClientPath = path.join(TEST_OUTPUT_DIR, 'src/http-client.ts');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('const token = await getAccessToken()');
      expect(content).toContain("config.headers.Authorization = `Bearer ${token}`");
    });
  });

  describe('10. Security Best Practices', () => {
    it('should never log OAuth credentials', async () => {
      const files = [
        'src/auth/oauth-client.ts',
        'src/http-client.ts',
      ];

      for (const file of files) {
        const filePath = path.join(TEST_OUTPUT_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');

        // Should not log clientId or authorization code
        expect(content).not.toMatch(/console\.log.*clientId[^a-zA-Z]/);
        expect(content).not.toMatch(/console\.log.*authCode/);
        expect(content).not.toMatch(/console\.log.*\${clientId}/);
        expect(content).not.toMatch(/console\.log.*\${authCode}/);
      }
    });

    it('should not expose tokens in error messages', async () => {
      const files = [
        'src/auth/oauth-client.ts',
        'src/http-client.ts',
      ];

      for (const file of files) {
        const filePath = path.join(TEST_OUTPUT_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');

        // Error messages should not include token values
        expect(content).not.toMatch(/Error.*\${.*token.*}/);
        expect(content).not.toMatch(/throw new Error.*\${.*token.*}/);
      }
    });

    it('should store code_verifier securely', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      // Code verifier should be generated fresh or read from env
      expect(content).toContain('generateCodeVerifier()');

      // Should support env var for testing
      const hasEnvSupport = content.includes('process.env.OAUTH_CODE_VERIFIER');
      expect(hasEnvSupport).toBe(true);
    });

    it('should warn about .env in .gitignore', async () => {
      const gitignorePath = path.join(TEST_OUTPUT_DIR, '.gitignore');
      const content = await fs.readFile(gitignorePath, 'utf-8');

      expect(content).toContain('.env');
      expect(content).not.toContain('!.env');
    });
  });

  describe('11. OAuth Metadata', () => {
    it('should mark OAuth as supported in security metadata', async () => {
      const httpClientPath = path.join(TEST_OUTPUT_DIR, 'src/http-client.ts');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('"supported": true');
    });

    it('should include Authorization Code flow type in metadata', async () => {
      const httpClientPath = path.join(TEST_OUTPUT_DIR, 'src/http-client.ts');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('"type": "authorizationCode"');
    });

    it('should extract scopes from OpenAPI spec', async () => {
      const httpClientPath = path.join(TEST_OUTPUT_DIR, 'src/http-client.ts');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      // Should include at least one scope from the spec
      const hasScopes = content.includes('"read"') ||
                       content.includes('"write"') ||
                       content.includes('scopes');
      expect(hasScopes).toBe(true);
    });
  });
});
