[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / loadOpenAPIDocument

# Function: loadOpenAPIDocument()

> **loadOpenAPIDocument**(`filePath`, `options`): `Promise`\<[`LoaderResult`](../interfaces/LoaderResult.md)\>

Defined in: [parser/src/loader.ts:189](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/loader.ts#L189)

Load and parse an OpenAPI document from a file

Supports JSON and YAML formats with automatic format detection based on file extension.
File paths are normalized to absolute paths for security.

## Parameters

### filePath

`string`

Path to OpenAPI specification file (relative or absolute)

### options

[`LoaderOptions`](../interfaces/LoaderOptions.md) = `{}`

Loader options

## Returns

`Promise`\<[`LoaderResult`](../interfaces/LoaderResult.md)\>

Parsed OpenAPI document with metadata

## Throws

If file does not exist, is not accessible, or is not a file

## Throws

If file extension is not .json, .yaml, or .yml

## Throws

If file size exceeds maximum allowed size

## Throws

If file content is not valid JSON or YAML

## Example

```typescript
// Load JSON OpenAPI file
const result = await loadOpenAPIDocument('./petstore.json');
console.log(result.document.openapi); // '3.0.0'
console.log(result.format); // 'json'

// Load YAML OpenAPI file with options
const result = await loadOpenAPIDocument('./api.yaml', {
  maxFileSize: 5 * 1024 * 1024 // 5MB
});
```
