[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / EnvVarConfig

# Interface: EnvVarConfig

Defined in: [generator/src/security-analyzer.ts:15](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L15)

Environment variable configuration for authentication

## Properties

### name

> **name**: `string`

Defined in: [generator/src/security-analyzer.ts:17](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L17)

Environment variable name

***

### description

> **description**: `string`

Defined in: [generator/src/security-analyzer.ts:19](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L19)

Human-readable description

***

### example

> **example**: `string`

Defined in: [generator/src/security-analyzer.ts:21](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L21)

Example value (fake credential)

***

### required

> **required**: `boolean`

Defined in: [generator/src/security-analyzer.ts:23](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L23)

Is this variable required for the API to work?

***

### setupHint?

> `optional` **setupHint**: `string`

Defined in: [generator/src/security-analyzer.ts:25](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L25)

Additional setup instructions
