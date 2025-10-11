[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / LoaderResult

# Interface: LoaderResult

Defined in: [parser/src/types.ts:33](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/types.ts#L33)

Result of loading an OpenAPI document

## Properties

### document

> **document**: [`OpenAPIObject`](../type-aliases/OpenAPIObject.md)

Defined in: [parser/src/types.ts:37](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/types.ts#L37)

Parsed OpenAPI document

***

### filePath

> **filePath**: `string`

Defined in: [parser/src/types.ts:42](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/types.ts#L42)

Original file path

***

### format

> **format**: `"json"` \| `"yaml"`

Defined in: [parser/src/types.ts:47](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/types.ts#L47)

Detected format (json or yaml)

***

### size

> **size**: `number`

Defined in: [parser/src/types.ts:52](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/types.ts#L52)

File size in bytes
