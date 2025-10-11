[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / ParseError

# Class: ParseError

Defined in: [parser/src/errors.ts:36](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/errors.ts#L36)

Error thrown when parsing fails (JSON or YAML)

## Extends

- [`ParserError`](ParserError.md)

## Constructors

### Constructor

> **new ParseError**(`message`, `options?`): `ParseError`

Defined in: [parser/src/errors.ts:52](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/errors.ts#L52)

#### Parameters

##### message

`string`

##### options?

###### line?

`number`

###### column?

`number`

###### path?

`string`

#### Returns

`ParseError`

#### Overrides

[`ParserError`](ParserError.md).[`constructor`](ParserError.md#constructor)

## Properties

### line?

> `readonly` `optional` **line**: `number`

Defined in: [parser/src/errors.ts:40](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/errors.ts#L40)

Line number where error occurred (if available)

***

### column?

> `readonly` `optional` **column**: `number`

Defined in: [parser/src/errors.ts:45](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/errors.ts#L45)

Column number where error occurred (if available)

***

### path?

> `readonly` `optional` **path**: `string`

Defined in: [parser/src/errors.ts:50](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/errors.ts#L50)

The file path being parsed
