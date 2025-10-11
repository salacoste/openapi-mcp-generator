/**
 * MCP Server Runtime Testing
 *
 * Validates that generated MCP servers start correctly and respond to MCP protocol.
 * Tests server lifecycle, initialize protocol, tools list, and tool execution.
 *
 * Story: 5.6 - MCP Server Runtime Testing
 * Priority: 2 (Enhanced Testing)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, rm } from 'fs/promises';
import { join, resolve, dirname } from 'path';
import { tmpdir } from 'os';
import { execSync, spawn, ChildProcess } from 'child_process';
import { fileURLToPath } from 'url';
import { execa } from 'execa';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Helper to send MCP request and wait for response
 */
async function sendMCPRequest(
  serverProcess: ChildProcess,
  request: Record<string, unknown>,
  timeout = 5000
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Request timeout after ${timeout}ms`));
    }, timeout);

    let buffer = '';

    const dataHandler = (data: Buffer): void => {
      buffer += data.toString();

      // Check if we have a complete JSON-RPC message
      const lines = buffer.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          try {
            const response = JSON.parse(line) as Record<string, unknown>;
            clearTimeout(timer);
            serverProcess.stdout?.removeListener('data', dataHandler);
            resolve(response);
            return;
          } catch {
            // Not complete JSON yet, continue buffering
          }
        }
      }
    };

    serverProcess.stdout?.on('data', dataHandler);
    serverProcess.stderr?.on('data', (data: Buffer) => {
      // Capture stderr for debugging (errors only)
      const message = data.toString();
      if (!message.includes('MCP server running') && message.toLowerCase().includes('error')) {
        // Log only actual errors, not informational messages
        process.stderr.write(`Server error: ${message}`);
      }
    });

    // Send request
    serverProcess.stdin?.write(JSON.stringify(request) + '\n');
  });
}

describe('MCP Server Runtime Testing', () => {
  let outputDir: string;
  let serverProcess: ChildProcess | null = null;
  const cliPath = resolve(__dirname, '../../dist/index.js');
  const petstoreSpecPath = resolve(__dirname, '../../../parser/__tests__/fixtures/valid/petstore.json');

  beforeAll(async () => {
    // Create temporary directory
    outputDir = await mkdtemp(join(tmpdir(), 'mcp-runtime-test-'));

    // Generate MCP server
    const output = join(outputDir, 'test-server');
    await execa('node', [cliPath, 'generate', petstoreSpecPath, '--output', output, '--force'], {
      cwd: __dirname,
    });

    // Install dependencies and build
    execSync('npm install --silent && npm run build', {
      cwd: output,
      stdio: 'pipe',
    });
  }, 60000);

  afterAll(async () => {
    // Kill server if still running
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill('SIGTERM');
      // Give it time to cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!serverProcess.killed) {
        serverProcess.kill('SIGKILL');
      }
    }

    // Cleanup output directory
    if (outputDir) {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  describe('FR1: Server Process Management', () => {
    it('should start server successfully', async () => {
      const serverPath = join(outputDir, 'test-server/dist/index.js');

      serverProcess = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Wait for server to be ready
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('Server startup timeout'));
        }, 5000);

        if (!serverProcess) {
          reject(new Error('Server process not created'));
          return;
        }

        serverProcess.stderr?.on('data', (data: Buffer) => {
          const message = data.toString();
          if (message.includes('MCP server running')) {
            clearTimeout(timer);
            resolve();
          }
        });

        serverProcess.on('error', (error: Error) => {
          clearTimeout(timer);
          reject(error);
        });
      });

      expect(serverProcess).toBeTruthy();
      expect(serverProcess?.killed).toBe(false);
    }, 10000);
  });

  describe('FR2: MCP Initialize Protocol', () => {
    it('should respond to initialize request', async () => {
      if (!serverProcess) {
        throw new Error('Server not started');
      }

      const initRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'test-client',
            version: '1.0.0',
          },
        },
      };

      const response = await sendMCPRequest(serverProcess, initRequest);

      expect(response).toBeDefined();
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.result).toBeDefined();

      const result = response.result as Record<string, unknown>;
      expect(result.capabilities).toBeDefined();
      expect(result.serverInfo).toBeDefined();

      const serverInfo = result.serverInfo as Record<string, unknown>;
      expect(serverInfo.name).toBeTruthy();
      expect(serverInfo.version).toBeTruthy();
    }, 10000);
  });

  describe('FR3: Tools List Validation', () => {
    it('should return list of tools', async () => {
      if (!serverProcess) {
        throw new Error('Server not started');
      }

      const toolsRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {},
      };

      const response = await sendMCPRequest(serverProcess, toolsRequest);

      expect(response).toBeDefined();
      expect(response.result).toBeDefined();

      const result = response.result as Record<string, unknown>;
      expect(Array.isArray(result.tools)).toBe(true);

      const tools = result.tools as Array<Record<string, unknown>>;
      expect(tools.length).toBeGreaterThan(0);

      // Validate tool structure
      const tool = tools[0];
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.inputSchema).toBeDefined();

      const inputSchema = tool.inputSchema as Record<string, unknown>;
      expect(inputSchema.type).toBe('object');
    }, 10000);
  });

  describe('FR4: Tool Execution Protocol', () => {
    it('should execute tool and return response', async () => {
      if (!serverProcess) {
        throw new Error('Server not started');
      }

      // First get list of tools
      const toolsRequest = {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/list',
        params: {},
      };

      const toolsResponse = await sendMCPRequest(serverProcess, toolsRequest);
      const result = toolsResponse.result as Record<string, unknown>;
      const tools = result.tools as Array<Record<string, unknown>>;
      const firstTool = tools[0];

      // Execute the first tool (will likely fail due to no API, but should respond)
      const callRequest = {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: firstTool.name,
          arguments: {},
        },
      };

      const callResponse = await sendMCPRequest(serverProcess, callRequest);

      expect(callResponse).toBeDefined();
      expect(callResponse.id).toBe(4);

      // Either success or error, but should respond
      if (callResponse.result) {
        const callResult = callResponse.result as Record<string, unknown>;
        expect(callResult.content).toBeDefined();
      } else {
        expect(callResponse.error).toBeDefined();
      }
    }, 10000);
  });

  describe('IR2: Error Scenarios', () => {
    it('should handle invalid tool name', async () => {
      if (!serverProcess) {
        throw new Error('Server not started');
      }

      const callRequest = {
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'nonexistent_tool',
          arguments: {},
        },
      };

      const response = await sendMCPRequest(serverProcess, callRequest);

      expect(response).toBeDefined();
      expect(response.error).toBeDefined();

      const error = response.error as Record<string, unknown>;
      const message = error.message as string;
      expect(message).toContain('Unknown tool');
    }, 10000);

    it('should handle malformed request', async () => {
      if (!serverProcess) {
        throw new Error('Server not started');
      }

      const malformedRequest = {
        jsonrpc: '2.0',
        id: 6,
        method: 'invalid/method',
        params: {},
      };

      const response = await sendMCPRequest(serverProcess, malformedRequest);

      expect(response).toBeDefined();
      // Should return error for unsupported method
      expect(response.error).toBeDefined();
    }, 10000);
  });
});
