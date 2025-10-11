[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / JSONSchemaProperty

# Interface: JSONSchemaProperty

Defined in: [generator/src/tool-generator.ts:12](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/tool-generator.ts#L12)

JSON Schema property definition

## Properties

### type

> **type**: `string`

Defined in: [generator/src/tool-generator.ts:13](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/tool-generator.ts#L13)

***

### description?

> `optional` **description**: `string`

Defined in: [generator/src/tool-generator.ts:14](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/tool-generator.ts#L14)

***

### format?

> `optional` **format**: `string`

Defined in: [generator/src/tool-generator.ts:15](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/tool-generator.ts#L15)

***

### enum?

> `optional` **enum**: (`string` \| `number` \| `boolean`)[]

Defined in: [generator/src/tool-generator.ts:16](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/tool-generator.ts#L16)

***

### items?

> `optional` **items**: `JSONSchemaProperty`

Defined in: [generator/src/tool-generator.ts:17](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/tool-generator.ts#L17)

***

### properties?

> `optional` **properties**: `Record`\<`string`, `JSONSchemaProperty`\>

Defined in: [generator/src/tool-generator.ts:18](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/tool-generator.ts#L18)

***

### required?

> `optional` **required**: `string`[]

Defined in: [generator/src/tool-generator.ts:19](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/tool-generator.ts#L19)

***

### default?

> `optional` **default**: `unknown`

Defined in: [generator/src/tool-generator.ts:20](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/tool-generator.ts#L20)
