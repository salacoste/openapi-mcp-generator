[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / ToolGenerationOptions

# Interface: ToolGenerationOptions

Defined in: [generator/src/tool-generator.ts:48](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/tool-generator.ts#L48)

Tool generation options

## Properties

### maxDescriptionLength?

> `optional` **maxDescriptionLength**: `number`

Defined in: [generator/src/tool-generator.ts:50](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/tool-generator.ts#L50)

Maximum description length (default: 300)

***

### includeTags?

> `optional` **includeTags**: `boolean`

Defined in: [generator/src/tool-generator.ts:52](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/tool-generator.ts#L52)

Include tag grouping (default: true)

***

### includeSecurity?

> `optional` **includeSecurity**: `boolean`

Defined in: [generator/src/tool-generator.ts:54](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/tool-generator.ts#L54)

Include security documentation (default: true)

***

### handleCollisions?

> `optional` **handleCollisions**: `boolean`

Defined in: [generator/src/tool-generator.ts:56](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/tool-generator.ts#L56)

Handle name collisions with numbering (default: true)

***

### generateExecuteCode?

> `optional` **generateExecuteCode**: `boolean`

Defined in: [generator/src/tool-generator.ts:58](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/tool-generator.ts#L58)

Generate execute function code (default: true)
