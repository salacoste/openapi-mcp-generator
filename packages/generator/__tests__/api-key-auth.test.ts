/**
 * Unit tests for API Key authentication module template
 * Tests header, query parameter, and cookie-based API key auth
 */

import { describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.resolve(__dirname, '../../templates/mcp-server');
const API_KEY_TEMPLATE_PATH = path.join(TEMPLATES_DIR, 'auth/api-key.ts.hbs');

describe('API Key Auth Module Template', () => {
  describe('Template File Existence', () => {
    it('should have api-key.ts.hbs template file in auth directory', async () => {
      const exists = await fs.access(API_KEY_TEMPLATE_PATH)
        .then(() => true)
        .catch(() => false);

      expect(exists).toBe(true);
    });

    it('should contain required exports and functions', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      // Check for required exports
      expect(content).toContain('export interface ApiKeyConfig');
      expect(content).toContain('export function addApiKeyAuth(');
      expect(content).toContain('export function validateApiKeyConfig(');
    });

    it('should import required Axios and config types', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain("import type { InternalAxiosRequestConfig } from 'axios'");
      expect(content).toContain("import type { ServerConfig } from '../config.js'");
    });
  });

  describe('ApiKeyConfig Interface', () => {
    it('should define ApiKeyConfig interface with required fields', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('export interface ApiKeyConfig');
      expect(content).toContain('name: string');
      expect(content).toContain("in: 'header' | 'query' | 'cookie'");
      expect(content).toContain('value: string');
    });
  });

  describe('addApiKeyAuth Function', () => {
    it('should have proper TypeScript function signature', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('export function addApiKeyAuth(');
      expect(content).toContain('config: InternalAxiosRequestConfig');
      expect(content).toContain('serverConfig: ServerConfig');
      expect(content).toContain('): InternalAxiosRequestConfig');
    });

    it('should validate API key is present', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('const apiKey = serverConfig.apiKey');
      expect(content).toContain('if (!apiKey)');
      expect(content).toContain('API Key authentication required but not configured');
      expect(content).toContain('Please set API_KEY in your .env file');
    });

    it('should support header-based API keys', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain("{{#if (eq in 'header')}}");
      expect(content).toContain("config.headers['{{name}}'] = apiKey");
    });

    it('should support query parameter API keys', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain("{{#if (eq in 'query')}}");
      expect(content).toContain('if (!config.params)');
      expect(content).toContain('config.params = {}');
      expect(content).toContain("config.params['{{name}}'] = apiKey");
    });

    it('should support cookie-based API keys', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain("{{#if (eq in 'cookie')}}");
      expect(content).toContain("const existingCookie = config.headers['Cookie'] || ''");
      expect(content).toContain('const newCookie = existingCookie');
      expect(content).toContain("config.headers['Cookie'] = newCookie");
    });

    it('should iterate over all API key schemes', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if apiKeySchemes}}');
      expect(content).toContain('{{#each apiKeySchemes}}');
      expect(content).toContain('{{/each}}');
      expect(content).toContain('{{/if}}');
    });

    it('should include security scheme comments', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('// Security Scheme: {{schemeName}}');
      expect(content).toContain('{{#if description}}');
    });

    it('should return modified config', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('return config');
    });
  });

  describe('validateApiKeyConfig Function', () => {
    it('should have proper TypeScript function signature', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('export function validateApiKeyConfig(');
      expect(content).toContain('config: ServerConfig');
      expect(content).toContain('): void');
    });

    it('should validate required API key', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if apiKeyRequired}}');
      expect(content).toContain('if (!config.apiKey)');
      expect(content).toContain('API Key authentication is required for this API');
    });

    it('should provide clear error messages with setup instructions', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('Please set the API_KEY environment variable');
      expect(content).toContain('API_KEY=your-api-key-here');
      expect(content).toContain('See README.md for detailed configuration instructions');
    });

    it('should include documentation URL if available', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if apiKeyDocUrl}}');
      expect(content).toContain('To obtain an API key, visit: {{apiKeyDocUrl}}');
    });

    it('should handle optional API keys', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if apiKeyRequired}}');
      expect(content).toContain('{{else}}');
      expect(content).toContain('// API key is optional');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when API key is missing', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('throw new Error(');
      expect(content).toContain('API Key authentication required but not configured');
    });

    it('should provide helpful error context', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('.env file');
      expect(content).toContain('API_KEY');
    });
  });

  describe('Security', () => {
    it('should never log API key values', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      // Should NOT contain console.log with apiKey variable
      expect(content).not.toMatch(/console\.log.*apiKey[^a-zA-Z]/);
      expect(content).not.toMatch(/console\.log.*\${apiKey}/);
    });

    it('should not expose API key in error messages', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      // Error messages should not include actual key value
      const errorMessages = content.match(/throw new Error\([^)]+\)/g) || [];
      for (const error of errorMessages) {
        expect(error).not.toContain('${apiKey}');
        expect(error).not.toContain('+ apiKey');
      }
    });
  });

  describe('Documentation', () => {
    it('should have JSDoc comments for main functions', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('/**');
      expect(content).toContain('* Add API Key authentication to outgoing request');
      expect(content).toContain('* Validate API Key configuration');
      expect(content).toContain('@param');
      expect(content).toContain('@returns');
      expect(content).toContain('@throws');
    });

    it('should document the module purpose', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('API Key Authentication Handler');
      expect(content).toContain('@module auth/api-key');
    });

    it('should document supported auth locations', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('header');
      expect(content).toContain('query');
      expect(content).toContain('cookie');
    });
  });

  describe('Type Safety', () => {
    it('should use strict TypeScript types', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      // Should use explicit types, not 'any'
      expect(content).not.toMatch(/:\s*any[^a-zA-Z]/);
    });

    it('should import and use InternalAxiosRequestConfig', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('InternalAxiosRequestConfig');
      expect(content).toContain('config: InternalAxiosRequestConfig');
    });

    it('should use ServerConfig type', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('serverConfig: ServerConfig');
      expect(content).toContain('config: ServerConfig');
    });
  });

  describe('Handlebars Integration', () => {
    it('should use Handlebars conditionals for API key schemes', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if apiKeySchemes}}');
      expect(content).toContain('{{#each apiKeySchemes}}');
      expect(content).toContain('{{#if (eq in');
    });

    it('should use Handlebars variables for scheme metadata', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{schemeName}}');
      expect(content).toContain('{{name}}');
      expect(content).toContain('{{description}}');
    });

    it('should conditionally include documentation URL', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if apiKeyDocUrl}}');
      expect(content).toContain('{{apiKeyDocUrl}}');
    });

    it('should handle required vs optional API keys', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if apiKeyRequired}}');
      expect(content).toContain('{{else}}');
    });
  });

  describe('Cookie Handling', () => {
    it('should preserve existing cookies when adding API key', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain("const existingCookie = config.headers['Cookie'] || ''");
      expect(content).toContain('const newCookie = existingCookie');
      expect(content).toContain('? `${existingCookie};');
    });

    it('should format cookie correctly', async () => {
      const content = await fs.readFile(API_KEY_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{name}}=${apiKey}');
    });
  });
});
