[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / SecurityExtractionResult

# Interface: SecurityExtractionResult

Defined in: [parser/src/security-extractor.ts:152](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L152)

Complete security extraction result

## Properties

### schemes

> **schemes**: [`SecuritySchemeMap`](SecuritySchemeMap.md)

Defined in: [parser/src/security-extractor.ts:154](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L154)

Classified security schemes

***

### globalRequirements

> **globalRequirements**: [`SecurityRequirement`](SecurityRequirement.md)[]

Defined in: [parser/src/security-extractor.ts:156](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L156)

Global security requirements

***

### operationRequirements

> **operationRequirements**: `Map`\<`string`, [`SecurityRequirement`](SecurityRequirement.md)[]\>

Defined in: [parser/src/security-extractor.ts:158](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L158)

Per-operation security requirements

***

### warnings

> **warnings**: `string`[]

Defined in: [parser/src/security-extractor.ts:160](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L160)

Warnings and notices
