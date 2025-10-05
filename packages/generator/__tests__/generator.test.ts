/**
 * Tests for CodeGenerator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve, join } from 'node:path';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { CodeGenerator } from '../src/generator.js';
import {
  TemplateNotFoundError,
  TemplateRenderError,
  DataValidationError,
} from '../src/errors.js';
import type { TemplateDataModel } from '../src/types.js';

describe('CodeGenerator', () => {
  let generator: CodeGenerator;
  let tempDir: string;

  beforeEach(async () => {
    generator = new CodeGenerator({ verbose: false });
    // Create temporary directory for test templates
    tempDir = await mkdtemp(join(tmpdir(), 'generator-test-'));
  });

  afterEach(async () => {
    // Clean up temporary directory
    await rm(tempDir, { recursive: true, force: true });
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const gen = new CodeGenerator();
      expect(gen).toBeDefined();
      expect(gen.getCacheSize()).toBe(0);
    });

    it('should create instance with custom options', () => {
      const gen = new CodeGenerator({
        verbose: true,
        prettierConfig: {
          semi: false,
          singleQuote: false,
        },
      });
      expect(gen).toBeDefined();
    });
  });

  describe('generateFromTemplate', () => {
    it('should throw TemplateNotFoundError for non-existent template', async () => {
      const nonExistentPath = resolve(tempDir, 'non-existent.hbs');

      await expect(
        generator.generateFromTemplate(nonExistentPath, { apiName: 'Test' })
      ).rejects.toThrow(TemplateNotFoundError);
    });

    it('should throw DataValidationError for empty data', async () => {
      const templatePath = resolve(tempDir, 'test.hbs');
      await writeFile(templatePath, 'Hello {{name}}', 'utf-8');

      await expect(
        generator.generateFromTemplate(templatePath, {})
      ).rejects.toThrow(DataValidationError);
    });

    it('should throw DataValidationError for non-object data', async () => {
      const templatePath = resolve(tempDir, 'test.hbs');
      await writeFile(templatePath, 'Hello {{name}}', 'utf-8');

      await expect(
        generator.generateFromTemplate(templatePath, 'invalid' as unknown as TemplateDataModel)
      ).rejects.toThrow(DataValidationError);
    });

    it('should render simple template', async () => {
      const templatePath = resolve(tempDir, 'simple.hbs');
      await writeFile(templatePath, 'Hello {{name}}!', 'utf-8');

      const result = await generator.generateFromTemplate(templatePath, {
        name: 'World',
      });

      expect(result).toContain('Hello World!');
    });

    it('should use template helpers', async () => {
      const templatePath = resolve(tempDir, 'helpers.hbs');
      const template = `const camelCase = '{{camelCase value}}';
const PascalCase = '{{PascalCase value}}';
const kebabCase = '{{kebabCase value}}';
const snakeCase = '{{snakeCase value}}';`;
      await writeFile(templatePath, template, 'utf-8');

      const result = await generator.generateFromTemplate(templatePath, {
        value: 'user-name',
      });

      expect(result).toContain('userName');
      expect(result).toContain('UserName');
      expect(result).toContain('user-name');
      expect(result).toContain('user_name');
    });

    it('should use conditional helpers', async () => {
      const templatePath = resolve(tempDir, 'conditional.hbs');
      const template = `
        {{#if (eq status "active")}}
        Status is active
        {{/if}}
        {{#if (gt count 5)}}
        Count is greater than 5
        {{/if}}
      `;
      await writeFile(templatePath, template, 'utf-8');

      const result = await generator.generateFromTemplate(templatePath, {
        status: 'active',
        count: 10,
      });

      expect(result).toContain('Status is active');
      expect(result).toContain('Count is greater than 5');
    });

    it('should use logical helpers', async () => {
      const templatePath = resolve(tempDir, 'logical.hbs');
      const template = `
        {{#if (and flag1 flag2)}}
        Both flags are true
        {{/if}}
        {{#if (or flag3 flag4)}}
        At least one flag is true
        {{/if}}
        {{#if (not flag5)}}
        Flag5 is false
        {{/if}}
      `;
      await writeFile(templatePath, template, 'utf-8');

      const result = await generator.generateFromTemplate(templatePath, {
        flag1: true,
        flag2: true,
        flag3: false,
        flag4: true,
        flag5: false,
      });

      expect(result).toContain('Both flags are true');
      expect(result).toContain('At least one flag is true');
      expect(result).toContain('Flag5 is false');
    });

    it('should format code with Prettier', async () => {
      const templatePath = resolve(tempDir, 'code.hbs');
      const template = `const x={a:1,b:2};function test(){return x;}`;
      await writeFile(templatePath, template, 'utf-8');

      const result = await generator.generateFromTemplate(templatePath, {
        dummy: 'value',
      });

      // Prettier should format the code
      expect(result).toContain('const x = {');
      expect(result).toContain('a: 1,');
      expect(result).toContain('b: 2');
    });

    it('should cache compiled templates', async () => {
      const templatePath = resolve(tempDir, 'cached.hbs');
      await writeFile(templatePath, 'Hello {{name}}!', 'utf-8');

      // First render
      await generator.generateFromTemplate(templatePath, { name: 'First' });
      expect(generator.getCacheSize()).toBe(1);

      // Second render should use cache
      await generator.generateFromTemplate(templatePath, { name: 'Second' });
      expect(generator.getCacheSize()).toBe(1);
    });

    it('should handle template with loops', async () => {
      const templatePath = resolve(tempDir, 'loop.hbs');
      const template = `
        {{#each items}}
        - {{name}}: {{value}}
        {{/each}}
      `;
      await writeFile(templatePath, template, 'utf-8');

      const result = await generator.generateFromTemplate(templatePath, {
        items: [
          { name: 'Item 1', value: 'Value 1' },
          { name: 'Item 2', value: 'Value 2' },
        ],
      });

      expect(result).toContain('Item 1: Value 1');
      expect(result).toContain('Item 2: Value 2');
    });

    it('should handle TypeScript template data model', async () => {
      const templatePath = resolve(tempDir, 'ts-template.hbs');
      const template = `
        // {{apiName}} v{{apiVersion}}
        // Generated at: {{generatedAt}}

        {{#each operations}}
        export function {{camelCase operationId}}() {
          // {{method}} {{path}}
        }
        {{/each}}
      `;
      await writeFile(templatePath, template, 'utf-8');

      const data: Partial<TemplateDataModel> = {
        apiName: 'Test API',
        apiVersion: '1.0.0',
        generatedAt: '2025-01-05',
        operations: [
          {
            operationId: 'getUsers',
            method: 'GET',
            path: '/users',
            camelName: 'getUsers',
            pascalName: 'GetUsers',
            parameters: [],
            responses: [],
            tags: [],
            hasParameters: false,
            hasRequestBody: false,
            hasPathParams: false,
            hasQueryParams: false,
            hasHeaderParams: false,
          },
          {
            operationId: 'createUser',
            method: 'POST',
            path: '/users',
            camelName: 'createUser',
            pascalName: 'CreateUser',
            parameters: [],
            responses: [],
            tags: [],
            hasParameters: false,
            hasRequestBody: true,
            hasPathParams: false,
            hasQueryParams: false,
            hasHeaderParams: false,
          },
        ],
      };

      const result = await generator.generateFromTemplate(templatePath, data);

      expect(result).toContain('Test API v1.0.0');
      expect(result).toContain('export function getUsers()');
      expect(result).toContain('export function createUser()');
      expect(result).toContain('GET /users');
      expect(result).toContain('POST /users');
    });
  });

  describe('clearCache', () => {
    it('should clear template cache', async () => {
      const templatePath = resolve(tempDir, 'test.hbs');
      await writeFile(templatePath, 'Hello {{name}}!', 'utf-8');

      await generator.generateFromTemplate(templatePath, { name: 'Test' });
      expect(generator.getCacheSize()).toBe(1);

      generator.clearCache();
      expect(generator.getCacheSize()).toBe(0);
    });
  });

  describe('registerHelper', () => {
    it('should register custom helper', async () => {
      generator.registerHelper('uppercase', (str: string) => str.toUpperCase());

      const templatePath = resolve(tempDir, 'custom.hbs');
      await writeFile(templatePath, 'Result: {{uppercase value}}', 'utf-8');

      const result = await generator.generateFromTemplate(templatePath, {
        value: 'hello',
      });

      expect(result).toContain('Result: HELLO');
    });
  });

  describe('registerPartial', () => {
    it('should register and use partial', async () => {
      generator.registerPartial('header', '/* Header: {{title}} */');

      const templatePath = resolve(tempDir, 'with-partial.hbs');
      await writeFile(templatePath, '{{> header}}\nContent here', 'utf-8');

      const result = await generator.generateFromTemplate(templatePath, {
        title: 'Test',
      });

      expect(result).toContain('/* Header: Test */');
      expect(result).toContain('Content here');
    });
  });

  describe('error handling', () => {
    it('should provide clear error for invalid template syntax', async () => {
      const templatePath = resolve(tempDir, 'invalid.hbs');
      await writeFile(templatePath, 'Hello {{#if}}{{/if}}', 'utf-8');

      await expect(
        generator.generateFromTemplate(templatePath, { name: 'Test' })
      ).rejects.toThrow(TemplateRenderError);
    });

    it('should provide clear error for missing variable in strict mode', async () => {
      const templatePath = resolve(tempDir, 'missing-var.hbs');
      await writeFile(templatePath, 'Hello {{missing.deeply.nested}}', 'utf-8');

      await expect(
        generator.generateFromTemplate(templatePath, { name: 'Test' })
      ).rejects.toThrow(TemplateRenderError);
    });
  });
});
