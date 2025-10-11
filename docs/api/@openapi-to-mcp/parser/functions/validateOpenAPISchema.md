[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / validateOpenAPISchema

# Function: validateOpenAPISchema()

> **validateOpenAPISchema**(`document`): `Promise`\<[`ValidationResult`](../interfaces/ValidationResult.md)\>

Defined in: [parser/src/validator.ts:228](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/validator.ts#L228)

Validate OpenAPI document against OpenAPI 3.0 specification

## Parameters

### document

`unknown`

Parsed OpenAPI document

## Returns

`Promise`\<[`ValidationResult`](../interfaces/ValidationResult.md)\>

Validation result with errors and warnings

## Example

```typescript
const result = await validateOpenAPISchema(document);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
if (result.warnings.length > 0) {
  console.warn('Warnings:', result.warnings);
}
```
