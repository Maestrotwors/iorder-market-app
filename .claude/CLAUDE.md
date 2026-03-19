# iOrder Market — E-Commerce Platform

## Архитектура
Монорепо с микросервисной архитектурой.

## Стек технологий
- **Frontend**: Angular 21, standalone components, SCSS, Signal Forms, NGRX Signal Store
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
- `/` — лендинг (неавторизованный пользователь)
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

### Signal Forms (СТРОГО ОБЯЗАТЕЛЬНО)
- **НЕ использовать Reactive Forms** (`FormBuilder`, `FormGroup`, `FormControl`) для новых форм
- Для форм использовать **Angular Signal Forms** (`@angular/forms/signals`)
- `form()` + `signal()` для модели данных, `[formField]` директива в шаблоне
- `FormField` импортировать из `@angular/forms/signals`

```typescript
import { signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

// В компоненте:
loginModel = signal({ email: '', password: '' });
loginForm = form(this.loginModel);

// В шаблоне:
// <input [formField]="loginForm.email" />
```

### NGRX Signal Store (СТРОГО ОБЯЗАТЕЛЬНО)
- **НЕ использовать сервисы с signal()** для хранения состояния приложения
- Для state management использовать **NGRX Signal Store** (`@ngrx/signals`)
- `signalStore` + `withState` + `withMethods` + `withComputed`
- `patchState` для обновления состояния
- Store предоставлять через `providedIn: 'root'` или через `providers` в роуте
- **Вся логика и вычисления — в Store** (withMethods, withComputed)
- Store может вызывать сервисы (HttpClient, AuthService, etc.)
- **Компоненты НЕ вычисляют** — только передают данные в Store и читают из Store

```typescript
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState({ user: null as User | null, loading: false }),
  withComputed((store) => ({
    isAuthenticated: computed(() => !!store.user()),
    userRole: computed(() => store.user()?.role ?? null),
  })),
  withMethods((store, http = inject(HttpClient)) => ({
    async login(email: string, password: string) {
      patchState(store, { loading: true });
      // ...
    },
  })),
);

// Компонент — максимально простой:
export class LoginComponent {
  readonly store = inject(AuthStore);
  // Никаких вычислений — только вызов store.login() и чтение store.loading()
}
```

### Стиль компонентов (СТРОГО ОБЯЗАТЕЛЬНО)
- **Single-file components** — template, styles, логика в одном `.ts` файле (inline template + inline styles)
- SCSS для стилей (inline `styles: \`...\``)
- Standalone components
- Skip tests при генерации
- `ChangeDetectionStrategy.OnPush`
- Компоненты максимально простые — никакой бизнес-логики, только:
  - `inject(Store)` — получить store
  - Чтение данных из store в шаблоне
  - Вызов методов store при действиях пользователя

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
- `/tester` — Playwright E2E, Vitest юнит/интеграционные тесты (фронтенд + бэкенд)

## Sheriff — Module Boundaries

Sheriff (`@softarc/sheriff-core` + `@softarc/eslint-plugin-sheriff`) контролирует границы модулей и запрещает несанкционированные импорты между частями проекта.

### Установка
```bash
bun add -D @softarc/sheriff-core @softarc/eslint-plugin-sheriff
npx sheriff init  # создаёт sheriff.config.ts в корне
```

### Конфигурация (`sheriff.config.ts`)
```typescript
import { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  enableBarrelLess: true, // модули без index.ts (barrel-less)
  modules: {
    // Путь к папке → теги
    'src/app/customer':  ['domain:customer',  'type:feature'],
    'src/app/supplier':  ['domain:supplier',  'type:feature'],
    'src/app/admin':     ['domain:admin',     'type:feature'],
    'packages/shared-contracts': ['type:shared'],
    'packages/shared-logic':     ['type:shared'],
    'packages/shared-ui':        ['type:shared-ui'],
  },
  depRules: {
    // Каждый домен может зависеть только от себя и shared
    'domain:*': ['domain:$*', 'type:shared', 'type:shared-ui'],
    // shared не зависит от доменов
    'type:shared': 'type:shared',
    'type:shared-ui': ['type:shared', 'type:shared-ui'],
    // root (AppComponent) может импортировать feature-модули
    root: ['type:feature', 'type:shared'],
  },
};
```

### ESLint интеграция (flat config — `eslint.config.js`)
```javascript
const sheriff = require('@softarc/eslint-plugin-sheriff');

module.exports = tseslint.config(
  // ...other configs
  {
    files: ['**/*.ts'],
    extends: [sheriff.configs.all],
  },
);
```

### Ключевые концепции
- **Модуль** — папка с `index.ts` (barrel) или любая папка при `enableBarrelLess: true`
- **Теги** — метки модулей (`domain:customer`, `type:feature`, `type:shared`)
- **depRules** — правила: какие теги могут импортировать какие
- **Deep imports запрещены** — нельзя импортировать файлы модуля напрямую, только через его public API (barrel `index.ts`)
- **`noTag`** — модули без тегов (для инкрементального внедрения)
- **Wildcard `domain:*` → `domain:$*`** — каждый домен может зависеть только от себя

### Правила проекта iOrder
- `shared-contracts` и `shared-logic` доступны всем модулям
- `shared-ui` доступен только фронтенд-модулям
- Микросервисы не должны импортировать друг из друга — только через `shared-contracts`
- Фронтенд-домены (`customer`, `supplier`, `admin`) изолированы друг от друга

## Knip — Unused Code Detection

Knip находит неиспользуемые файлы, зависимости, экспорты и типы.

### Команды
```bash
bun run knip          # проверка
bun run knip:fix      # автоисправление (удаление unused exports)
```

### Интеграция с билдом
- `prebuild:web` автоматически запускает `lint` + `knip` перед `build:web`
- Конфигурация в `knip.json` — настроена под все workspaces проекта

### Правила
- `enumMembers` исключены из проверки (enum значения в shared-contracts используются потребителями)
- `ignoreDependencies` — зависимости, которые пока не используются в коде, но нужны по архитектуре

## Языки
- Код и комментарии: English
- Коммуникация с пользователем: Русский
