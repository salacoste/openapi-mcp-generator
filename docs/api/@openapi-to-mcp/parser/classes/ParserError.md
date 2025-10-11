[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / ParserError

# Class: ParserError

Defined in: [parser/src/errors.ts:9](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/errors.ts#L9)

Base error class for all parser errors

## Extends

- `Error`

## Extended by

- [`FileSystemError`](FileSystemError.md)
- [`ParseError`](ParseError.md)
- [`UnsupportedFormatError`](UnsupportedFormatError.md)
- [`FileSizeError`](FileSizeError.md)

## Constructors

### Constructor

> **new ParserError**(`message`): `ParserError`

Defined in: [parser/src/errors.ts:10](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/errors.ts#L10)

#### Parameters

##### message

`string`

#### Returns

`ParserError`

#### Overrides

`Error.constructor`
