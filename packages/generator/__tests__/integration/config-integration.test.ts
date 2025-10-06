/**
 * Integration tests for configuration module
 * Tests config loading, template generation, and end-to-end scenarios
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.resolve(__dirname, '../../../templates/mcp-server');

describe('Config Integration Tests', () => {
  let testDir: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    // Save original environment
    originalEnv = { ...process.env };

    // Create temporary test directory
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'config-test-'));
  });

  afterEach(async () => {
    // Restore environment
    process.env = originalEnv;

    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Template File Structure', () => {
    it('should have all required template files for config', async () => {
      const requiredFiles = [
        'config.ts.hbs',
        '.env.example.hbs',
        'package.json.hbs',
        'README.md.hbs',
        'index.ts.hbs',
      ];

      for (const file of requiredFiles) {
        const filePath = path.join(TEMPLATES_DIR, file);
        const exists = await fs.access(filePath)
          .then(() => true)
          .catch(() => false);

        expect(exists, `Template file ${file} should exist`).toBe(true);
      }
    });

    it('should have config template with proper module structure', async () => {
      const configPath = path.join(TEMPLATES_DIR, 'config.ts.hbs');
      const content = await fs.readFile(configPath, 'utf-8');

      // Check module structure
      expect(content).toContain('export interface ServerConfig');
      expect(content).toContain('export interface SecurityRequirements');
      expect(content).toContain('export function loadConfig()');

      // Check imports
      expect(content).toContain("import { config as loadEnv } from 'dotenv'");
      expect(content).toContain("import { URL } from 'url'");
    });
  });

  describe('.env.example Template', () => {
    it('should have comprehensive .env.example template', async () => {
      const envExamplePath = path.join(TEMPLATES_DIR, '.env.example.hbs');
      const content = await fs.readFile(envExamplePath, 'utf-8');

      // Check required sections
      expect(content).toContain('# API Configuration (Required)');
      expect(content).toContain('# Authentication Credentials');
      expect(content).toContain('# Advanced Configuration (Optional)');

      // Check environment variables
      expect(content).toContain('API_BASE_URL=');
      expect(content).toContain('API_TIMEOUT=30000');
      expect(content).toContain('DEBUG=false');
      expect(content).toContain('RETRY_ATTEMPTS=3');
      expect(content).toContain('RETRY_DELAY=1000');
    });

    it('should have conditional auth sections with Handlebars helpers', async () => {
      const envExamplePath = path.join(TEMPLATES_DIR, '.env.example.hbs');
      const content = await fs.readFile(envExamplePath, 'utf-8');

      expect(content).toContain('{{#if hasApiKey}}');
      expect(content).toContain('API_KEY=your-api-key-here');
      expect(content).toContain('{{/if}}');

      expect(content).toContain('{{#if hasBearerToken}}');
      expect(content).toContain('BEARER_TOKEN=your-bearer-token-here');

      expect(content).toContain('{{#if hasBasicAuth}}');
      expect(content).toContain('BASIC_AUTH_USERNAME=');
      expect(content).toContain('BASIC_AUTH_PASSWORD=');
    });

    it('should include helpful comments and documentation', async () => {
      const envExamplePath = path.join(TEMPLATES_DIR, '.env.example.hbs');
      const content = await fs.readFile(envExamplePath, 'utf-8');

      expect(content).toContain('# Copy this file to .env');
      expect(content).toContain('# Required:');
      expect(content).toContain('# Example:');
      expect(content).toContain('# Values:');
      expect(content).toContain('# Use 0 to disable');
    });
  });

  describe('README Configuration Section', () => {
    it('should have comprehensive configuration documentation', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      // Check main configuration section
      expect(content).toContain('## Configuration');
      expect(content).toContain('### 1. Create .env file');
      expect(content).toContain('### 2. Configure Required Variables');
      expect(content).toContain('### 3. Configure Optional Variables');
      expect(content).toContain('### Troubleshooting Configuration');
    });

    it('should document all environment variables with details', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      // Check API_BASE_URL documentation
      expect(content).toContain('#### API_BASE_URL');
      expect(content).toContain('- **Type:** String (URL)');
      expect(content).toContain('- **Required:** Yes');

      // Check API_TIMEOUT documentation
      expect(content).toContain('#### API_TIMEOUT');
      expect(content).toContain('- **Default:** 30000');
      expect(content).toContain('- **Range:** 1000 - 300000');

      // Check DEBUG documentation
      expect(content).toContain('#### DEBUG');
      expect(content).toContain('- **Type:** Boolean');
      expect(content).toContain('- **Values:** `true`, `false`');
    });

    it('should include troubleshooting section with common errors', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('**Error: "Missing required API_KEY environment variable"**');
      expect(content).toContain('**Error: "Invalid API_BASE_URL format"**');
      expect(content).toContain('**Error: "Invalid API_TIMEOUT value"**');
      expect(content).toContain('**Debug Mode**');
    });

    it('should have conditional documentation for auth methods', async () => {
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('{{#if hasApiKey}}');
      expect(content).toContain('#### API_KEY');

      expect(content).toContain('{{#if hasBearerToken}}');
      expect(content).toContain('#### BEARER_TOKEN');

      expect(content).toContain('{{#if hasBasicAuth}}');
      expect(content).toContain('#### BASIC_AUTH_USERNAME');
      expect(content).toContain('#### BASIC_AUTH_PASSWORD');
    });
  });

  describe('MCP Server Integration', () => {
    it('should import and use config module in index.ts', async () => {
      const indexPath = path.join(TEMPLATES_DIR, 'index.ts.hbs');
      const content = await fs.readFile(indexPath, 'utf-8');

      // Check config import
      expect(content).toContain("import { loadConfig } from './config.js'");

      // Check config loading with error handling
      expect(content).toContain('config = loadConfig()');
      expect(content).toContain('catch (error)');
      expect(content).toContain('Configuration Error');
      expect(content).toContain('process.exit(1)');
    });

    it('should use config values in HTTP client initialization', async () => {
      const indexPath = path.join(TEMPLATES_DIR, 'index.ts.hbs');
      const content = await fs.readFile(indexPath, 'utf-8');

      // Check config usage in HTTP client
      expect(content).toContain('baseURL: config.baseURL');
      expect(content).toContain('timeout: config.timeout');
      expect(content).toContain('retryCount: config.retryAttempts');
      expect(content).toContain('retryDelay: config.retryDelay');
      expect(content).toContain('debug: config.debug');
    });

    it('should use config.debug for DEBUG flag', async () => {
      const indexPath = path.join(TEMPLATES_DIR, 'index.ts.hbs');
      const content = await fs.readFile(indexPath, 'utf-8');

      expect(content).toContain('const DEBUG = config.debug');
    });

    it('should provide helpful error message on config failure', async () => {
      const indexPath = path.join(TEMPLATES_DIR, 'index.ts.hbs');
      const content = await fs.readFile(indexPath, 'utf-8');

      expect(content).toContain('Please check your .env file');
      expect(content).toContain('See README.md for configuration instructions');
    });
  });

  describe('Package.json Dependencies', () => {
    it('should include dotenv dependency', async () => {
      const packagePath = path.join(TEMPLATES_DIR, 'package.json.hbs');
      const content = await fs.readFile(packagePath, 'utf-8');

      expect(content).toContain('"dotenv":');
    });

    it('should have dotenv version ^16.4.1 or higher', async () => {
      const packagePath = path.join(TEMPLATES_DIR, 'package.json.hbs');
      const content = await fs.readFile(packagePath, 'utf-8');

      // Should have dotenv with version
      expect(content).toMatch(/"dotenv":\s*"\^16\.\d+\.\d+"/);
    });
  });

  describe('Template Consistency', () => {
    it('should use consistent Handlebars variable names across templates', async () => {
      const configPath = path.join(TEMPLATES_DIR, 'config.ts.hbs');
      const envPath = path.join(TEMPLATES_DIR, '.env.example.hbs');
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');

      const configContent = await fs.readFile(configPath, 'utf-8');
      const envContent = await fs.readFile(envPath, 'utf-8');
      const readmeContent = await fs.readFile(readmePath, 'utf-8');

      // Common Handlebars variables should be used consistently
      const commonVars = [
        'hasApiKey',
        'hasBearerToken',
        'hasBasicAuth',
        'defaultBaseURL',
        'apiName',
      ];

      for (const varName of commonVars) {
        const pattern = new RegExp(`\\{\\{${varName}\\}\\}`);

        // At least some templates should use each variable
        const usedInConfig = pattern.test(configContent);
        const usedInEnv = pattern.test(envContent);
        const usedInReadme = pattern.test(readmeContent);

        expect(
          usedInConfig || usedInEnv || usedInReadme,
          `Variable {{${varName}}} should be used in at least one template`
        ).toBe(true);
      }
    });

    it('should have matching error messages between config and README', async () => {
      const configPath = path.join(TEMPLATES_DIR, 'config.ts.hbs');
      const readmePath = path.join(TEMPLATES_DIR, 'README.md.hbs');

      const configContent = await fs.readFile(configPath, 'utf-8');
      const readmeContent = await fs.readFile(readmePath, 'utf-8');

      // Error messages in config should be documented in README
      // Config uses DRY helper with template literals, README shows actual error messages
      const configPatterns = [
        'Missing required API_KEY environment variable',
        'Invalid API_BASE_URL format',
        'Invalid ${envVarName} value', // DRY helper template literal
      ];

      const readmePatterns = [
        'Missing required API_KEY environment variable',
        'Invalid API_BASE_URL format',
        'Invalid API_TIMEOUT value', // README documents actual user-facing error
      ];

      // Check config patterns
      for (const pattern of configPatterns) {
        expect(configContent).toContain(pattern);
      }

      // Check README patterns
      for (const pattern of readmePatterns) {
        expect(readmeContent).toContain(pattern);
      }
    });
  });

  describe('Security Requirements', () => {
    it('should never expose credentials in any template', async () => {
      const templateFiles = [
        'config.ts.hbs',
        'index.ts.hbs',
        '.env.example.hbs',
        'README.md.hbs',
      ];

      for (const file of templateFiles) {
        const filePath = path.join(TEMPLATES_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');

        // Should not log actual credential values
        expect(content).not.toMatch(/console\.log\([^)]*config\.apiKey[^)]*\)/);
        expect(content).not.toMatch(/console\.log\([^)]*config\.bearerToken[^)]*\)/);
        expect(content).not.toMatch(/console\.log\([^)]*config\.basicAuth\.password[^)]*\)/);
      }
    });

    it('should use credential masking in config template', async () => {
      const configPath = path.join(TEMPLATES_DIR, 'config.ts.hbs');
      const content = await fs.readFile(configPath, 'utf-8');

      expect(content).toContain('***hidden***');
    });
  });

  describe('File Generation Workflow', () => {
    it('should have all files needed for complete config workflow', async () => {
      const workflow = [
        { file: 'config.ts.hbs', purpose: 'Configuration module' },
        { file: '.env.example.hbs', purpose: 'Environment template' },
        { file: 'package.json.hbs', purpose: 'Dependencies' },
        { file: 'README.md.hbs', purpose: 'Documentation' },
        { file: 'index.ts.hbs', purpose: 'Integration' },
      ];

      for (const step of workflow) {
        const filePath = path.join(TEMPLATES_DIR, step.file);
        const exists = await fs.access(filePath)
          .then(() => true)
          .catch(() => false);

        expect(exists, `${step.purpose} file (${step.file}) should exist`).toBe(true);
      }
    });
  });
});
