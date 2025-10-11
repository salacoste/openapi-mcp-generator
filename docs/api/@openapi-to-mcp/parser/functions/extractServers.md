[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / extractServers

# Function: extractServers()

> **extractServers**(`document`): [`ServerExtractionResult`](../interfaces/ServerExtractionResult.md)

Defined in: [parser/src/server-extractor.ts:268](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/server-extractor.ts#L268)

Extract and configure servers from OpenAPI document

## Parameters

### document

`Document`

Fully resolved OpenAPI document

## Returns

[`ServerExtractionResult`](../interfaces/ServerExtractionResult.md)

Server extraction result with metadata and warnings

## Example

```typescript
const result = extractServers(document);
console.log(`Extracted ${result.servers.length} servers`);
console.log(`Default: ${result.defaultServer.baseURL}`);
```
