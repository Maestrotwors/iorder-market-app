# iOrder Market — E-Commerce Platform

## Архитектура
Монорепо (Bun workspaces) с микросервисной архитектурой. Без Nx/Turbo/Lerna.

## Стек технологий
- **Frontend**: Angular 21.2, standalone components, SCSS, Signal Forms, NGRX Signal Store, Vite + @analogjs
- **Backend**: ElysiaJS 1.2 на Bun runtime (>= 1.2)
- **Auth**: Better Auth 1.3 (JWT plugin, JWKS, cookie sessions)
- **Database**: PostgreSQL 16 + Prisma ORM 6 (WAL для CDC)
- **Message Broker**: RedPanda (Kafka-совместимый)
- **Observability**: OpenTelemetry (traces → Tempo), Prometheus metrics, structured JSON logging
- **Real-time**: SSE (покупатель/поставщик), WebSockets (админка) — запланировано
- **Testing**: Playwright 1.58 (E2E), Vitest 4.1 (unit/integration)
- **Code Quality**: ESLint 9 (flat config) + Sheriff + Prettier 3.8 + Knip 5.88
- **Node**: >= 22.0.0

## Структура проекта
```
├── frontend/web/                     — Angular приложение (порт 4200)
├── microservices/
│   ├── api-gateway/                  — Reverse proxy, JWT-верификация, роутинг (порт 3000)
│   ├── products-service/             — Каталог товаров CRUD (порт 3001)
│   └── auth-service/                 — Better Auth, JWT, JWKS (порт 3002)
├── packages/
│   ├── shared-contracts/             — API типы, Zod-схемы, эндпоинты, events (@iorder/shared-contracts)
│   ├── shared-logic/                 — Бизнес-утилиты (price, order, validators)
│   └── shared-observability/         — OpenTelemetry tracer + Elysia plugin (@iorder/shared-observability)
├── database/
│   ├── prisma/schema.prisma          — Prisma schema (user, session, account, verification, Product)
│   ├── prisma/migrations/            — SQL миграции
│   └── scripts/                      — seed.ts, setup-wal.sql
├── config/
│   ├── index.ts                      — Центральный конфиг (порты, хосты, DB, JWT, RedPanda, CORS)
│   └── ports.json                    — Маппинг портов
├── infrastructure/
│   ├── docker/                       — Dockerfiles, docker-compose файлы, nginx конфиг
│   ├── helm/iorder/                  — Helm chart (все сервисы + infra)
│   ├── ci-cd/.github/workflows/      — GitHub Actions CI
│   ├── argocd/                       — ArgoCD application manifest
│   └── redpanda/                     — Скрипт создания топиков
├── e2e/                              — Playwright E2E + API интеграционные тесты (Vitest)
└── .claude/
    ├── agents/                       — Агенты (frontend, backend, devops, database, tester)
    └── skills/                       — Скиллы (create-component, create-store, create-form)
```

## Микросервисы — текущее состояние

### API Gateway (порт 3000)
- Reverse proxy с JWT-верификацией через JWKS от auth-service
- Маршруты: `/api/auth/*` → auth-service (без auth), `/api/products/*` → products-service (с auth)
- Инжектит `X-User-Id`, `X-User-Email`, `X-User-Role` заголовки в downstream
- Prometheus метрики на `/metrics`, health check на `/api/health`
- OpenTelemetry: создаёт SERVER и CLIENT spans, пропагирует W3C traceparent

### Auth Service (порт 3002)
- Better Auth с Prisma adapter и JWT plugin
- Эндпоинты: `/api/auth/sign-up/email`, `/api/auth/sign-in/email`, `/api/auth/token`, `/api/auth/jwks`
- Cookie-based sessions (prefix: `iorder`, httpOnly, secure в production)
- Кастомное поле `role` в user model (default: `customer`)

### Products Service (порт 3001)
- CRUD для товаров с пагинацией, фильтрацией, поиском
- **ВНИМАНИЕ: пока использует mock данные в памяти** — Prisma интеграция не завершена
- Zod-валидация: CreateProductSchema, UpdateProductSchema

## Аутентификация — полный flow

```
1. POST /api/auth/sign-up/email → Auth Service → создание user + session cookie
2. POST /api/auth/sign-in/email → Auth Service → session cookie
3. GET /api/auth/token (с cookie) → Auth Service → JWT token
4. GET /api/products (Authorization: Bearer <jwt>) → API Gateway
   → Верификация JWT через JWKS (/api/auth/jwks)
   → Инжекция X-User-* headers → Products Service
```

## Frontend — Feature-Sliced Design (FSD)

```
frontend/web/src/app/
├── pages/                  # Страницы (lazy-loaded routes)
│   ├── landing/            # Лендинг + home
│   ├── customer/           # Кабинет покупателя (stub)
│   ├── supplier/           # Кабинет поставщика (stub)
│   └── admin/              # Панель администратора (stub)
├── widgets/                # Составные UI-блоки (пусто — готово к разработке)
├── features/               # Действия пользователя + store
│   └── auth/               # auth.store.ts (global)
│       ├── login/          # login.component.ts + login.store.ts (local)
│       └── register/       # register.component.ts + register.store.ts (local)
├── entities/               # Бизнес-сущности (пусто — готово к разработке)
├── shared/                 # Guards, API, types
│   ├── api/auth.service.ts # HTTP-сервис аутентификации
│   ├── guards/auth.guard.ts # roleGuard(allowedRole)
│   └── types/auth.types.ts # BetterAuthUser, SessionResponse
├── store/                  # Глобальный app store
│   └── app.store.ts        # theme, initialized
├── ui/                     # Локальные UI компоненты
│   ├── button/             # UiButtonComponent (variants, sizes, loading)
│   └── input/              # UiInputComponent (label, error, placeholder)
├── schemas/                # Frontend-only Zod (пусто)
├── app.config.ts           # provideZonelessChangeDetection(), provideRouter, provideHttpClient(withFetch())
├── app.routes.ts           # Lazy routes с roleGuard
└── app.ts                  # Root component
```

### Path aliases (tsconfig.json)
```
@iorder/shared-contracts → packages/shared-contracts/src/index.ts
@pages → frontend/web/src/app/pages/index.ts
@features → frontend/web/src/app/features/index.ts
@widgets → frontend/web/src/app/widgets/index.ts
@shared → frontend/web/src/app/shared/index.ts
@store → frontend/web/src/app/store/index.ts
@ui → frontend/web/src/app/ui/index.ts
@schemas → frontend/web/src/app/schemas/index.ts
```

**Правило зависимостей (Sheriff):** `pages → widgets → features → entities → shared/store/ui → @iorder/*`

## Shared Packages

### @iorder/shared-contracts
```
src/
├── types/         — IUser, IProduct, IOrder, ICart, IAddress, ApiResponse<T>, PaginatedResponse<T>, SSEEvent<T>
├── schemas/       — Zod: LoginSchema, RegisterSchema, CreateProductSchema, UpdateProductSchema, ProductFilterSchema, CreateOrderSchema
├── endpoints/     — Request/Response контракты для auth, products, orders
├── enums/         — UserRole, OrderStatus, PaymentStatus
└── events/        — EventTopics (RedPanda topics), Event payloads (OrderCreatedEvent, StockUpdatedEvent, etc.)
```

### @iorder/shared-logic
```
src/
├── utils/         — formatPrice(), calculateTotalWithTax(), canCancelOrder(), isValidStatusTransition()
└── validators/    — isValidEmail(), isStrongPassword(), isValidPhone()
```

### @iorder/shared-observability
```
src/
├── tracer.ts          — initTracer() (OTLP exporter, dev: Simple, prod: Batch)
├── elysia-plugin.ts   — observabilityPlugin() для Elysia (SERVER spans, structured logging)
└── logger.ts          — Logger class с traceId/spanId в JSON output
```

## Angular — обязательные правила

### Zoneless (СТРОГО ОБЯЗАТЕЛЬНО)
- **НЕ использовать Zone.js** — никогда
- `provideZonelessChangeDetection()` в app.config.ts
- Polyfills: `[]` в angular.json
- `ChangeDetectionStrategy.OnPush` + Signals

### Signal Forms (СТРОГО ОБЯЗАТЕЛЬНО)
- **НЕ использовать Reactive Forms** для новых форм
- `form()` + `signal()` из `@angular/forms/signals`
- `[formField]` директива в шаблоне

### NGRX Signal Store (СТРОГО ОБЯЗАТЕЛЬНО)
- **НЕ использовать сервисы с signal()** для state management
- `signalStore` + `withState` + `withMethods` + `withComputed` + `patchState`
- **Вся логика в Store** — компоненты только читают и вызывают методы

### Стиль компонентов (СТРОГО ОБЯЗАТЕЛЬНО)
- **Single-file** — inline template + inline styles в одном `.ts` файле
- SCSS, standalone, OnPush, skip tests
- Компоненты максимально простые — inject Store, read, call

## Правила разработки

### Контракты (КРИТИЧЕСКИ ВАЖНО)
- Все API типы в `@iorder/shared-contracts` — одни и те же типы на frontend и backend
- Новый эндпоинт: сначала контракт в `packages/shared-contracts/src/endpoints/`, потом реализация
- Zod-схемы из `src/schemas/` для валидации DTO

### Межсервисное взаимодействие
- Микросервисы не импортируют друг друга — только через `@iorder/shared-contracts`
- API Gateway — единственная точка входа извне
- Downstream сервисы доверяют `X-User-*` заголовкам от Gateway
- `config/index.ts` — единый конфиг портов/хостов (автоопределение Docker/K8s/localhost)

### Code Quality
- `bun run check` → format:check + lint + knip (запускается автоматически перед build:web)
- `bun run check:fix` → format + lint:fix + knip:fix
- Commitlint: conventional commits (feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert)
- Lint-staged: prettier на *.{ts,html,scss,json}, eslint на *.ts

## Docker Compose файлы

| Файл | Назначение |
|------|-----------|
| `docker-compose.yml` | RedPanda + Console только |
| `docker-compose.db.yml` | Standalone PostgreSQL (WAL enabled) |
| `docker-compose.dev.yml` | Полный стек: DB + RedPanda + все сервисы + frontend |
| `docker-compose.test.yml` | E2E: DB (tmpfs) + migrate + сервисы + frontend + Playwright runner |

## Запуск
```bash
# Разработка
bun run start:web              # Angular dev server (порт 4200)
bun run start:microservices    # Gateway + Products + Auth
bun run start:all              # Всё сразу
bun run dev:docker:up          # Полный стек в Docker

# Тесты
bun run test:web               # Vitest юнит-тесты
bun run test:api               # API интеграционные тесты
bun run test:e2e               # Playwright E2E (локально)
bun run test:e2e:docker        # Playwright E2E в Docker

# База данных
bun run db:generate            # Prisma generate
bun run db:migrate             # Prisma migrate dev
bun run db:push                # Prisma push
bun run db:studio              # Prisma Studio
bun run db:seed:test-user      # Seed тестовых пользователей

# Kubernetes
bun run k8s:deploy             # Helm install
bun run k8s:pods               # kubectl get pods
bun run k8s:logs               # kubectl logs
bun run k8s:forward            # Port-forward
```

## Агенты
- `/frontend` — Angular приложение, shared UI, FSD архитектура
- `/backend` — ElysiaJS микросервисы, API Gateway, Better Auth, SSE/WS
- `/database` — Prisma, миграции, PostgreSQL, WAL/CDC
- `/devops` — Docker, Kubernetes, Helm, CI/CD, RedPanda
- `/tester` — Playwright E2E, Vitest юнит/интеграционные тесты

## Скиллы
- `/create-component` — Angular 21 single-file standalone component
- `/create-store` — NGRX Signal Store (local или global)
- `/create-form` — Angular Signal Form

## Sheriff — Module Boundaries

`enableBarrelLess: true` — модулям не нужен index.ts.

26 модулей с тегами. Ключевые правила:
- FSD: `page → widget → feature → shared/store/ui → shared-contracts`
- Микросервисы: `gateway → services → shared-contracts` (сервисы не импортируют друг друга)
- `shared-contracts` и `shared-logic` доступны всем
- `shared-ui` — только фронтенду
- Домены (`customer`, `supplier`, `admin`) изолированы

## Knip — Unused Code Detection

```bash
bun run knip          # проверка
bun run knip:fix      # автоисправление
```
`prebuild:web` автоматически запускает `check` перед `build:web`.

## Языки
- Код и комментарии: English
- Коммуникация с пользователем: Русский
