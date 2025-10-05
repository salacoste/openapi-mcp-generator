/**
 * Project scaffolding module
 * Creates complete project structure with configuration files
 */

import { resolve } from 'path';
import { createDirectory, writeFile } from './fs-utils.js';
import { log } from './utils/logger.js';
import { GenerationError } from './errors.js';
import type { SecuritySchemeTemplateData, TagTemplateData } from './types.js';

/**
 * Options for scaffolding a project
 */
export interface ScaffoldOptions {
  outputDir: string;
  apiName: string;
  apiVersion: string;
  apiDescription?: string;
  baseURL: string;
  license?: string;
  author?: string;
  repository?: string;
  securitySchemes?: SecuritySchemeTemplateData[];
  tags?: TagTemplateData[];
  operationCount?: number;
  externalDocsUrl?: string;
}

/**
 * Converts API name to package name (kebab-case)
 */
function toPackageName(apiName: string): string {
  return apiName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Converts API name to binary name (kebab-case)
 */
function toBinName(apiName: string): string {
  return `${toPackageName(apiName)}-mcp`;
}

/**
 * Main scaffolding function
 * Creates complete project structure with all configuration files
 */
export async function scaffoldProject(options: ScaffoldOptions): Promise<void> {
  const { outputDir } = options;

  log('Starting project scaffolding...');

  try {
    // Create directory structure
    await createDirectoryStructure(outputDir);

    // Generate all configuration files
    await generatePackageJson(outputDir, options);
    await generateTsConfig(outputDir);
    await generateEnvExample(outputDir, options);
    await generateGitIgnore(outputDir);
    await generateReadme(outputDir, options);
    await generatePrettierConfig(outputDir);
    await generateEslintConfig(outputDir);
    await generateLicense(outputDir, options);

    log('Project scaffolding complete');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new GenerationError(
      `Failed to scaffold project: ${message}`,
      'SCAFFOLDING_ERROR',
      { outputDir, error }
    );
  }
}

/**
 * Creates the basic directory structure
 */
async function createDirectoryStructure(outputDir: string): Promise<void> {
  log('Creating directory structure...');

  const dirs = [
    outputDir,
    resolve(outputDir, 'src'),
  ];

  for (const dir of dirs) {
    await createDirectory(dir);
  }
}

/**
 * Generates package.json file
 */
async function generatePackageJson(
  outputDir: string,
  options: ScaffoldOptions
): Promise<void> {
  log('Generating package.json...');

  const packageName = toPackageName(options.apiName);
  const binName = toBinName(options.apiName);

  const packageJson = {
    name: packageName,
    version: options.apiVersion || '1.0.0',
    description: options.apiDescription || `MCP server for ${options.apiName} API`,
    type: 'module',
    main: 'dist/index.js',
    bin: {
      [binName]: 'dist/index.js',
    },
    scripts: {
      build: 'tsc',
      start: 'node dist/index.js',
      dev: 'tsx watch src/index.ts',
      typecheck: 'tsc --noEmit',
    },
    keywords: [
      'mcp',
      'model-context-protocol',
      packageName,
      'api-client',
    ],
    engines: {
      node: '>=18.0.0',
    },
    dependencies: {
      '@modelcontextprotocol/sdk': '^0.5.0',
      axios: '^1.6.0',
      dotenv: '^16.3.0',
    },
    devDependencies: {
      '@types/node': '^20.10.0',
      typescript: '^5.3.0',
      tsx: '^4.7.0',
    },
    license: options.license || 'MIT',
    ...(options.author && { author: options.author }),
    ...(options.repository && { repository: options.repository }),
  };

  const content = JSON.stringify(packageJson, null, 2) + '\n';
  await writeFile(resolve(outputDir, 'package.json'), content);
}

/**
 * Generates tsconfig.json file
 */
async function generateTsConfig(outputDir: string): Promise<void> {
  log('Generating tsconfig.json...');

  const tsConfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };

  const content = JSON.stringify(tsConfig, null, 2) + '\n';
  await writeFile(resolve(outputDir, 'tsconfig.json'), content);
}

/**
 * Generates .env.example file
 */
async function generateEnvExample(
  outputDir: string,
  options: ScaffoldOptions
): Promise<void> {
  log('Generating .env.example...');

  const lines: string[] = [
    `# ${options.apiName} MCP Server Configuration`,
    '# Copy this file to .env and fill in your values',
    '',
    '# API Base URL',
    `API_BASE_URL=${options.baseURL}`,
    '',
    '# API Timeout (milliseconds)',
    'API_TIMEOUT=30000',
    '',
  ];

  // Add authentication variables if security schemes are present
  if (options.securitySchemes && options.securitySchemes.length > 0) {
    lines.push('# Authentication (uncomment and configure as needed)');

    const hasApiKey = options.securitySchemes.some(
      (s) => s.type === 'apiKey'
    );
    const hasBearerToken = options.securitySchemes.some(
      (s) => s.type === 'http' && s.scheme === 'bearer'
    );
    const hasBasicAuth = options.securitySchemes.some(
      (s) => s.type === 'http' && s.scheme === 'basic'
    );

    if (hasApiKey) {
      lines.push('# API_KEY=your-api-key-here');
    }
    if (hasBearerToken) {
      lines.push('# BEARER_TOKEN=your-bearer-token-here');
    }
    if (hasBasicAuth) {
      lines.push('# BASIC_AUTH_USERNAME=your-username');
      lines.push('# BASIC_AUTH_PASSWORD=your-password');
    }

    lines.push('');
  }

  lines.push('# Debug Mode (set to \'true\' to enable verbose logging)');
  lines.push('DEBUG=false');
  lines.push('');

  await writeFile(resolve(outputDir, '.env.example'), lines.join('\n'));
}

/**
 * Generates .gitignore file
 */
async function generateGitIgnore(outputDir: string): Promise<void> {
  log('Generating .gitignore...');

  const lines = [
    '# Dependencies',
    'node_modules/',
    '',
    '# Build output',
    'dist/',
    '*.tsbuildinfo',
    '',
    '# Environment variables',
    '.env',
    '.env.local',
    '',
    '# Logs',
    '*.log',
    'npm-debug.log*',
    'pnpm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    '',
    '# Coverage',
    'coverage/',
    '.nyc_output/',
    '',
    '# OS files',
    '.DS_Store',
    'Thumbs.db',
    '',
    '# IDE',
    '.vscode/',
    '.idea/',
    '*.swp',
    '*.swo',
    '*~',
    '',
  ];

  await writeFile(resolve(outputDir, '.gitignore'), lines.join('\n'));
}

/**
 * Generates README.md file
 */
async function generateReadme(
  outputDir: string,
  options: ScaffoldOptions
): Promise<void> {
  log('Generating README.md...');

  const packageName = toPackageName(options.apiName);
  const operationCount = options.operationCount || 0;
  const hasAuth = options.securitySchemes && options.securitySchemes.length > 0;

  const lines: string[] = [
    `# ${options.apiName} MCP Server`,
    '',
  ];

  if (options.apiDescription) {
    lines.push(options.apiDescription);
    lines.push('');
  }

  lines.push(`MCP server for the ${options.apiName} API, generated from OpenAPI specification.`);
  lines.push('');

  // Features section
  lines.push('## Features');
  lines.push('');
  if (operationCount > 0) {
    lines.push(`- ✅ **${operationCount} API operations** available as MCP tools`);
  }
  lines.push('- ✅ **Type-safe** TypeScript implementation');
  lines.push('- ✅ **Automatic retries** with exponential backoff');
  if (hasAuth) {
    lines.push('- ✅ **Authentication** support (API Key, Bearer Token, Basic Auth)');
  }
  lines.push('- ✅ **Error handling** with detailed error messages');
  lines.push('- ✅ **Full MCP protocol** compatibility');
  lines.push('');

  // Installation
  lines.push('## Installation');
  lines.push('');
  lines.push('```bash');
  lines.push('npm install');
  lines.push('```');
  lines.push('');

  // Configuration
  lines.push('## Configuration');
  lines.push('');
  lines.push('1. Copy the example environment file:');
  lines.push('```bash');
  lines.push('cp .env.example .env');
  lines.push('```');
  lines.push('');
  lines.push('2. Edit `.env` and configure your API credentials:');
  lines.push('```bash');
  lines.push(`API_BASE_URL=${options.baseURL}`);
  if (hasAuth) {
    lines.push('API_KEY=your-api-key-here');
  }
  lines.push('```');
  lines.push('');

  // Usage
  lines.push('## Usage');
  lines.push('');
  lines.push('### Build the project');
  lines.push('');
  lines.push('```bash');
  lines.push('npm run build');
  lines.push('```');
  lines.push('');
  lines.push('### Run the MCP server');
  lines.push('');
  lines.push('```bash');
  lines.push('npm start');
  lines.push('```');
  lines.push('');
  lines.push('### Development mode (with auto-reload)');
  lines.push('');
  lines.push('```bash');
  lines.push('npm run dev');
  lines.push('```');
  lines.push('');

  // Claude Desktop integration
  lines.push('### Use with Claude Desktop');
  lines.push('');
  lines.push('Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):');
  lines.push('');
  lines.push('```json');
  lines.push('{');
  lines.push('  "mcpServers": {');
  lines.push(`    "${packageName}": {`);
  lines.push('      "command": "node",');
  lines.push(`      "args": ["/path/to/${packageName}/dist/index.js"]`);
  lines.push('    }');
  lines.push('  }');
  lines.push('}');
  lines.push('```');
  lines.push('');

  // Available tools
  lines.push('## Available Tools');
  lines.push('');
  if (operationCount > 0) {
    lines.push(`This MCP server provides ${operationCount} tools for interacting with the ${options.apiName} API.`);
    lines.push('');
  }

  if (options.tags && options.tags.length > 0) {
    lines.push('### By Category');
    for (const tag of options.tags) {
      lines.push(`- **${tag.name}**${tag.description ? `: ${tag.description}` : ''}`);
    }
    lines.push('');
  }

  lines.push('Use the `listTools` method in Claude to discover available operations.');
  lines.push('');

  // Documentation
  lines.push('## Documentation');
  lines.push('');
  if (options.externalDocsUrl) {
    lines.push(`- [API Documentation](${options.externalDocsUrl})`);
  }
  lines.push('- OpenAPI Specification: See the original OpenAPI spec file');
  lines.push('');

  // Troubleshooting
  lines.push('## Troubleshooting');
  lines.push('');
  lines.push('### Server won\'t start');
  lines.push('- Check that Node.js version is >=18.0.0: `node --version`');
  lines.push('- Verify all dependencies are installed: `npm install`');
  lines.push('- Check your `.env` file has correct configuration');
  lines.push('');

  if (hasAuth) {
    lines.push('### Authentication errors');
    lines.push('- Verify your API credentials in `.env` file');
    lines.push('- Check that credentials have necessary permissions');
    lines.push('');
  }

  lines.push('### Debug mode');
  lines.push('Enable debug logging to see detailed request/response information:');
  lines.push('```bash');
  lines.push('DEBUG=true npm start');
  lines.push('```');
  lines.push('');

  // License
  lines.push('## License');
  lines.push('');
  lines.push(options.license || 'MIT');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('Generated with [OpenAPI-to-MCP Generator](https://github.com/your-org/openapi-to-mcp)');
  lines.push('');

  await writeFile(resolve(outputDir, 'README.md'), lines.join('\n'));
}

/**
 * Generates .prettierrc file
 */
async function generatePrettierConfig(outputDir: string): Promise<void> {
  log('Generating .prettierrc...');

  const prettierConfig = {
    semi: true,
    singleQuote: true,
    trailingComma: 'all' as const,
    printWidth: 100,
    tabWidth: 2,
    arrowParens: 'always' as const,
  };

  const content = JSON.stringify(prettierConfig, null, 2) + '\n';
  await writeFile(resolve(outputDir, '.prettierrc'), content);
}

/**
 * Generates .eslintrc.json file
 */
async function generateEslintConfig(outputDir: string): Promise<void> {
  log('Generating .eslintrc.json...');

  const eslintConfig = {
    env: {
      node: true,
      es2022: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      'no-console': 'error',
    },
    ignorePatterns: ['dist/', 'node_modules/', '*.config.js'],
  };

  const content = JSON.stringify(eslintConfig, null, 2) + '\n';
  await writeFile(resolve(outputDir, '.eslintrc.json'), content);
}

/**
 * Generates LICENSE file
 */
async function generateLicense(
  outputDir: string,
  options: ScaffoldOptions
): Promise<void> {
  log('Generating LICENSE...');

  const year = new Date().getFullYear();
  const author = options.author || 'OpenAPI-to-MCP Generator';
  const license = options.license || 'MIT';

  let content: string;

  if (license === 'MIT') {
    content = `MIT License

Copyright (c) ${year} ${author}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
  } else {
    // For other licenses, just add a placeholder
    content = `${license} License

Copyright (c) ${year} ${author}

This project is licensed under the ${license} License.
See LICENSE file for more details.
`;
  }

  await writeFile(resolve(outputDir, 'LICENSE'), content);
}
