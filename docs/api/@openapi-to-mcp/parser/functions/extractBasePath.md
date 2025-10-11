[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / extractBasePath

# Function: extractBasePath()

> **extractBasePath**(`url`): `string`

Defined in: [parser/src/server-extractor.ts:81](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/server-extractor.ts#L81)

Extract base path from server URL

## Parameters

### url

`string`

Server URL to extract base path from

## Returns

`string`

Normalized base path (e.g., '/v1', '/')

## Example

```typescript
extractBasePath('https://api.example.com/v1') // → '/v1'
extractBasePath('https://api.example.com/v1/') // → '/v1'
extractBasePath('https://api.example.com') // → '/'
```
