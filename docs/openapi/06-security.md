# Security & Authentication

[◀ Back to Index](./README.md) | [◀ Prev: Paths & Operations](./05-paths-operations.md) | [Next: Tags ▶](./07-tags-organization.md)

---

## Security Scheme Object

Defines a security scheme that can be used by the operations.

**Supported Schemes:**
- HTTP authentication (Basic, Bearer, etc.)
- API key (header, query parameter, or cookie parameter)
- OAuth2 common flows (implicit, password, client credentials, authorization code) as defined in RFC6749
- OpenID Connect Discovery

### Fixed Fields

| Field | Type | Applies To | Required | Description |
|-------|------|------------|----------|-------------|
| `type` | string | Any | ✅ REQUIRED | Type of security scheme. Valid values: `"apiKey"`, `"http"`, `"oauth2"`, `"openIdConnect"` |
| `description` | string | Any | Optional | Short description for security scheme (CommonMark syntax MAY be used) |
| `name` | string | `apiKey` | ✅ REQUIRED | Name of the header, query or cookie parameter to be used |
| `in` | string | `apiKey` | ✅ REQUIRED | Location of the API key. Valid values: `"query"`, `"header"`, `"cookie"` |
| `scheme` | string | `http` | ✅ REQUIRED | Name of the HTTP Authorization scheme as defined in RFC7235 Section 5.1. Values SHOULD be registered in IANA Authentication Scheme registry |
| `bearerFormat` | string | `http` (`"bearer"`) | Optional | Hint to identify how the bearer token is formatted. Primarily for documentation purposes |
| `flows` | OAuth Flows Object | `oauth2` | ✅ REQUIRED | Configuration information for the flow types supported |
| `openIdConnectUrl` | string | `openIdConnect` | ✅ REQUIRED | OpenID Connect URL to discover OAuth2 configuration values. MUST be in the form of a URL |

**Extension Support:** This object MAY be extended with Specification Extensions

---

## Security Scheme Examples

### Basic Authentication Sample

```json
{
  "type": "http",
  "scheme": "basic"
}
```

```yaml
type: http
scheme: basic
```

**Usage:**
- Scheme: `basic`
- Authorization header: `Authorization: Basic <base64(username:password)>`
- Registered in IANA: Yes

### API Key Sample

```json
{
  "type": "apiKey",
  "name": "api_key",
  "in": "header"
}
```

```yaml
type: apiKey
name: api_key
in: header
```

**Locations (`in`):**
- `header` - HTTP header (e.g., `X-API-Key: <key>`)
- `query` - Query parameter (e.g., `?api_key=<key>`)
- `cookie` - Cookie parameter (e.g., `Cookie: api_key=<key>`)

### JWT Bearer Sample

```json
{
  "type": "http",
  "scheme": "bearer",
  "bearerFormat": "JWT"
}
```

```yaml
type: http
scheme: bearer
bearerFormat: JWT
```

**Usage:**
- Scheme: `bearer`
- Authorization header: `Authorization: Bearer <token>`
- `bearerFormat`: Documentation hint (e.g., `"JWT"`, `"OAuth"`)

### Implicit OAuth2 Sample

```json
{
  "type": "oauth2",
  "flows": {
    "implicit": {
      "authorizationUrl": "https://example.com/api/oauth/dialog",
      "scopes": {
        "write:pets": "modify pets in your account",
        "read:pets": "read your pets"
      }
    }
  }
}
```

```yaml
type: oauth2
flows:
  implicit:
    authorizationUrl: https://example.com/api/oauth/dialog
    scopes:
      write:pets: modify pets in your account
      read:pets: read your pets
```

### OpenID Connect Sample

```json
{
  "type": "openIdConnect",
  "openIdConnectUrl": "https://example.com/.well-known/openid-configuration"
}
```

```yaml
type: openIdConnect
openIdConnectUrl: https://example.com/.well-known/openid-configuration
```

---

## OAuth Flows Object

Allows configuration of the supported OAuth Flows.

### Fixed Fields

| Field | Type | Description |
|-------|------|-------------|
| `implicit` | OAuth Flow Object | Configuration for the OAuth Implicit flow |
| `password` | OAuth Flow Object | Configuration for the OAuth Resource Owner Password flow |
| `clientCredentials` | OAuth Flow Object | Configuration for the OAuth Client Credentials flow. Previously called `application` in OpenAPI 2.0 |
| `authorizationCode` | OAuth Flow Object | Configuration for the OAuth Authorization Code flow. Previously called `accessCode` in OpenAPI 2.0 |

**Extension Support:** This object MAY be extended with Specification Extensions

---

## OAuth Flow Object

Configuration details for a supported OAuth Flow.

### Fixed Fields

| Field | Type | Applies To | Required | Description |
|-------|------|------------|----------|-------------|
| `authorizationUrl` | string | `oauth2` (`"implicit"`, `"authorizationCode"`) | ✅ REQUIRED | The authorization URL to be used for this flow. MUST be in the form of a URL |
| `tokenUrl` | string | `oauth2` (`"password"`, `"clientCredentials"`, `"authorizationCode"`) | ✅ REQUIRED | The token URL to be used for this flow. MUST be in the form of a URL |
| `refreshUrl` | string | `oauth2` | Optional | The URL to be used for obtaining refresh tokens. MUST be in the form of a URL |
| `scopes` | Map[string, string] | `oauth2` | ✅ REQUIRED | The available scopes for the OAuth2 security scheme. A map between the scope name and a short description for it. The map MAY be empty |

**Extension Support:** This object MAY be extended with Specification Extensions

### OAuth Flow Examples

**Complete OAuth2 with Multiple Flows:**

```json
{
  "type": "oauth2",
  "flows": {
    "implicit": {
      "authorizationUrl": "https://example.com/api/oauth/dialog",
      "scopes": {
        "write:pets": "modify pets in your account",
        "read:pets": "read your pets"
      }
    },
    "authorizationCode": {
      "authorizationUrl": "https://example.com/api/oauth/dialog",
      "tokenUrl": "https://example.com/api/oauth/token",
      "scopes": {
        "write:pets": "modify pets in your account",
        "read:pets": "read your pets"
      }
    }
  }
}
```

```yaml
type: oauth2
flows:
  implicit:
    authorizationUrl: https://example.com/api/oauth/dialog
    scopes:
      write:pets: modify pets in your account
      read:pets: read your pets
  authorizationCode:
    authorizationUrl: https://example.com/api/oauth/dialog
    tokenUrl: https://example.com/api/oauth/token
    scopes:
      write:pets: modify pets in your account
      read:pets: read your pets
```

**Password Flow:**

```yaml
type: oauth2
flows:
  password:
    tokenUrl: https://example.com/api/oauth/token
    refreshUrl: https://example.com/api/oauth/refresh
    scopes:
      write:pets: modify pets in your account
      read:pets: read your pets
```

**Client Credentials Flow:**

```yaml
type: oauth2
flows:
  clientCredentials:
    tokenUrl: https://example.com/api/oauth/token
    scopes:
      admin: Admin access to all resources
```

### OAuth2 Flow Types

| Flow | Authorization URL | Token URL | Refresh URL | Use Case |
|------|-------------------|-----------|-------------|----------|
| `implicit` | ✅ Required | ❌ Not used | Optional | Browser-based apps (deprecated, use authorizationCode with PKCE) |
| `password` | ❌ Not used | ✅ Required | Optional | Trusted first-party apps |
| `clientCredentials` | ❌ Not used | ✅ Required | Optional | Machine-to-machine (M2M) |
| `authorizationCode` | ✅ Required | ✅ Required | Optional | Server-side apps (most secure) |

---

## Security Requirement Object

Lists the required security schemes to execute an operation. The name used for each property MUST correspond to a security scheme declared in the **Security Schemes** under the **Components Object**.

**Important Rules:**

1. **Multiple schemes in ONE Security Requirement Object** → ALL schemes MUST be satisfied (AND logic)
2. **Multiple Security Requirement Objects in a list** → Only ONE needs to be satisfied (OR logic)
3. **Empty object `{}`** → Optional security (allows unauthenticated access)
4. **Empty array `[]`** → No security required (overrides global security)

### Patterned Fields

| Field Pattern | Type | Description |
|---------------|------|-------------|
| `{name}` | [string] | Each name MUST correspond to a security scheme declared in Security Schemes. If the scheme is `"oauth2"` or `"openIdConnect"`, the value is a list of scope names required for execution (MAY be empty if no specific scope required). For other security scheme types, the array MUST be empty. |

---

## Security Requirement Examples

### Non-OAuth2 Security Requirement

For `apiKey`, `http` (basic, bearer), the array MUST be empty:

```json
{
  "api_key": []
}
```

```yaml
api_key: []
```

**Explanation:**
- Requires `api_key` security scheme
- Empty array because it's not OAuth2/OpenID Connect
- No scopes needed for non-OAuth2 schemes

### OAuth2 Security Requirement

For `oauth2` and `openIdConnect`, the array contains required scopes:

```json
{
  "petstore_auth": [
    "write:pets",
    "read:pets"
  ]
}
```

```yaml
petstore_auth:
  - write:pets
  - read:pets
```

**Explanation:**
- Requires `petstore_auth` OAuth2 scheme
- Must have both `write:pets` AND `read:pets` scopes
- Scopes are cumulative (all required)

### Optional OAuth2 Security

Optional security as defined in OpenAPI Object or Operation Object:

```json
{
  "security": [
    {},
    {
      "petstore_auth": [
        "write:pets",
        "read:pets"
      ]
    }
  ]
}
```

```yaml
security:
  - {}
  - petstore_auth:
      - write:pets
      - read:pets
```

**Explanation:**
- First option `{}` → No authentication required (public access)
- Second option → OAuth2 with scopes
- Request satisfies if EITHER option is met (OR logic)

---

## Security Application Patterns

### Global Security (OpenAPI Object Level)

Applies to all operations by default:

```yaml
openapi: 3.0.0
security:
  - bearerAuth: []
paths:
  /users:
    get:
      # Inherits global security: bearerAuth required
```

### Operation-Level Security Override

Operations can override global security:

```yaml
security:
  - bearerAuth: []  # Global default

paths:
  /public:
    get:
      security: []  # ← Override: No authentication required

  /admin:
    get:
      security:
        - bearerAuth: []
        - apiKey: []  # ← Override: Require BOTH bearerAuth AND apiKey
```

### Alternative Security Schemes (OR Logic)

Request can use EITHER scheme:

```yaml
paths:
  /users:
    get:
      security:
        - bearerAuth: []
        - apiKey: []
```

**Explanation:**
- User can authenticate with `bearerAuth` OR `apiKey`
- Only ONE scheme needs to be satisfied

### Multiple Schemes Required (AND Logic)

Request must use ALL schemes:

```yaml
paths:
  /admin:
    post:
      security:
        -
          bearerAuth: []
          apiKey: []
```

**Explanation:**
- User MUST provide BOTH `bearerAuth` AND `apiKey`
- All schemes in the same object must be satisfied

### No Security Required

Explicitly disable security for an operation:

```yaml
security:
  - bearerAuth: []  # Global default

paths:
  /health:
    get:
      security: []  # ← Empty array: No security required
```

### Optional Security

Allow both authenticated and unauthenticated access:

```yaml
paths:
  /content:
    get:
      security:
        - {}              # ← Option 1: No auth (public)
        - bearerAuth: []  # ← Option 2: Authenticated (premium features)
```

**Use Case:**
- Public users can access basic content
- Authenticated users get additional features

### OAuth2 with Different Scope Combinations

```yaml
paths:
  /pets:
    get:
      security:
        - petstore_auth:
            - read:pets  # ← Read-only access
    post:
      security:
        - petstore_auth:
            - write:pets  # ← Write access required
    delete:
      security:
        - petstore_auth:
            - write:pets
            - admin      # ← Multiple scopes required
```

### Complex Security Pattern

```yaml
paths:
  /api/resource:
    get:
      security:
        - {}  # ← Option 1: Public access (limited data)
        - oauth2:
            - read  # ← Option 2: OAuth2 with read scope (full data)
        -
          apiKey: []
          oauth2:
            - read
            - write  # ← Option 3: API key AND OAuth2 with read+write
```

**Explanation:**
- 3 ways to access the resource
- Different authentication grants different access levels

---

## Security Requirement Logic Summary

| Pattern | Logic | Example | Meaning |
|---------|-------|---------|---------|
| Single scheme | Required | `- bearerAuth: []` | Must have bearerAuth |
| Multiple objects (list) | OR | `- bearerAuth: []`<br>`- apiKey: []` | bearerAuth OR apiKey |
| Multiple schemes in one object | AND | `- bearerAuth: []`<br>&nbsp;&nbsp;`apiKey: []` | bearerAuth AND apiKey |
| Empty object | Optional | `- {}` | No authentication required |
| Empty array | Disabled | `security: []` | Explicitly no security |
| OAuth2 with scopes | All scopes | `- oauth2: [read, write]` | Must have read AND write scopes |

---

## Implementation

### Security Handler Interface

```typescript
interface SecurityConfig {
  scheme: string;  // 'bearer', 'basic', 'apiKey'
  type: string;    // 'http', 'apiKey', 'oauth2'
  in?: 'header' | 'query' | 'cookie';
  name?: string;   // Header/query/cookie name
}

interface SecurityHandler {
  configure(config: SecurityConfig): void;
  getHeaders(): Record<string, string>;
  getQueryParams(): Record<string, string>;
}
```

### Bearer Token Handler

```typescript
class BearerAuthHandler implements SecurityHandler {
  private token: string;

  configure(config: SecurityConfig) {
    this.token = process.env.API_TOKEN || '';
    if (!this.token) {
      throw new Error('API_TOKEN environment variable required');
    }
  }

  getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.token}`
    };
  }

  getQueryParams(): Record<string, string> {
    return {};
  }
}
```

### API Key Handler

```typescript
class ApiKeyHandler implements SecurityHandler {
  private apiKey: string;
  private location: 'header' | 'query' | 'cookie';
  private name: string;

  configure(config: SecurityConfig) {
    this.apiKey = process.env.API_KEY || '';
    this.location = config.in || 'header';
    this.name = config.name || 'X-API-Key';

    if (!this.apiKey) {
      throw new Error('API_KEY environment variable required');
    }
  }

  getHeaders(): Record<string, string> {
    if (this.location === 'header') {
      return { [this.name]: this.apiKey };
    }
    return {};
  }

  getQueryParams(): Record<string, string> {
    if (this.location === 'query') {
      return { [this.name]: this.apiKey };
    }
    return {};
  }
}
```

### Security Manager

```typescript
class SecurityManager {
  private handlers: Map<string, SecurityHandler>;

  constructor(spec: OpenAPISpec) {
    this.handlers = new Map();
    this.initializeHandlers(spec.components?.securitySchemes);
  }

  private initializeHandlers(schemes: any) {
    if (!schemes) return;

    for (const [name, scheme] of Object.entries(schemes)) {
      const handler = this.createHandler(scheme as SecurityConfig);
      this.handlers.set(name, handler);
    }
  }

  private createHandler(scheme: SecurityConfig): SecurityHandler {
    if (scheme.type === 'http' && scheme.scheme === 'bearer') {
      return new BearerAuthHandler();
    }
    if (scheme.type === 'apiKey') {
      return new ApiKeyHandler();
    }
    throw new Error(`Unsupported security scheme: ${scheme.type}`);
  }

  applySecurityToRequest(
    requirements: SecurityRequirement[],
    request: Request
  ) {
    if (!requirements || requirements.length === 0) return;

    // Apply first security requirement (AND logic)
    const requirement = requirements[0];

    for (const [schemeName] of Object.entries(requirement)) {
      const handler = this.handlers.get(schemeName);
      if (!handler) {
        throw new Error(`Security scheme '${schemeName}' not found`);
      }

      Object.assign(request.headers, handler.getHeaders());
      Object.assign(request.query, handler.getQueryParams());
    }
  }
}
```

---

## Generated Code Example

### config.ts

```typescript
export const AUTH_CONFIG = {
  type: 'bearer',
  token: process.env.API_TOKEN || '',
  validateToken() {
    if (!this.token) {
      throw new Error(
        'API_TOKEN environment variable is required. ' +
        'Set it in your .env file or environment.'
      );
    }
  }
};
```

### .env

```bash
# Authentication
API_TOKEN=your_bearer_token_here

# Alternative: API Key authentication
# API_KEY=your_api_key_here
```

### README.md Section

```markdown
## Authentication

This API uses Bearer token authentication.

### Setup

1. Obtain an API token from the provider
2. Add to your `.env` file:
   ```
   API_TOKEN=your_token_here
   ```

3. The token will be automatically included in requests:
   ```
   Authorization: Bearer your_token_here
   ```
```

---

## MVP Scope

| Feature | MVP | Post-MVP |
|---------|-----|----------|
| Bearer HTTP auth | ✅ | - |
| API Key auth | ✅ | - |
| Basic auth | ✅ | - |
| Global security | ✅ | - |
| Operation-level override | ✅ | - |
| OAuth 2.0 | ❌ | ✅ |
| OpenID Connect | ❌ | ✅ |
| Multiple security (AND) | ❌ | ✅ |
| Security alternatives (OR) | ❌ | ✅ |

---

## Test Cases

```typescript
// Test 1: Bearer auth
{
  "securitySchemes": {
    "bearerAuth": { "type": "http", "scheme": "bearer" }
  },
  "security": [{ "bearerAuth": [] }]
}
// ✅ Add Authorization: Bearer {token}

// Test 2: API Key in header
{
  "securitySchemes": {
    "apiKey": { "type": "apiKey", "in": "header", "name": "X-API-Key" }
  }
}
// ✅ Add X-API-Key: {key}

// Test 3: API Key in query
{
  "securitySchemes": {
    "apiKey": { "type": "apiKey", "in": "query", "name": "api_key" }
  }
}
// ✅ Add ?api_key={key}

// Test 4: No security
{ "security": [] }
// ✅ No auth headers added

// Test 5: Missing token
// ❌ Throw error with helpful message
```

---

## Security Filtering

Some objects in the OpenAPI Specification MAY be declared and remain empty, or be completely removed, even though they are inherently the core of the API documentation.

**Purpose:** Allows an additional layer of **access control** over the documentation itself.

**Reasoning:** While not part of the specification itself, certain libraries MAY choose to allow access to parts of the documentation based on some form of **authentication/authorization**.

### Use Cases

#### 1. Empty Paths Object

The **Paths Object** MAY be empty.

```yaml
openapi: 3.0.0
info:
  title: Restricted API
  version: 1.0.0
  description: |
    This API requires authentication to view documentation.
    Please contact support@example.com for access.
paths: {}
```

**Behavior:**
- May seem counterintuitive, but this tells the viewer they got to the **right place**
- Viewer **cannot access** any documentation
- Still have access to the **Info Object** which may contain additional information regarding authentication
- Useful for gating entire API documentation behind authentication

**Implementation Example:**
```typescript
function filterPaths(
  paths: PathsObject,
  user: User | null
): PathsObject {
  if (!user || !user.hasDocumentationAccess) {
    return {}; // Return empty paths for unauthorized users
  }
  return paths;
}
```

#### 2. Empty Path Item Object

The **Path Item Object** MAY be empty.

```yaml
paths:
  /public:
    get:
      summary: Public endpoint
      # ... full documentation

  /admin:
    # Empty - user knows it exists but can't see details

  /users/{id}:
    # Empty - path exists but no operations visible
```

**Behavior:**
- Viewer will be **aware that the path exists**
- Viewer will **not** be able to see any operations or parameters
- **Different from hiding** the path entirely from the Paths Object
- Allows documentation provider to **finely control** what the viewer can see

**Comparison:**

| Approach | Path Visible | Operations Visible | Use Case |
|----------|--------------|-------------------|----------|
| **Remove path** | ❌ No | ❌ No | Completely hide endpoint existence |
| **Empty Path Item** | ✅ Yes | ❌ No | Show path exists, hide implementation |
| **Full Path Item** | ✅ Yes | ✅ Yes | Full documentation access |

### Security Filtering Patterns

#### Pattern 1: Role-Based Documentation Access

```typescript
function filterDocumentation(
  spec: OpenAPISpec,
  user: User
): OpenAPISpec {
  const filtered = { ...spec };

  // Filter paths based on user role
  filtered.paths = Object.entries(spec.paths).reduce(
    (acc, [path, pathItem]) => {
      const requiredRole = pathItem['x-required-role'];

      if (!requiredRole || user.hasRole(requiredRole)) {
        acc[path] = pathItem;
      } else if (user.canSeePathExists(path)) {
        acc[path] = {}; // Empty path item - show existence only
      }
      // Otherwise, path is completely hidden

      return acc;
    },
    {} as PathsObject
  );

  return filtered;
}
```

#### Pattern 2: Progressive Disclosure

```typescript
function getDocumentationLevel(user: User): 'none' | 'paths' | 'full' {
  if (!user.isAuthenticated) return 'none';
  if (user.hasBasicAccess) return 'paths';
  if (user.hasFullAccess) return 'full';
  return 'none';
}

function filterByLevel(
  spec: OpenAPISpec,
  level: 'none' | 'paths' | 'full'
): OpenAPISpec {
  switch (level) {
    case 'none':
      return { ...spec, paths: {} };

    case 'paths':
      // Show paths but no operations
      const pathsOnly = Object.keys(spec.paths).reduce(
        (acc, path) => ({ ...acc, [path]: {} }),
        {}
      );
      return { ...spec, paths: pathsOnly };

    case 'full':
      return spec;
  }
}
```

#### Pattern 3: Operation-Level Filtering

```typescript
function filterOperations(
  pathItem: PathItemObject,
  user: User
): PathItemObject {
  const filtered: PathItemObject = {};

  for (const [method, operation] of Object.entries(pathItem)) {
    if (method === 'parameters' || method.startsWith('x-')) {
      filtered[method] = operation;
      continue;
    }

    const requiredScope = operation['x-required-scope'];

    if (!requiredScope || user.hasScope(requiredScope)) {
      filtered[method] = operation;
    }
    // Operation is hidden if user doesn't have required scope
  }

  return filtered;
}
```

### Best Practices

**1. Provide Context in Info Object:**
```yaml
info:
  title: Restricted API
  description: |
    # Authentication Required

    This API documentation requires authentication.

    **To gain access:**
    - Contact: api-support@example.com
    - Documentation: https://docs.example.com/access
  contact:
    name: API Support
    email: api-support@example.com
```

**2. Use Extension Fields for Access Control:**
```yaml
paths:
  /admin:
    x-required-role: admin
    x-visibility: restricted
    post:
      x-required-scope: admin:write
      summary: Admin operation
```

**3. Document Filtering Behavior:**
```yaml
info:
  x-documentation-access:
    public:
      level: paths-only
      description: Unauthenticated users can see available paths
    authenticated:
      level: full
      description: Authenticated users can see full documentation
```

**4. Graceful Degradation:**
- Always include helpful Info Object
- Provide contact information
- Explain how to gain access
- Don't leave users completely in the dark

### Security Filtering vs Security Requirements

| Feature | Security Filtering | Security Requirements |
|---------|-------------------|----------------------|
| **Purpose** | Control documentation visibility | Control API access |
| **Applies To** | OpenAPI documentation | API requests |
| **Configured By** | Documentation server | API specification |
| **User Impact** | Can't see documentation | Can't call API |
| **Implementation** | Outside OpenAPI spec | Part of OpenAPI spec |

**Important:** Security Filtering is **not part of the OpenAPI Specification** itself. It's an implementation pattern that some documentation tools support.

### Implementation in Documentation Tools

**Redoc Example:**
```typescript
// Custom Redoc wrapper with filtering
import { Redoc } from 'redoc';

function SecureRedoc({ user }: { user: User }) {
  const filteredSpec = filterDocumentation(spec, user);

  return <Redoc spec={filteredSpec} />;
}
```

**Swagger UI Example:**
```typescript
SwaggerUI({
  spec: filterDocumentation(spec, currentUser),
  docExpansion: 'none', // Don't auto-expand for filtered docs
});
```

### Testing Security Filtering

```typescript
// Test 1: Unauthenticated user
const spec1 = filterDocumentation(fullSpec, null);
// ✅ paths should be {}

// Test 2: Basic user
const spec2 = filterDocumentation(fullSpec, basicUser);
// ✅ paths should show path names but empty objects

// Test 3: Admin user
const spec3 = filterDocumentation(fullSpec, adminUser);
// ✅ paths should be complete

// Test 4: Partial access
const spec4 = filterDocumentation(fullSpec, developerUser);
// ✅ Some paths visible, some empty, some hidden
```

---

## Summary

✅ **Analyzed:** All security scheme types, OAuth flows, Security Requirements, Security Filtering
✅ **Decided:** MVP = Bearer + API Key + Basic
✅ **Implemented:** Security handlers + manager + filtering patterns
✅ **Generated:** Config + .env + README
✅ **Documented:** Access control patterns for documentation

**Status:** Ready for authentication implementation and documentation access control

---

[◀ Back to Index](./README.md) | [◀ Prev: Paths & Operations](./05-paths-operations.md) | [Next: Tags ▶](./07-tags-organization.md)
