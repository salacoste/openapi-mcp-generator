[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / ValidationIssue

# Interface: ValidationIssue

Defined in: [parser/src/validation-types.ts:14](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/validation-types.ts#L14)

Validation issue (error or warning)

## Properties

### path

> **path**: `string`

Defined in: [parser/src/validation-types.ts:18](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/validation-types.ts#L18)

JSON path to the field with the issue (e.g., 'paths./users.get.responses')

***

### message

> **message**: `string`

Defined in: [parser/src/validation-types.ts:23](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/validation-types.ts#L23)

Human-readable error message

***

### severity

> **severity**: [`ValidationSeverity`](../type-aliases/ValidationSeverity.md)

Defined in: [parser/src/validation-types.ts:28](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/validation-types.ts#L28)

Issue severity

***

### expected?

> `optional` **expected**: `string`

Defined in: [parser/src/validation-types.ts:33](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/validation-types.ts#L33)

Expected value or type (if applicable)

***

### actual?

> `optional` **actual**: `string`

Defined in: [parser/src/validation-types.ts:38](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/validation-types.ts#L38)

Actual value or type that caused the error
