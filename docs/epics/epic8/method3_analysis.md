# Метод 3: CreateProductCampaignCPCV2 - Детальный анализ

## 📋 Swagger Спецификация

**Endpoint:** `POST /api/client/campaign/cpc/v2/product`  
**Operation ID:** `CreateProductCampaignCPCV2`  
**Summary:** Создать кампанию с оплатой за клики  
**Tag:** Ad

### Request Body:

**Reference:** `#/components/requestBodies/extcampaignCreateProductCampaignRequestV2CPC`  
**Required:** ✅  
**Schema:** `extcampaignCreateProductCampaignRequestV2CPC`

**Properties (9):**
1. `ProductAdvPlacements` (optional)
2. `autoIncreasePercent` (optional)
3. `dailyBudget` (optional)
4. `fromDate` (optional)
5. `placement` (**required** ✅)
6. `productAutopilotStrategy` (optional)
7. `title` (optional)
8. `toDate` (optional)
9. `weeklyBudget` (optional)

### Response:
- **200**: `extcampaignCampaignID` schema (campaignId)
- **default**: `rpcStatus` error schema

---

## 🔧 Сгенерированный MCP Tool

**Tool Name:** `CreateProductCampaignCPCV2` ✅  
**Description:** "Создать кампанию с оплатой за клики..." (truncated) ✅  
**Tags:** ["Ad"] ✅

### InputSchema:

| Параметр | Тип | Properties | Required | Статус |
|----------|-----|------------|----------|--------|
| `body` | object | ❌ NONE | ✅ | ❌ **КРИТИЧЕСКАЯ ПРОБЛЕМА** |

**Swagger specification:**
```json
{
  "type": "object",
  "required": ["placement"],
  "properties": {
    "ProductAdvPlacements": {...},
    "autoIncreasePercent": {...},
    "dailyBudget": {...},
    "fromDate": {...},
    "placement": {...},  // REQUIRED
    "productAutopilotStrategy": {...},
    "title": {...},
    "toDate": {...},
    "weeklyBudget": {...}
  }
}
```

**Generated:**
```json
{
  "body": {
    "type": "object",
    "description": "Request body"
  }
}
```

### Execution Code Analysis:

```typescript
// ✅ URL правильный
let url = '/api/client/campaign/cpc/v2/product';

// ✅ HTTP метод правильный
const response = await client.post(url, data, { params, headers });

// ✅ Body validation
if (!args.body) {
  throw new Error('Missing required request body');
}

// ✅ Request body передается
const data = args.body;
```

---

## ❌ КРИТИЧЕСКИЕ ПРОБЛЕМЫ

### 1. Полная потеря схемы request body

**Что потеряно:**
- ✅ 9 properties с типами и описаниями
- ✅ 1 required field (`placement`)
- ✅ Валидация типов для каждого поля
- ✅ Enum constraints (если есть)
- ✅ Format constraints
- ✅ Description для каждого поля

**Что осталось:**
- ❌ Только `body: object` без структуры

**Влияние:**
1. **Нет автодополнения** для пользователя в MCP клиенте
2. **Нет валидации** обязательных полей (`placement`)
3. **Нет подсказок** о типах данных
4. **Нет документации** о структуре запроса
5. Пользователь должен **самостоятельно читать Swagger** чтобы понять какие поля нужны

---

## ✅ Что работает корректно

| Критерий | Статус | Комментарий |
|----------|--------|-------------|
| **Название метода** | ✅ | CreateProductCampaignCPCV2 - точное соответствие |
| **HTTP метод** | ✅ | POST - корректно |
| **URL path** | ✅ | /api/client/campaign/cpc/v2/product |
| **Body передается** | ✅ | args.body корректно передается в POST |
| **Body required** | ✅ | Валидация наличия body |
| **Error handling** | ✅ | try-catch с контекстом |

---

## 🎯 Итоговая оценка

**Общая оценка:** 40% ❌

**Функциональность:** ⚠️ Работает, но требует ручного создания body  
**Схема параметров:** ❌ **КРИТИЧЕСКАЯ ПОТЕРЯ** - нет структуры request body  
**Выполнение кода:** ✅ Корректно реализовано  
**UX:** ❌ Пользователь не знает какие поля передавать

**Вывод:** Метод технически работает, но **практически непригоден** без документации Swagger. Генератор должен разворачивать схему request body с полной структурой properties вместо generic object.

---

## 🔧 Как должно быть

```json
{
  "inputSchema": {
    "type": "object",
    "properties": {
      "ProductAdvPlacements": {
        "type": "array",
        "description": "...",
        "items": {...}
      },
      "placement": {
        "type": "string",
        "enum": ["PLACEMENT_PDP", "PLACEMENT_SEARCH", "..."],
        "description": "Площадка размещения рекламы"
      },
      "dailyBudget": {
        "type": "string",
        "format": "uint64",
        "description": "Дневной бюджет кампании в копейках"
      },
      // ... остальные 6 полей
    },
    "required": ["placement"],
    "additionalProperties": false
  }
}
```
