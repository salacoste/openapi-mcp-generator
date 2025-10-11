[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / createCheck

# Function: createCheck()

> **createCheck**(`name`, `category`, `status`, `message?`, `details?`): [`ValidationCheck`](../interfaces/ValidationCheck.md)

Defined in: [generator/src/validation-reporter.ts:262](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L262)

Helper function to create a validation check

## Parameters

### name

`string`

### category

`"compilation"` | `"linting"` | `"testing"` | `"performance"` | `"quality"`

### status

`"pass"` | `"fail"` | `"skip"` | `"warn"`

### message?

`string`

### details?

`unknown`

## Returns

[`ValidationCheck`](../interfaces/ValidationCheck.md)
