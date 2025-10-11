[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / loadOpenAPI

# Function: loadOpenAPI()

> **loadOpenAPI**(`filePath`, `options`): `Promise`\<[`OpenAPIObject`](../type-aliases/OpenAPIObject.md)\>

Defined in: [parser/src/loader.ts:247](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/loader.ts#L247)

Load only the OpenAPI document without metadata

Convenience function that returns only the parsed document.

## Parameters

### filePath

`string`

Path to OpenAPI specification file

### options

[`LoaderOptions`](../interfaces/LoaderOptions.md) = `{}`

Loader options

## Returns

`Promise`\<[`OpenAPIObject`](../type-aliases/OpenAPIObject.md)\>

Parsed OpenAPI document

## Example

```typescript
const doc = await loadOpenAPI('./petstore.json');
console.log(doc.info.title); // 'Petstore API'
```
