[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [@openapi-to-mcp/parser](../README.md) / ParseResult

# Interface: ParseResult

Defined in: [parser/src/index.ts:172](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/index.ts#L172)

Complete parser output with all extracted metadata

## Properties

### document

> **document**: `Document`

Defined in: [parser/src/index.ts:174](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/index.ts#L174)

Fully resolved OpenAPI document

***

### schemas

> **schemas**: [`SchemaMap`](../type-aliases/SchemaMap.md)

Defined in: [parser/src/index.ts:176](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/index.ts#L176)

Extracted and normalized schemas

***

### operations

> **operations**: [`OperationMetadata`](OperationMetadata.md)[]

Defined in: [parser/src/index.ts:178](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/index.ts#L178)

Extracted operations with metadata

***

### security

> **security**: [`SecurityExtractionResult`](SecurityExtractionResult.md)

Defined in: [parser/src/index.ts:180](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/index.ts#L180)

Extracted security schemes and requirements

***

### tags

> **tags**: [`TagExtractionResult`](TagExtractionResult.md)

Defined in: [parser/src/index.ts:182](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/index.ts#L182)

Extracted tags with operation mapping

***

### servers

> **servers**: [`ServerExtractionResult`](ServerExtractionResult.md)

Defined in: [parser/src/index.ts:184](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/index.ts#L184)

Extracted servers with URL resolution

***

### errors

> **errors**: ([`ValidationIssue`](ValidationIssue.md) \| [`ResolutionError`](ResolutionError.md) \| `Error`)[]

Defined in: [parser/src/index.ts:186](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/index.ts#L186)

Validation and parsing errors

***

### warnings

> **warnings**: `string`[]

Defined in: [parser/src/index.ts:188](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/index.ts#L188)

Warnings from all pipeline stages

***

### metadata

> **metadata**: [`ParseMetadata`](ParseMetadata.md)

Defined in: [parser/src/index.ts:190](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/parser/src/index.ts#L190)

Performance and metadata
