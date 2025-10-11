[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / HttpBearerMetadata

# Interface: HttpBearerMetadata

Defined in: [parser/src/security-extractor.ts:78](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L78)

HTTP Bearer token metadata

## Example

```ts
{
 *   scheme: 'bearer',
 *   bearerFormat: 'JWT'
 * }
```

## Properties

### scheme

> **scheme**: `"bearer"`

Defined in: [parser/src/security-extractor.ts:80](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L80)

HTTP authentication scheme

***

### bearerFormat?

> `optional` **bearerFormat**: `string`

Defined in: [parser/src/security-extractor.ts:82](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L82)

Format hint for the bearer token (e.g., JWT)
