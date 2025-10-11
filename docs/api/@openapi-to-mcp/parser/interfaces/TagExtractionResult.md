[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / TagExtractionResult

# Interface: TagExtractionResult

Defined in: [parser/src/tag-extractor.ts:76](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/tag-extractor.ts#L76)

Complete tag extraction result

## Properties

### tags

> **tags**: [`TagMetadata`](TagMetadata.md)[]

Defined in: [parser/src/tag-extractor.ts:78](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/tag-extractor.ts#L78)

Array of tag metadata

***

### tagMap

> **tagMap**: `Map`\<`string`, [`TagMetadata`](TagMetadata.md)\>

Defined in: [parser/src/tag-extractor.ts:80](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/tag-extractor.ts#L80)

Map from normalized name to metadata

***

### operationTagMap

> **operationTagMap**: `Map`\<`string`, `string`[]\>

Defined in: [parser/src/tag-extractor.ts:82](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/tag-extractor.ts#L82)

Map from operation ID to tag names

***

### warnings

> **warnings**: `string`[]

Defined in: [parser/src/tag-extractor.ts:84](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/tag-extractor.ts#L84)

Warnings and notices
