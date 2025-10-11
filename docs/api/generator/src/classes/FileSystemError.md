[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / FileSystemError

# Class: FileSystemError

Defined in: [generator/src/fs-utils.ts:13](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/fs-utils.ts#L13)

Custom error class for file system operations

## Extends

- `Error`

## Constructors

### Constructor

> **new FileSystemError**(`message`, `context?`): `FileSystemError`

Defined in: [generator/src/fs-utils.ts:17](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/fs-utils.ts#L17)

#### Parameters

##### message

`string`

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

`FileSystemError`

#### Overrides

`Error.constructor`

## Properties

### exitCode

> `readonly` **exitCode**: `number`

Defined in: [generator/src/fs-utils.ts:14](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/fs-utils.ts#L14)

***

### context?

> `readonly` `optional` **context**: `Record`\<`string`, `unknown`\>

Defined in: [generator/src/fs-utils.ts:15](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/fs-utils.ts#L15)
