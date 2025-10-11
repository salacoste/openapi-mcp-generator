# Quick Start Tutorial

> Generate your first MCP server from an OpenAPI specification in under 5 minutes.

**Total Time**: ~5 minutes
**Difficulty**: Beginner
**Prerequisites**: Node.js 18+ installed

---

## Table of Contents

- [Step 1: Install the CLI](#step-1-install-the-cli-30-seconds)
- [Step 2: Get an OpenAPI Spec](#step-2-get-an-openapi-spec-30-seconds)
- [Step 3: Generate MCP Server](#step-3-generate-mcp-server-1-minute)
- [Step 4: Inspect Generated Files](#step-4-inspect-generated-files-30-seconds)
- [Step 5: Build and Run](#step-5-build-and-run-2-minutes)
- [Step 6: Integrate with Claude Desktop](#step-6-integrate-with-claude-desktop-1-minute)
- [Next Steps](#next-steps)

---

## Step 1: Install the CLI (30 seconds)

Install the OpenAPI-to-MCP CLI globally:

```bash
npm install -g @openapi-to-mcp/cli
```

**Expected Time**: 30 seconds

**Success Check**: Verify installation by checking the version:

```bash
@openapi-to-mcp/cli --version
# Should output: 0.1.0 (or current version)
```

> **Troubleshooting**: If you see "command not found", ensure npm global bin is in your PATH:
> ```bash
> export PATH="$(npm config get prefix)/bin:$PATH"
> # Add to ~/.bashrc or ~/.zshrc to make permanent
> ```

---

## Step 2: Get an OpenAPI Spec (30 seconds)

You can use any OpenAPI 3.0 specification. For this tutorial, we'll use a sample spec:

**Option A**: Use a public API spec

```bash
# Example: Ozon Performance API
curl -o swagger.json https://api-seller.ozon.ru/schema/swagger.json
```

**Option B**: Use your own API spec

```bash
# If you have your own OpenAPI spec file
cp /path/to/your/openapi.yaml swagger.json
```

**Expected Time**: 30 seconds

**Success Check**: Verify the file exists and is valid JSON/YAML:

```bash
ls -lh swagger.json
# Should show file size (e.g., 260K for Ozon API)

# Quick validation
head -20 swagger.json
# Should show OpenAPI structure
```

---

## Step 3: Generate MCP Server (1 minute)

Generate your MCP server from the OpenAPI spec:

```bash
@openapi-to-mcp/cli generate swagger.json --output ./my-mcp-server
```

**What's Happening**:
1. ✅ Parser loads and validates the OpenAPI specification
2. ✅ Extracts all schemas, operations, and metadata
3. ✅ Generates TypeScript interfaces for all types
4. ✅ Creates MCP tool definitions for all API endpoints
5. ✅ Scaffolds complete project structure
6. ✅ Generates server entry point and HTTP client

**Expected Time**: 1 minute

**Success Check**: You should see output similar to:

```
✅ Parsing OpenAPI spec... (260KB)
✅ Validated OpenAPI schema
✅ Resolved 45 $ref references
✅ Extracted 220 schemas
✅ Extracted 39 operations
✅ Scaffolding project structure...
✅ Generating TypeScript interfaces... (220 types)
✅ Generating MCP tool definitions... (39 tools)
✅ Generating server files...
✅ MCP server generated successfully at ./my-mcp-server
```

> **Troubleshooting**: If generation fails:
> - Check that swagger.json is valid: `npx swagger-cli validate swagger.json`
> - Use `--debug` flag for detailed error information
> - Ensure output directory doesn't exist (or use `--force` to overwrite)

---

## Step 4: Inspect Generated Files (30 seconds)

Let's explore what was generated:

```bash
cd my-mcp-server
ls -la
```

**Expected Structure**:

```
my-mcp-server/
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── README.md             # Generated usage instructions
├── .env.example          # Environment variables template
└── src/
    ├── index.ts          # MCP server entry point
    ├── types.ts          # TypeScript type definitions
    ├── tools.ts          # MCP tool definitions
    └── http-client.ts    # Authenticated HTTP client
```

**Quick Peek** at generated files:

```bash
# See how many tools were generated
grep -c "export const.*Tool" src/tools.ts

# See how many types were generated
grep -c "export interface" src/types.ts

# View server entry point
head -30 src/index.ts
```

**Expected Time**: 30 seconds

**Success Check**: All files should exist and contain TypeScript code

---

## Step 5: Build and Run (2 minutes)

Install dependencies, compile TypeScript, and run the server:

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Run the MCP server
node dist/index.js
```

**What's Happening**:
1. npm install downloads @modelcontextprotocol/sdk, axios, zod, and other dependencies
2. npm run build compiles TypeScript to JavaScript in the `dist/` folder
3. node dist/index.js starts the MCP server on stdio

**Expected Time**: 2 minutes (mostly npm install)

**Success Check**: You should see:

```
[Server Name] MCP server running on stdio
```

The server is now running and waiting for MCP protocol messages via stdin/stdout.

**To stop the server**: Press `Ctrl+C`

> **Troubleshooting**:
> - If `npm install` fails, ensure you have Node.js 18+ installed
> - If build fails with type errors, the OpenAPI spec may have issues
> - If server fails to start, check for missing environment variables

---

## Step 6: Integrate with Claude Desktop (1 minute)

To use your MCP server with Claude Desktop:

### 1. Locate your Claude Desktop config file

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

### 2. Add your MCP server

Edit the config file and add:

```json
{
  "mcpServers": {
    "my-api": {
      "command": "node",
      "args": ["/absolute/path/to/my-mcp-server/dist/index.js"],
      "env": {
        "API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Important**: Replace `/absolute/path/to/my-mcp-server` with the actual absolute path!

### 3. Restart Claude Desktop

Completely quit and restart Claude Desktop for the changes to take effect.

### 4. Test It Out

In Claude Desktop, type:

```
Can you list the available API tools you have access to?
```

Claude should now see all the MCP tools generated from your OpenAPI spec!

**Expected Time**: 1 minute

**Success Check**: Claude responds with a list of available tools from your API

> **Troubleshooting**:
> - Ensure the path is absolute, not relative
> - Check Claude Desktop logs if tools don't appear
> - Verify the server runs successfully when started manually first

---

## Next Steps

Congratulations! 🎉 You've successfully generated and deployed your first MCP server.

### Learn More

- **[Generation Pipeline](./generation-pipeline.md)** - Understand how the generator works
- **[Troubleshooting Guide](./troubleshooting.md)** - Solve common issues
- **[Architecture Guide](../architecture.md)** - Deep dive into system design

### Enhance Your Server

- **Add Authentication**: Configure API keys, bearer tokens, or OAuth in `.env`
- **Customize Tools**: Modify `src/tools.ts` to adjust tool descriptions
- **Add Error Handling**: Enhance `src/http-client.ts` with custom error handling
- **Deploy to Production**: Package as npm module or Docker container

### Try More Examples

- **[Ozon Performance API Example](../../examples/ozon-performance-mcp/)** - Complete working example
- **[Examples Documentation](../examples.md)** - More usage examples

### Get Help

- **Issues**: [GitHub Issues](https://github.com/your-org/openapi-to-mcp/issues)
- **Documentation**: [Full Documentation](../)
- **Community**: [Discussions](https://github.com/your-org/openapi-to-mcp/discussions)

---

**Tutorial Complete!** ✨

You've learned how to:
- ✅ Install the OpenAPI-to-MCP CLI
- ✅ Generate an MCP server from an OpenAPI spec
- ✅ Build and run the generated server
- ✅ Integrate with Claude Desktop

Total time: ~5 minutes 🚀
