# Components Object

[◀ Back to Index](./README.md) | [◀ Prev: Server Object](./03-server-object.md) | [Next: Paths & Operations ▶](./05-paths-operations.md)

---

## Specification

Components Object содержит reusable объекты для различных аспектов API.

⚠️ **Important:** Объекты в components НЕ имеют эффекта пока не referenced через `$ref`.

## Fixed Fields

| Field | Description |
|-------|-------------|
| `schemas` | Reusable Schema Objects для типов данных |
| `responses` | Reusable Response Objects |
| `parameters` | Reusable Parameter Objects |
| `requestBodies` | Reusable Request Body Objects |
| `securitySchemes` | Reusable Security Scheme Objects |
| `examples` | Reusable Example Objects |
| `headers` | Reusable Header Objects |
| `links` | Reusable Link Objects |
| `callbacks` | Reusable Callback Objects |

**Key Naming:** Must match `^[a-zA-Z0-9\.\-_]+$`

---

## Ozon API Analysis

```python
Components sections in Ozon API:
  - schemas: 87 items        ← TypeScript type generation
  - requestBodies: 11 items  ← Request type definitions
```

**What Ozon Uses:**
- ✅ **schemas** (87) — Critical for TypeScript types
- ✅ **requestBodies** (11) — POST/PUT operations
- ❌ securitySchemes, parameters, responses — Not in components

---

## Schema Examples from Ozon

### Simple Enum
```json
{
  "CampaignType": {
    "type": "string",
    "enum": ["CPC", "CPM", "CPO"],
    "description": "Тип оплаты"
  }
}
```

### Complex Object with $ref
```json
{
  "Campaign": {
    "type": "object",
    "properties": {
      "id": { "type": "string", "format": "uint64" },
      "paymentType": { "$ref": "#/components/schemas/CampaignType" },
      "title": { "type": "string" }
    }
  }
}
```

---

## Reference Object

A simple object to allow referencing other components in the specification, internally and externally.

The Reference Object is defined by **JSON Reference** and follows the same structure, behavior and rules.

**Important:** For this specification, reference resolution is accomplished as defined by the **JSON Reference specification** and not by the JSON Schema specification.

### Fixed Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `$ref` | string | ✅ REQUIRED | The reference string |

**Extension Support:** This object **CANNOT be extended** with additional properties and any properties added SHALL be ignored.

### Reference Types

**Internal Component Reference:**
```json
{
  "$ref": "#/components/schemas/Pet"
}
```

**Relative Schema Document:**
```json
{
  "$ref": "Pet.json"
}
```

```yaml
$ref: Pet.yaml
```

**Relative Documents With Embedded Schema:**
```json
{
  "$ref": "definitions.json#/Pet"
}
```

```yaml
$ref: definitions.yaml#/Pet
```

**Reference Resolution:**
- `#/components/schemas/Pet` → Internal reference within same document
- `Pet.json` → External file reference (relative path)
- `definitions.json#/Pet` → External file with JSON Pointer to specific schema
- `https://api.example.com/openapi.json#/components/schemas/Pet` → Absolute URL reference

---

## Schema Object

The Schema Object allows the definition of input and output data types. These types can be objects, but also primitives and arrays.

This object is an **extended subset** of the **JSON Schema Specification Wright Draft 00**.

**Reference:** [JSON Schema Core](http://json-schema.org/latest/json-schema-core.html) and [JSON Schema Validation](http://json-schema.org/latest/json-schema-validation.html)

### Properties from JSON Schema

The following properties are taken **directly** from the JSON Schema definition and follow the same specifications:

| Property | Type | Description |
|----------|------|-------------|
| `title` | string | Schema title |
| `multipleOf` | number | Number must be multiple of this value |
| `maximum` | number | Maximum value (inclusive) |
| `exclusiveMaximum` | boolean | Whether maximum is exclusive |
| `minimum` | number | Minimum value (inclusive) |
| `exclusiveMinimum` | boolean | Whether minimum is exclusive |
| `maxLength` | integer | Maximum string length |
| `minLength` | integer | Minimum string length |
| `pattern` | string | Regular expression pattern (ECMA-262 Edition 5.1) |
| `maxItems` | integer | Maximum array items |
| `minItems` | integer | Minimum array items |
| `uniqueItems` | boolean | Whether array items must be unique |
| `maxProperties` | integer | Maximum object properties |
| `minProperties` | integer | Minimum object properties |
| `required` | [string] | Required property names |
| `enum` | [any] | Enumeration of valid values |

### OpenAPI-Modified JSON Schema Properties

The following properties are taken from JSON Schema but **adjusted** for OpenAPI:

| Property | OpenAPI Modification |
|----------|---------------------|
| `type` | Value MUST be a **string**. Multiple types via an array are **NOT supported** |
| `allOf` | Inline or referenced schema MUST be **Schema Object** (not standard JSON Schema) |
| `oneOf` | Inline or referenced schema MUST be **Schema Object** (not standard JSON Schema) |
| `anyOf` | Inline or referenced schema MUST be **Schema Object** (not standard JSON Schema) |
| `not` | Inline or referenced schema MUST be **Schema Object** (not standard JSON Schema) |
| `items` | Value MUST be an **object** (not array). MUST be **Schema Object**. **REQUIRED** if type is `array` |
| `properties` | Property definitions MUST be **Schema Object** (not standard JSON Schema) |
| `additionalProperties` | Boolean or object. MUST be **Schema Object** if object. Defaults to `true` |
| `description` | CommonMark syntax MAY be used for rich text representation |
| `format` | See Data Type Formats. OAS offers additional predefined formats beyond JSON Schema |
| `default` | Value MUST conform to the defined type at the same level (e.g., if type is `string`, default cannot be `1`) |

**Note:** A **Reference Object** can be used anywhere a Schema Object can be used.

### OpenAPI-Specific Fixed Fields

Additional fields for further schema documentation:

| Field | Type | Description |
|-------|------|-------------|
| `nullable` | boolean | Adds `"null"` to allowed type (only if `type` is explicitly defined). Default: `false` |
| `discriminator` | Discriminator Object | Support for polymorphism (see Composition and Inheritance) |
| `readOnly` | boolean | Property for **response only** (SHOULD NOT be in request). Affects `required` on response only. MUST NOT be both `readOnly` and `writeOnly`. Default: `false` |
| `writeOnly` | boolean | Property for **request only** (SHOULD NOT be in response). Affects `required` on request only. MUST NOT be both `readOnly` and `writeOnly`. Default: `false` |
| `xml` | XML Object | Additional metadata for XML representation (only on property schemas) |
| `externalDocs` | External Documentation Object | Additional external documentation |
| `example` | Any | Free-form example instance. For non-JSON/YAML examples, use string with escaping |
| `deprecated` | boolean | Schema is deprecated and SHOULD be transitioned out. Default: `false` |

**Extension Support:** This object MAY be extended with Specification Extensions

### Important Constraints

**Type Constraint:**
```yaml
# ✅ Valid
type: string

# ❌ Invalid (OpenAPI doesn't support multiple types)
type: [string, number]
```

**Items Constraint:**
```yaml
# ✅ Valid
type: array
items:
  type: string

# ❌ Invalid (items must be object, not array)
type: array
items:
  - type: string
  - type: number
```

**ReadOnly/WriteOnly Constraint:**
```yaml
# ✅ Valid
properties:
  id:
    type: string
    readOnly: true

# ❌ Invalid (cannot be both)
properties:
  secret:
    type: string
    readOnly: true
    writeOnly: true
```

**Nullable Example:**
```yaml
# Allows null value
type: string
nullable: true

# Response can be: "value" or null
```

**Default Value Type Matching:**
```yaml
# ✅ Valid
type: string
default: "hello"

# ❌ Invalid (type mismatch)
type: string
default: 123
```

### Composition and Inheritance (Polymorphism)

The OpenAPI Specification allows **combining and extending** model definitions using the `allOf` property of JSON Schema, in effect offering **model composition**.

`allOf` takes an array of object definitions that are validated **independently** but together compose a single object.

**Important Notes:**
- Composition offers model extensibility but does **not** imply a hierarchy between models
- To support polymorphism, OpenAPI adds the **discriminator** field
- When used, discriminator MUST be a **required field**
- Inline schema definitions (which do not have a given id) **cannot** be used in polymorphism

**Discriminator Value Definition:**
1. Use the schema name (default)
2. Override the schema name by overriding the property with a new value (takes precedence)

### XML Modeling

The `xml` property allows extra definitions when translating the JSON definition to XML. See XML Object section below for complete details.

---

## XML Object

A metadata object that allows for more fine-tuned XML model definitions.

**Important:** When using arrays, XML element names are **not inferred** (for singular/plural forms) and the `name` property SHOULD be used to add that information.

### Fixed Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Replaces the name of the element/attribute used for the described schema property. When defined within `items`, it affects the name of individual XML elements within the list. When defined alongside `type: array` (outside `items`), it affects the wrapping element only if `wrapped` is `true`. If `wrapped` is `false`, it will be ignored. |
| `namespace` | string | The URI of the namespace definition. Value MUST be in the form of an **absolute URI**. |
| `prefix` | string | The prefix to be used for the name. |
| `attribute` | boolean | Declares whether the property definition translates to an **attribute** instead of an element. Default: `false` |
| `wrapped` | boolean | MAY be used only for an **array definition**. Signifies whether the array is wrapped (e.g., `<books><book/><book/></books>`) or unwrapped (`<book/><book/>`). Default: `false`. Takes effect only when defined alongside `type: array` (outside `items`). |

**Extension Support:** This object MAY be extended with Specification Extensions

### XML Object Examples

#### No XML Element

**Basic string property:**
```yaml
animals:
  type: string
```

```xml
<animals>...</animals>
```

**Basic string array property** (wrapped is false by default):
```yaml
animals:
  type: array
  items:
    type: string
```

```xml
<animals>...</animals>
<animals>...</animals>
<animals>...</animals>
```

#### XML Name Replacement

```yaml
animals:
  type: string
  xml:
    name: animal
```

```xml
<animal>...</animal>
```

#### XML Attribute, Prefix and Namespace

Full model definition with attributes and namespaces:

```yaml
Person:
  type: object
  properties:
    id:
      type: integer
      format: int32
      xml:
        attribute: true
    name:
      type: string
      xml:
        namespace: http://example.com/schema/sample
        prefix: sample
```

```xml
<Person id="123">
    <sample:name xmlns:sample="http://example.com/schema/sample">example</sample:name>
</Person>
```

**Explanation:**
- `id` becomes an **attribute** (`id="123"`)
- `name` becomes an element with **namespace prefix** (`sample:name`)
- Namespace declaration (`xmlns:sample="..."`) is automatically added

#### XML Arrays

**Changing element names:**
```yaml
animals:
  type: array
  items:
    type: string
    xml:
      name: animal
```

```xml
<animal>value</animal>
<animal>value</animal>
```

**External name property has no effect on unwrapped arrays:**
```yaml
animals:
  type: array
  items:
    type: string
    xml:
      name: animal
  xml:
    name: aliens  # ← No effect because wrapped: false (default)
```

```xml
<animal>value</animal>
<animal>value</animal>
```

**Wrapped array without explicit item names** (same name used internally and externally):
```yaml
animals:
  type: array
  items:
    type: string
  xml:
    wrapped: true
```

```xml
<animals>
  <animals>value</animals>
  <animals>value</animals>
</animals>
```

⚠️ **Problem:** Both wrapper and items use same name (`animals`)

**Solution - Wrapped array with explicit item names:**
```yaml
animals:
  type: array
  items:
    type: string
    xml:
      name: animal  # ← Individual item name
  xml:
    wrapped: true
```

```xml
<animals>
  <animal>value</animal>
  <animal>value</animal>
</animals>
```

✅ **Correct:** Wrapper is `animals`, items are `animal`

**Affecting both internal and external names:**
```yaml
animals:
  type: array
  items:
    type: string
    xml:
      name: animal  # ← Item name
  xml:
    name: aliens    # ← Wrapper name
    wrapped: true
```

```xml
<aliens>
  <animal>value</animal>
  <animal>value</animal>
</aliens>
```

**Changing external element but not internal ones:**
```yaml
animals:
  type: array
  items:
    type: string  # ← No xml.name, defaults to parent name
  xml:
    name: aliens
    wrapped: true
```

```xml
<aliens>
  <aliens>value</aliens>
  <aliens>value</aliens>
</aliens>
```

⚠️ **Problem:** Items inherit wrapper name when not explicitly set

### XML Name Resolution Rules

| Scenario | items.xml.name | array.xml.name | array.xml.wrapped | Item Element Name | Wrapper Element Name |
|----------|----------------|----------------|-------------------|-------------------|----------------------|
| Default unwrapped | Not set | Not set | `false` (default) | Property name | N/A (no wrapper) |
| Named items | `animal` | Not set | `false` (default) | `animal` | N/A (no wrapper) |
| Wrapped, no item name | Not set | Not set | `true` | Property name | Property name |
| Wrapped, with item name | `animal` | Not set | `true` | `animal` | Property name |
| Wrapped, both names | `animal` | `aliens` | `true` | `animal` | `aliens` |
| Wrapped, wrapper only | Not set | `aliens` | `true` | `aliens` | `aliens` |

### XML Best Practices

**1. Always name array items:**
```yaml
# ✅ Recommended
animals:
  type: array
  items:
    type: string
    xml:
      name: animal
  xml:
    wrapped: true
```

**2. Use attributes for IDs and metadata:**
```yaml
# ✅ Good practice
Book:
  type: object
  properties:
    id:
      type: integer
      xml:
        attribute: true
    title:
      type: string
```

```xml
<Book id="123">
  <title>OpenAPI Guide</title>
</Book>
```

**3. Use namespaces for schema versioning:**
```yaml
# ✅ Good for versioned schemas
User:
  type: object
  properties:
    name:
      type: string
      xml:
        namespace: http://api.example.com/v2/schema
        prefix: v2
```

**4. Avoid ambiguous array names:**
```yaml
# ❌ Ambiguous
items:
  type: array
  items:
    type: string
  xml:
    wrapped: true

# ✅ Clear
items:
  type: array
  items:
    type: string
    xml:
      name: item
  xml:
    wrapped: true
```

---

## Schema Object Examples

### Primitive Sample

```json
{
  "type": "string",
  "format": "email"
}
```

```yaml
type: string
format: email
```

### Simple Model

```json
{
  "type": "object",
  "required": ["name"],
  "properties": {
    "name": {
      "type": "string"
    },
    "address": {
      "$ref": "#/components/schemas/Address"
    },
    "age": {
      "type": "integer",
      "format": "int32",
      "minimum": 0
    }
  }
}
```

```yaml
type: object
required:
  - name
properties:
  name:
    type: string
  address:
    $ref: '#/components/schemas/Address'
  age:
    type: integer
    format: int32
    minimum: 0
```

### Model with Map/Dictionary Properties

**Simple string to string mapping:**
```json
{
  "type": "object",
  "additionalProperties": {
    "type": "string"
  }
}
```

```yaml
type: object
additionalProperties:
  type: string
```

**String to model mapping:**
```json
{
  "type": "object",
  "additionalProperties": {
    "$ref": "#/components/schemas/ComplexModel"
  }
}
```

```yaml
type: object
additionalProperties:
  $ref: '#/components/schemas/ComplexModel'
```

### Model with Example

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "format": "int64"
    },
    "name": {
      "type": "string"
    }
  },
  "required": ["name"],
  "example": {
    "name": "Puma",
    "id": 1
  }
}
```

```yaml
type: object
properties:
  id:
    type: integer
    format: int64
  name:
    type: string
required:
  - name
example:
  name: Puma
  id: 1
```

### Models with Composition

```json
{
  "components": {
    "schemas": {
      "ErrorModel": {
        "type": "object",
        "required": ["message", "code"],
        "properties": {
          "message": {
            "type": "string"
          },
          "code": {
            "type": "integer",
            "minimum": 100,
            "maximum": 600
          }
        }
      },
      "ExtendedErrorModel": {
        "allOf": [
          {
            "$ref": "#/components/schemas/ErrorModel"
          },
          {
            "type": "object",
            "required": ["rootCause"],
            "properties": {
              "rootCause": {
                "type": "string"
              }
            }
          }
        ]
      }
    }
  }
}
```

```yaml
components:
  schemas:
    ErrorModel:
      type: object
      required:
        - message
        - code
      properties:
        message:
          type: string
        code:
          type: integer
          minimum: 100
          maximum: 600
    ExtendedErrorModel:
      allOf:
        - $ref: '#/components/schemas/ErrorModel'
        - type: object
          required:
            - rootCause
          properties:
            rootCause:
              type: string
```

**Result:** `ExtendedErrorModel` inherits all properties from `ErrorModel` and adds `rootCause`.

### Models with Polymorphism Support

```yaml
components:
  schemas:
    Pet:
      type: object
      discriminator:
        propertyName: petType
      properties:
        name:
          type: string
        petType:
          type: string
      required:
        - name
        - petType
    Cat:  ## "Cat" will be used as the discriminator value
      description: A representation of a cat
      allOf:
        - $ref: '#/components/schemas/Pet'
        - type: object
          properties:
            huntingSkill:
              type: string
              description: The measured skill for hunting
              enum:
                - clueless
                - lazy
                - adventurous
                - aggressive
          required:
            - huntingSkill
    Dog:  ## "Dog" will be used as the discriminator value
      description: A representation of a dog
      allOf:
        - $ref: '#/components/schemas/Pet'
        - type: object
          properties:
            packSize:
              type: integer
              format: int32
              description: the size of the pack the dog is from
              default: 0
              minimum: 0
          required:
            - packSize
```

**Payload Example:**
```json
{
  "name": "Fluffy",
  "petType": "Cat",
  "huntingSkill": "lazy"
}
```

The `petType` field indicates which schema to use for validation.

---

## Discriminator Object

When request bodies or response payloads may be one of a number of different schemas, a discriminator object can be used to aid in **serialization, deserialization, and validation**.

The discriminator is a specific object in a schema which is used to inform the consumer of the specification of an **alternative schema** based on the value associated with it.

**Important:** When using the discriminator, **inline schemas will not be considered**.

### Fixed Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `propertyName` | string | ✅ REQUIRED | The name of the property in the payload that will hold the discriminator value |
| `mapping` | Map[string, string] | Optional | Mappings between payload values and schema names or references |

**Legal Context:** The discriminator object is legal **only when using** one of the composite keywords: `oneOf`, `anyOf`, `allOf`

### Discriminator with oneOf

```yaml
MyResponseType:
  oneOf:
    - $ref: '#/components/schemas/Cat'
    - $ref: '#/components/schemas/Dog'
    - $ref: '#/components/schemas/Lizard'
  discriminator:
    propertyName: petType
```

**Behavior:** The payload MUST match **exactly one** of the schemas. The `petType` property acts as a **hint** to shortcut validation.

**Payload Example:**
```json
{
  "id": 12345,
  "petType": "Cat"
}
```

This indicates that the `Cat` schema should be used.

### Discriminator with Explicit Mapping

When the discriminator value doesn't match the schema name, use explicit mapping:

```yaml
MyResponseType:
  oneOf:
    - $ref: '#/components/schemas/Cat'
    - $ref: '#/components/schemas/Dog'
    - $ref: '#/components/schemas/Lizard'
    - $ref: 'https://gigantic-server.com/schemas/Monster/schema.json'
  discriminator:
    propertyName: petType
    mapping:
      dog: '#/components/schemas/Dog'
      monster: 'https://gigantic-server.com/schemas/Monster/schema.json'
```

**Mapping Rules:**
- `dog` → Maps to `#/components/schemas/Dog` (not `Dog`)
- `monster` → Maps to external schema
- Mapping keys MUST be **string values**
- Tooling MAY convert response values to strings for comparison
- If discriminator value doesn't match implicit or explicit mapping, validation SHOULD fail

### Discriminator with allOf (Parent Schema)

To avoid redundancy, the discriminator MAY be added to a **parent schema** definition:

```yaml
components:
  schemas:
    Pet:
      type: object
      required:
        - petType
      properties:
        petType:
          type: string
      discriminator:
        propertyName: petType
        mapping:
          dog: Dog
    Cat:
      allOf:
        - $ref: '#/components/schemas/Pet'
        - type: object
          properties:
            name:
              type: string
    Dog:
      allOf:
        - $ref: '#/components/schemas/Pet'
        - type: object
          properties:
            bark:
              type: string
    Lizard:
      allOf:
        - $ref: '#/components/schemas/Pet'
        - type: object
          properties:
            lovesRocks:
              type: boolean
```

**Payload Examples:**

**Cat payload:**
```json
{
  "petType": "Cat",
  "name": "misty"
}
```
→ Uses `Cat` schema

**Dog payload (with mapping):**
```json
{
  "petType": "dog",
  "bark": "soft"
}
```
→ Uses `Dog` schema (because of mapping: `dog: Dog`)

### Discriminator Best Practices

**1. All schemas must be listed explicitly:**
```yaml
# ✅ Valid - all schemas listed
oneOf:
  - $ref: '#/components/schemas/Cat'
  - $ref: '#/components/schemas/Dog'
discriminator:
  propertyName: petType
```

**2. Use with anyOf to avoid ambiguity:**
```yaml
anyOf:
  - $ref: '#/components/schemas/Cat'
  - $ref: '#/components/schemas/Dog'
discriminator:
  propertyName: petType
```

**3. Discriminator property must be required:**
```yaml
Pet:
  type: object
  required:
    - petType  # ← REQUIRED
  properties:
    petType:
      type: string
  discriminator:
    propertyName: petType
```

---

## $ref Resolution

### Reference Format

`#/components/schemas/SchemaName`

### Resolution Engine

```typescript
function resolveReference(
  ref: string,
  spec: OpenAPISpec,
  visited: Set<string> = new Set()
): any {
  // Prevent circular references
  if (visited.has(ref)) {
    throw new Error(`Circular reference: ${ref}`);
  }
  visited.add(ref);

  // Parse path: "#/components/schemas/User" → ["components", "schemas", "User"]
  const path = ref.substring(2).split('/');
  let current: any = spec;

  for (const segment of path) {
    current = current[segment];
    if (!current) throw new Error(`Reference not found: ${ref}`);
  }

  // Recursively resolve nested $refs
  if (current.$ref) {
    return resolveReference(current.$ref, spec, visited);
  }

  return current;
}
```

---

## TypeScript Type Generation

### Type Mapping

```typescript
const OPENAPI_TO_TS: Record<string, string> = {
  'string': 'string',
  'integer': 'number',
  'number': 'number',
  'boolean': 'boolean',
  'array': 'Array',
  'object': 'object'
};

const FORMAT_TO_TS: Record<string, string> = {
  'uint64': 'string',  // BigInt → use string
  'int32': 'number',
  'int64': 'number',
  'email': 'string',
  'date': 'string',
  'date-time': 'string'
};
```

### Generated Types Example

```typescript
// From Ozon API schemas

/** Тип оплаты: CPC — за клики, CPM — за показы, CPO — за заказы */
export type CampaignType = 'CPC' | 'CPM' | 'CPO';

export interface Campaign {
  /** Идентификатор кампании */
  id?: string;
  paymentType?: CampaignType;
  /** Название кампании */
  title?: string;
}
```

### Generator Implementation

```typescript
function generateTypeScriptInterface(
  name: string,
  schema: SchemaObject,
  spec: OpenAPISpec
): string {
  // Handle enums
  if (schema.enum) {
    const values = schema.enum.map(v => `'${v}'`).join(' | ');
    return `export type ${name} = ${values};\n`;
  }

  // Handle objects
  if (schema.type === 'object' && schema.properties) {
    let output = `export interface ${name} {\n`;

    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const isRequired = schema.required?.includes(propName);
      const optional = isRequired ? '' : '?';

      // Resolve $ref
      const resolved = propSchema.$ref
        ? resolveReference(propSchema.$ref, spec)
        : propSchema;

      const tsType = convertSchemaToTSType(resolved, spec);

      if (resolved.description) {
        output += `  /** ${resolved.description} */\n`;
      }

      output += `  ${propName}${optional}: ${tsType};\n`;
    }

    output += '}\n';
    return output;
  }

  return '';
}
```

---

## Implementation

### Parser

```typescript
interface ParsedComponents {
  schemas: Map<string, SchemaObject>;
  requestBodies: Map<string, RequestBodyObject>;
}

function parseComponents(spec: OpenAPISpec): ParsedComponents {
  const components = spec.components || {};

  return {
    schemas: parseSchemas(components.schemas || {}),
    requestBodies: parseRequestBodies(components.requestBodies || {})
  };
}

function parseSchemas(schemas: any): Map<string, SchemaObject> {
  const parsed = new Map();

  for (const [name, schema] of Object.entries(schemas)) {
    if (!isValidComponentName(name)) {
      console.warn(`Invalid component name: ${name}`);
      continue;
    }
    parsed.set(name, schema as SchemaObject);
  }

  return parsed;
}

function isValidComponentName(name: string): boolean {
  return /^[a-zA-Z0-9.\-_]+$/.test(name);
}
```

---

## MVP Scope

| Component | MVP | Reasoning |
|-----------|-----|-----------|
| **schemas** | ✅ | Critical for TypeScript types (87 in Ozon) |
| **requestBodies** | ✅ | Needed for POST/PUT (11 in Ozon) |
| responses | ❌ | Can inline, lower priority |
| parameters | ❌ | Can inline, lower priority |
| securitySchemes | ⚠️ | Handle separately (not in Ozon components) |
| examples | ❌ | Nice-to-have |
| headers/links/callbacks | ❌ | Advanced features |

---

## Test Cases

```typescript
// Test 1: Simple schema
{ "User": { "type": "object", "properties": { "id": { "type": "string" } } } }
// ✅ Generate: interface User { id?: string; }

// Test 2: Schema with $ref
{ "Campaign": { "properties": { "user": { "$ref": "#/components/schemas/User" } } } }
// ✅ Resolve ref and generate correct interface

// Test 3: Enum schema
{ "Status": { "type": "string", "enum": ["active", "inactive"] } }
// ✅ Generate: type Status = 'active' | 'inactive';

// Test 4: Circular reference
{ "Node": { "properties": { "parent": { "$ref": "#/components/schemas/Node" } } } }
// ⚠️ Detect and handle gracefully

// Test 5: Ozon API (87 schemas)
// ✅ Generate 87 TypeScript types without errors
```

---

## Summary

✅ **Analyzed:** All 9 component sections
✅ **Validated:** Ozon uses schemas (87) + requestBodies (11)
✅ **Decided:** MVP = schemas + requestBodies
✅ **Implemented:** Parser, $ref resolver, TS generator

**Status:** Ready for TypeScript type generation

---

[◀ Back to Index](./README.md) | [◀ Prev: Server Object](./03-server-object.md) | [Next: Paths & Operations ▶](./05-paths-operations.md)
[See also: Type Generation →](./type-generation.md)
