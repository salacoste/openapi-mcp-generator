/**
 * Request Parameter Mapping Code Generator
 * Generates execute function code for MCP tools with parameter mapping and validation
 */

import type { OperationMetadata, ParameterMetadata } from '@openapi-to-mcp/parser';
import { generateResponseProcessing, wrapWithErrorHandling } from './response-processor.js';

/**
 * Generate parameter mapping code for an operation's execute function
 */
export function generateParameterMapping(operation: OperationMetadata): string {
  const pathParams = operation.pathParameters || [];
  const queryParams = operation.queryParameters || [];
  const headerParams = operation.headerParameters || [];
  const hasBody = operation.requestBody !== undefined;

  const codeLines: string[] = [];

  // Add validation
  codeLines.push(generateValidation(operation));

  // Build URL with path parameter substitution
  codeLines.push(generatePathSubstitution(operation.path, pathParams));

  // Build query parameters
  codeLines.push(generateQueryMapping(queryParams));

  // Build custom headers
  codeLines.push(generateHeaderMapping(headerParams));

  // Build request body
  codeLines.push(generateBodyMapping(hasBody));

  // Execute HTTP request
  codeLines.push(generateHttpCall(operation));

  // Add response processing
  const responseCode = generateResponseProcessing(operation);
  codeLines.push(responseCode);

  // Wrap everything with error handling
  const parameterCode = codeLines.filter(line => line.trim()).join('\n\n');
  return wrapWithErrorHandling(operation.operationId, parameterCode, '');
}

/**
 * Generate validation code for required parameters
 */
function generateValidation(operation: OperationMetadata): string {
  const validations: string[] = [];

  // Validate required path parameters
  for (const param of operation.pathParameters || []) {
    if (param.required) {
      validations.push(
        `      if (args.${param.name} === undefined || args.${param.name} === null) {
        throw new Error('Missing required path parameter: ${param.name}');
      }`
      );
    }
  }

  // Validate required query parameters
  for (const param of operation.queryParameters || []) {
    if (param.required) {
      validations.push(
        `      if (args.${param.name} === undefined || args.${param.name} === null) {
        throw new Error('Missing required query parameter: ${param.name}');
      }`
      );
    }
  }

  // Validate required header parameters
  for (const param of operation.headerParameters || []) {
    if (param.required) {
      validations.push(
        `      if (args.${param.name} === undefined || args.${param.name} === null) {
        throw new Error('Missing required header parameter: ${param.name}');
      }`
      );
    }
  }

  // Validate required request body
  if (operation.requestBody?.required) {
    validations.push(
      `      if (!args.body) {
        throw new Error('Missing required request body');
      }`
    );
  }

  if (validations.length === 0) {
    return '';
  }

  return `      // Validate required parameters
${validations.join('\n')}`;
}

/**
 * Generate path parameter substitution code
 */
function generatePathSubstitution(path: string, pathParams: ParameterMetadata[]): string {
  if (pathParams.length === 0) {
    return `      // Build request URL
      let url = '${path}';`;
  }

  const substitutions = pathParams.map(param => {
    const coercion = generateTypeCoercion(param);
    return `      url = url.replace('{${param.name}}', encodeURIComponent(String(${coercion})));`;
  });

  return `      // Build request URL with path parameters
      let url = '${path}';
${substitutions.join('\n')}`;
}

/**
 * Generate query parameter mapping code
 */
function generateQueryMapping(queryParams: ParameterMetadata[]): string {
  if (queryParams.length === 0) {
    return `      // Build query parameters
      const params: Record<string, unknown> = {};`;
  }

  const mappings = queryParams.map(param => {
    const coercion = generateTypeCoercion(param);
    const hasDefault = param.schema?.default !== undefined;

    let code = `      if (args.${param.name} !== undefined && args.${param.name} !== null) {
        params['${param.name}'] = ${coercion};
      }`;

    if (hasDefault && param.schema) {
      const defaultValue = JSON.stringify(param.schema.default);
      code += ` else {
        params['${param.name}'] = ${defaultValue};
      }`;
    }

    return code;
  });

  return `      // Build query parameters
      const params: Record<string, unknown> = {};
${mappings.join('\n')}`;
}

/**
 * Generate header parameter mapping code
 */
function generateHeaderMapping(headerParams: ParameterMetadata[]): string {
  // Filter out standard auth headers
  const customHeaders = headerParams.filter(param => isCustomHeader(param.name));

  if (customHeaders.length === 0) {
    return `      // Build custom headers
      const headers: Record<string, string> = {};`;
  }

  const mappings = customHeaders.map(param => {
    return `      if (args.${param.name} !== undefined && args.${param.name} !== null) {
        headers['${param.name}'] = String(args.${param.name});
      }`;
  });

  return `      // Build custom headers
      const headers: Record<string, string> = {};
${mappings.join('\n')}`;
}

/**
 * Generate request body mapping code
 */
function generateBodyMapping(hasBody: boolean): string {
  if (!hasBody) {
    return '';
  }

  return `      // Build request body
      const data = args.body;`;
}

/**
 * Generate HTTP client call code
 */
function generateHttpCall(operation: OperationMetadata): string {
  const method = operation.method.toLowerCase();
  const hasBody = operation.requestBody !== undefined;

  // Methods that support body: post, put, patch
  const methodsWithBody = ['post', 'put', 'patch'];
  const supportsBody = methodsWithBody.includes(method);

  if (supportsBody && hasBody) {
    return `      // Execute HTTP request
      const response = await client.${method}<unknown>(url, data, { params, headers });
      return response;`;
  } else {
    return `      // Execute HTTP request
      const response = await client.${method}<unknown>(url, { params, headers });
      return response;`;
  }
}

/**
 * Generate type coercion code for parameter
 */
function generateTypeCoercion(param: ParameterMetadata): string {
  const paramType = param.schema?.type || 'string';
  const paramName = `args.${param.name}`;

  switch (paramType) {
    case 'integer':
    case 'number':
      return `(typeof ${paramName} === 'string' ? Number(${paramName}) : ${paramName})`;

    case 'boolean':
      return `(typeof ${paramName} === 'string' ? ${paramName} === 'true' : ${paramName})`;

    case 'array':
      // For arrays, apply serialization based on OpenAPI style parameter
      return generateArraySerialization(param);

    case 'object':
      return paramName;

    default:
      return paramName;
  }
}

/**
 * Generate array serialization code based on OpenAPI style parameter
 * Supports: form (default), spaceDelimited, pipeDelimited
 */
function generateArraySerialization(param: ParameterMetadata): string {
  const paramName = `args.${param.name}`;
  const style = param.style || 'form';
  const explode = param.explode !== false; // Default is true per OpenAPI spec

  // For query parameters, we need to handle different serialization styles
  if (param.in === 'query') {
    switch (style) {
      case 'spaceDelimited':
        // Space delimited: ?tags=tag1 tag2 tag3
        return `(Array.isArray(${paramName}) ? ${paramName}.join(' ') : ${paramName})`;

      case 'pipeDelimited':
        // Pipe delimited: ?tags=tag1|tag2|tag3
        return `(Array.isArray(${paramName}) ? ${paramName}.join('|') : ${paramName})`;

      case 'form':
      default:
        // Form style with explode (default): ?tags=tag1&tags=tag2&tags=tag3
        // Form style without explode: ?tags=tag1,tag2,tag3
        if (explode) {
          // Axios handles exploded arrays natively when passed as array
          return paramName;
        } else {
          // Join with comma for non-exploded form style
          return `(Array.isArray(${paramName}) ? ${paramName}.join(',') : ${paramName})`;
        }
    }
  }

  // For non-query parameters (headers, path), default to comma-separated
  return `(Array.isArray(${paramName}) ? ${paramName}.join(',') : ${paramName})`;
}

/**
 * Check if header is custom (not standard HTTP/auth header)
 */
function isCustomHeader(headerName: string): boolean {
  const standardHeaders = [
    'accept',
    'accept-encoding',
    'accept-language',
    'authorization',
    'cache-control',
    'content-type',
    'content-length',
    'cookie',
    'host',
    'user-agent',
  ];
  return !standardHeaders.includes(headerName.toLowerCase());
}
