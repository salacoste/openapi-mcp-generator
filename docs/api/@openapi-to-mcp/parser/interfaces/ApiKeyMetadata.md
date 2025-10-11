[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / ApiKeyMetadata

# Interface: ApiKeyMetadata

Defined in: [parser/src/security-extractor.ts:63](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L63)

API Key authentication metadata

## Example

```ts
{
 *   name: 'X-API-Key',
 *   in: 'header'
 * }
```

## Properties

### name

> **name**: `string`

Defined in: [parser/src/security-extractor.ts:65](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L65)

Parameter name for the API key

***

### in

> **in**: `"query"` \| `"header"` \| `"cookie"`

Defined in: [parser/src/security-extractor.ts:67](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L67)

Where the API key should be sent
