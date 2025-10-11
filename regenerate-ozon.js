/* eslint-disable */
import { generateMCPServer } from './packages/generator/dist/index.js';
import { resolve } from 'node:path';

async function main() {
  try {
    console.log('Regenerating Ozon MCP server with fixed executeTool...');

    const result = await generateMCPServer({
      openApiPath: resolve('./swagger/swagger.json'),
      outputDir: resolve('./mcp-servers/ozon-performance-api'),
      skipValidation: true,
      license: 'MIT',
      author: 'Your Name',
      repository: 'https://github.com/yourusername/ozon-mcp-server'
    });

    console.log('✅ Generation successful!');
    console.log('Files:', result.filesGenerated);
    console.log('Operations:', result.metadata.operationCount);
    console.log('Time:', result.metadata.generationTime + 'ms');
  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

main();
