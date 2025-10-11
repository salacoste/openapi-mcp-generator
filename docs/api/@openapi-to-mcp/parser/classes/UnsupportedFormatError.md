[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / UnsupportedFormatError

# Class: UnsupportedFormatError

Defined in: [parser/src/errors.ts:64](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/errors.ts#L64)

Error thrown when file format is not supported

## Extends

- [`ParserError`](ParserError.md)

## Constructors

### Constructor

> **new UnsupportedFormatError**(`message`, `extension`): `UnsupportedFormatError`

Defined in: [parser/src/errors.ts:70](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/errors.ts#L70)

#### Parameters

##### message

`string`

##### extension

`string`

#### Returns

`UnsupportedFormatError`

#### Overrides

[`ParserError`](ParserError.md).[`constructor`](ParserError.md#constructor)

## Properties

### extension

> `readonly` **extension**: `string`

Defined in: [parser/src/errors.ts:68](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/errors.ts#L68)

The file extension that was not supported
