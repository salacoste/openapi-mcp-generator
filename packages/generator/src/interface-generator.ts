/**
 * TypeScript interface generator from OpenAPI schemas
 * Converts OpenAPI schemas to type-safe TypeScript interfaces
 */

import type { NormalizedSchema, PropertySchema } from '@openapi-to-mcp/parser';

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
 * Schema map for interface generation
 * Uses parser's NormalizedSchema type
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
  // Support both normalized format (schema.composition) and raw OpenAPI format (schema.allOf/oneOf/anyOf)
  if (schema.composition || (schema as any).allOf || (schema as any).oneOf || (schema as any).anyOf) {
    const compositionInterface = generateCompositionInterface(name, schema, options);
    interfaces.push(compositionInterface);
    return interfaces;
  }

  // Generate main interface
  const mainInterface = generateObjectInterface(name, schema, allSchemas, options);
  interfaces.push(mainInterface);

  // Generate nested interfaces for object properties
  // Note: PropertySchema doesn't have 'properties', but test schemas might
  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      if (propSchema.type === 'object' && 'properties' in propSchema && propSchema.properties) {
        // This is a nested object that needs its own interface
        const nestedSchema: NormalizedSchema = {
          name: `${name}${capitalize(propName)}`,
          type: 'object',
          properties: propSchema.properties as Record<string, PropertySchema>,
          required: (propSchema as any).required,
          description: propSchema.description,
        };
        const nestedInterfaces = generateInterface(nestedSchema.name, nestedSchema, allSchemas, options);
        interfaces.push(...nestedInterfaces);
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

  // Check if schema has properties
  const hasProperties = schema.properties && Object.keys(schema.properties).length > 0;

  if (!hasProperties) {
    // For empty schemas, use type alias instead of interface to avoid ESLint errors
    lines.push(`export type ${name} = Record<string, unknown>;`);
  } else {
    // Interface declaration
    lines.push(`export interface ${name} {`);

    // Add properties
    // TypeScript knows schema.properties is defined here because of hasProperties check
    const properties = schema.properties!;
    for (const [propName, propSchema] of Object.entries(properties)) {
      const isRequired = schema.required?.includes(propName) ?? false;
      const optional = isRequired ? '' : '?';

      // Property JSDoc
      if (options.includeComments && propSchema.description) {
        lines.push(`  /** ${propSchema.description} */`);
      }

      // Property type
      const tsType = mapSchemaToTypeScript(propSchema, allSchemas, options, dependencies, name, propName);

      lines.push(`  ${propName}${optional}: ${tsType};`);
    }

    lines.push('}');
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
 * Generate composition interface (allOf, oneOf, anyOf)
 * Supports both normalized format (schema.composition) and raw OpenAPI format
 */
function generateCompositionInterface(
  name: string,
  schema: NormalizedSchema,
  options: Required<InterfaceGenerationOptions>
): GeneratedInterface {
  const lines: string[] = [];
  const dependencies: string[] = [];

  // Add JSDoc comment
  if (options.includeComments && schema.description) {
    lines.push(formatJSDocComment(schema.description, schema.example, options));
  }

  // Detect composition type and schema references
  let compositionType: 'allOf' | 'oneOf' | 'anyOf' | undefined;
  let schemaNames: string[] = [];

  // Check for normalized format
  if (schema.composition) {
    compositionType = schema.composition.type;
    schemaNames = schema.composition.schemas;
  }
  // Check for raw OpenAPI format
  else {
    const rawSchema = schema as any;
    if (rawSchema.allOf) {
      compositionType = 'allOf';
      schemaNames = extractSchemaNames(rawSchema.allOf);
    } else if (rawSchema.oneOf) {
      compositionType = 'oneOf';
      schemaNames = extractSchemaNames(rawSchema.oneOf);
    } else if (rawSchema.anyOf) {
      compositionType = 'anyOf';
      schemaNames = extractSchemaNames(rawSchema.anyOf);
    }
  }

  if (!compositionType || schemaNames.length === 0) {
    // Fallback - should not happen
    lines.push(`export interface ${name} {}`);
    return {
      name,
      code: lines.join('\n'),
      dependencies,
      sourceSchema: name,
      comment: schema.description,
    };
  }

  // Add schema names to dependencies
  dependencies.push(...schemaNames);

  // Handle allOf (intersection)
  if (compositionType === 'allOf') {
    lines.push(`export type ${name} = ${schemaNames.join(' & ')};`);
  }
  // Handle oneOf/anyOf (union)
  else if (compositionType === 'oneOf' || compositionType === 'anyOf') {
    lines.push(`export type ${name} = ${schemaNames.join(' | ')};`);
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
 * Handles both NormalizedSchema and PropertySchema from parser
 */
function mapSchemaToTypeScript(
  schema: NormalizedSchema | PropertySchema,
  allSchemas: SchemaMap,
  options: Required<InterfaceGenerationOptions>,
  dependencies: string[],
  parentName?: string,
  propertyName?: string
): string {
  let tsType: string;

  // Handle enum
  if (schema.enum) {
    if (typeof schema.enum[0] === 'string') {
      tsType = schema.enum.map((v) => `'${v}'`).join(' | ');
    } else {
      tsType = schema.enum.join(' | ');
    }
  }
  // Handle array
  else if (schema.type === 'array' && schema.items) {
    // Check for tuple type (fixed-length array with minItems === maxItems)
    // Check both raw schema properties and constraints object
    let minItems: number | undefined;
    let maxItems: number | undefined;

    // PropertySchema has PropertyConstraints (no minItems/maxItems)
    // NormalizedSchema has SchemaConstraints (has minItems/maxItems)
    // Raw test schemas may have minItems/maxItems directly
    if ('minItems' in schema) {
      minItems = (schema as any).minItems;
    } else if ('constraints' in schema && schema.constraints && 'minItems' in schema.constraints) {
      minItems = (schema.constraints as any).minItems;
    }

    if ('maxItems' in schema) {
      maxItems = (schema as any).maxItems;
    } else if ('constraints' in schema && schema.constraints && 'maxItems' in schema.constraints) {
      maxItems = (schema.constraints as any).maxItems;
    }

    if (minItems !== undefined && maxItems !== undefined && minItems === maxItems && minItems > 0) {
      // Generate tuple type [T, T, ...]
      const itemType = mapSchemaToTypeScript(schema.items, allSchemas, options, dependencies);
      const tupleTypes = Array(minItems).fill(itemType);
      tsType = `[${tupleTypes.join(', ')}]`;
    } else {
      // Regular array
      const itemType = mapSchemaToTypeScript(schema.items, allSchemas, options, dependencies);
      tsType = options.arrayStyle === 'bracket' ? `${itemType}[]` : `Array<${itemType}>`;
    }
  }
  // Handle object
  else if (schema.type === 'object') {
    // Check if this is a nested object with properties
    // Use 'properties' check to identify nested objects (test schemas may have this)
    if ('properties' in schema && schema.properties && parentName && propertyName) {
      // Reference the nested interface that will be generated
      tsType = `${parentName}${capitalize(propertyName)}`;
      dependencies.push(tsType);
    }
    // NormalizedSchema has name property
    else if ('name' in schema && schema.name) {
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

  // Add nullable (only PropertySchema has this property)
  if ('nullable' in schema && schema.nullable) {
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

/**
 * Extract schema names from OpenAPI $ref objects
 * Supports both { $ref: '#/components/schemas/Name' } and plain schema names
 */
function extractSchemaNames(refs: any[]): string[] {
  return refs.map((ref) => {
    if (typeof ref === 'string') {
      return ref;
    }
    if (ref.$ref) {
      // Extract schema name from $ref path
      const parts = ref.$ref.split('/');
      return parts[parts.length - 1] || '';
    }
    return '';
  }).filter(Boolean);
}

/**
 * Capitalize first letter of a string
 */
function capitalize(str: string): string {
  if (!str) {return '';}
  return str.charAt(0).toUpperCase() + str.slice(1);
}
