[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / TemplateDataModel

# Interface: TemplateDataModel

Defined in: [generator/src/types.ts:9](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L9)

Template data model interface
This is the data structure passed to templates for rendering

## Properties

### apiName

> **apiName**: `string`

Defined in: [generator/src/types.ts:11](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L11)

***

### apiVersion

> **apiVersion**: `string`

Defined in: [generator/src/types.ts:12](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L12)

***

### apiDescription?

> `optional` **apiDescription**: `string`

Defined in: [generator/src/types.ts:13](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L13)

***

### schemas

> **schemas**: [`SchemaTemplateData`](SchemaTemplateData.md)[]

Defined in: [generator/src/types.ts:16](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L16)

***

### operations

> **operations**: [`OperationTemplateData`](OperationTemplateData.md)[]

Defined in: [generator/src/types.ts:17](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L17)

***

### securitySchemes

> **securitySchemes**: [`SecuritySchemeTemplateData`](SecuritySchemeTemplateData.md)[]

Defined in: [generator/src/types.ts:18](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L18)

***

### tags

> **tags**: [`TagTemplateData`](TagTemplateData.md)[]

Defined in: [generator/src/types.ts:19](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L19)

***

### servers

> **servers**: [`ServerTemplateData`](ServerTemplateData.md)[]

Defined in: [generator/src/types.ts:20](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L20)

***

### hasAuthentication

> **hasAuthentication**: `boolean`

Defined in: [generator/src/types.ts:23](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L23)

***

### primaryServer

> **primaryServer**: [`ServerTemplateData`](ServerTemplateData.md)

Defined in: [generator/src/types.ts:24](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L24)

***

### packageName

> **packageName**: `string`

Defined in: [generator/src/types.ts:25](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L25)

***

### generatedAt

> **generatedAt**: `string`

Defined in: [generator/src/types.ts:28](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L28)

***

### generatorVersion

> **generatorVersion**: `string`

Defined in: [generator/src/types.ts:29](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/types.ts#L29)
