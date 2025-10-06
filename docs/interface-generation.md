# TypeScript Interface Generation Guide

**OpenAPI-to-MCP Generator Project**
**Version:** 1.0
**Last Updated:** 2025-01-05

---

## Purpose

This guide documents the TypeScript interface generation system that converts OpenAPI schemas to type-safe TypeScript interfaces. It provides comprehensive information on type mapping, composition handling, and configuration options.

---

## Table of Contents

1. [Overview](#overview)
2. [Type Mapping Rules](#type-mapping-rules)
3. [Composition Handling](#composition-handling)
4. [Configuration Options](#configuration-options)
5. [Usage Examples](#usage-examples)
6. [Advanced Scenarios](#advanced-scenarios)
7. [Troubleshooting](#troubleshooting)

---

## Overview

### Interface Generation Pipeline

```
┌────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│ OpenAPI Schema │ → │ Type Mapping    │ → │ TypeScript       │
│ (Normalized)   │    │ & Composition   │    │ Interface Code   │
└────────────────┘    └─────────────────┘    └──────────────────┘
```

### Key Features

- ✅ **Complete Type Mapping**: All OpenAPI types to TypeScript equivalents
- ✅ **Nullable Support**: Automatic `T | null` union generation
- ✅ **Enum Handling**: String literal unions for enums
- ✅ **Nested Objects**: Automatic interface extraction
- ✅ **Array Types**: Support for primitives, objects, and tuples
- ✅ **Composition**: AllOf (intersection), OneOf/AnyOf (union)
- ✅ **Discriminated Unions**: Type-safe discriminator support
- ✅ **JSDoc Comments**: Descriptions, examples, and format annotations
- ✅ **Import Management**: Automatic dependency tracking

---

## Type Mapping Rules

### Primitive Types

| OpenAPI Type | Format | TypeScript Type |
|--------------|--------|-----------------|
| `string` | - | `string` |
| `string` | `date-time` | `string` |
| `string` | `date` | `string` |
| `string` | `uuid` | `string` |
| `string` | `email` | `string` |
| `string` | `uri` | `string` |
| `string` | `binary` | `Buffer` |
| `number` | - | `number` |
| `integer` | - | `number` |
| `boolean` | - | `boolean` |
| `null` | - | `null` |
| unknown | - | `unknown` |

### Complex Types

#### Arrays

**Simple Array:**
```yaml
# OpenAPI
type: array
items:
  type: string
```
```typescript
// TypeScript
string[]
```

**Object Array:**
```yaml
# OpenAPI
type: array
items:
  $ref: '#/components/schemas/User'
```
```typescript
// TypeScript
User[]
```

**Tuple (Fixed Length):**
```yaml
# OpenAPI
type: array
items:
  type: string
minItems: 2
maxItems: 2
```
```typescript
// TypeScript
[string, string]
```

#### Objects

**Inline Object:**
```yaml
# OpenAPI
type: object
properties:
  id:
    type: string
  name:
    type: string
required:
  - id
```
```typescript
// TypeScript
export interface ObjectName {
  id: string;
  name?: string;
}
```

**Nested Object:**
```yaml
# OpenAPI
type: object
properties:
  profile:
    type: object
    properties:
      bio:
        type: string
```
```typescript
// TypeScript
export interface UserProfile {
  bio?: string;
}

export interface User {
  profile?: UserProfile;
}
```

#### Enums

**String Enum:**
```yaml
# OpenAPI
type: string
enum:
  - active
  - inactive
  - pending
```
```typescript
// TypeScript
'active' | 'inactive' | 'pending'
```

**Numeric Enum:**
```yaml
# OpenAPI
type: integer
enum:
  - 1
  - 2
  - 3
```
```typescript
// TypeScript
1 | 2 | 3
```

---

## Composition Handling

### AllOf (Intersection Types)

**Scenario 1: Merge Properties**
```yaml
# OpenAPI
allOf:
  - type: object
    properties:
      id:
        type: string
  - type: object
    properties:
      name:
        type: string
```
```typescript
// TypeScript
export interface Combined {
  id?: string;
  name?: string;
}
```

**Scenario 2: Extend Interface**
```yaml
# OpenAPI
allOf:
  - $ref: '#/components/schemas/BaseUser'
  - type: object
    properties:
      role:
        type: string
```
```typescript
// TypeScript
export interface Extended extends BaseUser {
  role?: string;
}
```

### OneOf (Union Types)

**Simple Union:**
```yaml
# OpenAPI
oneOf:
  - type: string
  - type: number
```
```typescript
// TypeScript
string | number
```

**Discriminated Union:**
```yaml
# OpenAPI
discriminator:
  propertyName: petType
oneOf:
  - $ref: '#/components/schemas/Cat'
  - $ref: '#/components/schemas/Dog'

# Cat schema
properties:
  petType:
    type: string
    enum: [cat]
  meow:
    type: string

# Dog schema
properties:
  petType:
    type: string
    enum: [dog]
  bark:
    type: string
```
```typescript
// TypeScript
export type Pet = Cat | Dog;

export interface Cat {
  petType: 'cat';
  meow?: string;
}

export interface Dog {
  petType: 'dog';
  bark?: string;
}
```

### AnyOf (Union Types)

**Flexible Union:**
```yaml
# OpenAPI
anyOf:
  - type: string
  - type: number
  - type: boolean
```
```typescript
// TypeScript
string | number | boolean
```

---

## Configuration Options

### InterfaceGenerationOptions

```typescript
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
```

### Default Configuration

```typescript
const defaultOptions: Required<InterfaceGenerationOptions> = {
  outputMode: 'single-file',
  arrayStyle: 'bracket',      // T[] instead of Array<T>
  includeComments: true,       // Include JSDoc
  includeExamples: true,       // Include @example tags
  exportAll: true,             // Export all interfaces
};
```

---

## Usage Examples

### Basic Usage

```typescript
import { generateInterfaces } from '@openapi-to-mcp/generator';

// Schema map from parser
const schemas: SchemaMap = {
  User: {
    name: 'User',
    type: 'object',
    properties: {
      id: { name: 'id', type: 'string' },
      email: { name: 'email', type: 'string', format: 'email' },
      age: { name: 'age', type: 'integer', nullable: true },
    },
    required: ['id', 'email'],
  },
};

// Generate interfaces
const result = generateInterfaces(schemas);

console.log(result.code);
```

**Output:**
```typescript
/**
 * User
 */
export interface User {
  id: string;
  email: string;
  age?: number | null;
}
```

### With Options

```typescript
const result = generateInterfaces(schemas, {
  outputMode: 'single-file',
  arrayStyle: 'generic',      // Use Array<T>
  includeComments: true,
  includeExamples: true,
  exportAll: true,
});
```

### Custom Array Style

```typescript
// Bracket style (default)
const result1 = generateInterfaces(schemas, {
  arrayStyle: 'bracket',
});
// Output: users: User[]

// Generic style
const result2 = generateInterfaces(schemas, {
  arrayStyle: 'generic',
});
// Output: users: Array<User>
```

### Output Modes

#### Single File (Default)
```typescript
const result = generateInterfaces(schemas, {
  outputMode: 'single-file',
});
// Output: All interfaces in one file
```

#### By Tag
```typescript
const result = generateInterfaces(schemas, {
  outputMode: 'by-tag',
});
// Output: Grouped by OpenAPI tags
```

#### Per Schema
```typescript
const result = generateInterfaces(schemas, {
  outputMode: 'per-schema',
});
// Output: One file per interface
```

---

## Advanced Scenarios

### Nullable Handling

**Nullable Property:**
```yaml
# OpenAPI
properties:
  value:
    type: string
    nullable: true
```
```typescript
// TypeScript
value?: string | null;
```

**Nullable Array:**
```yaml
# OpenAPI
properties:
  items:
    type: array
    items:
      type: string
    nullable: true
```
```typescript
// TypeScript
items?: string[] | null;
```

### Required vs Optional

**Required Property:**
```yaml
# OpenAPI
properties:
  id:
    type: string
required:
  - id
```
```typescript
// TypeScript
id: string; // No question mark
```

**Optional Property:**
```yaml
# OpenAPI
properties:
  name:
    type: string
# Not in required array
```
```typescript
// TypeScript
name?: string; // Question mark present
```

### Nested Objects

**Deep Nesting:**
```yaml
# OpenAPI
User:
  type: object
  properties:
    profile:
      type: object
      properties:
        settings:
          type: object
          properties:
            theme:
              type: string
```
```typescript
// TypeScript
export interface UserProfileSettings {
  theme?: string;
}

export interface UserProfile {
  settings?: UserProfileSettings;
}

export interface User {
  profile?: UserProfile;
}
```

### JSDoc Comments

**Full Documentation:**
```yaml
# OpenAPI
User:
  type: object
  description: User account information
  properties:
    email:
      type: string
      format: email
      description: User email address
      example: user@example.com
```
```typescript
// TypeScript
/**
 * User account information
 */
export interface User {
  /**
   * User email address
   * @format email
   * @example user@example.com
   */
  email?: string;
}
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Unknown Types Default to `unknown`

**Problem:** Schema has unrecognized type

**Solution:** The generator safely defaults to `unknown` instead of `any` for type safety. If this is intentional, no action needed. If not, check your OpenAPI schema for typos.

```typescript
// Schema with typo
{
  type: 'strnig' // typo
}

// Generated (safe default)
property?: unknown;
```

#### Issue 2: Circular Dependencies

**Problem:** Schemas reference each other in a circular manner

**Solution:** The generator uses type-only imports to break circular dependencies:

```typescript
// Generated with type-only import
import type { User } from './User';

export interface Post {
  author?: User;
}
```

#### Issue 3: Name Collisions

**Problem:** Nested objects create naming conflicts

**Solution:** The generator uses parent-child naming:

```yaml
# OpenAPI
User:
  properties:
    profile:
      type: object

Profile:
  type: object
```
```typescript
// TypeScript (no collision)
export interface UserProfile { /* ... */ }
export interface Profile { /* ... */ }
```

#### Issue 4: Missing Imports

**Problem:** Generated code references undefined types

**Solution:** The generator automatically tracks dependencies:

```typescript
// Automatically generated imports
import type { Address } from './types';

export interface User {
  address?: Address;
}
```

### Performance Optimization

#### Large Schema Sets (200+ schemas)

**Target:** < 1 second for 200 schemas

**Current Performance:** ~4ms for typical test suite

**Optimization Tips:**
1. Use `outputMode: 'single-file'` for faster generation
2. Set `includeComments: false` if comments not needed
3. Disable examples with `includeExamples: false` for large schemas

**Benchmark Example:**
```typescript
import { generateInterfaces } from '@openapi-to-mcp/generator';

const start = performance.now();
const result = generateInterfaces(largeSchemaSet, {
  outputMode: 'single-file',
  includeComments: false,
  includeExamples: false,
});
const end = performance.now();

console.log(`Generated ${result.interfaces.length} interfaces in ${end - start}ms`);
// Typical: "Generated 250 interfaces in 15ms"
```

---

## API Reference

### generateInterfaces()

```typescript
function generateInterfaces(
  schemas: SchemaMap,
  options?: InterfaceGenerationOptions
): InterfaceGenerationResult;
```

**Parameters:**
- `schemas`: Record of OpenAPI schemas from parser
- `options`: Optional generation configuration

**Returns:**
- `interfaces`: Array of generated interface objects
- `imports`: Array of import statements
- `code`: Combined TypeScript code string

**Example:**
```typescript
const result = generateInterfaces(schemas);

// Access individual interfaces
result.interfaces.forEach(iface => {
  console.log(iface.name);
  console.log(iface.code);
});

// Access combined code
fs.writeFileSync('types.ts', result.code);
```

### Types

#### SchemaMap
```typescript
type SchemaMap = Record<string, NormalizedSchema>;
```

#### NormalizedSchema
```typescript
interface NormalizedSchema {
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
```

#### GeneratedInterface
```typescript
interface GeneratedInterface {
  name: string;
  code: string;
  dependencies: string[];
  sourceSchema: string;
  comment?: string;
}
```

#### InterfaceGenerationResult
```typescript
interface InterfaceGenerationResult {
  interfaces: GeneratedInterface[];
  imports: string[];
  code: string;
}
```

---

## Related Documents

- **[Code Generation Architecture](./generation-architecture.md)** - Overall generator system
- **[Coding Standards](./architecture/coding-standards.md)** - TypeScript conventions
- **[Tech Stack](./architecture/tech-stack.md)** - Technology decisions

---

## Testing

### Test Coverage

The interface generator has **94.62% test coverage** with comprehensive scenarios:

**Test Scenarios:**
- ✅ Basic type mapping (string, number, boolean, unknown)
- ✅ Nullable types (`T | null`)
- ✅ Enum generation (string literal unions)
- ✅ Required vs optional properties
- ✅ Nested objects
- ✅ Array types (primitives, objects, tuples)
- ✅ AllOf intersection types
- ✅ OneOf/AnyOf union types
- ✅ Discriminated unions
- ✅ JSDoc comments

### Running Tests

```bash
# Run interface generator tests
npm test -- interface-generator

# Run with coverage
npm test -- --coverage interface-generator
```

---

**Document Status:** ✅ Active - Interface generation reference
**Maintenance:** Update when type mapping rules change
**Review Frequency:** After each Epic completion

---

*Generated for Story 3.2: TypeScript Interface Generation from OpenAPI Schemas*
