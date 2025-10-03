# Project Brief: OpenAPI-to-MCP Generator

## Executive Summary

**OpenAPI-to-MCP Generator** — это инструмент командной строки для автоматической генерации MCP (Model Context Protocol) серверов из OpenAPI/Swagger документов. Продукт решает проблему отсутствия простого способа интеграции существующих REST API в AI-чаты (Claude, OpenAI ChatGPT) через стандартизированный MCP протокол.

Целевая аудитория — пользователи AI-чатов и разработчики, которые хотят расширить возможности своих AI-ассистентов, подключив внешние API сервисы без необходимости вручную писать MCP серверы. Продукт генерирует готовый TypeScript/JavaScript MCP сервер с простой one-command установкой, который AI-агенты могут использовать для взаимодействия с любым API, описанным в OpenAPI спецификации.

**Ключевые преимущества:**
- **Универсальность:** Поддержка OpenAPI 3.0 с расширяемой архитектурой для будущих стандартов
- **AI-оптимизация:** Автоматическое форматирование ответов API в структуру, оптимальную для понимания AI-моделями
- **Умная фильтрация:** Семантическая организация и категоризация методов для предотвращения переполнения контекстного окна AI
- **Гибкость:** Поддержка различных методов авторизации (API keys, OAuth2, Bearer tokens) с возможностью расширения
- **Простота использования:** Минимальная настройка для быстрого старта с возможностью кастомизации для продвинутых сценариев

---

## Problem Statement

**Текущее состояние и болевые точки:**

AI-ассистенты (Claude, ChatGPT) имеют ограниченные возможности взаимодействия с внешними системами. Хотя MCP (Model Context Protocol) предоставляет стандартизированный способ расширения функциональности AI через серверы, создание MCP сервера для каждого API требует:

1. **Глубоких технических знаний:** Понимание спецификации MCP, написание кода на TypeScript/JavaScript, обработка различных схем авторизации
2. **Значительных временных затрат:** Ручное преобразование каждого API endpoint'а из OpenAPI спецификации в MCP-совместимый формат (десятки часов для API со 100+ методами)
3. **Дублирования усилий:** Каждая компания/разработчик создает свои реализации для одних и тех же публичных API
4. **Проблем с масштабируемостью:** API с сотнями методов создают перегрузку контекста AI, делая инструменты практически неиспользуемыми

**Количественная оценка проблемы:**
- Создание MCP сервера вручную для среднего API (50-100 методов): **20-40 часов работы**
- Типичный OpenAPI документ содержит: **50-300 методов**
- Контекстное окно Claude: **200K токенов** — может быть исчерпано описанием 50-100 методов без умной фильтрации

**Почему существующие решения не справляются:**
- **Ручное написание MCP серверов:** Не масштабируется, требует экспертизы, дорого по времени
- **Универсальные HTTP клиенты для AI:** Не оптимизированы для AI (сырые JSON ответы), отсутствует семантическая навигация по методам
- **API-специфичные интеграции:** Существуют только для популярных сервисов, не решают проблему "длинного хвоста" API

**Срочность и важность:**
- MCP протокол активно развивается (2024-2025) — растущая экосистема
- Anthropic и OpenAI инвестируют в tool-use capabilities
- Компании начинают интегрировать AI-ассистентов во внутренние процессы — нужен простой способ подключения внутренних API
- First-mover advantage: пока нет устоявшихся решений

---

## Proposed Solution

**Концепция и подход:**

OpenAPI-to-MCP Generator — это автоматизированный инструмент кодогенерации, который трансформирует любой OpenAPI 3.0 документ в полнофункциональный MCP сервер за минуты вместо часов ручной работы.

**Как это работает:**

```bash
# Простая одна команда
npx openapi-to-mcp generate ./swagger.json --output ./my-mcp-server
```

Генератор анализирует структуру OpenAPI документа и автоматически создает:
- **MCP-совместимые tool definitions** для каждого API endpoint'а
- **Типобезопасные TypeScript интерфейсы** из OpenAPI schemas
- **Обработчики авторизации** на основе securitySchemes из спецификации
- **AI-оптимизированные response formatters** для преобразования сырых API ответов в структурированный формат
- **Умную систему фильтрации методов** с семантической категоризацией и поиском

**Ключевые дифференциаторы от существующих решений:**

1. **Универсальность через парсинг OpenAPI структуры:**
   - Не хардкодим специфичные API — читаем и интерпретируем стандарт OpenAPI
   - Автоматическая обработка `paths`, `components/schemas`, `securitySchemes`, `parameters`
   - Поддержка сложных типов: `oneOf`, `allOf`, `$ref` resolving

2. **AI-First архитектура:**
   - **Semantic method organization:** Группировка методов по tags, автоматическое создание категорий
   - **Smart tool descriptions:** Генерация понятных AI описаний из OpenAPI `summary` и `description`
   - **Context-aware filtering:** Механизм для AI выбора релевантных методов без перегрузки контекста
   - **Response summarization:** Опциональное сжатие больших JSON ответов для AI

3. **Гибкость авторизации:**
   - Автоматическая генерация кода для: API Keys (header/query), Bearer tokens, Basic auth, OAuth2 flows
   - Конфигурируемое хранение credentials (environment variables, config file, runtime input)
   - Поддержка кастомных security schemes через расширяемые шаблоны

**Методология разработки:**

Проект реализуется через **итеративный практико-ориентированный подход**:

1. **Изучение OpenAPI 3.0 стандарта** → Анализ на реальном примере (Ozon Performance API swagger) → Поэтапная реализация
2. Каждая фича проверяется на тестовом swagger-документе перед обобщением
3. Инкрементальная разработка: начинаем с базовой генерации, постепенно добавляем AI-оптимизации и поддержку сложных случаев

Этот подход гарантирует, что генератор работает на реальных, сложных API (300+ методов, разные типы авторизации), а не только на синтетических примерах.

**Почему это решение победит там, где другие не справились:**
- **Время до результата:** Минуты вместо дней — мгновенная ценность
- **Масштабируемость:** Работает одинаково хорошо для API с 10 методами и с 500
- **Стандартизация:** Один подход для всех API — не нужно изучать каждую кастомную интеграцию
- **Реальная валидация:** Тестирование на production-grade API обеспечивает надежность

**High-level vision:**

Сделать интеграцию любого API в AI-чат такой же простой, как установка npm пакета. Пользователь дает swagger-файл — получает готовый MCP сервер, который AI может использовать немедленно. Создать де-факто стандарт для API→AI интеграций через автоматическую кодогенерацию.

---

## Target Users

### Primary User Segment: AI Power Users & Developer Enthusiasts

**Демографический/психографический профиль:**
- Технически грамотные пользователи AI-чатов (Claude, ChatGPT)
- Имеют базовые навыки работы с командной строкой и npm
- Возраст: 25-45 лет
- Роли: разработчики, продакт-менеджеры, предприниматели, исследователи
- Характеристики: любопытные, экспериментируют с новыми технологиями, ранние адопторы AI-инструментов

**Текущие поведения и рабочие процессы:**
- Активно используют AI-чаты для решения задач (исследование, анализ данных, программирование)
- Сталкиваются с ограничениями AI: нет доступа к актуальным данным, нельзя интегрировать с внутренними системами
- Знают о существовании MCP, но не имеют времени/навыков создавать серверы с нуля
- Используют готовые MCP серверы (filesystem, fetch), но хотят больше интеграций

**Специфичные потребности и болевые точки:**
- 🎯 **Главная боль:** "Хочу подключить API к моему Claude, но не могу тратить дни на изучение MCP спецификации"
- ⚡ **Потребность в скорости:** Нужен результат быстро — экспериментальный подход
- 🔌 **Интеграция с любимыми сервисами:** Хотят подключить GitHub, Notion, Jira, Slack и другие API
- 🤝 **Простота без потери контроля:** Нужен баланс между автоматизацией и возможностью кастомизации

**Цели, которых они пытаются достичь:**
- Расширить возможности AI-ассистента для автоматизации рутинных задач
- Создать персонализированные AI-воркфлоу с доступом к специфичным данным
- Экспериментировать с AI-агентами без глубокого погружения в разработку
- Быстро прототипировать идеи AI-интеграций

### Secondary User Segment: Enterprise Teams & Internal Tool Developers

**Демографический/фирмографический профиль:**
- Компании среднего и крупного размера (50-5000+ сотрудников)
- Роли: внутренние разработчики инструментов, DevOps инженеры, платформенные команды
- Индустрии: технологические компании, финансы, здравоохранение, e-commerce
- Технический стек: уже используют микросервисы, REST API, имеют OpenAPI документацию

**Текущие поведения и рабочие процессы:**
- Экспериментируют с AI для внутренних процессов (саппорт, аналитика, автоматизация)
- Имеют десятки внутренних API без публичной документации
- Нужна стандартизация: один подход для всех API вместо разрозненных интеграций
- Заботятся о безопасности, логировании, мониторинге

**Специфичные потребности и болевые точки:**
- 🏢 **Масштаб:** Десятки API — нужна автоматизация генерации, не ручная работа
- 🔐 **Безопасность:** Обработка API ключей, compliance требования, логирование запросов
- 📊 **Стандартизация:** Единый подход ко всем внутренним API
- 🚀 **Быстрая валидация:** Нужно быстро проверить value proposition AI-интеграций

**Цели, которых они пытаются достичь:**
- Демократизировать доступ к внутренним API через AI-интерфейсы
- Ускорить разработку AI-powered внутренних инструментов
- Стандартизировать способ интеграции AI с существующей инфраструктурой
- ROI через автоматизацию и повышение продуктивности

---

## Goals & Success Metrics

### Business Objectives

**Для Primary сегмента (AI Power Users):**
- **Адопция:** Достичь **500 активных пользователей** в течение 3 месяцев после запуска MVP
- **Engagement:** **60% пользователей** генерируют минимум 2 MCP сервера в первый месяц использования
- **Community growth:** **50+ GitHub stars** и **10+ contributors** в первые 6 месяцев
- **Retention:** **40% месячный retention** — пользователи возвращаются для генерации новых серверов

**Для Secondary сегмента (Enterprise):**
- **Validation:** Получить **5 pilot enterprise клиентов** для валидации в течение 6 месяцев
- **Enterprise features:** Определить **top 3 enterprise требования** на основе фидбэка pilot клиентов
- **Value proof:** **80% pilot участников** подтверждают экономию времени >50% vs ручная разработка

### User Success Metrics

**Метрики пользовательского опыта:**
- **Time to First Success:** Пользователь генерирует рабочий MCP сервер за **<10 минут** с момента установки
- **Success Rate:** **>85% генерированных серверов** работают без ошибок на первом запуске
- **API Coverage:** Генератор корректно обрабатывает **>90% методов** в типичных OpenAPI документах
- **User Satisfaction:** **NPS (Net Promoter Score) ≥40** среди активных пользователей

**Технические метрики успеха AI-оптимизации:**
- **Context Efficiency:** AI может работать с API из **200+ методов** без переполнения контекста
- **Method Discovery:** AI находит нужный метод за **≤2 попытки** в 80% случаев
- **Response Quality:** **>75% пользователей** отмечают улучшенную понятность AI-ответов vs сырой JSON

### Key Performance Indicators (KPIs)

**Продуктовые KPI:**
- **MAU (Monthly Active Users):** Количество уникальных пользователей, генерирующих MCP серверы в месяц
  - **Target:** 500 MAU к концу Q1, 2000 MAU к концу Q2

- **Generation Success Rate:** Процент успешных генераций без критических ошибок
  - **Target:** ≥85% для MVP, ≥95% для v1.0

- **OpenAPI Compatibility Score:** Процент поддерживаемых OpenAPI фич от стандарта 3.0
  - **Target:** ≥70% для MVP, ≥90% для v1.0

**Технические KPI:**
- **CLI Performance:** Время генерации MCP сервера для типичного API (50 методов)
  - **Target:** <30 секунд для MVP, <15 секунд для v1.0

- **Generated Code Quality:** TypeScript compilation success rate сгенерированного кода
  - **Target:** 100% — код всегда должен компилироваться

**Community KPI:**
- **GitHub Activity:** Stars, forks, issues, PRs
  - **Target:** 100 stars к концу Q1, 500 stars к концу Q2

- **Documentation Quality:** Процент пользователей, успешно завершивших onboarding без обращения в поддержку
  - **Target:** ≥70%

---

## MVP Scope

### Core Features (Must Have)

**1. OpenAPI 3.0 Parser & Validator**
- Парсинг OpenAPI 3.0 JSON/YAML документов
- Валидация структуры согласно спецификации
- Разрешение `$ref` ссылок (внутренние и внешние)
- Обработка основных секций: `info`, `paths`, `components/schemas`, `securitySchemes`
- **Rationale:** Фундамент генератора — без качественного парсинга невозможна корректная генерация

**2. MCP Server Code Generator**
- Генерация TypeScript MCP сервера со структурой:
  - Tool definitions для каждого `path + method` из OpenAPI
  - HTTP client с поддержкой request/response handling
  - Типобезопасные интерфейсы из `components/schemas`
- Генерация `package.json` с необходимыми зависимостями
- Генерация базового `README.md` с инструкциями по использованию
- **Rationale:** Основная value proposition — автоматическая генерация рабочего кода

**3. Authentication Handlers**
- Поддержка основных схем авторизации из `securitySchemes`:
  - **API Key** (header и query parameter)
  - **Bearer Token** (HTTP Authorization header)
  - **Basic Auth**
- Конфигурация через environment variables (`.env` файл)
- **Rationale:** 90% публичных API используют эти схемы — критично для практического использования

**4. AI-Optimized Tool Descriptions**
- Генерация понятных описаний для AI из OpenAPI `summary` и `description`
- Автоматическая категоризация методов по `tags`
- Форматирование параметров в AI-readable формат (JSON Schema → human-readable)
- **Rationale:** Ключевой дифференциатор — AI должен понимать, какой tool использовать

**5. Smart Method Filtering System**
- **Tag-based organization:** Группировка методов по категориям
- **Search capability:** Поиск методов по ключевым словам в описаниях
- **Metadata exposure:** MCP tool с методом `listMethods(category?, search?)` для AI
- **Rationale:** Решает проблему контекстного окна для больших API (200+ методов)

**6. CLI Interface**
- Команда `generate <swagger-path> --output <dir>` для генерации сервера
- Базовые флаги: `--format json|yaml`, `--verbose`, `--auth-type`
- Понятные error messages при проблемах парсинга
- **Rationale:** Простой UX — one-command генерация

**7. Response Formatting for AI**
- Преобразование сырых API responses в структурированный формат:
  - Выделение ключевых полей
  - Сокращение больших массивов (показ первых N элементов + total count)
  - Human-readable представление дат, размеров, статусов
- Опциональный verbose режим для полного ответа
- **Rationale:** AI лучше понимает структурированные данные — повышает качество интеграции

### Out of Scope for MVP

**Не включаем в MVP (но рассмотрим позже):**
- OAuth2 flows (сложная реализация, требует callback servers)
- Webhooks и callback handling
- Поддержка OpenAPI 2.0 (Swagger) и OpenAPI 3.1
- GraphQL API support
- Автоматическое тестирование сгенерированных серверов
- UI для конфигурации генератора
- Мониторинг и логирование запросов API
- Rate limiting handling
- Кастомные templates для генерации кода
- Multi-language support (только TypeScript в MVP)

### MVP Success Criteria

**MVP считается успешным, если:**

1. **Функциональность:** Генератор успешно создает рабочий MCP сервер из Ozon Performance API swagger (300+ методов, Bearer auth)
2. **AI Integration:** Claude может использовать сгенерированный сервер для выполнения минимум 5 различных API операций
3. **Performance:** Генерация завершается за <30 секунд для API с 50 методами
4. **Quality:** Сгенерированный TypeScript код компилируется без ошибок
5. **Usability:** 3 beta-тестера успешно генерируют и используют MCP сервер за <15 минут
6. **AI Context:** AI может работать с API из 200+ методов благодаря smart filtering без переполнения контекста

---

## Technical Considerations

### Platform Requirements

**Target Platforms:**
- **Development:** macOS, Linux, Windows (через WSL или native Node.js)
- **Runtime:** Node.js ≥18.0.0 (для MCP SDK compatibility)
- **Distribution:** npm registry (публичный пакет)

**Browser/OS Support:**
- N/A — CLI tool, не требует browser support
- Сгенерированные MCP серверы работают в среде Claude Desktop / OpenAI clients

**Performance Requirements:**
- **Generation Speed:** <30 секунд для API с 50 методами, <2 минуты для 300+ методов
- **Memory Usage:** <512MB RAM during generation
- **Generated Server Performance:** <100ms latency overhead поверх реального API response time

### Technology Preferences

**Frontend:** N/A (CLI tool)

**Backend/CLI:**
- **Primary Language:** TypeScript 5.x (для type safety и лучшей DX)
- **Runtime:** Node.js 18+ (LTS)
- **Build Tool:** tsc (TypeScript compiler) + tsup для bundling
- **CLI Framework:** Commander.js для argument parsing
- **OpenAPI Parser:** `@apidevtools/swagger-parser` для validation + parsing
- **Code Generation:** Template-based approach с ts-morph для AST manipulation
- **HTTP Client (Generated Code):** axios (typed requests/responses)
- **MCP SDK:** `@modelcontextprotocol/sdk` (official Anthropic SDK)

**Generated MCP Server Stack:**
- **Language:** TypeScript (compiled to JavaScript)
- **Types:** Fully typed interfaces из OpenAPI schemas
- **HTTP Client:** axios с typed interceptors
- **Config:** dotenv для environment variables

**Database:** N/A

**Hosting/Infrastructure:**
- **CLI Distribution:** npm registry
- **CI/CD:** GitHub Actions для automated testing и publishing
- **Documentation:** GitHub Pages или docs.rs-style static site

### Architecture Considerations

**Repository Structure:**
```
openapi-to-mcp/
├── packages/
│   ├── cli/              # CLI tool (npx openapi-to-mcp)
│   ├── parser/           # OpenAPI parsing logic
│   ├── generator/        # Code generation engine
│   └── templates/        # Code templates для генерации
├── examples/             # Example swagger files + generated servers
├── docs/                 # Documentation
└── tests/                # Integration tests
```

**Service Architecture:**
- **Monorepo:** Single repo с несколькими packages (cli, parser, generator)
- **Modular Design:** Четкое разделение парсинга, трансформации и генерации кода
- **Plugin System (Future):** Возможность расширения для кастомных генераторов

**Integration Requirements:**
- **MCP Protocol:** Полная совместимость с MCP specification (tools, resources, prompts)
- **Claude Desktop:** Генерированные серверы должны легко подключаться через config
- **Environment Variables:** Стандартный способ конфигурации (`.env` files)

**Security/Compliance:**
- **API Credentials:** Никогда не хардкодить в сгенерированный код — только env vars
- **Code Generation Security:** Sanitize user input из OpenAPI для предотвращения code injection
- **Dependencies:** Регулярный audit npm dependencies (npm audit, Dependabot)
- **Secrets Handling:** Документация best practices для безопасного хранения API keys

---

## Constraints & Assumptions

### Constraints

- **Budget:** Bootstrapped / self-funded — минимальные затраты на инфраструктуру
- **Timeline:** MVP в течение 2-3 месяцев (part-time разработка)
- **Resources:** 1-2 разработчика, без dedicated QA/DevOps
- **Technical:** Ограничены OpenAPI 3.0 spec complexity — некоторые edge cases могут не поддерживаться в MVP

### Key Assumptions

- MCP протокол останется стабильным и будет развиваться (не deprecated через год)
- Anthropic и OpenAI продолжат инвестировать в tool-use capabilities
- Существует достаточный спрос на автоматизацию MCP генерации
- Пользователи имеют базовые навыки работы с CLI и Node.js
- Большинство OpenAPI документов следуют стандарту (не слишком сломаны)
- Tag-based filtering достаточно для решения проблемы контекста (не нужен ML/embeddings)

---

## Risks & Open Questions

### Key Risks

- **MCP Protocol Evolution:** Протокол может измениться, потребуется обновление генератора
  - _Mitigation:_ Мониторить MCP spec changes, модульная архитектура для легких обновлений

- **OpenAPI Complexity:** Реальные swagger документы могут содержать неожиданные edge cases
  - _Mitigation:_ Тестирование на 10+ разных публичных API, итеративное улучшение parser

- **Competition:** Кто-то может выпустить похожее решение раньше
  - _Mitigation:_ Быстрый MVP, фокус на AI-оптимизацию как дифференциатор

- **Adoption:** Пользователи могут не найти инструмент или не понять ценность
  - _Mitigation:_ Качественная документация, примеры, активное community building

- **Technical Debt:** Спешка с MVP может создать плохую архитектуру
  - _Mitigation:_ Code reviews, рефакторинг после валидации product-market fit

### Open Questions

- Какое оптимальное название для проекта? (`openapi-to-mcp`, `mcp-gen`, `swagger-mcp-cli`)
- Нужна ли поддержка OAuth2 в MVP или можно отложить?
- Как лучше организовать AI-фильтрацию: статически в коде или динамически через отдельный MCP tool?
- Open source license — MIT, Apache 2.0?
- Монетизация в будущем — enterprise features, hosted solution, поддержка?

### Areas Needing Further Research

- Анализ конкурентов — существуют ли похожие решения?
- Исследование MCP community — где находятся потенциальные пользователи?
- Benchmarking code generation performance — реалистичны ли наши целевые метрики?
- User interviews с потенциальными пользователями для валидации assumptions

---

## Next Steps

### Immediate Actions

1. **Finalize project naming** — выбрать финальное название и зарегистрировать npm package name
2. **Setup repository** — создать GitHub repo, базовая структура monorepo, CI/CD pipeline
3. **OpenAPI research sprint** — глубокое изучение OpenAPI 3.0 spec с анализом Ozon swagger
4. **Proof of concept** — минимальная генерация одного MCP tool из простого OpenAPI endpoint
5. **Documentation outline** — структура README, getting started guide, API reference

### PM Handoff

Этот Project Brief предоставляет полный контекст для **OpenAPI-to-MCP Generator**. Следующий шаг — создание PRD (Product Requirements Document), где детализируем:

- Детальные user stories для каждой фичи MVP
- Технические спецификации для OpenAPI parser
- MCP server generation templates
- Testing strategy и acceptance criteria
- Release plan и go-to-market strategy

Рекомендуется начать с **PRD Generation Mode**, работая с пользователем секция за секцией, уточняя технические детали и выстраивая приоритеты фич для первой итерации разработки.

---

