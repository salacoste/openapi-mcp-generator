[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / ServerExtractionResult

# Interface: ServerExtractionResult

Defined in: [parser/src/server-extractor.ts:57](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/server-extractor.ts#L57)

Complete server extraction result

## Properties

### servers

> **servers**: [`ServerMetadata`](ServerMetadata.md)[]

Defined in: [parser/src/server-extractor.ts:59](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/server-extractor.ts#L59)

All extracted servers

***

### defaultServer

> **defaultServer**: [`ServerMetadata`](ServerMetadata.md)

Defined in: [parser/src/server-extractor.ts:61](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/server-extractor.ts#L61)

Default server (first in array)

***

### hasMultipleServers

> **hasMultipleServers**: `boolean`

Defined in: [parser/src/server-extractor.ts:63](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/server-extractor.ts#L63)

Whether multiple servers are defined

***

### warnings

> **warnings**: `string`[]

Defined in: [parser/src/server-extractor.ts:65](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/server-extractor.ts#L65)

Warnings generated during extraction
