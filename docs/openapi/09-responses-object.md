# Responses Object

[◀ Back to Index](./README.md) | [◀ Prev: Request Body & Media Type](./08-request-body-media-type.md)

---

## Overview

Responses Object is a container for expected responses of an operation. Maps HTTP response codes to Response Objects.

### Key Requirements

- ✅ **MUST** contain at least one response code
- ✅ **SHOULD** include successful operation response
- ⚠️ Documentation doesn't need to cover **all** possible HTTP codes
- ✅ **SHOULD** document known errors

---

## Specification

### Fixed Fields

| Field | Type | Description |
|-------|------|-------------|
| `default` | Response Object \| Reference | Default response for undeclared HTTP codes |

### Patterned Fields

| Pattern | Type | Description |
|---------|------|-------------|
| `{HTTP Status Code}` | Response Object \| Reference | Response for specific HTTP status code (e.g., `"200"`) |

**Status Code Format:**
- Must be quoted: `"200"`, `"404"`, `"500"`
- Can use wildcards: `"2XX"`, `"4XX"`, `"5XX"`
- Explicit codes take precedence over ranges

**Allowed Ranges:** `1XX`, `2XX`, `3XX`, `4XX`, `5XX`

---

## Response Status Code Patterns

### Explicit Codes

```yaml
responses:
  "200":
    description: Successful response
  "201":
    description: Created
  "204":
    description: No content
  "400":
    description: Bad request
  "401":
    description: Unauthorized
  "404":
    description: Not found
  "500":
    description: Internal server error
```

### Wildcard Ranges

```yaml
responses:
  "2XX":
    description: Success
  "4XX":
    description: Client error
  "5XX":
    description: Server error
```

### Precedence Rules

```yaml
responses:
  "200":
    description: Specific OK response  # ← Takes precedence
  "2XX":
    description: Generic success      # ← Fallback for 201, 202, etc.
  "404":
    description: Specific not found   # ← Takes precedence
  "4XX":
    description: Generic client error # ← Fallback for 400, 403, etc.
```

**Precedence:** Explicit code > Range > Default

---

## Response Object

Describes a single response from an API operation.

### Fixed Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | ✅ REQUIRED | Description of response (CommonMark supported) |
| `headers` | Map[string, Header \| Reference] | Optional | Response headers (case-insensitive names) |
| `content` | Map[string, Media Type Object] | Optional | Response body by media type |
| `links` | Map[string, Link \| Reference] | Optional | Links to other operations |

**Extension Support:** May contain `x-*` fields

**Important Notes:**
- Header names are **case-insensitive** per RFC7230
- `Content-Type` header SHALL be **ignored** if defined (use `content` field instead)
- At least one field must be present (typically `description` + `content`)

---

## Responses Object Example

### Success + Default Error Pattern

```yaml
responses:
  "200":
    description: a pet to be returned
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Pet'
  default:
    description: Unexpected error
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/ErrorModel'
```

**Pattern:** Explicit success response + default for all errors.

---

## Response Object Examples

### Array Response

```yaml
"200":
  description: A complex object array response
  content:
    application/json:
      schema:
        type: array
        items:
          $ref: '#/components/schemas/VeryComplexType'
```

### String Response

```yaml
"200":
  description: A simple string response
  content:
    text/plain:
      schema:
        type: string
```

### Response with Headers

```yaml
"200":
  description: A simple string response
  content:
    text/plain:
      schema:
        type: string
      example: 'whoa!'
  headers:
    X-Rate-Limit-Limit:
      description: The number of allowed requests in the current period
      schema:
        type: integer
    X-Rate-Limit-Remaining:
      description: The number of remaining requests in the current period
      schema:
        type: integer
    X-Rate-Limit-Reset:
      description: The number of seconds left in the current period
      schema:
        type: integer
```

### No Content Response

```yaml
"201":
  description: object created
```

**Note:** Response with no `content` field - only description required.

---

## Additional Examples

### Error Response

```yaml
responses:
  "400":
    description: Invalid request parameters
    content:
      application/json:
        schema:
          type: object
          properties:
            error:
              type: string
            message:
              type: string
            code:
              type: integer
```

### Multiple Content Types

```yaml
responses:
  "200":
    description: Successful response
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Pet'
      application/xml:
        schema:
          $ref: '#/components/schemas/Pet'
      text/plain:
        schema:
          type: string
```

### Response with Headers

```yaml
responses:
  "200":
    description: Successful response
    headers:
      X-Rate-Limit-Limit:
        description: Request limit per hour
        schema:
          type: integer
      X-Rate-Limit-Remaining:
        description: Remaining requests for the hour
        schema:
          type: integer
      X-Rate-Limit-Reset:
        description: UTC timestamp when limit resets
        schema:
          type: integer
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/User'
```

---

## Ozon API Examples

### List Campaigns Response

```yaml
/api/client/campaign:
  get:
    responses:
      "200":
        description: OK
        content:
          application/json:
            schema:
              type: object
              properties:
                list:
                  type: array
                  items:
                    $ref: '#/components/schemas/CampaignInList'
                total:
                  type: integer
                  description: Total count of campaigns
```

### Create Campaign Response

```yaml
/api/client/campaign/create:
  post:
    responses:
      "200":
        description: Campaign created successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                id:
                  type: string
                  format: uint64
                  description: Created campaign ID
      "400":
        description: Invalid request parameters
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Error'
```

### Error Response

```yaml
components:
  schemas:
    Error:
      type: object
      properties:
        code:
          type: integer
        message:
          type: string
        details:
          type: array
          items:
            type: string
```

---

## Common Response Patterns

### REST API Standard Responses

```yaml
responses:
  # Success responses
  "200":
    description: OK - Request succeeded
  "201":
    description: Created - Resource created
  "202":
    description: Accepted - Request accepted for processing
  "204":
    description: No Content - Success with no body

  # Redirect responses
  "301":
    description: Moved Permanently
  "302":
    description: Found (temporary redirect)
  "304":
    description: Not Modified (cached)

  # Client error responses
  "400":
    description: Bad Request - Invalid parameters
  "401":
    description: Unauthorized - Authentication required
  "403":
    description: Forbidden - Access denied
  "404":
    description: Not Found - Resource doesn't exist
  "409":
    description: Conflict - Resource conflict
  "422":
    description: Unprocessable Entity - Validation failed
  "429":
    description: Too Many Requests - Rate limit exceeded

  # Server error responses
  "500":
    description: Internal Server Error
  "502":
    description: Bad Gateway
  "503":
    description: Service Unavailable
  "504":
    description: Gateway Timeout
```

---

## Header Object

The Header Object follows the structure of the Parameter Object with specific modifications for header context.

### Key Differences from Parameter Object

**Restrictions:**
- `name` MUST NOT be specified (given in the corresponding headers map)
- `in` MUST NOT be specified (implicitly `in: header`)
- All traits affected by location MUST be applicable to `header` location (e.g., `style`)

### Fixed Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | Optional | Header description (CommonMark supported) |
| `required` | boolean | Optional | Whether header is required (default: `false`) |
| `deprecated` | boolean | Optional | Whether header is deprecated (default: `false`) |
| `allowEmptyValue` | boolean | Optional | Allow empty values (default: `false`) |
| `style` | string | Optional | Serialization style (default: `simple`) |
| `explode` | boolean | Optional | Explode parameter (default: `false`) |
| `allowReserved` | boolean | Optional | Allow reserved characters (default: `false`) |
| `schema` | Schema Object \| Reference | Optional | Header value schema |
| `example` | any | Optional | Example value (mutually exclusive with `examples`) |
| `examples` | Map[string, Example Object \| Reference] | Optional | Examples map (mutually exclusive with `example`) |

**Extension Support:** May contain `x-*` fields

**Style Default:** `simple` is the only valid style for headers

### Header Object Examples

**Simple integer header:**
```yaml
X-Rate-Limit:
  description: The number of allowed requests in the current period
  schema:
    type: integer
```

```json
{
  "X-Rate-Limit": {
    "description": "The number of allowed requests in the current period",
    "schema": {
      "type": "integer"
    }
  }
}
```

**Required header with example:**
```yaml
Authorization:
  description: Bearer token for authentication
  required: true
  schema:
    type: string
    pattern: '^Bearer .+$'
  example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**Header with multiple examples:**
```yaml
Content-Type:
  description: Media type of the response
  schema:
    type: string
  examples:
    json:
      value: application/json
      summary: JSON response
    xml:
      value: application/xml
      summary: XML response
```

**Deprecated header:**
```yaml
X-Legacy-Token:
  description: Legacy authentication token
  deprecated: true
  schema:
    type: string
```

---

## Implementation

### Parser Interface

```typescript
interface ResponsesObject {
  default?: ResponseObject | Reference;
  [statusCode: string]: ResponseObject | Reference;
}

interface ResponseObject {
  description: string;  // REQUIRED
  headers?: Map<string, HeaderObject | Reference>;
  content?: Map<string, MediaTypeObject>;
  links?: Map<string, LinkObject | Reference>;
}

interface HeaderObject {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: string;  // Only 'simple' is valid for headers
  explode?: boolean;
  allowReserved?: boolean;
  schema?: SchemaObject | Reference;
  example?: any;
  examples?: Map<string, ExampleObject | Reference>;
}
```

### Responses Parser

```typescript
function parseResponses(responses: any): Map<string, ResponseObject> {
  if (!responses || Object.keys(responses).length === 0) {
    throw new Error('Operation must have at least one response');
  }

  const parsed = new Map<string, ResponseObject>();

  for (const [statusCode, response] of Object.entries(responses)) {
    // Validate status code format
    if (!isValidStatusCode(statusCode)) {
      console.warn(`Invalid status code: ${statusCode}`);
      continue;
    }

    parsed.set(statusCode, parseResponse(response as any));
  }

  return parsed;
}

function parseHeaders(headers: any): Map<string, HeaderObject> {
  const parsed = new Map<string, HeaderObject>();

  for (const [name, header] of Object.entries(headers)) {
    // Normalize to lowercase (case-insensitive per RFC7230)
    const normalizedName = name.toLowerCase();

    // Ignore Content-Type header (use content field instead)
    if (normalizedName === 'content-type') {
      console.warn('Content-Type header SHALL be ignored - use content field');
      continue;
    }

    parsed.set(normalizedName, parseHeader(header as any));
  }

  return parsed;
}

function parseHeader(header: any): HeaderObject {
  // Validate restrictions
  if (header.name !== undefined) {
    console.warn('Header object MUST NOT specify "name" - it is given in the headers map');
  }

  if (header.in !== undefined) {
    console.warn('Header object MUST NOT specify "in" - it is implicitly "header"');
  }

  const parsed: HeaderObject = {};

  if (header.description) parsed.description = header.description;
  if (header.required !== undefined) parsed.required = header.required;
  if (header.deprecated !== undefined) parsed.deprecated = header.deprecated;
  if (header.allowEmptyValue !== undefined) parsed.allowEmptyValue = header.allowEmptyValue;

  // Style validation - only 'simple' is valid for headers
  if (header.style) {
    if (header.style !== 'simple') {
      console.warn(`Header style must be 'simple', got '${header.style}'`);
    }
    parsed.style = header.style;
  }

  if (header.explode !== undefined) parsed.explode = header.explode;
  if (header.allowReserved !== undefined) parsed.allowReserved = header.allowReserved;
  if (header.schema) parsed.schema = header.schema;

  // Validate example/examples mutual exclusivity
  if (header.example !== undefined && header.examples !== undefined) {
    throw new Error('Header cannot have both "example" and "examples"');
  }

  if (header.example !== undefined) parsed.example = header.example;
  if (header.examples) parsed.examples = parseExamples(header.examples);

  return parsed;
}

function isValidStatusCode(code: string): boolean {
  // Check explicit codes: "200", "404", etc.
  if (/^\d{3}$/.test(code)) return true;

  // Check ranges: "2XX", "4XX", etc.
  if (/^[1-5]XX$/.test(code)) return true;

  // Check default
  if (code === 'default') return true;

  return false;
}

function parseResponse(response: any): ResponseObject {
  // Validate required description
  if (!response.description) {
    throw new Error('Response must have description field');
  }

  const parsed: ResponseObject = {
    description: response.description
  };

  if (response.headers) {
    parsed.headers = parseHeaders(response.headers);
  }

  if (response.content) {
    parsed.content = parseMediaTypes(response.content);
  }

  if (response.links) {
    parsed.links = parseLinks(response.links);
  }

  return parsed;
}
```

### Status Code Resolver

```typescript
class ResponseResolver {
  private responses: Map<string, ResponseObject>;

  constructor(responses: Map<string, ResponseObject>) {
    this.responses = responses;
  }

  resolve(statusCode: number): ResponseObject | null {
    const code = String(statusCode);

    // 1. Try explicit match
    if (this.responses.has(code)) {
      return this.responses.get(code)!;
    }

    // 2. Try range match
    const rangeCode = `${code[0]}XX`;
    if (this.responses.has(rangeCode)) {
      return this.responses.get(rangeCode)!;
    }

    // 3. Try default
    if (this.responses.has('default')) {
      return this.responses.get('default')!;
    }

    return null;
  }

  getSuccessResponse(): ResponseObject | null {
    // Try 2XX responses
    for (const code of ['200', '201', '202', '204']) {
      if (this.responses.has(code)) {
        return this.responses.get(code)!;
      }
    }

    // Try 2XX range
    if (this.responses.has('2XX')) {
      return this.responses.get('2XX')!;
    }

    return null;
  }

  getAllErrorResponses(): Map<string, ResponseObject> {
    const errors = new Map<string, ResponseObject>();

    for (const [code, response] of this.responses) {
      if (code.startsWith('4') || code.startsWith('5') ||
          code === '4XX' || code === '5XX') {
        errors.set(code, response);
      }
    }

    return errors;
  }
}
```

---

## MCP Integration

### Generate Output Schema from Response

```typescript
function generateOutputSchemaFromResponse(
  response: ResponseObject
): JSONSchema | null {
  // Get primary content type (prefer application/json)
  if (!response.content) return null;

  const jsonContent = response.content.get('application/json');

  if (jsonContent && jsonContent.schema) {
    return resolveSchema(jsonContent.schema);
  }

  // Fallback to first available media type
  const [mediaType, mediaTypeObj] = Array.from(response.content.entries())[0];

  if (mediaTypeObj.schema) {
    return resolveSchema(mediaTypeObj.schema);
  }

  return null;
}
```

### Error Handling

```typescript
class APIResponseHandler {
  async handleResponse(
    response: Response,
    expectedResponses: Map<string, ResponseObject>
  ): Promise<any> {
    const resolver = new ResponseResolver(expectedResponses);
    const responseSpec = resolver.resolve(response.status);

    if (!responseSpec) {
      throw new Error(`Unexpected response status: ${response.status}`);
    }

    // Parse response based on content type
    const contentType = response.headers.get('content-type') || 'application/json';

    if (contentType.includes('application/json')) {
      const data = await response.json();

      // Validate against schema if present
      if (responseSpec.content?.has('application/json')) {
        const schema = responseSpec.content.get('application/json')!.schema;
        validateResponseData(data, schema);
      }

      return data;
    }

    // Handle other content types
    if (contentType.includes('text/')) {
      return await response.text();
    }

    return await response.blob();
  }
}
```

---

## Link Object (HATEOAS)

Represents a possible design-time link for a response. Used for HATEOAS (Hypermedia as the Engine of Application State) patterns.

### Overview

Link Object allows responses to include references to related operations, enabling API discoverability and workflow navigation through hypermedia.

**Use Cases:**
- Resource relationships (user → address, order → items)
- Workflow navigation (create → update → delete)
- Pagination (next, previous, first, last)
- Related resources (post → comments, album → photos)

### Fixed Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `operationRef` | string | ⚠️ Conditional | Relative or absolute reference to OAS operation (mutually exclusive with `operationId`) |
| `operationId` | string | ⚠️ Conditional | Name of existing resolvable OAS operation (mutually exclusive with `operationRef`) |
| `parameters` | Map[string, Any \| {expression}] | Optional | Parameters to pass to linked operation |
| `requestBody` | Any \| {expression} | Optional | Request body to pass to linked operation |
| `description` | string | Optional | Link description (CommonMark supported) |
| `server` | Server Object | Optional | Server to use for linked operation |

**Extension Support:** May contain `x-*` fields

**Important Rules:**
- **MUST** have either `operationRef` or `operationId` (not both)
- Parameter and request body values can use **runtime expressions**
- Runtime expressions same as Callback Object (see [Callbacks](./10-callbacks-webhooks.md))

### Runtime Expression Support

Link Object supports runtime expressions that allow defining values based on information available within the HTTP message in an actual API call.

**ABNF Syntax:**
```abnf
expression = ( "$url" / "$method" / "$statusCode" / "$request." source / "$response." source )
source = ( header-reference / query-reference / path-reference / body-reference )
header-reference = "header." token
query-reference = "query." name
path-reference = "path." name
body-reference = "body" ["#" json-pointer ]
```

**Important Notes:**
- Runtime expressions preserve the **type** of the referenced value
- Expressions can be **embedded into strings** using `{}` curly braces
- Header names use `token` (case-insensitive), other names are case-sensitive
- Request parameters **MUST be declared** in the parameters section or they cannot be evaluated

| Source Location | Expression | Notes |
|----------------|------------|-------|
| HTTP Method | `$method` | Allowable values for HTTP operation (GET, POST, etc.) |
| Requested media type | `$request.header.accept` | Request header value |
| Request parameter (path) | `$request.path.id` | Must be declared in parameters section |
| Request parameter (query) | `$request.query.{name}` | Must be declared in parameters section |
| Request header | `$request.header.{token}` | Case-insensitive token name |
| Request body property | `$request.body#/user/uuid` | JSON Pointer to request payload portion |
| Request URL | `$url` | Full request URL |
| Response status code | `$statusCode` | HTTP response status code |
| Response value | `$response.body#/status` | JSON Pointer to response payload portion |
| Response header | `$response.header.Server` | Single header value only (case-insensitive) |

### Embedding Expressions in Strings

Runtime expressions preserve the type of the referenced value. To embed expressions into string values, surround the expression with `{}` curly braces:

**Example:**
```yaml
links:
  createUser:
    operationId: createUser
    requestBody:
      # Embedded expression in string
      welcomeMessage: 'Welcome, {$response.body#/username}!'
      # Direct expression (preserves type)
      userId: $response.body#/id
      # Complex embedded expression
      profileUrl: 'https://example.com/users/{$response.body#/id}/profile'
```

**Type Preservation:**
- `$response.body#/id` → Direct expression preserves number type
- `{$response.body#/id}` → Embedded in string converts to string
- Multiple expressions can be embedded: `User {$response.body#/id}: {$response.body#/name}`

---

## Link Object Examples

### Example 1: Simple Resource Link

Link from user response to user's address.

```yaml
paths:
  /users/{userid}:
    get:
      responses:
        "200":
          description: User details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
          links:
            userAddress:
              operationId: getUserAddress
              parameters:
                userid: '$response.body#/id'
```

**Flow:**
1. Client requests: `GET /users/123`
2. Response includes link to `getUserAddress` operation
3. Client can follow link: `GET /users/123/address`

---

### Example 2: operationRef Usage

Using operationRef instead of operationId. References MAY be relative or absolute.

**Relative operationRef:**
```yaml
links:
  UserRepositories:
    # returns array of '#/components/schemas/repository'
    operationRef: '#/paths/~12.0~1repositories~1{username}/get'
    parameters:
      username: $response.body#/username
```

**Absolute operationRef:**
```yaml
links:
  UserRepositories:
    # returns array of '#/components/schemas/repository'
    operationRef: 'https://na2.gigantic-server.com/#/paths/~12.0~1repositories~1{username}/get'
    parameters:
      username: $response.body#/username
```

**Note:** In operationRef, the escaped forward-slash (`~1`) is **necessary** when using JSON references. Format: `~1` for `/` and `~0` for `~`.

---

### Example 3: Complete HATEOAS Pattern

Full HATEOAS implementation with multiple links.

```yaml
paths:
  /users/{userid}:
    get:
      operationId: getUser
      responses:
        "200":
          description: User details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
          links:
            address:
              operationId: getUserAddress
              parameters:
                userid: '$response.body#/id'
            repositories:
              operationId: getUserRepositories
              parameters:
                username: '$response.body#/username'

  /users/{userid}/address:
    get:
      operationId: getUserAddress
      parameters:
        - name: userid
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: User address

  /repositories/{username}:
    get:
      operationId: getUserRepositories
      parameters:
        - name: username
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: User repositories
```

---

### Example 4: Pagination Links

Common pagination pattern with next/previous links.

```yaml
/users:
  get:
    responses:
      "200":
        description: Paginated user list
        content:
          application/json:
            schema:
              type: object
              properties:
                users:
                  type: array
                  items:
                    $ref: '#/components/schemas/User'
                page:
                  type: integer
                total:
                  type: integer
        links:
          next:
            operationId: getUsers
            parameters:
              page: '$response.body#/page + 1'
          previous:
            operationId: getUsers
            parameters:
              page: '$response.body#/page - 1'
          first:
            operationId: getUsers
            parameters:
              page: 1
          last:
            operationId: getUsers
            parameters:
              page: '$response.body#/totalPages'
```

---

### Example 5: Workflow Navigation

Link from creation response to update/delete operations.

```yaml
/posts:
  post:
    responses:
      "201":
        description: Post created
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Post'
        links:
          getPost:
            operationId: getPost
            parameters:
              postId: '$response.body#/id'
          updatePost:
            operationId: updatePost
            parameters:
              postId: '$response.body#/id'
          deletePost:
            operationId: deletePost
            parameters:
              postId: '$response.body#/id'
```

---

## Implementation

### Parser Interface

```typescript
interface LinkObject {
  operationRef?: string;
  operationId?: string;
  parameters?: Map<string, any | string>;
  requestBody?: any | string;
  description?: string;
  server?: ServerObject;
}

interface ResolvedLink {
  operation: OperationObject;
  parameters: Map<string, any>;
  requestBody?: any;
  server?: ServerObject;
}
```

### Link Parser

```typescript
function parseLinks(links: any): Map<string, LinkObject> {
  const parsed = new Map<string, LinkObject>();

  for (const [name, link] of Object.entries(links)) {
    parsed.set(name, parseLink(link as any));
  }

  return parsed;
}

function parseLink(link: any): LinkObject {
  // Validate mutual exclusivity
  if (link.operationRef && link.operationId) {
    throw new Error('Link cannot have both operationRef and operationId');
  }

  if (!link.operationRef && !link.operationId) {
    throw new Error('Link must have either operationRef or operationId');
  }

  const parsed: LinkObject = {};

  if (link.operationRef) {
    // Validate operationRef format
    if (!isValidOperationRef(link.operationRef)) {
      console.warn(`Invalid operationRef: ${link.operationRef}`);
    }
    parsed.operationRef = link.operationRef;
  }

  if (link.operationId) {
    parsed.operationId = link.operationId;
  }

  if (link.parameters) {
    parsed.parameters = new Map(Object.entries(link.parameters));
  }

  if (link.requestBody !== undefined) {
    parsed.requestBody = link.requestBody;
  }

  if (link.description) {
    parsed.description = link.description;
  }

  if (link.server) {
    parsed.server = parseServer(link.server);
  }

  return parsed;
}

function isValidOperationRef(ref: string): boolean {
  // Check if it's a valid URI reference
  // Relative: #/paths/~1users/get
  // Absolute: https://api.example.com/openapi.json#/paths/~1users/get

  if (ref.startsWith('#/')) {
    // Relative reference - validate JSON Pointer format
    return /^#\/paths\/[^#]+\/(get|post|put|delete|patch|options|head|trace)$/.test(ref);
  }

  // Absolute reference - must contain URL with fragment
  if (ref.includes('://')) {
    try {
      const url = new URL(ref);
      // Must have fragment with paths reference
      return url.hash.startsWith('#/paths/');
    } catch {
      return false;
    }
  }

  return false;
}
```

### Link Resolver

```typescript
class LinkResolver {
  private operations: Map<string, OperationObject>;
  private expressionEvaluator: RuntimeExpressionEvaluator;

  constructor(operations: Map<string, OperationObject>) {
    this.operations = operations;
    this.expressionEvaluator = new RuntimeExpressionEvaluator();
  }

  resolveLink(
    link: LinkObject,
    context: {
      request: Request;
      response: Response;
    }
  ): ResolvedLink {
    // 1. Resolve operation
    const operation = this.resolveOperation(link);

    // 2. Resolve parameters
    const parameters = this.resolveParameters(link.parameters || new Map(), context);

    // 3. Resolve request body
    const requestBody = link.requestBody
      ? this.resolveValue(link.requestBody, context)
      : undefined;

    return {
      operation,
      parameters,
      requestBody,
      server: link.server
    };
  }

  private resolveOperation(link: LinkObject): OperationObject {
    if (link.operationId) {
      // Find operation by operationId
      const operation = this.operations.get(link.operationId);
      if (!operation) {
        throw new Error(`Operation not found: ${link.operationId}`);
      }
      return operation;
    }

    if (link.operationRef) {
      // Parse operationRef and find operation
      // Format: #/paths/~1users~1{userid}/get
      const match = link.operationRef.match(/#\/paths\/([^/]+)\/(\w+)$/);
      if (!match) {
        throw new Error(`Invalid operationRef format: ${link.operationRef}`);
      }

      const [, pathPointer, method] = match;
      const path = this.decodeJsonPointer(pathPointer);

      const operationKey = `${method.toUpperCase()} ${path}`;
      const operation = this.operations.get(operationKey);

      if (!operation) {
        throw new Error(`Operation not found: ${operationKey}`);
      }

      return operation;
    }

    throw new Error('Link must have operationRef or operationId');
  }

  private resolveParameters(
    parameters: Map<string, any>,
    context: { request: Request; response: Response }
  ): Map<string, any> {
    const resolved = new Map<string, any>();

    for (const [name, value] of parameters) {
      resolved.set(name, this.resolveValue(value, context));
    }

    return resolved;
  }

  private resolveValue(
    value: any,
    context: { request: Request; response: Response }
  ): any {
    if (typeof value !== 'string') {
      return value;
    }

    // Check if it's a direct runtime expression (preserves type)
    if (value.startsWith('$')) {
      return this.expressionEvaluator.evaluate(value, context);
    }

    // Check for embedded expressions in strings
    if (value.includes('{$')) {
      return this.expressionEvaluator.evaluateEmbedded(value, context);
    }

    return value;
  }

  private decodeJsonPointer(pointer: string): string {
    // Decode JSON Pointer: ~1 -> /, ~0 -> ~
    return pointer.replace(/~1/g, '/').replace(/~0/g, '~');
  }
}
```

### Runtime Expression Evaluator (Extended)

```typescript
class RuntimeExpressionEvaluator {
  evaluate(
    expression: string,
    context: {
      request: Request;
      response: Response;
    }
  ): string {
    // Basic expressions
    if (expression === '$url') {
      return context.request.url;
    }

    if (expression === '$method') {
      return context.request.method;
    }

    if (expression === '$statusCode') {
      return String(context.response.status);
    }

    // Request expressions
    if (expression.startsWith('$request.path.')) {
      const param = expression.substring('$request.path.'.length);
      return context.request.params[param];
    }

    if (expression.startsWith('$request.query.')) {
      const param = expression.substring('$request.query.'.length);
      return context.request.query[param];
    }

    if (expression.startsWith('$request.header.')) {
      const header = expression.substring('$request.header.'.length);
      return context.request.headers[header.toLowerCase()];
    }

    if (expression.startsWith('$request.body#')) {
      const pointer = expression.substring('$request.body#'.length);
      return this.resolveJsonPointer(context.request.body, pointer);
    }

    // Response expressions
    if (expression.startsWith('$response.header.')) {
      const header = expression.substring('$response.header.'.length);
      return context.response.headers[header.toLowerCase()];
    }

    if (expression.startsWith('$response.body#')) {
      const pointer = expression.substring('$response.body#'.length);
      return this.resolveJsonPointer(context.response.body, pointer);
    }

    throw new Error(`Unknown expression: ${expression}`);
  }

  evaluateEmbedded(
    template: string,
    context: {
      request: Request;
      response: Response;
    }
  ): string {
    // Replace all {$expression} patterns with evaluated values
    const expressionRegex = /\{\$([^}]+)\}/g;

    return template.replace(expressionRegex, (match, expression) => {
      try {
        const value = this.evaluate(`$${expression}`, context);
        // Convert to string for embedding
        return String(value);
      } catch (error) {
        console.warn(`Failed to evaluate embedded expression: ${match}`);
        return match; // Return original if evaluation fails
      }
    });
  }

  private resolveJsonPointer(obj: any, pointer: string): any {
    // JSON Pointer RFC6901 implementation
    const parts = pointer.split('/').filter(p => p);
    let current = obj;

    for (const part of parts) {
      // Unescape special characters
      const key = part.replace(/~1/g, '/').replace(/~0/g, '~');

      if (Array.isArray(current)) {
        const index = parseInt(key, 10);
        current = current[index];
      } else {
        current = current[key];
      }

      if (current === undefined) {
        throw new Error(`JSON Pointer not found: ${pointer}`);
      }
    }

    return current;
  }
}
```

---

## HATEOAS Best Practices

### API Discoverability

Links enable clients to discover API capabilities dynamically:

```typescript
// Client doesn't need to know URL structure
async function getUserAndAddress(userId: string) {
  const userResponse = await api.get(`/users/${userId}`);
  const user = userResponse.data;

  // Follow link instead of hardcoding URL
  const addressLink = userResponse.links.address;
  const addressResponse = await api.followLink(addressLink);

  return { user, address: addressResponse.data };
}
```

### Workflow Navigation

Links guide clients through multi-step workflows:

```yaml
# Step 1: Create resource
POST /orders → 201 Created
  links:
    addItem: POST /orders/{id}/items
    checkout: POST /orders/{id}/checkout
    cancel: DELETE /orders/{id}

# Step 2: Follow link to add items
POST /orders/123/items → 201 Created
  links:
    addAnother: POST /orders/123/items
    checkout: POST /orders/123/checkout

# Step 3: Follow link to checkout
POST /orders/123/checkout → 200 OK
```

### Link Naming Conventions

| Link Name | Purpose |
|-----------|---------|
| `self` | Current resource |
| `next` | Next page in pagination |
| `previous` | Previous page |
| `first` | First page |
| `last` | Last page |
| `parent` | Parent resource |
| `related` | Related resource |
| `alternate` | Alternative representation |
| `collection` | Collection containing this resource |

---

## Test Cases

```typescript
// Test 1: Basic link with operationId
{
  operationId: 'getUserAddress',
  parameters: {
    userid: '$response.body#/id'
  }
}
// ✅ Resolve to operation and evaluate parameter

// Test 2: Link with operationRef
{
  operationRef: '#/paths/~1users~1{userid}~1address/get',
  parameters: {
    userid: '$response.body#/id'
  }
}
// ✅ Parse JSON Pointer and resolve operation

// Test 3: Both operationId and operationRef
{
  operationId: 'getUser',
  operationRef: '#/paths/~1users/get'
}
// ❌ Throw error (mutually exclusive)

// Test 4: Neither operationId nor operationRef
{
  parameters: { id: '123' }
}
// ❌ Throw error (must have one)

// Test 5: Link with requestBody
{
  operationId: 'updateUser',
  requestBody: {
    name: '$response.body#/name',
    email: '$response.body#/email'
  }
}
// ✅ Resolve request body with expressions

// Test 6: Direct expression (preserves type)
{
  operationId: 'updateUser',
  parameters: {
    userId: '$response.body#/id'  // Returns number if id is number
  }
}
// ✅ Type preserved (number, string, boolean, etc.)

// Test 7: Embedded expression (converts to string)
{
  operationId: 'sendNotification',
  requestBody: {
    message: 'Welcome, {$response.body#/username}!'
  }
}
// ✅ Embedded expression evaluates to string

// Test 8: Multiple embedded expressions
{
  operationId: 'logActivity',
  parameters: {
    message: 'User {$response.body#/id}: {$response.body#/name} logged in'
  }
}
// ✅ Multiple expressions in single string

// Test 9: Absolute operationRef
{
  operationRef: 'https://api.example.com/openapi.json#/paths/~1users/get'
}
// ✅ Parse absolute URL with JSON Pointer

// Test 10: Invalid expression in embedded string
{
  operationId: 'test',
  parameters: {
    value: 'Hello {$invalid.expression}'
  }
}
// ⚠️ Warn and return original string with unresolved expression
```

---

## MVP Scope

| Feature | MVP | Post-MVP |
|---------|-----|----------|
| Parse responses object | ✅ | - |
| Explicit status codes | ✅ | - |
| Wildcard ranges (2XX, 4XX) | ✅ | - |
| Default response | ✅ | - |
| Response description | ✅ | - |
| Response content/schema | ✅ | - |
| Response headers | ⚠️ Basic | ✅ Full |
| Response links | ❌ | ✅ |
| Response validation | ⚠️ Basic | ✅ Full |

**Reasoning:**
- ✅ **Status codes & content** - Critical for MCP tool output
- ⚠️ **Headers** - Parse but don't validate
- ❌ **Links** - Advanced feature (HATEOAS)
- ⚠️ **Validation** - Basic schema validation only

---

## Test Cases

```typescript
// Test 1: Simple success response
{
  "200": {
    "description": "OK",
    "content": {
      "application/json": {
        "schema": { "$ref": "#/components/schemas/User" }
      }
    }
  }
}
// ✅ Parse success response

// Test 2: Wildcard ranges
{
  "2XX": { "description": "Success" },
  "4XX": { "description": "Client error" }
}
// ✅ Parse ranges

// Test 3: Explicit precedence over range
{
  "200": { "description": "Specific OK" },
  "2XX": { "description": "Generic success" }
}
// ✅ Use 200 for status 200, 2XX for 201, 202, etc.

// Test 4: Response with headers
{
  "200": {
    "description": "OK",
    "headers": {
      "X-Rate-Limit": {
        "description": "Request limit",
        "schema": { "type": "integer" },
        "required": true
      }
    }
  }
}
// ✅ Parse headers with all fields

// Test 4a: Header with invalid 'name' field
{
  "X-Custom-Header": {
    "name": "X-Custom-Header",  // Invalid!
    "schema": { "type": "string" }
  }
}
// ⚠️ Warn that 'name' must not be specified

// Test 4b: Header with invalid 'in' field
{
  "Authorization": {
    "in": "header",  // Invalid!
    "schema": { "type": "string" }
  }
}
// ⚠️ Warn that 'in' must not be specified

// Test 4c: Header with invalid style
{
  "X-Custom": {
    "style": "form",  // Invalid! Only 'simple' allowed
    "schema": { "type": "string" }
  }
}
// ⚠️ Warn that style must be 'simple'

// Test 4d: Header with both example and examples
{
  "X-Token": {
    "schema": { "type": "string" },
    "example": "abc123",
    "examples": { "token1": { "value": "xyz789" } }
  }
}
// ❌ Throw error (mutually exclusive)

// Test 5: No responses
{}
// ❌ Throw error (must have at least one)

// Test 6: Missing description
{
  "200": {
    "content": { "application/json": { "schema": {} } }
  }
}
// ❌ Throw error (description required)

// Test 7: Invalid status code
{
  "999": { "description": "Invalid" }
}
// ⚠️ Warn and skip

// Test 8: Default response
{
  "200": { "description": "OK" },
  "default": { "description": "Error" }
}
// ✅ Use 200 for 200, default for others
```

---

## Summary

✅ **Analyzed:** Responses Object, Response Object, status codes
✅ **Validated:** Ozon API response patterns
✅ **Decided:** MVP = status codes + content + basic headers
✅ **Implemented:** Parser + resolver + MCP integration

**Status:** Ready for response handling

---

## Navigation

- [◀ Back to Index](./README.md)
- [◀ Prev: Request Body & Media Type](./08-request-body-media-type.md)
- [▶ Next: Callbacks & Webhooks](./10-callbacks-webhooks.md)
- [See also: Paths & Operations](./05-paths-operations.md)
- [See also: Components](./04-components-object.md)
