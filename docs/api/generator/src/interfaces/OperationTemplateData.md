[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / OperationTemplateData

# Interface: OperationTemplateData

Defined in: [generator/src/types.ts:72](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L72)

Operation template data for MCP tool generation

## Properties

### operationId

> **operationId**: `string`

Defined in: [generator/src/types.ts:73](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L73)

***

### camelName

> **camelName**: `string`

Defined in: [generator/src/types.ts:74](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L74)

***

### pascalName

> **pascalName**: `string`

Defined in: [generator/src/types.ts:75](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L75)

***

### method

> **method**: `string`

Defined in: [generator/src/types.ts:76](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L76)

***

### path

> **path**: `string`

Defined in: [generator/src/types.ts:77](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L77)

***

### summary?

> `optional` **summary**: `string`

Defined in: [generator/src/types.ts:78](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L78)

***

### description?

> `optional` **description**: `string`

Defined in: [generator/src/types.ts:79](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L79)

***

### tags

> **tags**: `string`[]

Defined in: [generator/src/types.ts:80](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L80)

***

### parameters

> **parameters**: [`ParameterTemplateData`](ParameterTemplateData.md)[]

Defined in: [generator/src/types.ts:81](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L81)

***

### requestBody?

> `optional` **requestBody**: [`RequestBodyTemplateData`](RequestBodyTemplateData.md)

Defined in: [generator/src/types.ts:82](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L82)

***

### responses

> **responses**: [`ResponseTemplateData`](ResponseTemplateData.md)[]

Defined in: [generator/src/types.ts:83](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L83)

***

### security?

> `optional` **security**: [`SecurityRequirementTemplateData`](SecurityRequirementTemplateData.md)[]

Defined in: [generator/src/types.ts:84](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L84)

***

### hasParameters

> **hasParameters**: `boolean`

Defined in: [generator/src/types.ts:85](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L85)

***

### hasRequestBody

> **hasRequestBody**: `boolean`

Defined in: [generator/src/types.ts:86](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L86)

***

### hasPathParams

> **hasPathParams**: `boolean`

Defined in: [generator/src/types.ts:87](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L87)

***

### hasQueryParams

> **hasQueryParams**: `boolean`

Defined in: [generator/src/types.ts:88](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L88)

***

### hasHeaderParams

> **hasHeaderParams**: `boolean`

Defined in: [generator/src/types.ts:89](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L89)
