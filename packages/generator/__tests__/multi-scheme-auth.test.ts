/**
 * Unit tests for Multi-Scheme Authentication Module Template
 * Tests AND logic (multiple schemes required) and OR logic (alternative schemes)
 */

import { describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.resolve(__dirname, '../../templates/mcp-server');
const MULTI_SCHEME_TEMPLATE_PATH = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');

describe('Multi-Scheme Auth Module Template', () => {
  describe('Template File Existence', () => {
    it('should have multi-scheme.ts.hbs template file in auth directory', async () => {
      const exists = await fs.access(MULTI_SCHEME_TEMPLATE_PATH)
        .then(() => true)
        .catch(() => false);

      expect(exists).toBe(true);
    });

    it('should contain required exports and functions', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      // Check for required exports
      expect(content).toContain('export interface SecurityRequirement');
      expect(content).toContain('export interface Operation');
      expect(content).toContain('export function applyMultiSchemeAuth(');
      expect(content).toContain('export function validateMultiSchemeConfig(');
      expect(content).toContain('export function getSecurityRequirements(');
      expect(content).toContain('export function requiresMultipleSchemes(');
      expect(content).toContain('export function hasAlternativeSchemes(');
    });

    it('should import required dependencies', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain("import type { InternalAxiosRequestConfig } from 'axios'");
      expect(content).toContain("import type { ServerConfig } from '../config.js'");
    });
  });

  describe('SecurityRequirement Interface', () => {
    it('should define SecurityRequirement interface with string array values', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('export interface SecurityRequirement');
      expect(content).toContain('[schemeName: string]: string[]');
    });
  });

  describe('Operation Interface', () => {
    it('should define Operation interface with required fields', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('export interface Operation');
      expect(content).toContain('operationId: string');
      expect(content).toContain('path: string');
      expect(content).toContain('method: string');
      expect(content).toContain('security?: SecurityRequirement[]');
    });
  });

  describe('applyMultiSchemeAuth Function', () => {
    it('should define applyMultiSchemeAuth with correct signature', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('export function applyMultiSchemeAuth(');
      expect(content).toContain('config: InternalAxiosRequestConfig');
      expect(content).toContain('serverConfig: ServerConfig');
      expect(content).toContain('operation: Operation');
      expect(content).toContain('): InternalAxiosRequestConfig');
    });

    it('should support operation-level security override', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      // Check for operation.security priority
      expect(content).toContain('operation.security ||');
    });

    it('should apply schemes in deterministic order (API Key → Bearer → Basic)', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      // Find all auth handler calls
      const apiKeyMatch = content.indexOf('addApiKeyAuth');
      const bearerMatch = content.indexOf('addBearerAuth');
      const basicMatch = content.indexOf('addBasicAuth');

      // Verify order if all are present (-1 means not found)
      if (apiKeyMatch !== -1 && bearerMatch !== -1) {
        expect(apiKeyMatch).toBeLessThan(bearerMatch);
      }
      if (bearerMatch !== -1 && basicMatch !== -1) {
        expect(bearerMatch).toBeLessThan(basicMatch);
      }
    });

    it('should handle AND logic (multiple schemes in one requirement)', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      // Check that it processes all schemes in a requirement
      expect(content).toContain('appliedRequirement');
      // Verify conditional checks for each scheme type
      expect(content).toMatch(/if.*in appliedRequirement/);
    });

    it('should handle OR logic (multiple requirements)', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      // Check for first requirement selection (OR logic)
      expect(content).toContain('securityRequirements[0]');
    });

    it('should include error handling with try-catch blocks', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('try {');
      expect(content).toContain('} catch (error)');
    });

    it('should support debug logging for auth failures', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('serverConfig.debug');
      expect(content).toContain('console.warn');
    });
  });

  describe('validateMultiSchemeConfig Function', () => {
    it('should define validateMultiSchemeConfig with correct signature', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('export function validateMultiSchemeConfig(');
      expect(content).toContain('config: ServerConfig');
      expect(content).toContain('securityRequirements: SecurityRequirement[]');
    });

    it('should validate that at least one requirement can be satisfied', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('hasValidRequirement');
      expect(content).toMatch(/for.*requirement.*of.*securityRequirements/);
    });

    it('should collect and report all missing credentials', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('errors:');
      expect(content).toContain('errors.push(');
      expect(content).toContain('errors.join(');
    });

    it('should throw error if no requirement can be satisfied', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('throw new Error(');
      expect(content).toContain('Multi-scheme authentication validation failed');
    });
  });

  describe('getSecurityRequirements Function', () => {
    it('should define getSecurityRequirements with correct signature', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('export function getSecurityRequirements(');
      expect(content).toContain('operation: Operation');
      expect(content).toContain('): SecurityRequirement[]');
    });

    it('should return operation.security if present', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('if (operation.security)');
      expect(content).toContain('return operation.security');
    });

    it('should return global security as fallback', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toMatch(/return \[[\s\S]*globalSecurity/);
    });
  });

  describe('requiresMultipleSchemes Function', () => {
    it('should define requiresMultipleSchemes with correct signature', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('export function requiresMultipleSchemes(');
      expect(content).toContain('requirements: SecurityRequirement[]');
      expect(content).toContain('): boolean');
    });

    it('should check if any requirement has multiple schemes', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('requirements.some(');
      expect(content).toContain('Object.keys(req).length > 1');
    });
  });

  describe('hasAlternativeSchemes Function', () => {
    it('should define hasAlternativeSchemes with correct signature', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('export function hasAlternativeSchemes(');
      expect(content).toContain('requirements: SecurityRequirement[]');
      expect(content).toContain('): boolean');
    });

    it('should check if there are multiple requirements', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('requirements.length > 1');
    });
  });

  describe('Template Logic', () => {
    it('should use Handlebars conditionals for hasMultipleSecurity', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if hasMultipleSecurity}}');
      expect(content).toContain('{{/if}}');
    });

    it('should use Handlebars each loops for processing schemes', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#each');
      expect(content).toContain('{{/each}}');
    });

    it('should handle conditional imports for auth modules', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#if hasApiKey}}');
      expect(content).toContain('{{#if hasBearerToken}}');
      expect(content).toContain('{{#if hasBasicAuth}}');
    });
  });

  describe('Error Messages', () => {
    it('should provide clear error messages for missing credentials', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('Multi-scheme authentication validation failed');
      expect(content).toContain('Please configure the required credentials');
      expect(content).toContain('See README.md');
    });

    it('should include scheme names in error messages', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('Missing API Key for scheme');
      expect(content).toContain('Missing Bearer Token for scheme');
      expect(content).toContain('Missing Basic Auth credentials for scheme');
    });
  });

  describe('Documentation', () => {
    it('should have JSDoc comments for public functions', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('/**');
      expect(content).toContain(' * Apply multi-scheme authentication');
      expect(content).toContain(' * @param');
      expect(content).toContain(' * @returns');
      expect(content).toContain(' * @throws');
    });

    it('should have examples in JSDoc for AND and OR logic', async () => {
      const content = await fs.readFile(MULTI_SCHEME_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('@example');
      expect(content).toContain('AND logic');
      expect(content).toContain('OR logic');
    });
  });
});
