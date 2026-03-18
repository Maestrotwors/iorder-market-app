# iOrder Market — E-Commerce Platform

## Архитектура
Монорепо с микросервисной архитектурой и Micro Frontend (Native Federation).

## Стек технологий
- **Frontend**: Angular 21, @angular-architects/native-federation 21.x (Manfred Steyer)
- **Backend**: ElysiaJS на Bun runtime
- **Database**: PostgreSQL + Prisma ORM (WAL для CDC)
- **Message Broker**: RedPanda (Kafka-совместимый)
- **Real-time**: SSE (покупатель/поставщик), WebSockets (админка)

## Micro Frontend архитектура (Native Federation)

```
Shell (host)        → http://localhost:4200  — навигация, загружает remotes
Customer (remote)   → http://localhost:4201  — /  (каталог, корзина, заказы)
Supplier (remote)   → http://localhost:4202  — /supplier (кабинет поставщика)
Admin (remote)      → http://localhost:4203  — /admin (панель администратора)
```

Shell загружает remotes через `loadRemoteModule` (dynamic-host):
- `/admin` → loadRemoteModule('admin', './Routes')
- `/supplier` → loadRemoteModule('supplier', './Routes')
- `/` → loadRemoteModule('customer', './Routes')

Каждый remote экспортирует в federation.config.js:
- `'./Component'` → app.component.ts
- `'./Routes'` → app.routes.ts

## Структура проекта
- `frontend/shell/`                     — MFE host (Angular, dynamic-host), порт 4200
- `frontend/microfrontends/customer/`   — MFE remote, порт 4201
- `frontend/microfrontends/supplier/`   — MFE remote, порт 4202
- `frontend/microfrontends/admin/`      — MFE remote, порт 4203
- `microservices/`                      — ElysiaJS сервисы на Bun
- `packages/`                           — общие пакеты (contracts, logic, UI)
- `database/`                           — Prisma schema и миграции
- `infrastructure/`                     — Docker, CI/CD, RedPanda
- `config/`                             — центральный конфиг портов (config/index.ts)

## Правила разработки
- Все контракты API в `packages/shared-contracts`
- **Одни и те же типы** (`IProduct`, `ApiResponse<T>`, etc.) используются и в ElysiaJS routes, и в Angular компонентах
- Бизнес-логика, общая для web/mobile, пишется в `packages/shared-logic`
- Общие Angular-компоненты — в `packages/shared-ui`
- Каждый микросервис — отдельный ElysiaJS проект на Bun
- Используй Zod для валидации DTO
- HTTP запросы от клиента → SSE ответы (кроме админки)
- Админка использует WebSockets

## Angular — обязательные правила

### Zoneless (СТРОГО ОБЯЗАТЕЛЬНО)
- **НЕ использовать Zone.js** — никогда. Ни в polyfills, ни в зависимостях
- Вместо `provideZoneChangeDetection()` всегда использовать `provideZonelessChangeDetection()`
- В `angular.json` в `polyfills` — только `es-module-shims` (для shell), для remotes — пустой массив
- Компоненты должны использовать `ChangeDetectionStrategy.OnPush` или Signals
- Для реактивности — Angular Signals (`signal()`, `computed()`, `effect()`)

## Запуск
```bash
bun run start:all           # всё сразу
bun run start:frontend      # все MFE (shell + remotes)
bun run start:microservices # api-gateway + products
ng serve shell              # только shell
ng serve customer / supplier / admin
```

## Агенты
- `/frontend` — Angular MFE (shell + remotes + shared UI)
- `/backend` — ElysiaJS микросервисы на Bun
- `/database` — Prisma, миграции, PostgreSQL, WAL/CDC
- `/devops` — Docker, CI/CD, инфраструктура

## Языки
- Код и комментарии: English
- Коммуникация с пользователем: Русский
