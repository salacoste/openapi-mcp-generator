[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / generateTagFromPath

# Function: generateTagFromPath()

> **generateTagFromPath**(`path`): `string`

Defined in: [parser/src/tag-extractor.ts:257](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/tag-extractor.ts#L257)

Generate tag name from operation path

## Parameters

### path

`string`

Operation path

## Returns

`string`

Generated PascalCase tag name

## Example

```ts
generateTagFromPath('/users') → 'Users'
generateTagFromPath('/users/{id}') → 'Users'
generateTagFromPath('/api/v1/products') → 'Products'
generateTagFromPath('/user-profiles/{id}') → 'UserProfiles'
```
