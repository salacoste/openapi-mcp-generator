/**
 * Integration tests for Bearer Token authentication
 * Tests end-to-end bearer token auth flow with HTTP client integration
 */

import { describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.resolve(__dirname, '../../../templates/mcp-server');

describe('Bearer Token Auth Integration Tests', () => {
  describe('Template File Structure', () => {
    it('should have all required files for bearer token auth workflow', async () => {
      const requiredFiles = [
        'auth/bearer.ts.hbs',
        'http-client.ts.hbs',
        'index.ts.hbs',
        'config.ts.hbs',
        'README.md.hbs',
      ];

      for (const file of requiredFiles) {
        const filePath = path.join(TEMPLATES_DIR, file);
        const exists = await fs.access(filePath)
          .then(() => true)
          .catch(() => false);

        expect(exists, `File ${file} should exist`).toBe(true);
      }
    });
  });

  describe('HTTP Client Integration', () => {
    it('should import bearer auth validation in http-client.ts', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('{{#if hasBearerToken}}');
      expect(content).toContain("import { validateBearerConfig } from './auth/bearer.js'");
    });

    it('should validate bearer token config during HTTP client initialization', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('validateBearerConfig(config.serverConfig)');
    });

    it('should use centralized auth interceptor (Story 4.7 architecture)', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      // Story 4.7 introduced centralized interceptor pattern
      expect(content).toContain('createAuthInterceptor');
      expect(content).toContain('this.config.serverConfig');
    });

    it('should support multi-auth with API Key and Bearer Token', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      // Story 4.7: Auth validation happens per-handler, interceptor is centralized
      expect(content).toContain('{{#if hasApiKey}}');
      expect(content).toContain('validateApiKeyConfig');
      expect(content).toContain('{{#if hasBearerToken}}');
      expect(content).toContain('validateBearerConfig');
    });

    it('should import ServerConfig type for auth configuration', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      // ServerConfig is always imported when auth is present
      expect(content).toContain("import type { ServerConfig } from './config.js'");
    });
  });

  describe('MCP Server Integration', () => {
    it('should use (or hasApiKey hasBearerToken hasBasicAuth) helper in index.ts', async () => {
      const indexPath = path.join(TEMPLATES_DIR, 'index.ts.hbs');
      const content = await fs.readFile(indexPath, 'utf-8');

      expect(content).toContain('{{#if (or hasApiKey hasBearerToken hasBasicAuth)}}');
      expect(content).toContain('serverConfig: config');
    });
  });

  describe('README Documentation Integration', () => {
    it('should have Bearer Token Authentication section in README', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('{{#if hasBearerToken}}');
      expect(content).toContain('## Bearer Token Authentication');
      expect(content).toContain('JWT/OAuth2');
    });

    it('should document bearer token configuration steps', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('### Bearer Token Configuration');
      expect(content).toContain('1. **Obtain a Bearer Token**');
      expect(content).toContain('2. **Configure the Bearer Token**');
      expect(content).toContain('3. **Verify Configuration**');
    });

    it('should document Authorization header format', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('### How It Works');
      expect(content).toContain('Authorization: Bearer');
    });

    it('should include JWT format documentation when bearerFormat is JWT', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain("{{#if (eq bearerFormat 'JWT')}}");
      expect(content).toContain('JWT Token Format');
      expect(content).toContain('header.payload.signature');
    });

    it('should include troubleshooting section', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('### Troubleshooting Bearer Token Authentication');
      expect(content).toContain('Bearer Token authentication required but not configured');
      expect(content).toContain('401 Unauthorized');
    });

    it('should include JWT-specific troubleshooting when format is JWT', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('does not appear to be a valid JWT format');
      expect(content).toContain('three parts separated by dots');
    });

    it('should include security note', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('Never commit your `.env` file');
      expect(content).toContain('Bearer tokens provide full API access');
    });
  });

  describe('Configuration Integration', () => {
    it('should use BEARER_TOKEN from config module', async () => {
      const bearerAuthPath = path.join(TEMPLATES_DIR, 'auth/bearer.ts.hbs');
      const content = await fs.readFile(bearerAuthPath, 'utf-8');

      expect(content).toContain('const bearerToken = serverConfig.bearerToken');
    });

    it('should validate against serverConfig', async () => {
      const bearerAuthPath = path.join(TEMPLATES_DIR, 'auth/bearer.ts.hbs');
      const content = await fs.readFile(bearerAuthPath, 'utf-8');

      expect(content).toContain('config: ServerConfig');
      expect(content).toContain('if (!config.bearerToken)');
    });
  });

  describe('Template Consistency', () => {
    it('should use consistent Handlebars variable names across templates', async () => {
      const templates = [
        'auth/bearer.ts.hbs',
        'http-client.ts.hbs',
        'README.md.hbs',
      ];

      const commonVars = ['hasBearerToken', 'bearerFormat', 'bearerRequired', 'bearerTokenDocUrl'];

      for (const template of templates) {
        const filePath = path.join(TEMPLATES_DIR, template);
        const content = await fs.readFile(filePath, 'utf-8');

        const hasAnyVar = commonVars.some(varName =>
          content.includes(`{{${varName}}}`) ||
          content.includes(`{{#if ${varName}}}`)
        );

        expect(hasAnyVar, `Template ${template} should use at least one common variable`).toBe(true);
      }
    });

    it('should use (or hasApiKey hasBearerToken hasBasicAuth) in index.ts for multi-auth', async () => {
      const indexPath = path.join(TEMPLATES_DIR, 'index.ts.hbs');
      const content = await fs.readFile(indexPath, 'utf-8');

      expect(content).toContain('{{#if (or hasApiKey hasBearerToken hasBasicAuth)}}');
    });

    it('should have matching error messages between templates', async () => {
      const bearerAuthPath = path.join(TEMPLATES_DIR, 'auth/bearer.ts.hbs');
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');

      const authContent = await fs.readFile(bearerAuthPath, 'utf-8');
      const readmeContent = await fs.readFile(readmePath, 'utf-8');

      const errorMessages = [
        'Bearer Token authentication required but not configured',
        '401 Unauthorized',
      ];

      for (const error of errorMessages) {
        expect(authContent.includes(error) || readmeContent.includes(error)).toBe(true);
      }
    });
  });

  describe('Security Requirements', () => {
    it('should never expose bearer tokens in any template', async () => {
      const templates = [
        'auth/bearer.ts.hbs',
        'http-client.ts.hbs',
        'index.ts.hbs',
        'README.md.hbs',
      ];

      for (const template of templates) {
        const filePath = path.join(TEMPLATES_DIR, template);
        const content = await fs.readFile(filePath, 'utf-8');

        // Should not log actual bearer token values
        expect(content).not.toMatch(/console\.log.*bearerToken[^a-zA-Z]/);
        expect(content).not.toMatch(/console\.log.*\${.*bearerToken.*}/);
      }
    });

    it('should use credential masking everywhere', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('<your-token>');
      expect(content).toContain('masked');
    });
  });

  describe('Request Flow Integration', () => {
    it('should have complete auth flow from config to request', async () => {
      // 1. Config loads BEARER_TOKEN
      const configPath = path.join(TEMPLATES_DIR, 'config.ts.hbs');
      const configContent = await fs.readFile(configPath, 'utf-8');
      expect(configContent).toContain('bearerToken: process.env.BEARER_TOKEN');

      // 2. Index passes config to HTTP client
      const indexPath = path.join(TEMPLATES_DIR, 'index.ts.hbs');
      const indexContent = await fs.readFile(indexPath, 'utf-8');
      expect(indexContent).toContain('serverConfig: config');

      // 3. HTTP client validates and stores config
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const httpClientContent = await fs.readFile(httpClientPath, 'utf-8');
      expect(httpClientContent).toContain('validateBearerConfig');
      expect(httpClientContent).toContain('serverConfig: config.serverConfig');

      // 4. Story 4.7: Centralized interceptor applies bearer token
      expect(httpClientContent).toContain('createAuthInterceptor(this.config.serverConfig)');

      // 5. Bearer auth module adds Authorization header
      const bearerAuthPath = path.join(TEMPLATES_DIR, 'auth/bearer.ts.hbs');
      const bearerAuthContent = await fs.readFile(bearerAuthPath, 'utf-8');
      expect(bearerAuthContent).toContain("config.headers['Authorization'] = `Bearer ${bearerToken}`");
    });
  });

  describe('Error Handling Integration', () => {
    it('should have consistent error handling across all layers', async () => {
      const templates = {
        'auth/bearer.ts.hbs': 'Bearer Token authentication required but not configured',
        'http-client.ts.hbs': 'validateBearerConfig',
        'index.ts.hbs': 'Configuration Error',
      };

      for (const [template, expectedContent] of Object.entries(templates)) {
        const filePath = path.join(TEMPLATES_DIR, template);
        const content = await fs.readFile(filePath, 'utf-8');

        expect(content, `${template} should contain: ${expectedContent}`).toContain(expectedContent);
      }
    });

    it('should provide setup instructions in errors', async () => {
      const bearerAuthPath = path.join(TEMPLATES_DIR, 'auth/bearer.ts.hbs');
      const content = await fs.readFile(bearerAuthPath, 'utf-8');

      expect(content).toContain('.env file');
      expect(content).toContain('BEARER_TOKEN=');
      expect(content).toContain('README.md');
    });
  });

  describe('Type Safety Integration', () => {
    it('should use consistent types across all templates', async () => {
      const templates = ['auth/bearer.ts.hbs', 'http-client.ts.hbs', 'config.ts.hbs'];

      for (const template of templates) {
        const filePath = path.join(TEMPLATES_DIR, template);
        const content = await fs.readFile(filePath, 'utf-8');

        expect(content, `${template} should use ServerConfig`).toContain('ServerConfig');
      }
    });

    it('should use InternalAxiosRequestConfig for request interceptor', async () => {
      const bearerAuthPath = path.join(TEMPLATES_DIR, 'auth/bearer.ts.hbs');
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');

      const authContent = await fs.readFile(bearerAuthPath, 'utf-8');
      const httpContent = await fs.readFile(httpClientPath, 'utf-8');

      expect(authContent).toContain('InternalAxiosRequestConfig');
      expect(httpContent).toContain('InternalAxiosRequestConfig');
    });
  });

  describe('Multi-Auth Support', () => {
    it('should support both API Key and Bearer Token in same server', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('{{#if hasApiKey}}');
      expect(content).toContain('{{#if hasBearerToken}}');

      // Story 4.7: Both auth types validated, centralized interceptor applies them
      expect(content).toContain('validateApiKeyConfig');
      expect(content).toContain('validateBearerConfig');
      expect(content).toContain('createAuthInterceptor');
    });

    it('should use (or hasApiKey hasBearerToken hasBasicAuth) helper for conditional logic', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('{{#if (or hasApiKey hasBearerToken hasBasicAuth)}}');
    });
  });

  describe('Handlebars Template Coordination', () => {
    it('should have coordinated conditional rendering', async () => {
      const templates = [
        // index.ts uses (or hasApiKey hasBearerToken) for multi-auth support
        'http-client.ts.hbs',
        'README.md.hbs',
      ];

      for (const template of templates) {
        const filePath = path.join(TEMPLATES_DIR, template);
        const content = await fs.readFile(filePath, 'utf-8');

        expect(content, `${template} should use hasBearerToken conditional`).toContain('{{#if hasBearerToken}}');
      }
    });

    it('should have bearer format conditionals in bearer.ts', async () => {
      const bearerAuthPath = path.join(TEMPLATES_DIR, 'auth/bearer.ts.hbs');
      const content = await fs.readFile(bearerAuthPath, 'utf-8');

      expect(content).toContain('{{#if bearerFormat}}');
      expect(content).toContain("{{#if (eq bearerFormat 'JWT')}}");
    });
  });

  describe('JWT-Specific Features', () => {
    it('should conditionally include JWT validation function', async () => {
      const bearerAuthPath = path.join(TEMPLATES_DIR, 'auth/bearer.ts.hbs');
      const content = await fs.readFile(bearerAuthPath, 'utf-8');

      expect(content).toContain("{{#if (eq bearerFormat 'JWT')}}");
      expect(content).toContain('function isValidJWT');
    });

    it('should include JWT format in README when bearerFormat is JWT', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain("{{#if (eq bearerFormat 'JWT')}}");
      expect(content).toContain('JWT Token Format');
    });
  });
});
