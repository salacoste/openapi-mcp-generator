[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / UnsupportedScheme

# Interface: UnsupportedScheme

Defined in: [generator/src/security-analyzer.ts:31](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L31)

Unsupported security scheme with workaround guidance

## Properties

### name

> **name**: `string`

Defined in: [generator/src/security-analyzer.ts:33](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L33)

Scheme name from OpenAPI

***

### type

> **type**: `string`

Defined in: [generator/src/security-analyzer.ts:35](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L35)

Security scheme type

***

### reason

> **reason**: `string`

Defined in: [generator/src/security-analyzer.ts:37](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L37)

Reason why it's unsupported

***

### workaround

> **workaround**: `string`

Defined in: [generator/src/security-analyzer.ts:39](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L39)

Suggested workaround or manual implementation steps
