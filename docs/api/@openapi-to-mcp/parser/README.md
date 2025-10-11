[**OpenAPI-to-MCP Generator API v0.1.0**](../../README.md)

***

[OpenAPI-to-MCP Generator API](../../modules.md) / @openapi-to-mcp/parser

# @openapi-to-mcp/parser

@openapi-to-mcp/parser
OpenAPI 3.0 parser with format detection and document loading

## Classes

- [ParserError](classes/ParserError.md)
- [FileSystemError](classes/FileSystemError.md)
- [ParseError](classes/ParseError.md)
- [UnsupportedFormatError](classes/UnsupportedFormatError.md)
- [FileSizeError](classes/FileSizeError.md)

## Interfaces

- [ParseMetadata](interfaces/ParseMetadata.md)
- [ParseResult](interfaces/ParseResult.md)
- [OperationMetadata](interfaces/OperationMetadata.md)
- [ParameterMetadata](interfaces/ParameterMetadata.md)
- [RequestBodyMetadata](interfaces/RequestBodyMetadata.md)
- [ResponseMetadata](interfaces/ResponseMetadata.md)
- [ResolutionResult](interfaces/ResolutionResult.md)
- [ResolutionError](interfaces/ResolutionError.md)
- [NormalizedSchema](interfaces/NormalizedSchema.md)
- [PropertySchema](interfaces/PropertySchema.md)
- [CompositionMetadata](interfaces/CompositionMetadata.md)
- [DiscriminatorInfo](interfaces/DiscriminatorInfo.md)
- [SchemaConstraints](interfaces/SchemaConstraints.md)
- [PropertyConstraints](interfaces/PropertyConstraints.md)
- [SecuritySchemeMap](interfaces/SecuritySchemeMap.md)
- [ClassifiedSecurityScheme](interfaces/ClassifiedSecurityScheme.md)
- [ApiKeyMetadata](interfaces/ApiKeyMetadata.md)
- [HttpBearerMetadata](interfaces/HttpBearerMetadata.md)
- [HttpBasicMetadata](interfaces/HttpBasicMetadata.md)
- [OAuth2Metadata](interfaces/OAuth2Metadata.md)
- [OAuth2Flows](interfaces/OAuth2Flows.md)
- [OAuth2Flow](interfaces/OAuth2Flow.md)
- [OpenIdConnectMetadata](interfaces/OpenIdConnectMetadata.md)
- [SecurityRequirement](interfaces/SecurityRequirement.md)
- [SecurityExtractionResult](interfaces/SecurityExtractionResult.md)
- [ServerVariable](interfaces/ServerVariable.md)
- [ServerVariables](interfaces/ServerVariables.md)
- [ServerMetadata](interfaces/ServerMetadata.md)
- [ServerExtractionResult](interfaces/ServerExtractionResult.md)
- [TagMetadata](interfaces/TagMetadata.md)
- [ExternalDocs](interfaces/ExternalDocs.md)
- [TagComplexity](interfaces/TagComplexity.md)
- [MethodDistribution](interfaces/MethodDistribution.md)
- [TagExtractionResult](interfaces/TagExtractionResult.md)
- [LoaderOptions](interfaces/LoaderOptions.md)
- [LoaderResult](interfaces/LoaderResult.md)
- [ValidationIssue](interfaces/ValidationIssue.md)
- [ValidationResult](interfaces/ValidationResult.md)

## Type Aliases

- [HttpMethod](type-aliases/HttpMethod.md)
- [ParameterLocation](type-aliases/ParameterLocation.md)
- [SchemaType](type-aliases/SchemaType.md)
- [SchemaMap](type-aliases/SchemaMap.md)
- [SecurityClassification](type-aliases/SecurityClassification.md)
- [SecurityMetadata](type-aliases/SecurityMetadata.md)
- [ServerEnvironment](type-aliases/ServerEnvironment.md)
- [OpenAPIObject](type-aliases/OpenAPIObject.md)
- [FileFormat](type-aliases/FileFormat.md)
- [ValidationSeverity](type-aliases/ValidationSeverity.md)

## Variables

- [version](variables/version.md)

## Functions

- [parseOpenAPIDocument](functions/parseOpenAPIDocument.md)
- [loadOpenAPIDocument](functions/loadOpenAPIDocument.md)
- [loadOpenAPI](functions/loadOpenAPI.md)
- [extractOperations](functions/extractOperations.md)
- [resolveReferences](functions/resolveReferences.md)
- [extractSchemas](functions/extractSchemas.md)
- [serializeSchemaMap](functions/serializeSchemaMap.md)
- [deserializeSchemaMap](functions/deserializeSchemaMap.md)
- [extractSecuritySchemes](functions/extractSecuritySchemes.md)
- [classifySecurityScheme](functions/classifySecurityScheme.md)
- [extractSecurityRequirements](functions/extractSecurityRequirements.md)
- [isApiKeyScheme](functions/isApiKeyScheme.md)
- [isHttpBearerScheme](functions/isHttpBearerScheme.md)
- [isHttpBasicScheme](functions/isHttpBasicScheme.md)
- [isOAuth2Scheme](functions/isOAuth2Scheme.md)
- [isOpenIdConnectScheme](functions/isOpenIdConnectScheme.md)
- [extractBasePath](functions/extractBasePath.md)
- [resolveServerUrl](functions/resolveServerUrl.md)
- [inferServerEnvironment](functions/inferServerEnvironment.md)
- [generateEnvVarSuggestions](functions/generateEnvVarSuggestions.md)
- [extractServers](functions/extractServers.md)
- [extractTags](functions/extractTags.md)
- [normalizeTagName](functions/normalizeTagName.md)
- [generateTagFromPath](functions/generateTagFromPath.md)
- [validateOpenAPISchema](functions/validateOpenAPISchema.md)
