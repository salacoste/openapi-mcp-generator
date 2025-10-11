[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / CompositionMetadata

# Interface: CompositionMetadata

Defined in: [parser/src/schema-types.ts:83](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L83)

Composition metadata for allOf/oneOf/anyOf

## Properties

### type

> **type**: `"allOf"` \| `"oneOf"` \| `"anyOf"`

Defined in: [parser/src/schema-types.ts:85](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L85)

Composition type

***

### schemas

> **schemas**: `string`[]

Defined in: [parser/src/schema-types.ts:87](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L87)

Schema names that are composed

***

### discriminator?

> `optional` **discriminator**: [`DiscriminatorInfo`](DiscriminatorInfo.md)

Defined in: [parser/src/schema-types.ts:89](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L89)

Discriminator information (for oneOf/anyOf)

***

### merged

> **merged**: `boolean`

Defined in: [parser/src/schema-types.ts:91](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L91)

Was composition merged (allOf) or preserved (oneOf/anyOf)?
