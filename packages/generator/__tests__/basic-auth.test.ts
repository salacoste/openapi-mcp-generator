/**
 * Unit tests for Basic Authentication module template
 * Tests base64 encoding, Authorization header, and error handling
 */

import { describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.resolve(__dirname, '../../templates/mcp-server');
const BASIC_AUTH_TEMPLATE_PATH = path.join(TEMPLATES_DIR, 'auth/basic-auth.ts.hbs');

describe('Basic Auth Module Template', () => {
  describe('Template File Existence', () => {
    it('should have basic-auth.ts.hbs template file in auth directory', async () => {
      const exists = await fs.access(BASIC_AUTH_TEMPLATE_PATH)
        .then(() => true)
        .catch(() => false);

      expect(exists).toBe(true);
    });

    it('should contain required exports and functions', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('export function addBasicAuth(');
      expect(content).toContain('export function validateBasicAuthConfig(');
    });

    it('should import required Axios and config types', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain("import type { InternalAxiosRequestConfig } from 'axios'");
      expect(content).toContain("import type { ServerConfig } from '../config.js'");
    });
  });

  describe('addBasicAuth Function', () => {
    it('should have proper TypeScript function signature', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('export function addBasicAuth(');
      expect(content).toContain('config: InternalAxiosRequestConfig');
      expect(content).toContain('serverConfig: ServerConfig');
      expect(content).toContain('): InternalAxiosRequestConfig');
    });

    it('should extract username and password from serverConfig', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('const { username, password } = serverConfig.basicAuth || {}');
    });

    it('should validate both username and password are present', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('if (!username || !password)');
      expect(content).toContain('Basic Authentication required but not configured');
      expect(content).toContain('BASIC_AUTH_USERNAME');
      expect(content).toContain('BASIC_AUTH_PASSWORD');
    });

    it('should encode credentials in base64 with UTF-8 support', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain("Buffer.from(`${username}:${password}`, 'utf-8')");
      expect(content).toContain('.toString(\'base64\')');
      expect(content).toContain('const credentials =');
    });

    it('should add Authorization header with Basic scheme', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain("config.headers['Authorization'] = `Basic ${credentials}`");
    });

    it('should return modified config', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('return config');
    });

    it('should provide clear error messages with setup instructions', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('.env file');
      expect(content).toContain('BASIC_AUTH_USERNAME=');
      expect(content).toContain('BASIC_AUTH_PASSWORD=');
      expect(content).toContain('README.md');
    });
  });

  describe('validateBasicAuthConfig Function', () => {
    it('should have proper TypeScript function signature', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('export function validateBasicAuthConfig(');
      expect(content).toContain('config: ServerConfig');
      expect(content).toContain('): void');
    });

    it('should validate required Basic Auth when basicAuthRequired is true', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if basicAuthRequired}}');
      expect(content).toContain('if (!config.basicAuth || !config.basicAuth.username || !config.basicAuth.password)');
      expect(content).toContain('Basic Authentication is required for this API');
    });

    it('should provide comprehensive setup instructions in error messages', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('BASIC_AUTH_USERNAME=your-username');
      expect(content).toContain('BASIC_AUTH_PASSWORD=your-password');
      expect(content).toContain('See README.md for detailed configuration instructions');
    });

    it('should include documentation URL if available', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if basicAuthDocUrl}}');
      expect(content).toContain('To obtain credentials, visit: {{basicAuthDocUrl}}');
    });

    it('should handle optional Basic Auth with warning', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{else}}');
      expect(content).toContain('// Basic Authentication is optional');
      expect(content).toContain('console.warn');
      expect(content).toContain('Partial Basic Auth configuration detected');
    });

    it('should warn about partial configuration', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('Both BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD must be set');
      expect(content).toContain('Basic Authentication will not be applied to requests');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when credentials are missing', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('throw new Error(');
      expect(content).toContain('Basic Authentication required but not configured');
    });

    it('should provide helpful error context', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('.env file');
      expect(content).toContain('BASIC_AUTH_USERNAME');
      expect(content).toContain('BASIC_AUTH_PASSWORD');
    });
  });

  describe('Security', () => {
    it('should never log username or password values', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      // Should NOT contain console.log with username or password variables
      expect(content).not.toMatch(/console\.log.*username[^a-zA-Z]/);
      expect(content).not.toMatch(/console\.log.*password[^a-zA-Z]/);
      expect(content).not.toMatch(/console\.log.*\${.*username.*}/);
      expect(content).not.toMatch(/console\.log.*\${.*password.*}/);
    });

    it('should not expose credentials in error messages', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      const errorMessages = content.match(/throw new Error\([^)]+\)/g) || [];
      for (const error of errorMessages) {
        expect(error).not.toContain('${username}');
        expect(error).not.toContain('${password}');
        expect(error).not.toContain('+ username');
        expect(error).not.toContain('+ password');
      }
    });

    it('should only use console.warn for partial config, not credentials', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      // console.warn is OK for warnings, but should not include actual credentials
      expect(content).toContain('console.warn');
      expect(content).not.toMatch(/console\.warn.*\${username}/);
      expect(content).not.toMatch(/console\.warn.*\${password}/);
    });
  });

  describe('Documentation', () => {
    it('should have JSDoc comments for main functions', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('/**');
      expect(content).toContain('* Add Basic Authentication to outgoing request');
      expect(content).toContain('* Validate Basic Authentication configuration');
      expect(content).toContain('@param');
      expect(content).toContain('@returns');
      expect(content).toContain('@throws');
    });

    it('should document the module purpose', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('Basic Authentication Handler');
      expect(content).toContain('@module auth/basic-auth');
    });

    it('should document Authorization header format', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('Authorization: Basic');
      expect(content).toContain('base64(username:password)');
    });

    it('should document UTF-8 character encoding support', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('UTF-8');
      expect(content).toContain('utf-8');
    });
  });

  describe('Type Safety', () => {
    it('should use strict TypeScript types', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      // Should use explicit types, not 'any'
      expect(content).not.toMatch(/:\s*any[^a-zA-Z]/);
    });

    it('should import and use InternalAxiosRequestConfig', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('InternalAxiosRequestConfig');
      expect(content).toContain('config: InternalAxiosRequestConfig');
    });

    it('should use ServerConfig type', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('serverConfig: ServerConfig');
      expect(content).toContain('config: ServerConfig');
    });
  });

  describe('Handlebars Integration', () => {
    it('should use Handlebars conditionals for required/optional auth', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if basicAuthRequired}}');
      expect(content).toContain('{{else}}');
      expect(content).toContain('{{/if}}');
    });

    it('should use Handlebars variable for documentation URL', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if basicAuthDocUrl}}');
      expect(content).toContain('{{basicAuthDocUrl}}');
    });

    it('should handle required vs optional Basic Auth', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if basicAuthRequired}}');
      expect(content).toContain('{{else}}');
      expect(content).toContain('// Basic Authentication is optional');
    });
  });

  describe('Code Structure', () => {
    it('should properly structure Authorization header addition', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain("config.headers['Authorization']");
      expect(content).toContain('`Basic ${credentials}`');
    });

    it('should validate credentials before encoding', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      const credentialsCheckIndex = content.indexOf('if (!username || !password)');
      const encodingIndex = content.indexOf('Buffer.from');

      expect(credentialsCheckIndex).toBeLessThan(encodingIndex);
    });

    it('should handle UTF-8 encoding correctly', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain("Buffer.from(`${username}:${password}`, 'utf-8')");
      expect(content).toContain(".toString('base64')");
    });
  });

  describe('Base64 Encoding', () => {
    it('should use Buffer.from for base64 encoding', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('Buffer.from');
      expect(content).toContain("'utf-8'");
      expect(content).toContain("toString('base64')");
    });

    it('should combine username and password with colon separator', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('`${username}:${password}`');
    });

    it('should store encoded credentials in variable before use', async () => {
      const content = await fs.readFile(BASIC_AUTH_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('const credentials =');
      expect(content).toContain('`Basic ${credentials}`');
    });
  });
});
