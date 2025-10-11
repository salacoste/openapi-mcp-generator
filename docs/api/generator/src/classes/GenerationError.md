[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / GenerationError

# Class: GenerationError

Defined in: [generator/src/errors.ts:8](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/errors.ts#L8)

Base error class for generation errors

## Extends

- `Error`

## Extended by

- [`TemplateRenderError`](TemplateRenderError.md)
- [`TemplateValidationError`](TemplateValidationError.md)
- [`TemplateNotFoundError`](TemplateNotFoundError.md)
- [`CodeFormattingError`](CodeFormattingError.md)
- [`DataValidationError`](DataValidationError.md)

## Constructors

### Constructor

> **new GenerationError**(`message`, `code`, `context?`): `GenerationError`

Defined in: [generator/src/errors.ts:9](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/errors.ts#L9)

#### Parameters

##### message

`string`

##### code

`string`

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

`GenerationError`

#### Overrides

`Error.constructor`

## Properties

### code

> `readonly` **code**: `string`

Defined in: [generator/src/errors.ts:11](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/errors.ts#L11)

***

### context?

> `readonly` `optional` **context**: `Record`\<`string`, `unknown`\>

Defined in: [generator/src/errors.ts:12](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/errors.ts#L12)
