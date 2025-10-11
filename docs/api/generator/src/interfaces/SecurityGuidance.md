[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / SecurityGuidance

# Interface: SecurityGuidance

Defined in: [generator/src/security-analyzer.ts:57](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L57)

Complete security guidance for users

## Properties

### required

> **required**: `string`[]

Defined in: [generator/src/security-analyzer.ts:59](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L59)

Required authentication schemes

***

### optional

> **optional**: `string`[]

Defined in: [generator/src/security-analyzer.ts:61](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L61)

Optional authentication schemes

***

### unsupported

> **unsupported**: [`UnsupportedScheme`](UnsupportedScheme.md)[]

Defined in: [generator/src/security-analyzer.ts:63](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L63)

Unsupported schemes with workarounds

***

### envVars

> **envVars**: [`EnvVarConfig`](EnvVarConfig.md)[]

Defined in: [generator/src/security-analyzer.ts:65](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L65)

Environment variables to configure

***

### docLinks

> **docLinks**: [`DocumentationLink`](DocumentationLink.md)[]

Defined in: [generator/src/security-analyzer.ts:67](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L67)

Documentation links for obtaining credentials

***

### hasMultipleSchemes

> **hasMultipleSchemes**: `boolean`

Defined in: [generator/src/security-analyzer.ts:69](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L69)

Has multiple security schemes (multi-auth)

***

### usesAndLogic

> **usesAndLogic**: `boolean`

Defined in: [generator/src/security-analyzer.ts:71](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L71)

Uses AND logic (multiple schemes required)

***

### usesOrLogic

> **usesOrLogic**: `boolean`

Defined in: [generator/src/security-analyzer.ts:73](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L73)

Uses OR logic (alternative schemes)

***

### warnings

> **warnings**: `string`[]

Defined in: [generator/src/security-analyzer.ts:75](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L75)

General warnings or notices
