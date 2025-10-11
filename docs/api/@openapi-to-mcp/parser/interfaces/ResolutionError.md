[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / ResolutionError

# Interface: ResolutionError

Defined in: [parser/src/ref-resolver.ts:29](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/ref-resolver.ts#L29)

Error that occurred during reference resolution

## Properties

### reference

> **reference**: `string`

Defined in: [parser/src/ref-resolver.ts:31](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/ref-resolver.ts#L31)

The $ref value that failed (e.g., "#/components/schemas/User")

***

### path

> **path**: `string`

Defined in: [parser/src/ref-resolver.ts:33](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/ref-resolver.ts#L33)

Location in document where ref was used

***

### message

> **message**: `string`

Defined in: [parser/src/ref-resolver.ts:35](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/ref-resolver.ts#L35)

Human-readable error message

***

### type

> **type**: `"missing"` \| `"circular"` \| `"external"` \| `"invalid"`

Defined in: [parser/src/ref-resolver.ts:37](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/ref-resolver.ts#L37)

Type of resolution error
