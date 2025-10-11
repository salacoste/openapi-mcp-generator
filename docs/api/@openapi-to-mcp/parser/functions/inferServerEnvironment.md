[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / inferServerEnvironment

# Function: inferServerEnvironment()

> **inferServerEnvironment**(`url`, `description?`): [`ServerEnvironment`](../type-aliases/ServerEnvironment.md)

Defined in: [parser/src/server-extractor.ts:150](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/server-extractor.ts#L150)

Infer server environment from URL and description

## Parameters

### url

`string`

Server URL

### description?

`string`

Optional server description

## Returns

[`ServerEnvironment`](../type-aliases/ServerEnvironment.md)

Inferred environment type

## Example

```typescript
inferServerEnvironment('https://api.example.com', 'Production server') // → 'production'
inferServerEnvironment('https://staging-api.example.com') // → 'staging'
inferServerEnvironment('http://localhost:8080') // → 'local'
```
