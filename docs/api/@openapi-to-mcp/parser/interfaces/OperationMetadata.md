[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / OperationMetadata

# Interface: OperationMetadata

Defined in: [parser/src/operation-types.ts:19](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L19)

Operation metadata extracted from OpenAPI document

## Properties

### operationId

> **operationId**: `string`

Defined in: [parser/src/operation-types.ts:21](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L21)

Unique operation identifier

***

### method

> **method**: [`HttpMethod`](../type-aliases/HttpMethod.md)

Defined in: [parser/src/operation-types.ts:23](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L23)

HTTP method

***

### path

> **path**: `string`

Defined in: [parser/src/operation-types.ts:25](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L25)

API path

***

### summary?

> `optional` **summary**: `string`

Defined in: [parser/src/operation-types.ts:27](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L27)

Operation summary

***

### description?

> `optional` **description**: `string`

Defined in: [parser/src/operation-types.ts:29](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L29)

Operation description

***

### tags

> **tags**: `string`[]

Defined in: [parser/src/operation-types.ts:31](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L31)

Operation tags for categorization

***

### pathParameters

> **pathParameters**: [`ParameterMetadata`](ParameterMetadata.md)[]

Defined in: [parser/src/operation-types.ts:33](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L33)

Path parameters

***

### queryParameters

> **queryParameters**: [`ParameterMetadata`](ParameterMetadata.md)[]

Defined in: [parser/src/operation-types.ts:35](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L35)

Query parameters

***

### headerParameters

> **headerParameters**: [`ParameterMetadata`](ParameterMetadata.md)[]

Defined in: [parser/src/operation-types.ts:37](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L37)

Header parameters

***

### requestBody?

> `optional` **requestBody**: [`RequestBodyMetadata`](RequestBodyMetadata.md)

Defined in: [parser/src/operation-types.ts:39](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L39)

Request body metadata

***

### responses

> **responses**: [`ResponseMetadata`](ResponseMetadata.md)[]

Defined in: [parser/src/operation-types.ts:41](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L41)

Response metadata

***

### deprecated

> **deprecated**: `boolean`

Defined in: [parser/src/operation-types.ts:43](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L43)

Is operation deprecated?

***

### security?

> `optional` **security**: `unknown`[]

Defined in: [parser/src/operation-types.ts:45](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L45)

Security requirements (placeholder for Story 2.6)
