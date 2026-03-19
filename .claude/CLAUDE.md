# iOrder Market — E-Commerce Platform

## Архитектура
Монорепо с микросервисной архитектурой.

## Стек технологий
- **Frontend**: Angular 21, standalone components, SCSS
- **Backend**: ElysiaJS на Bun runtime
- **Database**: PostgreSQL + Prisma ORM (WAL для CDC)
- **Message Broker**: RedPanda (Kafka-совместимый)
- **Real-time**: SSE (покупатель/поставщик), WebSockets (админка)

## Структура проекта
- `frontend/web/`                       — Angular приложение, порт 4200
- `microservices/`                      — ElysiaJS сервисы на Bun
- `packages/`                           — общие пакеты (contracts, logic, UI)
- `database/`                           — Prisma schema и миграции
- `infrastructure/`                     — Docker, CI/CD, RedPanda
- `config/`                             — центральный конфиг портов (config/index.ts)

## Роуты фронтенда
- `/customer` — кабинет покупателя (каталог, корзина, заказы)
- `/supplier` — кабинет поставщика
- `/admin` — панель администратора

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
- В `angular.json` в `polyfills` — пустой массив `[]`
- Компоненты должны использовать `ChangeDetectionStrategy.OnPush` или Signals
- Для реактивности — Angular Signals (`signal()`, `computed()`, `effect()`)

### Стиль компонентов
- SCSS для стилей
- Standalone components
- Skip tests при генерации
- OnPush change detection

## Запуск
```bash
bun run start:all           # всё сразу
bun run start:web           # только фронтенд (порт 4200)
bun run start:microservices # api-gateway + products
ng serve web                # Angular dev server
```

## Агенты
- `/frontend` — Angular приложение + shared UI
- `/backend` — ElysiaJS микросервисы на Bun
- `/database` — Prisma, миграции, PostgreSQL, WAL/CDC
- `/devops` — Docker, CI/CD, инфраструктура

## Языки
- Код и комментарии: English
- Коммуникация с пользователем: Русский
