/**
 * Integration tests for Basic Authentication
 * Tests end-to-end basic auth flow with HTTP client integration
 */

import { describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.resolve(__dirname, '../../../templates/mcp-server');

describe('Basic Auth Integration Tests', () => {
  describe('Template File Structure', () => {
    it('should have all required files for basic auth workflow', async () => {
      const requiredFiles = [
        'auth/basic-auth.ts.hbs',
        'http-client.ts.hbs',
        'index.ts.hbs',
        'config.ts.hbs',
        'README.md.hbs',
        '.env.example.hbs',
      ];

      for (const file of requiredFiles) {
        const filePath = path.join(TEMPLATES_DIR, file);
        const exists = await fs.access(filePath)
          .then(() => true)
          .catch(() => false);

        expect(exists, `File ${file} should exist`).toBe(true);
      }
    });

    it('should have auth directory structure', async () => {
      const authDir = path.join(TEMPLATES_DIR, 'auth');
      const exists = await fs.access(authDir)
        .then(() => true)
        .catch(() => false);

      expect(exists, 'auth directory should exist').toBe(true);
    });
  });

  describe('HTTP Client Integration', () => {
    it('should import basic auth validation in http-client.ts', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('{{#if hasBasicAuth}}');
      expect(content).toContain("import { validateBasicAuthConfig } from './auth/basic-auth.js'");
    });

    it('should import ServerConfig type for auth configuration', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      // ServerConfig is always imported when auth is present
      expect(content).toContain("import type { ServerConfig } from './config.js'");
    });

    it('should validate basic auth config during HTTP client initialization', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('validateBasicAuthConfig(config.serverConfig)');
    });

    it('should use centralized auth interceptor (Story 4.7 architecture)', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      // Story 4.7 introduced centralized interceptor pattern
      expect(content).toContain('createAuthInterceptor');
      expect(content).toContain('this.config.serverConfig');
    });

    it('should support multi-auth with API Key, Bearer Token, and Basic Auth', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      // Story 4.7: Auth validation happens per-handler, interceptor is centralized
      expect(content).toContain('{{#if hasApiKey}}');
      expect(content).toContain('validateApiKeyConfig');
      expect(content).toContain('{{#if hasBearerToken}}');
      expect(content).toContain('validateBearerConfig');
      expect(content).toContain('{{#if hasBasicAuth}}');
      expect(content).toContain('validateBasicAuthConfig');
    });

    it('should accept serverConfig in ClientConfig interface for all auth types', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('{{#if (or hasApiKey hasBearerToken hasBasicAuth)}}');
      expect(content).toContain('serverConfig?: ServerConfig');
    });

    it('should store serverConfig in constructor', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('serverConfig: config.serverConfig');
    });
  });

  describe('MCP Server Integration', () => {
    it('should use (or hasApiKey hasBearerToken hasBasicAuth) helper in index.ts', async () => {
      const indexPath = path.join(TEMPLATES_DIR, 'index.ts.hbs');
      const content = await fs.readFile(indexPath, 'utf-8');

      expect(content).toContain('{{#if (or hasApiKey hasBearerToken hasBasicAuth)}}');
      expect(content).toContain('serverConfig: config');
    });

    it('should use config from Story 4.1', async () => {
      const indexPath = path.join(TEMPLATES_DIR, 'index.ts.hbs');
      const content = await fs.readFile(indexPath, 'utf-8');

      expect(content).toContain("import { loadConfig } from './config.js'");
      expect(content).toContain('config = loadConfig()');
    });
  });

  describe('Configuration Integration', () => {
    it('should have basicAuth in ServerConfig interface', async () => {
      const configPath = path.join(TEMPLATES_DIR, 'config.ts.hbs');
      const content = await fs.readFile(configPath, 'utf-8');

      expect(content).toContain('basicAuth?: {');
      expect(content).toContain('username: string');
      expect(content).toContain('password: string');
    });

    it('should parse BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD from environment', async () => {
      const configPath = path.join(TEMPLATES_DIR, 'config.ts.hbs');
      const content = await fs.readFile(configPath, 'utf-8');

      expect(content).toContain('process.env.BASIC_AUTH_USERNAME');
      expect(content).toContain('process.env.BASIC_AUTH_PASSWORD');
    });

    it('should validate required basic auth in config', async () => {
      const configPath = path.join(TEMPLATES_DIR, 'config.ts.hbs');
      const content = await fs.readFile(configPath, 'utf-8');

      expect(content).toContain('SECURITY_REQUIREMENTS.hasBasicAuth');
      expect(content).toContain('!config.basicAuth');
    });

    it('should mask basic auth credentials in debug logs', async () => {
      const configPath = path.join(TEMPLATES_DIR, 'config.ts.hbs');
      const content = await fs.readFile(configPath, 'utf-8');

      expect(content).toContain('if (config.basicAuth)');
      expect(content).toContain('***hidden***');
    });
  });

  describe('README Documentation Integration', () => {
    it('should have Basic Authentication section in README', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('{{#if hasBasicAuth}}');
      expect(content).toContain('## Basic Authentication');
      expect(content).toContain('username/password');
    });

    it('should document basic auth configuration steps', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('### Basic Authentication Configuration');
      expect(content).toContain('1. **Obtain Credentials**');
      expect(content).toContain('2. **Configure Credentials**');
      expect(content).toContain('3. **Verify Configuration**');
    });

    it('should document Authorization header format', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('### How It Works');
      expect(content).toContain('Authorization: Basic');
      expect(content).toContain('base64(username:password)');
    });

    it('should document UTF-8 character encoding support', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('### Character Encoding');
      expect(content).toContain('UTF-8');
      expect(content).toContain('International characters');
      expect(content).toContain('Special symbols');
    });

    it('should include troubleshooting section', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('### Troubleshooting Basic Authentication');
      expect(content).toContain('Basic Authentication required but not configured');
      expect(content).toContain('401 Unauthorized');
      expect(content).toContain('Partial Basic Auth configuration detected');
    });

    it('should include security note', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('**Security Note**');
      expect(content).toContain('Never commit your `.env` file');
      expect(content).toContain('credentials provide API access');
    });
  });

  describe('Template Consistency', () => {
    it('should use consistent Handlebars variable names across templates', async () => {
      const templates = [
        'auth/basic-auth.ts.hbs',
        'http-client.ts.hbs',
        'README.md.hbs',
      ];

      const commonVars = ['hasBasicAuth', 'basicAuthRequired', 'basicAuthDocUrl'];

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
      const basicAuthPath = path.join(TEMPLATES_DIR, 'auth/basic-auth.ts.hbs');
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');

      const authContent = await fs.readFile(basicAuthPath, 'utf-8');
      const readmeContent = await fs.readFile(readmePath, 'utf-8');

      const errorMessages = [
        'Basic Authentication required but not configured',
        '401 Unauthorized',
      ];

      for (const error of errorMessages) {
        expect(authContent.includes(error) || readmeContent.includes(error)).toBe(true);
      }
    });
  });

  describe('Security Requirements', () => {
    it('should never expose credentials in any template', async () => {
      const templates = [
        'auth/basic-auth.ts.hbs',
        'http-client.ts.hbs',
        'index.ts.hbs',
        'README.md.hbs',
      ];

      for (const template of templates) {
        const filePath = path.join(TEMPLATES_DIR, template);
        const content = await fs.readFile(filePath, 'utf-8');

        // Should not log actual credential values
        expect(content).not.toMatch(/console\.log.*username[^a-zA-Z]/);
        expect(content).not.toMatch(/console\.log.*password[^a-zA-Z]/);
        expect(content).not.toMatch(/console\.log.*\${.*username.*}/);
        expect(content).not.toMatch(/console\.log.*\${.*password.*}/);
      }
    });

    it('should use credential masking everywhere', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('your-username');
      expect(content).toContain('your-password');
      expect(content).toContain('***hidden***');
    });
  });

  describe('Request Flow Integration', () => {
    it('should have complete auth flow from config to request', async () => {
      // 1. Config loads BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD
      const configPath = path.join(TEMPLATES_DIR, 'config.ts.hbs');
      const configContent = await fs.readFile(configPath, 'utf-8');
      expect(configContent).toContain('process.env.BASIC_AUTH_USERNAME');
      expect(configContent).toContain('process.env.BASIC_AUTH_PASSWORD');

      // 2. Index passes config to HTTP client
      const indexPath = path.join(TEMPLATES_DIR, 'index.ts.hbs');
      const indexContent = await fs.readFile(indexPath, 'utf-8');
      expect(indexContent).toContain('serverConfig: config');

      // 3. HTTP client validates and stores config
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const httpClientContent = await fs.readFile(httpClientPath, 'utf-8');
      expect(httpClientContent).toContain('validateBasicAuthConfig');
      expect(httpClientContent).toContain('serverConfig: config.serverConfig');

      // 4. Story 4.7: Centralized interceptor applies basic auth
      expect(httpClientContent).toContain('createAuthInterceptor(this.config.serverConfig)');

      // 5. Basic auth module encodes credentials and adds Authorization header
      const basicAuthPath = path.join(TEMPLATES_DIR, 'auth/basic-auth.ts.hbs');
      const basicAuthContent = await fs.readFile(basicAuthPath, 'utf-8');
      expect(basicAuthContent).toContain("Buffer.from(`${username}:${password}`, 'utf-8')");
      expect(basicAuthContent).toContain("config.headers['Authorization'] = `Basic ${credentials}`");
    });
  });

  describe('Error Handling Integration', () => {
    it('should have consistent error handling across all layers', async () => {
      const templates = {
        'auth/basic-auth.ts.hbs': 'Basic Authentication required but not configured',
        'http-client.ts.hbs': 'validateBasicAuthConfig',
        'index.ts.hbs': 'Configuration Error',
      };

      for (const [template, expectedContent] of Object.entries(templates)) {
        const filePath = path.join(TEMPLATES_DIR, template);
        const content = await fs.readFile(filePath, 'utf-8');

        expect(content, `${template} should contain: ${expectedContent}`).toContain(expectedContent);
      }
    });

    it('should provide setup instructions in errors', async () => {
      const basicAuthPath = path.join(TEMPLATES_DIR, 'auth/basic-auth.ts.hbs');
      const content = await fs.readFile(basicAuthPath, 'utf-8');

      expect(content).toContain('.env file');
      expect(content).toContain('BASIC_AUTH_USERNAME=');
      expect(content).toContain('BASIC_AUTH_PASSWORD=');
      expect(content).toContain('README.md');
    });
  });

  describe('Type Safety Integration', () => {
    it('should use consistent types across all templates', async () => {
      const templates = ['auth/basic-auth.ts.hbs', 'http-client.ts.hbs', 'config.ts.hbs'];

      for (const template of templates) {
        const filePath = path.join(TEMPLATES_DIR, template);
        const content = await fs.readFile(filePath, 'utf-8');

        expect(content, `${template} should use ServerConfig`).toContain('ServerConfig');
      }
    });

    it('should use InternalAxiosRequestConfig for request interceptor', async () => {
      const basicAuthPath = path.join(TEMPLATES_DIR, 'auth/basic-auth.ts.hbs');
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');

      const authContent = await fs.readFile(basicAuthPath, 'utf-8');
      const httpContent = await fs.readFile(httpClientPath, 'utf-8');

      expect(authContent).toContain('InternalAxiosRequestConfig');
      expect(httpContent).toContain('InternalAxiosRequestConfig');
    });
  });

  describe('Multi-Auth Support', () => {
    it('should support API Key, Bearer Token, and Basic Auth in same server', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('{{#if hasApiKey}}');
      expect(content).toContain('{{#if hasBearerToken}}');
      expect(content).toContain('{{#if hasBasicAuth}}');

      // Story 4.7: All auth types validated, centralized interceptor applies them
      expect(content).toContain('validateApiKeyConfig');
      expect(content).toContain('validateBearerConfig');
      expect(content).toContain('validateBasicAuthConfig');
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
        'http-client.ts.hbs',
        'README.md.hbs',
      ];

      for (const template of templates) {
        const filePath = path.join(TEMPLATES_DIR, template);
        const content = await fs.readFile(filePath, 'utf-8');

        expect(content, `${template} should use hasBasicAuth conditional`).toContain('{{#if hasBasicAuth}}');
      }
    });

    it('should have basicAuthRequired and basicAuthDocUrl conditionals in basic-auth.ts', async () => {
      const basicAuthPath = path.join(TEMPLATES_DIR, 'auth/basic-auth.ts.hbs');
      const content = await fs.readFile(basicAuthPath, 'utf-8');

      expect(content).toContain('{{#if basicAuthRequired}}');
      expect(content).toContain('{{#if basicAuthDocUrl}}');
    });
  });

  describe('Base64 Encoding Integration', () => {
    it('should use Buffer.from with UTF-8 encoding', async () => {
      const basicAuthPath = path.join(TEMPLATES_DIR, 'auth/basic-auth.ts.hbs');
      const content = await fs.readFile(basicAuthPath, 'utf-8');

      expect(content).toContain("Buffer.from(`${username}:${password}`, 'utf-8')");
      expect(content).toContain(".toString('base64')");
    });

    it('should document UTF-8 support in README', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('UTF-8');
      expect(content).toContain('International characters');
    });
  });
});
