[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / parseOpenAPIDocument

# Function: parseOpenAPIDocument()

> **parseOpenAPIDocument**(`filePath`): `Promise`\<[`ParseResult`](../interfaces/ParseResult.md)\>

Defined in: [parser/src/index.ts:217](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/index.ts#L217)

Parse OpenAPI document through complete pipeline

Executes all parser stages in sequence:
1. Load document (Story 2.1)
2. Validate schema (Story 2.2)
3. Resolve references (Story 2.3)
4. Extract schemas (Story 2.4)
5. Extract operations (Story 2.5)
6. Extract security (Story 2.6)
7. Extract tags (Story 2.7)
8. Extract servers (Story 2.8)

## Parameters

### filePath

`string`

Path to OpenAPI document (JSON or YAML)

## Returns

`Promise`\<[`ParseResult`](../interfaces/ParseResult.md)\>

Complete parse result with all extracted metadata

## Throws

Error if validation or parsing fails

## Example

```typescript
const result = await parseOpenAPIDocument('./api.yaml');
console.log(`Parsed ${result.metadata.operationCount} operations`);
console.log(`Parse time: ${result.metadata.parseTime}ms`);
```
