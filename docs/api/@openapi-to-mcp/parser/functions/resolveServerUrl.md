[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / resolveServerUrl

# Function: resolveServerUrl()

> **resolveServerUrl**(`urlTemplate`, `variables?`): `string`

Defined in: [parser/src/server-extractor.ts:118](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/server-extractor.ts#L118)

Resolve server URL variables with defaults

## Parameters

### urlTemplate

`string`

URL template with variables (e.g., '{protocol}://api.example.com/{version}')

### variables?

[`ServerVariables`](../interfaces/ServerVariables.md)

Variable definitions with defaults

## Returns

`string`

Resolved URL with variables substituted

## Example

```typescript
resolveServerUrl('{protocol}://api.example.com/{version}', {
  protocol: { default: 'https' },
  version: { default: 'v1' }
}) // → 'https://api.example.com/v1'
```
