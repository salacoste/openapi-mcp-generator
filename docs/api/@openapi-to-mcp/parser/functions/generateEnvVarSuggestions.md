[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / generateEnvVarSuggestions

# Function: generateEnvVarSuggestions()

> **generateEnvVarSuggestions**(`variables?`): `Record`\<`string`, `string`\>

Defined in: [parser/src/server-extractor.ts:187](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/server-extractor.ts#L187)

Generate environment variable name suggestions for server variables

## Parameters

### variables?

[`ServerVariables`](../interfaces/ServerVariables.md)

Server variables

## Returns

`Record`\<`string`, `string`\>

Map of variable name to suggested environment variable name

## Example

```typescript
generateEnvVarSuggestions({ environment: { default: 'prod' } })
// → { environment: 'API_ENVIRONMENT' }
```
