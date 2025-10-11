[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / ValidationCheck

# Interface: ValidationCheck

Defined in: [generator/src/validation-reporter.ts:14](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L14)

Validation result for a single check

## Properties

### name

> **name**: `string`

Defined in: [generator/src/validation-reporter.ts:15](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L15)

***

### category

> **category**: `"compilation"` \| `"linting"` \| `"testing"` \| `"performance"` \| `"quality"`

Defined in: [generator/src/validation-reporter.ts:16](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L16)

***

### status

> **status**: `"pass"` \| `"fail"` \| `"skip"` \| `"warn"`

Defined in: [generator/src/validation-reporter.ts:17](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L17)

***

### message?

> `optional` **message**: `string`

Defined in: [generator/src/validation-reporter.ts:18](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L18)

***

### details?

> `optional` **details**: `unknown`

Defined in: [generator/src/validation-reporter.ts:19](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L19)

***

### duration?

> `optional` **duration**: `number`

Defined in: [generator/src/validation-reporter.ts:20](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L20)
