[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / SecurityRequirement

# Interface: SecurityRequirement

Defined in: [parser/src/security-extractor.ts:140](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L140)

Security requirement for operations

## Properties

### schemes

> **schemes**: `string`[]

Defined in: [parser/src/security-extractor.ts:142](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L142)

Scheme names required

***

### scopes

> **scopes**: `Record`\<`string`, `string`[]\>

Defined in: [parser/src/security-extractor.ts:144](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L144)

Scopes required per scheme

***

### logic

> **logic**: `"AND"` \| `"OR"`

Defined in: [parser/src/security-extractor.ts:146](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L146)

Logical combination of schemes
