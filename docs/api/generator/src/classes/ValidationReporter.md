[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / ValidationReporter

# Class: ValidationReporter

Defined in: [generator/src/validation-reporter.ts:72](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L72)

Validation reporter class

## Constructors

### Constructor

> **new ValidationReporter**(`projectName`, `projectVersion`): `ValidationReporter`

Defined in: [generator/src/validation-reporter.ts:78](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L78)

#### Parameters

##### projectName

`string` = `'MCP Server Generator'`

##### projectVersion

`string` = `'1.0.0'`

#### Returns

`ValidationReporter`

## Methods

### addCheck()

> **addCheck**(`check`): `void`

Defined in: [generator/src/validation-reporter.ts:87](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L87)

Add a validation check result

#### Parameters

##### check

[`ValidationCheck`](../interfaces/ValidationCheck.md)

#### Returns

`void`

***

### addChecks()

> **addChecks**(`checks`): `void`

Defined in: [generator/src/validation-reporter.ts:94](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L94)

Add multiple validation checks

#### Parameters

##### checks

[`ValidationCheck`](../interfaces/ValidationCheck.md)[]

#### Returns

`void`

***

### generateReport()

> **generateReport**(`testStats`, `performanceMetrics`): [`ValidationReport`](../interfaces/ValidationReport.md)

Defined in: [generator/src/validation-reporter.ts:101](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L101)

Generate the validation report

#### Parameters

##### testStats

[`TestStats`](../interfaces/TestStats.md)

##### performanceMetrics

[`PerformanceMetrics`](../interfaces/PerformanceMetrics.md)

#### Returns

[`ValidationReport`](../interfaces/ValidationReport.md)

***

### saveReport()

> **saveReport**(`report`, `outputPath`): `Promise`\<`void`\>

Defined in: [generator/src/validation-reporter.ts:138](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L138)

Save report to JSON file

#### Parameters

##### report

[`ValidationReport`](../interfaces/ValidationReport.md)

##### outputPath

`string` = `'test-results/validation-report.json'`

#### Returns

`Promise`\<`void`\>

***

### generateHumanReadableSummary()

> **generateHumanReadableSummary**(`report`): `string`

Defined in: [generator/src/validation-reporter.ts:157](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L157)

Generate human-readable summary

#### Parameters

##### report

[`ValidationReport`](../interfaces/ValidationReport.md)

#### Returns

`string`

***

### saveSummary()

> **saveSummary**(`report`, `outputPath`): `Promise`\<`void`\>

Defined in: [generator/src/validation-reporter.ts:242](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/validation-reporter.ts#L242)

Save human-readable summary to file

#### Parameters

##### report

[`ValidationReport`](../interfaces/ValidationReport.md)

##### outputPath

`string` = `'test-results/validation-summary.txt'`

#### Returns

`Promise`\<`void`\>
