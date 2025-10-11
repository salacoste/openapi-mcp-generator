[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / resolveReferences

# Function: resolveReferences()

> **resolveReferences**(`document`, `_basePath?`): `Promise`\<[`ResolutionResult`](../interfaces/ResolutionResult.md)\>

Defined in: [parser/src/ref-resolver.ts:67](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/ref-resolver.ts#L67)

Resolves all $ref references in an OpenAPI document.

This function handles:
- Internal references: #/components/schemas/User
- External file references: ./common.yaml#/schemas/Error
- Nested references: ref → ref → ref
- Circular reference detection
- Automatic caching of resolved references

## Parameters

### document

`unknown`

OpenAPI document (may contain $ref references)

### \_basePath?

`string`

## Returns

`Promise`\<[`ResolutionResult`](../interfaces/ResolutionResult.md)\>

Resolution result with dereferenced document or errors

## Example

```typescript
const document = await loadOpenAPIDocument('./api.json');
const result = await resolveReferences(document, './');

if (result.errors.length > 0) {
  console.error('Resolution failed:', result.errors);
} else {
  console.log(`Resolved ${result.resolved} references`);
  // Use result.document for code generation
}
```
