[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / CodeGenerator

# Class: CodeGenerator

Defined in: [generator/src/generator.ts:39](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/generator.ts#L39)

Code generator class
Manages template compilation, rendering, and code formatting

## Constructors

### Constructor

> **new CodeGenerator**(`options`): `CodeGenerator`

Defined in: [generator/src/generator.ts:45](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/generator.ts#L45)

#### Parameters

##### options

`Partial`\<[`GeneratorOptions`](../interfaces/GeneratorOptions.md)\> = `{}`

#### Returns

`CodeGenerator`

## Methods

### generateFromTemplate()

> **generateFromTemplate**(`templatePath`, `data`, `outputPath?`): `Promise`\<`string`\>

Defined in: [generator/src/generator.ts:72](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/generator.ts#L72)

Generate code from a template file

#### Parameters

##### templatePath

`string`

Path to the Handlebars template file

##### data

Data to pass to the template

[`TemplateDataModel`](../interfaces/TemplateDataModel.md) | `Record`\<`string`, `unknown`\>

##### outputPath?

`string`

Optional output file path (for writing)

#### Returns

`Promise`\<`string`\>

Rendered and formatted code

***

### clearCache()

> **clearCache**(): `void`

Defined in: [generator/src/generator.ts:257](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/generator.ts#L257)

Clear template cache
Useful for development or when templates change

#### Returns

`void`

***

### getCacheSize()

> **getCacheSize**(): `number`

Defined in: [generator/src/generator.ts:267](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/generator.ts#L267)

Get cache size

#### Returns

`number`

***

### registerHelper()

> **registerHelper**(`name`, `helper`): `void`

Defined in: [generator/src/generator.ts:275](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/generator.ts#L275)

Register a custom helper function
Useful for adding project-specific helpers

#### Parameters

##### name

`string`

##### helper

`HelperDelegate`

#### Returns

`void`

***

### registerPartial()

> **registerPartial**(`name`, `partial`): `void`

Defined in: [generator/src/generator.ts:286](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/generator.ts#L286)

Register a partial template
Partials can be reused across multiple templates

#### Parameters

##### name

`string`

##### partial

`string`

#### Returns

`void`
