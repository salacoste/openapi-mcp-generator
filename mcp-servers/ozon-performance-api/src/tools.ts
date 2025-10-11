/**
 * MCP Tool Definitions
 * Generated from OpenAPI specification
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { httpClient } from './http-client.js';


/**
 * Список кампаний
 */
export const ListCampaignsTool: Tool = {
  "name": "ListCampaigns",
  "description": "Список кампаний",
  "inputSchema": {
    "type": "object",
    "properties": {
      "campaignIds": {
        "type": "array",
        "description": "Список идентификаторов кампаний, для которых необходимо вывести информацию.\n\nЕсли передать значение, то в ответе будет информация по кампаниям, которые указаны\nв поле `campaigns`. Если поле пустое, информация будет отдана по всем кампаниям.\n",
        "items": {
          "type": "string",
          "format": "uint64"
        }
      },
      "advObjectType": {
        "type": "string",
        "description": "Тип рекламируемой кампании:\n- `SKU` — Оплата за клик;\n- `BANNER` — Баннерная рекламная кампания;\n- `SEARCH_PROMO` — Оплата за заказ.\n\n[Подробнее о типах рекламных кампаний](https://seller-edu.ozon.ru/docs/advertising/reklamnye-kampanii.html)\n"
      },
      "state": {
        "type": "string",
        "description": "Состояние кампании.\n\nВозможные значения:\n- `CAMPAIGN_STATE_RUNNING` — активная кампания;\n- `CAMPAIGN_STATE_PLANNED` — кампания, сроки проведения которой ещё не наступили;\n- `CAMPAIGN_STATE_STOPPED` — кампания, приостановленная из-за нехватки бюджета;\n- `CAMPAIGN_STATE_INACTIVE` — кампания, остановленная владельцем;\n- `CAMPAIGN_STATE_ARCHIVED` — архивная кампания;\n- `CAMPAIGN_STATE_MODERATION_DRAFT` — отредактированная кампания до отправки на модерацию;\n- `CAMPAIGN_STATE_MODERATION_IN_PROGRESS` — кампания, отправленная на модерацию;\n- `CAMPAIGN_STATE_MODERATION_FAILED` — кампания, непрошедшая модерацию;\n- `CAMPAIGN_STATE_FINISHED` — кампания завершена, дата окончания в прошлом, такую кампанию нельзя изменить, можно\nтолько клонировать или создать новую.\n",
        "enum": [
          "CAMPAIGN_STATE_UNKNOWN",
          "CAMPAIGN_STATE_RUNNING",
          "CAMPAIGN_STATE_PLANNED",
          "CAMPAIGN_STATE_STOPPED",
          "CAMPAIGN_STATE_INACTIVE",
          "CAMPAIGN_STATE_ARCHIVED",
          "CAMPAIGN_STATE_MODERATION_DRAFT",
          "CAMPAIGN_STATE_MODERATION_IN_PROGRESS",
          "CAMPAIGN_STATE_MODERATION_FAILED",
          "CAMPAIGN_STATE_FINISHED"
        ],
        "default": "CAMPAIGN_STATE_UNKNOWN"
      },
      "page": {
        "type": "integer",
        "description": "Номер страницы. Пагинация начинается с единицы.",
        "format": "int64"
      },
      "pageSize": {
        "type": "integer",
        "description": "Размер страницы.",
        "format": "int64"
      }
    },
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Build request URL\n      let url = '/api/client/campaign';\n\n      // Build query parameters\n      const params = {};\n      if (args.campaignIds !== undefined && args.campaignIds !== null) {\n        params['campaignIds'] = args.campaignIds;\n      }\n      if (args.advObjectType !== undefined && args.advObjectType !== null) {\n        params['advObjectType'] = args.advObjectType;\n      }\n      if (args.state !== undefined && args.state !== null) {\n        params['state'] = args.state;\n      } else {\n        params['state'] = \"CAMPAIGN_STATE_UNKNOWN\";\n      }\n      if (args.page !== undefined && args.page !== null) {\n        params['page'] = (typeof args.page === 'string' ? Number(args.page) : args.page);\n      }\n      if (args.pageSize !== undefined && args.pageSize !== null) {\n        params['pageSize'] = (typeof args.pageSize === 'string' ? Number(args.pageSize) : args.pageSize);\n      }\n\n      // Build custom headers\n      const headers = {};\n\n      // Execute HTTP request\n      const response = await client.get(url, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'ListCampaigns',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Campaign"
  ]
};


/**
 * Список продвигаемых объектов в кампании. 
Метод для получения списка продвигаемых объектов в кампаниях «Оплата за клик», «Баннеры» и «Видеобаннеры».

Чтобы получить товары в кампании «Оплата за заказ», используйте [POST /campaign/search_promo/v2/products](#operation/ExternalCampaign_ListSearchPro...
 */
export const ListCampaignObjectsTool: Tool = {
  "name": "ListCampaignObjects",
  "description": "Список продвигаемых объектов в кампании. \nМетод для получения списка продвигаемых объектов в кампаниях «Оплата за клик», «Баннеры» и «Видеобаннеры».\n\nЧтобы получить товары в кампании «Оплата за заказ», используйте [POST /campaign/search_promo/v2/products](#operation/ExternalCampaign_ListSearchPro...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "campaignId": {
        "type": "string",
        "description": "Идентификатор кампании.",
        "format": "uint64"
      }
    },
    "required": [
      "campaignId"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (args.campaignId === undefined || args.campaignId === null) {\n        throw new Error('Missing required path parameter: campaignId');\n      }\n\n      // Build request URL with path parameters\n      let url = '/api/client/campaign/{campaignId}/objects';\n      url = url.replace('{campaignId}', encodeURIComponent(String(args.campaignId)));\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Execute HTTP request\n      const response = await client.get(url, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'ListCampaignObjects',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Campaign"
  ]
};


/**
 * Лимиты ставок для инструментов продвижения. 
Вы можете получить лимиты ставок по инструментам:
- Оплата за заказ:
  - Минимальная и максимальная ставка для инструмента.
  - Минимальные ставки за заказ для некоторых категорий товаров.
- Спецразмещение и Оплата за клик:
  - Минимальная и максимальн...
 */
export const GetLimitsListTool: Tool = {
  "name": "GetLimitsList",
  "description": "Лимиты ставок для инструментов продвижения. \nВы можете получить лимиты ставок по инструментам:\n- Оплата за заказ:\n  - Минимальная и максимальная ставка для инструмента.\n  - Минимальные ставки за заказ для некоторых категорий товаров.\n- Спецразмещение и Оплата за клик:\n  - Минимальная и максимальн...",
  "inputSchema": {
    "type": "object",
    "properties": {},
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Build request URL\n      let url = '/api/client/limits/list';\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Execute HTTP request\n      const response = await client.get(url, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'GetLimitsList',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Campaign"
  ]
};


/**
 * Минимальная ставка для товаров по SKU. Используйте метод, чтобы узнать минимальную ставку для одного или нескольких товаров по SKU.
 */
export const ExternalCampaign_BidBySKUTool: Tool = {
  "name": "ExternalCampaign_BidBySKU",
  "description": "Минимальная ставка для товаров по SKU. Используйте метод, чтобы узнать минимальную ставку для одного или нескольких товаров по SKU.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "body": {
        "type": "object",
        "properties": {
          "marketplaceId": {
            "type": "string",
            "description": "Страна витрины:\n- `MARKETPLACE_ID_RU` — Россия;\n- `MARKETPLACE_ID_KZ` — Казахстан;\n- `MARKETPLACE_ID_BY` — Белоруссия.\n",
            "enum": [
              "MARKETPLACE_ID_RU",
              "MARKETPLACE_ID_KZ",
              "MARKETPLACE_ID_BY"
            ]
          },
          "paymentType": {
            "type": "string",
            "description": "Тип минимальной ставки:\n- `CPO` — по кампании «Оплата за заказ»;\n- `CPC` — по поиску и рекомендациям;\n- `CPC_TOP` — по поиску.\n",
            "enum": [
              "CPO",
              "CPC",
              "CPC_TOP"
            ]
          },
          "sku": {
            "type": "array",
            "description": "Идентификатор товара: Ozon ID или SKU.\n",
            "items": {
              "type": "string",
              "format": "uint64"
            }
          }
        }
      }
    },
    "required": [
      "body"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (!args.body) {\n        throw new Error('Missing required request body');\n      }\n\n      // Build request URL\n      let url = '/api/client/min/sku';\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'ExternalCampaign_BidBySKU',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Campaign"
  ]
};


/**
 * Статистика по кампании. 
В запросе укажите временной промежуток с помощью полей `from` и `to` или `dateFrom` и `dateTo`. Если заполнены все
четыре поля, в ответе будет статистика по временному промежутку из полей `dateFrom` и `dateTo`.

Performance API асинхронный. Поэтому в результате запроса бу...
 */
export const SubmitRequestTool: Tool = {
  "name": "SubmitRequest",
  "description": "Статистика по кампании. \nВ запросе укажите временной промежуток с помощью полей `from` и `to` или `dateFrom` и `dateTo`. Если заполнены все\nчетыре поля, в ответе будет статистика по временному промежутку из полей `dateFrom` и `dateTo`.\n\nPerformance API асинхронный. Поэтому в результате запроса бу...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "body": {
        "type": "object",
        "description": "Структура исходного запроса.",
        "properties": {
          "campaigns": {
            "type": "array",
            "description": "Список идентификаторов кампаний, для которых необходимо подготовить отчёт.\n\nФормат отчёта:\n- CSV — если в списке одна кампания.\n- ZIP архив — если в списке несколько кампаний. Каждый файл соответствует одной кампании из списка. Имя файла вида `<идентификатор кампании>.csv`.\n",
            "items": {
              "type": "string",
              "format": "uint64"
            }
          },
          "from": {
            "type": "string",
            "description": "Начальная дата периода отчёта в формате RFC 3339.\n\nМаксимальный период, за который можно получить отчёт — 62 дня.\n",
            "format": "date-time"
          },
          "to": {
            "type": "string",
            "description": "Конечная дата периода отчёта в формате RFC 3339.\n\nМаксимальный период, за который можно получить отчёт — 62 дня.\n",
            "format": "date-time"
          },
          "dateFrom": {
            "type": "string",
            "description": "Начальная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.\n"
          },
          "dateTo": {
            "type": "string",
            "description": "Конечная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.\n"
          },
          "groupBy": {
            "type": "string",
            "description": "Тип группировки по времени:\n- `DATE` — группировка по дате (по дням);\n- `START_OF_WEEK` — группировка по неделям;\n- `START_OF_MONTH` — группировка по месяцам.\n",
            "enum": [
              "NO_GROUP_BY",
              "DATE",
              "START_OF_WEEK",
              "START_OF_MONTH"
            ]
          }
        },
        "required": [
          "campaigns"
        ]
      }
    },
    "required": [
      "body"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (!args.body) {\n        throw new Error('Missing required request body');\n      }\n\n      // Build request URL\n      let url = '/api/client/statistics';\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'SubmitRequest',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Statistics"
  ]
};


/**
 * Статистика по показам видеобаннера. 
В запросе укажите временной промежуток с помощью полей `dateFrom` и `dateTo`.

Performance API асинхронный. Поэтому в результате запроса будет не сам отчёт, а уникальный идентификатор
отправленного запроса, с помощью которого можно [проверить статус формирован...
 */
export const VideoCampaignsSubmitRequestTool: Tool = {
  "name": "VideoCampaignsSubmitRequest",
  "description": "Статистика по показам видеобаннера. \nВ запросе укажите временной промежуток с помощью полей `dateFrom` и `dateTo`.\n\nPerformance API асинхронный. Поэтому в результате запроса будет не сам отчёт, а уникальный идентификатор\nотправленного запроса, с помощью которого можно [проверить статус формирован...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "body": {
        "type": "object",
        "description": "Структура исходного запроса.",
        "properties": {
          "campaigns": {
            "type": "array",
            "description": "Список идентификаторов кампаний, для которых необходимо подготовить отчёт.\n\nФормат отчёта:\n- CSV — если в списке одна кампания.\n- ZIP архив — если в списке несколько кампаний. Каждый файл соответствует одной кампании из списка. Имя файла вида `<идентификатор кампании>.csv`.\n",
            "items": {
              "type": "string",
              "format": "uint64"
            }
          },
          "dateFrom": {
            "type": "string",
            "description": "Начальная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.\n"
          },
          "dateTo": {
            "type": "string",
            "description": "Конечная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.\n"
          },
          "groupBy": {
            "type": "string",
            "description": "Тип группировки по времени:\n- `DATE` — группировка по дате (по дням);\n- `START_OF_WEEK` — группировка по неделям;\n- `START_OF_MONTH` — группировка по месяцам.\n",
            "enum": [
              "NO_GROUP_BY",
              "DATE",
              "START_OF_WEEK",
              "START_OF_MONTH"
            ]
          }
        },
        "required": [
          "campaigns"
        ]
      }
    },
    "required": [
      "body"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (!args.body) {\n        throw new Error('Missing required request body');\n      }\n\n      // Build request URL\n      let url = '/api/client/statistics/video';\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'VideoCampaignsSubmitRequest',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Statistics"
  ]
};


/**
 * Отчёт по заказам. 
Метод для получения отчёта по заказам на баннеры.

В запросе укажите временной промежуток с помощью полей `from` и `to` или `dateFrom` и `dateTo`. Если заполнены все
   четыре поля, в ответе будет статистика по временному промежутку из полей `dateFrom` и `dateTo`.

Performance ...
 */
export const AttributionSubmitRequestTool: Tool = {
  "name": "AttributionSubmitRequest",
  "description": "Отчёт по заказам. \nМетод для получения отчёта по заказам на баннеры.\n\nВ запросе укажите временной промежуток с помощью полей `from` и `to` или `dateFrom` и `dateTo`. Если заполнены все\n   четыре поля, в ответе будет статистика по временному промежутку из полей `dateFrom` и `dateTo`.\n\nPerformance ...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "body": {
        "type": "object",
        "description": "Структура исходного запроса.",
        "properties": {
          "campaigns": {
            "type": "array",
            "description": "Список идентификаторов кампаний, для которых необходимо подготовить отчёт.\n\nФормат отчёта:\n- CSV — если в списке одна кампания.\n- ZIP архив — если в списке несколько кампаний. Каждый файл соответствует одной кампании из списка. Имя файла вида `<идентификатор кампании>.csv`.\n",
            "items": {
              "type": "string",
              "format": "uint64"
            }
          },
          "from": {
            "type": "string",
            "description": "Начальная дата периода отчёта в формате RFC 3339.\n\nМаксимальный период, за который можно получить отчёт — 62 дня.\n",
            "format": "date-time"
          },
          "to": {
            "type": "string",
            "description": "Конечная дата периода отчёта в формате RFC 3339.\n\nМаксимальный период, за который можно получить отчёт — 62 дня.\n",
            "format": "date-time"
          },
          "dateFrom": {
            "type": "string",
            "description": "Начальная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.\n"
          },
          "dateTo": {
            "type": "string",
            "description": "Конечная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.\n"
          },
          "groupBy": {
            "type": "string",
            "description": "Тип группировки по времени:\n- `DATE` — группировка по дате (по дням);\n- `START_OF_WEEK` — группировка по неделям;\n- `START_OF_MONTH` — группировка по месяцам.\n",
            "enum": [
              "NO_GROUP_BY",
              "DATE",
              "START_OF_WEEK",
              "START_OF_MONTH"
            ]
          }
        },
        "required": [
          "campaigns"
        ]
      }
    },
    "required": [
      "body"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (!args.body) {\n        throw new Error('Missing required request body');\n      }\n\n      // Build request URL\n      let url = '/api/client/statistics/attribution';\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'AttributionSubmitRequest',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Statistics"
  ]
};


/**
 * Cтатус отчёта
 */
export const StatisticsCheckTool: Tool = {
  "name": "StatisticsCheck",
  "description": "Cтатус отчёта",
  "inputSchema": {
    "type": "object",
    "properties": {
      "UUID": {
        "type": "string",
        "description": "Уникальный идентификатор запроса."
      }
    },
    "required": [
      "UUID"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (args.UUID === undefined || args.UUID === null) {\n        throw new Error('Missing required path parameter: UUID');\n      }\n\n      // Build request URL with path parameters\n      let url = '/api/client/statistics/{UUID}';\n      url = url.replace('{UUID}', encodeURIComponent(String(args.UUID)));\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Execute HTTP request\n      const response = await client.get(url, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'StatisticsCheck',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Statistics"
  ]
};


/**
 * Список отчётов, сгенерированных через интерфейс. 
Метод для получения списка отчётов, которые сгенерированы через интерфейс рекламного кабинета.

 */
export const ListReportsTool: Tool = {
  "name": "ListReports",
  "description": "Список отчётов, сгенерированных через интерфейс. \nМетод для получения списка отчётов, которые сгенерированы через интерфейс рекламного кабинета.\n",
  "inputSchema": {
    "type": "object",
    "properties": {
      "page": {
        "type": "integer",
        "description": "Номер страницы.",
        "format": "int64"
      },
      "pageSize": {
        "type": "integer",
        "description": "Размер страницы.",
        "format": "int64"
      }
    },
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Build request URL\n      let url = '/api/client/statistics/list';\n\n      // Build query parameters\n      const params = {};\n      if (args.page !== undefined && args.page !== null) {\n        params['page'] = (typeof args.page === 'string' ? Number(args.page) : args.page);\n      }\n      if (args.pageSize !== undefined && args.pageSize !== null) {\n        params['pageSize'] = (typeof args.pageSize === 'string' ? Number(args.pageSize) : args.pageSize);\n      }\n\n      // Build custom headers\n      const headers = {};\n\n      // Execute HTTP request\n      const response = await client.get(url, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'ListReports',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Statistics"
  ]
};


/**
 * Список отчётов, сгенерированных через API. 
Метод для получения списка отчётов, которые сгенерированы через API сервисными аккаунтами.

 */
export const ListReportsExternalTool: Tool = {
  "name": "ListReportsExternal",
  "description": "Список отчётов, сгенерированных через API. \nМетод для получения списка отчётов, которые сгенерированы через API сервисными аккаунтами.\n",
  "inputSchema": {
    "type": "object",
    "properties": {
      "page": {
        "type": "integer",
        "description": "Номер страницы.",
        "format": "int64"
      },
      "pageSize": {
        "type": "integer",
        "description": "Размер страницы.",
        "format": "int64"
      }
    },
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Build request URL\n      let url = '/api/client/statistics/externallist';\n\n      // Build query parameters\n      const params = {};\n      if (args.page !== undefined && args.page !== null) {\n        params['page'] = (typeof args.page === 'string' ? Number(args.page) : args.page);\n      }\n      if (args.pageSize !== undefined && args.pageSize !== null) {\n        params['pageSize'] = (typeof args.pageSize === 'string' ? Number(args.pageSize) : args.pageSize);\n      }\n\n      // Build custom headers\n      const headers = {};\n\n      // Execute HTTP request\n      const response = await client.get(url, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'ListReportsExternal',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Statistics"
  ]
};


/**
 * Получить отчёты. При успешном запросе ссылка на скачивание отчёта в формате CSV или ZIP появится в поле `link` при использовании метода [«Статус отчета»](#operation/StatisticsCheck).

Формат отчёта в заголовке ответа указан в поле `content-type`. Формат зависит от того, сколько кампаний в поле `c...
 */
export const DownloadStatisticsTool: Tool = {
  "name": "DownloadStatistics",
  "description": "Получить отчёты. При успешном запросе ссылка на скачивание отчёта в формате CSV или ZIP появится в поле `link` при использовании метода [«Статус отчета»](#operation/StatisticsCheck).\n\nФормат отчёта в заголовке ответа указан в поле `content-type`. Формат зависит от того, сколько кампаний в поле `c...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "UUID": {
        "type": "string",
        "description": "Уникальный идентификатор запроса."
      }
    },
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Build request URL\n      let url = '/api/client/statistics/report';\n\n      // Build query parameters\n      const params = {};\n      if (args.UUID !== undefined && args.UUID !== null) {\n        params['UUID'] = args.UUID;\n      }\n\n      // Build custom headers\n      const headers = {};\n\n      // Execute HTTP request\n      const response = await client.get(url, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format text/CSV response for MCP protocol (preserve raw text)\n      const isTextResponse = typeof response === 'string' ||\n                             response?.headers?.['content-type']?.includes('text/');\n\n      return {\n        content: [\n          {\n            type: 'text',\n            text: isTextResponse\n              ? String(response.data || response)\n              : JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'DownloadStatistics',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Statistics"
  ]
};


/**
 * Статистика по медийным кампаниям. 
В запросе укажите временной промежуток с помощью полей `from` и `to` или `dateFrom` и `dateTo`. Если заполнены все
четыре поля, в ответе будет статистика по временному промежутку из полей `dateFrom` и `dateTo`.

Формат отчёта — CSV. 

Чтобы запросить отчёт в фор...
 */
export const MediaCampaignListTool: Tool = {
  "name": "MediaCampaignList",
  "description": "Статистика по медийным кампаниям. \nВ запросе укажите временной промежуток с помощью полей `from` и `to` или `dateFrom` и `dateTo`. Если заполнены все\nчетыре поля, в ответе будет статистика по временному промежутку из полей `dateFrom` и `dateTo`.\n\nФормат отчёта — CSV. \n\nЧтобы запросить отчёт в фор...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "campaignIds": {
        "type": "array",
        "description": "Список идентификаторов кампаний, для которых необходимо подготовить отчёт.\n\nЕсли поле заполнено, в отчёте будет статистика только по указанным кампаниям. Если поле пустое, в ответе будет\nстатистика по всем кампаниям в указанном промежутке времени.\n\nНеобязательное поле.\n",
        "items": {
          "type": "string",
          "format": "uint64"
        }
      },
      "from": {
        "type": "string",
        "description": "Начальная дата периода отчёта в формате RFC3339.\n\nНеобязательное поле.\n",
        "format": "date-time"
      },
      "to": {
        "type": "string",
        "description": "Конечная дата периода отчёта в формате RFC3339.\n\nНеобязательное поле.\n",
        "format": "date-time"
      },
      "dateFrom": {
        "type": "string",
        "description": "Начальная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.\n\nНеобязательное поле.\n"
      },
      "dateTo": {
        "type": "string",
        "description": "Начальная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.\n\nНеобязательное поле.\n"
      }
    },
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Build request URL\n      let url = '/api/client/statistics/campaign/media';\n\n      // Build query parameters\n      const params = {};\n      if (args.campaignIds !== undefined && args.campaignIds !== null) {\n        params['campaignIds'] = args.campaignIds;\n      }\n      if (args.from !== undefined && args.from !== null) {\n        params['from'] = args.from;\n      }\n      if (args.to !== undefined && args.to !== null) {\n        params['to'] = args.to;\n      }\n      if (args.dateFrom !== undefined && args.dateFrom !== null) {\n        params['dateFrom'] = args.dateFrom;\n      }\n      if (args.dateTo !== undefined && args.dateTo !== null) {\n        params['dateTo'] = args.dateTo;\n      }\n\n      // Build custom headers\n      const headers = {};\n\n      // Execute HTTP request\n      const response = await client.get(url, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'MediaCampaignList',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Statistics"
  ]
};


/**
 * Статистика по кампаниям Оплата за клик и Спецразмещение. 
В запросе укажите временной промежуток с помощью полей `from` и `to` или `dateFrom` и `dateTo`. Если заполнены все
четыре поля, в ответе будет статистика по временному промежутку из полей `dateFrom` и `dateTo`.

Формат отчёта — CSV. 

Чтоб...
 */
export const ProductCampaignListTool: Tool = {
  "name": "ProductCampaignList",
  "description": "Статистика по кампаниям Оплата за клик и Спецразмещение. \nВ запросе укажите временной промежуток с помощью полей `from` и `to` или `dateFrom` и `dateTo`. Если заполнены все\nчетыре поля, в ответе будет статистика по временному промежутку из полей `dateFrom` и `dateTo`.\n\nФормат отчёта — CSV. \n\nЧтоб...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "campaignIds": {
        "type": "array",
        "description": "Список идентификаторов кампаний, для которых необходимо подготовить отчёт.\n\nЕсли поле заполнено, в отчёте будет статистика только по указанным кампаниям. Если поле пустое, в ответе будет\nстатистика по всем кампаниям в указанном промежутке времени.\n\nНеобязательное поле.\n",
        "items": {
          "type": "string",
          "format": "uint64"
        }
      },
      "from": {
        "type": "string",
        "description": "Начальная дата периода отчёта в формате RFC3339.\n\nНеобязательное поле.\n",
        "format": "date-time"
      },
      "to": {
        "type": "string",
        "description": "Конечная дата периода отчёта в формате RFC3339.\n\nНеобязательное поле.\n",
        "format": "date-time"
      },
      "dateFrom": {
        "type": "string",
        "description": "Начальная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.\n\nНеобязательное поле.\n"
      },
      "dateTo": {
        "type": "string",
        "description": "Начальная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.\n\nНеобязательное поле.\n"
      }
    },
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Build request URL\n      let url = '/api/client/statistics/campaign/product';\n\n      // Build query parameters\n      const params = {};\n      if (args.campaignIds !== undefined && args.campaignIds !== null) {\n        params['campaignIds'] = args.campaignIds;\n      }\n      if (args.from !== undefined && args.from !== null) {\n        params['from'] = args.from;\n      }\n      if (args.to !== undefined && args.to !== null) {\n        params['to'] = args.to;\n      }\n      if (args.dateFrom !== undefined && args.dateFrom !== null) {\n        params['dateFrom'] = args.dateFrom;\n      }\n      if (args.dateTo !== undefined && args.dateTo !== null) {\n        params['dateTo'] = args.dateTo;\n      }\n\n      // Build custom headers\n      const headers = {};\n\n      // Execute HTTP request\n      const response = await client.get(url, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'ProductCampaignList',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Statistics"
  ]
};


/**
 * Статистика по расходу кампаний. 
Если в запросе не указаны значения полей `dateFrom` и `dateTo`, то в ответе будет статистика за последние 7 дней.

Формат отчёта — CSV. 

Чтобы запросить отчёт в формате JSON, добавьте в адрес метода `/json` и отправьте запрос по адресу `/api/client/statistics/exp...
 */
export const GetCampaignExpenseTool: Tool = {
  "name": "GetCampaignExpense",
  "description": "Статистика по расходу кампаний. \nЕсли в запросе не указаны значения полей `dateFrom` и `dateTo`, то в ответе будет статистика за последние 7 дней.\n\nФормат отчёта — CSV. \n\nЧтобы запросить отчёт в формате JSON, добавьте в адрес метода `/json` и отправьте запрос по адресу `/api/client/statistics/exp...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "campaignIds": {
        "type": "array",
        "description": "Список идентификаторов кампаний, для которых необходимо подготовить отчёт.\n\nЕсли поле заполнено, в отчёте будет статистика только по указанным кампаниям. Если поле пустое, в ответе будет\nстатистика по всем кампаниям в указанном промежутке времени.\n\nНеобязательное поле.\n",
        "items": {
          "type": "string",
          "format": "uint64"
        }
      },
      "dateFrom": {
        "type": "string",
        "description": "Начальная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.\n\nНеобязательное поле.\n"
      },
      "dateTo": {
        "type": "string",
        "description": "Начальная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.\n\nНеобязательное поле.\n"
      }
    },
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Build request URL\n      let url = '/api/client/statistics/expense';\n\n      // Build query parameters\n      const params = {};\n      if (args.campaignIds !== undefined && args.campaignIds !== null) {\n        params['campaignIds'] = args.campaignIds;\n      }\n      if (args.dateFrom !== undefined && args.dateFrom !== null) {\n        params['dateFrom'] = args.dateFrom;\n      }\n      if (args.dateTo !== undefined && args.dateTo !== null) {\n        params['dateTo'] = args.dateTo;\n      }\n\n      // Build custom headers\n      const headers = {};\n\n      // Execute HTTP request\n      const response = await client.get(url, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'GetCampaignExpense',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Statistics"
  ]
};


/**
 * Дневная статистика по кампаниям. 
Если в запросе не указаны значения полей `dateFrom` и `dateTo`, то в ответе будет статистика за последние 7 дней.

Формат отчёта — CSV. 

Чтобы запросить отчёт в формате JSON, добавьте в адрес метода `/json` и отправьте запрос по адресу `/api/client/statistics/da...
 */
export const GetCampaignDailyStatsTool: Tool = {
  "name": "GetCampaignDailyStats",
  "description": "Дневная статистика по кампаниям. \nЕсли в запросе не указаны значения полей `dateFrom` и `dateTo`, то в ответе будет статистика за последние 7 дней.\n\nФормат отчёта — CSV. \n\nЧтобы запросить отчёт в формате JSON, добавьте в адрес метода `/json` и отправьте запрос по адресу `/api/client/statistics/da...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "campaignIds": {
        "type": "array",
        "description": "Список идентификаторов кампаний, для которых необходимо подготовить отчёт.\n\nЕсли поле заполнено, в отчёте будет статистика только по указанным кампаниям. Если поле пустое, в ответе будет\nстатистика по всем кампаниям в указанном промежутке времени.\n\nНеобязательное поле.\n",
        "items": {
          "type": "string",
          "format": "uint64"
        }
      },
      "dateFrom": {
        "type": "string",
        "description": "Начальная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.\n\nНеобязательное поле.\n"
      },
      "dateTo": {
        "type": "string",
        "description": "Начальная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.\n\nНеобязательное поле.\n"
      }
    },
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Build request URL\n      let url = '/api/client/statistics/daily';\n\n      // Build query parameters\n      const params = {};\n      if (args.campaignIds !== undefined && args.campaignIds !== null) {\n        params['campaignIds'] = args.campaignIds;\n      }\n      if (args.dateFrom !== undefined && args.dateFrom !== null) {\n        params['dateFrom'] = args.dateFrom;\n      }\n      if (args.dateTo !== undefined && args.dateTo !== null) {\n        params['dateTo'] = args.dateTo;\n      }\n\n      // Build custom headers\n      const headers = {};\n\n      // Execute HTTP request\n      const response = await client.get(url, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'GetCampaignDailyStats',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Statistics"
  ]
};


/**
 * Отчёт по заказам в оплате за заказ. 
В параметрах запроса `from` и `to` укажите промежуток времени.

Performance API асинхронный.
Поэтому в результате запроса будет не сам отчёт, а уникальный идентификатор отправленного запроса, с помощью которого можно [проверить статус формирования отчёта](#ope...
 */
export const SearchPromoOrdersReportSubmitRequestTool: Tool = {
  "name": "SearchPromoOrdersReportSubmitRequest",
  "description": "Отчёт по заказам в оплате за заказ. \nВ параметрах запроса `from` и `to` укажите промежуток времени.\n\nPerformance API асинхронный.\nПоэтому в результате запроса будет не сам отчёт, а уникальный идентификатор отправленного запроса, с помощью которого можно [проверить статус формирования отчёта](#ope...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "body": {
        "type": "object"
      }
    },
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Build request URL\n      let url = '/api/client/statistic/orders/generate';\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'SearchPromoOrdersReportSubmitRequest',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Statistics"
  ]
};


/**
 * Отчёт по товарам в оплате за заказ. 
В параметрах запроса `from` и `to` укажите промежуток времени.

Performance API асинхронный.
Поэтому в результате запроса будет не сам отчёт, а уникальный идентификатор отправленного запроса, с помощью которого можно [проверить статус формирования отчёта](#ope...
 */
export const SearchPromoProductsReportSubmitRequestTool: Tool = {
  "name": "SearchPromoProductsReportSubmitRequest",
  "description": "Отчёт по товарам в оплате за заказ. \nВ параметрах запроса `from` и `to` укажите промежуток времени.\n\nPerformance API асинхронный.\nПоэтому в результате запроса будет не сам отчёт, а уникальный идентификатор отправленного запроса, с помощью которого можно [проверить статус формирования отчёта](#ope...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "body": {
        "type": "object"
      }
    },
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Build request URL\n      let url = '/api/client/statistic/products/generate';\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'SearchPromoProductsReportSubmitRequest',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Statistics"
  ]
};


/**
 * Создать кампанию с оплатой за клики. 
Метод для создания товарной рекламной кампании с оплатой за клики.

При успешном выполнении запроса в поле `campaignId` ответа будет идентификатор созданной кампании.

Чтобы создать кампании со спецразмещением, в запросе укажите `placement = PLACEMENT_OVERTOP...
 */
export const CreateProductCampaignCPCV2Tool: Tool = {
  "name": "CreateProductCampaignCPCV2",
  "description": "Создать кампанию с оплатой за клики. \nМетод для создания товарной рекламной кампании с оплатой за клики.\n\nПри успешном выполнении запроса в поле `campaignId` ответа будет идентификатор созданной кампании.\n\nЧтобы создать кампании со спецразмещением, в запросе укажите `placement = PLACEMENT_OVERTOP...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "body": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string",
            "description": "Название рекламной кампании."
          },
          "fromDate": {
            "type": "string",
            "description": "Дата начала рекламной кампании по московскому времени.\n\nЕсли параметр не заполнен, датой старта считается начало текущего дня. \nОткрутка начинается сразу после активации кампании, если не нужна модерация.\n"
          },
          "toDate": {
            "type": "string",
            "description": "Дата окончания рекламной кампании по московскому времени. \nПараметр не учитывается для кампаний с оплатой за клики, созданных в автоматическом режиме.\n"
          },
          "dailyBudget": {
            "type": "string",
            "description": "Ограничение дневного бюджета рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до\nкопеек. Например, значение `1 000 000` в параметре равно 1 рублю.\n\nЕсли параметр не заполнен, дневной бюджет не ограничен. После создания рекламной кампании изменить бюджет с дневного на недельный и наоборот не получится.\n",
            "format": "uint64"
          },
          "weeklyBudget": {
            "type": "string",
            "description": "Ограничение недельного бюджета рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до\nкопеек. Например, значение `1 000 000` в параметре равно 1 рублю.\n\nЕсли параметр не заполнен, недельный бюджет не ограничен. После создания рекламной кампании изменить бюджет с недельного на дневной и наоборот не получится.\n",
            "format": "uint64"
          },
          "placement": {
            "type": "string",
            "description": "Место размещения продвигаемых товаров:\n- `PLACEMENT_TOP_PROMOTION` — поиск.\n- `PLACEMENT_INVALID` — не определено.\n- `PLACEMENT_SEARCH_AND_CATEGORY` — поиск и рекомендации.\n- `PLACEMENT_OVERTOP` — поиск и главная (Спецразмещение).\n",
            "enum": [
              "PLACEMENT_TOP_PROMOTION",
              "PLACEMENT_INVALID",
              "PLACEMENT_SEARCH_AND_CATEGORY",
              "PLACEMENT_OVERTOP"
            ]
          },
          "productAutopilotStrategy": {
            "type": "string",
            "description": "Автостратегия, которая будет использоваться для кампании:\n- `MAX_CLICKS` — максимум кликов для Поиска и рекомендаций;\n- `TOP_MAX_CLICKS` — максимум кликов для Поиска;\n- `TARGET_BIDS` — средняя стоимость клика для Поиска и рекомендаций;\n- `TAKEOVER` — спецразмещение для Поиска;\n- `NO_AUTO_STRATEGY` — не использовать автостратегию.\n",
            "enum": [
              "MAX_CLICKS",
              "TOP_MAX_CLICKS",
              "TARGET_BIDS",
              "TAKEOVER",
              "NO_AUTO_STRATEGY"
            ]
          },
          "autoIncreasePercent": {
            "type": "number",
            "description": "Процент автоподнятия бюджета, от `10` до `50`. <br>\n`0`, если автоподнятие отключено.\n",
            "format": "double"
          },
          "ProductAdvPlacements": {
            "type": "array",
            "description": "Тип спецразмещения:\n  - `PRODUCT_PLACEMENT_TYPE_MAIN` — спецразмещение на главной;\n  - `PRODUCT_PLACEMENT_TYPE_SEARCH` — спецразмещение в поиске;\n  - `PRODUCT_PLACEMENT_TYPE_MAIN` и `PRODUCT_PLACEMENT_TYPE_SEARCH` — спецразмещение в поиске и на главной.\n",
            "items": {
              "type": "string",
              "format": "int64"
            }
          }
        },
        "required": [
          "placement"
        ]
      }
    },
    "required": [
      "body"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (!args.body) {\n        throw new Error('Missing required request body');\n      }\n\n      // Build request URL\n      let url = '/api/client/campaign/cpc/v2/product';\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'CreateProductCampaignCPCV2',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Ad"
  ]
};


/**
 * Рассчитать минимальный бюджет кампании. <aside class="warning">
1 сентября 2025 года метод будет отключён. Теперь минимальный бюджет рассчитывается по формуле: <b>2&nbsp;000 рублей × 1 SKU</b>.
</aside>
 [DEPRECATED]
 */
export const CalculateDynamicBudgetTool: Tool = {
  "name": "CalculateDynamicBudget",
  "description": "Рассчитать минимальный бюджет кампании. <aside class=\"warning\">\n1 сентября 2025 года метод будет отключён. Теперь минимальный бюджет рассчитывается по формуле: <b>2&nbsp;000 рублей × 1 SKU</b>.\n</aside>\n [DEPRECATED]",
  "inputSchema": {
    "type": "object",
    "properties": {
      "body": {
        "type": "object",
        "properties": {
          "createCampaign": {
            "type": "object",
            "description": "Параметры для расчёта при создании кампании.",
            "properties": {
              "autopilotStrategy": {
                "type": "string",
                "description": "Автостратегия, которая будет использоваться для кампании:\n- `MAX_CLICKS` — максимум кликов для Поиска и рекомендаций;\n- `TOP_MAX_CLICKS` — максимум кликов для Поиска;\n- `TARGET_BIDS` — средняя стоимость клика для Поиска;\n- `NO_AUTO_STRATEGY` — не использовать автостратегию.\n",
                "enum": [
                  "MAX_CLICKS",
                  "TOP_MAX_CLICKS",
                  "TARGET_BIDS",
                  "NO_AUTO_STRATEGY"
                ]
              },
              "placement": {
                "type": "string",
                "description": "Место размещения рекламы:\n  - `CAMPAIGN_PLACEMENT_INVALID` — не определено;\n  - `CAMPAIGN_PLACEMENT_PDP` — карточка товара;\n  - `CAMPAIGN_PLACEMENT_SEARCH_AND_CATEGORY` — поиск и рекомендации;\n  - `CAMPAIGN_PLACEMENT_TOP_PROMOTION` — поиск;\n  - ~~`CAMPAIGN_PLACEMENT_TAKEOVER`~~ — одновременный показ товаров на первых 4 плитках. Значение устарело.\n",
                "enum": [
                  "CAMPAIGN_PLACEMENT_INVALID",
                  "CAMPAIGN_PLACEMENT_PDP",
                  "CAMPAIGN_PLACEMENT_SEARCH_AND_CATEGORY",
                  "CAMPAIGN_PLACEMENT_TOP_PROMOTION",
                  "CAMPAIGN_PLACEMENT_TAKEOVER"
                ]
              },
              "skusCount": {
                "type": "string",
                "description": "Количество товаров.",
                "format": "uint64"
              }
            }
          },
          "updateCampaign": {
            "type": "object",
            "description": "Параметры для расчёта при обновлении кампании.",
            "properties": {
              "addingSkus": {
                "type": "array",
                "description": "Товары, которые добавили в кампанию.",
                "items": {
                  "type": "string",
                  "format": "uint64"
                }
              },
              "autopilotStrategy": {
                "type": "object",
                "description": "Информация об автостратегии.",
                "properties": {
                  "strategy": {
                    "type": "string",
                    "description": "Автостратегия, которая будет использоваться для кампании:\n- `MAX_CLICKS` — максимум кликов для Поиска и рекомендаций;\n- `TOP_MAX_CLICKS` — максимум кликов для Поиска;\n- `TARGET_BIDS` — средняя стоимость клика для Поиска;\n- `NO_AUTO_STRATEGY` — не использовать автостратегию.\n",
                    "enum": [
                      "MAX_CLICKS",
                      "TOP_MAX_CLICKS",
                      "TARGET_BIDS",
                      "NO_AUTO_STRATEGY"
                    ]
                  }
                }
              },
              "campaignId": {
                "type": "string",
                "description": "Идентификатор кампании.",
                "format": "uint64"
              }
            }
          }
        }
      }
    },
    "required": [
      "body"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (!args.body) {\n        throw new Error('Missing required request body');\n      }\n\n      // Build request URL\n      let url = '/external/api/dynamic_budget';\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'CalculateDynamicBudget',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Ad"
  ]
};


/**
 * Активировать кампанию
 */
export const ActivateCampaignTool: Tool = {
  "name": "ActivateCampaign",
  "description": "Активировать кампанию",
  "inputSchema": {
    "type": "object",
    "properties": {
      "campaignId": {
        "type": "string",
        "description": "Идентификатор кампании.",
        "format": "uint64"
      },
      "body": {
        "type": "object"
      }
    },
    "required": [
      "campaignId",
      "body"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (args.campaignId === undefined || args.campaignId === null) {\n        throw new Error('Missing required path parameter: campaignId');\n      }\n      if (!args.body) {\n        throw new Error('Missing required request body');\n      }\n\n      // Build request URL with path parameters\n      let url = '/api/client/campaign/{campaignId}/activate';\n      url = url.replace('{campaignId}', encodeURIComponent(String(args.campaignId)));\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'ActivateCampaign',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Ad",
    "Edit"
  ]
};


/**
 * Выключить кампанию
 */
export const DeactivateCampaignTool: Tool = {
  "name": "DeactivateCampaign",
  "description": "Выключить кампанию",
  "inputSchema": {
    "type": "object",
    "properties": {
      "campaignId": {
        "type": "string",
        "description": "Идентификатор кампании.",
        "format": "uint64"
      },
      "body": {
        "type": "object"
      }
    },
    "required": [
      "campaignId",
      "body"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (args.campaignId === undefined || args.campaignId === null) {\n        throw new Error('Missing required path parameter: campaignId');\n      }\n      if (!args.body) {\n        throw new Error('Missing required request body');\n      }\n\n      // Build request URL with path parameters\n      let url = '/api/client/campaign/{campaignId}/deactivate';\n      url = url.replace('{campaignId}', encodeURIComponent(String(args.campaignId)));\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'DeactivateCampaign',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Ad",
    "Edit"
  ]
};


/**
 * Параметры кампании. 
Метод для изменения параметров кампании.

 */
export const PatchProductCampaignTool: Tool = {
  "name": "PatchProductCampaign",
  "description": "Параметры кампании. \nМетод для изменения параметров кампании.\n",
  "inputSchema": {
    "type": "object",
    "properties": {
      "campaignId": {
        "type": "string",
        "description": "Идентификатор кампании.",
        "format": "uint64"
      },
      "body": {
        "type": "object",
        "properties": {
          "autopilot": {
            "type": "object",
            "description": "Информация о кампании. Обязательный параметр, если в параметре `productAutopilotStrategy` включена автостратегия.",
            "properties": {
              "categoryId": {
                "type": "string",
                "description": "Идентификатор категории.",
                "format": "uint64"
              },
              "skuAddMode": {
                "type": "string",
                "description": "Разрешение на автоматическое добавление товаров из категории, которая указана в `categoryId`, в кампании с автостратегией `MAX_VIEWS`:\n\n- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN` — стратегия добавления товаров в кампанию не установлена;\n- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_MANUAL` — добавлять товары в кампанию можно только вручную;\n- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_AUTO` — можно добавлять товары категории `categoryId` в кампанию автоматически.\n\nЕсли тип разрешения пустой или было передано `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN`, добавлять товары в кампанию можно только вручную.\n\nДля кампаний без автостратегии `MAX_VIEWS` возвращается значение `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN`.\n",
                "enum": [
                  "PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN",
                  "PRODUCT_CAMPAIGN_SKU_ADD_MODE_MANUAL",
                  "PRODUCT_CAMPAIGN_SKU_ADD_MODE_AUTO"
                ]
              }
            }
          },
          "fromDate": {
            "type": "string",
            "description": "Дата начала рекламной кампании по московскому времени.\n\nНе может быть раньше текущей даты.\n"
          },
          "toDate": {
            "type": "string",
            "description": "Дата окончания рекламной кампании по московскому времени.\n\nНе может быть раньше даты начала.\n"
          },
          "budget": {
            "type": "string",
            "description": "Ограничение общего бюджета рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до копеек. Например, значение `1 000 000` в параметре равно 1 рублю.\n\nУчитывается только для автоматических кампаний брендов и агентств. \nВ других организациях установить новое ограничение общего бюджета не получится. Если у кампании уже установлен бюджет, можно:\n- Убрать ограничения: передайте `0` в этом параметре.\n- Не менять бюджет кампании. Когда он будет исчерпан, уберите ограничения бюджета или создайте новую кампанию с неограниченным бюджетом.\n",
            "format": "uint64"
          },
          "dailyBudget": {
            "type": "string",
            "description": "Ограничение дневного бюджета рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до копеек. Например, значение `1 000 000` в параметре равно 1 рублю.\n\nЕсли параметр не заполнен, дневной бюджет не ограничен. После создания рекламной кампании изменить бюджет с дневного на недельный и наоборот не получится.\n",
            "format": "uint64"
          },
          "weeklyBudget": {
            "type": "string",
            "description": "Ограничение недельного бюджета рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до\nкопеек. Например, значение `1 000 000` в параметре равно 1 рублю.\n\nЕсли параметр не заполнен, недельный бюджет не ограничен. После создания рекламной кампании изменить бюджет с недельного на дневной и наоборот не получится.\n",
            "format": "uint64"
          },
          "autoIncreasePercent": {
            "type": "number",
            "description": "Процент автоподнятия бюджета, от `10` до `50`. <br>\n`0`, если автоподнятие отключено.\n",
            "format": "double"
          },
          "ProductAdvPlacements": {
            "type": "array",
            "description": "Тип спецразмещения:\n  - `PRODUCT_PLACEMENT_TYPE_MAIN` — спецразмещение на главной;\n  - `PRODUCT_PLACEMENT_TYPE_SEARCH` — спецразмещение в поиске;\n  - `PRODUCT_PLACEMENT_TYPE_MAIN` и `PRODUCT_PLACEMENT_TYPE_SEARCH` — спецразмещение в поиске и на главной.\n",
            "items": {
              "type": "string",
              "format": "int64"
            }
          }
        }
      }
    },
    "required": [
      "campaignId",
      "body"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (args.campaignId === undefined || args.campaignId === null) {\n        throw new Error('Missing required path parameter: campaignId');\n      }\n      if (!args.body) {\n        throw new Error('Missing required request body');\n      }\n\n      // Build request URL with path parameters\n      let url = '/api/client/campaign/{campaignId}';\n      url = url.replace('{campaignId}', encodeURIComponent(String(args.campaignId)));\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.patch(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'PatchProductCampaign',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Ad",
    "Edit"
  ]
};


/**
 * Добавить товары в кампанию. 
В кампанию можно добавить не более 500 товаров.

**Рекомендации по заполнению параметров для разных кампаний**

- Для добавления в кампанию товаров передайте значения параметров `sku` и `bid`. Если параметр `bid` не указан, 
  автоматически задаётся конкурентная ставк...
 */
export const AddProductsTool: Tool = {
  "name": "AddProducts",
  "description": "Добавить товары в кампанию. \nВ кампанию можно добавить не более 500 товаров.\n\n**Рекомендации по заполнению параметров для разных кампаний**\n\n- Для добавления в кампанию товаров передайте значения параметров `sku` и `bid`. Если параметр `bid` не указан, \n  автоматически задаётся конкурентная ставк...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "campaignId": {
        "type": "string",
        "description": "Идентификатор кампании.",
        "format": "uint64"
      },
      "body": {
        "type": "object",
        "properties": {
          "bids": {
            "type": "array",
            "description": "Ставки за клики.",
            "items": {
              "type": "object",
              "properties": {
                "sku": {
                  "type": "string",
                  "description": "SKU рекламируемого товара.\n\nОбязательное поле.\n",
                  "format": "uint64"
                },
                "bid": {
                  "type": "string",
                  "description": "Ставка за 1 клик (CPC).\n",
                  "format": "uint64"
                }
              }
            }
          }
        }
      }
    },
    "required": [
      "campaignId",
      "body"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (args.campaignId === undefined || args.campaignId === null) {\n        throw new Error('Missing required path parameter: campaignId');\n      }\n      if (!args.body) {\n        throw new Error('Missing required request body');\n      }\n\n      // Build request URL with path parameters\n      let url = '/api/client/campaign/{campaignId}/products';\n      url = url.replace('{campaignId}', encodeURIComponent(String(args.campaignId)));\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'AddProducts',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Product"
  ]
};


/**
 * Обновить ставки товаров. 
Этот метод перезаписывает список стоп-слов и фразы со ставками. Исходные стоп-слова и фразы со ставками удаляются.

Чтобы обновить ставки в кампании с размещением в карточке товара, передайте значения параметров `sku` и `bid`.

Для кампаний с включённой автостратегией па...
 */
export const UpdateProductsTool: Tool = {
  "name": "UpdateProducts",
  "description": "Обновить ставки товаров. \nЭтот метод перезаписывает список стоп-слов и фразы со ставками. Исходные стоп-слова и фразы со ставками удаляются.\n\nЧтобы обновить ставки в кампании с размещением в карточке товара, передайте значения параметров `sku` и `bid`.\n\nДля кампаний с включённой автостратегией па...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "campaignId": {
        "type": "string",
        "description": "Идентификатор кампании.",
        "format": "uint64"
      },
      "body": {
        "type": "object",
        "properties": {
          "bids": {
            "type": "array",
            "description": "Ставки за клики.",
            "items": {
              "type": "object",
              "properties": {
                "sku": {
                  "type": "string",
                  "description": "SKU рекламируемого товара.\n",
                  "format": "uint64"
                },
                "bid": {
                  "type": "string",
                  "description": "Ставка за 1 клик (CPC).\n",
                  "format": "uint64"
                }
              },
              "required": [
                "sku",
                "bid"
              ]
            }
          }
        }
      }
    },
    "required": [
      "campaignId",
      "body"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (args.campaignId === undefined || args.campaignId === null) {\n        throw new Error('Missing required path parameter: campaignId');\n      }\n      if (!args.body) {\n        throw new Error('Missing required request body');\n      }\n\n      // Build request URL with path parameters\n      let url = '/api/client/campaign/{campaignId}/products';\n      url = url.replace('{campaignId}', encodeURIComponent(String(args.campaignId)));\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.put(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'UpdateProducts',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Product"
  ]
};


/**
 * Список товаров кампании
 */
export const GetProductsV2Tool: Tool = {
  "name": "GetProductsV2",
  "description": "Список товаров кампании",
  "inputSchema": {
    "type": "object",
    "properties": {
      "campaignId": {
        "type": "string",
        "description": "Идентификатор кампании.",
        "format": "uint64"
      },
      "page": {
        "type": "integer",
        "description": "Номер страницы.",
        "format": "int64"
      },
      "pageSize": {
        "type": "integer",
        "description": "Размер страницы.",
        "format": "int64"
      }
    },
    "required": [
      "campaignId"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (args.campaignId === undefined || args.campaignId === null) {\n        throw new Error('Missing required path parameter: campaignId');\n      }\n\n      // Build request URL with path parameters\n      let url = '/api/client/campaign/{campaignId}/v2/products';\n      url = url.replace('{campaignId}', encodeURIComponent(String(args.campaignId)));\n\n      // Build query parameters\n      const params = {};\n      if (args.page !== undefined && args.page !== null) {\n        params['page'] = (typeof args.page === 'string' ? Number(args.page) : args.page);\n      }\n      if (args.pageSize !== undefined && args.pageSize !== null) {\n        params['pageSize'] = (typeof args.pageSize === 'string' ? Number(args.pageSize) : args.pageSize);\n      }\n\n      // Build custom headers\n      const headers = {};\n\n      // Execute HTTP request\n      const response = await client.get(url, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'GetProductsV2',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Product"
  ]
};


/**
 * Удалить товары из кампании
 */
export const DeleteProductsTool: Tool = {
  "name": "DeleteProducts",
  "description": "Удалить товары из кампании",
  "inputSchema": {
    "type": "object",
    "properties": {
      "campaignId": {
        "type": "string",
        "description": "Идентификатор кампании.",
        "format": "uint64"
      },
      "body": {
        "type": "object",
        "properties": {
          "sku": {
            "type": "array",
            "description": "SKU продвигаемого товара.",
            "items": {
              "type": "string",
              "format": "uint64"
            }
          }
        }
      }
    },
    "required": [
      "campaignId",
      "body"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (args.campaignId === undefined || args.campaignId === null) {\n        throw new Error('Missing required path parameter: campaignId');\n      }\n      if (!args.body) {\n        throw new Error('Missing required request body');\n      }\n\n      // Build request URL with path parameters\n      let url = '/api/client/campaign/{campaignId}/products/delete';\n      url = url.replace('{campaignId}', encodeURIComponent(String(args.campaignId)));\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'DeleteProducts',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Product"
  ]
};


/**
 * Конкурентные ставки для товара. 
Если товар не добавлен в кампанию, в параметре `bid` будет значение `0`.
В одном запросе вы можете передать до 200 товаров.

 */
export const GetProductsCompetitiveBidsTool: Tool = {
  "name": "GetProductsCompetitiveBids",
  "description": "Конкурентные ставки для товара. \nЕсли товар не добавлен в кампанию, в параметре `bid` будет значение `0`.\nВ одном запросе вы можете передать до 200 товаров.\n",
  "inputSchema": {
    "type": "object",
    "properties": {
      "campaignId": {
        "type": "string",
        "description": "Идентификатор кампании."
      },
      "skus": {
        "type": "array",
        "description": "Список SKU товаров.",
        "items": {
          "type": "string"
        }
      }
    },
    "required": [
      "campaignId"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (args.campaignId === undefined || args.campaignId === null) {\n        throw new Error('Missing required path parameter: campaignId');\n      }\n\n      // Build request URL with path parameters\n      let url = '/api/client/campaign/{campaignId}/products/bids/competitive';\n      url = url.replace('{campaignId}', encodeURIComponent(String(args.campaignId)));\n\n      // Build query parameters\n      const params = {};\n      if (args.skus !== undefined && args.skus !== null) {\n        params['skus'] = args.skus;\n      }\n\n      // Build custom headers\n      const headers = {};\n\n      // Execute HTTP request\n      const response = await client.get(url, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'GetProductsCompetitiveBids',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Product"
  ]
};


/**
 * Список товаров в продвижении в оплате за заказ
 */
export const ExternalCampaign_ListSearchPromoProductsV2Tool: Tool = {
  "name": "ExternalCampaign_ListSearchPromoProductsV2",
  "description": "Список товаров в продвижении в оплате за заказ",
  "inputSchema": {
    "type": "object",
    "properties": {
      "body": {
        "type": "object",
        "properties": {
          "page": {
            "type": "integer",
            "description": "Номер страницы. Пагинация начинается с единицы.",
            "format": "int64"
          },
          "pageSize": {
            "type": "integer",
            "description": "Размер страницы.",
            "format": "int64"
          }
        }
      }
    },
    "required": [
      "body"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (!args.body) {\n        throw new Error('Missing required request body');\n      }\n\n      // Build request URL\n      let url = '/api/client/campaign/search_promo/v2/products';\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'ExternalCampaign_ListSearchPromoProductsV2',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "SearchPromo"
  ]
};


/**
 * Рекомендованные ставки для товаров. 
За один запрос вы можете передать до 200 SKU.
 [DEPRECATED]
 */
export const ExternalCampaign_GetProductsRecommendedBidsTool: Tool = {
  "name": "ExternalCampaign_GetProductsRecommendedBids",
  "description": "Рекомендованные ставки для товаров. \nЗа один запрос вы можете передать до 200 SKU.\n [DEPRECATED]",
  "inputSchema": {
    "type": "object",
    "properties": {
      "body": {
        "type": "object",
        "properties": {
          "skus": {
            "type": "array",
            "description": "Список идентификаторов товаров.",
            "items": {
              "type": "string",
              "format": "uint64"
            }
          }
        }
      }
    },
    "required": [
      "body"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (!args.body) {\n        throw new Error('Missing required request body');\n      }\n\n      // Build request URL\n      let url = '/api/client/search_promo/bids/recommendation';\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'ExternalCampaign_GetProductsRecommendedBids',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "SearchPromo"
  ]
};


/**
 * Установить ставку на товар. 
Если товар ещё не добавлен в продвижение, система добавит его автоматически.

В одном запросе можно передать максимум 1000 товаров.
 [DEPRECATED]
 */
export const ExternalCampaign_SetSearchPromoBidsV2Tool: Tool = {
  "name": "ExternalCampaign_SetSearchPromoBidsV2",
  "description": "Установить ставку на товар. \nЕсли товар ещё не добавлен в продвижение, система добавит его автоматически.\n\nВ одном запросе можно передать максимум 1000 товаров.\n [DEPRECATED]",
  "inputSchema": {
    "type": "object",
    "properties": {
      "body": {
        "type": "object",
        "properties": {
          "bids": {
            "type": "array",
            "description": "Значения ставок.",
            "items": {
              "type": "object",
              "properties": {
                "bid": {
                  "type": "number",
                  "description": "Ставка за 1 заказ (CPO), единица измерения — процент от цены товара.",
                  "format": "double"
                },
                "sku": {
                  "type": "string",
                  "description": "Идентификатор товара.",
                  "format": "uint64"
                }
              }
            }
          }
        }
      }
    },
    "required": [
      "body"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (!args.body) {\n        throw new Error('Missing required request body');\n      }\n\n      // Build request URL\n      let url = '/api/client/campaign/search_promo/v2/bids/set';\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'ExternalCampaign_SetSearchPromoBidsV2',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "SearchPromo"
  ]
};


/**
 * Получить фиксированные ставки для товаров. 
За один запрос вы можете передать до 200 SKU.

 */
export const ExternalCampaign_GetCPOMinBidsTool: Tool = {
  "name": "ExternalCampaign_GetCPOMinBids",
  "description": "Получить фиксированные ставки для товаров. \nЗа один запрос вы можете передать до 200 SKU.\n",
  "inputSchema": {
    "type": "object",
    "properties": {
      "body": {
        "type": "object",
        "properties": {
          "skus": {
            "type": "array",
            "description": "Список идентификаторов товаров.",
            "items": {
              "type": "string",
              "format": "uint64"
            }
          }
        }
      }
    },
    "required": [
      "body"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (!args.body) {\n        throw new Error('Missing required request body');\n      }\n\n      // Build request URL\n      let url = '/api/client/search_promo/get_cpo_min_bids';\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'ExternalCampaign_GetCPOMinBids',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "SearchPromo"
  ]
};


/**
 * Включить продвижение товара в оплате за заказ. 
В одном запросе можно передать максимум 1000 товаров.

 */
export const ExternalCampaign_BatchEnableProductsTool: Tool = {
  "name": "ExternalCampaign_BatchEnableProducts",
  "description": "Включить продвижение товара в оплате за заказ. \nВ одном запросе можно передать максимум 1000 товаров.\n",
  "inputSchema": {
    "type": "object",
    "properties": {
      "body": {
        "type": "object",
        "properties": {
          "skus": {
            "type": "array",
            "description": "Список идентификаторов товаров.",
            "items": {
              "type": "string",
              "format": "uint64"
            }
          }
        }
      }
    },
    "required": [
      "body"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (!args.body) {\n        throw new Error('Missing required request body');\n      }\n\n      // Build request URL\n      let url = '/api/client/search_promo/product/enable';\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'ExternalCampaign_BatchEnableProducts',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "SearchPromo"
  ]
};


/**
 * Отключить продвижение товара в оплате за заказ. 
В одном запросе можно передать максимум 1000 товаров.

 */
export const ExternalCampaign_BatchDisableProductsTool: Tool = {
  "name": "ExternalCampaign_BatchDisableProducts",
  "description": "Отключить продвижение товара в оплате за заказ. \nВ одном запросе можно передать максимум 1000 товаров.\n",
  "inputSchema": {
    "type": "object",
    "properties": {
      "body": {
        "type": "object",
        "properties": {
          "skus": {
            "type": "array",
            "description": "Список идентификаторов товаров.",
            "items": {
              "type": "string",
              "format": "uint64"
            }
          }
        }
      }
    },
    "required": [
      "body"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (!args.body) {\n        throw new Error('Missing required request body');\n      }\n\n      // Build request URL\n      let url = '/api/client/search_promo/product/disable';\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'ExternalCampaign_BatchDisableProducts',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "SearchPromo"
  ]
};


/**
 * Удалить товар из продвижения в оплате за заказ. 
В одном запросе можно передать максимум 1000 товаров.

 */
export const ExternalCampaign_DeleteSearchPromoBidsV2Tool: Tool = {
  "name": "ExternalCampaign_DeleteSearchPromoBidsV2",
  "description": "Удалить товар из продвижения в оплате за заказ. \nВ одном запросе можно передать максимум 1000 товаров.\n",
  "inputSchema": {
    "type": "object",
    "properties": {
      "body": {
        "type": "object",
        "properties": {
          "sku": {
            "type": "array",
            "description": "Список идентификаторов товаров.",
            "items": {
              "type": "string",
              "format": "uint64"
            }
          }
        }
      }
    },
    "required": [
      "body"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (!args.body) {\n        throw new Error('Missing required request body');\n      }\n\n      // Build request URL\n      let url = '/api/client/campaign/search_promo/v2/bids/delete';\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'ExternalCampaign_DeleteSearchPromoBidsV2',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "SearchPromo"
  ]
};


/**
 * Включить продвижение товаров в акции «Морковск». Участие в акции доступно только для продавцов.<br>
[Подробнее об акции](https://seller-edu.ozon.ru/how-to-sell-effectively/advertising-of-goods/morkovsk)

 */
export const ExternalCampaign_BatchEnableCarrots4Tool: Tool = {
  "name": "ExternalCampaign_BatchEnableCarrots4",
  "description": "Включить продвижение товаров в акции «Морковск». Участие в акции доступно только для продавцов.<br>\n[Подробнее об акции](https://seller-edu.ozon.ru/how-to-sell-effectively/advertising-of-goods/morkovsk)\n",
  "inputSchema": {
    "type": "object",
    "properties": {
      "body": {
        "type": "object",
        "properties": {
          "skus": {
            "type": "array",
            "description": "Список идентификаторов товаров.",
            "items": {
              "type": "string",
              "format": "uint64"
            }
          }
        },
        "required": [
          "skus"
        ]
      }
    },
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Build request URL\n      let url = '/api/client/campaign/search_promo/carrots/enable';\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'ExternalCampaign_BatchEnableCarrots4',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "SearchPromo"
  ]
};


/**
 * Отключить продвижение товаров в акции «Морковск». Участие в акции доступно только для продавцов.<br>
[Подробнее об акции](https://seller-edu.ozon.ru/how-to-sell-effectively/advertising-of-goods/morkovsk)

 */
export const ExternalCampaign_BatchDisableCarrots4Tool: Tool = {
  "name": "ExternalCampaign_BatchDisableCarrots4",
  "description": "Отключить продвижение товаров в акции «Морковск». Участие в акции доступно только для продавцов.<br>\n[Подробнее об акции](https://seller-edu.ozon.ru/how-to-sell-effectively/advertising-of-goods/morkovsk)\n",
  "inputSchema": {
    "type": "object",
    "properties": {
      "body": {
        "type": "object",
        "properties": {
          "skus": {
            "type": "array",
            "description": "Список идентификаторов товаров.",
            "items": {
              "type": "string",
              "format": "uint64"
            }
          }
        },
        "required": [
          "skus"
        ]
      }
    },
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Build request URL\n      let url = '/api/client/campaign/search_promo/carrots/disable';\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'ExternalCampaign_BatchDisableCarrots4',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "SearchPromo"
  ]
};


/**
 * Отчёт с аналитикой внешнего трафика. 
Метод для запуска формирования отчёта с аналитикой внешнего трафика.

Разница между `dateFrom` и `dateTo` должна быть не больше трёх месяцев. Если разница больше, 
отчёт сформируется за 3 месяца с даты, указанной в `dateFrom`.

 */
export const VendorStatisticsSubmitRequestTool: Tool = {
  "name": "VendorStatisticsSubmitRequest",
  "description": "Отчёт с аналитикой внешнего трафика. \nМетод для запуска формирования отчёта с аналитикой внешнего трафика.\n\nРазница между `dateFrom` и `dateTo` должна быть не больше трёх месяцев. Если разница больше, \nотчёт сформируется за 3 месяца с даты, указанной в `dateFrom`.\n",
  "inputSchema": {
    "type": "object",
    "properties": {
      "body": {
        "type": "object",
        "description": "Метод, с помощью которого запросили формирование отчёта.",
        "properties": {
          "dateFrom": {
            "type": "string",
            "description": "Начало отчётного периода.\n\nДата должна быть не ранее 1 января 2022 года.\n"
          },
          "dateTo": {
            "type": "string",
            "description": "Конец отчётного периода.\n\nДата должна быть позднее `dateFrom` не больше чем на 3 месяца. Если дата позднее трёх месяцев, \nотчёт сформируется за 3 месяца с даты, указанной в `dateFrom`.\n"
          },
          "type": {
            "type": "string",
            "description": "Тип отчёта:\n- `TRAFFIC_SOURCES` — отчёт по источникам трафика.\n- `ORDERS` — отчёт по заказам.\n",
            "enum": [
              "TRAFFIC_SOURCES",
              "ORDERS"
            ]
          }
        }
      }
    },
    "required": [
      "body"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (!args.body) {\n        throw new Error('Missing required request body');\n      }\n\n      // Build request URL\n      let url = '/api/client/vendors/statistics';\n\n      // Build query parameters\n      const params = {};\n\n      // Build custom headers\n      const headers = {};\n\n      // Build request body\n      const data = args.body;\n\n      // Execute HTTP request\n      const response = await client.post(url, data, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'VendorStatisticsSubmitRequest',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Vendor"
  ]
};


/**
 * Список запрошенных отчётов с аналитикой внешнего трафика
 */
export const VendorStatisticsListReportsTool: Tool = {
  "name": "VendorStatisticsListReports",
  "description": "Список запрошенных отчётов с аналитикой внешнего трафика",
  "inputSchema": {
    "type": "object",
    "properties": {
      "page": {
        "type": "integer",
        "description": "Номер страницы.",
        "format": "int64"
      },
      "pageSize": {
        "type": "integer",
        "description": "Размер страницы.",
        "format": "int64"
      }
    },
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Build request URL\n      let url = '/api/client/vendors/statistics/list';\n\n      // Build query parameters\n      const params = {};\n      if (args.page !== undefined && args.page !== null) {\n        params['page'] = (typeof args.page === 'string' ? Number(args.page) : args.page);\n      }\n      if (args.pageSize !== undefined && args.pageSize !== null) {\n        params['pageSize'] = (typeof args.pageSize === 'string' ? Number(args.pageSize) : args.pageSize);\n      }\n\n      // Build custom headers\n      const headers = {};\n\n      // Execute HTTP request\n      const response = await client.get(url, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'VendorStatisticsListReports',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Vendor"
  ]
};


/**
 * Информация об отчёте по UUID
 */
export const VendorStatisticsCheckTool: Tool = {
  "name": "VendorStatisticsCheck",
  "description": "Информация об отчёте по UUID",
  "inputSchema": {
    "type": "object",
    "properties": {
      "UUID": {
        "type": "string",
        "description": "Уникальный идентификатор запроса."
      },
      "vendor": {
        "type": "boolean",
        "description": "Признак, что запрашивается отчёт с аналитикой внешнего трафика. Передавайте `true` в этом параметре."
      }
    },
    "required": [
      "UUID",
      "vendor"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (args.UUID === undefined || args.UUID === null) {\n        throw new Error('Missing required path parameter: UUID');\n      }\n      if (args.vendor === undefined || args.vendor === null) {\n        throw new Error('Missing required query parameter: vendor');\n      }\n\n      // Build request URL with path parameters\n      let url = '/api/client/vendors/statistics/{UUID}';\n      url = url.replace('{UUID}', encodeURIComponent(String(args.UUID)));\n\n      // Build query parameters\n      const params = {};\n      if (args.vendor !== undefined && args.vendor !== null) {\n        params['vendor'] = (typeof args.vendor === 'string' ? args.vendor === 'true' : args.vendor);\n      }\n\n      // Build custom headers\n      const headers = {};\n\n      // Execute HTTP request\n      const response = await client.get(url, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'VendorStatisticsCheck',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Vendor"
  ]
};


/**
 * Метка организации для внешних рекламных кампаний. 
Метод возвращает [префикс для метки UTM_CAMPAIGN](https://docs.ozon.ru/performance/analytics/#как-создать-ссылку-с-utm-метками) по идентификатору организации.

[Подробнее о ссылках для внешних рекламных кампаний](https://docs.ozon.ru/performance/...
 */
export const GetVendorTagTool: Tool = {
  "name": "GetVendorTag",
  "description": "Метка организации для внешних рекламных кампаний. \nМетод возвращает [префикс для метки UTM_CAMPAIGN](https://docs.ozon.ru/performance/analytics/#как-создать-ссылку-с-utm-метками) по идентификатору организации.\n\n[Подробнее о ссылках для внешних рекламных кампаний](https://docs.ozon.ru/performance/...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "orgId": {
        "type": "string",
        "description": "Идентификатор организации.",
        "format": "uint64"
      }
    },
    "required": [
      "orgId"
    ],
    "additionalProperties": false
  },
  "executeCode": "      try {\n      // Validate required parameters\n      if (args.orgId === undefined || args.orgId === null) {\n        throw new Error('Missing required query parameter: orgId');\n      }\n\n      // Build request URL\n      let url = '/api/client/organisation/vendor_tag';\n\n      // Build query parameters\n      const params = {};\n      if (args.orgId !== undefined && args.orgId !== null) {\n        params['orgId'] = args.orgId;\n      }\n\n      // Build custom headers\n      const headers = {};\n\n      // Execute HTTP request\n      const response = await client.get(url, { params, headers });\n\n      // No schema defined, use raw response\n      const typedData = response;\n\n      // Normalize null and undefined values\n      const normalizedData = normalizeNullValues(typedData);\n\n      function normalizeNullValues(data) {\n        if (data === null || data === undefined) {\n          return null;\n        }\n\n        if (Array.isArray(data)) {\n          return data.map(item => normalizeNullValues(item));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const normalized = {};\n          for (const [key, value] of Object.entries(data)) {\n            normalized[key] = normalizeNullValues(value);\n          }\n          return normalized;\n        }\n\n        return data;\n      }\n\n      // Truncate large arrays to prevent context overflow\n      const truncatedData = truncateArrays(normalizedData, 100);\n\n      function truncateArrays(data, maxItems = 100) {\n        if (Array.isArray(data)) {\n          if (data.length > maxItems) {\n            const truncated = data.slice(0, maxItems);\n            return [...truncated.map(item => truncateArrays(item, maxItems)), {\n              _truncated: true,\n              _originalLength: data.length,\n              _remainingItems: data.length - maxItems,\n              _message: `Array truncated: showing ${maxItems} of ${data.length} items`\n            }];\n          }\n          return data.map(item => truncateArrays(item, maxItems));\n        }\n\n        if (typeof data === 'object' && data !== null) {\n          const truncated = {};\n          for (const [key, value] of Object.entries(data)) {\n            truncated[key] = truncateArrays(value, maxItems);\n          }\n          return truncated;\n        }\n\n        return data;\n      }\n\n      // Format response for MCP protocol\n      return {\n        content: [\n          {\n            type: 'text',\n            text: JSON.stringify(truncatedData, null, 2)\n          }\n        ]\n      };\n\n\n\n      } catch (error) {\n        // Enhanced error handling with operation context\n        const err = error;\n\n        const errorResponse = {\n          error: true,\n          operation: 'GetVendorTag',\n          message: err.message || 'Tool execution failed',\n          code: err.statusCode,\n          timestamp: new Date().toISOString()\n        };\n\n        if (err.response) {\n          errorResponse.details = err.response;\n        }\n\n        throw errorResponse;\n      }",
  "tags": [
    "Vendor"
  ]
};


export const tools: Tool[] = [
  ListCampaignsTool,
  ListCampaignObjectsTool,
  GetLimitsListTool,
  ExternalCampaign_BidBySKUTool,
  SubmitRequestTool,
  VideoCampaignsSubmitRequestTool,
  AttributionSubmitRequestTool,
  StatisticsCheckTool,
  ListReportsTool,
  ListReportsExternalTool,
  DownloadStatisticsTool,
  MediaCampaignListTool,
  ProductCampaignListTool,
  GetCampaignExpenseTool,
  GetCampaignDailyStatsTool,
  SearchPromoOrdersReportSubmitRequestTool,
  SearchPromoProductsReportSubmitRequestTool,
  CreateProductCampaignCPCV2Tool,
  CalculateDynamicBudgetTool,
  ActivateCampaignTool,
  DeactivateCampaignTool,
  PatchProductCampaignTool,
  AddProductsTool,
  UpdateProductsTool,
  GetProductsV2Tool,
  DeleteProductsTool,
  GetProductsCompetitiveBidsTool,
  ExternalCampaign_ListSearchPromoProductsV2Tool,
  ExternalCampaign_GetProductsRecommendedBidsTool,
  ExternalCampaign_SetSearchPromoBidsV2Tool,
  ExternalCampaign_GetCPOMinBidsTool,
  ExternalCampaign_BatchEnableProductsTool,
  ExternalCampaign_BatchDisableProductsTool,
  ExternalCampaign_DeleteSearchPromoBidsV2Tool,
  ExternalCampaign_BatchEnableCarrots4Tool,
  ExternalCampaign_BatchDisableCarrots4Tool,
  VendorStatisticsSubmitRequestTool,
  VendorStatisticsListReportsTool,
  VendorStatisticsCheckTool,
  GetVendorTagTool
];

// Tool execution map for fast lookup
const toolMap = new Map<string, Tool>(tools.map(tool => [tool.name, tool]));

/**
 * Execute tool by name with dynamic code execution
 */
export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const tool = toolMap.get(name);

  if (!tool) {
    throw new Error(`Tool not found: ${name}`);
  }

  if (!tool.executeCode) {
    throw new Error(`Tool ${name} has no executable code`);
  }

  try {
    // Create execution context with HTTP client
    const client = httpClient;

    // Execute the tool's code dynamically using Function constructor
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const executor = new AsyncFunction('client', 'args', tool.executeCode) as (client: typeof httpClient, args: Record<string, unknown>) => Promise<{ content: Array<{ type: string; text: string }> }>;

    const result = await executor(client, args);
    return result;
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { status?: number; data?: unknown } };

    // Format error for MCP protocol
    const errorMessage = {
      error: true,
      tool: name,
      message: err.message || 'Unknown error',
      status: err.response?.status,
      data: err.response?.data,
      timestamp: new Date().toISOString()
    };

    throw new Error(JSON.stringify(errorMessage, null, 2));
  }
}
