[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / CodeFormattingError

# Class: CodeFormattingError

Defined in: [generator/src/errors.ts:71](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/errors.ts#L71)

Code formatting error

## Extends

- [`GenerationError`](GenerationError.md)

## Constructors

### Constructor

> **new CodeFormattingError**(`message`, `context?`): `CodeFormattingError`

Defined in: [generator/src/errors.ts:72](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/errors.ts#L72)

#### Parameters

##### message

`string`

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

`CodeFormattingError`

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
