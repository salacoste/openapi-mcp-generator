[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / extractOperations

# Function: extractOperations()

> **extractOperations**(`document`): [`OperationMetadata`](../interfaces/OperationMetadata.md)[]

Defined in: [parser/src/operation-extractor.ts:36](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/operation-extractor.ts#L36)

Extracts all operations from an OpenAPI document.

## Parameters

### document

`Document`

Fully resolved OpenAPI document

## Returns

[`OperationMetadata`](../interfaces/OperationMetadata.md)[]

Array of operation metadata objects

## Example

```typescript
const document = await resolveReferences(openapiDoc);
const schemaMap = extractSchemas(document);
const operations = extractOperations(document);

console.log(`Extracted ${operations.length} operations`);
```
