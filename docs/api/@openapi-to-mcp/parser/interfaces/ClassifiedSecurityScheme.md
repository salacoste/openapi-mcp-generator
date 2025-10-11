[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / ClassifiedSecurityScheme

# Interface: ClassifiedSecurityScheme

Defined in: [parser/src/security-extractor.ts:18](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L18)

Classified security scheme with authentication type and metadata

## Properties

### name

> **name**: `string`

Defined in: [parser/src/security-extractor.ts:20](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L20)

Scheme name from OpenAPI document

***

### type

> **type**: `"apiKey"` \| `"http"` \| `"oauth2"` \| `"openIdConnect"`

Defined in: [parser/src/security-extractor.ts:22](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L22)

OpenAPI security scheme type

***

### classification

> **classification**: [`SecurityClassification`](../type-aliases/SecurityClassification.md)

Defined in: [parser/src/security-extractor.ts:24](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L24)

Detailed classification for code generation

***

### metadata

> **metadata**: [`SecurityMetadata`](../type-aliases/SecurityMetadata.md)

Defined in: [parser/src/security-extractor.ts:26](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L26)

Type-specific metadata

***

### supported

> **supported**: `boolean`

Defined in: [parser/src/security-extractor.ts:28](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L28)

Is this scheme supported for automatic code generation?

***

### warnings?

> `optional` **warnings**: `string`[]

Defined in: [parser/src/security-extractor.ts:30](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L30)

Warnings for manual implementation or limitations
