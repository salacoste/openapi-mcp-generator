[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / ParameterMetadata

# Interface: ParameterMetadata

Defined in: [parser/src/operation-types.ts:51](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L51)

Parameter metadata

## Properties

### name

> **name**: `string`

Defined in: [parser/src/operation-types.ts:53](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L53)

Parameter name

***

### in

> **in**: [`ParameterLocation`](../type-aliases/ParameterLocation.md)

Defined in: [parser/src/operation-types.ts:55](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L55)

Parameter location

***

### required

> **required**: `boolean`

Defined in: [parser/src/operation-types.ts:57](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L57)

Is parameter required?

***

### description?

> `optional` **description**: `string`

Defined in: [parser/src/operation-types.ts:59](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L59)

Parameter description

***

### schema?

> `optional` **schema**: `object`

Defined in: [parser/src/operation-types.ts:61](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L61)

Parameter schema/type

#### type

> **type**: `string`

#### format?

> `optional` **format**: `string`

#### enum?

> `optional` **enum**: (`string` \| `number`)[]

#### default?

> `optional` **default**: `unknown`

***

### style?

> `optional` **style**: `string`

Defined in: [parser/src/operation-types.ts:68](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L68)

Style for array parameters

***

### explode?

> `optional` **explode**: `boolean`

Defined in: [parser/src/operation-types.ts:70](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-types.ts#L70)

Explode flag for array parameters
