[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / RequestBodyMetadata

# Interface: RequestBodyMetadata

Defined in: [parser/src/operation-types.ts:76](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L76)

Request body metadata

## Properties

### required

> **required**: `boolean`

Defined in: [parser/src/operation-types.ts:78](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L78)

Is request body required?

***

### description?

> `optional` **description**: `string`

Defined in: [parser/src/operation-types.ts:80](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L80)

Request body description

***

### mediaType

> **mediaType**: `string`

Defined in: [parser/src/operation-types.ts:82](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L82)

Media type (e.g., application/json)

***

### schemaName?

> `optional` **schemaName**: `string`

Defined in: [parser/src/operation-types.ts:84](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L84)

Schema name reference
