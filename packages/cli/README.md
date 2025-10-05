# @openapi-to-mcp/cli

Command-line interface for the OpenAPI-to-MCP Generator.

## Purpose

The CLI package provides the command-line interface for generating MCP (Model Context Protocol) servers from OpenAPI specifications. It orchestrates the parsing and generation process and provides user-friendly commands and error messages.

## Installation

```bash
# Global installation
npm install -g @openapi-to-mcp/cli

# Local project installation
npm install --save-dev @openapi-to-mcp/cli
```

## Usage

### Generate Command

Generate an MCP server from an OpenAPI specification:

```bash
openapi-to-mcp generate <openapi-path> [options]
```

**Options**:
- `-o, --output <dir>` - Output directory (default: `./mcp-server`)
- `-f, --format [json|yaml]` - Format (auto-detected if not specified)
- `-v, --verbose` - Enable verbose output
- `-a, --auth-type [apiKey|bearer|basic]` - Authentication type (auto-detected)
- `--force` - Overwrite output directory if it exists

**Examples**:
```bash
# Basic usage
openapi-to-mcp generate petstore.yaml

# Custom output directory
openapi-to-mcp generate api.json --output ./my-server

# Verbose mode
openapi-to-mcp generate spec.yaml --verbose

# Force overwrite
openapi-to-mcp generate api.json --output ./existing-dir --force
```

## Architecture

### Package Structure

```
packages/cli/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── commands/
│   │   └── generate.ts       # Generate command
│   ├── errors/               # Error handling
│   │   ├── base-error.ts
│   │   ├── formatter.ts
│   │   └── exit-codes.ts
│   └── logging/
│       └── logger.ts         # Logging utility
└── __tests__/                # Test files
```

### Error Handling

The CLI provides structured error messages with context and suggested fixes:

```typescript
import { ValidationError } from '@openapi-to-mcp/cli/errors';

throw new ValidationError(
  'Missing required field',
  { file: 'openapi.yaml', field: 'info.title' },
  'Add a title field to the info section'
);
```

Error classes:
- `CLIError` - User-facing errors (exit code 1)
- `ValidationError` - Validation failures
- `FileSystemError` - File operation errors
- `InternalError` - Internal errors (exit code 2)

### Logging

The CLI uses namespaced logging with the `debug` library:

```typescript
import { createLogger } from '@openapi-to-mcp/cli/logging';

const logger = createLogger('openapi-to-mcp:cli:generate');

logger.info('Processing OpenAPI spec');
logger.debug('File path:', filePath);
logger.error('Failed to parse', error);
```

## Development

### Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage
```

### Building

```bash
pnpm build
```

Output: `dist/index.js` (ESM)

### Local Testing

```bash
# Build first
pnpm build

# Test CLI locally
node dist/index.js generate test.yaml
```

## API Reference

### Exports

#### Commands
- `registerGenerateCommand(program: Command): void` - Register generate command

#### Errors
- `BaseError` - Base error class
- `CLIError` - CLI-specific errors
- `ValidationError` - Validation errors
- `FileSystemError` - File system errors
- `InternalError` - Internal errors
- `formatError(error, options)` - Format error for display
- `getExitCode(error)` - Get appropriate exit code

#### Logging
- `createLogger(namespace, options)` - Create namespaced logger
- `Logger` class with methods: `error()`, `warn()`, `info()`, `debug()`

## Links

- [Architecture Documentation](../../docs/architecture/)
- [Error Handling Guide](../../docs/architecture/architecture.md#error-handling-strategy)
- [Contributing Guide](../../CONTRIBUTING.md)
