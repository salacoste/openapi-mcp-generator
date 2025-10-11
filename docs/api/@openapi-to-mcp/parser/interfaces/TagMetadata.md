[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / TagMetadata

# Interface: TagMetadata

Defined in: [parser/src/tag-extractor.ts:11](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/tag-extractor.ts#L11)

Tag metadata for semantic categorization

## Properties

### name

> **name**: `string`

Defined in: [parser/src/tag-extractor.ts:13](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/tag-extractor.ts#L13)

Normalized name (PascalCase)

***

### displayName

> **displayName**: `string`

Defined in: [parser/src/tag-extractor.ts:15](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/tag-extractor.ts#L15)

Original name for display

***

### description

> **description**: `string`

Defined in: [parser/src/tag-extractor.ts:17](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/tag-extractor.ts#L17)

Tag description

***

### externalDocs?

> `optional` **externalDocs**: [`ExternalDocs`](ExternalDocs.md)

Defined in: [parser/src/tag-extractor.ts:19](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/tag-extractor.ts#L19)

External documentation

***

### operationCount

> **operationCount**: `number`

Defined in: [parser/src/tag-extractor.ts:21](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/tag-extractor.ts#L21)

Number of operations in this tag

***

### operationIds

> **operationIds**: `string`[]

Defined in: [parser/src/tag-extractor.ts:23](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/tag-extractor.ts#L23)

Operation IDs belonging to this tag

***

### priority

> **priority**: `number`

Defined in: [parser/src/tag-extractor.ts:25](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/tag-extractor.ts#L25)

Priority for sorting (1=root, 2=operation, 3=generated)

***

### source

> **source**: `"root"` \| `"operation"` \| `"generated"`

Defined in: [parser/src/tag-extractor.ts:27](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/tag-extractor.ts#L27)

Source of the tag

***

### generated

> **generated**: `boolean`

Defined in: [parser/src/tag-extractor.ts:29](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/tag-extractor.ts#L29)

Is tag auto-generated?

***

### complexity?

> `optional` **complexity**: [`TagComplexity`](TagComplexity.md)

Defined in: [parser/src/tag-extractor.ts:31](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/tag-extractor.ts#L31)

Complexity metrics

***

### methodDistribution?

> `optional` **methodDistribution**: [`MethodDistribution`](MethodDistribution.md)

Defined in: [parser/src/tag-extractor.ts:33](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/tag-extractor.ts#L33)

HTTP method distribution
