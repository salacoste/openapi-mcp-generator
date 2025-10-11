[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / ValidationResult

# Interface: ValidationResult

Defined in: [parser/src/validation-types.ts:44](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/validation-types.ts#L44)

Result of OpenAPI schema validation

## Properties

### valid

> **valid**: `boolean`

Defined in: [parser/src/validation-types.ts:48](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/validation-types.ts#L48)

Whether the document is valid

***

### errors

> **errors**: [`ValidationIssue`](ValidationIssue.md)[]

Defined in: [parser/src/validation-types.ts:53](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/validation-types.ts#L53)

Validation errors (severity: error)

***

### warnings

> **warnings**: [`ValidationIssue`](ValidationIssue.md)[]

Defined in: [parser/src/validation-types.ts:58](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/validation-types.ts#L58)

Validation warnings (severity: warning)
