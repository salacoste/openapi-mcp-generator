[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / writeFile

# Function: writeFile()

> **writeFile**(`filePath`, `content`): `Promise`\<`void`\>

Defined in: [generator/src/fs-utils.ts:104](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/fs-utils.ts#L104)

Writes string content to a file with UTF-8 encoding
Creates parent directories automatically if they don't exist

## Parameters

### filePath

`string`

Path to file to write

### content

`string`

String content to write

## Returns

`Promise`\<`void`\>

## Throws

If file write fails
