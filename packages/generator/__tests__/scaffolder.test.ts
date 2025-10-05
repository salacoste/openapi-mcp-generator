/**
 * Tests for project scaffolding module
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { scaffoldProject, type ScaffoldOptions } from '../src/scaffolder.js';
import fs from 'fs-extra';
import { resolve } from 'path';
import { tmpdir } from 'os';

describe('scaffoldProject', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = resolve(tmpdir(), `scaffolder-test-${Date.now()}`);
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    // Clean up test directory
    if (await fs.pathExists(testDir)) {
      await fs.remove(testDir);
    }
  });

  const defaultOptions: ScaffoldOptions = {
    outputDir: '',
    apiName: 'Test API',
    apiVersion: '1.0.0',
    apiDescription: 'A test API description',
    baseURL: 'https://api.example.com',
  };

  describe('Directory Structure', () => {
    it('should create output directory', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const exists = await fs.pathExists(testDir);
      expect(exists).toBe(true);
    });

    it('should create src directory', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const srcDir = resolve(testDir, 'src');
      const exists = await fs.pathExists(srcDir);
      expect(exists).toBe(true);
    });
  });

  describe('package.json Generation', () => {
    it('should create package.json file', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const packageJsonPath = resolve(testDir, 'package.json');
      const exists = await fs.pathExists(packageJsonPath);
      expect(exists).toBe(true);
    });

    it('should have valid JSON format', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const packageJsonPath = resolve(testDir, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');

      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should convert API name to kebab-case package name', async () => {
      const options = {
        ...defaultOptions,
        outputDir: testDir,
        apiName: 'Test API Service',
      };
      await scaffoldProject(options);

      const packageJsonPath = resolve(testDir, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      expect(packageJson.name).toBe('test-api-service');
    });

    it('should include all required dependencies', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const packageJsonPath = resolve(testDir, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      expect(packageJson.dependencies).toHaveProperty('@modelcontextprotocol/sdk');
      expect(packageJson.dependencies).toHaveProperty('axios');
      expect(packageJson.dependencies).toHaveProperty('dotenv');
    });

    it('should include all dev dependencies', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const packageJsonPath = resolve(testDir, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      expect(packageJson.devDependencies).toHaveProperty('typescript');
      expect(packageJson.devDependencies).toHaveProperty('@types/node');
      expect(packageJson.devDependencies).toHaveProperty('tsx');
    });

    it('should include all required scripts', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const packageJsonPath = resolve(testDir, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts).toHaveProperty('start');
      expect(packageJson.scripts).toHaveProperty('dev');
      expect(packageJson.scripts).toHaveProperty('typecheck');
    });

    it('should set correct module type', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const packageJsonPath = resolve(testDir, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      expect(packageJson.type).toBe('module');
    });

    it('should set correct main entry point', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const packageJsonPath = resolve(testDir, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      expect(packageJson.main).toBe('dist/index.js');
    });

    it('should include bin configuration', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const packageJsonPath = resolve(testDir, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      expect(packageJson.bin).toBeDefined();
      expect(Object.values(packageJson.bin)).toContain('dist/index.js');
    });

    it('should set Node.js engine requirement', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const packageJsonPath = resolve(testDir, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      expect(packageJson.engines.node).toBe('>=18.0.0');
    });

    it('should use custom license when provided', async () => {
      const options = {
        ...defaultOptions,
        outputDir: testDir,
        license: 'Apache-2.0',
      };
      await scaffoldProject(options);

      const packageJsonPath = resolve(testDir, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      expect(packageJson.license).toBe('Apache-2.0');
    });

    it('should include author when provided', async () => {
      const options = {
        ...defaultOptions,
        outputDir: testDir,
        author: 'Test Author',
      };
      await scaffoldProject(options);

      const packageJsonPath = resolve(testDir, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      expect(packageJson.author).toBe('Test Author');
    });

    it('should include repository when provided', async () => {
      const options = {
        ...defaultOptions,
        outputDir: testDir,
        repository: 'https://github.com/test/repo',
      };
      await scaffoldProject(options);

      const packageJsonPath = resolve(testDir, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      expect(packageJson.repository).toBe('https://github.com/test/repo');
    });
  });

  describe('tsconfig.json Generation', () => {
    it('should create tsconfig.json file', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const tsconfigPath = resolve(testDir, 'tsconfig.json');
      const exists = await fs.pathExists(tsconfigPath);
      expect(exists).toBe(true);
    });

    it('should have valid JSON format', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const tsconfigPath = resolve(testDir, 'tsconfig.json');
      const content = await fs.readFile(tsconfigPath, 'utf-8');

      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should enable strict mode', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const tsconfigPath = resolve(testDir, 'tsconfig.json');
      const content = await fs.readFile(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(content);

      expect(tsconfig.compilerOptions.strict).toBe(true);
    });

    it('should use NodeNext module system', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const tsconfigPath = resolve(testDir, 'tsconfig.json');
      const content = await fs.readFile(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(content);

      expect(tsconfig.compilerOptions.module).toBe('NodeNext');
      expect(tsconfig.compilerOptions.moduleResolution).toBe('NodeNext');
    });

    it('should set correct output directory', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const tsconfigPath = resolve(testDir, 'tsconfig.json');
      const content = await fs.readFile(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(content);

      expect(tsconfig.compilerOptions.outDir).toBe('./dist');
      expect(tsconfig.compilerOptions.rootDir).toBe('./src');
    });

    it('should enable source maps', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const tsconfigPath = resolve(testDir, 'tsconfig.json');
      const content = await fs.readFile(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(content);

      expect(tsconfig.compilerOptions.sourceMap).toBe(true);
    });

    it('should enable declaration files', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const tsconfigPath = resolve(testDir, 'tsconfig.json');
      const content = await fs.readFile(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(content);

      expect(tsconfig.compilerOptions.declaration).toBe(true);
      expect(tsconfig.compilerOptions.declarationMap).toBe(true);
    });
  });

  describe('.env.example Generation', () => {
    it('should create .env.example file', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const envExamplePath = resolve(testDir, '.env.example');
      const exists = await fs.pathExists(envExamplePath);
      expect(exists).toBe(true);
    });

    it('should include API_BASE_URL', async () => {
      const options = {
        ...defaultOptions,
        outputDir: testDir,
        baseURL: 'https://api.test.com',
      };
      await scaffoldProject(options);

      const envExamplePath = resolve(testDir, '.env.example');
      const content = await fs.readFile(envExamplePath, 'utf-8');

      expect(content).toContain('API_BASE_URL=https://api.test.com');
    });

    it('should include API_TIMEOUT', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const envExamplePath = resolve(testDir, '.env.example');
      const content = await fs.readFile(envExamplePath, 'utf-8');

      expect(content).toContain('API_TIMEOUT=30000');
    });

    it('should include DEBUG flag', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const envExamplePath = resolve(testDir, '.env.example');
      const content = await fs.readFile(envExamplePath, 'utf-8');

      expect(content).toContain('DEBUG=false');
    });

    it('should include API_KEY placeholder when apiKey security scheme present', async () => {
      const options = {
        ...defaultOptions,
        outputDir: testDir,
        securitySchemes: [
          { name: 'ApiKey', type: 'apiKey' as const, in: 'header' as const, paramName: 'X-API-Key' },
        ],
      };
      await scaffoldProject(options);

      const envExamplePath = resolve(testDir, '.env.example');
      const content = await fs.readFile(envExamplePath, 'utf-8');

      expect(content).toContain('API_KEY=');
    });

    it('should include BEARER_TOKEN placeholder when bearer security scheme present', async () => {
      const options = {
        ...defaultOptions,
        outputDir: testDir,
        securitySchemes: [
          { name: 'Bearer', type: 'http' as const, scheme: 'bearer' },
        ],
      };
      await scaffoldProject(options);

      const envExamplePath = resolve(testDir, '.env.example');
      const content = await fs.readFile(envExamplePath, 'utf-8');

      expect(content).toContain('BEARER_TOKEN=');
    });

    it('should include BASIC_AUTH placeholders when basic auth security scheme present', async () => {
      const options = {
        ...defaultOptions,
        outputDir: testDir,
        securitySchemes: [
          { name: 'BasicAuth', type: 'http' as const, scheme: 'basic' },
        ],
      };
      await scaffoldProject(options);

      const envExamplePath = resolve(testDir, '.env.example');
      const content = await fs.readFile(envExamplePath, 'utf-8');

      expect(content).toContain('BASIC_AUTH_USERNAME=');
      expect(content).toContain('BASIC_AUTH_PASSWORD=');
    });
  });

  describe('.gitignore Generation', () => {
    it('should create .gitignore file', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const gitignorePath = resolve(testDir, '.gitignore');
      const exists = await fs.pathExists(gitignorePath);
      expect(exists).toBe(true);
    });

    it('should ignore node_modules', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const gitignorePath = resolve(testDir, '.gitignore');
      const content = await fs.readFile(gitignorePath, 'utf-8');

      expect(content).toContain('node_modules/');
    });

    it('should ignore dist directory', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const gitignorePath = resolve(testDir, '.gitignore');
      const content = await fs.readFile(gitignorePath, 'utf-8');

      expect(content).toContain('dist/');
    });

    it('should ignore .env files', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const gitignorePath = resolve(testDir, '.gitignore');
      const content = await fs.readFile(gitignorePath, 'utf-8');

      expect(content).toContain('.env');
    });

    it('should ignore log files', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const gitignorePath = resolve(testDir, '.gitignore');
      const content = await fs.readFile(gitignorePath, 'utf-8');

      expect(content).toContain('*.log');
    });

    it('should ignore OS files', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const gitignorePath = resolve(testDir, '.gitignore');
      const content = await fs.readFile(gitignorePath, 'utf-8');

      expect(content).toContain('.DS_Store');
    });
  });

  describe('README.md Generation', () => {
    it('should create README.md file', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const readmePath = resolve(testDir, 'README.md');
      const exists = await fs.pathExists(readmePath);
      expect(exists).toBe(true);
    });

    it('should include API name in title', async () => {
      const options = {
        ...defaultOptions,
        outputDir: testDir,
        apiName: 'Custom API',
      };
      await scaffoldProject(options);

      const readmePath = resolve(testDir, 'README.md');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('# Custom API MCP Server');
    });

    it('should include API description', async () => {
      const options = {
        ...defaultOptions,
        outputDir: testDir,
        apiDescription: 'Custom description here',
      };
      await scaffoldProject(options);

      const readmePath = resolve(testDir, 'README.md');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('Custom description here');
    });

    it('should include installation instructions', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const readmePath = resolve(testDir, 'README.md');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('## Installation');
      expect(content).toContain('npm install');
    });

    it('should include configuration section', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const readmePath = resolve(testDir, 'README.md');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('## Configuration');
      expect(content).toContain('cp .env.example .env');
    });

    it('should include usage section with build/start/dev commands', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const readmePath = resolve(testDir, 'README.md');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('## Usage');
      expect(content).toContain('npm run build');
      expect(content).toContain('npm start');
      expect(content).toContain('npm run dev');
    });

    it('should include Claude Desktop integration', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const readmePath = resolve(testDir, 'README.md');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('Use with Claude Desktop');
      expect(content).toContain('claude_desktop_config.json');
    });

    it('should include operation count when provided', async () => {
      const options = {
        ...defaultOptions,
        outputDir: testDir,
        operationCount: 42,
      };
      await scaffoldProject(options);

      const readmePath = resolve(testDir, 'README.md');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('42 API operations');
    });

    it('should include tags section when tags provided', async () => {
      const options = {
        ...defaultOptions,
        outputDir: testDir,
        tags: [
          { name: 'Users', description: 'User management', pascalName: 'Users' },
          { name: 'Products', description: 'Product operations', pascalName: 'Products' },
        ],
      };
      await scaffoldProject(options);

      const readmePath = resolve(testDir, 'README.md');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('### By Category');
      expect(content).toContain('Users');
      expect(content).toContain('Products');
    });

    it('should include troubleshooting section', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const readmePath = resolve(testDir, 'README.md');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('## Troubleshooting');
      expect(content).toContain('Server won\'t start');
      expect(content).toContain('Debug mode');
    });

    it('should include external docs URL when provided', async () => {
      const options = {
        ...defaultOptions,
        outputDir: testDir,
        externalDocsUrl: 'https://docs.example.com',
      };
      await scaffoldProject(options);

      const readmePath = resolve(testDir, 'README.md');
      const content = await fs.readFile(readmePath, 'utf-8');

      expect(content).toContain('https://docs.example.com');
    });
  });

  describe('.prettierrc Generation', () => {
    it('should create .prettierrc file', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const prettierPath = resolve(testDir, '.prettierrc');
      const exists = await fs.pathExists(prettierPath);
      expect(exists).toBe(true);
    });

    it('should have valid JSON format', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const prettierPath = resolve(testDir, '.prettierrc');
      const content = await fs.readFile(prettierPath, 'utf-8');

      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should configure single quotes', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const prettierPath = resolve(testDir, '.prettierrc');
      const content = await fs.readFile(prettierPath, 'utf-8');
      const config = JSON.parse(content);

      expect(config.singleQuote).toBe(true);
    });

    it('should configure trailing commas', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const prettierPath = resolve(testDir, '.prettierrc');
      const content = await fs.readFile(prettierPath, 'utf-8');
      const config = JSON.parse(content);

      expect(config.trailingComma).toBe('all');
    });
  });

  describe('.eslintrc.json Generation', () => {
    it('should create .eslintrc.json file', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const eslintPath = resolve(testDir, '.eslintrc.json');
      const exists = await fs.pathExists(eslintPath);
      expect(exists).toBe(true);
    });

    it('should generate valid JSON', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const eslintPath = resolve(testDir, '.eslintrc.json');
      const content = await fs.readFile(eslintPath, 'utf-8');

      // Should not throw
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should include TypeScript configuration', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const eslintPath = resolve(testDir, '.eslintrc.json');
      const content = await fs.readFile(eslintPath, 'utf-8');
      const config = JSON.parse(content);

      expect(config.parser).toBe('@typescript-eslint/parser');
      expect(config.plugins).toContain('@typescript-eslint');
    });

    it('should extend recommended configs', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const eslintPath = resolve(testDir, '.eslintrc.json');
      const content = await fs.readFile(eslintPath, 'utf-8');
      const config = JSON.parse(content);

      expect(config.extends).toContain('eslint:recommended');
      expect(config.extends).toContain('plugin:@typescript-eslint/recommended');
    });

    it('should include strict TypeScript rules', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const eslintPath = resolve(testDir, '.eslintrc.json');
      const content = await fs.readFile(eslintPath, 'utf-8');
      const config = JSON.parse(content);

      expect(config.rules['@typescript-eslint/no-explicit-any']).toBe('error');
      expect(config.rules['@typescript-eslint/no-non-null-assertion']).toBe('error');
      expect(config.rules['no-console']).toBe('error');
    });

    it('should configure parser options', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const eslintPath = resolve(testDir, '.eslintrc.json');
      const content = await fs.readFile(eslintPath, 'utf-8');
      const config = JSON.parse(content);

      expect(config.parserOptions.ecmaVersion).toBe(2022);
      expect(config.parserOptions.sourceType).toBe('module');
      expect(config.parserOptions.project).toBe('./tsconfig.json');
    });

    it('should include ignore patterns', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const eslintPath = resolve(testDir, '.eslintrc.json');
      const content = await fs.readFile(eslintPath, 'utf-8');
      const config = JSON.parse(content);

      expect(config.ignorePatterns).toContain('dist/');
      expect(config.ignorePatterns).toContain('node_modules/');
    });
  });

  describe('LICENSE Generation', () => {
    it('should create LICENSE file', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const licensePath = resolve(testDir, 'LICENSE');
      const exists = await fs.pathExists(licensePath);
      expect(exists).toBe(true);
    });

    it('should generate MIT license by default', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const licensePath = resolve(testDir, 'LICENSE');
      const content = await fs.readFile(licensePath, 'utf-8');

      expect(content).toContain('MIT License');
      expect(content).toContain('Permission is hereby granted');
    });

    it('should include copyright year', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const licensePath = resolve(testDir, 'LICENSE');
      const content = await fs.readFile(licensePath, 'utf-8');

      const year = new Date().getFullYear();
      expect(content).toContain(`Copyright (c) ${year}`);
    });

    it('should include author when provided', async () => {
      const options = {
        ...defaultOptions,
        outputDir: testDir,
        author: 'John Doe',
      };
      await scaffoldProject(options);

      const licensePath = resolve(testDir, 'LICENSE');
      const content = await fs.readFile(licensePath, 'utf-8');

      expect(content).toContain('John Doe');
    });

    it('should use custom license when provided', async () => {
      const options = {
        ...defaultOptions,
        outputDir: testDir,
        license: 'Apache-2.0',
      };
      await scaffoldProject(options);

      const licensePath = resolve(testDir, 'LICENSE');
      const content = await fs.readFile(licensePath, 'utf-8');

      expect(content).toContain('Apache-2.0 License');
    });
  });

  describe('Complete Project Scaffolding', () => {
    it('should create all required files', async () => {
      const options = { ...defaultOptions, outputDir: testDir };
      await scaffoldProject(options);

      const requiredFiles = [
        'package.json',
        'tsconfig.json',
        '.env.example',
        '.gitignore',
        'README.md',
        '.prettierrc',
        '.eslintrc.json',
        'LICENSE',
      ];

      for (const file of requiredFiles) {
        const filePath = resolve(testDir, file);
        const exists = await fs.pathExists(filePath);
        expect(exists).toBe(true);
      }
    });

    it('should create valid project structure', async () => {
      const options = {
        ...defaultOptions,
        outputDir: testDir,
        apiName: 'Complete Test API',
        apiVersion: '2.0.0',
        apiDescription: 'Complete test description',
        baseURL: 'https://complete.api.com',
        license: 'MIT',
        author: 'Test Author',
        repository: 'https://github.com/test/repo',
        operationCount: 25,
        tags: [
          { name: 'Users', pascalName: 'Users' },
          { name: 'Posts', pascalName: 'Posts' },
        ],
        securitySchemes: [
          { name: 'ApiKey', type: 'apiKey' as const, in: 'header' as const, paramName: 'X-API-Key' },
        ],
      };

      await scaffoldProject(options);

      // Verify all files exist
      const files = await fs.readdir(testDir);
      expect(files).toContain('package.json');
      expect(files).toContain('tsconfig.json');
      expect(files).toContain('.env.example');
      expect(files).toContain('.gitignore');
      expect(files).toContain('README.md');
      expect(files).toContain('.prettierrc');
      expect(files).toContain('LICENSE');
      expect(files).toContain('src');

      // Verify src directory exists
      const srcExists = await fs.pathExists(resolve(testDir, 'src'));
      expect(srcExists).toBe(true);
    });
  });
});
