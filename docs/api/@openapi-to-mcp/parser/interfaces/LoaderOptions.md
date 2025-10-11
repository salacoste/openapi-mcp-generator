[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / LoaderOptions

# Interface: LoaderOptions

Defined in: [parser/src/types.ts:16](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/types.ts#L16)

Options for loading OpenAPI documents

## Properties

### validate?

> `optional` **validate**: `boolean`

Defined in: [parser/src/types.ts:21](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/types.ts#L21)

Whether to validate the document structure after loading

#### Default

```ts
false
```

***

### maxFileSize?

> `optional` **maxFileSize**: `number`

Defined in: [parser/src/types.ts:27](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/types.ts#L27)

Maximum file size in bytes to load

#### Default

```ts
10485760 (10MB)
```
