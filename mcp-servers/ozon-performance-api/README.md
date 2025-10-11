# Документация Ozon Performance API MCP Server


В документе описаны методы Ozon Performance API — интерфейса для работы с рекламным кабинетом для обмена
информацией между системой продавца и Ozon.

По вопросам работы с API, обращайтесь в поддержку через личный кабинет.


MCP server for the Документация Ozon Performance API API, generated from OpenAPI specification.

## Features

- ✅ **40 API operations** available as MCP tools
- ✅ **Type-safe** TypeScript implementation
- ✅ **Automatic retries** with exponential backoff
- ✅ **Error handling** with detailed error messages
- ✅ **Full MCP protocol** compatibility

## Installation

```bash
npm install
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and configure your API credentials:
```bash
API_BASE_URL=https://api-performance.ozon.ru:443
```

## Usage

### Build the project

```bash
npm run build
```

### Run the MCP server

```bash
npm start
```

### Development mode (with auto-reload)

```bash
npm run dev
```

### Use with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ozon-performance-api": {
      "command": "node",
      "args": ["/path/to/ozon-performance-api/dist/index.js"]
    }
  }
}
```

## Available Tools

This MCP server provides 40 tools for interacting with the Документация Ozon Performance API API.

### By Category
- **Ad**: Ad operations
- **Campaign**: Campaign operations
- **Intro**: Чтобы использовать API отчётов по рекламным кампаниям Ozon, получите `client_id` и `client_secret` в вашем личном кабинете: 
1. В личном кабинете перейдите на страницу [**Настройки → API-ключи**](https://seller.ozon.ru/app/settings/api-keys?currentTab=performanceApi). 
2. При необходимости создайте сервисный аккаунт: нажмите **Создать новый аккаунт**.
3. Нажмите на название сервисного аккаунта.
4. Нажмите **Добавить новый ключ**.

Для использования API:
1. [Получите авторизационный токен](#tag/Token) с помощью `client_id` и `client_secret` в сервисе авторизации.
2. Выполните запросы с помощью авторизационного токена. Если срок действия токена истёк, получите новый.

- **Limits**: Общий лимит на количество запросов в сутки — 100 000.

Лимиты на выгрузки статистики проверяются в начале формирования отчёта. 
Лимиты действуют для отчётов из раздела [**Статистика**](#tag/Statistics).

Одна рекламная кампания = одна выгрузка. 
Если в запросе несколько кампаний, это считается как несколько выгрузок.

Лимит на количество выгрузок в сутки рассчитывается по формуле: количество активных кампаний × 240 — но не больше значения из таблицы ниже.

Лимиты на выгрузки:

| Лимит                                                        | Значение лимита |
|--------------------------------------------------------------|-----------------|
| Лимит на количество дней в выгрузке                          | 62              |
| Лимит на количество кампаний в отчёте                        | 10              |
| Лимит на количество одновременных выгрузок с аккаунта        | 1               |
| Лимит на количество выгрузок за 24 часа с аккаунта           | 2000            |
| Лимиты на количество одновременных выгрузок по организации   | 5               |
| Лимит на количество выгрузок за 24 часа в рамках организации | 2000            |


- **News**: ## 2 сентября 2025

| Метод                                                                                                                                                                                                                   | Что изменилось                                                                                                        |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| [POST /api/client/campaign/search_promo/carrots/enable](#operation/ExternalCampaign_BatchEnableCarrots4)<br>[POST /api/client/campaign/search_promo/carrots/disable](/#operation/ExternalCampaign_BatchDisableCarrots4) | Добавили методы для включения и отключения продвижения товара в акции «Морковск».                                     |
| [POST /api/client/campaign/search_promo/v2/products](#operation/ExternalCampaign_ListSearchPromoProductsV2)                                                                                                             | Добавили параметры `products.bidWithoutAdditive`, `products.carrotsAdditive` и `products.carrotsStatus` в ответ метода. |

## 1 сентября 2025

| Метод                                                                                                                                                                | Что изменилось                                                                                                                                                                                                                                |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [POST /api/client/campaign/cpc/v2/product](#operation/CreateProductCampaignCPCV2)                                                                                    | Обновили описание параметров `placement` и `productAutopilotStrategy` в запросе метода.                                                                                                                                                       |
| [POST /api/client/campaign/{campaignId}/activate](#operation/ActivateCampaign)<br>[POST /api/client/campaign/{campaignId}/deactivate](#operation/DeactivateCampaign) | Обновили описание параметров `paymentType`, `advObjectType`, `placement` и `productAutopilotStrategy` в ответе методов.                                                                                                                       |
| [POST /external/api/dynamic_budget](#operation/CalculateDynamicBudget)                                                                                               | Обновили описание параметров `createCampaign.autopilotStrategy`, `createCampaign.placement` и `updateCampaign.autopilotStrategy` в запросе метода.                                                                                            |
| [GET /api/client/campaign](#operation/ListCampaigns)                                                                                                                 | Обновили описание параметра `advObjectType` в запросе метода.<br>Обновили описание параметров `list.advObjectType`, `list.placement` и `list.productAutopilotStrategy` в ответе метода.                                                       |
| [GET /api/client/campaign/{campaignId}/objects](#operation/ListCampaignObjects)<br>[POST /api/client/statistics](#operation/SubmitRequest)                           | Обновили описание методов.                                                                                                                                                                                                                    |
| [GET /api/client/limits/list](#operation/GetLimitsList)                                                                                                              | Обновили описание метода.<br>Обновили описание параметров `limits.objectType` и `limit.placement` в ответе метода.                                                                                                                            |
| [POST /api/client/min/sku](#operation/ExternalCampaign_BidBySKU)                                                                                                     | Обновили описание параметра `paymentType` в запросе метода.                                                                                                                                                                                   |
| [GET /api/client/statistics/campaign/product](#operation/ProductCampaignList)                                                                                        | Изменили название метода.                                                                                                                                                                                                                     |
| —                                                                                                                                                                    | Изменили название раздела **Трафареты и вывод в топ** на [**Оплата за клик и Спецразмещение**](#tag/Ad).<br>Изменили название раздела **Товары в Трафаретах и Выводе в топ** на [**Товары в Оплате за клик и Спецразмещении**](#tag/Product). |

## 25 августа 2025

| Метод                                                                                                                                                                | Что изменилось                                                                                                                                                                                                                                                |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [POST /api/client/campaign/cpc/v2/product](#operation/CreateProductCampaignCPCV2)                                                                                    | Обновили описание метода. <br>В запросе метода: <ul><li>добавили значение `PLACEMENT_OVERTOP` в параметр `placement`;</li><li>добавили значение `TAKEOVER` в параметр `productAutopilotStrategy`;</li><li>добавили параметр `ProductAdvPlacements`.</li></ul> |
| [PATCH /api/client/campaign/{campaignId}](#operation/PatchProductCampaign)                                                                                           | Добавили параметр `ProductAdvPlacements` в запрос метода.                                                                                                                                                                                                     |
| [POST /api/client/campaign/{campaignId}/activate](#operation/ActivateCampaign)<br>[POST /api/client/campaign/{campaignId}/deactivate](#operation/DeactivateCampaign) | В ответе методов: <ul><li>добавили значение `PLACEMENT_OVERTOP` в параметр `placement`;</li><li>добавили значение `TAKEOVER` в параметр `productAutopilotStrategy`;</li><li>добавили параметр `ProductAdvPlacements`.</li></ul>                               |

## 19 августа 2025

| Метод                             | Что изменилось                                          |
|-----------------------------------|---------------------------------------------------------|
| [POST /external/api/dynamic_budget](#operation/CalculateDynamicBudget) |  Метод устаревает и будет отключён 1 сентября 2025 года. |

## 24 июля 2025

| Метод                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Что изменилось                                                                                                                                                                                                                                                                                                  |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [POST /api/client/campaign/cpc/v2/product](#operation/CreateProductCampaignCPCV2)                                                                                                                                                                                                                                                                                                                                                                                                                                          | В запросе метода: <ul><li>пометили устаревшим значение `PLACEMENT_TAKEOVER` в параметре `placement`;</li><li>удалили значение `TAKEOVER` в параметре `productAutopilotStrategy`;</li><li>обновили описание значения `TARGET_BIDS` в параметре `productAutopilotStrategy`.</li></ul>                             |
| [POST /api/client/min/sku](#operation/ExternalCampaign_BidBySKU)                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Обновили описание параметра `paymentType` в запросе метода.                                                                                                                                                                                                                                                     |
| [GET /api/client/campaign](#operation/ListCampaigns)                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Обновили описание параметра `advObjectType` в запросе метода.<br>Обновили описание параметра `list.advObjectType` в ответе метода.<br>Добавили значение `PLACEMENT_OVERTOP` в параметре `list.placement` в ответе метода.                                                                                       |
| [POST /api/client/campaign/{campaignId}/activate](#operation/ActivateCampaign)<br>[POST /api/client/campaign/{campaignId}/deactivate](#operation/DeactivateCampaign)                                                                                                                                                                                                                                                                                                                                                       | В ответе методов: <ul><li>пометили устаревшим значение `PLACEMENT_TAKEOVER` в параметре `placement`;</li><li>удалили значение `TAKEOVER` в параметре `productAutopilotStrategy`;</li><li>обновили описание параметра `advObjectType`.</li></ul>                                                                 |
| [GET /api/client/limits/list](#operation/GetLimitsList)                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Обновили описание параметра `limits.objectType` в ответе метода.<br>Добавили значение `CAMPAIGN_PLACEMENT_OVERTOP` в параметре `limits.placement` в ответе метода.<br>Обновили описание метода.                                                                                                                 |
| [POST /api/client/campaign/search_promo/v2/products](#operation/ExternalCampaign_ListSearchPromoProductsV2)                                                                                                                                                                                                                                                                                                                                                                                                                | Обновили описание параметров `products.isSearchPromoAvailable` и `products.searchPromoStatus` в ответе метода.<br>Изменили название метода.                                                                                                                                                                     |
| [GET /api/client/statistics/{UUID}](#operation/StatisticsCheck)                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Обновили описание параметра `kind` в ответе метода.                                                                                                                                                                                                                                                             |
| [GET /api/client/statistics/list](#operation/ListReports)<br>[/api/client/statistics/externallist](#operation/ListReportsExternal)                                                                                                                                                                                                                                                                                                                                                                                         | Обновили описание параметра `items.meta.kind` в ответе методов.                                                                                                                                                                                                                                                 |
| [GET /api/client/campaign/{campaignId}/objects](#operation/ListCampaignObjects)<br>[POST /api/client/statistics](#operation/SubmitRequest)                                                                                                                                                                                                                                                                                                                                                                                 | Обновили описание методов.                                                                                                                                                                                                                                                                                      |
| [POST /api/client/statistic/orders/generate](#operation/SearchPromoOrdersReportSubmitRequest)<br>[POST /api/client/statistic/products/generate](#operation/SearchPromoProductsReportSubmitRequest)<br>[POST /api/client/campaign/search_promo/v2/bids/delete](#operation/ExternalCampaign_DeleteSearchPromoBidsV2)<br>[POST /api/client/search_promo/product/disable](#operation/ExternalCampaign_BatchDisableProducts)<br>[POST /api/client/search_promo/product/enable](#operation/ExternalCampaign_BatchEnableProducts) | Изменили название методов.                                                                                                                                                                                                                                                                                      |
| [POST /external/api/dynamic_budget](#operation/CalculateDynamicBudget)                                                                                                                                                                                                                                                                                                                                                                                                                                                     | В запросе метода:  <ul><li>пометили устаревшим значение `CAMPAIGN_PLACEMENT_TAKEOVER` в параметре `createCampaign.placement`;</li><li>удалили значение `TAKEOVER` в параметре `createCampaign.autopilotStrategy`;</li><li>удалили значение `TAKEOVER` в параметре `updateCampaign.autopilotStrategy`.</li></ul> |
| —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Изменили название раздела **Продвижение в поиске** на [**Оплата за заказ**](#tag/Search-Promo).                                                                                                                                                                                                                 |

## 17 июля 2025

| Метод                                                                  | Что изменилось                                          |
|------------------------------------------------------------------------|---------------------------------------------------------|
| [POST /external/api/dynamic_budget](#operation/CalculateDynamicBudget) | Обновили описание параметра `skuPrice` в ответе метода. |

## 10 июня 2025

| Метод                                                          | Что изменилось                                          |
|----------------------------------------------------------------|---------------------------------------------------------|
| [GET /api/client/campaign](#operation/ListCampaigns) | Добавили параметры `page` и `pageSize` в запрос метода. |

## 17 апреля 2025

| Метод                                              | Что изменилось                                                            |
|----------------------------------------------------|---------------------------------------------------------------------------|
| [POST /api/client/min/sku](#operation/ExternalCampaign_BidBySKU) | Добавили новый метод для получения минимальной ставки для товаров по SKU. |
| GET /api/client/campaign/{campaignId}/brand_shelf/{brandShelfId}                                                                                                                                                                 | Удалили метод из документации.                                                                                                                                                            | 
| [POST /api/client/campaign/cpc/v2/product](#operation/CreateProductCampaignCPCV2) <br> [PATCH /api/client/campaign/{campaignId}](#operation/PatchProductCampaign)                                                                | Добавили параметр `autoIncreasePercent` в запрос методов.                                                                                                                                 |
| [GET /api/client/campaign](#operation/ListCampaigns) <br> [POST /api/client/campaign/{campaignId}/activate](#operation/ActivateCampaign) <br> [POST /api/client/campaign/{campaignId}/deactivate](#operation/DeactivateCampaign) | Добавили параметры `autoIncrease.autoIncreasePercent`, `autoIncrease.isAutoIncreased`, `autoIncrease.autoIncreasedBudget`, `autoIncrease.recommendedAutoIncreasePercent` в ответ методов. |

## 4 апреля 2025

| Метод                                                              | Что изменилось                                                              |
|--------------------------------------------------------------------|-----------------------------------------------------------------------------|
| [GET /api/client/statistics/report](#operation/DownloadStatistics) | Обновили описание метода. <br> Изменили структуру заголовков и тела ответа. |

## 1 апреля 2025

| Метод                                                                         | Что изменилось            |
|-------------------------------------------------------------------------------|---------------------------|
| [GET /api/client/statistics/campaign/product](#operation/ProductCampaignList) | Обновили описание метода. | 

## 25 марта 2025

| Метод                                                                                                                                                                  | Что изменилось                                                                    |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| [POST /api/client/search_promo/get_cpo_min_bids](#operation/ExternalCampaign_GetCPOMinBids)                                                                            | Обновили название параметра в запросе метода. | 

## 3 марта 2025

| Метод                                                                                                                                                                  | Что изменилось                                                                                                                                              |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [POST /api/client/campaign/cpc/v2/product](#operation/CreateProductCampaignCPCV2)                                                                                      | Обновили описание параметров `placement` и `productAutopilotStrategy` в запросе метода.                                                                     | 
| [POST /api/client/campaign/{campaignId}/activate](#operation/ActivateCampaign) <br> [POST /api/client/campaign/{campaignId}/deactivate](#operation/DeactivateCampaign) | Обновили описание параметров `placement` и `productAutopilotStrategy` в ответе методов.                                                                     |
| [POST /external/api/dynamic_budget](#operation/CalculateDynamicBudget)                                                                                                 | Обновили описание параметров `createCampaign.autopilotStrategy`, `createCampaign.placement` и `updateCampaign.autopilotStrategy.strategy` в запросе метода. |

## 26 февраля 2025

| Метод                                                                                                                                                                                                                  | Что изменилось                                                |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------|
| [POST /api/client/search_promo/bids/recommendation](#operation/ExternalCampaign_GetProductsRecommendedBids) <br> [POST /api/client/campaign/search_promo/v2/bids/set](#operation/ExternalCampaign_SetSearchPromoBidsV2) | Пометили методы устаревшими.                                  | 
| [POST /api/client/search_promo/get_cpo_min_bids](#operation/ExternalCampaign_GetCPOMinBids)                                                                                                                                         | Добавили метод для получения фиксированных ставок на товары.  | 

## 20 января 2025

| Метод                                 | Что изменилось                                            |
|---------------------------------------|-----------------------------------------------------------|
| [POST /external/api/dynamic_budget](#operation/CalculateDynamicBudget) | Добавили метод для расчёта минимального бюджета кампании. | 

## 9 января 2025

| Метод                                                                                                                                              | Что изменилось                                                           |
|----------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| [POST /api/client/campaign/cpc/v2/product](#operation/CreateProductCampaignCPCV2)                                                                  | Обновили описание параметра `productAutopilotStrategy` в запросе метода. |
| [PATCH /api/client/campaign/{campaignId}](#operation/PatchProductCampaign)                                                                         | Удалили параметр `autopilot.skuAddMode` в запросе метода.                |

## 28 ноября 2024

| Метод                                                                      | Что изменилось                     |
|----------------------------------------------------------------------------|------------------------------------|
| [GET /api/client/statistics/campaign/product](#operation/ProductCampaignList) | Добавили недельный бюджет в отчёт. |

## 31 октября 2024

| Метод                                                                                   | Что изменилось                                           |
|-----------------------------------------------------------------------------------------|----------------------------------------------------------|
| [POST /api/client/campaign/cpc/v2/product](#operation/CreateProductCampaignCPCV2)       | Удалили параметр `productCampaignMode` в запросе метода. |
| [GET /api/client/statistics/campaign/media](#operation/MediaCampaignList) <br> [GET /api/client/statistics/campaign/product](#operation/ProductCampaignList) | Обновили описание методов.                               |

## 11 октября 2024

| Метод                                                                                                                                                                  | Что изменилось                                                                                                   |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| [GET /api/client/statistics/externallist](#operation/ListReportsExternal)                                                                                              | Добавили метод для получения списка отчётов, сгенерированных через API.                                          |
| [GET /api/client/statistics/list](#operation/ListReports)                                                                                                              | Обновили описание метода.                                                                                        |
| [GET /api/client/campaign](#operation/ListCampaigns)                                                                                                                   | Обновили значение `CAMPAIGN_STATE_STOPPED` параметра `state` в запросе и параметра `list.state` в ответе метода. |
| [POST /api/client/campaign/{campaignId}/activate](#operation/ActivateCampaign)<br> [POST /api/client/campaign/{campaignId}/deactivate](#operation/DeactivateCampaign)  | Обновили значение `CAMPAIGN_STATE_STOPPED` параметра `state` ответах методов.                                    |

## 26 сентября 2024

| Метод      | Что изменилось                                                                                                               |
|------------|------------------------------------------------------------------------------------------------------------------------------|
| Все методы | С 15 января 2025 года хост `performance.ozon.ru` перестаёт работать. Перейдите на новый хост <br>`api-performance.ozon.ru`.  |

## 3 сентября 2024

| Метод                                                                                                                                                                                                                                                                                                                                                                                             | Что изменилось                                                                                                                                             |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| GET /campaign/{campaignId}/products                                                                                                                                                                                                                                                                                                                                                               | Метод устарел, удалили его из документации. Используйте [GET /campaign/{campaignId}/v2/products](#operation/GetProductsV2).                                |
| POST /campaign/{campaignId}/search_promo/products                                                                                                                                                                                                                                                                                                                                                 | Метод устарел, удалили его из документации. Используйте [POST /campaign/search_promo/v2/products](#operation/ExternalCampaign_ListSearchPromoProductsV2).  |
| POST /campaign/{campaignId}/search_promo/bids/set                                                                                                                                                                                                                                                                                                                                                 | Метод устарел, удалили его из документации. Используйте [POST /campaign/search_promo/v2/bids/set](#operation/ExternalCampaign_SetSearchPromoBidsV2).       |
| POST /campaign/cpc/product                                                                                                                                                                                                                                                                                                                                                                        | Метод устарел, удалили его из документации. Используйте [POST /campaign/cpc/v2/product](#operation/CreateProductCampaignCPCV2).                            |
| POST /campaign/{campaignId}/search_promo/bids/delete                                                                                                                                                                                                                                                                                                                                              | Метод устарел, удалили его из документации. Используйте [POST /campaign/search_promo/v2/bids/delete](#operation/ExternalCampaign_DeleteSearchPromoBidsV2). |
| POST /campaign/cpm/v2/product <br/> PATCH /campaign/{campaignId}/brand_shelf/{brandShelfId}                                                                                                                                                                                                                                                                                                       | Методы устарели, удалили их из документации.                                                                                                               |
| [POST /campaign/search_promo/v2/bids/delete](#operation/ExternalCampaign_DeleteSearchPromoBidsV2) <br/> [POST /search_promo/product/enable](#operation/ExternalCampaign_BatchEnableProducts) <br/> [POST /search_promo/product/disable](#operation/ExternalCampaign_BatchDisableProducts) <br/> [POST /campaign/search_promo/v2/bids/delete](#operation/ExternalCampaign_DeleteSearchPromoBidsV2) | В описании методов добавили, что в одном запросе можно передать максимум 1000 товаров.                                                                     |

## 29 августа 2024

| Метод/раздел                                                                                                                                     | Описание                                                                                                |
|--------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [POST /campaign/cpc/v2/product](#operation/CreateProductCampaignCPCV2)                                                                           | Обновили описание параметра `productAutopilotStrategy` в запросе метода.                                |
| [POST /campaign/{campaignId}/activate](#operation/ActivateCampaign) <br> [POST /campaign/{campaignId}/deactivate](#operation/DeactivateCampaign) | Обновили в ответе метода описание парамеров: `advObjectType`, `placement` и `productAutopilotStrategy`. |
| [GET /campaign](#operation/ListCampaigns)                                                                                                        | Обновили описание парамера `advObjectType` в запросе метода.                                            |
| [GET /campaign/{campaignId}/objects](#operation/ListCampaignObjects)                                                                             | Обновили описание метода.                                                                               |
| [GET /limits/list](#operation/GetLimitsList)                                                                                                     | Обновили описание метода и параметров в ответе: `limits.objectType` и `limits.placement`.                             |
| [GET /statistics/campaign/product](#operation/ProductCampaignList) <br/> [GET /statistics/campaign/media](#operation/MediaCampaignList)                                                                        | Обновили примеры запросов.                                                                              |
| [Трафареты и Вывод в топ](#tag/Ad) <br> [Товары в Трафаретах и Выводе в топ](#tag/Product)                                                       | Обновили названия разделов.                                                                             | 

## 15 августа 2024

| Метод                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Что изменилось                                                                                    |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| [POST /campaign/{campaignId}/products ](#operation/AddProducts) <br> [PUT /campaign/{campaignId}/products](#operation/UpdateProducts) <br> [GET /campaign/{campaignId}/v2/products](#operation/GetProductsV2) <br> [POST /campaign/search_promo/v2/products](#operation/ExternalCampaign_ListSearchPromoProductsV2) <br> [POST /search_promo/bids/recommendation](#operation/ExternalCampaign_GetProductsRecommendedBids) <br> [POST /campaign/search_promo/v2/bids/set](#operation/ExternalCampaign_SetSearchPromoBidsV2)  | В параметрах `bid`, `bids` и `SKU*` уточнили, что ставка применяется только к заказам или кликам. |

## 7 августа 2024

| Метод                                                                                                                                                                                                       | Что изменилось                                                                                                                                                                                                   |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| POST /campaign/{campaignId}/v2/activate <br> POST /campaign/{campaignId}/v2/deactivate                                                                                                                      | Методы не использовались, удалили их из документации. Используйте [POST /campaign/{campaignId}/activate](#operation/ActivateCampaign) и [POST /campaign/{campaignId}/deactivate](#operation/DeactivateCampaign). |
| [POST /campaign/{campaignId}/activate](#operation/ActivateCampaign) <br> [POST /campaign/{campaignId}/deactivate](#operation/DeactivateCampaign)                                                            | Убрали отметки, что методы устарели.                                                                                                                                                                             |
| [POST /campaign/search_promo/v2/bids/set](#operation/ExternalCampaign_SetSearchPromoBidsV2) <br> [POST /search_promo/product/enable](#operation/ExternalCampaign_BatchEnableProducts) | Обновили параметры ответа методов.                                                                                                                                                                               |
| POST /campaign/{campaignId}/search_promo/bids/reset                                                                                                                                                         | Метод устарел, удалили его из документации.                                                                                                                                                                      |

## 22 июля 2024

| Метод                                                                                                                                                                                                                                                | Описание                                            |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------|
| POST /campaign/cpc/product  <br> [POST /campaign/cpc/v2/product](#operation/CreateProductCampaignCPCV2) <br> [PATCH /campaign/{campaignId}](#operation/PatchProductCampaign) | Добавили параметр `weeklyBudget` в запросы методов. |
| [POST /campaign/{campaignId}/v2/activate](#operation/ActivateCampaignV2) <br> [POST /campaign/{campaignId}/activate](#operation/ActivateCampaign) <br> [GET /campaign](#operation/ListCampaigns)                    | Добавили параметр `weeklyBudget` в ответы методов.  |

## 3 июля 2024
| Метод                                                                                                           | Описание                                    |
|-----------------------------------------------------------------------------------------------------------------|---------------------------------------------|
| POST /campaign/cpm/product                                                                           | Метод устарел, удалили его из документации. | 
| POST /campaign/cpm/v2/product                               | Пометили метод устаревшим.                  | 
| [POST /campaign/{campaignId}/v2/activate](#operation/ActivateCampaignV2) <br> [POST /campaign/{campaignId}/activate](#operation/ActivateCampaign) | Обновили описания методов.                  |

## 1 июля 2024

| Метод                                                                                                                                                                                                                                             | Описание                                                           |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------|
| GET /campaign/{campaignId}/brand_shelf/{brandShelfId} <br> PATCH /campaign/{campaignId}/brand_shelf/{brandShelfId}                                                                                                                                | Брендовая полка перестала работать, пометили методы устаревшими.   | 
| [GET /limits/list](#operation/GetLimitsList) <br> [GET /campaign/{campaignId}/objects](#operation/ListCampaignObjects) <br> [POST /statistics](#operation/SubmitRequest) <br> [POST /statistics/attribution](#operation/AttributionSubmitRequest) | Убрали упоминание брендовой полки в описании методов и параметров. | 

## 23 мая 2024

| Метод                                                                                                                                                                                                                                                    | Описание                                                                  |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| POST /campaign/cpm/v2/product <br> [POST /campaign/cpc/v2/product](#operation/CreateProductCampaignCPCV2) <br> [PATCH /campaign/{campaignId}](#operation/PatchProductCampaign ) | Удалили параметр `expenseStrategy` в запросе метода.                      | 
| [POST /campaign/cpc/v2/product](#operation/CreateProductCampaignCPCV2)                                                                                                                                                                        | Дополнили описание параметра `productAutopilotStrategy` в запросе метода. |
| [GET /campaign](#operation/ListCampaigns)                                                                                                                                                                                                     | Дополнили описание параметра `list.placement` в ответе метода.            |
| POST /campaign/cpm/v2/product                                                                                                                                                                         | Дополнили описание параметра `placement` в запросе метода.                |
| [POST /campaign/{campaignId}/v2/activate](#operation/ActivateCampaignV2) <br> [POST /campaign/{campaignId}/v2/deactivate](#operation/DeactivateCampaignV2)                                                                          | Дополнили описание параметра `productAutopilotStrategy` в ответе метода.  |

## 26 апреля 2024

| Метод     | Описание                                       |
|-----------|------------------------------------------------|
| [POST /campaign/search_promo/v2/products](#operation/ExternalCampaign_ListSearchPromoProductsV2) | Добавили параметр `products.isSearchPromoAvailable` в ответ метода. | 

## 22 апреля 2024

| Метод                                                                                                        | Описание                                                                                                                    |
|--------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| POST /campaign/cpm/v2/product  <br> [POST /campaign/cpc/v2/product](#operation/CreateProductCampaignCPCV2) | В запросе метода:<br>• удалили параметр `autopilot`;<br>• изменили значение по умолчанию у параметра `productCampaignMode`. | 
| [POST /statistic/orders/generate](#operation/SearchPromoOrdersReportSubmitRequest)                           | Добавили метод для получения отчёта по заказам в оплате за заказ.                                                           | 
| [POST /statistic/products/generate](#operation/SearchPromoProductsReportSubmitRequest)                       | Добавили метод для получения отчёта по товарам в оплате за заказ.                                                           | 

## 19 марта 2024

| Метод                                                   | Описание                                                                                                                                                                                                        |
|---------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [GET /limits/list](#operation/GetLimitsList) | Добавили метод для получения:<br>• минимальных и максимальных ставок для «Оплаты за заказ», «Трафаретов» и «Брендовой полки»;<br>• минимальных ставок по категориям товаров в «Оплате за заказ» и «Трафаретах». | 

## 5 марта 2024

| Метод                                                                                            | Описание                                                                                                                                    |
|--------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| [PUT /campaign/{campaignId}/products](#operation/UpdateProducts)                                 | Обновили описание метода.                                                                                                                   | 
| [POST /campaign/search_promo/v2/products](#operation/ExternalCampaign_ListSearchPromoProductsV2) | Обновили описание параметра `page` в запросе.                                                                                               |
| —                                                                                                | В разделе [**Лимиты на запросы**](#tag/Limits) повысили лимиты до 2000 на количество выгрузок за 24 часа с аккаунта и в рамках организации. |

## 22 февраля 2024

| Метод                                                                                         | Описание                                                                                                             |
|-----------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| GET /campaign/{campaignId}/products                                 | Пометили метод устаревшим. Используйте [GET /campaign/{campaignId}/v2/products](#operation/GetProductsV2).           | 
| [POST /campaign/cpm/product](#operation/CreateProductCampaignCPM)                             | Пометили метод устаревшим.        |
| POST /campaign/cpc/product                             | Пометили метод устаревшим. Используйте [POST /campaign/cpc/v2/product](#operation/CreateProductCampaignCPCV2).       |
| [POST /campaign/{campaignId}/activate](#operation/ActivateCampaign)                           | Пометили метод устаревшим. Используйте [POST /campaign/{campaignId}/v2/activate](#operation/ActivateCampaignV2).     |
| [POST /campaign/{campaignId}/deactivate](#operation/DeactivateCampaign)                       | Пометили метод устаревшим. Используйте [POST /campaign/{campaignId}/v2/deactivate](#operation/DeactivateCampaignV2). |
| [GET /campaign/{campaignId}/v2/products](#operation/GetProductsV2)                            | Добавили новый метод для получения списка товаров кампании.                                                          |
| POST /campaign/cpm/v2/product                        | Добавили новый метод для создания кампании с оплатой за показы.                                                      |
| [POST /campaign/cpc/v2/product](#operation/CreateProductCampaignCPCV2)                        | Добавили новый метод для создания кампании с оплатой за клики.                                                       |
| [POST /campaign/{campaignId}/v2/activate](#operation/ActivateCampaignV2)                      | Добавили новый метод для активации кампании.                                                                         |
| [POST /campaign/{campaignId}/v2/deactivate](#operation/DeactivateCampaignV2)                  | Добавили новый метод для выключения кампании.                                                                        |
| [GET /campaign/{campaignId}/products/bids/competitive](#operation/GetProductsCompetitiveBids) | Добавили новый метод для получения конкурентных ставок для товара в Трафаретах.                                      |

## 26 января 2024

| Метод                                                                                                                                                                                                                                                          | Описание                                                                               |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| POST /campaign/{campaignId}/search_promo/products <br> POST /campaign/{campaignId}/search_promo/bids/set <br> [POST /campaign/{campaignId}/search_promo/bids/reset](#operation/ResetSearchPromoBids) <br> POST /campaign/{campaignId}/search_promo/bids/delete | Пометили методы устаревшими, используйте новые методы для управления оплатой за заказ. | 
| [POST /campaign/search_promo/v2/products](#operation/ExternalCampaign_ListSearchPromoProductsV2)                                                                                                                                                               | Добавили метод для получения списка товаров из оплаты за заказ.                        | 
| [POST /search_promo/bids/recommendation](#operation/ExternalCampaign_GetProductsRecommendedBids)                                                                                                                                                               | Добавили метод для получения рекомендованных ставок для товаров из оплаты за заказ.    | 
| [POST /campaign/search_promo/v2/bids/set](#operation/ExternalCampaign_SetSearchPromoBidsV2)                                                                                                                                                                    | Добавили метод для установки ставок на оплату за заказ для товаров.                    | 
| [POST /search_promo/product/enable](#operation/ExternalCampaign_BatchEnableProducts)                                                                                                                                                                           | Добавили метод для включения оплаты за заказ для товара.                               | 
| [POST /search_promo/product/disable](#operation/ExternalCampaign_BatchDisableProducts)                                                                                                                                                                         | Добавили метод для отключения оплаты за заказ для товара.                              | 
| [POST /campaign/search_promo/v2/bids/delete](#operation/ExternalCampaign_DeleteSearchPromoBidsV2)                                                                                                                                                              | Добавили метод для удаления товаров из оплаты за заказ.                                | 

## 17 января 2024

| Метод                                                                                                                                                                                                                                                                       | Описание                                                                                                                  | 
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| [POST /campaign/cpm/product](#operation/CreateProductCampaignCPM)<br>POST /campaign/cpc/product                                                                                                                                      | Обновили описания методов. Удалили параметр `productCampaignMode` из запросов методов.                                    |
| [POST /campaign/{campaignId}/products](#operation/AddProducts)                                                                                                                                                                                                              | Обновили описание метода. Удалили параметры `phrases`, `groupId` и `stopWords` из запроса метода.                         |
| [PUT /campaign/{campaignId}/products](#operation/UpdateProducts)                                                                                                                                                                                                            | Удалили параметры `phrases`, `groupId` и `stopWords` из запроса метода.                                                   |
| GET /campaign/{campaignId}/products                                                                                                                                                                                                               | Удалили параметры `phrases`, `groupId` и `stopWords` из ответа метода.                                                    |
| [GET /campaign/{campaignId}/objects](#operation/ListCampaignObjects)<br>[POST /statistics/attribution](#operation/AttributionSubmitRequest)<br>[POST /statistics](#operation/SubmitRequest)<br>[POST /statistics/video](#operation/VideoCampaignsSubmitRequest)  | Обновили описания методов.                                                                                                |
| —                                                                                                                                                                                                                                                                           | Раздел **Лимиты на ставки** устарел, удалили его из документации.                                                         |
| GET /campaign/available<br>POST /campaign/{campaignId}/group<br>GET /campaign/{campaignId}/group/{groupId}<br>PUT /campaign/{campaignId}/group/{groupId}<br>POST /statistics/phrases                                                                                        | Методы устарели, удалили их из документации.                                                                              |
| PUT /campaign/{campaignId}/period<br>PUT /campaign/{campaignId}/daily_budget                                                                                                                                                                                                | Методы устарели, удалили их из документации. Используйте [PATCH /campaign/{campaignId}](#operation/PatchProductCampaign). |

## 21 декабря 2023

| Метод                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Описание                                                       |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------|
| [POST /statistics/](#operation/SubmitRequest) <br> [POST /statistics/video](#operation/VideoCampaignsSubmitRequest) <br> [POST /statistics/attribution](#operation/AttributionSubmitRequest) <br> [GET /statistics/campaign/media](#operation/MediaCampaignList) <br> [GET /statistics/campaign/product](#operation/ProductCampaignList) <br> [GET /statistics/daily](#operation/GetCampaignDailyStats) <br> [GET /statistics/expense](#operation/GetCampaignExpense) | Добавили в описание методов информацию о JSON-формате отчётов. |


## 20 октября 2023

| Метод                                                                          | Описание                                                                                                                                                           |
|--------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| —                                                                              | Обновили заголовки разделов: «Товарные рекламные кампании» на [**Трафареты**](#tag/Ad) и «Товары в рекламной кампании» на [**Товары в Трафаретах**](#tag/Product). |
| [GET /campaign](#operation/ListCampaigns)                            | Обновили описание параметра `advObjectType` в запросе метода. Добавили параметр `PaymentType` в ответ метода.                                                      |

## 10 апреля 2023

| Метод                                                       | Описание                                      |
|-------------------------------------------------------------|-----------------------------------------------|
| [POST /statistics/phrases](#operation/PhrasesSubmitRequest) | Удалили параметр `groupBy` из запроса метода. |

## 3 ноября 2022

| Метод                                                                                  | Описание                                                                                                                                                                                                                               |
|----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| —                                                                                      | Обновили [лимиты на ставки](#tag/LimitsBids) и добавили метод оплаты «Клики» для кампаний с размещением в «Карточке товара и категории».                                                                                               |
| POST /campaign/cpc/product                      | Добавили метод для создания рекламных кампаний с оплатой за клики.                                                                                                                                                                     |
| [POST /campaign/{campaignId}/products](#operation/AddProducts)                         | В описание метода добавили рекомендации по добавлению товаров в кампании с оплатой за клики.                                                                                                                                           |
| [PUT /campaign/{campaignId}/daily_budget](#operation/UpdateProductCampaignDailyBudget) | Из запроса метода убрали параметры `fromDate` и `toDate`.                                                                                                                                                                              |
| [PUT /campaign/{campaignId}/period](#operation/UpdateProductCampaignPeriod)            | Из запроса метода убрали параметр `dailyBudget`.                                                                                                                                                                                       |
| [PATCH /campaign/{campaignId}](#operation/PatchProductCampaign)                        | В запрос метода добавили параметр `autopilot` для передачи информации о кампаниях с включённой автостратегией. <br> Изменили описание параметра `budget`.              |
| [POST /campaign/cpm/product](#operation/CreateProductCampaignCPM)                      | В запрос метода добавили параметр `autopilot.skuAddMode` для включения автоматического добавления товаров в кампании. <br> В запросе метода обновили описание параметра `toDate`. <br> В запрос метода добавили параметр `budget`. |
| [GET /campaign](#operation/ListCampaigns)                                              | В ответ метода добавили поле `autopilot.skuAddMode` для получения информации об автоматическои добавления товаров в кампании.                                                                                                          |

## 5 сентября 2022

| Метод                                                                                                                                                                                      | Описание                                                                                                               |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| [GET /campaign](#operation/ListCampaigns)<br>[POST /campaign/{campaignId}/activate](#operation/ActivateCampaign)<br>[POST /campaign/{campaignId}/deactivate](#operation/DeactivateCampaign) | Добавили поля с информацией об автостратегиях `productAutopilotStrategy` и `autopilot` в ответы методов.               |
| [POST /campaign/cpm/product](#operation/CreateProductCampaignCPM)                                                                                                                          | Добавили параметры `productAutopilotStrategy` и `autopilot` для передачи информации об автостратегиях в запрос метода. |
| [POST /campaign/{campaignId}/products](#operation/AddProducts)<br>[PUT /campaign/{campaignId}/products](#operation/UpdateProducts)                                                         | Добавили ограничения при работе с кампаниями с включённой автостратегией в описания методов.                           |

## 2 сентября 2022

| Метод | Описание |
|-------|----------|
| GET /campaign/{campaignId}/products | Добавили в ответ поля: <br>• `categories.bid` —  ставка на категорию,<br>• `categories.categoryId` — идентификатор категории,<br>• `title` — название товара. |

## 30 августа 2022

| Метод | Описание |
|-------|----------|
| [POST /statistics/video](#operation/VideoCampaignsSubmitRequest) | Добавили метод для получения статистики по показам видеобаннера. |

## 22 августа 2022

| Метод | Описание |
|-------|----------|
| [GET /organisation/vendor_tag](#operation/GetVendorTag)  | Добавили метод для получения меток организации для внешних рекламных кампаний.  |

## 11 августа 2022

| Метод | Описание |
|-------|----------|
| [GET /statistics/report](#operation/DownloadStatistics)  | Добавили описание ошибки некорректного UUID в ответ метода. |

## 10 августа 2022

| Метод | Описание |
|-------|----------|
| [GET /statistics/{UUID}](#operation/StatisticsCheck) <br> [GET /statistics/list](#operation/ListReports) | Добавили значение для поля `kind` в ответах методов. |

## 5 августа 2022

| Метод | Описание |
|-------|----------|
| [GET /campaign/{campaignId}/group/{groupId}](#operation/GetGroup)  | Добавили метод для получения информации о группе.  |

## 18 июля 2022

| Метод | Описание                                                                                       |
|-------|------------------------------------------------------------------------------------------------|
| —     | Обновили максимальную ставку на оплату за заказ в разделе [Лимиты на ставки](#tag/LimitsBids). |

## 15 июля 2022

| Метод | Описание |
|-------|----------|
| [POST /campaign/cpm/product](#operation/CreateProductCampaignCPM) | Обновили описание параметра `productCampaignMode` в запросе. |
| [POST /campaign/{campaignId}/products](#operation/AddProducts)  | Обновили описание метода.    |

## 14 июля 2022

| Метод | Описание |
|-------|----------|
| [POST /campaign/cpm/product](#operation/CreateProductCampaignCPM) | Обновили описание метода. Добавили параметр `productCampaignMode` и обновили описание параметра `placement` в запросе. |
| [POST /campaign/{campaignId}/products](#operation/AddProducts) | Обновили описание метода. Обновили описание параметра `bids.bid` в запросе метода. |
| [PUT /campaign/{campaignId}/products](#operation/UpdateProducts) | Обновили описание метода. |
| [GET /campaign](#operation/ListCampaigns) | Обновили описание параметра `advObjectType` в запросе. Добавили поле `productCampaignMode` в ответ метода. |
| [POST /campaign/{campaignId}/group](#operation/CreateGroup) <br> [PUT /campaign/{campaignId}/group/{groupId}](#operation/UpdateGroup) <br> [POST /statistics/phrases](#operation/PhrasesSubmitRequest) | Обновили описания методов. |
| [GET /campaign/available](#operation/GetAvailableProductCampaignModes) | Добавили метод для получения доступных режимов создания рекламных кампаний. |

## 11 июля 2022

| Метод | Описание |
|-------|----------|
| — | Добавили раздел [Лимиты на ставки](#tag/LimitsBids). |

## 8 июля 2022

| Метод                                                 | Описание |
|-------------------------------------------------------|----------|
| GET /campaign/{campaignId}/brand_shelf/{brandShelfId} | Добавили поля `targetDeepLink` и `bids.bidMicros` в ответ метода. Уточнили возвращаемые значения для поля `image.format` в ответе.  Обновили описание полей `bids.bid` и `searchBids.bid` в ответе. |
| PATCH /campaign/{campaignId}/brand_shelf/{brandShelfId} | Убрали поле `searchBids.relevanceStatus` из запроса метода.                                                                                                                                         |


## 7 июля 2022

| Метод | Описание |
|-------|----------|
| [POST /vendors/statistics](#operation/VendorStatisticsSubmitRequest) | Добавили метод для запуска формирования отчёта с аналитикой внешнего трафика.        |
| [GET /vendors/statistics/list](#operation/VendorStatisticsListReports) | Добавили метод для получения всех запрошенных отчётов с аналитикой внешнего трафика. |
| [GET /vendors/statistics/{UUID}](#operation/VendorStatisticsCheck) | Добавили метод для получения информации об отчёте с аналитикой внешнего трафика.     |


## 5 июля 2022

| Метод | Описание |
|-------|----------|
| POST /campaign/{campaignId}/search_promo/products<br/><br/>POST /campaign/{campaignId}/search_promo/bids/delete | Обновили описание методов. | 

## 4 июля 2022

| Метод | Описание |
|-------|----------|
| [POST /statistics](#operation/SubmitRequest) <br> [POST /statistics/phrases](#operation/PhrasesSubmitRequest) <br> [POST /statistics/attribution](#operation/AttributionSubmitRequest) | Изменили максимальный период, за который можно получить отчёт, в параметрах запроса `to` и `from`. |

## 30 июня 2022

| Метод | Описание                                        |
|-------|----------|
| [GET /statistics/{UUID}](#operation/StatisticsCheck) | Добавили поле `kind` в ответ и пример метода.   |
| [POST /statistics](#operation/SubmitRequest) | Добавили поле `vendor` в ответ и пример метода. |

## 28 июня 2022

| Метод | Описание |
|-------|----------|
| POST /campaign/cpc/product | Метод устарел, удалили его из документации. |
| — | Теперь получить `client_id` и `client_secret` можно в личном кабинете продавца. Добавили инструкцию в [документацию](#tag/Intro). |

## 27 июня 2022

| Метод | Описание |
|-------|----------|
| [PUT /campaign/{campaignId}/daily_budget](#operation/UpdateProductCampaignDailyBudget) | Исправили описание к параметру `dailyBudget` в запросе. |

## 2 июня 2022

| Метод | Описание |
|-------|----------|
| —     | Добавили раздел [Лимиты на запросы](#tag/Limits). |


## 27 сентября 2021

| Метод | Описание                                                                             |
|-------|--------------------------------------------------------------------------------------|
| —     | Добавили раздел [Список методов](#tag/List).                                         |
| —     | Поменяли название раздела «Начало работы» на «[Введение](#operation/ListCampaigns)». |
|       | Поменяли название раздела «Получить токен» на «[Как получить API-ключ](#tag/Token)». |
- **Product**: Product operations
- **SearchPromo**: Search-Promo operations
- **Statistics**: <aside class="notice">
Даты в отчётах рекламного кабинета группируются по московскому времени.
</aside>

Для получения отчёта кампании:
1. Отправьте запрос на генерацию отчёта.
2. Получите сгенерированный отчёт по UUID запроса.

- **Token**: Для получения авторизационного токена отправьте запрос:

```yaml
POST /api/client/token HTTP/1.1
Host: https://api-performance.ozon.ru
Content-Type: application/json
Accept: application/json
 
{
    "client_id":"XYZ@advertising.performance.ozon.ru", 
    "client_secret":"b1u5XXDQW3wEqQ7dG...ancMyuhQtMNBI", 
    "grant_type":"client_credentials"
}
```

Сервис авторизации вернёт токен с указанием периода его действия в секундах:

```yaml
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.WyJFTWhVVU...qTz2XXZBv41h4",
    "expires_in": 1800,
    "token_type": "Bearer"
}
```

- **Vendor**: Vendor operations
- **Edit**: Edit operations
- **Searchpromo**: SearchPromo operations

Use the `listTools` method in Claude to discover available operations.

## Documentation

- OpenAPI Specification: See the original OpenAPI spec file

## Troubleshooting

### Server won't start
- Check that Node.js version is >=18.0.0: `node --version`
- Verify all dependencies are installed: `npm install`
- Check your `.env` file has correct configuration

### Debug mode
Enable debug logging to see detailed request/response information:
```bash
DEBUG=true npm start
```

## License

MIT

---

Generated with [OpenAPI-to-MCP Generator](https://github.com/your-org/openapi-to-mcp)
