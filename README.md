# OpenAPI-to-MCP Generator

> Universal generator that converts OpenAPI/Swagger specifications into MCP (Model Context Protocol) servers, enabling AI agents to interact with any REST API.

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/your-org/openapi-to-mcp)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

---

## ✨ Features

- 🔄 **Universal**: Works with any valid OpenAPI 3.0 specification
- 🤖 **AI-First**: Optimized tool descriptions and responses for AI consumption
- 🎯 **Smart Filtering**: Tag-based categorization to manage 200+ API methods
- 📝 **Type-Safe**: Generates TypeScript types from OpenAPI schemas
- ⚡ **Fast**: Parses Ozon API (39 paths, 87 schemas) in < 100ms
- 🔌 **Ready-to-Use**: Generates complete, deployable MCP servers

---

## 🚀 Quick Start

### Installation

```bash
# Install globally
npm install -g openapi-to-mcp

# Or use locally in project
npm install --save-dev openapi-to-mcp
```

### Generate MCP Server

```bash
# From OpenAPI spec file
openapi-to-mcp generate ./swagger.json -o ./my-mcp-server

# Navigate and start
cd my-mcp-server
npm install
export API_TOKEN="your-token-here"
npm start
```

### Use in AI Agent

```json
// Claude Desktop config
{
  "mcpServers": {
    "my-api": {
      "command": "node",
      "args": ["/path/to/my-mcp-server/dist/server.js"],
      "env": {
        "API_TOKEN": "your-token-here"
      }
    }
  }
}
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Project Brief](./docs/brief.md) | Project overview, goals, and scope |
| [OpenAPI Research](./docs/openapi-research.md) | Complete OpenAPI 3.0 analysis with Ozon API validation |
| [Architecture](./docs/architecture.md) | System design, algorithms, and decisions |
| [API Reference](./docs/api-reference.md) | Complete API documentation |
| [Examples](./docs/examples.md) | Usage examples and recipes |
| [Testing Guide](./docs/testing.md) | Testing strategy and test cases |

---

## 🎯 Use Cases

### 1. E-Commerce APIs (Ozon, Amazon, Shopify)

```bash
# Generate MCP server for Ozon Performance API
openapi-to-mcp generate ./ozon-swagger.json \
  -o ./ozon-mcp \
  -n ozon-performance-api

# AI agent can now:
# - List advertising campaigns
# - Get campaign statistics
# - Update campaign budgets
# - Manage products and ads
```

### 2. Developer Tools (GitHub, GitLab, Jira)

```bash
# Generate GitHub API MCP server
openapi-to-mcp generate https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json \
  -f "repos,issues,pulls" \
  -o ./github-mcp

# AI agent can now:
# - Create issues and pull requests
# - Manage repositories
# - Review code
```

### 3. Payment Processing (Stripe, PayPal)

```bash
# Generate Stripe API MCP server
openapi-to-mcp generate ./stripe-openapi.json \
  -f "Customers,PaymentIntents,Charges" \
  -o ./stripe-mcp

# AI agent can now:
# - Create customers
# - Process payments
# - Manage subscriptions
```

### 4. Internal Company APIs

```bash
# Generate MCP server for internal API
openapi-to-mcp generate http://internal-api.company.local/openapi.json \
  -o ./company-api-mcp

# AI agent can now:
# - Access internal tools
# - Automate workflows
# - Query business data
```

---

## 🏗️ Architecture

### High-Level Overview

```
OpenAPI Spec → Parser → Generator → MCP Server
                ↓         ↓
              $refs     Types
            Resolved   Tools
                      Client
```

### Component Structure

```
openapi-to-mcp/
├── packages/
│   ├── cli/              # Command-line interface
│   ├── parser/           # OpenAPI parsing + $ref resolution
│   ├── generator/        # Code generation (types, tools, client)
│   └── shared/           # Shared utilities and types
├── examples/             # Example generated servers
├── tests/               # Test suites
└── docs/                # Documentation
```

### Key Algorithms

**$ref Resolution**:
```typescript
// Handles nested references with circular detection
function resolveRef(ref: string, spec: any): any {
  // Parse: "#/components/schemas/Campaign"
  // Traverse: spec.components.schemas.Campaign
  // Detect circular: visited set tracking
  // Return: resolved object
}
```

**Tool Generation**:
```typescript
// Converts OpenAPI operation → MCP tool
function generateTool(path, method, operation): MCPTool {
  name: operation.operationId || generated_name,
  description: AI-optimized description,
  inputSchema: parameters + requestBody,
  metadata: { path, method, tags, category }
}
```

**Smart Filtering**:
```typescript
// Tag-based categorization for AI context management
const categories = groupByTags(operations);
// Campaign: 15 methods
// Statistics: 12 methods
// Products: 18 methods
// → AI loads only relevant category
```

See [Architecture Documentation](./docs/architecture.md) for details.

---

## 🔧 CLI Reference

### `generate`

Generate MCP server from OpenAPI specification.

```bash
openapi-to-mcp generate <input> [options]
```

**Options**:
- `-o, --output <dir>` - Output directory (default: `./generated`)
- `-n, --name <name>` - Package name override
- `-f, --filter <tags>` - Comma-separated tags to include
- `--no-types` - Skip TypeScript types generation
- `--no-client` - Skip HTTP client generation
- `-v, --verbose` - Verbose logging

**Examples**:
```bash
# Basic usage
openapi-to-mcp generate ./swagger.json

# Filter by tags
openapi-to-mcp generate ./api.json -f "Campaign,Statistics"

# Custom output and name
openapi-to-mcp generate ./spec.yaml -o ./my-server -n my-api
```

### `validate`

Validate OpenAPI specification.

```bash
openapi-to-mcp validate <input> [options]
```

**Options**:
- `--strict` - Enable strict validation
- `-v, --verbose` - Verbose output

**Example**:
```bash
openapi-to-mcp validate ./swagger.json

# Output:
# ✓ Valid OpenAPI 3.0.0 specification
# ✓ 39 paths found
# ✓ 87 schemas found
# ⚠ 2 operations without operationId
```

### `init`

Initialize new MCP server project.

```bash
openapi-to-mcp init <name> [options]
```

**Options**:
- `-t, --template <type>` - Template type: `basic` | `advanced`
- `-d, --directory <dir>` - Target directory

---

## 📦 Generated Output

### File Structure

```
my-mcp-server/
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript config
├── README.md            # Usage documentation
├── .env.example         # Environment variables template
├── src/
│   ├── server.ts        # MCP server implementation
│   ├── types.ts         # Generated TypeScript types
│   ├── client.ts        # HTTP client with auth
│   └── config.ts        # Configuration handling
└── dist/                # Compiled JavaScript
    └── server.js
```

### Example: server.ts

```typescript
import { Server } from '@modelcontextprotocol/sdk/server';
import { APIClient } from './client';

export function createServer(config: ServerConfig) {
  const client = new APIClient(config);
  const server = new Server();

  // Generated tool: listCampaigns
  server.tool(
    'listCampaigns',
    {
      description: 'List all advertising campaigns\n📂 Category: Campaign',
      inputSchema: {
        type: 'object',
        properties: {
          page: { type: 'number', description: 'Page number' },
          pageSize: { type: 'number', description: 'Items per page' },
        },
      },
    },
    async (input) => {
      return await client.get('/api/client/campaign', {
        params: input,
      });
    }
  );

  // ... 38 more tools

  // Meta-tool: listMethods
  server.tool('listMethods', ..., async (input) => {
    return filterTools(allTools, input.category, input.search);
  });

  return server;
}
```

### Example: types.ts

```typescript
// Generated from OpenAPI schemas

export interface Campaign {
  id: string;
  title: string;
  budget?: number;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  createdAt?: Date;
}

export interface CampaignStatistics {
  campaignId: string;
  impressions: number;
  clicks: number;
  spend: number;
}

// ... 85 more interfaces
```

---

## 🧪 Testing

### Run Tests

```bash
# All tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Test Coverage

**Requirements**:
- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

**Current Coverage** (as of 2025-01-02):
- Parser: 85% lines, 85% functions
- Generator: 82% lines, 80% functions
- Shared: 90% lines, 90% functions

See [Testing Guide](./docs/testing.md) for details.

---

## 🛠️ Development

### Prerequisites

- **Node.js**: 20.11.0 LTS (minimum ≥18.0.0)
- **pnpm**: 8.15.1 or higher
- **TypeScript**: 5.3.3

### Setup

```bash
# Clone repository
git clone https://github.com/your-org/openapi-to-mcp.git
cd openapi-to-mcp

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint

# Format code
pnpm format
```

### Monorepo Structure

```
openapi-to-mcp/
├── packages/
│   ├── cli/              # Command-line interface
│   ├── parser/           # OpenAPI 3.0 parsing
│   ├── generator/        # Code generation engine
│   └── templates/        # Boilerplate templates
├── examples/             # Real-world test cases
├── tests/                # Cross-package integration tests
├── docs/                 # Architecture + API docs
├── scripts/              # Build and utility scripts
├── pnpm-workspace.yaml   # pnpm workspace configuration
├── package.json          # Root package configuration
├── tsconfig.json         # Base TypeScript configuration
└── README.md             # This file
```

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# ... edit code ...

# Run tests
npm test

# Build
npm run build

# Test locally
openapi-to-mcp generate ./test-spec.json

# Commit
git add .
git commit -m "feat: add my feature"

# Push and create PR
git push origin feature/my-feature
```

---

## 🌟 Examples

### Example 1: Ozon Performance API

**Input**: [swagger/swagger.json](./swagger/swagger.json)
- 39 paths
- 87 schemas
- 6 tags (Campaign, Statistics, Ad, Product, etc.)

**Command**:
```bash
openapi-to-mcp generate ./swagger/swagger.json \
  -o ./examples/ozon-performance \
  -n ozon-performance-api
```

**Output**:
- 39 MCP tools + 1 meta-tool (listMethods)
- 87 TypeScript interfaces
- HTTP client with Bearer auth
- Complete MCP server ready to deploy

**Usage**:
```typescript
// List campaigns
const campaigns = await mcp.listCampaigns({ page: 1, pageSize: 10 });

// Get statistics
const stats = await mcp.getCampaignStatistics({
  campaignId: '12345',
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31',
});

// Update campaign
await mcp.updateCampaign({
  campaignId: '12345',
  body: { dailyBudget: 5000 },
});
```

See [Examples Documentation](./docs/examples.md) for more.

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/my-feature`
3. **Write tests**: Ensure 80%+ coverage
4. **Follow code style**: Run `npm run lint`
5. **Commit with conventional commits**: `feat:`, `fix:`, `docs:`, etc.
6. **Push and create PR**

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.3) - API standard
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification
- [Ozon Performance API](https://performance.ozon.ru/docs/api) - Test case and validation

---

## 📞 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/openapi-to-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/openapi-to-mcp/discussions)

---

## 🗺️ Roadmap

### MVP (v0.1.0) - Current

- [x] OpenAPI 3.0 parser with $ref resolution
- [x] TypeScript type generation from schemas
- [x] MCP tool generation from operations
- [x] HTTP client with Bearer/API key auth
- [x] Tag-based smart filtering
- [x] CLI with generate/validate/init commands
- [x] Documentation (brief, research, architecture, API, examples, testing)

### Post-MVP (v0.2.0)

- [ ] OpenAPI 3.1 support
- [ ] Swagger 2.0 support
- [ ] OAuth2 authentication
- [ ] Server variables support
- [ ] Response formatters (compact, verbose, custom)
- [ ] Plugin system
- [ ] Web UI for generation
- [ ] Generated server caching
- [ ] Rate limiting

### Future (v1.0.0)

- [ ] GraphQL to MCP generator
- [ ] gRPC to MCP generator
- [ ] Live API proxy mode (no generation)
- [ ] AI-powered API discovery
- [ ] Multi-language support (Python, Go, Rust)

---

<div align="center">

**Built with ❤️ for the AI agent ecosystem**

[Documentation](./docs/) • [Examples](./docs/examples.md) • [API Reference](./docs/api-reference.md)

</div>
