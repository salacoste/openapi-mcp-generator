[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / PropertySchema

# Interface: PropertySchema

Defined in: [parser/src/schema-types.ts:59](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L59)

Property schema definition

## Properties

### type

> **type**: `string`

Defined in: [parser/src/schema-types.ts:61](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L61)

Property type

***

### description?

> `optional` **description**: `string`

Defined in: [parser/src/schema-types.ts:63](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L63)

Property description

***

### format?

> `optional` **format**: `string`

Defined in: [parser/src/schema-types.ts:65](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L65)

Format hint

***

### enum?

> `optional` **enum**: (`string` \| `number`)[]

Defined in: [parser/src/schema-types.ts:67](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L67)

Enum values

***

### default?

> `optional` **default**: `unknown`

Defined in: [parser/src/schema-types.ts:69](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L69)

Default value

***

### required

> **required**: `boolean`

Defined in: [parser/src/schema-types.ts:71](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L71)

Is this property required?

***

### nullable?

> `optional` **nullable**: `boolean`

Defined in: [parser/src/schema-types.ts:73](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L73)

Can be null?

***

### constraints?

> `optional` **constraints**: [`PropertyConstraints`](PropertyConstraints.md)

Defined in: [parser/src/schema-types.ts:75](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L75)

Property constraints

***

### items?

> `optional` **items**: `PropertySchema`

Defined in: [parser/src/schema-types.ts:77](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-types.ts#L77)

Items schema for array properties
