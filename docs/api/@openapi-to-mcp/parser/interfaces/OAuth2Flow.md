[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / OAuth2Flow

# Interface: OAuth2Flow

Defined in: [parser/src/security-extractor.ts:118](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L118)

OAuth2 flow details

## Properties

### authorizationUrl?

> `optional` **authorizationUrl**: `string`

Defined in: [parser/src/security-extractor.ts:120](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L120)

Authorization endpoint URL

***

### tokenUrl?

> `optional` **tokenUrl**: `string`

Defined in: [parser/src/security-extractor.ts:122](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L122)

Token endpoint URL

***

### refreshUrl?

> `optional` **refreshUrl**: `string`

Defined in: [parser/src/security-extractor.ts:124](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L124)

Token refresh URL

***

### scopes

> **scopes**: `Record`\<`string`, `string`\>

Defined in: [parser/src/security-extractor.ts:126](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L126)

Available scopes and their descriptions
