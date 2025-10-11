[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / ResolutionResult

# Interface: ResolutionResult

Defined in: [parser/src/ref-resolver.ts:17](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/ref-resolver.ts#L17)

Result of reference resolution operation

## Properties

### document

> **document**: `Document`

Defined in: [parser/src/ref-resolver.ts:19](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/ref-resolver.ts#L19)

Fully dereferenced OpenAPI document with all $ref expanded

***

### resolved

> **resolved**: `number`

Defined in: [parser/src/ref-resolver.ts:21](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/ref-resolver.ts#L21)

Number of $ref references found and resolved

***

### errors

> **errors**: [`ResolutionError`](ResolutionError.md)[]

Defined in: [parser/src/ref-resolver.ts:23](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/ref-resolver.ts#L23)

Array of resolution errors (empty if successful)
