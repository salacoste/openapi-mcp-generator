[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / extractSecurityRequirements

# Function: extractSecurityRequirements()

> **extractSecurityRequirements**(`securityArray`): [`SecurityRequirement`](../interfaces/SecurityRequirement.md)[]

Defined in: [parser/src/security-extractor.ts:380](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L380)

Extract security requirements from OpenAPI security array

## Parameters

### securityArray

`SecurityObject`[]

Security array from OpenAPI document

## Returns

[`SecurityRequirement`](../interfaces/SecurityRequirement.md)[]

Array of security requirements

## Examples

```ts
// AND logic: both schemes required
[{ apiKey: [], bearerAuth: [] }]
```

```ts
// OR logic: either scheme acceptable
[{ apiKey: [] }, { bearerAuth: [] }]
```
