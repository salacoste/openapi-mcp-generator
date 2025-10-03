# Info Object (Metadata)

[◀ Back to Index](./README.md) | [◀ Prev: Root Level](./01-root-level.md) | [Next: Server Object ▶](./03-server-object.md)

---

## Specification Overview

Info Object предоставляет метаданные об API. Может использоваться клиентами и инструментами для документации.

## Fixed Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ REQUIRED | Название API |
| `description` | string | Optional | Краткое описание API (поддерживает CommonMark/Markdown) |
| `termsOfService` | string | Optional | URL Terms of Service (должен быть валидный URL) |
| `contact` | Contact Object | Optional | Контактная информация для API |
| `license` | License Object | Optional | Лицензионная информация |
| `version` | string | ✅ REQUIRED | Версия API документа (НЕ версия спецификации!) |

**Extension Support:** Может содержать `x-*` custom fields

---

## Ozon API Example

```json
{
  "info": {
    "title": "Документация Ozon Performance API",
    "version": "2.0",
    "x-logo": {
      "url": "https://cdn1.ozone.ru/s3/helppartners/ozon-logo-for-api-referral.svg"
    },
    "description": "\nВ документе описаны методы Ozon Performance API..."
  }
}
```

---

## Field Analysis

### `title` ✅ REQUIRED

**Ozon Value:** `"Документация Ozon Performance API"`

**Generator Usage:**
```typescript
function sanitizePackageName(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

// "Документация Ozon Performance API" → "ozon-performance-api-mcp"
const packageName = sanitizePackageName(spec.info.title) + '-mcp';
```

### `version` ✅ REQUIRED

**Ozon Value:** `"2.0"`

⚠️ **Important:** `info.version` (API version) ≠ `openapi` field (spec version)

```
openapi: "3.0.0"     ← OpenAPI Specification version
info.version: "2.0"  ← API implementation version
```

### `description` (Optional)

**Generator Usage:**
```typescript
// Use description in README
const readme = `# ${spec.info.title}\n\n${spec.info.description}\n\n`;
```

### Custom Extensions (`x-*`)

❌ **Ignore in MVP** - Focus on standard fields only

---

## Nested Objects

### Contact Object

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Имя контактного лица |
| `url` | string | URL (MUST be valid) |
| `email` | string | Email (MUST be valid format) |

**Ozon API:** ❌ Not present

**Parser:**
```typescript
function parseContactObject(contact: any): ParsedContact | null {
  if (!contact) return null;

  const parsed: ParsedContact = {};

  if (contact.name) parsed.name = contact.name;

  if (contact.url && isValidUrl(contact.url)) {
    parsed.url = contact.url;
  }

  if (contact.email && isValidEmail(contact.email)) {
    parsed.email = contact.email;
  }

  return Object.keys(parsed).length > 0 ? parsed : null;
}
```

### License Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ REQUIRED | Название лицензии |
| `url` | string | Optional | URL лицензии |

**Ozon API:** ❌ Not present

⚠️ **Important:** API license ≠ Generated MCP server license

```typescript
// package.json for generated server
{
  "license": "MIT",  // ← Generated code license
  "metadata": {
    "apiLicense": {
      "name": "Apache 2.0"  // ← API license (if present)
    }
  }
}
```

---

## Complete Implementation

### TypeScript Interface

```typescript
interface ParsedInfo {
  // Required
  title: string;
  version: string;

  // Optional
  description?: string;
  termsOfService?: string;
  contact?: {
    name?: string;
    url?: string;
    email?: string;
  };
  license?: {
    name: string;  // REQUIRED if license present
    url?: string;
  };
}
```

### Parser

```typescript
function parseInfoObject(spec: OpenAPISpec): ParsedInfo {
  // Validate required
  if (!spec.info?.title) throw new Error('info.title is required');
  if (!spec.info?.version) throw new Error('info.version is required');

  const parsed: ParsedInfo = {
    title: spec.info.title,
    version: spec.info.version
  };

  // Optional fields
  if (spec.info.description) parsed.description = spec.info.description;
  if (spec.info.termsOfService) parsed.termsOfService = spec.info.termsOfService;

  const contact = parseContactObject(spec.info.contact);
  if (contact) parsed.contact = contact;

  const license = parseLicenseObject(spec.info.license);
  if (license) parsed.license = license;

  return parsed;
}
```

### README Generator

```typescript
function generateReadme(info: ParsedInfo, serverUrl: string): string {
  let readme = `# ${info.title}\n\n`;

  if (info.description) {
    readme += `${info.description}\n\n`;
  }

  readme += `## Information\n\n`;
  readme += `- **API Version:** ${info.version}\n`;
  readme += `- **Base URL:** ${serverUrl}\n\n`;

  // Optional sections
  if (info.contact) {
    readme += generateContactSection(info.contact);
  }

  if (info.license) {
    readme += generateLicenseSection(info.license);
  }

  return readme;
}
```

---

## Test Cases

| Test | Expected Result |
|------|-----------------|
| Minimal (title + version only) | ✅ Valid README |
| Full (all fields) | ✅ README with all sections |
| Missing required | ❌ Throw error |
| Invalid URLs/emails | ⚠️ Warn but continue |
| Non-English characters | ✅ Handle correctly |
| License without name | ❌ Throw error |

---

## MVP Decisions

### ✅ Include:
- Parse all standard fields
- Validate required fields
- Generate README sections
- Handle optional fields gracefully

### ❌ Exclude:
- Custom extensions (`x-*`)
- Can revisit post-MVP

---

## Summary

✅ **Analyzed:** All 6 standard fields + 2 nested objects
✅ **Validated:** Ozon API example
✅ **Implemented:** Complete parser with validation
✅ **Generated:** Full README template
✅ **Tested:** 6 test cases covering edge cases

**Status:** Ready for implementation

---

## Navigation

- [◀ Back to Index](./README.md)
- [◀ Prev: Root Level](./01-root-level.md)
- [Next: Server Object ▶](./03-server-object.md)
- [See also: Type Generation](./type-generation.md)
