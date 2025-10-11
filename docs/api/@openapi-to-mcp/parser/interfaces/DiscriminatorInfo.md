[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / DiscriminatorInfo

# Interface: DiscriminatorInfo

Defined in: [parser/src/schema-types.ts:97](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L97)

Discriminator information for union types

## Properties

### propertyName

> **propertyName**: `string`

Defined in: [parser/src/schema-types.ts:99](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L99)

Property that discriminates between options

***

### mapping?

> `optional` **mapping**: `Record`\<`string`, `string`\>

Defined in: [parser/src/schema-types.ts:101](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L101)

Value to schema name mapping
