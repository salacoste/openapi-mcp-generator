[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / FileSizeError

# Class: FileSizeError

Defined in: [parser/src/errors.ts:80](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/errors.ts#L80)

Error thrown when file size exceeds maximum allowed

## Extends

- [`ParserError`](ParserError.md)

## Constructors

### Constructor

> **new FileSizeError**(`message`, `actualSize`, `maxSize`): `FileSizeError`

Defined in: [parser/src/errors.ts:91](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/errors.ts#L91)

#### Parameters

##### message

`string`

##### actualSize

`number`

##### maxSize

`number`

#### Returns

`FileSizeError`

#### Overrides

[`ParserError`](ParserError.md).[`constructor`](ParserError.md#constructor)

## Properties

### actualSize

> `readonly` **actualSize**: `number`

Defined in: [parser/src/errors.ts:84](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/errors.ts#L84)

Actual file size in bytes

***

### maxSize

> `readonly` **maxSize**: `number`

Defined in: [parser/src/errors.ts:89](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/errors.ts#L89)

Maximum allowed size in bytes
