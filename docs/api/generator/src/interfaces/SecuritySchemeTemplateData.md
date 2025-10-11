[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / SecuritySchemeTemplateData

# Interface: SecuritySchemeTemplateData

Defined in: [generator/src/types.ts:134](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L134)

Security scheme template data

## Properties

### name

> **name**: `string`

Defined in: [generator/src/types.ts:135](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L135)

***

### type

> **type**: `"apiKey"` \| `"http"` \| `"oauth2"` \| `"openIdConnect"`

Defined in: [generator/src/types.ts:136](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L136)

***

### scheme?

> `optional` **scheme**: `string`

Defined in: [generator/src/types.ts:137](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L137)

***

### bearerFormat?

> `optional` **bearerFormat**: `string`

Defined in: [generator/src/types.ts:138](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L138)

***

### in?

> `optional` **in**: `"query"` \| `"header"` \| `"cookie"`

Defined in: [generator/src/types.ts:139](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L139)

***

### paramName?

> `optional` **paramName**: `string`

Defined in: [generator/src/types.ts:140](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L140)

***

### flows?

> `optional` **flows**: `Record`\<`string`, `unknown`\>

Defined in: [generator/src/types.ts:141](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L141)
