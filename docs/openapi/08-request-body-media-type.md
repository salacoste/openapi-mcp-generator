# Request Body & Media Type Objects

[◀ Back to Index](./README.md) | [◀ Prev: Tags](./07-tags-organization.md)

---

## Request Body Object

Describes a single request body for an operation.

### Fixed Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | Optional | Brief description (CommonMark supported) |
| `content` | Map[string, Media Type Object] | ✅ REQUIRED | Content by media type |
| `required` | boolean | Optional | Is request body required? (default: false) |

**Extension Support:** May contain `x-*` fields

---

## Content Media Types

### Media Type Keys

The `content` map uses media types as keys:

```typescript
{
  "content": {
    "application/json": { /* Media Type Object */ },
    "application/xml": { /* Media Type Object */ },
    "text/plain": { /* Media Type Object */ },
    "*/*": { /* Media Type Object - catch-all */ }
  }
}
```

**Priority:** Most specific key wins
- `text/plain` > `text/*` > `*/*`
- Only the most specific match is used

---

## Request Body Examples

### Simple JSON Body

```json
{
  "description": "User to add to the system",
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/User"
      }
    }
  }
}
```

### Multiple Content Types

```json
{
  "description": "User to add to the system",
  "content": {
    "application/json": {
      "schema": { "$ref": "#/components/schemas/User" },
      "examples": {
        "user": {
          "summary": "User Example",
          "externalValue": "http://foo.bar/examples/user-example.json"
        }
      }
    },
    "application/xml": {
      "schema": { "$ref": "#/components/schemas/User" },
      "examples": {
        "user": {
          "summary": "User example in XML",
          "externalValue": "http://foo.bar/examples/user-example.xml"
        }
      }
    },
    "text/plain": {
      "examples": {
        "user": {
          "summary": "User example in Plain text",
          "externalValue": "http://foo.bar/examples/user-example.txt"
        }
      }
    }
  }
}
```

### Array Body

```json
{
  "description": "List of user IDs",
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "type": "array",
        "items": {
          "type": "string"
        }
      }
    }
  }
}
```

---

## Media Type Object

Provides schema and examples for a specific media type.

### Fixed Fields

| Field | Type | Description |
|-------|------|-------------|
| `schema` | Schema Object \| Reference | Defines content structure |
| `example` | Any | Single example (mutually exclusive with `examples`) |
| `examples` | Map[string, Example Object] | Named examples (mutually exclusive with `example`) |
| `encoding` | Map[string, Encoding Object] | Property encoding info (multipart/form-data) |

**Extension Support:** May contain `x-*` fields

---

## Examples in Media Type

### Inline Example (Single)

```json
{
  "application/json": {
    "schema": { "$ref": "#/components/schemas/Pet" },
    "example": {
      "name": "Fluffy",
      "petType": "Cat",
      "color": "White"
    }
  }
}
```

### Named Examples (Multiple)

```json
{
  "application/json": {
    "schema": { "$ref": "#/components/schemas/Pet" },
    "examples": {
      "cat": {
        "summary": "An example of a cat",
        "value": {
          "name": "Fluffy",
          "petType": "Cat",
          "color": "White",
          "gender": "male",
          "breed": "Persian"
        }
      },
      "dog": {
        "summary": "An example of a dog",
        "value": {
          "name": "Puma",
          "petType": "Dog",
          "color": "Black",
          "gender": "Female",
          "breed": "Mixed"
        }
      },
      "frog": {
        "$ref": "#/components/examples/frog-example"
      }
    }
  }
}
```

---

## Implementation

### Parser Interface

```typescript
interface RequestBodyObject {
  description?: string;
  content: Map<string, MediaTypeObject>;
  required?: boolean;
}

interface MediaTypeObject {
  schema?: SchemaObject | Reference;
  example?: any;
  examples?: Map<string, ExampleObject | Reference>;
  encoding?: Map<string, EncodingObject>;
}

interface ExampleObject {
  summary?: string;
  description?: string;
  value?: any;
  externalValue?: string;
}
```

### Request Body Parser

```typescript
function parseRequestBody(requestBody: any): RequestBodyObject | null {
  if (!requestBody) return null;

  // Validate required content
  if (!requestBody.content) {
    throw new Error('RequestBody must have content field');
  }

  const parsed: RequestBodyObject = {
    content: parseMediaTypes(requestBody.content),
    required: requestBody.required || false
  };

  if (requestBody.description) {
    parsed.description = requestBody.description;
  }

  return parsed;
}

function parseMediaTypes(content: any): Map<string, MediaTypeObject> {
  const mediaTypes = new Map();

  for (const [mediaType, mediaTypeObj] of Object.entries(content)) {
    mediaTypes.set(mediaType, parseMediaType(mediaTypeObj));
  }

  return mediaTypes;
}

function parseMediaType(mediaType: any): MediaTypeObject {
  const parsed: MediaTypeObject = {};

  if (mediaType.schema) {
    parsed.schema = mediaType.schema;
  }

  if (mediaType.example) {
    parsed.example = mediaType.example;
  }

  if (mediaType.examples) {
    parsed.examples = parseExamples(mediaType.examples);
  }

  if (mediaType.encoding) {
    parsed.encoding = parseEncoding(mediaType.encoding);
  }

  return parsed;
}
```

---

## MCP Tool Integration

### Generate Input Schema from Request Body

```typescript
function generateInputSchemaFromRequestBody(
  requestBody: RequestBodyObject
): JSONSchema {
  // Get primary media type (prefer application/json)
  const jsonContent = requestBody.content.get('application/json');

  if (jsonContent && jsonContent.schema) {
    return {
      type: 'object',
      properties: {
        body: resolveSchema(jsonContent.schema)
      },
      required: requestBody.required ? ['body'] : []
    };
  }

  // Fallback to first available media type
  const [mediaType, mediaTypeObj] = Array.from(requestBody.content.entries())[0];

  return {
    type: 'object',
    properties: {
      body: {
        description: `Request body (${mediaType})`,
        ...(mediaTypeObj.schema ? resolveSchema(mediaTypeObj.schema) : {})
      }
    },
    required: requestBody.required ? ['body'] : []
  };
}
```

### Generated MCP Tool Example

```typescript
// From Ozon API: POST /api/client/campaign/create
{
  name: 'createCampaign',
  description: 'Создать новую рекламную кампанию',
  inputSchema: {
    type: 'object',
    properties: {
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          paymentType: { type: 'string', enum: ['CPC', 'CPM', 'CPO'] },
          budget: { type: 'number' }
        },
        required: ['title', 'paymentType']
      }
    },
    required: ['body']
  }
}
```

---

## Content Type Handling

### Media Type Selection

```typescript
function selectMediaType(
  availableTypes: string[],
  acceptHeader?: string
): string {
  // Prefer application/json if available
  if (availableTypes.includes('application/json')) {
    return 'application/json';
  }

  // Check accept header
  if (acceptHeader) {
    for (const type of availableTypes) {
      if (acceptHeader.includes(type)) {
        return type;
      }
    }
  }

  // Use first available or */*
  return availableTypes[0] || 'application/json';
}
```

### Request Serialization

```typescript
class RequestSerializer {
  serialize(body: any, mediaType: string): string | FormData {
    switch (mediaType) {
      case 'application/json':
        return JSON.stringify(body);

      case 'application/x-www-form-urlencoded':
        return new URLSearchParams(body).toString();

      case 'multipart/form-data':
        const formData = new FormData();
        for (const [key, value] of Object.entries(body)) {
          formData.append(key, value as any);
        }
        return formData;

      case 'text/plain':
        return String(body);

      default:
        return JSON.stringify(body);
    }
  }

  getHeaders(mediaType: string): Record<string, string> {
    if (mediaType === 'multipart/form-data') {
      // Let browser set Content-Type with boundary
      return {};
    }

    return {
      'Content-Type': mediaType
    };
  }
}
```

---

## Ozon API Examples

### Campaign Creation Request

```json
{
  "description": "Создание новой кампании",
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/CreateCampaignRequest"
      }
    }
  }
}
```

### Statistics Query Request

```json
{
  "description": "Запрос статистики по кампаниям",
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "type": "object",
        "properties": {
          "campaignIds": {
            "type": "array",
            "items": { "type": "string" }
          },
          "dateFrom": { "type": "string", "format": "date" },
          "dateTo": { "type": "string", "format": "date" }
        },
        "required": ["campaignIds", "dateFrom", "dateTo"]
      }
    }
  }
}
```

---

## MVP Scope

| Feature | MVP | Post-MVP |
|---------|-----|----------|
| application/json | ✅ | - |
| Schema parsing | ✅ | - |
| Required validation | ✅ | - |
| Single example support | ✅ | - |
| Multiple examples | ❌ | ✅ |
| application/xml | ❌ | ✅ |
| multipart/form-data | ❌ | ✅ |
| Encoding objects | ❌ | ✅ |
| External examples | ❌ | ✅ |

**Reasoning:**
- Focus on JSON (99% of modern APIs)
- Examples nice-to-have but not critical
- Form data adds complexity

---

## Test Cases

```typescript
// Test 1: Simple required body
{
  "required": true,
  "content": {
    "application/json": {
      "schema": { "$ref": "#/components/schemas/User" }
    }
  }
}
// ✅ Parse and mark required

// Test 2: Optional body with example
{
  "content": {
    "application/json": {
      "schema": { "type": "object" },
      "example": { "name": "test" }
    }
  }
}
// ✅ Parse, include example

// Test 3: Multiple media types
{
  "content": {
    "application/json": { "schema": {...} },
    "application/xml": { "schema": {...} }
  }
}
// ✅ Parse all, prefer JSON for MCP

// Test 4: Missing content
{
  "description": "No content field"
}
// ❌ Throw error

// Test 5: Mutually exclusive example/examples
{
  "content": {
    "application/json": {
      "example": {...},
      "examples": {...}
    }
  }
}
// ⚠️ Warn about conflict, use examples
```

---

## File Uploads

### Binary File Upload

```yaml
# Content transferred in binary (octet-stream)
requestBody:
  content:
    application/octet-stream:
      schema:
        type: string
        format: binary
```

### Base64 Encoded File

```yaml
# Content transferred with base64 encoding
requestBody:
  content:
    application/json:
      schema:
        type: string
        format: base64
```

### Specific Media Types

```yaml
# Multiple specific media types
requestBody:
  content:
    'image/jpeg':
      schema:
        type: string
        format: binary
    'image/png':
      schema:
        type: string
        format: binary
```

### Multiple File Upload

```yaml
# multipart/form-data for multiple files
requestBody:
  content:
    multipart/form-data:
      schema:
        properties:
          file:
            type: array
            items:
              type: string
              format: binary
```

---

## Form URL Encoding

### application/x-www-form-urlencoded

```yaml
requestBody:
  content:
    application/x-www-form-urlencoded:
      schema:
        type: object
        properties:
          id:
            type: string
            format: uuid
          address:
            # Complex types are stringified per RFC 1866
            type: object
            properties: {}
```

**Important:** Contents MUST be stringified per RFC 1866 when passed to server.

**Default Serialization:** `style: form` (see Encoding Object)

---

## Multipart Content

### Default Content-Types

| Property Type | Default Content-Type |
|---------------|---------------------|
| Primitive or array of primitives | `text/plain` |
| Complex object or array of objects | `application/json` |
| `type: string` with `format: binary/base64` | `application/octet-stream` |

### Multipart Example

```yaml
requestBody:
  content:
    multipart/form-data:
      schema:
        type: object
        properties:
          id:
            type: string
            format: uuid
          address:
            # Default: application/json
            type: object
            properties: {}
          profileImage:
            # Default: application/octet-stream
            type: string
            format: binary
          children:
            # Default: text/plain (based on inner type)
            type: array
            items:
              type: string
          addresses:
            # Default: application/json (based on inner type)
            type: array
            items:
              $ref: '#/components/schemas/Address'
```

---

## Encoding Object

Controls serialization of parts of multipart and form-urlencoded request bodies.

### Fixed Fields

| Field | Type | Description |
|-------|------|-------------|
| `contentType` | string | Content-Type for specific property |
| `headers` | Map[string, Header \| Reference] | Additional headers (e.g., Content-Disposition) |
| `style` | string | Serialization style (query parameter rules) |
| `explode` | boolean | Separate parameters for array/object values |
| `allowReserved` | boolean | Allow RFC3986 reserved chars without encoding |

### Content-Type Defaults

- `string` with `format: binary` → `application/octet-stream`
- Primitive types → `text/plain`
- Objects → `application/json`
- Arrays → Based on inner type

### Encoding Example

```yaml
requestBody:
  content:
    multipart/mixed:
      schema:
        type: object
        properties:
          id:
            # Default: text/plain
            type: string
            format: uuid
          address:
            # Default: application/json
            type: object
            properties: {}
          historyMetadata:
            # Need to declare XML format!
            description: metadata in XML format
            type: object
            properties: {}
          profileImage:
            # Default: application/octet-stream, declare image type!
            type: string
            format: binary
      encoding:
        historyMetadata:
          # Require XML Content-Type in utf-8 encoding
          contentType: application/xml; charset=utf-8
        profileImage:
          # Only accept png/jpeg
          contentType: image/png, image/jpeg
          headers:
            X-Rate-Limit-Limit:
              description: The number of allowed requests in the current period
              schema:
                type: integer
```

### Style Property

**Applicable to:** `application/x-www-form-urlencoded` only

| Style | Array Encoding | Object Encoding |
|-------|----------------|-----------------|
| `form` | `id=1&id=2&id=3` (explode=true) | `color=R,100,G,200,B,150` |
| `spaceDelimited` | `id=1%202%203` | N/A |
| `pipeDelimited` | `id=1\|2\|3` | N/A |
| `deepObject` | N/A | `color[R]=100&color[G]=200` |

**Default:** `style: form` with `explode: true`

---

## Implementation

### File Upload Handler

```typescript
interface FileUploadConfig {
  maxSize: number;        // Max file size in bytes
  allowedTypes: string[]; // Allowed MIME types
  encoding: 'binary' | 'base64';
}

class FileUploadHandler {
  async handleUpload(
    file: File | Buffer,
    mediaType: string,
    config: FileUploadConfig
  ): Promise<FormData | string> {
    // Validate file size
    if (file.size > config.maxSize) {
      throw new Error(`File size exceeds ${config.maxSize} bytes`);
    }

    // Validate MIME type
    if (!config.allowedTypes.includes(mediaType)) {
      throw new Error(`File type ${mediaType} not allowed`);
    }

    // Handle encoding
    if (config.encoding === 'base64') {
      return Buffer.from(file).toString('base64');
    }

    // Binary upload (multipart/form-data or octet-stream)
    const formData = new FormData();
    formData.append('file', file);
    return formData;
  }
}
```

### Multipart Encoder

```typescript
class MultipartEncoder {
  encode(data: Record<string, any>, encoding?: EncodingObject): FormData {
    const formData = new FormData();

    for (const [key, value] of Object.entries(data)) {
      const encodingConfig = encoding?.[key];
      const contentType = this.getContentType(value, encodingConfig);

      if (value instanceof File || value instanceof Buffer) {
        formData.append(key, value, {
          contentType,
          header: encodingConfig?.headers
        });
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value), { contentType });
      } else {
        formData.append(key, String(value), { contentType });
      }
    }

    return formData;
  }

  private getContentType(value: any, encoding?: EncodingConfig): string {
    // Use explicit contentType if provided
    if (encoding?.contentType) {
      return encoding.contentType;
    }

    // Apply defaults
    if (value instanceof File || value instanceof Buffer) {
      return 'application/octet-stream';
    }
    if (typeof value === 'object') {
      return 'application/json';
    }
    return 'text/plain';
  }
}
```

### Form URL Encoder

```typescript
class FormURLEncoder {
  encode(
    data: Record<string, any>,
    encoding?: Map<string, EncodingConfig>
  ): string {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(data)) {
      const config = encoding?.get(key);
      const style = config?.style || 'form';
      const explode = config?.explode ?? true;

      this.encodeValue(params, key, value, style, explode);
    }

    return params.toString();
  }

  private encodeValue(
    params: URLSearchParams,
    key: string,
    value: any,
    style: string,
    explode: boolean
  ) {
    if (Array.isArray(value)) {
      if (explode) {
        // form style with explode: id=1&id=2&id=3
        value.forEach(v => params.append(key, String(v)));
      } else {
        // form style without explode: id=1,2,3
        params.append(key, value.join(','));
      }
    } else if (typeof value === 'object' && value !== null) {
      // Stringify complex objects
      params.append(key, JSON.stringify(value));
    } else {
      params.append(key, String(value));
    }
  }
}
```

---

## MVP Scope Update

| Feature | MVP | Post-MVP |
|---------|-----|----------|
| application/json | ✅ | - |
| Schema parsing | ✅ | - |
| Required validation | ✅ | - |
| Single example support | ✅ | - |
| **File upload (binary)** | **⚠️ Basic** | **✅ Full** |
| **multipart/form-data** | **⚠️ Basic** | **✅ Full** |
| **application/x-www-form-urlencoded** | **⚠️ Basic** | **✅ Full** |
| Encoding objects | ❌ | ✅ |
| Custom headers in encoding | ❌ | ✅ |
| Multiple examples | ❌ | ✅ |
| application/xml | ❌ | ✅ |
| External examples | ❌ | ✅ |

**Reasoning:**
- ✅ **JSON** - Primary focus (99% of APIs)
- ⚠️ **File upload** - Basic support for common use cases
- ⚠️ **Multipart** - Basic encoding without custom headers
- ⚠️ **Form URL** - Standard encoding without complex styles
- ❌ **Advanced encoding** - Complex serialization deferred

---

## Test Cases Update

```typescript
// Test 6: Binary file upload
{
  "content": {
    "application/octet-stream": {
      "schema": { "type": "string", "format": "binary" }
    }
  }
}
// ✅ Handle binary file upload

// Test 7: Multipart with multiple files
{
  "content": {
    "multipart/form-data": {
      "schema": {
        "properties": {
          "files": {
            "type": "array",
            "items": { "type": "string", "format": "binary" }
          }
        }
      }
    }
  }
}
// ✅ Handle multiple file upload

// Test 8: Form URL encoded
{
  "content": {
    "application/x-www-form-urlencoded": {
      "schema": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "tags": { "type": "array", "items": { "type": "string" } }
        }
      }
    }
  }
}
// ✅ Encode as form data

// Test 9: Multipart with encoding
{
  "content": {
    "multipart/form-data": {
      "schema": {
        "properties": {
          "file": { "type": "string", "format": "binary" }
        }
      },
      "encoding": {
        "file": {
          "contentType": "image/png",
          "headers": {
            "Content-Disposition": {
              "schema": { "type": "string" }
            }
          }
        }
      }
    }
  }
}
// ⚠️ Parse encoding (full support post-MVP)
```

---

---

## Example Object

Used to provide examples for schemas, parameters, request bodies, and responses.

### Fixed Fields

| Field | Type | Description |
|-------|------|-------------|
| `summary` | string | Short description for the example |
| `description` | string | Long description (CommonMark supported) |
| `value` | Any | Embedded literal example (mutually exclusive with `externalValue`) |
| `externalValue` | string | URL to external example (mutually exclusive with `value`) |

**Extension Support:** May contain `x-*` fields

**Important:**
- `value` and `externalValue` are **mutually exclusive**
- Example value must be **compatible with schema type**
- Tooling may validate compatibility automatically

---

## Example Object Usage

### In Request Body

```yaml
requestBody:
  content:
    'application/json':
      schema:
        $ref: '#/components/schemas/Address'
      examples:
        foo:
          summary: A foo example
          value: {"foo": "bar"}
        bar:
          summary: A bar example
          value: {"bar": "baz"}
    'application/xml':
      examples:
        xmlExample:
          summary: This is an example in XML
          externalValue: 'http://example.org/examples/address-example.xml'
    'text/plain':
      examples:
        textExample:
          summary: This is a text example
          externalValue: 'http://foo.bar/examples/address-example.txt'
```

### In Parameter

```yaml
parameters:
  - name: 'zipCode'
    in: 'query'
    schema:
      type: 'string'
      format: 'zip-code'
    examples:
      zip-example:
        $ref: '#/components/examples/zip-example'
```

### In Response

```yaml
responses:
  '200':
    description: your car appointment has been booked
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/SuccessResponse'
        examples:
          confirmation-success:
            $ref: '#/components/examples/confirmation-success'
```

### In Components (Reusable)

```yaml
components:
  examples:
    zip-example:
      summary: US ZIP code example
      value: '90210'
    confirmation-success:
      summary: Successful booking confirmation
      value:
        bookingId: 'ABC123'
        appointmentTime: '2024-10-15T10:00:00Z'
        status: 'confirmed'
```

---

## Implementation

### Example Object Interface

```typescript
interface ExampleObject {
  summary?: string;
  description?: string;
  value?: any;
  externalValue?: string;
}

function parseExampleObject(example: any): ExampleObject {
  // Validate mutual exclusivity
  if (example.value !== undefined && example.externalValue !== undefined) {
    throw new Error('Example cannot have both value and externalValue');
  }

  const parsed: ExampleObject = {};

  if (example.summary) parsed.summary = example.summary;
  if (example.description) parsed.description = example.description;
  if (example.value !== undefined) parsed.value = example.value;
  if (example.externalValue) {
    if (!isValidUrl(example.externalValue)) {
      console.warn(`Invalid externalValue URL: ${example.externalValue}`);
    } else {
      parsed.externalValue = example.externalValue;
    }
  }

  return parsed;
}
```

### Example Resolution

```typescript
class ExampleResolver {
  async resolveExample(example: ExampleObject): Promise<any> {
    // Use embedded value if available
    if (example.value !== undefined) {
      return example.value;
    }

    // Fetch external example
    if (example.externalValue) {
      try {
        const response = await fetch(example.externalValue);
        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/json')) {
          return await response.json();
        }
        if (contentType?.includes('application/xml')) {
          return await response.text();
        }
        return await response.text();
      } catch (error) {
        console.error(`Failed to fetch external example: ${error}`);
        return null;
      }
    }

    return null;
  }
}
```

### Usage in Documentation Generation

```typescript
function generateExampleSection(
  examples: Map<string, ExampleObject>
): string {
  let output = '\n### Examples\n\n';

  for (const [name, example] of examples) {
    output += `#### ${name}\n`;

    if (example.summary) {
      output += `${example.summary}\n\n`;
    }

    if (example.description) {
      output += `${example.description}\n\n`;
    }

    if (example.value !== undefined) {
      output += '```json\n';
      output += JSON.stringify(example.value, null, 2);
      output += '\n```\n\n';
    }

    if (example.externalValue) {
      output += `[View example](${example.externalValue})\n\n`;
    }
  }

  return output;
}
```

---

## Best Practices

### 1. Provide Multiple Examples

```yaml
examples:
  minimal:
    summary: Minimal required fields
    value:
      name: "John Doe"
      email: "john@example.com"
  complete:
    summary: Complete user object
    value:
      name: "John Doe"
      email: "john@example.com"
      phone: "+1-555-0123"
      address:
        street: "123 Main St"
        city: "New York"
        zip: "10001"
```

### 2. Use External Examples for Large Data

```yaml
examples:
  large-dataset:
    summary: Complete product catalog
    externalValue: 'https://api.example.com/examples/products.json'
```

### 3. Example vs Examples

```yaml
# Single example (deprecated style)
content:
  application/json:
    schema: {...}
    example: {"name": "John"}

# Multiple named examples (preferred)
content:
  application/json:
    schema: {...}
    examples:
      user1:
        value: {"name": "John"}
      user2:
        value: {"name": "Jane"}
```

**Recommendation:** Use `examples` (plural) instead of `example` (singular) for better organization.

---

## Summary

✅ **Analyzed:** Request Body, Media Type, File Uploads, Encoding, Examples
✅ **Validated:** Ozon API POST operations
✅ **Decided:** MVP = JSON + basic file/form support
✅ **Implemented:** Parser + serializers + MCP integration

**Status:** Ready for request body handling with file upload support

---

## Navigation

- [◀ Back to Index](./README.md)
- [◀ Prev: Tags](./07-tags-organization.md)
- [See also: Components](./04-components-object.md)
- [See also: Paths & Operations](./05-paths-operations.md)
- [See also: Responses](./09-responses-object.md)
