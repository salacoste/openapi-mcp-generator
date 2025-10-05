/**
 * Runtime MCP Server Tests
 * Tests actual MCP server execution and protocol communication
 * Story 3.9: AC#5, AC#6, AC#7 - Runtime validation
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolve, join } from 'node:path';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { existsSync } from 'node:fs';
import { spawn, ChildProcess } from 'node:child_process';
import { generateMCPServer } from '../../src/mcp-generator.js';

/**
 * Helper to communicate with MCP server via stdio
 */
class MCPClient {
  private process: ChildProcess;
  private messageId = 0;
  private pendingRequests: Map<
    number,
    { resolve: (value: unknown) => void; reject: (error: Error) => void }
  > = new Map();

  constructor(serverPath: string) {
    this.process = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Handle server responses
    let buffer = '';
    this.process.stdout?.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const message = JSON.parse(line);
          if (message.id !== undefined) {
            const pending = this.pendingRequests.get(message.id);
            if (pending) {
              this.pendingRequests.delete(message.id);
              if (message.error) {
                pending.reject(new Error(message.error.message));
              } else {
                pending.resolve(message.result);
              }
            }
          }
        } catch (error) {
          // Ignore non-JSON lines (server logs)
        }
      }
    });

    // Handle errors
    this.process.stderr?.on('data', () => {
      // Server logs to stderr, this is normal
      // Ignore for now
    });
  }

  async sendRequest(method: string, params?: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      this.pendingRequests.set(id, { resolve, reject });

      const request = JSON.stringify({
        jsonrpc: '2.0',
        id,
        method,
        params: params || {},
      });

      this.process.stdin?.write(request + '\n');

      // Timeout after 5 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request timeout: ${method}`));
        }
      }, 5000);
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.process.killed) {
        resolve();
        return;
      }

      this.process.on('exit', () => resolve());
      this.process.kill();

      // Force kill after 2 seconds
      setTimeout(() => {
        if (!this.process.killed) {
          this.process.kill('SIGKILL');
          resolve();
        }
      }, 2000);
    });
  }
}

// Skip runtime tests by default - they require npm install and full build
// Run with: RUN_RUNTIME_TESTS=true pnpm test
const runRuntimeTests = process.env.RUN_RUNTIME_TESTS === 'true';

describe.skipIf(!runRuntimeTests)('Runtime MCP Server Tests', () => {
  let outputDir: string;
  let minimalApiPath: string;
  let serverPath: string;

  beforeAll(async () => {
    // Create temp directory for generated server
    outputDir = await mkdtemp(join(tmpdir(), 'mcp-runtime-test-'));
    minimalApiPath = resolve(__dirname, '../fixtures/minimal-api.json');

    // Generate MCP server
    await generateMCPServer({
      openApiPath: minimalApiPath,
      outputDir,
      license: 'MIT',
    });

    // Create a simple package.json for the generated server
    const packageJson = {
      name: 'test-mcp-server',
      version: '1.0.0',
      type: 'module',
      dependencies: {
        '@modelcontextprotocol/sdk': '^0.5.0',
        axios: '^1.6.0',
        dotenv: '^16.3.0',
      },
    };

    await writeFile(
      join(outputDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    serverPath = join(outputDir, 'src/index.ts');

    // Note: We're testing the TypeScript source directly with tsx
    // In production, this would be compiled JavaScript
  }, 60000);

  afterAll(async () => {
    // Cleanup
    if (outputDir && existsSync(outputDir)) {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  describe('AC#5: MCP Server Startup', () => {
    it('should generate valid server file', () => {
      expect(existsSync(serverPath)).toBe(true);
    });

    it('should start MCP server without errors', async () => {
      // Start server
      const server = spawn('node', ['--loader', 'tsx', serverPath], {
        cwd: outputDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_NO_WARNINGS: '1' },
      });

      // Wait for server to start (check stderr for startup message)
      const started = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => resolve(false), 3000);

        server.stderr?.on('data', (data) => {
          const message = data.toString();
          if (message.includes('MCP server running')) {
            clearTimeout(timeout);
            resolve(true);
          }
        });

        server.on('error', () => {
          clearTimeout(timeout);
          resolve(false);
        });
      });

      // Cleanup
      server.kill();

      expect(started).toBe(true);
    }, 10000);

    it('should connect to stdio transport', async () => {
      const server = spawn('node', ['--loader', 'tsx', serverPath], {
        cwd: outputDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_NO_WARNINGS: '1' },
      });

      // Check that stdin/stdout are properly connected
      expect(server.stdin).toBeDefined();
      expect(server.stdout).toBeDefined();
      expect(server.stdin?.writable).toBe(true);
      expect(server.stdout?.readable).toBe(true);

      server.kill();
    });
  });

  describe('AC#6: Tool Listing Test', () => {
    it('should respond to ListToolsRequest', async () => {
      // Start server with tsx (TypeScript execution)
      const server = spawn('node', ['--loader', 'tsx', serverPath], {
        cwd: outputDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_NO_WARNINGS: '1' },
      });

      // Wait for server to be ready
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Send ListTools request
      const client = new MCPClient(serverPath);

      try {
        const response = await client.sendRequest('tools/list');

        expect(response).toBeDefined();
        expect(response.tools).toBeDefined();
        expect(Array.isArray(response.tools)).toBe(true);
        expect(response.tools.length).toBeGreaterThan(0);

        // Validate first tool structure
        const firstTool = response.tools[0];
        expect(firstTool.name).toBeDefined();
        expect(firstTool.description).toBeDefined();
        expect(firstTool.inputSchema).toBeDefined();
      } finally {
        await client.close();
        server.kill();
      }
    }, 15000);

    it('should list all operations from OpenAPI spec', async () => {
      const server = spawn('node', ['--loader', 'tsx', serverPath], {
        cwd: outputDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_NO_WARNINGS: '1' },
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const client = new MCPClient(serverPath);

      try {
        const response = await client.sendRequest('tools/list');

        // Minimal API has 1 operation (getTest)
        expect(response.tools.length).toBe(1);

        const tool = response.tools[0];
        expect(tool.name).toBe('getTest');
        expect(tool.description).toContain('Test operation');
      } finally {
        await client.close();
        server.kill();
      }
    }, 15000);

    it('should validate tool definition structure', async () => {
      const server = spawn('node', ['--loader', 'tsx', serverPath], {
        cwd: outputDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_NO_WARNINGS: '1' },
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const client = new MCPClient(serverPath);

      try {
        const response = await client.sendRequest('tools/list');
        const tool = response.tools[0];

        // Validate MCP tool structure
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');

        // Validate inputSchema is valid JSON Schema
        expect(tool.inputSchema).toHaveProperty('type');
        expect(tool.inputSchema.type).toBe('object');
      } finally {
        await client.close();
        server.kill();
      }
    }, 15000);
  });

  describe('AC#7: Tool Execution Test', () => {
    it('should handle CallToolRequest', async () => {
      const server = spawn('node', ['--loader', 'tsx', serverPath], {
        cwd: outputDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_NO_WARNINGS: '1' },
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const client = new MCPClient(serverPath);

      try {
        const response = await client.sendRequest('tools/call', {
          name: 'getTest',
          arguments: {},
        });

        expect(response).toBeDefined();
        expect(response.content).toBeDefined();
        expect(Array.isArray(response.content)).toBe(true);
      } finally {
        await client.close();
        server.kill();
      }
    }, 15000);

    it('should execute tool without errors', async () => {
      const server = spawn('node', ['--loader', 'tsx', serverPath], {
        cwd: outputDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_NO_WARNINGS: '1' },
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const client = new MCPClient(serverPath);

      try {
        const response = await client.sendRequest('tools/call', {
          name: 'getTest',
          arguments: {},
        });

        // Should not have error flag
        expect(response.isError).toBeUndefined();
        expect(response.content[0].type).toBe('text');
      } finally {
        await client.close();
        server.kill();
      }
    }, 15000);

    it('should handle invalid tool name gracefully', async () => {
      const server = spawn('node', ['--loader', 'tsx', serverPath], {
        cwd: outputDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_NO_WARNINGS: '1' },
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const client = new MCPClient(serverPath);

      try {
        const response = await client.sendRequest('tools/call', {
          name: 'nonExistentTool',
          arguments: {},
        });

        // Should return error response
        expect(response.isError).toBe(true);
        expect(response.content[0].text).toContain('Error');
      } finally {
        await client.close();
        server.kill();
      }
    }, 15000);
  });

  describe('Graceful Shutdown', () => {
    it('should shutdown cleanly on SIGTERM', async () => {
      const server = spawn('node', ['--loader', 'tsx', serverPath], {
        cwd: outputDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_NO_WARNINGS: '1' },
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const exitPromise = new Promise<number | null>((resolve) => {
        server.on('exit', (code) => resolve(code));
      });

      server.kill('SIGTERM');

      const exitCode = await exitPromise;

      // Should exit cleanly (code 0 or null for signal)
      expect(exitCode === 0 || exitCode === null).toBe(true);
    }, 5000);
  });
});
