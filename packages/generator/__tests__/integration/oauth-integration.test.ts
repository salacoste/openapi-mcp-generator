/**
 * Integration tests for OAuth 2.0 Client Credentials Flow
 * Tests end-to-end OAuth generation and integration (Epic 8)
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
const TEST_OUTPUT_DIR = path.join(tmpdir(), `oauth-test-${Date.now()}`);

describe('OAuth 2.0 Integration Tests', () => {
  beforeAll(async () => {
    // Generate MCP server from OAuth test API
    const cliPath = path.resolve(__dirname, '../../../cli/dist/index.js');
    const oauthFixture = path.join(FIXTURES_DIR, 'oauth-test-api.json');

    execSync(
      `node "${cliPath}" generate "${oauthFixture}" --output "${TEST_OUTPUT_DIR}" --force`,
      { stdio: 'pipe' }
    );
  });

  afterAll(async () => {
    // Cleanup test output
    await fs.rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  });

  describe('OAuth Client File Generation', () => {
    it('should generate src/auth/oauth-client.ts file', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const exists = await fs.access(oauthClientPath)
        .then(() => true)
        .catch(() => false);

      expect(exists, 'OAuth client file should be generated').toBe(true);
    });

    it('should have proper OAuth client structure', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('OAuth 2.0 Client - Client Credentials Flow');
      expect(content).toContain('export async function getAccessToken()');
      expect(content).toContain('export function clearTokenCache()');
    });

    it('should implement token caching with expiration', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('let cachedToken: string | null = null');
      expect(content).toContain('let tokenExpiry: number = 0');
      expect(content).toContain('if (cachedToken && tokenExpiry > now + 300000)');
    });

    it('should read OAuth credentials from environment variables', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('process.env.OAUTH_CLIENT_ID');
      expect(content).toContain('process.env.OAUTH_CLIENT_SECRET');
    });

    it('should use correct token endpoint from OpenAPI spec', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      // Token URL from oauth-test-api.json
      expect(content).toContain('https://auth.example.com/oauth/token');
    });

    it('should implement Client Credentials grant type', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain("grant_type: 'client_credentials'");
      expect(content).toContain('client_id: clientId');
      expect(content).toContain('client_secret: clientSecret');
    });

    it('should handle token response correctly', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('response.data.access_token');
      expect(content).toContain('response.data.expires_in || 3600');
      expect(content).toContain('tokenExpiry = now + (expiresIn * 1000)');
    });

    it('should include debug logging when DEBUG=true', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain("if (process.env.DEBUG === 'true')");
      expect(content).toContain('[oauth-client] Using cached token');
      expect(content).toContain('[oauth-client] Requesting new access token');
      expect(content).toContain('[oauth-client] Token obtained');
    });

    it('should have comprehensive error handling', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      // Missing credentials
      expect(content).toContain('OAuth2 credentials missing');
      expect(content).toContain('Please set OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET');

      // Token fetch errors
      expect(content).toContain('catch (error: any)');
      expect(content).toContain('error.response?.data?.error_description');
      expect(content).toContain('OAuth2 authentication failed');

      // Missing access token
      expect(content).toContain('if (!accessToken)');
      expect(content).toContain('No access_token in OAuth2 response');
    });

    it('should use proper Content-Type header', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain("'Content-Type': 'application/x-www-form-urlencoded'");
    });

    it('should have clearTokenCache function for testing', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('export function clearTokenCache()');
      expect(content).toContain('cachedToken = null');
      expect(content).toContain('tokenExpiry = 0');
    });
  });

  describe('HTTP Client OAuth Integration', () => {
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

    it('should detect OAuth2 security scheme', async () => {
      const httpClientPath = path.join(TEST_OUTPUT_DIR, 'src/http-client.ts');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain("case 'oauth2':");
      expect(content).toContain('OAuth2 authentication with automatic token management');
    });

    it('should call getAccessToken in OAuth case', async () => {
      const httpClientPath = path.join(TEST_OUTPUT_DIR, 'src/http-client.ts');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('const token = await getAccessToken()');
      expect(content).toContain("config.headers.Authorization = `Bearer ${token}`");
    });

    it('should handle OAuth authentication errors', async () => {
      const httpClientPath = path.join(TEST_OUTPUT_DIR, 'src/http-client.ts');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('try {');
      expect(content).toContain('catch (error: any) {');
      expect(content).toContain('[http-client] OAuth authentication error');
      expect(content).toContain('throw error');
    });

    it('should have 401 response interceptor for token refresh', async () => {
      const httpClientPath = path.join(TEST_OUTPUT_DIR, 'src/http-client.ts');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('httpClient.interceptors.response.use');
      expect(content).toContain('error.response?.status === 401');
      expect(content).toContain('!originalRequest._retry');
      expect(content).toContain('originalRequest._retry = true');
    });

    it('should retry request after token refresh', async () => {
      const httpClientPath = path.join(TEST_OUTPUT_DIR, 'src/http-client.ts');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('const token = await getAccessToken()');
      expect(content).toContain("originalRequest.headers.Authorization = `Bearer ${token}`");
      expect(content).toContain('return httpClient(originalRequest)');
    });

    it('should handle token refresh failures', async () => {
      const httpClientPath = path.join(TEST_OUTPUT_DIR, 'src/http-client.ts');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('catch (refreshError: any)');
      expect(content).toContain('[http-client] Token refresh failed');
    });
  });

  describe('TypeScript Compilation', () => {
    it('should compile generated OAuth code without errors', () => {
      // Install dependencies and build
      execSync('npm install', {
        cwd: TEST_OUTPUT_DIR,
        stdio: 'pipe'
      });

      expect(() => {
        execSync('npm run build', {
          cwd: TEST_OUTPUT_DIR,
          stdio: 'pipe'
        });
      }).not.toThrow();
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
  });

  describe('Environment Variable Configuration', () => {
    it('should document OAuth credentials in .env.example', async () => {
      const envExamplePath = path.join(TEST_OUTPUT_DIR, '.env.example');
      const content = await fs.readFile(envExamplePath, 'utf-8');

      expect(content).toContain('OAUTH_CLIENT_ID');
      expect(content).toContain('OAUTH_CLIENT_SECRET');
      expect(content).toContain('Client Credentials flow');
    });

    it('should have helpful comments in .env.example', async () => {
      const envExamplePath = path.join(TEST_OUTPUT_DIR, '.env.example');
      const content = await fs.readFile(envExamplePath, 'utf-8');

      expect(content).toContain('# OAuth');
      expect(content).toContain('REQUIRED');
    });
  });

  describe('Package Dependencies', () => {
    it('should include axios in dependencies', async () => {
      const packageJsonPath = path.join(TEST_OUTPUT_DIR, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);

      expect(pkg.dependencies).toHaveProperty('axios');
    });

    it('should include dotenv in dependencies', async () => {
      const packageJsonPath = path.join(TEST_OUTPUT_DIR, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);

      expect(pkg.dependencies).toHaveProperty('dotenv');
    });
  });

  describe('Security Best Practices', () => {
    it('should never log actual OAuth credentials', async () => {
      const files = [
        'src/auth/oauth-client.ts',
        'src/http-client.ts',
      ];

      for (const file of files) {
        const filePath = path.join(TEST_OUTPUT_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');

        // Should not log clientId or clientSecret values
        expect(content).not.toMatch(/console\.log.*clientId[^a-zA-Z]/);
        expect(content).not.toMatch(/console\.log.*clientSecret/);
        expect(content).not.toMatch(/console\.log.*\${clientId}/);
        expect(content).not.toMatch(/console\.log.*\${clientSecret}/);

        // Should not log access token
        expect(content).not.toMatch(/console\.log.*accessToken/);
        expect(content).not.toMatch(/console\.log.*\${.*token.*}/);
      }
    });

    it('should use console.error for debug logs, not console.log', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      // All debug logging should use console.error
      expect(content).toContain('console.error(');
      expect(content).not.toContain('console.log(');
    });

    it('should not expose token in error messages', async () => {
      const files = [
        'src/auth/oauth-client.ts',
        'src/http-client.ts',
      ];

      for (const file of files) {
        const filePath = path.join(TEST_OUTPUT_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');

        // Error messages should not include token values
        expect(content).not.toMatch(/Error.*\${.*token.*}/);
      }
    });

    it('should warn about .env file in .gitignore', async () => {
      const gitignorePath = path.join(TEST_OUTPUT_DIR, '.gitignore');
      const content = await fs.readFile(gitignorePath, 'utf-8');

      expect(content).toContain('.env');
      expect(content).not.toContain('!.env');
    });
  });

  describe('OAuth Metadata Extraction', () => {
    it('should extract primaryFlow from OpenAPI spec', async () => {
      const httpClientPath = path.join(TEST_OUTPUT_DIR, 'src/http-client.ts');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      // Check that metadata includes primaryFlow
      expect(content).toContain('"primaryFlow"');
      expect(content).toContain('"type": "clientCredentials"');
    });

    it('should extract token URL from flow metadata', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('https://auth.example.com/oauth/token');
    });

    it('should mark OAuth as supported in security schemes', async () => {
      const httpClientPath = path.join(TEST_OUTPUT_DIR, 'src/http-client.ts');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('"supported": true');
    });
  });

  describe('Request Flow Integration', () => {
    it('should have complete OAuth flow', async () => {
      // 1. OAuth client fetches token
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const oauthContent = await fs.readFile(oauthClientPath, 'utf-8');
      expect(oauthContent).toContain('export async function getAccessToken()');

      // 2. HTTP client imports OAuth client
      const httpClientPath = path.join(TEST_OUTPUT_DIR, 'src/http-client.ts');
      const httpContent = await fs.readFile(httpClientPath, 'utf-8');
      expect(httpContent).toContain("import { getAccessToken }");

      // 3. Request interceptor calls getAccessToken
      expect(httpContent).toContain('const token = await getAccessToken()');

      // 4. Token added to Authorization header
      expect(httpContent).toContain("config.headers.Authorization = `Bearer ${token}`");

      // 5. Response interceptor handles 401
      expect(httpContent).toContain('error.response?.status === 401');
    });
  });

  describe('Token Lifecycle Management', () => {
    it('should implement 5-minute cache buffer', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      // 5 minutes = 300000 milliseconds
      expect(content).toContain('now + 300000');
    });

    it('should calculate expiry from expires_in', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('expiresIn * 1000');
      expect(content).toContain('now + (expiresIn * 1000)');
    });

    it('should default to 1 hour expiry', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('expires_in || 3600');
    });

    it('should clear cache on clearTokenCache', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('export function clearTokenCache()');
      expect(content).toContain('cachedToken = null');
      expect(content).toContain('tokenExpiry = 0');
    });
  });

  describe('Error Messages and User Guidance', () => {
    it('should provide clear missing credentials error', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('OAuth2 credentials missing');
      expect(content).toContain('Please set OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET in your .env file');
    });

    it('should include error_description from OAuth server', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('error.response?.data?.error_description');
    });

    it('should have descriptive error prefix', async () => {
      const oauthClientPath = path.join(TEST_OUTPUT_DIR, 'src/auth/oauth-client.ts');
      const content = await fs.readFile(oauthClientPath, 'utf-8');

      expect(content).toContain('[oauth-client]');
    });
  });
});
