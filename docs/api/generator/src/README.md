[**OpenAPI-to-MCP Generator API v0.1.0**](../../README.md)

***

[OpenAPI-to-MCP Generator API](../../modules.md) / generator/src

# generator/src

## Classes

- [GenerationError](classes/GenerationError.md)
- [TemplateRenderError](classes/TemplateRenderError.md)
- [TemplateValidationError](classes/TemplateValidationError.md)
- [TemplateNotFoundError](classes/TemplateNotFoundError.md)
- [CodeFormattingError](classes/CodeFormattingError.md)
- [DataValidationError](classes/DataValidationError.md)
- [FileSystemError](classes/FileSystemError.md)
- [CodeGenerator](classes/CodeGenerator.md)
- [ValidationReporter](classes/ValidationReporter.md)

## Interfaces

- [InterfaceGenerationOptions](interfaces/InterfaceGenerationOptions.md)
- [GeneratedInterface](interfaces/GeneratedInterface.md)
- [InterfaceGenerationResult](interfaces/InterfaceGenerationResult.md)
- [NormalizedSchema](interfaces/NormalizedSchema.md)
- [ScaffoldOptions](interfaces/ScaffoldOptions.md)
- [EnvVarConfig](interfaces/EnvVarConfig.md)
- [UnsupportedScheme](interfaces/UnsupportedScheme.md)
- [DocumentationLink](interfaces/DocumentationLink.md)
- [SecurityGuidance](interfaces/SecurityGuidance.md)
- [JSONSchemaProperty](interfaces/JSONSchemaProperty.md)
- [JSONSchema](interfaces/JSONSchema.md)
- [ToolDefinition](interfaces/ToolDefinition.md)
- [ToolGenerationOptions](interfaces/ToolGenerationOptions.md)
- [ToolGenerationResult](interfaces/ToolGenerationResult.md)
- [TemplateDataModel](interfaces/TemplateDataModel.md)
- [SchemaTemplateData](interfaces/SchemaTemplateData.md)
- [PropertyTemplateData](interfaces/PropertyTemplateData.md)
- [OperationTemplateData](interfaces/OperationTemplateData.md)
- [ParameterTemplateData](interfaces/ParameterTemplateData.md)
- [RequestBodyTemplateData](interfaces/RequestBodyTemplateData.md)
- [ResponseTemplateData](interfaces/ResponseTemplateData.md)
- [SecuritySchemeTemplateData](interfaces/SecuritySchemeTemplateData.md)
- [SecurityRequirementTemplateData](interfaces/SecurityRequirementTemplateData.md)
- [TagTemplateData](interfaces/TagTemplateData.md)
- [ServerTemplateData](interfaces/ServerTemplateData.md)
- [ServerVariableTemplateData](interfaces/ServerVariableTemplateData.md)
- [GeneratorOptions](interfaces/GeneratorOptions.md)
- [PrettierConfig](interfaces/PrettierConfig.md)
- [GeneratorResult](interfaces/GeneratorResult.md)
- [GenerationErrorInfo](interfaces/GenerationErrorInfo.md)
- [GenerationOptions](interfaces/GenerationOptions.md)
- [GenerationResult](interfaces/GenerationResult.md)
- [ValidationCheck](interfaces/ValidationCheck.md)
- [TestStats](interfaces/TestStats.md)
- [PerformanceMetrics](interfaces/PerformanceMetrics.md)
- [ValidationReport](interfaces/ValidationReport.md)

## Type Aliases

- [SchemaMap](type-aliases/SchemaMap.md)

## Variables

- [version](variables/version.md)

## Functions

- [createDirectory](functions/createDirectory.md)
- [writeFile](functions/writeFile.md)
- [copyTemplate](functions/copyTemplate.md)
- [validateOutputStructure](functions/validateOutputStructure.md)
- [checkOutputDirectory](functions/checkOutputDirectory.md)
- [camelCase](functions/camelCase.md)
- [pascalCase](functions/pascalCase.md)
- [kebabCase](functions/kebabCase.md)
- [snakeCase](functions/snakeCase.md)
- [screamingSnakeCase](functions/screamingSnakeCase.md)
- [toTsType](functions/toTsType.md)
- [capitalize](functions/capitalize.md)
- [pluralize](functions/pluralize.md)
- [escapeComment](functions/escapeComment.md)
- [indent](functions/indent.md)
- [formatComment](functions/formatComment.md)
- [eq](functions/eq.md)
- [ne](functions/ne.md)
- [gt](functions/gt.md)
- [gte](functions/gte.md)
- [lt](functions/lt.md)
- [lte](functions/lte.md)
- [and](functions/and.md)
- [or](functions/or.md)
- [not](functions/not.md)
- [registerHelpers](functions/registerHelpers.md)
- [generateInterfaces](functions/generateInterfaces.md)
- [generateMCPServer](functions/generateMCPServer.md)
- [generateParameterMapping](functions/generateParameterMapping.md)
- [generateResponseProcessing](functions/generateResponseProcessing.md)
- [generateErrorHandling](functions/generateErrorHandling.md)
- [wrapWithErrorHandling](functions/wrapWithErrorHandling.md)
- [scaffoldProject](functions/scaffoldProject.md)
- [analyzeSecurityRequirements](functions/analyzeSecurityRequirements.md)
- [formatSecurityGuidance](functions/formatSecurityGuidance.md)
- [generateToolDefinitions](functions/generateToolDefinitions.md)
- [log](functions/log.md)
- [createCheck](functions/createCheck.md)
