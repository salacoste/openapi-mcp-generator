[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / FileSystemError

# Class: FileSystemError

Defined in: [parser/src/errors.ts:20](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/errors.ts#L20)

Error thrown when file system operations fail

## Extends

- [`ParserError`](ParserError.md)

## Constructors

### Constructor

> **new FileSystemError**(`message`, `path`): `FileSystemError`

Defined in: [parser/src/errors.ts:26](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/errors.ts#L26)

#### Parameters

##### message

`string`

##### path

`string`

#### Returns

`FileSystemError`

#### Overrides

[`ParserError`](ParserError.md).[`constructor`](ParserError.md#constructor)

## Properties

### path

> `readonly` **path**: `string`

Defined in: [parser/src/errors.ts:24](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/errors.ts#L24)

The file path that caused the error
