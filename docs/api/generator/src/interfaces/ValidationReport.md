[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / ValidationReport

# Interface: ValidationReport

Defined in: [generator/src/validation-reporter.ts:47](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L47)

Complete validation report

## Properties

### timestamp

> **timestamp**: `string`

Defined in: [generator/src/validation-reporter.ts:49](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L49)

Report timestamp

***

### version

> **version**: `string`

Defined in: [generator/src/validation-reporter.ts:51](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L51)

Report version

***

### project

> **project**: `object`

Defined in: [generator/src/validation-reporter.ts:53](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L53)

Project information

#### name

> **name**: `string`

#### version

> **version**: `string`

***

### checks

> **checks**: [`ValidationCheck`](ValidationCheck.md)[]

Defined in: [generator/src/validation-reporter.ts:58](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L58)

Validation checks

***

### tests

> **tests**: [`TestStats`](TestStats.md)

Defined in: [generator/src/validation-reporter.ts:60](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L60)

Test statistics

***

### performance

> **performance**: [`PerformanceMetrics`](PerformanceMetrics.md)

Defined in: [generator/src/validation-reporter.ts:62](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L62)

Performance metrics

***

### status

> **status**: `"pass"` \| `"fail"` \| `"warn"`

Defined in: [generator/src/validation-reporter.ts:64](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L64)

Overall status

***

### summary

> **summary**: `string`

Defined in: [generator/src/validation-reporter.ts:66](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L66)

Summary message
