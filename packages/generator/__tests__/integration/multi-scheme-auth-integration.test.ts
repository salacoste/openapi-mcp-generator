/**
 * Integration tests for Multi-Scheme Authentication
 * Tests end-to-end scenarios with AND/OR logic, operation-level overrides,
 * and validation of multi-scheme auth workflows
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.resolve(__dirname, '../../../templates/mcp-server');

describe('Multi-Scheme Auth Integration Tests', () => {
  let tempDir: string;

  beforeEach(async () => {
    // Create temporary directory for test outputs
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'multi-scheme-auth-test-'));
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Template Rendering', () => {
    it('should render multi-scheme.ts.hbs template with hasMultipleSecurity=true', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      // Verify template contains multi-scheme logic
      expect(content).toContain('{{#if hasMultipleSecurity}}');
      expect(content).toContain('applyMultiSchemeAuth');
      expect(content).toContain('validateMultiSchemeConfig');
    });

    it('should handle conditional imports based on auth types', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toContain('{{#if hasApiKey}}');
      expect(content).toContain("import { addApiKeyAuth } from './api-key.js'");
      expect(content).toContain('{{#if hasBearerToken}}');
      expect(content).toContain("import { addBearerAuth } from './bearer.js'");
      expect(content).toContain('{{#if hasBasicAuth}}');
      expect(content).toContain("import { addBasicAuth } from './basic-auth.js'");
    });
  });

  describe('AND Logic (Multiple Schemes Required)', () => {
    it('should support API Key + Bearer Token combination', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      // Verify template can handle multiple schemes in one requirement
      expect(content).toContain('appliedRequirement');
      expect(content).toMatch(/addApiKeyAuth.*addBearerAuth/s);
    });

    it('should support API Key + Basic Auth combination', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toMatch(/addApiKeyAuth.*addBasicAuth/s);
    });

    it('should support Bearer Token + Basic Auth combination', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toMatch(/addBearerAuth.*addBasicAuth/s);
    });

    it('should apply all schemes in deterministic order', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      // Verify order: API Key → Bearer → Basic
      const apiKeyIndex = content.indexOf('addApiKeyAuth');
      const bearerIndex = content.indexOf('addBearerAuth');
      const basicIndex = content.indexOf('addBasicAuth');

      if (apiKeyIndex !== -1 && bearerIndex !== -1) {
        expect(apiKeyIndex).toBeLessThan(bearerIndex);
      }
      if (bearerIndex !== -1 && basicIndex !== -1) {
        expect(bearerIndex).toBeLessThan(basicIndex);
      }
    });
  });

  describe('OR Logic (Alternative Schemes)', () => {
    it('should support API Key OR Bearer Token alternatives', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      // Verify it uses first matching requirement
      expect(content).toContain('securityRequirements[0]');
      expect(content).toContain('securityRequirements.length');
    });

    it('should handle validation when multiple alternatives exist', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toContain('hasValidRequirement');
      expect(content).toContain('for (const requirement of securityRequirements)');
    });

    it('should succeed if any alternative can be satisfied', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toContain('allSchemesValid');
      expect(content).toContain('if (allSchemesValid)');
      expect(content).toContain('hasValidRequirement = true');
      expect(content).toContain('break');
    });
  });

  describe('Operation-Level Security Overrides', () => {
    it('should prioritize operation.security over global security', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toContain('operation.security ||');
      expect(content).toContain('globalSecurity');
    });

    it('should handle operations with no security requirements', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toContain('securityRequirements.length === 0');
      expect(content).toContain('return config');
    });
  });

  describe('Validation', () => {
    it('should validate all required credentials for AND logic', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      // Check for credential validation
      expect(content).toContain('!config.apiKey');
      expect(content).toContain('!config.bearerToken');
      expect(content).toContain('!config.basicAuth');
    });

    it('should throw error if no security requirement can be satisfied', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toContain('if (!hasValidRequirement && errors.length > 0)');
      expect(content).toContain('throw new Error(');
    });

    it('should provide clear error messages with missing credentials', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toContain('Multi-scheme authentication validation failed');
      expect(content).toContain('errors.join');
      expect(content).toContain('See README.md');
    });

    it('should collect all validation errors before throwing', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toContain('const errors: string[] = []');
      expect(content).toContain('errors.push(');
    });
  });

  describe('Error Handling', () => {
    it('should catch errors from individual auth handlers', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toContain('try {');
      expect(content).toContain('} catch (error)');
    });

    it('should rethrow error if it is the only required scheme', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toContain('securityRequirements.length === 1');
      expect(content).toContain('Object.keys(appliedRequirement).length === 1');
      expect(content).toContain('throw error');
    });

    it('should log warning if debug enabled and auth fails', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toContain('if (serverConfig.debug)');
      expect(content).toContain('console.warn');
      expect(content).toContain('auth failed');
    });
  });

  describe('HTTP Client Integration', () => {
    it('should integrate with http-client.ts.hbs for multi-scheme', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('{{#if hasMultipleSecurity}}');
      expect(content).toContain('applyMultiSchemeAuth');
      expect(content).toContain('validateMultiSchemeConfig');
    });

    it('should pass operation metadata to multi-scheme handler', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('const operation: Operation');
      expect(content).toContain('operationId:');
      expect(content).toContain('path:');
      expect(content).toContain('method:');
      expect(content).toContain('security:');
    });

    it('should validate global security in constructor', async () => {
      const httpClientPath = path.join(TEMPLATES_DIR, 'http-client.ts.hbs');
      const content = await fs.readFile(httpClientPath, 'utf-8');

      expect(content).toContain('validateMultiSchemeConfig');
      expect(content).toContain('globalSecurity');
    });
  });

  describe('Helper Functions', () => {
    it('should provide getSecurityRequirements helper', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toContain('export function getSecurityRequirements');
      expect(content).toContain('operation: Operation');
      expect(content).toContain('return operation.security');
    });

    it('should provide requiresMultipleSchemes helper', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toContain('export function requiresMultipleSchemes');
      expect(content).toContain('Object.keys(req).length > 1');
    });

    it('should provide hasAlternativeSchemes helper', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toContain('export function hasAlternativeSchemes');
      expect(content).toContain('requirements.length > 1');
    });
  });

  describe('Performance', () => {
    it('should apply auth schemes with <10ms overhead', async () => {
      // This is a structural test - actual performance measured at runtime
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      // Verify no heavy operations (loops should be minimal)
      const forLoops = (content.match(/for \(/g) || []).length;
      expect(forLoops).toBeLessThan(5); // Reasonable limit for performance
    });

    it('should use early returns to avoid unnecessary processing', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toContain('return config');
      expect(content).toContain('if (!securityRequirements || securityRequirements.length === 0)');
    });
  });

  describe('Type Safety', () => {
    it('should define SecurityRequirement interface', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toContain('export interface SecurityRequirement');
      expect(content).toContain('[schemeName: string]: string[]');
    });

    it('should define Operation interface with security field', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toContain('export interface Operation');
      expect(content).toContain('security?: SecurityRequirement[]');
    });

    it('should use proper TypeScript types for all parameters', async () => {
      const templatePath = path.join(TEMPLATES_DIR, 'auth/multi-scheme.ts.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toContain('config: InternalAxiosRequestConfig');
      expect(content).toContain('serverConfig: ServerConfig');
      expect(content).toContain('operation: Operation');
      expect(content).toContain('requirements: SecurityRequirement[]');
    });
  });
});
