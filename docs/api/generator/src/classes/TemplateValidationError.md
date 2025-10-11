[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / TemplateValidationError

# Class: TemplateValidationError

Defined in: [generator/src/errors.ts:42](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/errors.ts#L42)

Template validation error

## Extends

- [`GenerationError`](GenerationError.md)

## Constructors

### Constructor

> **new TemplateValidationError**(`message`, `templatePath`, `context?`): `TemplateValidationError`

Defined in: [generator/src/errors.ts:43](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/errors.ts#L43)

#### Parameters

##### message

`string`

##### templatePath

`string`

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

`TemplateValidationError`

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

### templatePath

> `readonly` **templatePath**: `string`

Defined in: [generator/src/errors.ts:45](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/errors.ts#L45)
