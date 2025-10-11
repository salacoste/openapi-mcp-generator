#!/usr/bin/env node
/**
 * Документация Ozon Performance API
 * 
В документе описаны методы Ozon Performance API — интерфейса для работы с рекламным кабинетом для обмена
информацией между системой продавца и Ozon.

По вопросам работы с API, обращайтесь в поддержку через личный кабинет.

 *
 * @version 2.0
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { tools, executeTool } from './tools.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create MCP server instance
const server = new Server(
  {
    name: '-ozon-performance-api',
    version: '2.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async (): Promise<{ tools: typeof tools }> => {
  return {
    tools,
  };
});

// Handle call tool request
server.setRequestHandler(
  CallToolRequestSchema,
  async (
    request: { params: { name: string; arguments?: Record<string, unknown> } }
  ): Promise<{
    content: Array<{ type: string; text: string }>;
    isError?: boolean;
  }> => {
    try {
      const result = await executeTool(request.params.name, request.params.arguments || {});
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text',
            text: `Error executing tool: ${message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Start server
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Документация Ozon Performance API MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
