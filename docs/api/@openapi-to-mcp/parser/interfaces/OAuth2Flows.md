[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / OAuth2Flows

# Interface: OAuth2Flows

Defined in: [parser/src/security-extractor.ts:104](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L104)

OAuth2 flows configuration

## Properties

### implicit?

> `optional` **implicit**: [`OAuth2Flow`](OAuth2Flow.md)

Defined in: [parser/src/security-extractor.ts:106](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L106)

Implicit flow

***

### authorizationCode?

> `optional` **authorizationCode**: [`OAuth2Flow`](OAuth2Flow.md)

Defined in: [parser/src/security-extractor.ts:108](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L108)

Authorization code flow

***

### clientCredentials?

> `optional` **clientCredentials**: [`OAuth2Flow`](OAuth2Flow.md)

Defined in: [parser/src/security-extractor.ts:110](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L110)

Client credentials flow

***

### password?

> `optional` **password**: [`OAuth2Flow`](OAuth2Flow.md)

Defined in: [parser/src/security-extractor.ts:112](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/security-extractor.ts#L112)

Password flow
