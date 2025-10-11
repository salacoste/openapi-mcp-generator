[**OpenAPI-to-MCP Generator API v0.1.0**](../../../README.md)

***

[OpenAPI-to-MCP Generator API](../../../modules.md) / [generator/src](../README.md) / analyzeSecurityRequirements

# Function: analyzeSecurityRequirements()

> **analyzeSecurityRequirements**(`securitySchemes`, `globalSecurity`, `hasOperationSecurity`): [`SecurityGuidance`](../interfaces/SecurityGuidance.md)

Defined in: [generator/src/security-analyzer.ts:89](https://github.com/salacoste/openapi-mcp-generator/blob/fda5c6400a831cddbad9eacd652e11b2f7410b22/packages/generator/src/security-analyzer.ts#L89)

Analyze security requirements from OpenAPI specification

Examines security schemes and global/operation-level requirements
to generate comprehensive user guidance for credential configuration.

## Parameters

### securitySchemes

[`SecuritySchemeTemplateData`](../interfaces/SecuritySchemeTemplateData.md)[] = `[]`

Extracted security scheme data

### globalSecurity

`unknown`[] = `[]`

Global security requirements

### hasOperationSecurity

`boolean` = `false`

Whether any operations have specific security

## Returns

[`SecurityGuidance`](../interfaces/SecurityGuidance.md)

Complete security guidance
