# iOrder Market — E-Commerce Platform

## Архитектура

Монорепо (Bun workspaces) с микросервисной архитектурой. Без Nx/Turbo/Lerna.

## Стек технологий

- **Frontend**: Angular 21, standalone components, SCSS, Signal Forms, NGRX Signal Store
- **Backend**: ElysiaJS 1.2+ на Bun runtime
- **Database**: PostgreSQL + Prisma ORM
- **Message Broker**: RedPanda (Kafka-совместимый) — запланировано
- **Testing**: Playwright (E2E), Vitest (unit/integration)
- **Code Quality**: ESLint 9 (flat config) + Sheriff + Prettier + Knip

## Структура проекта

```
├── frontend/web/                     — Angular приложение (порт 4200)
├── microservices/
│   └── iorder-main/                  — Основной микросервис (порт 3000)
├── libs/                             — Shared packages (запланировано)
├── infrastructure/                   — Docker, Helm, CI/CD (запланировано)
├── e2e/                              — E2E тесты (запланировано)
└── .claude/
    ├── agents/                       — Агенты
    └── skills/                       — Скиллы
```

## Frontend — структура доменов

```
frontend/web/src/app/
├── public/                           — Публичные страницы (без авторизации)
│   └── pages/                        — Landing, about, etc.
├── customer/                         — Домен покупателя
│   └── pages/                        — Страницы покупателя (каталог, корзина, заказы)
├── supplier/                         — Домен поставщика
│   └── pages/                        — Страницы поставщика (товары, заказы, аналитика)
├── admin/                            — Домен администратора
│   └── pages/                        — Страницы админки (пользователи, модерация)
├── ui/                               — Shared UI компоненты (button, input, card, etc.)
├── app.config.ts
├── app.routes.ts
└── app.ts
```

Каждый домен изолирован — не импортирует из других доменов. Общий код только через `ui/`.

## Angular — обязательные правила

### Zoneless (СТРОГО ОБЯЗАТЕЛЬНО)

- **НЕ использовать Zone.js** — никогда
- `provideZonelessChangeDetection()` в app.config.ts
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

- Все API типы в shared-contracts — одни и те же типы на frontend и backend
- Новый эндпоинт: сначала контракт, потом реализация
- Zod-схемы для валидации DTO

### Межсервисное взаимодействие

- Микросервисы не импортируют друг друга — только через shared-contracts
- Микросервис `iorder-main` — пока единственный, делает всё

## Агенты

- `/mentor` — Ментор-эксперт: объясняет решения, ищет в документации, НЕ правит файлы
- `/frontend` — Angular приложение, shared UI, FSD архитектура
- `/backend` — ElysiaJS микросервисы, бизнес-логика
- `/database` — Prisma, миграции, PostgreSQL
- `/devops` — Docker, Kubernetes, Helm, CI/CD
- `/tester` — Playwright E2E, Vitest юнит/интеграционные тесты

## Скиллы

- `/create-component` — Angular 21 single-file standalone component
- `/create-store` — NGRX Signal Store (local или global)
- `/create-form` — Angular Signal Form

## Языки

- Код и комментарии: English
- Коммуникация с пользователем: Русский
