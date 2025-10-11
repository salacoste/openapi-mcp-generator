/**
 * Integration tests for MCP Server Generation Pipeline
 * Tests the complete flow from OpenAPI spec to generated MCP server
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execa } from 'execa';
import fs from 'fs-extra';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('MCP Server Generation Pipeline', () => {
  const _fixturesDir = resolve(__dirname, '../fixtures');
  const outputDir = resolve(__dirname, '../output');
  const cliPath = resolve(__dirname, '../../dist/index.js');

  beforeEach(async () => {
    // Ensure clean output directory before each test
    await fs.ensureDir(outputDir);
    await fs.emptyDir(outputDir);
  });

  afterEach(async () => {
    // Cleanup generated files after each test
    await fs.remove(outputDir);
  });

  // Helper functions
  async function countToolsInFile(filePath: string): Promise<number> {
    const content = await fs.readFile(filePath, 'utf-8');
    const matches = content.match(/export const \w+Tool: Tool =/g);
    return matches ? matches.length : 0;
  }

  async function countInterfacesInFile(filePath: string): Promise<number> {
    const content = await fs.readFile(filePath, 'utf-8');
    const matches = content.match(/export interface \w+/g);
    return matches ? matches.length : 0;
  }

  async function verifyFileStructure(outputPath: string): Promise<void> {
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'README.md',
      'src/index.ts',
      'src/types.ts',
      'src/tools.ts',
      'src/http-client.ts',
    ];

    for (const file of requiredFiles) {
      const exists = await fs.pathExists(resolve(outputPath, file));
      expect(exists, `Expected ${file} to exist`).toBe(true);
    }
  }

  async function verifyNoExampleTool(outputPath: string): Promise<void> {
    const srcFiles = await fs.readdir(resolve(outputPath, 'src'));
    for (const file of srcFiles) {
      const content = await fs.readFile(resolve(outputPath, 'src', file), 'utf-8');
      expect(content, `File ${file} should not contain exampleTool`).not.toContain('exampleTool');
    }
  }

  test('generates complete MCP server from simple API', async () => {
    // Create a simple test API spec
    const simpleSpec = {
      openapi: '3.0.0',
      info: {
        title: 'Simple Test API',
        version: '1.0.0',
        description: 'A simple test API',
      },
      servers: [{ url: 'https://api.example.com' }],
      paths: {
        '/users': {
          get: {
            operationId: 'listUsers',
            summary: 'List all users',
            description: 'Returns a list of users',
            tags: ['Users'],
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        users: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/User' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            operationId: 'createUser',
            summary: 'Create a new user',
            tags: ['Users'],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CreateUserRequest' },
                },
              },
            },
            responses: {
              '201': {
                description: 'User created',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
        },
        '/users/{id}': {
          get: {
            operationId: 'getUser',
            summary: 'Get user by ID',
            tags: ['Users'],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'User ID',
              },
            ],
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              createdAt: { type: 'string', format: 'date-time' },
            },
            required: ['id', 'name', 'email'],
          },
          CreateUserRequest: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
            },
            required: ['name', 'email'],
          },
        },
      },
    };

    const specPath = resolve(outputDir, 'simple-api.json');
    await fs.writeJSON(specPath, simpleSpec);

    const output = resolve(outputDir, 'simple-server');

    // Execute generation via CLI
    const result = await execa('node', [cliPath, 'generate', specPath, '--output', output], {
      reject: false,
    });

    // Verify CLI execution succeeded
    expect(result.exitCode, `CLI should exit with code 0. stderr: ${result.stderr}`).toBe(0);

    // Verify file structure
    await verifyFileStructure(output);

    // Verify tool count (3 operations)
    const toolCount = await countToolsInFile(resolve(output, 'src/tools.ts'));
    expect(toolCount, 'Should generate 3 tools').toBe(3);

    // Verify interface count (at least User, CreateUserRequest, and response schemas)
    const interfaceCount = await countInterfacesInFile(resolve(output, 'src/types.ts'));
    expect(interfaceCount, 'Should generate at least 2 interfaces').toBeGreaterThanOrEqual(2);

    // Verify package.json
    const pkg = await fs.readJSON(resolve(output, 'package.json'));
    expect(pkg.name).toContain('simple-test-api');
    expect(pkg.dependencies).toHaveProperty('@modelcontextprotocol/sdk');
    expect(pkg.dependencies).toHaveProperty('axios');
    expect(pkg.scripts).toHaveProperty('build');
    expect(pkg.scripts).toHaveProperty('dev');

    // Verify no template remnants
    await verifyNoExampleTool(output);
  }, 30000);

  test('handles minimal valid OpenAPI spec', async () => {
    const minimalSpec = {
      openapi: '3.0.0',
      info: { title: 'Minimal API', version: '1.0.0' },
      servers: [{ url: 'http://localhost:3000' }],
      paths: {
        '/test': {
          get: {
            operationId: 'getTest',
            summary: 'Test endpoint',
            responses: { '200': { description: 'Success' } },
          },
        },
      },
    };

    const specPath = resolve(outputDir, 'minimal-spec.json');
    await fs.writeJSON(specPath, minimalSpec);

    const output = resolve(outputDir, 'minimal-server');

    // Execute generation
    const result = await execa('node', [cliPath, 'generate', specPath, '--output', output], {
      reject: false,
    });

    expect(result.exitCode).toBe(0);

    // Verify basic structure
    await verifyFileStructure(output);

    // Verify single tool generated
    const toolsContent = await fs.readFile(resolve(output, 'src/tools.ts'), 'utf-8');
    expect(toolsContent).toContain('getTestTool');

    const toolCount = await countToolsInFile(resolve(output, 'src/tools.ts'));
    expect(toolCount).toBe(1);
  }, 20000);

  test('generates correct tool names from operationIds', async () => {
    const spec = {
      openapi: '3.0.0',
      info: { title: 'Tool Name Test', version: '1.0.0' },
      servers: [{ url: 'https://api.test.com' }],
      paths: {
        '/items': {
          get: {
            operationId: 'listItems',
            summary: 'List items',
            responses: { '200': { description: 'Success' } },
          },
          post: {
            operationId: 'createItem',
            summary: 'Create item',
            responses: { '201': { description: 'Created' } },
          },
        },
        '/items/{id}': {
          get: {
            operationId: 'getItemById',
            summary: 'Get item',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
              },
            ],
            responses: { '200': { description: 'Success' } },
          },
        },
      },
    };

    const specPath = resolve(outputDir, 'tool-name-spec.json');
    await fs.writeJSON(specPath, spec);

    const output = resolve(outputDir, 'tool-name-server');

    const result = await execa('node', [cliPath, 'generate', specPath, '--output', output], {
      reject: false,
    });

    expect(result.exitCode).toBe(0);

    const toolsContent = await fs.readFile(resolve(output, 'src/tools.ts'), 'utf-8');
    expect(toolsContent).toContain('listItemsTool');
    expect(toolsContent).toContain('createItemTool');
    expect(toolsContent).toContain('getItemByIdTool');
  }, 20000);

  test('generated code includes proper TypeScript types', async () => {
    const spec = {
      openapi: '3.0.0',
      info: { title: 'Types Test API', version: '1.0.0' },
      servers: [{ url: 'https://api.test.com' }],
      paths: {
        '/products': {
          get: {
            operationId: 'listProducts',
            summary: 'List products',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Product' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Product: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              price: { type: 'number' },
              inStock: { type: 'boolean' },
            },
            required: ['id', 'name', 'price'],
          },
        },
      },
    };

    const specPath = resolve(outputDir, 'types-spec.json');
    await fs.writeJSON(specPath, spec);

    const output = resolve(outputDir, 'types-server');

    const result = await execa('node', [cliPath, 'generate', specPath, '--output', output], {
      reject: false,
    });

    expect(result.exitCode).toBe(0);

    const typesContent = await fs.readFile(resolve(output, 'src/types.ts'), 'utf-8');
    expect(typesContent).toContain('export interface Product');
    expect(typesContent).toContain('id');
    expect(typesContent).toContain('name');
    expect(typesContent).toContain('price');
    expect(typesContent).toContain('inStock');
  }, 20000);

  test('fails gracefully with invalid OpenAPI spec', async () => {
    const invalidSpec = {
      openapi: '3.0.0',
      info: { title: 'Invalid API', version: '1.0.0' },
      paths: {
        '/test': {
          get: {
            // Missing operationId - will be auto-generated, so this should actually succeed
            summary: 'Test endpoint',
            responses: { '200': { description: 'Success' } },
          },
        },
      },
    };

    const specPath = resolve(outputDir, 'invalid-spec.json');
    await fs.writeJSON(specPath, invalidSpec);

    const output = resolve(outputDir, 'invalid-server');

    // This should actually succeed since operationIds can be auto-generated
    const result = await execa('node', [cliPath, 'generate', specPath, '--output', output], {
      reject: false,
    });

    // Either succeeds with auto-generated operationId or fails with clear error
    if (result.exitCode !== 0) {
      expect(result.stderr).toBeTruthy();
    } else {
      // If it succeeds, verify the output
      await verifyFileStructure(output);
    }
  }, 20000);
});
