/**
 * Unit tests for Bearer Token authentication module template
 * Tests Authorization header, JWT validation, and error handling
 */

import { describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.resolve(__dirname, '../../templates/mcp-server');
const BEARER_TEMPLATE_PATH = path.join(TEMPLATES_DIR, 'auth/bearer.ts.hbs');

describe('Bearer Token Auth Module Template', () => {
  describe('Template File Existence', () => {
    it('should have bearer.ts.hbs template file in auth directory', async () => {
      const exists = await fs.access(BEARER_TEMPLATE_PATH)
        .then(() => true)
        .catch(() => false);

      expect(exists).toBe(true);
    });

    it('should contain required exports and functions', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('export function addBearerAuth(');
      expect(content).toContain('export function validateBearerConfig(');
    });

    it('should import required Axios and config types', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain("import type { InternalAxiosRequestConfig } from 'axios'");
      expect(content).toContain("import type { ServerConfig } from '../config.js'");
    });
  });

  describe('addBearerAuth Function', () => {
    it('should have proper TypeScript function signature', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('export function addBearerAuth(');
      expect(content).toContain('config: InternalAxiosRequestConfig');
      expect(content).toContain('serverConfig: ServerConfig');
      expect(content).toContain('): InternalAxiosRequestConfig');
    });

    it('should validate bearer token is present', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('const bearerToken = serverConfig.bearerToken');
      expect(content).toContain('if (!bearerToken)');
      expect(content).toContain('Bearer Token authentication required but not configured');
      expect(content).toContain('Please set BEARER_TOKEN in your .env file');
    });

    it('should add Authorization header with Bearer format', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain("config.headers['Authorization'] = `Bearer ${bearerToken}`");
    });

    it('should support JWT format validation', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if bearerFormat}}');
      expect(content).toContain("{{#if (eq bearerFormat 'JWT')}}");
      expect(content).toContain('isValidJWT(bearerToken)');
    });

    it('should include JWT validation function when bearerFormat is JWT', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('function isValidJWT(token: string): boolean');
      expect(content).toContain("const parts = token.split('.')");
      expect(content).toContain('parts.length === 3');
    });

    it('should warn about invalid JWT format', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('console.warn');
      expect(content).toContain('does not appear to be a valid JWT format');
      expect(content).toContain('header.payload.signature');
    });

    it('should return modified config', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('return config');
    });
  });

  describe('validateBearerConfig Function', () => {
    it('should have proper TypeScript function signature', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('export function validateBearerConfig(');
      expect(content).toContain('config: ServerConfig');
      expect(content).toContain('): void');
    });

    it('should validate required bearer token', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if bearerRequired}}');
      expect(content).toContain('if (!config.bearerToken)');
      expect(content).toContain('Bearer Token authentication is required for this API');
    });

    it('should provide clear error messages with setup instructions', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('Please set the BEARER_TOKEN environment variable');
      expect(content).toContain('BEARER_TOKEN=your-bearer-token-here');
      expect(content).toContain('See README.md for detailed configuration instructions');
    });

    it('should include bearer format in error message if specified', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if bearerFormat}}');
      expect(content).toContain('Expected format: {{bearerFormat}}');
    });

    it('should include JWT example in error message when format is JWT', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain("{{#if (eq bearerFormat 'JWT')}}");
      expect(content).toContain('Example: BEARER_TOKEN=eyJhbGciOiJIUzI1NiIs');
    });

    it('should include documentation URL if available', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if bearerTokenDocUrl}}');
      expect(content).toContain('To obtain a bearer token, visit: {{bearerTokenDocUrl}}');
    });

    it('should handle optional bearer tokens', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if bearerRequired}}');
      expect(content).toContain('{{else}}');
      expect(content).toContain('// Bearer token is optional');
    });
  });

  describe('JWT Format Validation', () => {
    it('should have isValidJWT function for JWT format', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('function isValidJWT(token: string): boolean');
    });

    it('should check for 3 parts separated by dots', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain("token.split('.')");
      expect(content).toContain('parts.length === 3');
    });

    it('should check each part is non-empty', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('parts.every(part => part.length > 0)');
    });

    it('should document JWT validation limitations', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('Basic JWT format validation');
      expect(content).toContain('validates structure, not signature');
    });
  });

  describe('Token Refresh Placeholder', () => {
    it('should include token refresh placeholder comment', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('Token Refresh Placeholder');
      expect(content).toContain('TODO: Implement token refresh logic');
    });

    it('should document token refresh implementation steps', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('Detecting 401');
      expect(content).toContain('Calling refresh token endpoint');
      expect(content).toContain('Updating stored bearer token');
      expect(content).toContain('Retrying the original failed request');
    });

    it('should include token refresh function examples in comments', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('setupTokenRefresh');
      expect(content).toContain('refreshAccessToken');
      expect(content).toContain('interceptors.response.use');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when bearer token is missing', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('throw new Error(');
      expect(content).toContain('Bearer Token authentication required but not configured');
    });

    it('should provide helpful error context', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('.env file');
      expect(content).toContain('BEARER_TOKEN');
    });
  });

  describe('Security', () => {
    it('should never log bearer token values', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      // Should NOT contain console.log with bearerToken variable
      expect(content).not.toMatch(/console\.log.*bearerToken[^a-zA-Z]/);
      expect(content).not.toMatch(/console\.log.*\${bearerToken}/);
    });

    it('should not expose bearer token in error messages', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      const errorMessages = content.match(/throw new Error\([^)]+\)/g) || [];
      for (const error of errorMessages) {
        expect(error).not.toContain('${bearerToken}');
        expect(error).not.toContain('+ bearerToken');
      }
    });

    it('should only use console.warn for JWT format validation', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      // console.warn is OK for validation warnings, but should not include token
      expect(content).toContain('console.warn');
      expect(content).not.toMatch(/console\.warn.*\${bearerToken}/);
    });
  });

  describe('Documentation', () => {
    it('should have JSDoc comments for main functions', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('/**');
      expect(content).toContain('* Add Bearer Token authentication to outgoing request');
      expect(content).toContain('* Validate Bearer Token configuration');
      expect(content).toContain('@param');
      expect(content).toContain('@returns');
      expect(content).toContain('@throws');
    });

    it('should document the module purpose', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('Bearer Token Authentication Handler');
      expect(content).toContain('@module auth/bearer');
    });

    it('should document Authorization header format', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('Authorization: Bearer');
      expect(content).toContain('Bearer <token>');
    });
  });

  describe('Type Safety', () => {
    it('should use strict TypeScript types', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      // Should use explicit types, not 'any'
      expect(content).not.toMatch(/:\s*any[^a-zA-Z]/);
    });

    it('should import and use InternalAxiosRequestConfig', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('InternalAxiosRequestConfig');
      expect(content).toContain('config: InternalAxiosRequestConfig');
    });

    it('should use ServerConfig type', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('serverConfig: ServerConfig');
      expect(content).toContain('config: ServerConfig');
    });

    it('should type JWT validation function properly', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('function isValidJWT(token: string): boolean');
    });
  });

  describe('Handlebars Integration', () => {
    it('should use Handlebars conditionals for bearer format', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if bearerFormat}}');
      expect(content).toContain("{{#if (eq bearerFormat 'JWT')}}");
    });

    it('should use Handlebars variables for bearer metadata', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{bearerFormat}}');
      expect(content).toContain('{{bearerTokenDocUrl}}');
    });

    it('should conditionally include documentation URL', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if bearerTokenDocUrl}}');
    });

    it('should handle required vs optional bearer tokens', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if bearerRequired}}');
      expect(content).toContain('{{else}}');
    });
  });

  describe('Code Structure', () => {
    it('should properly structure Authorization header addition', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain("config.headers['Authorization']");
      expect(content).toContain('`Bearer ${bearerToken}`');
    });

    it('should validate token before adding to header', async () => {
      const content = await fs.readFile(BEARER_TEMPLATE_PATH, 'utf-8');

      const tokenCheckIndex = content.indexOf('if (!bearerToken)');
      const headerIndex = content.indexOf("config.headers['Authorization']");

      expect(tokenCheckIndex).toBeLessThan(headerIndex);
    });
  });
});
