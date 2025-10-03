# Root Level Structure (OpenAPI Document)

[◀ Back to Index](./README.md) | [Next: Info Object ▶](./02-info-object.md)

---

## Overview

Корневой уровень OpenAPI документа содержит метаданные и основные секции API спецификации.

## Fixed Fields Overview

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `openapi` | string | ✅ | OpenAPI Specification version |
| `info` | Info Object | ✅ | Метаданные об API |
| `servers` | [Server Object] | Optional | Массив серверов для подключения |
| `paths` | Paths Object | ✅ | Доступные пути и операции API |
| `components` | Components Object | Optional | Контейнер для reusable schemas |
| `security` | [Security Requirement Object] | Optional | Глобальные security requirements |
| `tags` | [Tag Object] | Optional | Список тегов с метаданными |
| `externalDocs` | External Documentation Object | Optional | Дополнительная внешняя документация |

---

## Field Analysis

### `openapi` (string, REQUIRED)

**Спецификация:**
- Semantic version number OpenAPI Specification
- Используется tooling для интерпретации документа
- НЕ связано с `info.version` (версия самого API)

**Ozon API Example:**
```json
{
  "openapi": "3.0.0"
}
```

**Анализ:**
- Ozon использует базовую версию 3.0.0 (не 3.0.1, 3.0.2, 3.0.3 или 3.1.x)
- Для генератора: проверять версию и предупреждать, если не 3.0.x
- **Action:** Валидация должна принимать 3.0.0, 3.0.1, 3.0.2, 3.0.3

**Impact on Generator:**
```typescript
// Validation logic
if (!spec.openapi.startsWith('3.0.')) {
  throw new Error('Only OpenAPI 3.0.x supported in MVP');
}
```

---

### `info` (Info Object, REQUIRED)

**Спецификация:**
- Метаданные об API
- Может использоваться tooling

**Ozon API Example:**
```json
{
  "info": {
    "title": "Документация Ozon Performance API",
    "version": "2.0",
    "x-logo": {
      "url": "https://cdn1.ozone.ru/s3/helppartners/ozon-logo-for-api-referral.svg",
      "backgroundColor": null,
      "altText": "Ozon logo"
    },
    "description": "\nВ документе описаны методы Ozon Performance API..."
  }
}
```

**Анализ:**
- `title`: Используется в human-readable описаниях
- `version`: Версия API (2.0) - не путать с `openapi: "3.0.0"`
- `x-logo`: Custom extension field (начинается с `x-`)
- `description`: Длинное описание с инструкциями

**Impact on Generator:**
- Использовать `info.title` для названия сгенерированного MCP сервера
- `info.description` → README.md в сгенерированном проекте
- Игнорировать `x-*` extension fields в MVP (не стандарт)

**Generated Code Example:**
```typescript
// package.json
{
  "name": "ozon-performance-api-mcp",
  "description": "MCP server for Ozon Performance API v2.0",
  "version": "1.0.0"
}
```

📖 **Detailed analysis:** [Info Object →](./02-info-object.md)

---

### `servers` ([Server Object])

**Спецификация:**
- Массив серверов для подключения
- Если не указано или пустой массив → default: `{ url: "/" }`

**Ozon API Example:**
```json
{
  "servers": [
    {
      "url": "https://api-performance.ozon.ru:443"
    }
  ]
}
```

**Анализ:**
- Один сервер с явным портом :443 (HTTPS)
- Нет server variables (простой случай)
- Полный URL с протоколом и портом

**Impact on Generator:**
- Использовать `servers[0].url` как base URL для HTTP client
- Если несколько серверов → выбрать первый или дать опцию через CLI flag
- Поддержка server variables (например, `{environment}`) отложена на post-MVP

**Generated Code Example:**
```typescript
// config.ts
export const API_BASE_URL = process.env.API_BASE_URL || 'https://api-performance.ozon.ru:443';
```

📖 **Detailed analysis:** [Server Object →](./03-server-object.md)

---

### `paths` (Paths Object, REQUIRED)

**Спецификация:**
- Доступные пути и операции API
- Основная секция с endpoint definitions

**Предварительный анализ:**
- Это самая большая секция (300+ методов в Ozon API)
- Каждый path → один или несколько MCP tools
- Критична для генератора — главная секция для tool generation

**Impact on Generator:**
- Парсинг каждого path → создание MCP tool definition
- Группировка по tags для smart filtering
- Приоритет #1 для реализации в генераторе

📖 **Detailed analysis:** [Paths & Operations →](./05-paths-operations.md)

---

### `components` (Components Object)

**Спецификация:**
- Контейнер для reusable schemas
- schemas, responses, parameters, examples, requestBodies, headers, securitySchemes, links, callbacks

**Expected structure:**
```json
{
  "components": {
    "schemas": { /* TypeScript interfaces */ },
    "securitySchemes": { /* Auth definitions */ }
  }
}
```

**Impact on Generator:**
- `components.schemas` → TypeScript interfaces/types
- `components.securitySchemes` → Authentication handlers
- Разрешение `$ref` ссылок критично

📖 **Detailed analysis:** [Components Object →](./04-components-object.md)

---

### `security` ([Security Requirement Object])

**Спецификация:**
- Глобальные security requirements для всего API
- Можно override на уровне операций
- Пустой объект `{}` делает security optional

**Expected:**
```json
{
  "security": [
    { "bearerAuth": [] }
  ]
}
```

**Impact on Generator:**
- Определяет, какой auth handler использовать по умолчанию
- Если есть операции без security → нужна обработка optional auth

📖 **Detailed analysis:** [Security →](./06-security.md)

---

### `tags` ([Tag Object])

**Спецификация:**
- Список тегов с метаданными
- Порядок может использоваться tooling
- Не все теги из operations должны быть объявлены здесь

**Ozon API Example:**
```json
{
  "tags": [
    {
      "name": "Intro",
      "x-displayName": "Введение",
      "description": "..."
    },
    {
      "name": "Campaign",
      "description": "..."
    },
    {
      "name": "Statistics",
      "description": "..."
    }
  ]
}
```

**Анализ:**
- Используются для группировки методов
- `x-displayName`: Custom field для локализованных названий
- `description`: Подробное описание категории

**Impact on Generator:**
- **КРИТИЧНО для Smart Method Filtering!**
- Теги → категории для AI (listMethods(category))
- `tags[].description` → AI-readable описание категории
- Использовать для semantic organization

**Generated Code Example:**
```typescript
// MCP tool for method discovery
tools.push({
  name: 'listMethods',
  description: 'Search and filter API methods by category',
  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: ['Campaign', 'Statistics', 'Ad', 'Product'],
        description: 'Filter methods by category'
      }
    }
  }
});
```

📖 **Detailed analysis:** [Tags & Organization →](./07-tags-organization.md)

---

### `externalDocs` (External Documentation Object)

**Спецификация:**
- Дополнительная внешняя документация

**Impact on Generator:**
- Низкий приоритет для MVP
- Можно добавить ссылку в README.md

---

## Key Findings for Generator

### Critical for MVP:
1. ✅ **openapi version validation** — только 3.0.x
2. ✅ **info.title** → package.json name, README
3. ✅ **servers[0].url** → base URL для HTTP client
4. ✅ **paths** → MCP tools generation (приоритет #1)
5. ✅ **tags** → Smart filtering categories (приоритет #2)
6. ✅ **components.schemas** → TypeScript types
7. ✅ **components.securitySchemes** + **security** → Auth handlers

### Post-MVP:
- Server variables support
- Multiple servers handling
- externalDocs integration

---

## Specification Extensions

While the OpenAPI Specification tries to accommodate most use cases, additional data can be added to extend the specification at certain points.

The extensions properties are implemented as **patterned fields** that are always prefixed by `"x-"`.

### Fixed Pattern

| Field Pattern | Type | Description |
|---------------|------|-------------|
| `^x-` | Any | Allows extensions to the OpenAPI Schema. The field name MUST begin with `x-`, for example, `x-internal-id`. The value can be `null`, a primitive, an array or an object. Can have any valid JSON format value. |

**Important Notes:**
- Extensions may or may not be supported by available tooling
- Tooling may be extended to add support for specific extensions
- Extensions are vendor-specific and not part of the official specification
- Extensions can be used on ANY object in the OpenAPI specification

### Common Extension Examples

**Vendor-Specific Metadata:**
```yaml
info:
  title: My API
  version: 1.0.0
  x-api-id: internal-12345
  x-audience: external
  x-owner:
    team: Platform Team
    email: platform@example.com
```

**UI Customization (Redoc, Swagger UI):**
```yaml
info:
  title: My API
  x-logo:
    url: https://example.com/logo.svg
    backgroundColor: "#FFFFFF"
    altText: Company Logo
```

**Code Generation Hints:**
```yaml
components:
  schemas:
    User:
      type: object
      x-tags:
        - model
      x-go-type: models.User
      properties:
        id:
          type: integer
          x-primary-key: true
```

**Operation Metadata:**
```yaml
paths:
  /users:
    get:
      summary: List users
      x-rate-limit:
        requests: 100
        period: 60
      x-internal-only: true
      x-code-samples:
        - lang: curl
          source: |
            curl -X GET https://api.example.com/users
```

**Server Extensions:**
```yaml
servers:
  - url: https://api.example.com
    x-environment: production
    x-region: us-east-1
```

### Extension Validation

**Valid Extensions:**
```yaml
# ✅ Valid - starts with x-
x-custom-field: value
x-vendor-extension: { key: value }
x-internal-id: 12345
```

**Invalid Extensions:**
```yaml
# ❌ Invalid - doesn't start with x-
custom-field: value
vendor-extension: value
```

### OpenAPI Extensions vs JSON Schema Extensions

**Important:** OpenAPI Specification extensions (`x-*`) are different from JSON Schema extensions. OpenAPI uses `x-` prefix while JSON Schema typically uses vendor-specific keywords.

### Ozon API Extensions

**Example from Ozon Performance API:**
```json
{
  "info": {
    "title": "Документация Ozon Performance API",
    "x-logo": {
      "url": "https://cdn1.ozone.ru/s3/helppartners/ozon-logo-for-api-referral.svg",
      "backgroundColor": null,
      "altText": "Ozon logo"
    }
  },
  "tags": [
    {
      "name": "Intro",
      "x-displayName": "Введение"
    }
  ]
}
```

**Observed Extensions:**
- `x-logo` - UI customization for documentation
- `x-displayName` - Localized display names for tags

### Implementation Strategy

**MVP Approach:**
```typescript
interface ExtensionAware {
  [key: `x-${string}`]: any;
}

function parseExtensions(obj: any): Record<string, any> {
  const extensions: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('x-')) {
      extensions[key] = value;
    }
  }

  return extensions;
}

function validateExtensionKey(key: string): boolean {
  return /^x-/.test(key);
}
```

**Extension Handling:**
1. **Parse and Preserve**: Read extensions but don't process them in MVP
2. **Pass Through**: Include extensions in generated output for downstream tools
3. **Document**: Note which extensions are present for future enhancement
4. **Warn**: Log warnings for unrecognized extensions if needed

**Post-MVP Enhancement:**
- Custom extension registry
- Extension-specific validation
- Extension documentation generation
- Vendor-specific extension support (AWS, Azure, Google Cloud)

### Extension Best Practices

**1. Use Descriptive Names:**
```yaml
# ✅ Good
x-rate-limit-per-hour: 1000
x-requires-approval: true

# ❌ Bad
x-rl: 1000
x-ra: true
```

**2. Document Your Extensions:**
```yaml
# Include documentation for custom extensions
x-custom-metadata:
  description: Internal tracking ID for this API
  format: uuid
  required: false
```

**3. Namespace Vendor Extensions:**
```yaml
# Use vendor prefix for clarity
x-aws-api-gateway-integration: {...}
x-google-cloud-function: {...}
x-company-internal-id: 12345
```

**4. Keep Extensions Optional:**
- Extensions should not be required for API functionality
- Tools should gracefully handle missing extensions
- Core functionality should work without extensions

---

## Navigation

- [◀ Back to Index](./README.md)
- [Next: Info Object ▶](./02-info-object.md)
- [See also: Implementation Summary](./implementation-summary.md)
