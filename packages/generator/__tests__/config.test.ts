/**
 * Unit tests for configuration module template
 * Tests environment variable parsing, validation, and error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Template test utilities
const TEMPLATES_DIR = path.resolve(__dirname, '../../templates/mcp-server');
const CONFIG_TEMPLATE_PATH = path.join(TEMPLATES_DIR, 'config.ts.hbs');

describe('Config Module Template', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Clear all config-related environment variables
    delete process.env.API_KEY;
    delete process.env.BEARER_TOKEN;
    delete process.env.BASIC_AUTH_USERNAME;
    delete process.env.BASIC_AUTH_PASSWORD;
    delete process.env.API_BASE_URL;
    delete process.env.API_TIMEOUT;
    delete process.env.DEBUG;
    delete process.env.RETRY_ATTEMPTS;
    delete process.env.RETRY_DELAY;
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('Template File Existence', () => {
    it('should have config.ts.hbs template file', async () => {
      const exists = await fs.access(CONFIG_TEMPLATE_PATH)
        .then(() => true)
        .catch(() => false);

      expect(exists).toBe(true);
    });

    it('should contain required exports and functions', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      // Check for required exports
      expect(content).toContain('export interface ServerConfig');
      expect(content).toContain('export interface SecurityRequirements');
      expect(content).toContain('export function loadConfig()');

      // Check for required functions
      expect(content).toContain('function parseBasicAuth()');
      expect(content).toContain('function parseBaseURL()');
      expect(content).toContain('function parseTimeout()');
      expect(content).toContain('function parseDebug()');
      expect(content).toContain('function parseRetryAttempts()');
      expect(content).toContain('function parseRetryDelay()');
      expect(content).toContain('function validateConfig(');
      expect(content).toContain('function logConfig(');
    });

    it('should import dotenv for environment variable loading', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain("import { config as loadEnv } from 'dotenv'");
      expect(content).toContain('loadEnv()');
    });

    it('should have proper TypeScript type definitions', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      // Check ServerConfig interface
      expect(content).toContain('apiKey?: string');
      expect(content).toContain('bearerToken?: string');
      expect(content).toContain('basicAuth?: {');
      expect(content).toContain('username: string');
      expect(content).toContain('password: string');
      expect(content).toContain('baseURL: string');
      expect(content).toContain('timeout: number');
      expect(content).toContain('debug: boolean');
      expect(content).toContain('retryAttempts: number');
      expect(content).toContain('retryDelay: number');
    });
  });

  describe('Environment Variable Mapping', () => {
    it('should map API_KEY to config.apiKey', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('apiKey: process.env.API_KEY');
    });

    it('should map BEARER_TOKEN to config.bearerToken', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('bearerToken: process.env.BEARER_TOKEN');
    });

    it('should map BASIC_AUTH credentials to config.basicAuth', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('process.env.BASIC_AUTH_USERNAME');
      expect(content).toContain('process.env.BASIC_AUTH_PASSWORD');
    });

    it('should map API_BASE_URL to config.baseURL', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('process.env.API_BASE_URL');
    });

    it('should map API_TIMEOUT to config.timeout', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      // Updated to use DRY helper parseNumericEnvVar
      expect(content).toContain("'API_TIMEOUT'");
    });

    it('should map DEBUG to config.debug', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('process.env.DEBUG');
    });

    it('should map RETRY_ATTEMPTS to config.retryAttempts', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      // Updated to use DRY helper parseNumericEnvVar
      expect(content).toContain("'RETRY_ATTEMPTS'");
    });

    it('should map RETRY_DELAY to config.retryDelay', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      // Updated to use DRY helper parseNumericEnvVar
      expect(content).toContain("'RETRY_DELAY'");
    });
  });

  describe('Default Values', () => {
    it('should have default timeout of 30000ms', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      // Updated to use constant DEFAULT_TIMEOUT_MS
      expect(content).toContain('const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds');
    });

    it('should have default debug value of false', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      // parseDebug returns true only for specific values, false otherwise
      expect(content).toContain("debug === 'true' || debug === '1' || debug === 'yes'");
    });

    it('should have default retryAttempts of 3', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      // Updated to use constant DEFAULT_RETRY_ATTEMPTS
      expect(content).toContain('const DEFAULT_RETRY_ATTEMPTS = 3;');
    });

    it('should have default retryDelay of 1000ms', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      // Updated to use constant DEFAULT_RETRY_DELAY_MS
      expect(content).toContain('const DEFAULT_RETRY_DELAY_MS = 1000; // 1 second');
    });
  });

  describe('Validation Logic', () => {
    it('should validate required API_KEY when hasApiKey is true', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('if (SECURITY_REQUIREMENTS.hasApiKey && !config.apiKey)');
      expect(content).toContain('Missing required API_KEY environment variable');
    });

    it('should validate required BEARER_TOKEN when hasBearerToken is true', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('if (SECURITY_REQUIREMENTS.hasBearerToken && !config.bearerToken)');
      expect(content).toContain('Missing required BEARER_TOKEN environment variable');
    });

    it('should validate required Basic Auth when hasBasicAuth is true', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('if (SECURITY_REQUIREMENTS.hasBasicAuth && !config.basicAuth)');
      expect(content).toContain('Missing required BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD');
    });

    it('should validate baseURL format using URL constructor', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('new URL(baseURL)');
      expect(content).toContain('Invalid API_BASE_URL format');
    });

    it('should validate timeout is positive number', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      // Updated to use DRY helper with 'positive' constraint
      expect(content).toContain("constraint === 'positive'");
      expect(content).toContain('!isNaN(parsed) && parsed > 0');
      // Error message uses template literal with envVarName
      expect(content).toContain('Invalid ${envVarName} value');
      expect(content).toContain('Must be a positive number');
    });

    it('should validate retryAttempts is non-negative integer', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      // Updated to use DRY helper with 'non-negative' constraint
      expect(content).toContain("constraint === 'positive'");
      expect(content).toContain('!isNaN(parsed) && parsed >= 0');
      // Error message uses template literal with envVarName
      expect(content).toContain('Invalid ${envVarName} value');
      expect(content).toContain('Must be a non-negative integer');
    });
  });

  describe('Error Handling', () => {
    it('should throw clear error for missing required credentials', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('Configuration validation failed');
      expect(content).toContain('Please check your .env file');
    });

    it('should include suggested fixes in error messages', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('Please set API_BASE_URL in your .env file');
      expect(content).toContain('Must be a valid URL (e.g., https://api.example.com)');
      // Updated to match DRY helper error message format
      expect(content).toContain('in milliseconds (e.g., 30000)');
    });

    it('should provide helpful context in validation errors', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('This API requires API Key authentication');
      expect(content).toContain('This API requires Bearer Token authentication');
      expect(content).toContain('This API requires Basic Authentication');
    });
  });

  describe('Security: Credential Masking', () => {
    it('should mask API key in logs', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain("console.log('  API Key: ***hidden***')");
    });

    it('should mask bearer token in logs', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain("console.log('  Bearer Token: ***hidden***')");
    });

    it('should mask basic auth credentials in logs', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain("console.log('  Basic Auth: ***hidden***')");
    });

    it('should never log credential values directly', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      // Check that logConfig function only logs masked credentials
      const logConfigFunction = content.substring(
        content.indexOf('function logConfig('),
        content.indexOf('function logConfig(') + 500
      );

      expect(logConfigFunction).not.toContain('config.apiKey}');
      expect(logConfigFunction).not.toContain('config.bearerToken}');
      expect(logConfigFunction).not.toContain('config.basicAuth.username');
      expect(logConfigFunction).not.toContain('config.basicAuth.password');
    });

    it('should only log credentials when debug mode is enabled', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('if (config.debug) {');
      expect(content).toContain('logConfig(config)');
    });
  });

  describe('Documentation', () => {
    it('should have JSDoc comments for main functions', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('/**');
      expect(content).toContain('* Load and validate server configuration');
      expect(content).toContain('@returns');
      expect(content).toContain('@throws');
    });

    it('should document all configuration interfaces', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('* Server configuration interface');
      expect(content).toContain('* Security requirements from OpenAPI specification');
    });

    it('should have clear inline comments for complex logic', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('// Load .env file');
      expect(content).toContain('// Parse environment variables');
      expect(content).toContain('// Validate configuration');
      expect(content).toContain('// Mask credentials');
    });
  });

  describe('Template Handlebars Integration', () => {
    it('should use Handlebars placeholders for API-specific values', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{hasApiKey}}');
      expect(content).toContain('{{hasBearerToken}}');
      expect(content).toContain('{{hasBasicAuth}}');
      expect(content).toContain('{{defaultBaseURL}}');
    });

    it('should use Handlebars each helper for required auth array', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('{{#each requiredAuth}}');
      expect(content).toContain("'{{this}}'");
      expect(content).toContain('{{/each}}');
    });

    it('should have proper comment for generated security requirements', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('// Generated from OpenAPI security schemes');
    });
  });

  describe('Type Safety', () => {
    it('should have no any types in configuration code', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      // Should not contain ": any" type annotations
      expect(content).not.toMatch(/:\s*any[^a-zA-Z]/);
    });

    it('should use strict TypeScript types throughout', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain(': string');
      expect(content).toContain(': number');
      expect(content).toContain(': boolean');
      expect(content).toContain('ServerConfig');
    });

    it('should use proper return types for all functions', async () => {
      const content = await fs.readFile(CONFIG_TEMPLATE_PATH, 'utf-8');

      expect(content).toContain('): ServerConfig');
      expect(content).toContain('): string');
      expect(content).toContain('): number');
      expect(content).toContain('): boolean');
      expect(content).toContain('): void');
    });
  });
});
