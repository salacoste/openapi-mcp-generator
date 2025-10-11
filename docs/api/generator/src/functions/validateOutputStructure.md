[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / validateOutputStructure

# Function: validateOutputStructure()

> **validateOutputStructure**(`outputDir`): `Promise`\<`boolean`\>

Defined in: [generator/src/fs-utils.ts:163](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/fs-utils.ts#L163)

Validates that output directory has required MCP server structure
Required structure: src/, package.json, README.md

## Parameters

### outputDir

`string`

Output directory path to validate

## Returns

`Promise`\<`boolean`\>

True if structure is valid, false otherwise
