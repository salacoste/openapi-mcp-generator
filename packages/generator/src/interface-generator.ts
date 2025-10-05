/**
 * TypeScript interface generator from OpenAPI schemas
 * Converts OpenAPI schemas to type-safe TypeScript interfaces
 */

import { pascalCase } from './helpers.js';

/**
 * Interface generation options
 */
export interface InterfaceGenerationOptions {
  /** Output mode for generated interfaces */
  outputMode?: 'single-file' | 'by-tag' | 'per-schema';
  /** Array style preference */
  arrayStyle?: 'bracket' | 'generic'; // T[] vs Array<T>
  /** Include JSDoc comments */
  includeComments?: boolean;
  /** Include example values in comments */
  includeExamples?: boolean;
  /** Export all interfaces */
  exportAll?: boolean;
}

/**
 * Generated interface information
 */
export interface GeneratedInterface {
  /** Interface name */
  name: string;
  /** Generated TypeScript code */
  code: string;
  /** Dependencies (other interfaces referenced) */
  dependencies: string[];
  /** Source schema reference */
  sourceSchema: string;
  /** JSDoc comment */
  comment?: string;
}

/**
 * Interface generation result
 */
export interface InterfaceGenerationResult {
  /** Generated interfaces */
  interfaces: GeneratedInterface[];
  /** Import statements */
  imports: string[];
  /** Combined TypeScript code */
  code: string;
}

/**
 * Normalized schema from parser
 */
export interface NormalizedSchema {
  name: string;
  type: string;
  description?: string;
  properties?: Record<string, NormalizedSchema>;
  required?: string[];
  nullable?: boolean;
  enum?: (string | number)[];
  items?: NormalizedSchema;
  format?: string;
  example?: unknown;
  allOf?: NormalizedSchema[];
  oneOf?: NormalizedSchema[];
  anyOf?: NormalizedSchema[];
  discriminator?: {
    propertyName: string;
    mapping?: Record<string, string>;
  };
  minItems?: number;
  maxItems?: number;
  $ref?: string;
}

/**
 * Schema map from parser
 */
export type SchemaMap = Record<string, NormalizedSchema>;

/**
 * Generate TypeScript interfaces from OpenAPI schemas
 */
export function generateInterfaces(
  schemas: SchemaMap,
  options: InterfaceGenerationOptions = {}
): InterfaceGenerationResult {
  const opts: Required<InterfaceGenerationOptions> = {
    outputMode: options.outputMode ?? 'single-file',
    arrayStyle: options.arrayStyle ?? 'bracket',
    includeComments: options.includeComments ?? true,
    includeExamples: options.includeExamples ?? true,
    exportAll: options.exportAll ?? true,
  };

  const interfaces: GeneratedInterface[] = [];
  const processedSchemas = new Set<string>();

  // Process each schema
  for (const [schemaName, schema] of Object.entries(schemas)) {
    if (processedSchemas.has(schemaName)) {
      continue;
    }

    const generated = generateInterface(schemaName, schema, schemas, opts);
    interfaces.push(...generated);

    generated.forEach((iface) => processedSchemas.add(iface.sourceSchema));
  }

  // Generate combined code
  const code = generateCombinedCode(interfaces);

  return {
    interfaces,
    imports: [],
    code,
  };
}

/**
 * Generate interface for a single schema
 */
function generateInterface(
  name: string,
  schema: NormalizedSchema,
  allSchemas: SchemaMap,
  options: Required<InterfaceGenerationOptions>
): GeneratedInterface[] {
  const interfaces: GeneratedInterface[] = [];

  // Handle composition (allOf, oneOf, anyOf)
  if (schema.allOf || schema.oneOf || schema.anyOf) {
    const compositionInterface = generateCompositionInterface(
      name,
      schema,
      allSchemas,
      options
    );
    interfaces.push(compositionInterface);
    return interfaces;
  }

  // Generate main interface
  const mainInterface = generateObjectInterface(name, schema, allSchemas, options);
  interfaces.push(mainInterface);

  // Generate nested interfaces
  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      if (propSchema.type === 'object' && propSchema.properties) {
        const nestedName = `${name}${pascalCase(propName)}`;
        const nested = generateInterface(nestedName, propSchema, allSchemas, options);
        interfaces.push(...nested);
      }
    }
  }

  return interfaces;
}

/**
 * Generate object interface
 */
function generateObjectInterface(
  name: string,
  schema: NormalizedSchema,
  allSchemas: SchemaMap,
  options: Required<InterfaceGenerationOptions>
): GeneratedInterface {
  const lines: string[] = [];
  const dependencies: string[] = [];

  // Add JSDoc comment
  if (options.includeComments && schema.description) {
    lines.push(formatJSDocComment(schema.description, schema.example, options));
  }

  // Interface declaration
  lines.push(`export interface ${name} {`);

  // Add properties
  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const isRequired = schema.required?.includes(propName) ?? false;
      const optional = isRequired ? '' : '?';

      // Property JSDoc
      if (options.includeComments && propSchema.description) {
        lines.push(`  /** ${propSchema.description} */`);
      }

      // Property type
      const tsType = mapSchemaToTypeScript(propSchema, allSchemas, options, dependencies);

      lines.push(`  ${propName}${optional}: ${tsType};`);
    }
  }

  lines.push('}');

  return {
    name,
    code: lines.join('\n'),
    dependencies,
    sourceSchema: name,
    comment: schema.description,
  };
}

/**
 * Generate composition interface (allOf, oneOf, anyOf)
 */
function generateCompositionInterface(
  name: string,
  schema: NormalizedSchema,
  allSchemas: SchemaMap,
  options: Required<InterfaceGenerationOptions>
): GeneratedInterface {
  const lines: string[] = [];
  const dependencies: string[] = [];

  // Add JSDoc comment
  if (options.includeComments && schema.description) {
    lines.push(formatJSDocComment(schema.description, schema.example, options));
  }

  // Handle allOf (intersection)
  if (schema.allOf) {
    const types = schema.allOf.map((s) =>
      mapSchemaToTypeScript(s, allSchemas, options, dependencies)
    );
    lines.push(`export type ${name} = ${types.join(' & ')};`);
  }
  // Handle oneOf/anyOf (union)
  else if (schema.oneOf || schema.anyOf) {
    const schemas = schema.oneOf || schema.anyOf || [];

    // Check for discriminated union
    if (schema.discriminator) {
      // Generate separate interfaces for each variant
      const variantInterfaces: string[] = [];

      schemas.forEach((variantSchema) => {
        const variantType = mapSchemaToTypeScript(
          variantSchema,
          allSchemas,
          options,
          dependencies
        );
        variantInterfaces.push(variantType);
      });

      lines.push(`export type ${name} = ${variantInterfaces.join(' | ')};`);
    } else {
      // Simple union
      const types = schemas.map((s) =>
        mapSchemaToTypeScript(s, allSchemas, options, dependencies)
      );
      lines.push(`export type ${name} = ${types.join(' | ')};`);
    }
  }

  return {
    name,
    code: lines.join('\n'),
    dependencies,
    sourceSchema: name,
    comment: schema.description,
  };
}

/**
 * Map OpenAPI schema to TypeScript type
 */
function mapSchemaToTypeScript(
  schema: NormalizedSchema,
  allSchemas: SchemaMap,
  options: Required<InterfaceGenerationOptions>,
  dependencies: string[]
): string {
  let tsType: string;

  // Handle $ref
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop() || 'unknown';
    dependencies.push(refName);
    tsType = refName;
  }
  // Handle enum
  else if (schema.enum) {
    if (typeof schema.enum[0] === 'string') {
      tsType = schema.enum.map((v) => `'${v}'`).join(' | ');
    } else {
      tsType = schema.enum.join(' | ');
    }
  }
  // Handle array
  else if (schema.type === 'array' && schema.items) {
    const itemType = mapSchemaToTypeScript(schema.items, allSchemas, options, dependencies);

    // Check for tuple (fixed length array)
    if (
      schema.minItems !== undefined &&
      schema.maxItems !== undefined &&
      schema.minItems === schema.maxItems
    ) {
      const tupleTypes = Array(schema.minItems).fill(itemType);
      tsType = `[${tupleTypes.join(', ')}]`;
    } else {
      tsType = options.arrayStyle === 'bracket' ? `${itemType}[]` : `Array<${itemType}>`;
    }
  }
  // Handle object
  else if (schema.type === 'object') {
    if (schema.name) {
      tsType = schema.name;
      dependencies.push(schema.name);
    } else {
      // Inline object - use Record or object
      tsType = 'Record<string, unknown>';
    }
  }
  // Handle primitives
  else {
    const typeMap: Record<string, string> = {
      string: 'string',
      number: 'number',
      integer: 'number',
      boolean: 'boolean',
      null: 'null',
    };
    tsType = typeMap[schema.type] || 'unknown';
  }

  // Add nullable
  if (schema.nullable) {
    tsType = `${tsType} | null`;
  }

  return tsType;
}

/**
 * Format JSDoc comment
 */
function formatJSDocComment(
  description: string,
  example?: unknown,
  options?: Required<InterfaceGenerationOptions>
): string {
  const lines: string[] = ['/**'];

  // Add description
  description.split('\n').forEach((line) => {
    lines.push(` * ${line}`);
  });

  // Add example
  if (options?.includeExamples && example !== undefined) {
    lines.push(` * @example ${JSON.stringify(example)}`);
  }

  lines.push(' */');

  return lines.join('\n');
}

/**
 * Generate combined code from all interfaces
 */
function generateCombinedCode(interfaces: GeneratedInterface[]): string {
  const lines: string[] = [];

  // Add header comment
  lines.push('/**');
  lines.push(' * TypeScript interfaces generated from OpenAPI schemas');
  lines.push(' * @generated Do not edit manually');
  lines.push(' */');
  lines.push('');

  // Add interfaces
  interfaces.forEach((iface) => {
    lines.push(iface.code);
    lines.push('');
  });

  return lines.join('\n');
}
