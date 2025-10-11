[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / DataValidationError

# Class: DataValidationError

Defined in: [generator/src/errors.ts:81](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/errors.ts#L81)

Data validation error

## Extends

- [`GenerationError`](GenerationError.md)

## Constructors

### Constructor

> **new DataValidationError**(`message`, `missingFields`, `context?`): `DataValidationError`

Defined in: [generator/src/errors.ts:82](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/errors.ts#L82)

#### Parameters

##### message

`string`

##### missingFields

`string`[]

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

`DataValidationError`

#### Overrides

[`GenerationError`](GenerationError.md).[`constructor`](GenerationError.md#constructor)

## Properties

### code

> `readonly` **code**: `string`

Defined in: [generator/src/errors.ts:11](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/errors.ts#L11)

#### Inherited from

[`GenerationError`](GenerationError.md).[`code`](GenerationError.md#code)

***

### context?

> `readonly` `optional` **context**: `Record`\<`string`, `unknown`\>

Defined in: [generator/src/errors.ts:12](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/errors.ts#L12)

#### Inherited from

[`GenerationError`](GenerationError.md).[`context`](GenerationError.md#context)

***

### missingFields

> `readonly` **missingFields**: `string`[]

Defined in: [generator/src/errors.ts:84](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/errors.ts#L84)
