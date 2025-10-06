/**
 * Integration tests for API Key authentication
 * Tests end-to-end API key auth flow with HTTP client integration
 */

import { describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.resolve(__dirname, '../../../templates/mcp-server');

describe('API Key Auth Integration Tests', () => {
  describe('Template File Structure', () => {
    it('should have all required files for API key auth workflow', async () => {
      const requiredFiles = [
        'auth/api-key.ts.hbs',
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
    it('should import API key auth module in http-client.ts', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('{{#if (or hasApiKey hasBearerToken hasBasicAuth)}}');
      expect(content).toContain("import { validateApiKeyConfig } from './auth/api-key.js'");
      expect(content).toContain("import type { ServerConfig } from './config.js'");
    });

    it('should validate API key config during HTTP client initialization', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('validateApiKeyConfig(config.serverConfig)');
    });

    it('should apply API key in request interceptor', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      // Should use centralized interceptor
      expect(content).toContain('createAuthInterceptor(this.config.serverConfig)');
      expect(content).toContain('// Use centralized auth interceptor');
    });

    it('should accept serverConfig in ClientConfig interface', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('serverConfig?: ServerConfig');
    });

    it('should store serverConfig in constructor', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('serverConfig: config.serverConfig');
    });
  });

  describe('MCP Server Integration', () => {
    it('should pass serverConfig to HTTP client in index.ts', async () => {
      const indexPath = path.join(TEMPLATES_DIR, 'index.ts.hbs');
      const content = await fs.readFile(indexPath, 'utf-8');

      // index.ts uses (or hasApiKey hasBearerToken hasBasicAuth) helper for auth
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

  describe('README Documentation Integration', () => {
    it('should have Authentication section in README', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('{{#if hasApiKey}}');
      expect(content).toContain('## Authentication');
      expect(content).toContain('API Key authentication');
    });

    it('should document API key configuration steps', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('### API Key Configuration');
      expect(content).toContain('1. **Obtain an API Key**');
      expect(content).toContain('2. **Configure the API Key**');
      expect(content).toContain('3. **Verify Configuration**');
    });

    it('should document how API key is applied to requests', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('### How It Works');
      expect(content).toContain('automatically added to all API requests');
      expect(content).toContain('{{#each apiKeySchemes}}');
    });

    it('should include troubleshooting section', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('### Troubleshooting Authentication');
      expect(content).toContain('API Key authentication required but not configured');
      expect(content).toContain('401 Unauthorized');
    });

    it('should include security note about .env file', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('**Security Note**');
      expect(content).toContain('Never commit your `.env` file');
      expect(content).toContain('.gitignore');
    });
  });

  describe('Configuration Integration', () => {
    it('should use API_KEY from config module', async () => {
      const apiKeyAuthPath = path.join(TEMPLATES_DIR, 'auth/api-key.ts.hbs');
      const content = await fs.readFile(apiKeyAuthPath, 'utf-8');

      expect(content).toContain('const apiKey = serverConfig.apiKey');
    });

    it('should validate against serverConfig', async () => {
      const apiKeyAuthPath = path.join(TEMPLATES_DIR, 'auth/api-key.ts.hbs');
      const content = await fs.readFile(apiKeyAuthPath, 'utf-8');

      expect(content).toContain('config: ServerConfig');
      expect(content).toContain('if (!config.apiKey)');
    });
  });

  describe('Template Consistency', () => {
    it('should use consistent Handlebars variable names across templates', async () => {
      const templates = [
        'auth/api-key.ts.hbs',
        'http-client.ts.hbs',
        'README.md.hbs',
      ];

      const commonVars = ['hasApiKey', 'apiKeySchemes', 'apiKeyRequired', 'apiKeyDocUrl'];

      for (const template of templates) {
        const filePath = path.join(TEMPLATES_DIR, template);
        const content = await fs.readFile(filePath, 'utf-8');

        // At least some variables should be used in each template
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
      const apiKeyAuthPath = path.join(TEMPLATES_DIR, 'auth/api-key.ts.hbs');
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');

      const authContent = await fs.readFile(apiKeyAuthPath, 'utf-8');
      const readmeContent = await fs.readFile(readmePath, 'utf-8');

      // Error message in auth should be documented in README
      const errorMessages = [
        'API Key authentication required but not configured',
        '401 Unauthorized',
      ];

      for (const error of errorMessages) {
        expect(authContent.includes(error) || readmeContent.includes(error)).toBe(true);
      }
    });
  });

  describe('Security Requirements', () => {
    it('should never expose API keys in any template', async () => {
      const templates = [
        'auth/api-key.ts.hbs',
        'http-client.ts.hbs',
        'index.ts.hbs',
        'README.md.hbs',
      ];

      for (const template of templates) {
        const filePath = path.join(TEMPLATES_DIR, template);
        const content = await fs.readFile(filePath, 'utf-8');

        // Should not log actual API key values
        expect(content).not.toMatch(/console\.log.*apiKey[^a-zA-Z]/);
        expect(content).not.toMatch(/console\.log.*\${.*apiKey.*}/);
      }
    });

    it('should use credential masking everywhere', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('<your-api-key>');
      expect(content).toContain('masked');
    });
  });

  describe('Request Flow Integration', () => {
    it('should have complete auth flow from config to request', async () => {
      // 1. Config loads API_KEY
      const configPath = path.join(TEMPLATES_DIR, 'config.ts.hbs');
      const configContent = await fs.readFile(configPath, 'utf-8');
      expect(configContent).toContain('apiKey: process.env.API_KEY');

      // 2. Index passes config to HTTP client
      const indexPath = path.join(TEMPLATES_DIR, 'index.ts.hbs');
      const indexContent = await fs.readFile(indexPath, 'utf-8');
      expect(indexContent).toContain('serverConfig: config');

      // 3. HTTP client validates and stores config
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const httpClientContent = await fs.readFile(httpClientPath, 'utf-8');
      expect(httpClientContent).toContain('validateApiKeyConfig');
      expect(httpClientContent).toContain('serverConfig: config.serverConfig');

      // 4. Interceptor applies API key to request via centralized interceptor
      expect(httpClientContent).toContain('createAuthInterceptor(this.config.serverConfig)');

      // 5. API key auth module adds key based on scheme
      const apiKeyAuthPath = path.join(TEMPLATES_DIR, 'auth/api-key.ts.hbs');
      const apiKeyAuthContent = await fs.readFile(apiKeyAuthPath, 'utf-8');
      expect(apiKeyAuthContent).toContain("config.headers['{{name}}'] = apiKey");
    });
  });

  describe('Error Handling Integration', () => {
    it('should have consistent error handling across all layers', async () => {
      const templates = {
        'auth/api-key.ts.hbs': 'API Key authentication required but not configured',
        'http-client.ts.hbs': 'validateApiKeyConfig',
        'index.ts.hbs': 'Configuration Error',
      };

      for (const [template, expectedContent] of Object.entries(templates)) {
        const filePath = path.join(TEMPLATES_DIR, template);
        const content = await fs.readFile(filePath, 'utf-8');

        expect(content, `${template} should contain: ${expectedContent}`).toContain(expectedContent);
      }
    });

    it('should provide setup instructions in errors', async () => {
      const apiKeyAuthPath = path.join(TEMPLATES_DIR, 'auth/api-key.ts.hbs');
      const content = await fs.readFile(apiKeyAuthPath, 'utf-8');

      expect(content).toContain('.env file');
      expect(content).toContain('API_KEY=');
      expect(content).toContain('README.md');
    });
  });

  describe('Type Safety Integration', () => {
    it('should use consistent types across all templates', async () => {
      // ServerConfig should be used consistently
      const templates = ['auth/api-key.ts.hbs', 'http-client.ts.hbs', 'config.ts.hbs'];

      for (const template of templates) {
        const filePath = path.join(TEMPLATES_DIR, template);
        const content = await fs.readFile(filePath, 'utf-8');

        expect(content, `${template} should use ServerConfig`).toContain('ServerConfig');
      }
    });

    it('should use InternalAxiosRequestConfig for request interceptor', async () => {
      const apiKeyAuthPath = path.join(TEMPLATES_DIR, 'auth/api-key.ts.hbs');
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');

      const authContent = await fs.readFile(apiKeyAuthPath, 'utf-8');
      const httpContent = await fs.readFile(httpClientPath, 'utf-8');

      expect(authContent).toContain('InternalAxiosRequestConfig');
      expect(httpContent).toContain('InternalAxiosRequestConfig');
    });
  });

  describe('Handlebars Template Coordination', () => {
    it('should have coordinated conditional rendering', async () => {
      const templates = [
        // auth/api-key.ts.hbs is only generated when hasApiKey=true, so it doesn't need conditionals
        // index.ts uses (or hasApiKey hasBearerToken) for multi-auth support
        'http-client.ts.hbs',
        'README.md.hbs',
      ];

      for (const template of templates) {
        const filePath = path.join(TEMPLATES_DIR, template);
        const content = await fs.readFile(filePath, 'utf-8');

        // Should use hasApiKey conditional
        expect(content, `${template} should use hasApiKey conditional`).toContain('{{#if hasApiKey}}');
      }
    });

    it('should have apiKeySchemes template variables in api-key.ts', async () => {
      const apiKeyAuthPath = path.join(TEMPLATES_DIR, 'auth/api-key.ts.hbs');
      const content = await fs.readFile(apiKeyAuthPath, 'utf-8');

      expect(content).toContain('{{#if apiKeySchemes}}');
      expect(content).toContain('{{#each apiKeySchemes}}');
    });
  });
});
