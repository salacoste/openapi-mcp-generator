import { describe, it, expect, beforeEach } from 'vitest';
import Handlebars from 'handlebars';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Interceptor Architecture', () => {
  let authInterceptorTemplate: HandlebarsTemplateDelegate;
  let httpClientTemplate: HandlebarsTemplateDelegate;

  beforeEach(() => {
    // Register Handlebars helper
    Handlebars.registerHelper('or', function (...args) {
      // Remove the Handlebars options object from args
      args.pop();
      return args.some((arg) => !!arg);
    });

    // Load templates
    const authInterceptorSource = readFileSync(
      resolve(__dirname, '../../templates/mcp-server/interceptors/auth.ts.hbs'),
      'utf-8'
    );
    const httpClientSource = readFileSync(
      resolve(__dirname, '../../templates/mcp-server/http-client.ts.hbs'),
      'utf-8'
    );

    authInterceptorTemplate = Handlebars.compile(authInterceptorSource);
    httpClientTemplate = Handlebars.compile(httpClientSource);
  });

  describe('Auth Interceptor Template', () => {
    it('should generate auth interceptor with API Key only', () => {
      const context = {
        hasApiKey: true,
        hasBearerToken: false,
        hasBasicAuth: false,
      };

      const result = authInterceptorTemplate(context);

      expect(result).toContain("import { addApiKeyAuth } from '../auth/api-key.js'");
      expect(result).toContain("requestConfig = addApiKeyAuth(requestConfig, config)");
      expect(result).toContain("authMethods.push('API Key')");
      expect(result).not.toContain('Bearer Token');
      expect(result).not.toContain('Basic Auth');
    });

    it('should generate auth interceptor with Bearer Token only', () => {
      const context = {
        hasApiKey: false,
        hasBearerToken: true,
        hasBasicAuth: false,
      };

      const result = authInterceptorTemplate(context);

      expect(result).toContain("import { addBearerAuth } from '../auth/bearer.js'");
      expect(result).toContain("requestConfig = addBearerAuth(requestConfig, config)");
      expect(result).toContain("authMethods.push('Bearer Token')");
      expect(result).not.toContain('API Key');
      expect(result).not.toContain('Basic Auth');
    });

    it('should generate auth interceptor with Basic Auth only', () => {
      const context = {
        hasApiKey: false,
        hasBearerToken: false,
        hasBasicAuth: true,
      };

      const result = authInterceptorTemplate(context);

      expect(result).toContain("import { addBasicAuth } from '../auth/basic-auth.js'");
      expect(result).toContain("requestConfig = addBasicAuth(requestConfig, config)");
      expect(result).toContain("authMethods.push('Basic Auth')");
      expect(result).not.toContain('API Key');
      expect(result).not.toContain('Bearer Token');
    });

    it('should generate auth interceptor with multiple auth schemes', () => {
      const context = {
        hasApiKey: true,
        hasBearerToken: true,
        hasBasicAuth: true,
      };

      const result = authInterceptorTemplate(context);

      expect(result).toContain("import { addApiKeyAuth } from '../auth/api-key.js'");
      expect(result).toContain("import { addBearerAuth } from '../auth/bearer.js'");
      expect(result).toContain("import { addBasicAuth } from '../auth/basic-auth.js'");
      expect(result).toContain("requestConfig = addApiKeyAuth(requestConfig, config)");
      expect(result).toContain("requestConfig = addBearerAuth(requestConfig, config)");
      expect(result).toContain("requestConfig = addBasicAuth(requestConfig, config)");
      expect(result).toContain("authMethods.push('API Key')");
      expect(result).toContain("authMethods.push('Bearer Token')");
      expect(result).toContain("authMethods.push('Basic Auth')");
    });

    it('should include createAuthInterceptor function', () => {
      const context = {
        hasApiKey: true,
        hasBearerToken: false,
        hasBasicAuth: false,
      };

      const result = authInterceptorTemplate(context);

      expect(result).toContain('export function createAuthInterceptor(config: ServerConfig)');
      expect(result).toContain('async (');
      expect(result).toContain('requestConfig: InternalAxiosRequestConfig');
      expect(result).toContain('): Promise<InternalAxiosRequestConfig>');
    });

    it('should include createAuthErrorInterceptor function', () => {
      const context = {
        hasApiKey: true,
        hasBearerToken: false,
        hasBasicAuth: false,
      };

      const result = authInterceptorTemplate(context);

      expect(result).toContain('export function createAuthErrorInterceptor()');
      expect(result).toContain('error.response?.status === 401');
      expect(result).toContain('Authentication failed (401 Unauthorized)');
      expect(result).toContain('error.response?.status === 403');
      expect(result).toContain('Access forbidden (403 Forbidden)');
    });

    it('should include debug logging without credentials', () => {
      const context = {
        hasApiKey: true,
        hasBearerToken: true,
        hasBasicAuth: false,
      };

      const result = authInterceptorTemplate(context);

      expect(result).toContain('if (config.debug');
      expect(result).toContain('console.log');
      expect(result).toContain('✓ Authentication applied:');
      expect(result).toContain('authMethods.join');
      // Ensure no credential logging
      expect(result).not.toContain('apiKey');
      expect(result).not.toContain('bearerToken');
      expect(result).not.toContain('password');
    });

    it('should include error handling with context', () => {
      const context = {
        hasApiKey: true,
        hasBearerToken: false,
        hasBasicAuth: false,
      };

      const result = authInterceptorTemplate(context);

      expect(result).toContain('try {');
      expect(result).toContain('} catch (error) {');
      expect(result).toContain('console.error');
      expect(result).toContain('Authentication error for');
      expect(result).toContain('requestConfig.url');
      expect(result).toContain('throw error');
    });

    it('should cache auth methods array', () => {
      const context = {
        hasApiKey: true,
        hasBearerToken: true,
        hasBasicAuth: true,
      };

      const result = authInterceptorTemplate(context);

      expect(result).toContain('const authMethods: string[] = []');
      expect(result).toContain("authMethods.push('API Key')");
      expect(result).toContain("authMethods.push('Bearer Token')");
      expect(result).toContain("authMethods.push('Basic Auth')");
    });
  });

  describe('HTTP Client Integration', () => {
    it('should import auth interceptors when auth is present', () => {
      const context = {
        hasMultipleSecurity: false,
        hasApiKey: true,
        hasBearerToken: false,
        hasBasicAuth: false,
      };

      const result = httpClientTemplate(context);

      expect(result).toContain(
        "import { createAuthInterceptor, createAuthErrorInterceptor } from './interceptors/auth.js'"
      );
      expect(result).toContain("import { validateApiKeyConfig } from './auth/api-key.js'");
    });

    it('should use createAuthInterceptor in setupInterceptors', () => {
      const context = {
        hasMultipleSecurity: false,
        hasApiKey: true,
        hasBearerToken: false,
        hasBasicAuth: false,
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
        apiName: 'Test API',
      };

      const result = httpClientTemplate(context);

      expect(result).toContain('createAuthInterceptor(this.config.serverConfig)');
      expect(result).toContain('this.client.interceptors.request.use');
    });

    it('should use createAuthErrorInterceptor for response errors', () => {
      const context = {
        hasMultipleSecurity: false,
        hasApiKey: true,
        hasBearerToken: false,
        hasBasicAuth: false,
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
        apiName: 'Test API',
      };

      const result = httpClientTemplate(context);

      expect(result).toContain('createAuthErrorInterceptor()');
      expect(result).toContain('this.client.interceptors.response.use');
    });

    it('should not import auth interceptors when no auth', () => {
      const context = {
        hasMultipleSecurity: false,
        hasApiKey: false,
        hasBearerToken: false,
        hasBasicAuth: false,
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
        apiName: 'Test API',
      };

      const result = httpClientTemplate(context);

      expect(result).not.toContain('createAuthInterceptor');
      expect(result).not.toContain('createAuthErrorInterceptor');
    });

    it('should handle multi-scheme security separately', () => {
      const context = {
        hasMultipleSecurity: true,
        hasApiKey: false,
        hasBearerToken: false,
        hasBasicAuth: false,
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
        apiName: 'Test API',
        globalSecurity: [],
      };

      const result = httpClientTemplate(context);

      expect(result).toContain('applyMultiSchemeAuth');
      expect(result).not.toContain('createAuthInterceptor');
    });

    it('should register auth interceptor before debug logging', () => {
      const context = {
        hasMultipleSecurity: false,
        hasApiKey: true,
        hasBearerToken: false,
        hasBasicAuth: false,
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
        apiName: 'Test API',
      };

      const result = httpClientTemplate(context);

      const authInterceptorIndex = result.indexOf('createAuthInterceptor');
      const debugLoggingIndex = result.indexOf('this.config.debug');

      expect(authInterceptorIndex).toBeGreaterThan(-1);
      expect(debugLoggingIndex).toBeGreaterThan(-1);
      expect(authInterceptorIndex).toBeLessThan(debugLoggingIndex);
    });

    it('should include serverConfig validation for all auth types', () => {
      const context = {
        hasMultipleSecurity: false,
        hasApiKey: true,
        hasBearerToken: true,
        hasBasicAuth: true,
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
        apiName: 'Test API',
      };

      const result = httpClientTemplate(context);

      expect(result).toContain('validateApiKeyConfig');
      expect(result).toContain('validateBearerConfig');
      expect(result).toContain('validateBasicAuthConfig');
    });
  });

  describe('Interceptor Performance', () => {
    it('should cache auth methods to avoid recomputation', () => {
      const context = {
        hasApiKey: true,
        hasBearerToken: true,
        hasBasicAuth: true,
      };

      const result = authInterceptorTemplate(context);

      // Auth methods should be computed once outside the async function
      expect(result).toContain('const authMethods: string[] = []');
      const authMethodsDeclarationIndex = result.indexOf('const authMethods: string[] = []');
      const asyncFunctionIndex = result.indexOf('async (');
      expect(authMethodsDeclarationIndex).toBeLessThan(asyncFunctionIndex);
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 errors with helpful message', () => {
      const context = {
        hasApiKey: true,
        hasBearerToken: false,
        hasBasicAuth: false,
      };

      const result = authInterceptorTemplate(context);

      expect(result).toContain('401 Unauthorized');
      expect(result).toContain('Please verify your credentials in the .env file');
    });

    it('should handle 403 errors with helpful message', () => {
      const context = {
        hasApiKey: true,
        hasBearerToken: false,
        hasBasicAuth: false,
      };

      const result = authInterceptorTemplate(context);

      expect(result).toContain('403 Forbidden');
      expect(result).toContain('Your credentials may not have sufficient permissions');
    });

    it('should pass through non-auth errors', () => {
      const context = {
        hasApiKey: true,
        hasBearerToken: false,
        hasBasicAuth: false,
      };

      const result = authInterceptorTemplate(context);

      expect(result).toContain('return Promise.reject(error)');
    });
  });
});
