[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / extractSecuritySchemes

# Function: extractSecuritySchemes()

> **extractSecuritySchemes**(`document`, `operations`): [`SecurityExtractionResult`](../interfaces/SecurityExtractionResult.md)

Defined in: [parser/src/security-extractor.ts:180](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L180)

Extract and classify security schemes from OpenAPI document

## Parameters

### document

`OpenAPIDocument`

Fully resolved OpenAPI document

### operations

[`OperationMetadata`](../interfaces/OperationMetadata.md)[]

Extracted operations metadata

## Returns

[`SecurityExtractionResult`](../interfaces/SecurityExtractionResult.md)

Complete security extraction result
