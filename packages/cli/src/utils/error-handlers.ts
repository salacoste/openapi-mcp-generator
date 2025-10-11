/**
 * Error handling utilities for CLI operations
 * Provides specific error handlers for common failure scenarios
 */

import { readFileSync } from 'fs';
import { ValidationError } from './validation.js';

/**
 * Handle parser errors with user-friendly context
 */
export function handleParserError(error: Error): never {
  if (error.message.includes('Invalid OpenAPI version')) {
    throw new ValidationError(
      'Unsupported OpenAPI version detected',
      'This tool supports OpenAPI 3.0.x specifications',
      'Convert your spec to OpenAPI 3.0: https://swagger.io/tools/swagger-converter/'
    );
  }

  if (error.message.includes('Missing operationId')) {
    throw new ValidationError(
      'OpenAPI operations must have unique operationId',
      'Add operationId to each operation in your spec',
      'See: https://swagger.io/specification/#operation-object'
    );
  }

  if (error.message.includes('$ref') || error.message.includes('reference')) {
    throw new ValidationError(
      'Failed to resolve schema reference in OpenAPI spec',
      'Check that all $ref pointers are valid',
      'Validate spec: swagger-cli validate your-spec.json'
    );
  }

  // Generic parser error
  throw new ValidationError(
    `OpenAPI parsing failed: ${error.message}`,
    'Validate your OpenAPI specification',
    'Use: swagger-cli validate your-spec.json'
  );
}

/**
 * Handle file system errors with actionable context
 */
export function handleFileSystemError(
  error: NodeJS.ErrnoException,
  path: string
): never {
  switch (error.code) {
    case 'EACCES':
      throw new ValidationError(
        `Permission denied: ${path}`,
        'Check file/directory permissions',
        `chmod 755 ${path}`
      );

    case 'ENOENT':
      throw new ValidationError(
        `Path does not exist: ${path}`,
        'Verify the path is correct',
        `ls -la ${path}`
      );

    case 'ENOSPC':
      throw new ValidationError(
        'No space left on device',
        'Free up disk space or use different output directory',
        'df -h'
      );

    case 'EMFILE':
    case 'ENFILE':
      throw new ValidationError(
        'Too many open files',
        'Increase system file descriptor limit',
        'ulimit -n 4096'
      );

    case 'EISDIR':
      throw new ValidationError(
        `Expected file but found directory: ${path}`,
        'Check that the path points to a file',
        `ls -la ${path}`
      );

    default:
      throw new ValidationError(
        `File system error: ${error.message}`,
        'Check system logs for details',
        error.code ? `Error code: ${error.code}` : undefined
      );
  }
}

/**
 * Handle network/fetch errors with detailed diagnostics
 */
export function handleNetworkError(error: Error, url?: string): never {
  const isTimeout = error.message.includes('timeout');
  const isConnectionRefused =
    error.message.includes('ECONNREFUSED') ||
    error.message.includes('ENOTFOUND');

  if (isTimeout) {
    throw new ValidationError(
      url ? `Network timeout while fetching: ${url}` : 'Network timeout',
      'Check your internet connection or increase timeout',
      url ? `curl -I ${url} # Test connectivity` : undefined
    );
  }

  if (isConnectionRefused) {
    const hostname = url ? new URL(url).hostname : 'server';
    throw new ValidationError(
      url ? `Cannot connect to: ${url}` : 'Network connection failed',
      'Verify the URL is correct and accessible',
      `ping ${hostname} # Test connectivity`
    );
  }

  throw new ValidationError(
    url ? `Network error fetching: ${url}` : `Network error: ${error.message}`,
    'Check your internet connection and try again',
    error.message
  );
}

/**
 * YAML error mark interface
 */
interface YAMLErrorMark {
  line: number;
  column: number;
}

/**
 * Handle YAML parsing errors with line/column context
 */
export function handleYAMLParseError(error: unknown, filePath: string): never {
  // Check if error has line/column information (yaml parser format)
  if (error && typeof error === 'object' && 'mark' in error) {
    const mark = (error as { mark: YAMLErrorMark }).mark;
    const snippet = extractYAMLSnippet(filePath, mark.line, mark.column);

    throw new ValidationError(
      `YAML syntax error in ${filePath}`,
      `Fix YAML syntax at line ${mark.line + 1}, column ${mark.column + 1}`,
      snippet
    );
  }

  // Generic YAML parse error
  throw new ValidationError(
    `Failed to parse YAML file: ${filePath}`,
    'Check YAML syntax with a validator',
    error instanceof Error ? error.message : String(error)
  );
}

/**
 * Extract YAML snippet around error location for better context
 */
function extractYAMLSnippet(
  filePath: string,
  line: number,
  column: number
): string {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const start = Math.max(0, line - 2);
    const end = Math.min(lines.length, line + 3);

    const snippet = lines
      .slice(start, end)
      .map((l, i) => {
        const lineNum = start + i + 1;
        const prefix = lineNum === line + 1 ? '>' : ' ';
        const marker =
          lineNum === line + 1 ? '\n' + ' '.repeat(column + 3) + '^' : '';
        return `${prefix} ${lineNum} | ${l}${marker}`;
      })
      .join('\n');

    return snippet;
  } catch {
    return 'Unable to extract YAML snippet';
  }
}

/**
 * Handle timeout errors with actionable suggestions
 */
export function handleTimeoutError(operation: string, timeoutMs: number): never {
  throw new ValidationError(
    `Operation timed out: ${operation}`,
    'Increase timeout or check system resources',
    `# Current timeout: ${timeoutMs}ms\n# Try: increase timeout to ${timeoutMs * 2}ms`
  );
}

/**
 * Handle unsupported OpenAPI version errors
 */
export function handleUnsupportedVersion(version: string): never {
  const supported = ['3.0.0', '3.0.1', '3.0.2', '3.0.3'];

  throw new ValidationError(
    `Unsupported OpenAPI version: ${version}`,
    'This tool supports OpenAPI 3.0.x only',
    `Supported versions: ${supported.join(', ')}\nConvert your spec: https://converter.swagger.io/`
  );
}

/**
 * Handle missing dependency errors with install instructions
 */
export function handleMissingDependency(dependency: string): never {
  const installCommands: Record<string, string> = {
    axios: 'npm install axios',
    '@modelcontextprotocol/sdk': 'npm install @modelcontextprotocol/sdk',
    dotenv: 'npm install dotenv',
  };

  const installCmd = installCommands[dependency] || `npm install ${dependency}`;

  throw new ValidationError(
    `Missing required dependency: ${dependency}`,
    'Install missing dependencies in generated project',
    `cd <output-directory>\n${installCmd}`
  );
}

/**
 * Handle circular reference errors in OpenAPI specs
 */
export function handleCircularReference(refPath: string[]): never {
  const cycle = refPath.join(' -> ');

  throw new ValidationError(
    'Circular reference detected in OpenAPI spec',
    'Remove circular $ref or flatten the schema',
    `Reference cycle: ${cycle}`
  );
}
