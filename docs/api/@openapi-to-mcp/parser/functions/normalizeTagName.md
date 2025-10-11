[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / normalizeTagName

# Function: normalizeTagName()

> **normalizeTagName**(`tagName`): `string`

Defined in: [parser/src/tag-extractor.ts:237](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/tag-extractor.ts#L237)

Normalize tag name to PascalCase identifier

## Parameters

### tagName

`string`

Original tag name

## Returns

`string`

Normalized PascalCase name

## Example

```ts
normalizeTagName('user-management') → 'UserManagement'
normalizeTagName('user_management') → 'UserManagement'
normalizeTagName('User Management') → 'UserManagement'
```
