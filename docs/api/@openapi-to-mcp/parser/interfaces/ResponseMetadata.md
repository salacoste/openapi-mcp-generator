[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / ResponseMetadata

# Interface: ResponseMetadata

Defined in: [parser/src/operation-types.ts:90](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L90)

Response metadata

## Properties

### statusCode

> **statusCode**: `string`

Defined in: [parser/src/operation-types.ts:92](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L92)

HTTP status code or 'default'

***

### description

> **description**: `string`

Defined in: [parser/src/operation-types.ts:94](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L94)

Response description

***

### mediaType?

> `optional` **mediaType**: `string`

Defined in: [parser/src/operation-types.ts:96](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L96)

Media type (e.g., application/json)

***

### schemaName?

> `optional` **schemaName**: `string`

Defined in: [parser/src/operation-types.ts:98](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L98)

Schema name reference
