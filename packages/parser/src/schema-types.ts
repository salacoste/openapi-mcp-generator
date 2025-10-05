/**
 * Type definitions for schema extraction and normalization
 * @module schema-types
 */

/**
 * Schema types supported in normalized output
 */
export type SchemaType =
  | 'object'
  | 'array'
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'union'
  | 'null';

/**
 * Normalized schema object ready for code generation
 */
export interface NormalizedSchema {
  /** Unique schema name */
  name: string;
  /** Schema type */
  type: SchemaType;
  /** Object properties (for type: 'object') */
  properties?: Record<string, PropertySchema>;
  /** Required property names */
  required?: string[];
  /** Array items schema (for type: 'array') */
  items?: NormalizedSchema;
  /** Enum values (for enum types) */
  enum?: (string | number)[];
  /** Schema description */
  description?: string;
  /** Example value */
  example?: unknown;
  /** Format hint (date-time, email, uuid, etc.) */
  format?: string;
  /** Schema-level constraints */
  constraints?: SchemaConstraints;
  /** Composition metadata (allOf, oneOf, anyOf) */
  composition?: CompositionMetadata;
  /** Additional metadata */
  metadata?: {
    /** Original name from OpenAPI */
    originalName?: string;
    /** Where schema was extracted from */
    location?: string;
    /** Parent schema name (for nested schemas) */
    parent?: string;
  };
}

/**
 * Property schema definition
 */
export interface PropertySchema {
  /** Property type */
  type: string;
  /** Property description */
  description?: string;
  /** Format hint */
  format?: string;
  /** Enum values */
  enum?: (string | number)[];
  /** Default value */
  default?: unknown;
  /** Is this property required? */
  required: boolean;
  /** Can be null? */
  nullable?: boolean;
  /** Property constraints */
  constraints?: PropertyConstraints;
  /** Items schema for array properties */
  items?: PropertySchema;
}

/**
 * Composition metadata for allOf/oneOf/anyOf
 */
export interface CompositionMetadata {
  /** Composition type */
  type: 'allOf' | 'oneOf' | 'anyOf';
  /** Schema names that are composed */
  schemas: string[];
  /** Discriminator information (for oneOf/anyOf) */
  discriminator?: DiscriminatorInfo;
  /** Was composition merged (allOf) or preserved (oneOf/anyOf)? */
  merged: boolean;
}

/**
 * Discriminator information for union types
 */
export interface DiscriminatorInfo {
  /** Property that discriminates between options */
  propertyName: string;
  /** Value to schema name mapping */
  mapping?: Record<string, string>;
}

/**
 * Schema-level constraints
 */
export interface SchemaConstraints {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;
  multipleOf?: number;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  minProperties?: number;
  maxProperties?: number;
}

/**
 * Property-level constraints
 */
export interface PropertyConstraints {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;
  multipleOf?: number;
}

/**
 * Map of schema names to normalized schemas
 */
export type SchemaMap = Map<string, NormalizedSchema>;
