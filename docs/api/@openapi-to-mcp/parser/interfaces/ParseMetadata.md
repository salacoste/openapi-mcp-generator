[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / ParseMetadata

# Interface: ParseMetadata

Defined in: [parser/src/index.ts:152](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/index.ts#L152)

Parser execution metadata and performance metrics

## Properties

### apiName

> **apiName**: `string`

Defined in: [parser/src/index.ts:154](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/index.ts#L154)

API name from document

***

### apiVersion

> **apiVersion**: `string`

Defined in: [parser/src/index.ts:156](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/index.ts#L156)

API version from document

***

### parseTime

> **parseTime**: `number`

Defined in: [parser/src/index.ts:158](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/index.ts#L158)

Total parse time in milliseconds

***

### schemaCount

> **schemaCount**: `number`

Defined in: [parser/src/index.ts:160](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/index.ts#L160)

Number of schemas extracted

***

### operationCount

> **operationCount**: `number`

Defined in: [parser/src/index.ts:162](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/index.ts#L162)

Number of operations extracted

***

### tagCount

> **tagCount**: `number`

Defined in: [parser/src/index.ts:164](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/index.ts#L164)

Number of tags extracted

***

### serverCount

> **serverCount**: `number`

Defined in: [parser/src/index.ts:166](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/index.ts#L166)

Number of servers extracted
