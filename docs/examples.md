# Examples & Recipes

**Project:** OpenAPI-to-MCP Generator
**Version:** 0.1.0 (MVP)
**Last Updated:** 2025-01-02

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Basic Usage](#2-basic-usage)
3. [Advanced Configuration](#3-advanced-configuration)
4. [Common Recipes](#4-common-recipes)
5. [Integration Examples](#5-integration-examples)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Quick Start

### 1.1 Installation

```bash
# Install globally
npm install -g openapi-to-mcp

# Or use locally in project
npm install --save-dev openapi-to-mcp
```

### 1.2 Generate Your First MCP Server

```bash
# From OpenAPI spec file
openapi-to-mcp generate ./swagger.json -o ./my-mcp-server

# Navigate to output
cd my-mcp-server

# Install dependencies
npm install

# Configure auth
export API_TOKEN="your-token-here"

# Run the server
npm start
```

### 1.3 Use in AI Agent

```typescript
// In your AI agent code (e.g., Claude Desktop config)
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

## 2. Basic Usage

### 2.1 Generate from Local File

```bash
# JSON file
openapi-to-mcp generate ./specs/api-spec.json

# YAML file
openapi-to-mcp generate ./specs/api-spec.yaml

# Custom output directory
openapi-to-mcp generate ./swagger.json -o ./output/my-api
```

### 2.2 Generate from URL

```bash
# Direct URL to OpenAPI spec
openapi-to-mcp generate https://api.example.com/openapi.json

# Save spec first, then generate
curl https://api.example.com/openapi.json > spec.json
openapi-to-mcp generate spec.json
```

### 2.3 Validate Before Generating

```bash
# Validate spec
openapi-to-mcp validate ./swagger.json

# Output example:
# ✓ Valid OpenAPI 3.0.0 specification
# ✓ 39 paths found
# ✓ 87 schemas found
# ⚠ 2 operations without operationId
# ⚠ 1 deprecated operation found

# Generate only if valid
openapi-to-mcp validate ./swagger.json && \
  openapi-to-mcp generate ./swagger.json
```

---

## 3. Advanced Configuration

### 3.1 Filtering by Tags

Generate MCP server with only specific API categories:

```bash
# Include only Campaign and Statistics tools
openapi-to-mcp generate ./swagger.json \
  -f "Campaign,Statistics"

# Result: Only tools tagged with Campaign or Statistics are included
```

**Use Case**: Large APIs (200+ methods) - create focused MCP servers for different AI agents.

**Example**:
```bash
# Marketing agent - only campaign management
openapi-to-mcp generate ./ozon.json -f "Campaign" -o ./mcp-marketing

# Analytics agent - only statistics
openapi-to-mcp generate ./ozon.json -f "Statistics" -o ./mcp-analytics

# Full admin agent - all tools
openapi-to-mcp generate ./ozon.json -o ./mcp-admin
```

---

### 3.2 Authentication Override

When OpenAPI specs are missing `securitySchemes` or have incorrect auth definitions, use auth override:

```bash
# Bearer token (when spec missing auth)
openapi-to-mcp generate ./swagger.json \
  --auth-override "bearer"

# API Key in header
openapi-to-mcp generate ./swagger.json \
  --auth-override "apiKey:header:X-API-Key"

# OAuth2 Client Credentials (common for missing auth specs)
openapi-to-mcp generate ./swagger.json \
  --auth-override "oauth2-client-credentials:https://auth.example.com/token"

# Multi-scheme (both Bearer AND API Key required)
openapi-to-mcp generate ./swagger.json \
  --auth-override "bearer+apiKey:header:X-App-Key"
```

**Real-World Example**: Ozon Performance API
```bash
# Ozon API spec missing securitySchemes, but requires OAuth2
openapi-to-mcp generate ./ozon-swagger.json \
  --output ./ozon-mcp-server \
  --auth-override "oauth2-client-credentials:https://api-seller.ozon.ru/oauth/token"
```

**Complex Auth with JSON Config**:
```bash
# Create auth-config.json
cat > auth-config.json << 'EOF'
{
  "schemes": {
    "OAuth2ClientCredentials": {
      "type": "oauth2",
      "flows": {
        "clientCredentials": {
          "tokenUrl": "https://api-seller.ozon.ru/oauth/token",
          "scopes": {
            "read": "Read access",
            "write": "Write access"
          }
        }
      }
    }
  },
  "security": [{"OAuth2ClientCredentials": ["read", "write"]}]
}
EOF

# Generate with config file
openapi-to-mcp generate ./swagger.json --auth-config ./auth-config.json
```

**See Also**: [Auth Override Examples](../examples/auth-configs/README.md)

---

### 3.3 Custom Package Name

```bash
# Override package name (default: from spec title)
openapi-to-mcp generate ./swagger.json -n my-custom-api

# Generated package.json will have:
# "name": "my-custom-api"
```

---

### 3.4 Programmatic Usage

```typescript
import { OpenAPIParser } from '@openapi-to-mcp/parser';
import {
  TypeGenerator,
  ToolGenerator,
  ClientGenerator,
  ServerGenerator
} from '@openapi-to-mcp/generator';
import fs from 'fs';

async function generateMCPServer() {
  // 1. Load OpenAPI spec
  const spec = JSON.parse(fs.readFileSync('./swagger.json', 'utf-8'));

  // 2. Parse
  const parser = new OpenAPIParser(spec, { strict: true });
  const parsed = await parser.parse();

  // 3. Generate components
  const typeGen = new TypeGenerator({ suffix: 'Type' });
  const types = typeGen.generate(parsed.components.schemas);

  const toolGen = new ToolGenerator({ includeDeprecated: false });
  const tools = toolGen.generate(parsed.paths, parsed.components);

  const clientGen = new ClientGenerator({ timeout: 60000 });
  const client = clientGen.generate(parsed);

  const serverGen = new ServerGenerator();
  const server = serverGen.generate(tools, client, types, {
    name: 'my-api',
    version: '1.0.0',
    baseURL: parsed.servers[0].url,
  });

  // 4. Write files
  fs.mkdirSync('./output', { recursive: true });
  fs.writeFileSync('./output/types.ts', types);
  fs.writeFileSync('./output/client.ts', client);
  fs.writeFileSync('./output/server.ts', server);

  console.log(`✓ Generated ${tools.length} tools`);
}

generateMCPServer();
```

---

## 4. Common Recipes

### 4.1 Ozon Performance API (Real Example)

**Spec**: 39 paths, 87 schemas
**Issue**: OpenAPI spec missing `securitySchemes` but API requires OAuth2 Client Credentials
**Solution**: Use `--auth-override` flag

```bash
# Generate with auth override (spec missing securitySchemes)
openapi-to-mcp generate ./swagger/swagger.json \
  -o ./ozon-performance-mcp \
  -n ozon-performance-api \
  --auth-override "oauth2-client-credentials:https://api-seller.ozon.ru/oauth/token"

cd ozon-performance-mcp
npm install

# Configure OAuth2 credentials
cat > .env << EOF
OZON_CLIENT_ID=your_client_id
OZON_CLIENT_SECRET=your_client_secret
EOF

# Start server
npm start
```

**Generated Auth Code**:
The generator automatically creates OAuth2 token acquisition and refresh logic in `src/http-client.ts` based on the override configuration.

**Usage in AI**:
```typescript
// AI agent can now use tools like:
await mcp.listCampaigns({ page: 1, pageSize: 10 });
await mcp.getCampaignStatistics({ campaignId: '123' });
await mcp.updateCampaignBudget({
  campaignId: '123',
  body: { dailyBudget: 5000 }
});
```

---

### 4.2 GitHub API

```bash
# Download GitHub OpenAPI spec
curl https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json > github-api.json

# Generate MCP server with only repo management
openapi-to-mcp generate github-api.json \
  -f "repos,issues,pulls" \
  -o ./github-mcp \
  -n github-api

# Configure with personal access token
export GITHUB_TOKEN="ghp_xxxxxxxxxxxx"

cd github-mcp
npm install && npm start
```

**Usage**:
```typescript
// List repositories
await mcp.reposListForAuthenticatedUser({ per_page: 10 });

// Create issue
await mcp.issuesCreate({
  owner: 'username',
  repo: 'my-repo',
  body: {
    title: 'Bug report',
    body: 'Description here'
  }
});
```

---

### 4.3 Stripe API

```bash
# Download Stripe OpenAPI spec
curl https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json > stripe-api.json

# Generate payment-focused MCP server
openapi-to-mcp generate stripe-api.json \
  -f "Customers,PaymentIntents,Charges" \
  -o ./stripe-mcp \
  -n stripe-payment-api

# Configure with secret key
export STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxx"

cd stripe-mcp
npm install && npm start
```

**Usage**:
```typescript
// Create customer
await mcp.postCustomers({
  body: {
    email: 'customer@example.com',
    name: 'John Doe'
  }
});

// Create payment intent
await mcp.postPaymentIntents({
  body: {
    amount: 2000,
    currency: 'usd',
    customer: 'cus_xxxxxxxxxxxx'
  }
});
```

---

### 4.4 Internal Company API

```bash
# Generate from internal OpenAPI spec
openapi-to-mcp generate http://internal-api.company.local/openapi.json \
  -o ./company-api-mcp \
  --verbose

# For APIs with API key auth
export API_KEY="your-internal-api-key"

cd company-api-mcp
npm install && npm start
```

---

### 4.5 Multi-Environment Setup

```bash
# Generate once
openapi-to-mcp generate ./api-spec.json -o ./my-api-mcp

cd my-api-mcp

# Create environment configs
cat > .env.development << EOF
BASE_URL=https://dev-api.example.com
API_TOKEN=dev_token_here
EOF

cat > .env.production << EOF
BASE_URL=https://api.example.com
API_TOKEN=prod_token_here
EOF

# Run with specific environment
NODE_ENV=development npm start
NODE_ENV=production npm start
```

---

## 5. Integration Examples

### 5.1 Claude Desktop Integration

**1. Generate MCP server**:
```bash
openapi-to-mcp generate ./swagger.json -o ~/mcp-servers/my-api
cd ~/mcp-servers/my-api
npm install && npm run build
```

**2. Configure Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "my-api": {
      "command": "node",
      "args": [
        "/Users/username/mcp-servers/my-api/dist/server.js"
      ],
      "env": {
        "API_TOKEN": "your-token-here",
        "BASE_URL": "https://api.example.com"
      }
    }
  }
}
```

**3. Restart Claude Desktop**

**4. Verify in Claude**:
```
User: List available methods from my-api

Claude: I'll use the listMethods tool:
- listCampaigns (Category: Campaign)
- getCampaignStats (Category: Statistics)
...
```

---

### 5.2 VS Code Extension Integration

```typescript
// In VS Code extension
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function callMCPTool(toolName: string, input: any) {
  const command = `echo '${JSON.stringify(input)}' | npx my-api-mcp ${toolName}`;
  const { stdout } = await execAsync(command);
  return JSON.parse(stdout);
}

// Usage
const campaigns = await callMCPTool('listCampaigns', { page: 1 });
```

---

### 5.3 Automation Script Integration

```bash
#!/bin/bash
# automation-script.sh

# Initialize MCP server in background
cd ~/mcp-servers/my-api
npm start &
MCP_PID=$!

# Wait for server to start
sleep 2

# Call MCP tools via stdio
echo '{"tool": "listCampaigns", "input": {"page": 1}}' | \
  node dist/server.js

# Cleanup
kill $MCP_PID
```

---

### 5.4 CI/CD Pipeline Integration

```yaml
# .github/workflows/generate-mcp.yml
name: Generate MCP Server

on:
  push:
    paths:
      - 'openapi/spec.json'

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install generator
        run: npm install -g openapi-to-mcp

      - name: Generate MCP server
        run: |
          openapi-to-mcp generate openapi/spec.json -o mcp-server

      - name: Test generated server
        run: |
          cd mcp-server
          npm install
          npm test

      - name: Deploy to artifact registry
        run: |
          cd mcp-server
          npm publish
```

---

## 6. Troubleshooting

### 6.1 Common Issues

#### Issue: "Unsupported OpenAPI version"

```bash
# Error
Error: Unsupported OpenAPI version: 2.0. Only 3.0.x is supported.

# Solution: Convert Swagger 2.0 to OpenAPI 3.0
npm install -g swagger2openapi
swagger2openapi swagger.json -o openapi3.json
openapi-to-mcp generate openapi3.json
```

---

#### Issue: "Circular reference detected"

```bash
# Error
CircularReferenceError: Circular reference detected: #/components/schemas/User

# Solution: Fix OpenAPI spec or use --allow-circular flag (future feature)
# Manually break circular reference in spec
```

---

#### Issue: "No operationId found"

```bash
# Warning
⚠ 5 operations without operationId - using generated names

# Impact: Tool names will be like "getApiClientCampaign" instead of "listCampaigns"

# Solution: Add operationId to operations in spec
{
  "paths": {
    "/api/client/campaign": {
      "get": {
        "operationId": "listCampaigns",  // ← Add this
        ...
      }
    }
  }
}
```

---

#### Issue: "Authentication failed"

```bash
# Error (at runtime)
Error: 401 Unauthorized

# Solution: Check auth configuration
# For Bearer token:
export API_TOKEN="your-valid-token"

# For API key:
export API_KEY="your-valid-key"

# Verify token works with curl:
curl -H "Authorization: Bearer your-token" https://api.example.com/test
```

---

### 6.2 Debugging

#### Enable Verbose Logging

```bash
# During generation
openapi-to-mcp generate ./swagger.json -v

# Output:
# [DEBUG] Parsing OpenAPI spec...
# [DEBUG] Found 39 paths
# [DEBUG] Resolving $ref: #/components/schemas/Campaign
# [DEBUG] Generated tool: listCampaigns
# ...
```

#### Inspect Generated Code

```bash
# Generate and inspect
openapi-to-mcp generate ./swagger.json -o ./output

# Check generated files
ls -la ./output
cat ./output/server.ts | grep "export function"
cat ./output/types.ts | grep "export interface"
```

#### Test Individual Tools

```typescript
// test-tool.ts
import { createServer } from './output/server';

const server = createServer({
  bearerToken: process.env.API_TOKEN,
});

async function test() {
  try {
    const result = await server.listCampaigns({ page: 1, pageSize: 5 });
    console.log('✓ Success:', result);
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

test();
```

---

### 6.3 Performance Optimization

#### Reduce Generated Code Size

```bash
# Exclude deprecated operations
openapi-to-mcp generate ./swagger.json --no-deprecated

# Filter by essential tags only
openapi-to-mcp generate ./swagger.json -f "Core,Essential"
```

#### Cache MCP Server Responses

```typescript
// In generated server config
const server = createServer({
  bearerToken: process.env.API_TOKEN,
  enableCaching: true,        // Enable response caching
  cacheMaxAge: 300,           // Cache for 5 minutes
});
```

---

### 6.4 Getting Help

**Check version**:
```bash
openapi-to-mcp --version
```

**View help**:
```bash
openapi-to-mcp --help
openapi-to-mcp generate --help
```

**Report issues**:
- GitHub: https://github.com/your-org/openapi-to-mcp/issues
- Include: OpenAPI spec (sanitized), error message, generator version

---

## Example Projects

### Full Example: E-Commerce API

**Directory structure**:
```
ecommerce-api/
├── openapi/
│   └── spec.json           # OpenAPI specification
├── mcp-servers/
│   ├── products/           # Product management MCP
│   ├── orders/             # Order management MCP
│   └── customers/          # Customer management MCP
└── scripts/
    └── generate-all.sh     # Generate all MCP servers
```

**generate-all.sh**:
```bash
#!/bin/bash

# Generate product management MCP
openapi-to-mcp generate openapi/spec.json \
  -f "Products,Inventory" \
  -o mcp-servers/products \
  -n ecommerce-products

# Generate order management MCP
openapi-to-mcp generate openapi/spec.json \
  -f "Orders,Shipping" \
  -o mcp-servers/orders \
  -n ecommerce-orders

# Generate customer management MCP
openapi-to-mcp generate openapi/spec.json \
  -f "Customers,Authentication" \
  -o mcp-servers/customers \
  -n ecommerce-customers

# Install dependencies
for dir in mcp-servers/*/; do
  (cd "$dir" && npm install && npm run build)
done

echo "✓ All MCP servers generated and built"
```

---

## Next Steps

- **[API Reference](./api-reference.md)** - Detailed API documentation
- **[Architecture](./architecture.md)** - Understand the system design
- **[Testing Guide](./testing.md)** - Test your generated MCP servers
- **[User Guide](./user-guide.md)** - Complete user documentation
