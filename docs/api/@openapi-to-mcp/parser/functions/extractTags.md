[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / extractTags

# Function: extractTags()

> **extractTags**(`document`, `operations`): [`TagExtractionResult`](../interfaces/TagExtractionResult.md)

Defined in: [parser/src/tag-extractor.ts:108](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/tag-extractor.ts#L108)

Extract and organize tags from OpenAPI document

## Parameters

### document

`OpenAPIDocument`

Fully resolved OpenAPI document

### operations

[`OperationMetadata`](../interfaces/OperationMetadata.md)[]

Extracted operations metadata

## Returns

[`TagExtractionResult`](../interfaces/TagExtractionResult.md)

Complete tag extraction result
