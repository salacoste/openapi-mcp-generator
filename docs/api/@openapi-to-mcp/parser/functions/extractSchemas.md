[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / extractSchemas

# Function: extractSchemas()

> **extractSchemas**(`document`): [`SchemaMap`](../type-aliases/SchemaMap.md)

Defined in: [parser/src/schema-extractor.ts:46](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/schema-extractor.ts#L46)

Extracts and normalizes all schemas from an OpenAPI document.

This function:
- Extracts component schemas from components.schemas
- Extracts inline schemas from request/response bodies
- Normalizes allOf compositions (merges properties)
- Handles oneOf/anyOf as union types
- Extracts nested objects as separate schemas
- Generates unique names for all schemas

## Parameters

### document

`Document`

Fully resolved OpenAPI document (no $ref properties)

## Returns

[`SchemaMap`](../type-aliases/SchemaMap.md)

Map of schema names to normalized schema objects

## Example

```typescript
const document = await resolveReferences(openapiDoc);
const schemaMap = extractSchemas(document);

console.log(`Extracted ${schemaMap.size} schemas`);
for (const [name, schema] of schemaMap) {
  console.log(`${name}: ${schema.type}`);
}
```
