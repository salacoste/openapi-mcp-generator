[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / TemplateRenderError

# Class: TemplateRenderError

Defined in: [generator/src/errors.ts:23](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/errors.ts#L23)

Template rendering error

## Extends

- [`GenerationError`](GenerationError.md)

## Constructors

### Constructor

> **new TemplateRenderError**(`message`, `templatePath`, `lineNumber?`, `context?`): `TemplateRenderError`

Defined in: [generator/src/errors.ts:24](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/errors.ts#L24)

#### Parameters

##### message

`string`

##### templatePath

`string`

##### lineNumber?

`number`

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

`TemplateRenderError`

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

Defined in: [generator/src/errors.ts:26](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/errors.ts#L26)

***

### lineNumber?

> `readonly` `optional` **lineNumber**: `number`

Defined in: [generator/src/errors.ts:27](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/errors.ts#L27)
