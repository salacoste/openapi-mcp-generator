[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / NormalizedSchema

# Interface: NormalizedSchema

Defined in: [parser/src/schema-types.ts:22](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L22)

Normalized schema object ready for code generation

## Properties

### name

> **name**: `string`

Defined in: [parser/src/schema-types.ts:24](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L24)

Unique schema name

***

### type

> **type**: [`SchemaType`](../type-aliases/SchemaType.md)

Defined in: [parser/src/schema-types.ts:26](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L26)

Schema type

***

### properties?

> `optional` **properties**: `Record`\<`string`, [`PropertySchema`](PropertySchema.md)\>

Defined in: [parser/src/schema-types.ts:28](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L28)

Object properties (for type: 'object')

***

### required?

> `optional` **required**: `string`[]

Defined in: [parser/src/schema-types.ts:30](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L30)

Required property names

***

### items?

> `optional` **items**: `NormalizedSchema`

Defined in: [parser/src/schema-types.ts:32](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L32)

Array items schema (for type: 'array')

***

### enum?

> `optional` **enum**: (`string` \| `number`)[]

Defined in: [parser/src/schema-types.ts:34](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L34)

Enum values (for enum types)

***

### description?

> `optional` **description**: `string`

Defined in: [parser/src/schema-types.ts:36](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L36)

Schema description

***

### example?

> `optional` **example**: `unknown`

Defined in: [parser/src/schema-types.ts:38](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L38)

Example value

***

### format?

> `optional` **format**: `string`

Defined in: [parser/src/schema-types.ts:40](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L40)

Format hint (date-time, email, uuid, etc.)

***

### constraints?

> `optional` **constraints**: [`SchemaConstraints`](SchemaConstraints.md)

Defined in: [parser/src/schema-types.ts:42](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L42)

Schema-level constraints

***

### composition?

> `optional` **composition**: [`CompositionMetadata`](CompositionMetadata.md)

Defined in: [parser/src/schema-types.ts:44](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L44)

Composition metadata (allOf, oneOf, anyOf)

***

### metadata?

> `optional` **metadata**: `object`

Defined in: [parser/src/schema-types.ts:46](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L46)

Additional metadata

#### originalName?

> `optional` **originalName**: `string`

Original name from OpenAPI

#### location?

> `optional` **location**: `string`

Where schema was extracted from

#### parent?

> `optional` **parent**: `string`

Parent schema name (for nested schemas)
