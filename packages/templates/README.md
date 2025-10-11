# @openapi-to-mcp/templates

Boilerplate templates for MCP (Model Context Protocol) server generation.

## Purpose

The Templates package provides pre-built boilerplate templates used by the OpenAPI-to-MCP Generator to create MCP server projects. These templates serve as the foundation for generated code, providing:
- Basic MCP server structure with TypeScript
- Standard configuration files (tsconfig.json, package.json)
- Build and development scripts
- Environment variable setup
- Documentation templates

## Available Templates

### `hello-world (removed Story 6.3)/`

A minimal MCP server template demonstrating the basic structure and functionality.

**Features:**
- Single "hello" tool implementation
- TypeScript with strict mode
- Standard MCP protocol handling (stdin/stdout)
- Claude Desktop integration instructions
- Development and build scripts
- Environment variable support

**Generated Structure:**
```
output-directory/
├── src/
│   └── index.ts          # Main MCP server implementation
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Environment variable template
├── .gitignore           # Git ignore patterns
└── README.md            # Usage documentation
```

**Scripts Included:**
- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch mode with automatic rebuilds
- `npm run clean` - Remove build artifacts
- `node dist/index.js` - Run the MCP server

**Tool Provided:**
- `hello` - Returns "Hello from MCP!" greeting

### Future Templates (Epic 2+)

Additional templates will be added for different use cases:
- `rest-api/` - RESTful API integration template
- `openapi-full/` - Full OpenAPI specification template with authentication
- `minimal/` - Bare-bones template for custom implementations

## Template Structure Requirements

All templates must follow the MCP server structure requirements:

### Required Files

1. **`src/index.ts`** - Main server entry point
   - MCP protocol initialization
   - Tool definitions and handlers
   - stdin/stdout communication

2. **`package.json`** - Node.js configuration
   - MCP SDK dependencies (`@modelcontextprotocol/sdk`)
   - Build scripts (build, dev, clean)
   - Node.js version requirement (≥18.0.0)

3. **`README.md`** - Documentation
   - Setup instructions
   - Usage guide
   - Claude Desktop integration
   - Available tools documentation

4. **`tsconfig.json`** - TypeScript configuration
   - Strict mode enabled
   - ESM module output
   - Source maps for debugging

### Optional Files

- **`.env.example`** - Environment variable template (without sensitive values)
- **`.gitignore`** - Git ignore patterns (dist/, node_modules/, .env)
- **`src/types.ts`** - Shared TypeScript type definitions
- **`src/tools/`** - Tool implementations (for complex templates)

## Usage

Templates are copied by the Generator package using the `copyTemplate()` function:

```typescript
import { copyTemplate } from '@openapi-to-mcp/generator';

// Copy hello-world template to output directory
await copyTemplate(
  './packages/templates/hello-world',
  './output/my-mcp-server'
);
```

The CLI automatically selects the appropriate template based on:
1. User-specified template flag (future feature)
2. OpenAPI specification complexity (future feature)
3. Default: `hello-world` template

## Template Development

### Creating a New Template

1. **Create template directory:**
   ```bash
   mkdir packages/templates/my-template
   ```

2. **Add required files:**
   ```bash
   packages/templates/my-template/
   ├── src/
   │   └── index.ts
   ├── package.json
   ├── tsconfig.json
   └── README.md
   ```

3. **Follow structure requirements:**
   - Include all required files (see above)
   - Use placeholder values that can be replaced during generation
   - Document all tools and configuration options
   - Provide clear setup and usage instructions

4. **Test template:**
   ```bash
   # Use generator to copy template
   pnpm --filter @openapi-to-mcp/cli generate test.yaml \
     --output ./test-output \
     --template my-template
   ```

### Template Placeholders (Future Feature)

Templates will support dynamic replacements in Epic 2:

| Placeholder | Replacement | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | User-specified project name | `my-api-mcp` |
| `{{API_TITLE}}` | OpenAPI spec title | `Petstore API` |
| `{{API_VERSION}}` | OpenAPI spec version | `1.0.0` |
| `{{TOOLS}}` | Generated tool implementations | Tool code |
| `{{TYPES}}` | Generated TypeScript types | Type definitions |

**Example `package.json` with placeholders:**
```json
{
  "name": "{{PROJECT_NAME}}",
  "version": "{{API_VERSION}}",
  "description": "MCP server for {{API_TITLE}}"
}
```

### Best Practices

1. **Keep templates minimal** - Only include essential files and configuration
2. **Use TypeScript strict mode** - Ensure type safety from the start
3. **Include clear documentation** - Users should understand setup immediately
4. **Follow MCP conventions** - Adhere to official MCP protocol standards
5. **Environment variables** - Never include sensitive values, use `.env.example`
6. **ESM modules** - Use modern ES module syntax (`import/export`)

## Testing Templates

### Manual Testing

```bash
# 1. Copy template to test directory
pnpm --filter @openapi-to-mcp/cli generate test.yaml \
  --output ./test-mcp-server \
  --force

# 2. Install dependencies
cd test-mcp-server
npm install

# 3. Build and run
npm run build
node dist/index.js

# 4. Test with MCP Inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

### Automated Validation

The generator validates templates using `validateOutputStructure()`:

```typescript
import { validateOutputStructure } from '@openapi-to-mcp/generator';

// Validates presence of required files
const isValid = await validateOutputStructure('./my-template');
// Checks: src/, package.json, README.md
```

## Integration with Generator

Templates integrate with the generator through the CLI:

**Current Flow (Story 1.5):**
1. CLI receives OpenAPI specification path
2. Generator validates output directory
3. Template (hello-world) copied to output
4. Success message displayed

**Future Flow (Epic 2):**
1. CLI receives OpenAPI specification
2. Parser extracts endpoints and schemas
3. Generator selects appropriate template
4. Placeholders replaced with spec data
5. Tools and types generated from spec
6. Output validated and documented

## Configuration

### Template Selection (Future)

Users will be able to specify templates via CLI flags:

```bash
# Use specific template
openapi-to-mcp generate api.yaml --template rest-api

# Use minimal template
openapi-to-mcp generate api.yaml --template minimal
```

### Custom Templates (Future)

Users can provide custom template paths:

```bash
# Use custom template directory
openapi-to-mcp generate api.yaml --template-path ./my-templates/custom
```

## Links

- [MCP Documentation](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Generator Package](../generator/README.md)
- [CLI Package](../cli/README.md)
- [Contributing Guide](../../CONTRIBUTING.md)

## Package Information

- **Name:** `@openapi-to-mcp/templates`
- **Version:** 0.1.0
- **Type:** Static template files (no build process)
- **Node.js:** ≥18.0.0
- **Private:** Yes (templates are copied, not installed as dependencies)
