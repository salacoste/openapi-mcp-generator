[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / classifySecurityScheme

# Function: classifySecurityScheme()

> **classifySecurityScheme**(`name`, `scheme`): [`ClassifiedSecurityScheme`](../interfaces/ClassifiedSecurityScheme.md)

Defined in: [parser/src/security-extractor.ts:246](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L246)

Classify a single security scheme by type

## Parameters

### name

`string`

Scheme name from OpenAPI document

### scheme

`RawSecurityScheme`

Raw security scheme object

## Returns

[`ClassifiedSecurityScheme`](../interfaces/ClassifiedSecurityScheme.md)

Classified security scheme with metadata
