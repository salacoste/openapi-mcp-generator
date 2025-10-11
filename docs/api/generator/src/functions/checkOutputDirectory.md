[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / checkOutputDirectory

# Function: checkOutputDirectory()

> **checkOutputDirectory**(`outputDir`, `force`): `Promise`\<`void`\>

Defined in: [generator/src/fs-utils.ts:194](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/fs-utils.ts#L194)

Checks output directory and handles overwrite based on force flag

## Parameters

### outputDir

`string`

Output directory path

### force

`boolean`

Whether to force overwrite existing directory

## Returns

`Promise`\<`void`\>

## Throws

If directory exists and force is false
