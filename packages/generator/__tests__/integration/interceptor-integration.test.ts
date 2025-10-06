/**
 * Integration tests for Request Interceptor Architecture
 * Tests interceptor template integration with HTTP client
 */

import { describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.resolve(__dirname, '../../../templates/mcp-server');

describe('Interceptor Architecture Integration', () => {
  describe('Template File Structure', () => {
    it('should have interceptors directory', async () => {
      const interceptorsDir = path.join(TEMPLATES_DIR, 'interceptors');
      const exists = await fs
        .access(interceptorsDir)
        .then(() => true)
        .catch(() => false);

      expect(exists, 'interceptors directory should exist').toBe(true);
    });

    it('should have auth interceptor template', async () => {
      const authInterceptorPath = path.join(TEMPLATES_DIR, 'interceptors', 'auth.ts.hbs');
      const exists = await fs
        .access(authInterceptorPath)
        .then(() => true)
        .catch(() => false);

      expect(exists, 'auth.ts.hbs should exist').toBe(true);
    });
  });

  describe('Auth Interceptor Template Content', () => {
    it('should export createAuthInterceptor function', async () => {
      const authInterceptorPath = path.join(TEMPLATES_DIR, 'interceptors', 'auth.ts.hbs');
      const content = await fs.readFile(authInterceptorPath, 'utf-8');

      expect(content).toContain('export function createAuthInterceptor');
      expect(content).toContain('config: ServerConfig');
    });

    it('should export createAuthErrorInterceptor function', async () => {
      const authInterceptorPath = path.join(TEMPLATES_DIR, 'interceptors', 'auth.ts.hbs');
      const content = await fs.readFile(authInterceptorPath, 'utf-8');

      expect(content).toContain('export function createAuthErrorInterceptor');
    });

    it('should import auth handlers conditionally', async () => {
      const authInterceptorPath = path.join(TEMPLATES_DIR, 'interceptors', 'auth.ts.hbs');
      const content = await fs.readFile(authInterceptorPath, 'utf-8');

      expect(content).toContain('{{#if hasApiKey}}');
      expect(content).toContain("import { addApiKeyAuth } from '../auth/api-key.js'");
      expect(content).toContain('{{#if hasBearerToken}}');
      expect(content).toContain("import { addBearerAuth } from '../auth/bearer.js'");
      expect(content).toContain('{{#if hasBasicAuth}}');
      expect(content).toContain("import { addBasicAuth } from '../auth/basic-auth.js'");
    });

    it('should apply auth schemes in order', async () => {
      const authInterceptorPath = path.join(TEMPLATES_DIR, 'interceptors', 'auth.ts.hbs');
      const content = await fs.readFile(authInterceptorPath, 'utf-8');

      expect(content).toContain('requestConfig = addApiKeyAuth(requestConfig, config)');
      expect(content).toContain('requestConfig = addBearerAuth(requestConfig, config)');
      expect(content).toContain('requestConfig = addBasicAuth(requestConfig, config)');
    });

    it('should include debug logging', async () => {
      const authInterceptorPath = path.join(TEMPLATES_DIR, 'interceptors', 'auth.ts.hbs');
      const content = await fs.readFile(authInterceptorPath, 'utf-8');

      expect(content).toContain('if (config.debug');
      expect(content).toContain('console.log');
      expect(content).toContain('✓ Authentication applied:');
      expect(content).toContain('authMethods.join');
    });

    it('should cache auth methods array', async () => {
      const authInterceptorPath = path.join(TEMPLATES_DIR, 'interceptors', 'auth.ts.hbs');
      const content = await fs.readFile(authInterceptorPath, 'utf-8');

      expect(content).toContain('const authMethods: string[] = []');
      expect(content).toContain("authMethods.push('API Key')");
      expect(content).toContain("authMethods.push('Bearer Token')");
      expect(content).toContain("authMethods.push('Basic Auth')");
    });

    it('should handle auth errors', async () => {
      const authInterceptorPath = path.join(TEMPLATES_DIR, 'interceptors', 'auth.ts.hbs');
      const content = await fs.readFile(authInterceptorPath, 'utf-8');

      expect(content).toContain('try {');
      expect(content).toContain('} catch (error) {');
      expect(content).toContain('console.error');
      expect(content).toContain('Authentication error for');
    });

    it('should handle 401 errors', async () => {
      const authInterceptorPath = path.join(TEMPLATES_DIR, 'interceptors', 'auth.ts.hbs');
      const content = await fs.readFile(authInterceptorPath, 'utf-8');

      expect(content).toContain('error.response?.status === 401');
      expect(content).toContain('401 Unauthorized');
      expect(content).toContain('Please verify your credentials');
    });

    it('should handle 403 errors', async () => {
      const authInterceptorPath = path.join(TEMPLATES_DIR, 'interceptors', 'auth.ts.hbs');
      const content = await fs.readFile(authInterceptorPath, 'utf-8');

      expect(content).toContain('error.response?.status === 403');
      expect(content).toContain('403 Forbidden');
      expect(content).toContain('sufficient permissions');
    });
  });

  describe('HTTP Client Integration', () => {
    it('should import interceptors when auth is present', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('{{#if (or hasApiKey hasBearerToken hasBasicAuth)}}');
      expect(content).toContain(
        "import { createAuthInterceptor, createAuthErrorInterceptor } from './interceptors/auth.js'"
      );
    });

    it('should use createAuthInterceptor in setupInterceptors', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('createAuthInterceptor(this.config.serverConfig)');
      expect(content).toContain('this.client.interceptors.request.use');
    });

    it('should use createAuthErrorInterceptor for response errors', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('createAuthErrorInterceptor()');
      expect(content).toContain('this.client.interceptors.response.use');
    });

    it('should register auth interceptor conditionally', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('if (this.config.serverConfig)');
      expect(content).toContain('createAuthInterceptor(this.config.serverConfig)');
    });

    it('should maintain multi-scheme auth separately', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('{{#if hasMultipleSecurity}}');
      expect(content).toContain('applyMultiSchemeAuth');
    });

    it('should separate auth and debug logging interceptors', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      // Auth interceptor
      expect(content).toContain('// Use centralized auth interceptor');
      expect(content).toContain('createAuthInterceptor(this.config.serverConfig)');

      // Debug logging interceptor
      expect(content).toContain('// Request interceptor for debug logging');
      expect(content).toContain('if (this.config.debug)');
    });
  });

  describe('Interceptor Order', () => {
    it('should apply interceptors in correct order', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      // Find positions of interceptor registrations
      const authInterceptorPos = content.indexOf('createAuthInterceptor');
      const debugLoggingPos = content.indexOf('Request interceptor for debug logging');
      const authErrorPos = content.indexOf('Response interceptor for auth errors');
      const retryLogicPos = content.indexOf('Response interceptor for debug logging and retry logic');

      // Ensure auth comes before debug logging
      expect(authInterceptorPos).toBeGreaterThan(-1);
      expect(debugLoggingPos).toBeGreaterThan(-1);
      expect(authInterceptorPos).toBeLessThan(debugLoggingPos);

      // Ensure response interceptors are registered
      expect(authErrorPos).toBeGreaterThan(-1);
      expect(retryLogicPos).toBeGreaterThan(-1);
    });
  });

  describe('Type Safety', () => {
    it('should import required types', async () => {
      const authInterceptorPath = path.join(TEMPLATES_DIR, 'interceptors', 'auth.ts.hbs');
      const content = await fs.readFile(authInterceptorPath, 'utf-8');

      expect(content).toContain("import type { InternalAxiosRequestConfig, AxiosError } from 'axios'");
      expect(content).toContain("import type { ServerConfig } from '../config.js'");
    });

    it('should use proper TypeScript types', async () => {
      const authInterceptorPath = path.join(TEMPLATES_DIR, 'interceptors', 'auth.ts.hbs');
      const content = await fs.readFile(authInterceptorPath, 'utf-8');

      expect(content).toContain('requestConfig: InternalAxiosRequestConfig');
      expect(content).toContain('): Promise<InternalAxiosRequestConfig>');
      expect(content).toContain('(error: AxiosError)');
    });
  });
});
