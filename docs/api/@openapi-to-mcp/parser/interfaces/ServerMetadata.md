[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / ServerMetadata

# Interface: ServerMetadata

Defined in: [parser/src/server-extractor.ts:35](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/server-extractor.ts#L35)

Server metadata for HTTP client configuration

## Properties

### url

> **url**: `string`

Defined in: [parser/src/server-extractor.ts:37](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/server-extractor.ts#L37)

Original URL template from OpenAPI spec

***

### description?

> `optional` **description**: `string`

Defined in: [parser/src/server-extractor.ts:39](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/server-extractor.ts#L39)

Server description

***

### variables?

> `optional` **variables**: [`ServerVariables`](ServerVariables.md)

Defined in: [parser/src/server-extractor.ts:41](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/server-extractor.ts#L41)

Server variables for URL template substitution

***

### basePath

> **basePath**: `string`

Defined in: [parser/src/server-extractor.ts:43](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/server-extractor.ts#L43)

Extracted path component (normalized)

***

### baseURL

> **baseURL**: `string`

Defined in: [parser/src/server-extractor.ts:45](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/server-extractor.ts#L45)

Concrete URL with defaults applied

***

### environment

> **environment**: [`ServerEnvironment`](../type-aliases/ServerEnvironment.md)

Defined in: [parser/src/server-extractor.ts:47](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/server-extractor.ts#L47)

Inferred server environment type

***

### priority

> **priority**: `number`

Defined in: [parser/src/server-extractor.ts:49](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/server-extractor.ts#L49)

Priority (0 = default/first server)

***

### envVarSuggestions?

> `optional` **envVarSuggestions**: `Record`\<`string`, `string`\>

Defined in: [parser/src/server-extractor.ts:51](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/server-extractor.ts#L51)

Environment variable name suggestions for variables
