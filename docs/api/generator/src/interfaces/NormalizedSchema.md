[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / NormalizedSchema

# Interface: NormalizedSchema

Defined in: [generator/src/interface-generator.ts:55](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/interface-generator.ts#L55)

Normalized schema from parser

## Properties

### name

> **name**: `string`

Defined in: [generator/src/interface-generator.ts:56](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/interface-generator.ts#L56)

***

### type

> **type**: `string`

Defined in: [generator/src/interface-generator.ts:57](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/interface-generator.ts#L57)

***

### description?

> `optional` **description**: `string`

Defined in: [generator/src/interface-generator.ts:58](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/interface-generator.ts#L58)

***

### properties?

> `optional` **properties**: `Record`\<`string`, `NormalizedSchema`\>

Defined in: [generator/src/interface-generator.ts:59](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/interface-generator.ts#L59)

***

### required?

> `optional` **required**: `string`[]

Defined in: [generator/src/interface-generator.ts:60](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/interface-generator.ts#L60)

***

### nullable?

> `optional` **nullable**: `boolean`

Defined in: [generator/src/interface-generator.ts:61](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/interface-generator.ts#L61)

***

### enum?

> `optional` **enum**: (`string` \| `number`)[]

Defined in: [generator/src/interface-generator.ts:62](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/interface-generator.ts#L62)

***

### items?

> `optional` **items**: `NormalizedSchema`

Defined in: [generator/src/interface-generator.ts:63](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/interface-generator.ts#L63)

***

### format?

> `optional` **format**: `string`

Defined in: [generator/src/interface-generator.ts:64](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/interface-generator.ts#L64)

***

### example?

> `optional` **example**: `unknown`

Defined in: [generator/src/interface-generator.ts:65](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/interface-generator.ts#L65)

***

### allOf?

> `optional` **allOf**: `NormalizedSchema`[]

Defined in: [generator/src/interface-generator.ts:66](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/interface-generator.ts#L66)

***

### oneOf?

> `optional` **oneOf**: `NormalizedSchema`[]

Defined in: [generator/src/interface-generator.ts:67](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/interface-generator.ts#L67)

***

### anyOf?

> `optional` **anyOf**: `NormalizedSchema`[]

Defined in: [generator/src/interface-generator.ts:68](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/interface-generator.ts#L68)

***

### discriminator?

> `optional` **discriminator**: `object`

Defined in: [generator/src/interface-generator.ts:69](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/interface-generator.ts#L69)

#### propertyName

> **propertyName**: `string`

#### mapping?

> `optional` **mapping**: `Record`\<`string`, `string`\>

***

### minItems?

> `optional` **minItems**: `number`

Defined in: [generator/src/interface-generator.ts:73](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/interface-generator.ts#L73)

***

### maxItems?

> `optional` **maxItems**: `number`

Defined in: [generator/src/interface-generator.ts:74](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/interface-generator.ts#L74)

***

### $ref?

> `optional` **$ref**: `string`

Defined in: [generator/src/interface-generator.ts:75](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/interface-generator.ts#L75)
