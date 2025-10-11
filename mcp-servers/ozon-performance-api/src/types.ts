/**
 * TypeScript interfaces generated from OpenAPI schemas
 * @generated Do not edit manually
 */

export interface rpcStatus {
  /** Описание ошибки. */
  error?: string;
}

/**
 * Тип оплаты:
 * - `CPC` — за клики,
 * - `CPM` — за показы,
 * - `CPO` — за заказы.
 * 
 */
export type camptypeCampaignTypeInList = Record<string, unknown>;

/**
 * Состояние кампании:
 * - `CAMPAIGN_STATE_RUNNING` — активная кампания;
 * - `CAMPAIGN_STATE_PLANNED` — кампания, сроки проведения которой ещё не наступили;
 * - `CAMPAIGN_STATE_STOPPED` — кампания, приостановленная из-за нехватки бюджета;
 * - `CAMPAIGN_STATE_INACTIVE` — кампания, остановленная владельцем;
 * - `CAMPAIGN_STATE_ARCHIVED` — архивная кампания;
 * - `CAMPAIGN_STATE_MODERATION_DRAFT` — отредактированная кампания до отправки на модерацию;
 * - `CAMPAIGN_STATE_MODERATION_IN_PROGRESS` — кампания, отправленная на модерацию;
 * - `CAMPAIGN_STATE_MODERATION_FAILED` — кампания, непрошедшая модерацию;
 * - `CAMPAIGN_STATE_FINISHED` — кампания завершена, дата окончания в прошлом, такую кампанию нельзя изменить, можно
 * только клонировать или создать новую.
 * 
 */
export type extcampaignCampaignState = Record<string, unknown>;

/**
 * Место размещения продвигаемых товаров:
 * - `PLACEMENT_INVALID` — не определено.
 * - `PLACEMENT_PDP` — карточка товара. Доступно только для кампаний с ручным управлением.
 * - `PLACEMENT_SEARCH_AND_CATEGORY` — поиск и рекомендации.
 * - `PLACEMENT_TOP_PROMOTION` — поиск.
 * - `PLACEMENT_OVERTOP` — поиск и главная (Спецразмещение).
 * - `PLACEMENT_TAKEOVER` — одновременный показ товаров на первых 4 плитках.
 * 
 */
export type extcampaignProductCampaignInListPlacement = Record<string, unknown>;

/**
 * Информация о кампании. Возвращается, если в параметре `productAutopilotStrategy` включена автостратегия.
 */
export interface extcampaignCampaignAutopilotProperties {
  /** Идентификатор категории. */
  categoryId?: string;
  /** Разрешение на автоматическое добавление товаров категории, указанной в `categoryId`, в кампании с автостратегией `MAX_VIEWS`:

- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN` — стратегия добавления товаров в кампанию не установлена;
- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_MANUAL` — добавлять товары в кампанию можно только вручную;
- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_AUTO` — можно добавлять товары категории `categoryId` в кампанию автоматически.

Если тип разрешения пустой или было передано `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN`, добавлять товары в кампанию можно только вручную.

Для кампаний без автостратегии `MAX_VIEWS` возвращается значение `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN`.
 */
  skuAddMode?: 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN' | 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_MANUAL' | 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_AUTO';
}

/**
 * Информация об автоподнятии бюджета.
 */
export interface extcampaignCampaignAutoIncrease {
  /** Процент автоподнятия бюджета, от `10` до `50`. <br>
`0`, если автоподнятие отключено.
 */
  autoIncreasePercent?: number;
  /** Бюджет после автоподнятия. */
  autoIncreasedBudget?: string;
  /** `true`, если бюджет поднялся автоматически.
 */
  isAutoIncreased?: boolean;
  /** Рекомендуемый процент автоподнятия. */
  recommendedAutoIncreasePercent?: number;
}

/**
 * Информация о кампании. Возвращается, если в параметре `productAutopilotStrategy` включена автостратегия.
 */
export interface extcampaignCampaignInListAutopilot {
  /** Идентификатор категории. */
  categoryId?: string;
  /** Разрешение на автоматическое добавление товаров категории, указанной в `categoryId`, в кампании с автостратегией `MAX_VIEWS`:

- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN` — стратегия добавления товаров в кампанию не установлена;
- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_MANUAL` — добавлять товары в кампанию можно только вручную;
- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_AUTO` — можно добавлять товары категории `categoryId` в кампанию автоматически.

Если тип разрешения пустой или было передано `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN`, добавлять товары в кампанию можно только вручную.

Для кампаний без автостратегии `MAX_VIEWS` возвращается значение `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN`.
 */
  skuAddMode?: 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN' | 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_MANUAL' | 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_AUTO';
}

/**
 * Информация об автоподнятии бюджета.
 */
export interface extcampaignCampaignInListAutoincrease {
  /** Процент автоподнятия бюджета, от `10` до `50`. <br>
`0`, если автоподнятие отключено.
 */
  autoIncreasePercent?: number;
  /** Бюджет после автоподнятия. */
  autoIncreasedBudget?: string;
  /** `true`, если бюджет поднялся автоматически.
 */
  isAutoIncreased?: boolean;
  /** Рекомендуемый процент автоподнятия. */
  recommendedAutoIncreasePercent?: number;
}

export interface extcampaignCampaignInList {
  /** Идентификатор кампании. */
  id?: string;
  /** Тип оплаты:
- `CPC` — за клики,
- `CPM` — за показы,
- `CPO` — за заказы.
 */
  paymentType?: string;
  /** Название кампании. */
  title?: string;
  /** Состояние кампании:
- `CAMPAIGN_STATE_RUNNING` — активная кампания;
- `CAMPAIGN_STATE_PLANNED` — кампания, сроки проведения которой ещё не наступили;
- `CAMPAIGN_STATE_STOPPED` — кампания, приостановленная из-за нехватки бюджета;
- `CAMPAIGN_STATE_INACTIVE` — кампания, остановленная владельцем;
- `CAMPAIGN_STATE_ARCHIVED` — архивная кампания;
- `CAMPAIGN_STATE_MODERATION_DRAFT` — отредактированная кампания до отправки на модерацию;
- `CAMPAIGN_STATE_MODERATION_IN_PROGRESS` — кампания, отправленная на модерацию;
- `CAMPAIGN_STATE_MODERATION_FAILED` — кампания, непрошедшая модерацию;
- `CAMPAIGN_STATE_FINISHED` — кампания завершена, дата окончания в прошлом, такую кампанию нельзя изменить, можно
только клонировать или создать новую.
 */
  state?: string;
  /** Тип рекламируемой кампании:
  - `SKU` — Оплата за клик;
  - `BANNER` — Баннерная рекламная кампания;
  - `SEARCH_PROMO` — Оплата за заказ.
 */
  advObjectType?: string;
  /** Дата старта рекламной кампании. */
  fromDate?: string;
  /** Дата завершения рекламной кампании. */
  toDate?: string;
  /** Бюджет рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до копеек. Например, значение `1 000 000` в параметре равно 1 рублю. */
  budget?: string;
  /** Дневной бюджет рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до копеек. Например, значение `1 000 000` в параметре равно 1 рублю. */
  dailyBudget?: string;
  /** Недельный бюджет рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до копеек. Например, значение `1 000 000` в параметре равно 1 рублю. */
  weeklyBudget?: string;
  /** Место размещения продвигаемых товаров:
- `PLACEMENT_INVALID` — не определено.
- `PLACEMENT_PDP` — карточка товара. Доступно только для кампаний с ручным управлением.
- `PLACEMENT_SEARCH_AND_CATEGORY` — поиск и рекомендации.
- `PLACEMENT_TOP_PROMOTION` — поиск.
- `PLACEMENT_OVERTOP` — поиск и главная (Спецразмещение).
- `PLACEMENT_TAKEOVER` — одновременный показ товаров на первых 4 плитках.
 */
  placement?: 'PLACEMENT_INVALID' | 'PLACEMENT_PDP' | 'PLACEMENT_SEARCH_AND_CATEGORY' | 'PLACEMENT_TOP_PROMOTION' | 'PLACEMENT_OVERTOP' | 'PLACEMENT_TAKEOVER';
  /** Автостратегия, которая используется для кампании:
  - `MAX_VIEWS` — максимальное количество показов;
  - `MAX_CLICKS` — максимальное количество кликов для Поиска и рекомендаций;
  - `TOP_MAX_CLICKS` — максимальное количество кликов для Поиска;
  - `NO_AUTO_STRATEGY` — автостратегия не используется;
  - `TAKEOVER` — спецразмещение для Поиска.
 */
  productAutopilotStrategy?: 'MAX_VIEWS' | 'MAX_CLICKS' | 'TOP_MAX_CLICKS' | 'NO_AUTO_STRATEGY' | 'TAKEOVER';
  /** Информация о кампании. Возвращается, если в параметре `productAutopilotStrategy` включена автостратегия. */
  autopilot?: Record<string, unknown>;
  /** Дата создания кампании в формате RFC3339. */
  createdAt?: string;
  /** Дата обновления кампании в формате RFC3339. */
  updatedAt?: string;
  /** Режим создания и управления товарной рекламной кампанией:
- `PRODUCT_CAMPAIGN_MODE_AUTO` — автоматически;
- `PRODUCT_CAMPAIGN_MODE_MANUAL` — вручную.
 */
  productCampaignMode?: 'PRODUCT_CAMPAIGN_MODE_AUTO' | 'PRODUCT_CAMPAIGN_MODE_MANUAL';
  /** Информация об автоподнятии бюджета. */
  autoIncrease?: Record<string, unknown>;
}

export interface extcampaignCampaignsList {
  /** Список кампаний. */
  list?: unknown;
}

export interface extcampaignCampaignObject {
  /** Идентификатор рекламируемого объекта:
- SKU — для рекламы товаров в спонсорских полках и в каталоге;
- числовой идентификатор — для баннерных кампаний.
 */
  id?: string;
}

export interface extcampaignCampaignObjectsList {
  /** Список идентификаторов рекламируемых объектов. */
  list?: unknown;
}

export interface extcampaignCategoriesLimits {
  /** Ставка в рублях. */
  bid?: number;
  /** Категория товара. */
  category?: string;
}

export interface extcampaignLimitsData {
  /** Минимальная ставка для категории второго уровня. Если категории нет в списке, применяется минимальная ставка для инструмента. */
  categories?: unknown;
  /** Максимальная ставка в рублях. */
  maxBid?: number;
  /** Минимальная ставка в рублях. */
  minBid?: number;
  /** Тип инструмента:
- `SKU` — Оплата за клик,
- `SEARCH_PROMO` — Оплата за заказ.
 */
  objectType?: 'SKU' | 'SEARCH_PROMO';
  /** Способ оплаты:
- `CPO` — оплата за заказ,
- `CPC` — оплата за клик,
- `CPM` — оплата за 1000 показов.
 */
  paymentMethod?: 'CPO' | 'CPC' | 'CPM';
  /** Тип кампании:
- `CAMPAIGN_PLACEMENT_SEARCH_AND_CATEGORY` — Поиск и рекомендации;
- `CAMPAIGN_PLACEMENT_TOP_PROMOTION` — Поиск;
- `CAMPAIGN_PLACEMENT_OVERTOP` — Спецразмещение.
 */
  placement?: 'CAMPAIGN_PLACEMENT_SEARCH_AND_CATEGORY' | 'CAMPAIGN_PLACEMENT_TOP_PROMOTION' | 'CAMPAIGN_PLACEMENT_OVERTOP';
}

export interface extcampaignListLimitsResponse {
  /** Минимальные и максимальные ставки для инструментов продвижения. */
  limits?: unknown;
}

/**
 * Страна витрины:
 * - `MARKETPLACE_ID_RU` — Россия;
 * - `MARKETPLACE_ID_KZ` — Казахстан;
 * - `MARKETPLACE_ID_BY` — Белоруссия.
 * 
 */
export type camptypeMarketplaceID = Record<string, unknown>;

/**
 * Тип минимальной ставки:
 * - `CPO` — по кампании «Оплата за заказ»;
 * - `CPC` — по поиску и рекомендациям;
 * - `CPC_TOP` — по поиску.
 * 
 */
export type camptypeCampaignTypeRate = Record<string, unknown>;

export interface extcampaignBidBySKURequest {
  /** Страна витрины:
- `MARKETPLACE_ID_RU` — Россия;
- `MARKETPLACE_ID_KZ` — Казахстан;
- `MARKETPLACE_ID_BY` — Белоруссия.
 */
  marketplaceId?: 'MARKETPLACE_ID_RU' | 'MARKETPLACE_ID_KZ' | 'MARKETPLACE_ID_BY';
  /** Тип минимальной ставки:
- `CPO` — по кампании «Оплата за заказ»;
- `CPC` — по поиску и рекомендациям;
- `CPC_TOP` — по поиску.
 */
  paymentType?: 'CPO' | 'CPC' | 'CPC_TOP';
  /** Идентификатор товара: Ozon ID или SKU.
 */
  sku?: unknown;
}

export interface BidBySKUResponseBidSKU {
  /** Размер ставки. */
  bid?: number;
  /** Идентификатор товара: Ozon ID или SKU.
 */
  sku?: string;
}

export interface extcampaignBidBySKUResponse {
  /** Информация о минимальных ставках. */
  minBids?: unknown;
}

/**
 * Тип группировки по времени:
 * - `DATE` — группировка по дате (по дням);
 * - `START_OF_WEEK` — группировка по неделям;
 * - `START_OF_MONTH` — группировка по месяцам.
 * 
 */
export type extstatGroupBy = Record<string, unknown>;

/**
 * Структура исходного запроса.
 */
export interface extstatStatisticsRequest {
  /** Список идентификаторов кампаний, для которых необходимо подготовить отчёт.

Формат отчёта:
- CSV — если в списке одна кампания.
- ZIP архив — если в списке несколько кампаний. Каждый файл соответствует одной кампании из списка. Имя файла вида `<идентификатор кампании>.csv`.
 */
  campaigns: unknown;
  /** Начальная дата периода отчёта в формате RFC 3339.

Максимальный период, за который можно получить отчёт — 62 дня.
 */
  from?: string;
  /** Конечная дата периода отчёта в формате RFC 3339.

Максимальный период, за который можно получить отчёт — 62 дня.
 */
  to?: string;
  /** Начальная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.
 */
  dateFrom?: string;
  /** Конечная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.
 */
  dateTo?: string;
  /** Тип группировки по времени:
- `DATE` — группировка по дате (по дням);
- `START_OF_WEEK` — группировка по неделям;
- `START_OF_MONTH` — группировка по месяцам.
 */
  groupBy?: 'NO_GROUP_BY' | 'DATE' | 'START_OF_WEEK' | 'START_OF_MONTH';
}

export interface extstatStatisticsRequestID {
  /** Уникальный идентификатор отправленного запроса. 

По нему можно [проверить статус формирования отчёта](#operation/VendorStatisticsCheck) и [скачать отчёт](#operation/DownloadStatistics).
 */
  UUID?: string;
  /** Если запрашивается отчёт с аналитикой внешнего трафика  — `true`. */
  vendor?: boolean;
}

/**
 * Структура исходного запроса.
 */
export interface extstatStatisticsVideobannerRequest {
  /** Список идентификаторов кампаний, для которых необходимо подготовить отчёт.

Формат отчёта:
- CSV — если в списке одна кампания.
- ZIP архив — если в списке несколько кампаний. Каждый файл соответствует одной кампании из списка. Имя файла вида `<идентификатор кампании>.csv`.
 */
  campaigns: unknown;
  /** Начальная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.
 */
  dateFrom?: string;
  /** Конечная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.
 */
  dateTo?: string;
  /** Тип группировки по времени:
- `DATE` — группировка по дате (по дням);
- `START_OF_WEEK` — группировка по неделям;
- `START_OF_MONTH` — группировка по месяцам.
 */
  groupBy?: 'NO_GROUP_BY' | 'DATE' | 'START_OF_WEEK' | 'START_OF_MONTH';
}

/**
 * Текущее состояние запроса:
 * - `NOT_STARTED` — запрос ожидает выполнения;
 * - `IN_PROGRESS` — запрос выполняется в данный момент;
 * - `ERROR` — выполнение запроса завершилось ошибкой;
 * - `OK` — запрос успешно выполнен.
 * 
 */
export type extstatStatisticsRequestState = Record<string, unknown>;

/**
 * Структура исходного запроса.
 */
export interface extstatStatisticsResponseRequest {
  /** Список идентификаторов кампаний, для которых необходимо подготовить отчёт.

Формат отчёта:
- CSV — если в списке одна кампания.
- ZIP архив — если в списке несколько кампаний. Каждый файл соответствует одной кампании из списка. Имя файла вида `<идентификатор кампании>.csv`.
 */
  campaigns: unknown;
  /** Начальная дата периода отчёта в формате RFC 3339.

Максимальный период, за который можно получить отчёт — 62 дня.
 */
  from?: string;
  /** Конечная дата периода отчёта в формате RFC 3339.

Максимальный период, за который можно получить отчёт — 62 дня.
 */
  to?: string;
  /** Начальная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.
 */
  dateFrom?: string;
  /** Конечная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.
 */
  dateTo?: string;
  /** Тип группировки по времени:
- `DATE` — группировка по дате (по дням);
- `START_OF_WEEK` — группировка по неделям;
- `START_OF_MONTH` — группировка по месяцам.
 */
  groupBy?: 'NO_GROUP_BY' | 'DATE' | 'START_OF_WEEK' | 'START_OF_MONTH';
}

/**
 * Информация о запросе.
 */
export interface extstatStatisticsResponse {
  /** Уникальный идентификатор запроса, для которого производилась проверка. */
  UUID?: string;
  /** Текущее состояние запроса:
- `NOT_STARTED` — запрос ожидает выполнения;
- `IN_PROGRESS` — запрос выполняется в данный момент;
- `ERROR` — выполнение запроса завершилось ошибкой;
- `OK` — запрос успешно выполнен.
 */
  state?: 'NOT_STARTED' | 'IN_PROGRESS' | 'ERROR' | 'OK';
  /** Дата и время получения запроса сервером, часовой пояс UTC. */
  createdAt?: string;
  /** Дата и время последнего обновления состояния запроса, часовой пояс UTC. */
  updatedAt?: string;
  /** Структура исходного запроса. */
  request?: Record<string, unknown>;
  /** Краткое описание возникшей ошибки.

Поле присутствует, если выполнение запроса завершилось ошибкой.
 */
  error?: string;
  /** Относительная ссылка на отчёт в формате CSV.

Поле присутствует, если запрос выполнен успешно.
 */
  link?: string;
  /** Тип запрашиваемого отчёта:
- `STATS` — отчёт по кампании;
- `SEARCH_PHRASES` — отчёт по поисковым фразам и по категории товаров;
- `ATTRIBUTION` — отчёт по заказам для оплаты за заказ;
- `VIDEO` — отчёт по показам видеобаннера.
 */
  kind?: 'STATS' | 'SEARCH_PHRASES' | 'ATTRIBUTION' | 'VIDEO';
}

export interface StatisticsReportsListItemCampaign {
  /** Идентификатор кампании. */
  id?: string;
  /** Название кампании. */
  title?: string;
}

/**
 * Структура исходного запроса.
 */
export interface extstatStatisticsReportsListItemMetaRequest {
  /** Список идентификаторов кампаний, для которых необходимо подготовить отчёт.

Формат отчёта:
- CSV — если в списке одна кампания.
- ZIP архив — если в списке несколько кампаний. Каждый файл соответствует одной кампании из списка. Имя файла вида `<идентификатор кампании>.csv`.
 */
  campaigns: unknown;
  /** Начальная дата периода отчёта в формате RFC 3339.

Максимальный период, за который можно получить отчёт — 62 дня.
 */
  from?: string;
  /** Конечная дата периода отчёта в формате RFC 3339.

Максимальный период, за который можно получить отчёт — 62 дня.
 */
  to?: string;
  /** Начальная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.
 */
  dateFrom?: string;
  /** Конечная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.
 */
  dateTo?: string;
  /** Тип группировки по времени:
- `DATE` — группировка по дате (по дням);
- `START_OF_WEEK` — группировка по неделям;
- `START_OF_MONTH` — группировка по месяцам.
 */
  groupBy?: 'NO_GROUP_BY' | 'DATE' | 'START_OF_WEEK' | 'START_OF_MONTH';
}

/**
 * Информация о запросе.
 */
export interface extstatStatisticsReportsListItemMeta {
  /** Уникальный идентификатор запроса, для которого производилась проверка. */
  UUID?: string;
  /** Текущее состояние запроса:
- `NOT_STARTED` — запрос ожидает выполнения;
- `IN_PROGRESS` — запрос выполняется в данный момент;
- `ERROR` — выполнение запроса завершилось ошибкой;
- `OK` — запрос успешно выполнен.
 */
  state?: 'NOT_STARTED' | 'IN_PROGRESS' | 'ERROR' | 'OK';
  /** Дата и время получения запроса сервером, часовой пояс UTC. */
  createdAt?: string;
  /** Дата и время последнего обновления состояния запроса, часовой пояс UTC. */
  updatedAt?: string;
  /** Структура исходного запроса. */
  request?: Record<string, unknown>;
  /** Краткое описание возникшей ошибки.

Поле присутствует, если выполнение запроса завершилось ошибкой.
 */
  error?: string;
  /** Относительная ссылка на отчёт в формате CSV.

Поле присутствует, если запрос выполнен успешно.
 */
  link?: string;
  /** Тип запрашиваемого отчёта:
- `STATS` — отчёт по кампании;
- `SEARCH_PHRASES` — отчёт по поисковым фразам и по категории товаров;
- `ATTRIBUTION` — отчёт по заказам для оплаты за заказ;
- `VIDEO` — отчёт по показам видеобаннера.
 */
  kind?: 'STATS' | 'SEARCH_PHRASES' | 'ATTRIBUTION' | 'VIDEO';
}

export interface extstatStatisticsReportsListItem {
  /** Список кампаний. */
  campaigns?: unknown;
  /** Информация о запросе. */
  meta?: Record<string, unknown>;
  /** Название отчёта. */
  name?: string;
}

export interface extstatStatisticsReportsList {
  /** Список отчётов. */
  items?: unknown;
  /** Количество отчётов. */
  total?: string;
}

export interface extstatStatisticsReport {
  /** Формат отчёта. */
  contentType?: string;
}

/**
 * Место размещения продвигаемых товаров:
 * - `PLACEMENT_TOP_PROMOTION` — поиск.
 * - `PLACEMENT_INVALID` — не определено.
 * - `PLACEMENT_SEARCH_AND_CATEGORY` — поиск и рекомендации.
 * - `PLACEMENT_OVERTOP` — поиск и главная (Спецразмещение).
 * 
 */
export type CreateProductCampaignRequestV2ProductCampaignPlacementV2 = Record<string, unknown>;

/**
 * Автостратегия, которая будет использоваться для кампании:
 * - `MAX_CLICKS` — максимум кликов для Поиска и рекомендаций;
 * - `TOP_MAX_CLICKS` — максимум кликов для Поиска;
 * - `TARGET_BIDS` — средняя стоимость клика для Поиска и рекомендаций;
 * - `TAKEOVER` — спецразмещение для Поиска;
 * - `NO_AUTO_STRATEGY` — не использовать автостратегию.
 * 
 */
export type camptypeProductAutopilotStrategyCPC = Record<string, unknown>;

export interface extcampaignCreateProductCampaignRequestV2CPC {
  /** Название рекламной кампании. */
  title?: string;
  /** Дата начала рекламной кампании по московскому времени.

Если параметр не заполнен, датой старта считается начало текущего дня. 
Открутка начинается сразу после активации кампании, если не нужна модерация.
 */
  fromDate?: string;
  /** Дата окончания рекламной кампании по московскому времени. 
Параметр не учитывается для кампаний с оплатой за клики, созданных в автоматическом режиме.
 */
  toDate?: string;
  /** Ограничение дневного бюджета рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до
копеек. Например, значение `1 000 000` в параметре равно 1 рублю.

Если параметр не заполнен, дневной бюджет не ограничен. После создания рекламной кампании изменить бюджет с дневного на недельный и наоборот не получится.
 */
  dailyBudget?: string;
  /** Ограничение недельного бюджета рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до
копеек. Например, значение `1 000 000` в параметре равно 1 рублю.

Если параметр не заполнен, недельный бюджет не ограничен. После создания рекламной кампании изменить бюджет с недельного на дневной и наоборот не получится.
 */
  weeklyBudget?: string;
  /** Место размещения продвигаемых товаров:
- `PLACEMENT_TOP_PROMOTION` — поиск.
- `PLACEMENT_INVALID` — не определено.
- `PLACEMENT_SEARCH_AND_CATEGORY` — поиск и рекомендации.
- `PLACEMENT_OVERTOP` — поиск и главная (Спецразмещение).
 */
  placement: 'PLACEMENT_TOP_PROMOTION' | 'PLACEMENT_INVALID' | 'PLACEMENT_SEARCH_AND_CATEGORY' | 'PLACEMENT_OVERTOP';
  /** Автостратегия, которая будет использоваться для кампании:
- `MAX_CLICKS` — максимум кликов для Поиска и рекомендаций;
- `TOP_MAX_CLICKS` — максимум кликов для Поиска;
- `TARGET_BIDS` — средняя стоимость клика для Поиска и рекомендаций;
- `TAKEOVER` — спецразмещение для Поиска;
- `NO_AUTO_STRATEGY` — не использовать автостратегию.
 */
  productAutopilotStrategy?: 'MAX_CLICKS' | 'TOP_MAX_CLICKS' | 'TARGET_BIDS' | 'TAKEOVER' | 'NO_AUTO_STRATEGY';
  /** Процент автоподнятия бюджета, от `10` до `50`. <br>
`0`, если автоподнятие отключено.
 */
  autoIncreasePercent?: number;
  /** Тип спецразмещения:
  - `PRODUCT_PLACEMENT_TYPE_MAIN` — спецразмещение на главной;
  - `PRODUCT_PLACEMENT_TYPE_SEARCH` — спецразмещение в поиске;
  - `PRODUCT_PLACEMENT_TYPE_MAIN` и `PRODUCT_PLACEMENT_TYPE_SEARCH` — спецразмещение в поиске и на главной.
 */
  ProductAdvPlacements?: unknown;
}

export interface extcampaignCampaignID {
  /** Идентификатор кампании. */
  campaignId?: string;
}

/**
 * Автостратегия, которая будет использоваться для кампании:
 * - `MAX_CLICKS` — максимум кликов для Поиска и рекомендаций;
 * - `TOP_MAX_CLICKS` — максимум кликов для Поиска;
 * - `TARGET_BIDS` — средняя стоимость клика для Поиска;
 * - `NO_AUTO_STRATEGY` — не использовать автостратегию.
 * 
 */
export type camptypeDBproductAutopilotStrategy = Record<string, unknown>;

/**
 * Место размещения рекламы:
 *   - `CAMPAIGN_PLACEMENT_INVALID` — не определено;
 *   - `CAMPAIGN_PLACEMENT_PDP` — карточка товара;
 *   - `CAMPAIGN_PLACEMENT_SEARCH_AND_CATEGORY` — поиск и рекомендации;
 *   - `CAMPAIGN_PLACEMENT_TOP_PROMOTION` — поиск;
 *   - ~~`CAMPAIGN_PLACEMENT_TAKEOVER`~~ — одновременный показ товаров на первых 4 плитках. Значение устарело.
 * 
 */
export type advcamptypePlacement = Record<string, unknown>;

/**
 * Параметры для расчёта при создании кампании.
 */
export interface CalculateDynamicBudgetRequestCreateCampaignScenario {
  /** Автостратегия, которая будет использоваться для кампании:
- `MAX_CLICKS` — максимум кликов для Поиска и рекомендаций;
- `TOP_MAX_CLICKS` — максимум кликов для Поиска;
- `TARGET_BIDS` — средняя стоимость клика для Поиска;
- `NO_AUTO_STRATEGY` — не использовать автостратегию.
 */
  autopilotStrategy?: 'MAX_CLICKS' | 'TOP_MAX_CLICKS' | 'TARGET_BIDS' | 'NO_AUTO_STRATEGY';
  /** Место размещения рекламы:
  - `CAMPAIGN_PLACEMENT_INVALID` — не определено;
  - `CAMPAIGN_PLACEMENT_PDP` — карточка товара;
  - `CAMPAIGN_PLACEMENT_SEARCH_AND_CATEGORY` — поиск и рекомендации;
  - `CAMPAIGN_PLACEMENT_TOP_PROMOTION` — поиск;
  - ~~`CAMPAIGN_PLACEMENT_TAKEOVER`~~ — одновременный показ товаров на первых 4 плитках. Значение устарело.
 */
  placement?: 'CAMPAIGN_PLACEMENT_INVALID' | 'CAMPAIGN_PLACEMENT_PDP' | 'CAMPAIGN_PLACEMENT_SEARCH_AND_CATEGORY' | 'CAMPAIGN_PLACEMENT_TOP_PROMOTION' | 'CAMPAIGN_PLACEMENT_TAKEOVER';
  /** Количество товаров. */
  skusCount?: string;
}

/**
 * Информация об автостратегии.
 */
export interface camptypeMaybeProductAutopilotStrategy {
  /** Автостратегия, которая будет использоваться для кампании:
- `MAX_CLICKS` — максимум кликов для Поиска и рекомендаций;
- `TOP_MAX_CLICKS` — максимум кликов для Поиска;
- `TARGET_BIDS` — средняя стоимость клика для Поиска;
- `NO_AUTO_STRATEGY` — не использовать автостратегию.
 */
  strategy?: 'MAX_CLICKS' | 'TOP_MAX_CLICKS' | 'TARGET_BIDS' | 'NO_AUTO_STRATEGY';
}

/**
 * Информация об автостратегии.
 */
export interface CalculateDynamicBudgetRequestUpdateCampaignScenarioAutopilotstrategy {
  /** Автостратегия, которая будет использоваться для кампании:
- `MAX_CLICKS` — максимум кликов для Поиска и рекомендаций;
- `TOP_MAX_CLICKS` — максимум кликов для Поиска;
- `TARGET_BIDS` — средняя стоимость клика для Поиска;
- `NO_AUTO_STRATEGY` — не использовать автостратегию.
 */
  strategy?: 'MAX_CLICKS' | 'TOP_MAX_CLICKS' | 'TARGET_BIDS' | 'NO_AUTO_STRATEGY';
}

/**
 * Параметры для расчёта при обновлении кампании.
 */
export interface CalculateDynamicBudgetRequestUpdateCampaignScenario {
  /** Товары, которые добавили в кампанию. */
  addingSkus?: unknown;
  /** Информация об автостратегии. */
  autopilotStrategy?: Record<string, unknown>;
  /** Идентификатор кампании. */
  campaignId?: string;
}

/**
 * Параметры для расчёта при создании кампании.
 */
export interface extcampaignCalculateDynamicBudgetRequestCreatecampaign {
  /** Автостратегия, которая будет использоваться для кампании:
- `MAX_CLICKS` — максимум кликов для Поиска и рекомендаций;
- `TOP_MAX_CLICKS` — максимум кликов для Поиска;
- `TARGET_BIDS` — средняя стоимость клика для Поиска;
- `NO_AUTO_STRATEGY` — не использовать автостратегию.
 */
  autopilotStrategy?: 'MAX_CLICKS' | 'TOP_MAX_CLICKS' | 'TARGET_BIDS' | 'NO_AUTO_STRATEGY';
  /** Место размещения рекламы:
  - `CAMPAIGN_PLACEMENT_INVALID` — не определено;
  - `CAMPAIGN_PLACEMENT_PDP` — карточка товара;
  - `CAMPAIGN_PLACEMENT_SEARCH_AND_CATEGORY` — поиск и рекомендации;
  - `CAMPAIGN_PLACEMENT_TOP_PROMOTION` — поиск;
  - ~~`CAMPAIGN_PLACEMENT_TAKEOVER`~~ — одновременный показ товаров на первых 4 плитках. Значение устарело.
 */
  placement?: 'CAMPAIGN_PLACEMENT_INVALID' | 'CAMPAIGN_PLACEMENT_PDP' | 'CAMPAIGN_PLACEMENT_SEARCH_AND_CATEGORY' | 'CAMPAIGN_PLACEMENT_TOP_PROMOTION' | 'CAMPAIGN_PLACEMENT_TAKEOVER';
  /** Количество товаров. */
  skusCount?: string;
}

/**
 * Информация об автостратегии.
 */
export interface extcampaignCalculateDynamicBudgetRequestUpdatecampaignAutopilotstrategy {
  /** Автостратегия, которая будет использоваться для кампании:
- `MAX_CLICKS` — максимум кликов для Поиска и рекомендаций;
- `TOP_MAX_CLICKS` — максимум кликов для Поиска;
- `TARGET_BIDS` — средняя стоимость клика для Поиска;
- `NO_AUTO_STRATEGY` — не использовать автостратегию.
 */
  strategy?: 'MAX_CLICKS' | 'TOP_MAX_CLICKS' | 'TARGET_BIDS' | 'NO_AUTO_STRATEGY';
}

/**
 * Параметры для расчёта при обновлении кампании.
 */
export interface extcampaignCalculateDynamicBudgetRequestUpdatecampaign {
  /** Товары, которые добавили в кампанию. */
  addingSkus?: unknown;
  /** Информация об автостратегии. */
  autopilotStrategy?: Record<string, unknown>;
  /** Идентификатор кампании. */
  campaignId?: string;
}

export interface extcampaignCalculateDynamicBudgetRequest {
  /** Параметры для расчёта при создании кампании. */
  createCampaign?: Record<string, unknown>;
  /** Параметры для расчёта при обновлении кампании. */
  updateCampaign?: Record<string, unknown>;
}

/**
 * Тип минимального бюджета:
 * - `DYNAMIC_BUDGET_REQUIRED` — обязательный;
 * - `DYNAMIC_BUDGET_RECOMMENDED` — рекомендованный.
 * 
 */
export type camptypeDynamicBudgetType = Record<string, unknown>;

export interface extcampaignCalculateDynamicBudgetResponse {
  /** Бюджет рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до копеек. Например, значение `1 000 000` в параметре равно 1 рублю. */
  campaignBudget?: string;
  /** Минимальный бюджет. */
  dynamicBudget?: string;
  /** Тип минимального бюджета:
- `DYNAMIC_BUDGET_REQUIRED` — обязательный;
- `DYNAMIC_BUDGET_RECOMMENDED` — рекомендованный.
 */
  dynamicBudgetType?: 'DYNAMIC_BUDGET_REQUIRED' | 'DYNAMIC_BUDGET_RECOMMENDED';
  /** Сумма в рублях, на которую увеличивается минимальный бюджет за каждый добавленный в кампанию товар. */
  skuPrice?: string;
}

export type Empty = Record<string, unknown>;

/**
 * Тип оплаты:
 * - `CPC` — за клики.
 * 
 */
export type camptypeCampaignType = Record<string, unknown>;

/**
 * Место размещения продвигаемых товаров:
 * - `PLACEMENT_INVALID` — не определено.
 * - `PLACEMENT_PDP` — карточка товара. Доступно только для кампаний с ручным управлением.
 * - `PLACEMENT_SEARCH_AND_CATEGORY` — поиск и рекомендации.
 * - `PLACEMENT_TOP_PROMOTION` — поиск.
 * - `PLACEMENT_OVERTOP` — поиск и главная (Спецразмещение).
 * 
 */
export type extcampaignProductCampaignPlacement = Record<string, unknown>;

/**
 * Информация о кампании. Возвращается, если в параметре `productAutopilotStrategy` включена автостратегия.
 */
export interface extcampaignCampaignAutopilot {
  /** Идентификатор категории. */
  categoryId?: string;
  /** Разрешение на автоматическое добавление товаров категории, указанной в `categoryId`, в кампании с автостратегией `MAX_VIEWS`:

- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN` — стратегия добавления товаров в кампанию не установлена;
- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_MANUAL` — добавлять товары в кампанию можно только вручную;
- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_AUTO` — можно добавлять товары категории `categoryId` в кампанию автоматически.

Если тип разрешения пустой или было передано `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN`, добавлять товары в кампанию можно только вручную.

Для кампаний без автостратегии `MAX_VIEWS` возвращается значение `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN`.
 */
  skuAddMode?: 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN' | 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_MANUAL' | 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_AUTO';
}

/**
 * Информация об автоподнятии бюджета.
 */
export interface extcampaignCampaignAutoincrease {
  /** Процент автоподнятия бюджета, от `10` до `50`. <br>
`0`, если автоподнятие отключено.
 */
  autoIncreasePercent?: number;
  /** Бюджет после автоподнятия. */
  autoIncreasedBudget?: string;
  /** `true`, если бюджет поднялся автоматически.
 */
  isAutoIncreased?: boolean;
  /** Рекомендуемый процент автоподнятия. */
  recommendedAutoIncreasePercent?: number;
}

export interface extcampaignCampaign {
  /** Идентификатор кампании. */
  id?: string;
  /** Тип оплаты:
- `CPC` — за клики.
 */
  paymentType?: string;
  /** Название кампании. */
  title?: string;
  /** Состояние кампании:
- `CAMPAIGN_STATE_RUNNING` — активная кампания;
- `CAMPAIGN_STATE_PLANNED` — кампания, сроки проведения которой ещё не наступили;
- `CAMPAIGN_STATE_STOPPED` — кампания, приостановленная из-за нехватки бюджета;
- `CAMPAIGN_STATE_INACTIVE` — кампания, остановленная владельцем;
- `CAMPAIGN_STATE_ARCHIVED` — архивная кампания;
- `CAMPAIGN_STATE_MODERATION_DRAFT` — отредактированная кампания до отправки на модерацию;
- `CAMPAIGN_STATE_MODERATION_IN_PROGRESS` — кампания, отправленная на модерацию;
- `CAMPAIGN_STATE_MODERATION_FAILED` — кампания, непрошедшая модерацию;
- `CAMPAIGN_STATE_FINISHED` — кампания завершена, дата окончания в прошлом, такую кампанию нельзя изменить, можно
только клонировать или создать новую.
 */
  state?: string;
  /** Тип рекламируемой кампании:
  - `SKU` — Оплата за клик и Спецразмещение.
 */
  advObjectType?: string;
  /** Дата старта рекламной кампании. */
  fromDate?: string;
  /** Дата завершения рекламной кампании. */
  toDate?: string;
  /** Бюджет рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до копеек. Например, значение `1 000 000` в параметре равно 1 рублю. */
  budget?: string;
  /** Дневной бюджет рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до копеек. Например, значение `1 000 000` в параметре равно 1 рублю. */
  dailyBudget?: string;
  /** Недельный бюджет рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до копеек. Например, значение `1 000 000` в параметре равно 1 рублю. */
  weeklyBudget?: string;
  /** Место размещения продвигаемых товаров:
- `PLACEMENT_INVALID` — не определено.
- `PLACEMENT_PDP` — карточка товара. Доступно только для кампаний с ручным управлением.
- `PLACEMENT_SEARCH_AND_CATEGORY` — поиск и рекомендации.
- `PLACEMENT_TOP_PROMOTION` — поиск.
- `PLACEMENT_OVERTOP` — поиск и главная (Спецразмещение).
 */
  placement?: 'PLACEMENT_INVALID' | 'PLACEMENT_PDP' | 'PLACEMENT_SEARCH_AND_CATEGORY' | 'PLACEMENT_TOP_PROMOTION' | 'PLACEMENT_OVERTOP';
  /** Автостратегия, которая используется для кампании:
  - `MAX_VIEWS` — максимальное количество показов;
  - `MAX_CLICKS` — максимальное количество кликов для Поиска и рекомендаций;
  - `TOP_MAX_CLICKS` — максимальное количество кликов для Поиска;
  - `TAKEOVER` — спецразмещение для Поиска;
  - `NO_AUTO_STRATEGY` — автостратегия не используется.
 */
  productAutopilotStrategy?: 'MAX_VIEWS' | 'MAX_CLICKS' | 'TOP_MAX_CLICKS' | 'TAKEOVER' | 'NO_AUTO_STRATEGY';
  /** Информация о кампании. Возвращается, если в параметре `productAutopilotStrategy` включена автостратегия. */
  autopilot?: Record<string, unknown>;
  /** Дата создания кампании в формате RFC3339. */
  createdAt?: string;
  /** Дата обновления кампании в формате RFC3339. */
  updatedAt?: string;
  /** Режим создания и управления товарной рекламной кампанией:
- `PRODUCT_CAMPAIGN_MODE_AUTO` — автоматически;
- `PRODUCT_CAMPAIGN_MODE_MANUAL` — вручную.
 */
  productCampaignMode?: 'PRODUCT_CAMPAIGN_MODE_AUTO' | 'PRODUCT_CAMPAIGN_MODE_MANUAL';
  /** Информация об автоподнятии бюджета. */
  autoIncrease?: Record<string, unknown>;
  /** Тип спецразмещения:
  - `PRODUCT_PLACEMENT_TYPE_MAIN` — спецразмещение на главной;
  - `PRODUCT_PLACEMENT_TYPE_SEARCH` — спецразмещение в поиске;
  - `PRODUCT_PLACEMENT_TYPE_MAIN` и `PRODUCT_PLACEMENT_TYPE_SEARCH` — спецразмещение в поиске и на главной.
 */
  ProductAdvPlacements?: unknown;
}

/**
 * Информация о кампании. Обязательный параметр, если в параметре `productAutopilotStrategy` включена автостратегия.
 */
export interface extcampaignPatchProductCampaignAutopilotProperties {
  /** Идентификатор категории. */
  categoryId?: string;
  /** Разрешение на автоматическое добавление товаров из категории, которая указана в `categoryId`, в кампании с автостратегией `MAX_VIEWS`:

- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN` — стратегия добавления товаров в кампанию не установлена;
- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_MANUAL` — добавлять товары в кампанию можно только вручную;
- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_AUTO` — можно добавлять товары категории `categoryId` в кампанию автоматически.

Если тип разрешения пустой или было передано `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN`, добавлять товары в кампанию можно только вручную.

Для кампаний без автостратегии `MAX_VIEWS` возвращается значение `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN`.
 */
  skuAddMode?: 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN' | 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_MANUAL' | 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_AUTO';
}

/**
 * Информация о кампании. Обязательный параметр, если в параметре `productAutopilotStrategy` включена автостратегия.
 */
export interface extcampaignPatchProductCampaignRequestAutopilot {
  /** Идентификатор категории. */
  categoryId?: string;
  /** Разрешение на автоматическое добавление товаров из категории, которая указана в `categoryId`, в кампании с автостратегией `MAX_VIEWS`:

- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN` — стратегия добавления товаров в кампанию не установлена;
- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_MANUAL` — добавлять товары в кампанию можно только вручную;
- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_AUTO` — можно добавлять товары категории `categoryId` в кампанию автоматически.

Если тип разрешения пустой или было передано `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN`, добавлять товары в кампанию можно только вручную.

Для кампаний без автостратегии `MAX_VIEWS` возвращается значение `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN`.
 */
  skuAddMode?: 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN' | 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_MANUAL' | 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_AUTO';
}

export interface extcampaignPatchProductCampaignRequest {
  /** Информация о кампании. Обязательный параметр, если в параметре `productAutopilotStrategy` включена автостратегия. */
  autopilot?: Record<string, unknown>;
  /** Дата начала рекламной кампании по московскому времени.

Не может быть раньше текущей даты.
 */
  fromDate?: string;
  /** Дата окончания рекламной кампании по московскому времени.

Не может быть раньше даты начала.
 */
  toDate?: string;
  /** Ограничение общего бюджета рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до копеек. Например, значение `1 000 000` в параметре равно 1 рублю.

Учитывается только для автоматических кампаний брендов и агентств. 
В других организациях установить новое ограничение общего бюджета не получится. Если у кампании уже установлен бюджет, можно:
- Убрать ограничения: передайте `0` в этом параметре.
- Не менять бюджет кампании. Когда он будет исчерпан, уберите ограничения бюджета или создайте новую кампанию с неограниченным бюджетом.
 */
  budget?: string;
  /** Ограничение дневного бюджета рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до копеек. Например, значение `1 000 000` в параметре равно 1 рублю.

Если параметр не заполнен, дневной бюджет не ограничен. После создания рекламной кампании изменить бюджет с дневного на недельный и наоборот не получится.
 */
  dailyBudget?: string;
  /** Ограничение недельного бюджета рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до
копеек. Например, значение `1 000 000` в параметре равно 1 рублю.

Если параметр не заполнен, недельный бюджет не ограничен. После создания рекламной кампании изменить бюджет с недельного на дневной и наоборот не получится.
 */
  weeklyBudget?: string;
  /** Процент автоподнятия бюджета, от `10` до `50`. <br>
`0`, если автоподнятие отключено.
 */
  autoIncreasePercent?: number;
  /** Тип спецразмещения:
  - `PRODUCT_PLACEMENT_TYPE_MAIN` — спецразмещение на главной;
  - `PRODUCT_PLACEMENT_TYPE_SEARCH` — спецразмещение в поиске;
  - `PRODUCT_PLACEMENT_TYPE_MAIN` и `PRODUCT_PLACEMENT_TYPE_SEARCH` — спецразмещение в поиске и на главной.
 */
  ProductAdvPlacements?: unknown;
}

export interface extcampaignUpdateProductsRequestProduct {
  /** SKU рекламируемого товара.
 */
  sku: string;
  /** Ставка за 1 клик (CPC).
 */
  bid: string;
}

export interface extcampaignUpdateProductsRequest {
  /** Ставки за клики. */
  bids?: unknown;
}

export interface extcampaignAddProductsRequestProduct {
  /** SKU рекламируемого товара.

Обязательное поле.
 */
  sku?: string;
  /** Ставка за 1 клик (CPC).
 */
  bid?: string;
}

export interface extcampaignAddProductsRequest {
  /** Ставки за клики. */
  bids?: unknown;
}

export interface extcampaignGetProductsResponseV2Product {
  /** Идентификатор товара: Ozon ID или SKU.
 */
  sku?: string;
  /** Ставка за 1 клик (CPC). */
  bid?: string;
  /** Название товара. */
  title?: string;
}

export interface extcampaignGetProductsResponseV2 {
  /** Список товаров кампании. */
  products?: unknown;
}

export interface extcampaignDeleteProductsRequest {
  /** SKU продвигаемого товара. */
  sku?: unknown;
}

export interface GetProductsCompetitiveBidsResponseBids {
  /** Ставка. */
  bid?: string;
  /** SKU товара. */
  sku?: string;
}

export interface extcampaignGetProductsCompetitiveBidsResponse {
  /** Список ставок. */
  bids?: unknown;
  /** Идентификатор кампании. */
  campaignId?: string;
}

export interface extcampaignListSearchPromoProductsRequestV2 {
  /** Номер страницы. Пагинация начинается с единицы. */
  page?: number;
  /** Размер страницы. */
  pageSize?: number;
}

/**
 * Статус участия товара в акции Морковск»:
 * - `CARROTS_STATUS_INVALID` —  статус отсутствует;
 * - `CARROTS_STATUS_UNAVAILABLE` — статус недоступен; 
 * - `CARROTS_STATUS_DISABLED` — товар не участвует в акции; 
 * - `CARROTS_STATUS_ENABLED` —  товар участвует в акции.
 * 
 */
export type mainpagev1CarrotsStatus = Record<string, unknown>;

/**
 * Максимальная ставка.
 */
export interface extcampaignListSearchPromoProductsResponseV2Hint {
  /** Идентификатор кампании. */
  campaignId?: string;
  /** Название организации. */
  organisationTitle?: string;
}

/**
 * Информация о предыдущем значении ставки.
 */
export interface extcampaignListSearchPromoProductsResponseV2PreviousBid {
  /** Предыдущее значение `products.bid`. */
  bid?: number;
  /** Предыдущее значение `products.bidPrice`. */
  bidPrice?: string;
  /** Дата и время последнего изменения ставки. */
  updatedAt?: string;
}

/**
 * Информация о просмотрах.
 */
export interface extcampaignListSearchPromoProductsResponseV2Views {
  /** Количество просмотров товара за предыдущую неделю. */
  previousWeek?: string;
  /** Количество просмотров товара за последние 7 дней. */
  thisWeek?: string;
}

/**
 * Максимальная ставка.
 */
export interface extcampaignListSearchPromoProductsResponseV2ProductHint {
  /** Идентификатор кампании. */
  campaignId?: string;
  /** Название организации. */
  organisationTitle?: string;
}

/**
 * Информация о предыдущем значении ставки.
 */
export interface extcampaignListSearchPromoProductsResponseV2ProductPreviousbid {
  /** Предыдущее значение `products.bid`. */
  bid?: number;
  /** Предыдущее значение `products.bidPrice`. */
  bidPrice?: string;
  /** Дата и время последнего изменения ставки. */
  updatedAt?: string;
}

/**
 * Информация о просмотрах.
 */
export interface extcampaignListSearchPromoProductsResponseV2ProductViews {
  /** Количество просмотров товара за предыдущую неделю. */
  previousWeek?: string;
  /** Количество просмотров товара за последние 7 дней. */
  thisWeek?: string;
}

export interface extcampaignListSearchPromoProductsResponseV2Product {
  /** Ставка за 1 заказ (CPO). Единица измерения — процент от цены товара. */
  bid?: number;
  /** Ставка за 1 заказ (CPO) в рублях. */
  bidPrice?: string;
  /** Ставка за 1 заказ (CPO) в рублях без участия в акции «Морковск». */
  bidWithoutAdditive?: number;
  /** Процент, на который участие в акции «Морковск» повышает ставку. */
  carrotsAdditive?: number;
  /** Статус участия товара в акции Морковск»:
- `CARROTS_STATUS_INVALID` —  статус отсутствует;
- `CARROTS_STATUS_UNAVAILABLE` — статус недоступен; 
- `CARROTS_STATUS_DISABLED` — товар не участвует в акции; 
- `CARROTS_STATUS_ENABLED` —  товар участвует в акции.
 */
  carrotsStatus?: 'CARROTS_STATUS_INVALID' | 'CARROTS_STATUS_UNAVAILABLE' | 'CARROTS_STATUS_DISABLED' | 'CARROTS_STATUS_ENABLED';
  /** Максимальная ставка. */
  hint?: Record<string, unknown>;
  /** Адрес ссылки на изображение. */
  imageUrl?: string;
  /** `true`, если товар не заблокирован в продвижении в оплате за заказ.
 */
  isSearchPromoAvailable?: boolean;
  /** Информация о предыдущем значении ставки. */
  previousBid?: Record<string, unknown>;
  /** Предыдущее значение `visibilityIndex`. */
  previousVisibilityIndex?: string;
  /** Цена товара. */
  price?: string;
  /** `true`, если включено продвижение товара в оплате за заказ.
 */
  searchPromoStatus?: boolean;
  /** SKU продвигаемого товара. */
  sku?: string;
  /** Артикул продавца. */
  sourceSku?: string;
  /** Название товара. */
  title?: string;
  /** Информация о просмотрах. */
  views?: Record<string, unknown>;
  /** Индекс видимости. */
  visibilityIndex?: string;
}

export interface extcampaignListSearchPromoProductsResponseV2 {
  /** Список товаров. */
  products?: unknown;
  /** Количество товаров. */
  total?: string;
}

export interface extcampaignGetProductsRecommendedBidsRequest {
  /** Список идентификаторов товаров. */
  skus?: unknown;
}

export interface extcampaignGetProductsRecommendedBidsResponse {
  /** Список рекомендованных ставок. */
  recommendedBids?: Record<string, unknown>;
}

export interface extcampaignSetSearchPromoBidsRequestV2Bid {
  /** Ставка за 1 заказ (CPO), единица измерения — процент от цены товара. */
  bid?: number;
  /** Идентификатор товара. */
  sku?: string;
}

export interface extcampaignSetSearchPromoBidsRequestV2 {
  /** Значения ставок. */
  bids?: unknown;
}

export interface extcampaignSetSearchPromoBidsResponseV2ResponseCellextcampaignSetSearchPromoBidsResponseV2ResponseCell {
  /** Значения ставок. */
  bid?: number;
  /** Ошибка, из-за которой нельзя обновить ставку. */
  error?: string;
  /** SKU продвигаемого товара. */
  sku?: string;
  /** `true`, если ставка обновилась.
 */
  update?: boolean;
}

export interface extcampaignSetSearchPromoBidsResponseV2extcampaignSetSearchPromoBidsResponseV2 {
  /** Ответ метода. */
  response?: unknown;
}

export interface extcampaignGetCPOMinBidsResponseItem {
  /** Значение ставки. */
  bid?: number;
  /** SKU продвигаемого товара. */
  sku?: string;
}

export interface extcampaignGetCPOMinBidsResponse {
  /** Информация о ставках. */
  bids?: unknown;
}

export interface extcampaignBatchEnableProductsRequest {
  /** Список идентификаторов товаров. */
  skus?: unknown;
}

export interface extcampaignBatchEnableProductsResponseResponseCellextcampaignBatchEnableProductsResponseResponseCell {
  /** Значения ставок. */
  bid?: number;
  /** Ошибка, из-за которой нельзя включить продвижение товара. */
  error?: string;
  /** SKU продвигаемого товара. */
  sku?: string;
  /** `true`, если продвижение товара включилось.
 */
  update?: boolean;
}

export interface extcampaignBatchEnableProductsResponseextcampaignBatchEnableProductsResponse {
  /** Ответ метода. */
  response?: unknown;
}

export interface extcampaignBatchDisableProductsRequest {
  /** Список идентификаторов товаров. */
  skus?: unknown;
}

export interface extcampaignDeleteSearchPromoBidsRequestV2 {
  /** Список идентификаторов товаров. */
  sku?: unknown;
}

export interface extcampaignBatchEnableCarrotsRequest {
  /** Список идентификаторов товаров. */
  skus: unknown;
}

/**
 * Ошибка при включении или отключении продвижения:
 * - `CARROT_ERROR_NONE` — нет ошибки;
 * - `CARROT_ERROR_INVALID_PRICE` — цена товара ниже минимального значения;
 * - `CARROT_ERROR_INVALID_PRODUCT` — товар не прошёл модерацию;
 * - `CARROT_ERROR_OTHER` — прочие ошибки.
 * 
 */
export type carrotsCarrotError = Record<string, unknown>;

/**
 * Информация об операции.
 */
export interface extcampaignBatchEnableCarrotsResponseInfo {
  /** Ошибка при включении или отключении продвижения:
- `CARROT_ERROR_NONE` — нет ошибки;
- `CARROT_ERROR_INVALID_PRICE` — цена товара ниже минимального значения;
- `CARROT_ERROR_INVALID_PRODUCT` — товар не прошёл модерацию;
- `CARROT_ERROR_OTHER` — прочие ошибки.
 */
  error?: 'CARROT_ERROR_NONE' | 'CARROT_ERROR_INVALID_PRICE' | 'CARROT_ERROR_INVALID_PRODUCT' | 'CARROT_ERROR_OTHER';
  /** `true`, если продвижение включено.
 */
  isEnabled?: boolean;
}

export interface extcampaignBatchEnableCarrotsResponse {
  /** Информация о включении продвижения по SKU товара. */
  skuToInfo?: Record<string, unknown>;
}

export interface extcampaignBatchDisableCarrotsRequest {
  /** Список идентификаторов товаров. */
  skus: unknown;
}

/**
 * Информация об операции.
 */
export interface extcampaignBatchDisableCarrotsResponseInfo {
  /** Ошибка при включении или отключении продвижения:
- `CARROT_ERROR_NONE` — нет ошибки;
- `CARROT_ERROR_INVALID_PRICE` — цена товара ниже минимального значения;
- `CARROT_ERROR_INVALID_PRODUCT` — товар не прошёл модерацию;
- `CARROT_ERROR_OTHER` — прочие ошибки.
 */
  error?: 'CARROT_ERROR_NONE' | 'CARROT_ERROR_INVALID_PRICE' | 'CARROT_ERROR_INVALID_PRODUCT' | 'CARROT_ERROR_OTHER';
  /** `true`, если продвижение отключено.
 */
  isDisabled?: boolean;
}

export interface extcampaignBatchDisableCarrotsResponse {
  /** Информация об отключении продвижения по SKU товара. */
  skuToInfo?: Record<string, unknown>;
}

/**
 * Метод, с помощью которого запросили формирование отчёта.
 */
export interface extstatVendorStatisticsRequest {
  /** Начало отчётного периода.

Дата должна быть не ранее 1 января 2022 года.
 */
  dateFrom?: string;
  /** Конец отчётного периода.

Дата должна быть позднее `dateFrom` не больше чем на 3 месяца. Если дата позднее трёх месяцев, 
отчёт сформируется за 3 месяца с даты, указанной в `dateFrom`.
 */
  dateTo?: string;
  /** Тип отчёта:
- `TRAFFIC_SOURCES` — отчёт по источникам трафика.
- `ORDERS` — отчёт по заказам.
 */
  type?: 'TRAFFIC_SOURCES' | 'ORDERS';
}

/**
 * Метод, с помощью которого запросили формирование отчёта.
 */
export interface extstatVendorStatisticsResponseRequest {
  /** Начало отчётного периода.

Дата должна быть не ранее 1 января 2022 года.
 */
  dateFrom?: string;
  /** Конец отчётного периода.

Дата должна быть позднее `dateFrom` не больше чем на 3 месяца. Если дата позднее трёх месяцев, 
отчёт сформируется за 3 месяца с даты, указанной в `dateFrom`.
 */
  dateTo?: string;
  /** Тип отчёта:
- `TRAFFIC_SOURCES` — отчёт по источникам трафика.
- `ORDERS` — отчёт по заказам.
 */
  type?: 'TRAFFIC_SOURCES' | 'ORDERS';
}

/**
 * Информация об отчёте.
 */
export interface extstatVendorStatisticsResponse {
  /** Уникальный идентификатор отправленного запроса, с помощью которого в дальнейшем можно проверить статус выполнения запроса и скачать отчёт. */
  UUID?: string;
  /** Дата формирования отчёта. */
  createdAt?: string;
  /** Описание ошибки. */
  error?: string;
  /** Ссылка на отчёт. */
  link?: string;
  /** Метод, с помощью которого запросили формирование отчёта. */
  request?: Record<string, unknown>;
  /** Статус формирования отчёта:
- `NOT_STARTED` — ещё не началось. 
- `IN_PROGRESS` — в процессе. 
- `CANCEL` — отменено.
- `OK` — отчёт сформирован.
- `ERROR` — произошла ошибка.
- `TIMEOUT` — время ожидания истекло.
 */
  state?: 'NOT_STARTED' | 'IN_PROGRESS' | 'OK' | 'ERROR' | 'TIMEOUT' | 'CANCEL';
  /** Время изменения статуса. */
  updatedAt?: string;
}

/**
 * Метод, с помощью которого запросили формирование отчёта.
 */
export interface VendorStatisticsReportsListItemMetaRequest {
  /** Начало отчётного периода.

Дата должна быть не ранее 1 января 2022 года.
 */
  dateFrom?: string;
  /** Конец отчётного периода.

Дата должна быть позднее `dateFrom` не больше чем на 3 месяца. Если дата позднее трёх месяцев, 
отчёт сформируется за 3 месяца с даты, указанной в `dateFrom`.
 */
  dateTo?: string;
  /** Тип отчёта:
- `TRAFFIC_SOURCES` — отчёт по источникам трафика.
- `ORDERS` — отчёт по заказам.
 */
  type?: 'TRAFFIC_SOURCES' | 'ORDERS';
}

/**
 * Информация об отчёте.
 */
export interface VendorStatisticsReportsListItemMeta {
  /** Уникальный идентификатор отправленного запроса, с помощью которого в дальнейшем можно проверить статус выполнения запроса и скачать отчёт. */
  UUID?: string;
  /** Дата формирования отчёта. */
  createdAt?: string;
  /** Описание ошибки. */
  error?: string;
  /** Ссылка на отчёт. */
  link?: string;
  /** Метод, с помощью которого запросили формирование отчёта. */
  request?: Record<string, unknown>;
  /** Статус формирования отчёта:
- `NOT_STARTED` — ещё не началось. 
- `IN_PROGRESS` — в процессе. 
- `CANCEL` — отменено.
- `OK` — отчёт сформирован.
- `ERROR` — произошла ошибка.
- `TIMEOUT` — время ожидания истекло.
 */
  state?: 'NOT_STARTED' | 'IN_PROGRESS' | 'OK' | 'ERROR' | 'TIMEOUT' | 'CANCEL';
  /** Время изменения статуса. */
  updatedAt?: string;
}

export interface VendorStatisticsReportsListItem {
  /** Информация об отчёте. */
  meta?: Record<string, unknown>;
  /** Название отчёта. */
  name?: string;
}

export interface extstatVendorStatisticsReportsList {
  /** Информация об отчётах. */
  items?: unknown;
  /** Количество отчётов. */
  total?: string;
}

export interface extorganisationGetVendorTagResponse {
  /** Префикс организации для UTM-метки. */
  tag?: string;
}

export interface GetApiClientCampaign200ResponseSchema {
  /** Список кампаний. */
  list?: unknown;
}

export interface GetApiClientCampaigndefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface GetApiClientCampaignObjects200ResponseSchema {
  /** Список идентификаторов рекламируемых объектов. */
  list?: unknown;
}

export interface GetApiClientCampaignObjectsdefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface GetApiClientLimitsList200ResponseSchema {
  /** Минимальные и максимальные ставки для инструментов продвижения. */
  limits?: unknown;
}

export interface GetApiClientLimitsListdefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface PostApiClientMinSkuRequestSchema {
  /** Страна витрины:
- `MARKETPLACE_ID_RU` — Россия;
- `MARKETPLACE_ID_KZ` — Казахстан;
- `MARKETPLACE_ID_BY` — Белоруссия.
 */
  marketplaceId?: 'MARKETPLACE_ID_RU' | 'MARKETPLACE_ID_KZ' | 'MARKETPLACE_ID_BY';
  /** Тип минимальной ставки:
- `CPO` — по кампании «Оплата за заказ»;
- `CPC` — по поиску и рекомендациям;
- `CPC_TOP` — по поиску.
 */
  paymentType?: 'CPO' | 'CPC' | 'CPC_TOP';
  /** Идентификатор товара: Ozon ID или SKU.
 */
  sku?: unknown;
}

export interface PostApiClientMinSku200ResponseSchema {
  /** Информация о минимальных ставках. */
  minBids?: unknown;
}

export interface PostApiClientMinSkudefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

/**
 * Структура исходного запроса.
 */
export interface PostApiClientStatisticsRequestSchema {
  /** Список идентификаторов кампаний, для которых необходимо подготовить отчёт.

Формат отчёта:
- CSV — если в списке одна кампания.
- ZIP архив — если в списке несколько кампаний. Каждый файл соответствует одной кампании из списка. Имя файла вида `<идентификатор кампании>.csv`.
 */
  campaigns: unknown;
  /** Начальная дата периода отчёта в формате RFC 3339.

Максимальный период, за который можно получить отчёт — 62 дня.
 */
  from?: string;
  /** Конечная дата периода отчёта в формате RFC 3339.

Максимальный период, за который можно получить отчёт — 62 дня.
 */
  to?: string;
  /** Начальная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.
 */
  dateFrom?: string;
  /** Конечная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.
 */
  dateTo?: string;
  /** Тип группировки по времени:
- `DATE` — группировка по дате (по дням);
- `START_OF_WEEK` — группировка по неделям;
- `START_OF_MONTH` — группировка по месяцам.
 */
  groupBy?: 'NO_GROUP_BY' | 'DATE' | 'START_OF_WEEK' | 'START_OF_MONTH';
}

export interface PostApiClientStatistics200ResponseSchema {
  /** Уникальный идентификатор отправленного запроса. 

По нему можно [проверить статус формирования отчёта](#operation/VendorStatisticsCheck) и [скачать отчёт](#operation/DownloadStatistics).
 */
  UUID?: string;
  /** Если запрашивается отчёт с аналитикой внешнего трафика  — `true`. */
  vendor?: boolean;
}

export interface PostApiClientStatisticsdefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

/**
 * Структура исходного запроса.
 */
export interface PostApiClientStatisticsVideoRequestSchema {
  /** Список идентификаторов кампаний, для которых необходимо подготовить отчёт.

Формат отчёта:
- CSV — если в списке одна кампания.
- ZIP архив — если в списке несколько кампаний. Каждый файл соответствует одной кампании из списка. Имя файла вида `<идентификатор кампании>.csv`.
 */
  campaigns: unknown;
  /** Начальная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.
 */
  dateFrom?: string;
  /** Конечная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.
 */
  dateTo?: string;
  /** Тип группировки по времени:
- `DATE` — группировка по дате (по дням);
- `START_OF_WEEK` — группировка по неделям;
- `START_OF_MONTH` — группировка по месяцам.
 */
  groupBy?: 'NO_GROUP_BY' | 'DATE' | 'START_OF_WEEK' | 'START_OF_MONTH';
}

export interface PostApiClientStatisticsVideo200ResponseSchema {
  /** Уникальный идентификатор отправленного запроса. 

По нему можно [проверить статус формирования отчёта](#operation/VendorStatisticsCheck) и [скачать отчёт](#operation/DownloadStatistics).
 */
  UUID?: string;
  /** Если запрашивается отчёт с аналитикой внешнего трафика  — `true`. */
  vendor?: boolean;
}

export interface PostApiClientStatisticsVideodefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

/**
 * Структура исходного запроса.
 */
export interface PostApiClientStatisticsAttributionRequestSchema {
  /** Список идентификаторов кампаний, для которых необходимо подготовить отчёт.

Формат отчёта:
- CSV — если в списке одна кампания.
- ZIP архив — если в списке несколько кампаний. Каждый файл соответствует одной кампании из списка. Имя файла вида `<идентификатор кампании>.csv`.
 */
  campaigns: unknown;
  /** Начальная дата периода отчёта в формате RFC 3339.

Максимальный период, за который можно получить отчёт — 62 дня.
 */
  from?: string;
  /** Конечная дата периода отчёта в формате RFC 3339.

Максимальный период, за который можно получить отчёт — 62 дня.
 */
  to?: string;
  /** Начальная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.
 */
  dateFrom?: string;
  /** Конечная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.
 */
  dateTo?: string;
  /** Тип группировки по времени:
- `DATE` — группировка по дате (по дням);
- `START_OF_WEEK` — группировка по неделям;
- `START_OF_MONTH` — группировка по месяцам.
 */
  groupBy?: 'NO_GROUP_BY' | 'DATE' | 'START_OF_WEEK' | 'START_OF_MONTH';
}

export interface PostApiClientStatisticsAttribution200ResponseSchema {
  /** Уникальный идентификатор отправленного запроса. 

По нему можно [проверить статус формирования отчёта](#operation/VendorStatisticsCheck) и [скачать отчёт](#operation/DownloadStatistics).
 */
  UUID?: string;
  /** Если запрашивается отчёт с аналитикой внешнего трафика  — `true`. */
  vendor?: boolean;
}

export interface PostApiClientStatisticsAttributiondefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

/**
 * Структура исходного запроса.
 */
export interface GetApiClientStatistics200ResponseSchemaRequest {
  /** Список идентификаторов кампаний, для которых необходимо подготовить отчёт.

Формат отчёта:
- CSV — если в списке одна кампания.
- ZIP архив — если в списке несколько кампаний. Каждый файл соответствует одной кампании из списка. Имя файла вида `<идентификатор кампании>.csv`.
 */
  campaigns: unknown;
  /** Начальная дата периода отчёта в формате RFC 3339.

Максимальный период, за который можно получить отчёт — 62 дня.
 */
  from?: string;
  /** Конечная дата периода отчёта в формате RFC 3339.

Максимальный период, за который можно получить отчёт — 62 дня.
 */
  to?: string;
  /** Начальная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.
 */
  dateFrom?: string;
  /** Конечная дата периода отчёта в формате ГГГГ-ММ-ДД. Например: `2019-02-10`.
 */
  dateTo?: string;
  /** Тип группировки по времени:
- `DATE` — группировка по дате (по дням);
- `START_OF_WEEK` — группировка по неделям;
- `START_OF_MONTH` — группировка по месяцам.
 */
  groupBy?: 'NO_GROUP_BY' | 'DATE' | 'START_OF_WEEK' | 'START_OF_MONTH';
}

/**
 * Информация о запросе.
 */
export interface GetApiClientStatistics200ResponseSchema {
  /** Уникальный идентификатор запроса, для которого производилась проверка. */
  UUID?: string;
  /** Текущее состояние запроса:
- `NOT_STARTED` — запрос ожидает выполнения;
- `IN_PROGRESS` — запрос выполняется в данный момент;
- `ERROR` — выполнение запроса завершилось ошибкой;
- `OK` — запрос успешно выполнен.
 */
  state?: 'NOT_STARTED' | 'IN_PROGRESS' | 'ERROR' | 'OK';
  /** Дата и время получения запроса сервером, часовой пояс UTC. */
  createdAt?: string;
  /** Дата и время последнего обновления состояния запроса, часовой пояс UTC. */
  updatedAt?: string;
  /** Структура исходного запроса. */
  request?: Record<string, unknown>;
  /** Краткое описание возникшей ошибки.

Поле присутствует, если выполнение запроса завершилось ошибкой.
 */
  error?: string;
  /** Относительная ссылка на отчёт в формате CSV.

Поле присутствует, если запрос выполнен успешно.
 */
  link?: string;
  /** Тип запрашиваемого отчёта:
- `STATS` — отчёт по кампании;
- `SEARCH_PHRASES` — отчёт по поисковым фразам и по категории товаров;
- `ATTRIBUTION` — отчёт по заказам для оплаты за заказ;
- `VIDEO` — отчёт по показам видеобаннера.
 */
  kind?: 'STATS' | 'SEARCH_PHRASES' | 'ATTRIBUTION' | 'VIDEO';
}

export interface GetApiClientStatisticsdefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface GetApiClientStatisticsList200ResponseSchema {
  /** Список отчётов. */
  items?: unknown;
  /** Количество отчётов. */
  total?: string;
}

export interface GetApiClientStatisticsListdefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface GetApiClientStatisticsExternallist200ResponseSchema {
  /** Список отчётов. */
  items?: unknown;
  /** Количество отчётов. */
  total?: string;
}

export interface GetApiClientStatisticsExternallistdefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

/**
 * Строки отчёта.
 */
export type GetApiClientStatisticsReport200ResponseSchema = Record<string, unknown>;

export interface GetApiClientStatisticsReport404ResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface GetApiClientStatisticsReportdefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface GetApiClientStatisticsCampaignMedia200ResponseSchema {
  /** Формат отчёта. */
  contentType?: string;
}

export interface GetApiClientStatisticsCampaignMediadefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface GetApiClientStatisticsCampaignProduct200ResponseSchema {
  /** Формат отчёта. */
  contentType?: string;
}

export interface GetApiClientStatisticsCampaignProductdefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface GetApiClientStatisticsExpense200ResponseSchema {
  /** Формат отчёта. */
  contentType?: string;
}

export interface GetApiClientStatisticsExpensedefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface GetApiClientStatisticsDaily200ResponseSchema {
  /** Формат отчёта. */
  contentType?: string;
}

export interface GetApiClientStatisticsDailydefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface PostApiClientStatisticOrdersGenerateRequestSchema {
  /** Начальная дата периода отчёта в формате RFC 3339. */
  from?: string;
  /** Конечная дата периода отчёта в формате RFC 3339. */
  to?: string;
}

export interface PostApiClientStatisticOrdersGenerate200ResponseSchema {
  /** Уникальный идентификатор отправленного запроса. 

По нему можно [проверить статус формирования отчёта](#operation/VendorStatisticsCheck) и [скачать отчёт](#operation/DownloadStatistics).
 */
  UUID?: string;
  /** Если запрашивается отчёт с аналитикой внешнего трафика  — `true`. */
  vendor?: boolean;
}

export interface PostApiClientStatisticOrdersGeneratedefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface PostApiClientStatisticProductsGenerateRequestSchema {
  /** Начальная дата периода отчёта в формате RFC 3339. */
  from?: string;
  /** Конечная дата периода отчёта в формате RFC 3339. */
  to?: string;
}

export interface PostApiClientStatisticProductsGenerate200ResponseSchema {
  /** Уникальный идентификатор отправленного запроса. 

По нему можно [проверить статус формирования отчёта](#operation/VendorStatisticsCheck) и [скачать отчёт](#operation/DownloadStatistics).
 */
  UUID?: string;
  /** Если запрашивается отчёт с аналитикой внешнего трафика  — `true`. */
  vendor?: boolean;
}

export interface PostApiClientStatisticProductsGeneratedefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface PostApiClientCampaignCpcV2ProductRequestSchema {
  /** Название рекламной кампании. */
  title?: string;
  /** Дата начала рекламной кампании по московскому времени.

Если параметр не заполнен, датой старта считается начало текущего дня. 
Открутка начинается сразу после активации кампании, если не нужна модерация.
 */
  fromDate?: string;
  /** Дата окончания рекламной кампании по московскому времени. 
Параметр не учитывается для кампаний с оплатой за клики, созданных в автоматическом режиме.
 */
  toDate?: string;
  /** Ограничение дневного бюджета рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до
копеек. Например, значение `1 000 000` в параметре равно 1 рублю.

Если параметр не заполнен, дневной бюджет не ограничен. После создания рекламной кампании изменить бюджет с дневного на недельный и наоборот не получится.
 */
  dailyBudget?: string;
  /** Ограничение недельного бюджета рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до
копеек. Например, значение `1 000 000` в параметре равно 1 рублю.

Если параметр не заполнен, недельный бюджет не ограничен. После создания рекламной кампании изменить бюджет с недельного на дневной и наоборот не получится.
 */
  weeklyBudget?: string;
  /** Место размещения продвигаемых товаров:
- `PLACEMENT_TOP_PROMOTION` — поиск.
- `PLACEMENT_INVALID` — не определено.
- `PLACEMENT_SEARCH_AND_CATEGORY` — поиск и рекомендации.
- `PLACEMENT_OVERTOP` — поиск и главная (Спецразмещение).
 */
  placement: 'PLACEMENT_TOP_PROMOTION' | 'PLACEMENT_INVALID' | 'PLACEMENT_SEARCH_AND_CATEGORY' | 'PLACEMENT_OVERTOP';
  /** Автостратегия, которая будет использоваться для кампании:
- `MAX_CLICKS` — максимум кликов для Поиска и рекомендаций;
- `TOP_MAX_CLICKS` — максимум кликов для Поиска;
- `TARGET_BIDS` — средняя стоимость клика для Поиска и рекомендаций;
- `TAKEOVER` — спецразмещение для Поиска;
- `NO_AUTO_STRATEGY` — не использовать автостратегию.
 */
  productAutopilotStrategy?: 'MAX_CLICKS' | 'TOP_MAX_CLICKS' | 'TARGET_BIDS' | 'TAKEOVER' | 'NO_AUTO_STRATEGY';
  /** Процент автоподнятия бюджета, от `10` до `50`. <br>
`0`, если автоподнятие отключено.
 */
  autoIncreasePercent?: number;
  /** Тип спецразмещения:
  - `PRODUCT_PLACEMENT_TYPE_MAIN` — спецразмещение на главной;
  - `PRODUCT_PLACEMENT_TYPE_SEARCH` — спецразмещение в поиске;
  - `PRODUCT_PLACEMENT_TYPE_MAIN` и `PRODUCT_PLACEMENT_TYPE_SEARCH` — спецразмещение в поиске и на главной.
 */
  ProductAdvPlacements?: unknown;
}

export interface PostApiClientCampaignCpcV2Product200ResponseSchema {
  /** Идентификатор кампании. */
  campaignId?: string;
}

export interface PostApiClientCampaignCpcV2ProductdefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

/**
 * Параметры для расчёта при создании кампании.
 */
export interface PostExternalApiDynamicbudgetRequestSchemaCreatecampaign {
  /** Автостратегия, которая будет использоваться для кампании:
- `MAX_CLICKS` — максимум кликов для Поиска и рекомендаций;
- `TOP_MAX_CLICKS` — максимум кликов для Поиска;
- `TARGET_BIDS` — средняя стоимость клика для Поиска;
- `NO_AUTO_STRATEGY` — не использовать автостратегию.
 */
  autopilotStrategy?: 'MAX_CLICKS' | 'TOP_MAX_CLICKS' | 'TARGET_BIDS' | 'NO_AUTO_STRATEGY';
  /** Место размещения рекламы:
  - `CAMPAIGN_PLACEMENT_INVALID` — не определено;
  - `CAMPAIGN_PLACEMENT_PDP` — карточка товара;
  - `CAMPAIGN_PLACEMENT_SEARCH_AND_CATEGORY` — поиск и рекомендации;
  - `CAMPAIGN_PLACEMENT_TOP_PROMOTION` — поиск;
  - ~~`CAMPAIGN_PLACEMENT_TAKEOVER`~~ — одновременный показ товаров на первых 4 плитках. Значение устарело.
 */
  placement?: 'CAMPAIGN_PLACEMENT_INVALID' | 'CAMPAIGN_PLACEMENT_PDP' | 'CAMPAIGN_PLACEMENT_SEARCH_AND_CATEGORY' | 'CAMPAIGN_PLACEMENT_TOP_PROMOTION' | 'CAMPAIGN_PLACEMENT_TAKEOVER';
  /** Количество товаров. */
  skusCount?: string;
}

/**
 * Информация об автостратегии.
 */
export interface PostExternalApiDynamicbudgetRequestSchemaUpdatecampaignAutopilotstrategy {
  /** Автостратегия, которая будет использоваться для кампании:
- `MAX_CLICKS` — максимум кликов для Поиска и рекомендаций;
- `TOP_MAX_CLICKS` — максимум кликов для Поиска;
- `TARGET_BIDS` — средняя стоимость клика для Поиска;
- `NO_AUTO_STRATEGY` — не использовать автостратегию.
 */
  strategy?: 'MAX_CLICKS' | 'TOP_MAX_CLICKS' | 'TARGET_BIDS' | 'NO_AUTO_STRATEGY';
}

/**
 * Параметры для расчёта при обновлении кампании.
 */
export interface PostExternalApiDynamicbudgetRequestSchemaUpdatecampaign {
  /** Товары, которые добавили в кампанию. */
  addingSkus?: unknown;
  /** Информация об автостратегии. */
  autopilotStrategy?: Record<string, unknown>;
  /** Идентификатор кампании. */
  campaignId?: string;
}

export interface PostExternalApiDynamicbudgetRequestSchema {
  /** Параметры для расчёта при создании кампании. */
  createCampaign?: Record<string, unknown>;
  /** Параметры для расчёта при обновлении кампании. */
  updateCampaign?: Record<string, unknown>;
}

export interface PostExternalApiDynamicbudget200ResponseSchema {
  /** Бюджет рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до копеек. Например, значение `1 000 000` в параметре равно 1 рублю. */
  campaignBudget?: string;
  /** Минимальный бюджет. */
  dynamicBudget?: string;
  /** Тип минимального бюджета:
- `DYNAMIC_BUDGET_REQUIRED` — обязательный;
- `DYNAMIC_BUDGET_RECOMMENDED` — рекомендованный.
 */
  dynamicBudgetType?: 'DYNAMIC_BUDGET_REQUIRED' | 'DYNAMIC_BUDGET_RECOMMENDED';
  /** Сумма в рублях, на которую увеличивается минимальный бюджет за каждый добавленный в кампанию товар. */
  skuPrice?: string;
}

export interface PostExternalApiDynamicbudgetdefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export type PostApiClientCampaignActivateRequestSchema = Record<string, unknown>;

/**
 * Информация о кампании. Возвращается, если в параметре `productAutopilotStrategy` включена автостратегия.
 */
export interface PostApiClientCampaignActivate200ResponseSchemaAutopilot {
  /** Идентификатор категории. */
  categoryId?: string;
  /** Разрешение на автоматическое добавление товаров категории, указанной в `categoryId`, в кампании с автостратегией `MAX_VIEWS`:

- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN` — стратегия добавления товаров в кампанию не установлена;
- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_MANUAL` — добавлять товары в кампанию можно только вручную;
- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_AUTO` — можно добавлять товары категории `categoryId` в кампанию автоматически.

Если тип разрешения пустой или было передано `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN`, добавлять товары в кампанию можно только вручную.

Для кампаний без автостратегии `MAX_VIEWS` возвращается значение `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN`.
 */
  skuAddMode?: 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN' | 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_MANUAL' | 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_AUTO';
}

/**
 * Информация об автоподнятии бюджета.
 */
export interface PostApiClientCampaignActivate200ResponseSchemaAutoincrease {
  /** Процент автоподнятия бюджета, от `10` до `50`. <br>
`0`, если автоподнятие отключено.
 */
  autoIncreasePercent?: number;
  /** Бюджет после автоподнятия. */
  autoIncreasedBudget?: string;
  /** `true`, если бюджет поднялся автоматически.
 */
  isAutoIncreased?: boolean;
  /** Рекомендуемый процент автоподнятия. */
  recommendedAutoIncreasePercent?: number;
}

export interface PostApiClientCampaignActivate200ResponseSchema {
  /** Идентификатор кампании. */
  id?: string;
  /** Тип оплаты:
- `CPC` — за клики.
 */
  paymentType?: string;
  /** Название кампании. */
  title?: string;
  /** Состояние кампании:
- `CAMPAIGN_STATE_RUNNING` — активная кампания;
- `CAMPAIGN_STATE_PLANNED` — кампания, сроки проведения которой ещё не наступили;
- `CAMPAIGN_STATE_STOPPED` — кампания, приостановленная из-за нехватки бюджета;
- `CAMPAIGN_STATE_INACTIVE` — кампания, остановленная владельцем;
- `CAMPAIGN_STATE_ARCHIVED` — архивная кампания;
- `CAMPAIGN_STATE_MODERATION_DRAFT` — отредактированная кампания до отправки на модерацию;
- `CAMPAIGN_STATE_MODERATION_IN_PROGRESS` — кампания, отправленная на модерацию;
- `CAMPAIGN_STATE_MODERATION_FAILED` — кампания, непрошедшая модерацию;
- `CAMPAIGN_STATE_FINISHED` — кампания завершена, дата окончания в прошлом, такую кампанию нельзя изменить, можно
только клонировать или создать новую.
 */
  state?: string;
  /** Тип рекламируемой кампании:
  - `SKU` — Оплата за клик и Спецразмещение.
 */
  advObjectType?: string;
  /** Дата старта рекламной кампании. */
  fromDate?: string;
  /** Дата завершения рекламной кампании. */
  toDate?: string;
  /** Бюджет рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до копеек. Например, значение `1 000 000` в параметре равно 1 рублю. */
  budget?: string;
  /** Дневной бюджет рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до копеек. Например, значение `1 000 000` в параметре равно 1 рублю. */
  dailyBudget?: string;
  /** Недельный бюджет рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до копеек. Например, значение `1 000 000` в параметре равно 1 рублю. */
  weeklyBudget?: string;
  /** Место размещения продвигаемых товаров:
- `PLACEMENT_INVALID` — не определено.
- `PLACEMENT_PDP` — карточка товара. Доступно только для кампаний с ручным управлением.
- `PLACEMENT_SEARCH_AND_CATEGORY` — поиск и рекомендации.
- `PLACEMENT_TOP_PROMOTION` — поиск.
- `PLACEMENT_OVERTOP` — поиск и главная (Спецразмещение).
 */
  placement?: 'PLACEMENT_INVALID' | 'PLACEMENT_PDP' | 'PLACEMENT_SEARCH_AND_CATEGORY' | 'PLACEMENT_TOP_PROMOTION' | 'PLACEMENT_OVERTOP';
  /** Автостратегия, которая используется для кампании:
  - `MAX_VIEWS` — максимальное количество показов;
  - `MAX_CLICKS` — максимальное количество кликов для Поиска и рекомендаций;
  - `TOP_MAX_CLICKS` — максимальное количество кликов для Поиска;
  - `TAKEOVER` — спецразмещение для Поиска;
  - `NO_AUTO_STRATEGY` — автостратегия не используется.
 */
  productAutopilotStrategy?: 'MAX_VIEWS' | 'MAX_CLICKS' | 'TOP_MAX_CLICKS' | 'TAKEOVER' | 'NO_AUTO_STRATEGY';
  /** Информация о кампании. Возвращается, если в параметре `productAutopilotStrategy` включена автостратегия. */
  autopilot?: Record<string, unknown>;
  /** Дата создания кампании в формате RFC3339. */
  createdAt?: string;
  /** Дата обновления кампании в формате RFC3339. */
  updatedAt?: string;
  /** Режим создания и управления товарной рекламной кампанией:
- `PRODUCT_CAMPAIGN_MODE_AUTO` — автоматически;
- `PRODUCT_CAMPAIGN_MODE_MANUAL` — вручную.
 */
  productCampaignMode?: 'PRODUCT_CAMPAIGN_MODE_AUTO' | 'PRODUCT_CAMPAIGN_MODE_MANUAL';
  /** Информация об автоподнятии бюджета. */
  autoIncrease?: Record<string, unknown>;
  /** Тип спецразмещения:
  - `PRODUCT_PLACEMENT_TYPE_MAIN` — спецразмещение на главной;
  - `PRODUCT_PLACEMENT_TYPE_SEARCH` — спецразмещение в поиске;
  - `PRODUCT_PLACEMENT_TYPE_MAIN` и `PRODUCT_PLACEMENT_TYPE_SEARCH` — спецразмещение в поиске и на главной.
 */
  ProductAdvPlacements?: unknown;
}

export interface PostApiClientCampaignActivatedefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export type PostApiClientCampaignDeactivateRequestSchema = Record<string, unknown>;

/**
 * Информация о кампании. Возвращается, если в параметре `productAutopilotStrategy` включена автостратегия.
 */
export interface PostApiClientCampaignDeactivate200ResponseSchemaAutopilot {
  /** Идентификатор категории. */
  categoryId?: string;
  /** Разрешение на автоматическое добавление товаров категории, указанной в `categoryId`, в кампании с автостратегией `MAX_VIEWS`:

- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN` — стратегия добавления товаров в кампанию не установлена;
- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_MANUAL` — добавлять товары в кампанию можно только вручную;
- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_AUTO` — можно добавлять товары категории `categoryId` в кампанию автоматически.

Если тип разрешения пустой или было передано `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN`, добавлять товары в кампанию можно только вручную.

Для кампаний без автостратегии `MAX_VIEWS` возвращается значение `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN`.
 */
  skuAddMode?: 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN' | 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_MANUAL' | 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_AUTO';
}

/**
 * Информация об автоподнятии бюджета.
 */
export interface PostApiClientCampaignDeactivate200ResponseSchemaAutoincrease {
  /** Процент автоподнятия бюджета, от `10` до `50`. <br>
`0`, если автоподнятие отключено.
 */
  autoIncreasePercent?: number;
  /** Бюджет после автоподнятия. */
  autoIncreasedBudget?: string;
  /** `true`, если бюджет поднялся автоматически.
 */
  isAutoIncreased?: boolean;
  /** Рекомендуемый процент автоподнятия. */
  recommendedAutoIncreasePercent?: number;
}

export interface PostApiClientCampaignDeactivate200ResponseSchema {
  /** Идентификатор кампании. */
  id?: string;
  /** Тип оплаты:
- `CPC` — за клики.
 */
  paymentType?: string;
  /** Название кампании. */
  title?: string;
  /** Состояние кампании:
- `CAMPAIGN_STATE_RUNNING` — активная кампания;
- `CAMPAIGN_STATE_PLANNED` — кампания, сроки проведения которой ещё не наступили;
- `CAMPAIGN_STATE_STOPPED` — кампания, приостановленная из-за нехватки бюджета;
- `CAMPAIGN_STATE_INACTIVE` — кампания, остановленная владельцем;
- `CAMPAIGN_STATE_ARCHIVED` — архивная кампания;
- `CAMPAIGN_STATE_MODERATION_DRAFT` — отредактированная кампания до отправки на модерацию;
- `CAMPAIGN_STATE_MODERATION_IN_PROGRESS` — кампания, отправленная на модерацию;
- `CAMPAIGN_STATE_MODERATION_FAILED` — кампания, непрошедшая модерацию;
- `CAMPAIGN_STATE_FINISHED` — кампания завершена, дата окончания в прошлом, такую кампанию нельзя изменить, можно
только клонировать или создать новую.
 */
  state?: string;
  /** Тип рекламируемой кампании:
  - `SKU` — Оплата за клик и Спецразмещение.
 */
  advObjectType?: string;
  /** Дата старта рекламной кампании. */
  fromDate?: string;
  /** Дата завершения рекламной кампании. */
  toDate?: string;
  /** Бюджет рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до копеек. Например, значение `1 000 000` в параметре равно 1 рублю. */
  budget?: string;
  /** Дневной бюджет рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до копеек. Например, значение `1 000 000` в параметре равно 1 рублю. */
  dailyBudget?: string;
  /** Недельный бюджет рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до копеек. Например, значение `1 000 000` в параметре равно 1 рублю. */
  weeklyBudget?: string;
  /** Место размещения продвигаемых товаров:
- `PLACEMENT_INVALID` — не определено.
- `PLACEMENT_PDP` — карточка товара. Доступно только для кампаний с ручным управлением.
- `PLACEMENT_SEARCH_AND_CATEGORY` — поиск и рекомендации.
- `PLACEMENT_TOP_PROMOTION` — поиск.
- `PLACEMENT_OVERTOP` — поиск и главная (Спецразмещение).
 */
  placement?: 'PLACEMENT_INVALID' | 'PLACEMENT_PDP' | 'PLACEMENT_SEARCH_AND_CATEGORY' | 'PLACEMENT_TOP_PROMOTION' | 'PLACEMENT_OVERTOP';
  /** Автостратегия, которая используется для кампании:
  - `MAX_VIEWS` — максимальное количество показов;
  - `MAX_CLICKS` — максимальное количество кликов для Поиска и рекомендаций;
  - `TOP_MAX_CLICKS` — максимальное количество кликов для Поиска;
  - `TAKEOVER` — спецразмещение для Поиска;
  - `NO_AUTO_STRATEGY` — автостратегия не используется.
 */
  productAutopilotStrategy?: 'MAX_VIEWS' | 'MAX_CLICKS' | 'TOP_MAX_CLICKS' | 'TAKEOVER' | 'NO_AUTO_STRATEGY';
  /** Информация о кампании. Возвращается, если в параметре `productAutopilotStrategy` включена автостратегия. */
  autopilot?: Record<string, unknown>;
  /** Дата создания кампании в формате RFC3339. */
  createdAt?: string;
  /** Дата обновления кампании в формате RFC3339. */
  updatedAt?: string;
  /** Режим создания и управления товарной рекламной кампанией:
- `PRODUCT_CAMPAIGN_MODE_AUTO` — автоматически;
- `PRODUCT_CAMPAIGN_MODE_MANUAL` — вручную.
 */
  productCampaignMode?: 'PRODUCT_CAMPAIGN_MODE_AUTO' | 'PRODUCT_CAMPAIGN_MODE_MANUAL';
  /** Информация об автоподнятии бюджета. */
  autoIncrease?: Record<string, unknown>;
  /** Тип спецразмещения:
  - `PRODUCT_PLACEMENT_TYPE_MAIN` — спецразмещение на главной;
  - `PRODUCT_PLACEMENT_TYPE_SEARCH` — спецразмещение в поиске;
  - `PRODUCT_PLACEMENT_TYPE_MAIN` и `PRODUCT_PLACEMENT_TYPE_SEARCH` — спецразмещение в поиске и на главной.
 */
  ProductAdvPlacements?: unknown;
}

export interface PostApiClientCampaignDeactivatedefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

/**
 * Информация о кампании. Обязательный параметр, если в параметре `productAutopilotStrategy` включена автостратегия.
 */
export interface PatchApiClientCampaignRequestSchemaAutopilot {
  /** Идентификатор категории. */
  categoryId?: string;
  /** Разрешение на автоматическое добавление товаров из категории, которая указана в `categoryId`, в кампании с автостратегией `MAX_VIEWS`:

- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN` — стратегия добавления товаров в кампанию не установлена;
- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_MANUAL` — добавлять товары в кампанию можно только вручную;
- `PRODUCT_CAMPAIGN_SKU_ADD_MODE_AUTO` — можно добавлять товары категории `categoryId` в кампанию автоматически.

Если тип разрешения пустой или было передано `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN`, добавлять товары в кампанию можно только вручную.

Для кампаний без автостратегии `MAX_VIEWS` возвращается значение `PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN`.
 */
  skuAddMode?: 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_UNKNOWN' | 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_MANUAL' | 'PRODUCT_CAMPAIGN_SKU_ADD_MODE_AUTO';
}

export interface PatchApiClientCampaignRequestSchema {
  /** Информация о кампании. Обязательный параметр, если в параметре `productAutopilotStrategy` включена автостратегия. */
  autopilot?: Record<string, unknown>;
  /** Дата начала рекламной кампании по московскому времени.

Не может быть раньше текущей даты.
 */
  fromDate?: string;
  /** Дата окончания рекламной кампании по московскому времени.

Не может быть раньше даты начала.
 */
  toDate?: string;
  /** Ограничение общего бюджета рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до копеек. Например, значение `1 000 000` в параметре равно 1 рублю.

Учитывается только для автоматических кампаний брендов и агентств. 
В других организациях установить новое ограничение общего бюджета не получится. Если у кампании уже установлен бюджет, можно:
- Убрать ограничения: передайте `0` в этом параметре.
- Не менять бюджет кампании. Когда он будет исчерпан, уберите ограничения бюджета или создайте новую кампанию с неограниченным бюджетом.
 */
  budget?: string;
  /** Ограничение дневного бюджета рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до копеек. Например, значение `1 000 000` в параметре равно 1 рублю.

Если параметр не заполнен, дневной бюджет не ограничен. После создания рекламной кампании изменить бюджет с дневного на недельный и наоборот не получится.
 */
  dailyBudget?: string;
  /** Ограничение недельного бюджета рекламной кампании. Единица измерения — одна миллионная доля рубля, округляется до
копеек. Например, значение `1 000 000` в параметре равно 1 рублю.

Если параметр не заполнен, недельный бюджет не ограничен. После создания рекламной кампании изменить бюджет с недельного на дневной и наоборот не получится.
 */
  weeklyBudget?: string;
  /** Процент автоподнятия бюджета, от `10` до `50`. <br>
`0`, если автоподнятие отключено.
 */
  autoIncreasePercent?: number;
  /** Тип спецразмещения:
  - `PRODUCT_PLACEMENT_TYPE_MAIN` — спецразмещение на главной;
  - `PRODUCT_PLACEMENT_TYPE_SEARCH` — спецразмещение в поиске;
  - `PRODUCT_PLACEMENT_TYPE_MAIN` и `PRODUCT_PLACEMENT_TYPE_SEARCH` — спецразмещение в поиске и на главной.
 */
  ProductAdvPlacements?: unknown;
}

export interface PatchApiClientCampaign200ResponseSchema {
  /** Идентификатор кампании. */
  campaignId?: string;
}

export interface PatchApiClientCampaigndefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface PostApiClientCampaignProductsRequestSchema {
  /** Ставки за клики. */
  bids?: unknown;
}

export type PostApiClientCampaignProducts200ResponseSchema = Record<string, unknown>;

export interface PostApiClientCampaignProductsdefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface PutApiClientCampaignProductsRequestSchema {
  /** Ставки за клики. */
  bids?: unknown;
}

export type PutApiClientCampaignProducts200ResponseSchema = Record<string, unknown>;

export interface PutApiClientCampaignProductsdefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface GetApiClientCampaignV2Products200ResponseSchema {
  /** Список товаров кампании. */
  products?: unknown;
}

export interface GetApiClientCampaignV2ProductsdefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface PostApiClientCampaignProductsDeleteRequestSchema {
  /** SKU продвигаемого товара. */
  sku?: unknown;
}

export type PostApiClientCampaignProductsDelete200ResponseSchema = Record<string, unknown>;

export interface PostApiClientCampaignProductsDeletedefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface GetApiClientCampaignProductsBidsCompetitive200ResponseSchema {
  /** Список ставок. */
  bids?: unknown;
  /** Идентификатор кампании. */
  campaignId?: string;
}

export interface GetApiClientCampaignProductsBidsCompetitivedefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface PostApiClientCampaignSearchpromoV2ProductsRequestSchema {
  /** Номер страницы. Пагинация начинается с единицы. */
  page?: number;
  /** Размер страницы. */
  pageSize?: number;
}

export interface PostApiClientCampaignSearchpromoV2Products200ResponseSchema {
  /** Список товаров. */
  products?: unknown;
  /** Количество товаров. */
  total?: string;
}

export interface PostApiClientCampaignSearchpromoV2ProductsdefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface PostApiClientSearchpromoBidsRecommendationRequestSchema {
  /** Список идентификаторов товаров. */
  skus?: unknown;
}

export interface PostApiClientSearchpromoBidsRecommendation200ResponseSchema {
  /** Список рекомендованных ставок. */
  recommendedBids?: Record<string, unknown>;
}

export interface PostApiClientSearchpromoBidsRecommendationdefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface PostApiClientCampaignSearchpromoV2BidsSetRequestSchema {
  /** Значения ставок. */
  bids?: unknown;
}

export interface PostApiClientCampaignSearchpromoV2BidsSet200ResponseSchema {
  /** Ответ метода. */
  response?: unknown;
}

export interface PostApiClientCampaignSearchpromoV2BidsSetdefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface PostApiClientSearchpromoGetcpominbidsRequestSchema {
  /** Список идентификаторов товаров. */
  skus?: unknown;
}

export interface PostApiClientSearchpromoGetcpominbids200ResponseSchema {
  /** Информация о ставках. */
  bids?: unknown;
}

export interface PostApiClientSearchpromoGetcpominbidsdefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface PostApiClientSearchpromoProductEnableRequestSchema {
  /** Список идентификаторов товаров. */
  skus?: unknown;
}

export interface PostApiClientSearchpromoProductEnable200ResponseSchema {
  /** Ответ метода. */
  response?: unknown;
}

export interface PostApiClientSearchpromoProductEnabledefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface PostApiClientSearchpromoProductDisableRequestSchema {
  /** Список идентификаторов товаров. */
  skus?: unknown;
}

export type PostApiClientSearchpromoProductDisable200ResponseSchema = Record<string, unknown>;

export interface PostApiClientSearchpromoProductDisabledefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface PostApiClientCampaignSearchpromoV2BidsDeleteRequestSchema {
  /** Список идентификаторов товаров. */
  sku?: unknown;
}

export type PostApiClientCampaignSearchpromoV2BidsDelete200ResponseSchema = Record<string, unknown>;

export interface PostApiClientCampaignSearchpromoV2BidsDeletedefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface PostApiClientCampaignSearchpromoCarrotsEnableRequestSchema {
  /** Список идентификаторов товаров. */
  skus: unknown;
}

export interface PostApiClientCampaignSearchpromoCarrotsEnable200ResponseSchema {
  /** Информация о включении продвижения по SKU товара. */
  skuToInfo?: Record<string, unknown>;
}

export interface PostApiClientCampaignSearchpromoCarrotsEnabledefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface PostApiClientCampaignSearchpromoCarrotsDisableRequestSchema {
  /** Список идентификаторов товаров. */
  skus: unknown;
}

export interface PostApiClientCampaignSearchpromoCarrotsDisable200ResponseSchema {
  /** Информация об отключении продвижения по SKU товара. */
  skuToInfo?: Record<string, unknown>;
}

export interface PostApiClientCampaignSearchpromoCarrotsDisabledefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

/**
 * Метод, с помощью которого запросили формирование отчёта.
 */
export interface PostApiClientVendorsStatisticsRequestSchema {
  /** Начало отчётного периода.

Дата должна быть не ранее 1 января 2022 года.
 */
  dateFrom?: string;
  /** Конец отчётного периода.

Дата должна быть позднее `dateFrom` не больше чем на 3 месяца. Если дата позднее трёх месяцев, 
отчёт сформируется за 3 месяца с даты, указанной в `dateFrom`.
 */
  dateTo?: string;
  /** Тип отчёта:
- `TRAFFIC_SOURCES` — отчёт по источникам трафика.
- `ORDERS` — отчёт по заказам.
 */
  type?: 'TRAFFIC_SOURCES' | 'ORDERS';
}

export interface PostApiClientVendorsStatistics200ResponseSchema {
  /** Уникальный идентификатор отправленного запроса. 

По нему можно [проверить статус формирования отчёта](#operation/VendorStatisticsCheck) и [скачать отчёт](#operation/DownloadStatistics).
 */
  UUID?: string;
  /** Если запрашивается отчёт с аналитикой внешнего трафика  — `true`. */
  vendor?: boolean;
}

export interface PostApiClientVendorsStatisticsdefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface GetApiClientVendorsStatisticsList200ResponseSchema {
  /** Информация об отчётах. */
  items?: unknown;
  /** Количество отчётов. */
  total?: string;
}

export interface GetApiClientVendorsStatisticsListdefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

/**
 * Метод, с помощью которого запросили формирование отчёта.
 */
export interface GetApiClientVendorsStatistics200ResponseSchemaRequest {
  /** Начало отчётного периода.

Дата должна быть не ранее 1 января 2022 года.
 */
  dateFrom?: string;
  /** Конец отчётного периода.

Дата должна быть позднее `dateFrom` не больше чем на 3 месяца. Если дата позднее трёх месяцев, 
отчёт сформируется за 3 месяца с даты, указанной в `dateFrom`.
 */
  dateTo?: string;
  /** Тип отчёта:
- `TRAFFIC_SOURCES` — отчёт по источникам трафика.
- `ORDERS` — отчёт по заказам.
 */
  type?: 'TRAFFIC_SOURCES' | 'ORDERS';
}

/**
 * Информация об отчёте.
 */
export interface GetApiClientVendorsStatistics200ResponseSchema {
  /** Уникальный идентификатор отправленного запроса, с помощью которого в дальнейшем можно проверить статус выполнения запроса и скачать отчёт. */
  UUID?: string;
  /** Дата формирования отчёта. */
  createdAt?: string;
  /** Описание ошибки. */
  error?: string;
  /** Ссылка на отчёт. */
  link?: string;
  /** Метод, с помощью которого запросили формирование отчёта. */
  request?: Record<string, unknown>;
  /** Статус формирования отчёта:
- `NOT_STARTED` — ещё не началось. 
- `IN_PROGRESS` — в процессе. 
- `CANCEL` — отменено.
- `OK` — отчёт сформирован.
- `ERROR` — произошла ошибка.
- `TIMEOUT` — время ожидания истекло.
 */
  state?: 'NOT_STARTED' | 'IN_PROGRESS' | 'OK' | 'ERROR' | 'TIMEOUT' | 'CANCEL';
  /** Время изменения статуса. */
  updatedAt?: string;
}

export interface GetApiClientVendorsStatisticsdefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}

export interface GetApiClientOrganisationVendortag200ResponseSchema {
  /** Префикс организации для UTM-метки. */
  tag?: string;
}

export interface GetApiClientOrganisationVendortagdefaultResponseSchema {
  /** Описание ошибки. */
  error?: string;
}
