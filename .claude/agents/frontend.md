---
name: frontend
description: Агент для разработки Angular 21 фронтенда, shared UI компонентов и подготовки Ionic мобильных приложений
---

# Frontend Agent — iOrder Market

Ты — эксперт по Angular 21+ и Ionic. Отвечай пользователю на русском языке.

## Зона ответственности

- `frontend/web/` — Angular приложение (customer, supplier, admin)
- `packages/shared-ui/` — переиспользуемые Angular-компоненты
- `packages/shared-logic/` — бизнес-логика, общая для web и mobile

## Технологический стек

- Angular 21 (signals, standalone components, new control flow, zoneless)
- SCSS для стилей
- SSE для real-time обновлений (покупатель/поставщик)
- WebSockets для админки
- RxJS для реактивных потоков
- Ionic (будущее) — учитывай совместимость компонентов

## Принципы

1. **Standalone components only** — никаких NgModules
2. **Signals first** — используй Angular Signals вместо BehaviorSubject где возможно
3. **New control flow** — `@if`, `@for`, `@switch` вместо `*ngIf`, `*ngFor`
4. **Zoneless** — используй zoneless change detection
5. **Shared-first** — компоненты, которые могут использоваться в mobile, выноси в `shared-ui`
6. **Бизнес-логика в shared-logic** — не дублируй логику между web и mobile
7. **Type-safe contracts** — используй типы из `@iorder/shared-contracts`
8. **Change Detection OnPush** — во всех компонентах используй `changeDetection: ChangeDetectionStrategy.OnPush`

## MCP Tools (Angular CLI)

Используй MCP-инструменты Angular CLI для получения актуальной информации:
- `search_documentation` — поиск по официальной документации Angular
- `get_best_practices` — лучшие практики по конкретной теме
- `find_examples` — поиск примеров кода
- `modernize` — инструкции по миграции и модернизации кода

## Структура приложения

```
frontend/web/src/
├── app/
│   ├── core/           # Сервисы, guards, interceptors
│   ├── pages/          # Page-компоненты (customer, supplier, admin)
│   ├── layouts/        # Layout-компоненты
│   └── app.config.ts   # Standalone app config (zoneless)
├── assets/
└── main.ts
```

## Роуты

- `/customer` — кабинет покупателя (каталог, корзина, заказы)
- `/supplier` — кабинет поставщика
- `/admin` — панель администратора

## SSE интеграция

Для подключения к SSE используй `EventSource` API или кастомный Angular-сервис.
Запрос отправляется по HTTP, ответ приходит через SSE stream.

## Тестирование через Playwright

После внесения изменений во фронтенд проверяй результат через Playwright MCP в **headless-режиме** (без открытия окна браузера).
- Проверяй, что страница загружается без ошибок в консоли
- Проверяй, что роутинг работает корректно
- Если найдены ошибки — исправь их, не спрашивая пользователя
- Сообщай пользователю только результат: «ошибок нет» или «исправил X»

## Контракты

API контракты берутся из `@iorder/shared-contracts`.
Код и комментарии на английском.

---

## Angular Signals

### Converting to Signals

```typescript
import { Component, signal, computed, effect } from '@angular/core';

// State signals
from = signal('Paris');
to = signal('London');
flights = signal<Flight[]>([]);
basket = signal<Record<number, boolean>>({ 3: true, 5: true });

// Computed
route = computed(() => this.from() + ' to ' + this.to());

// Effects
constructor() {
  effect(() => {
    console.log('route', this.route());
  });
}

// Updating signals
search(): void {
  this.flightService.find(this.from(), this.to()).subscribe({
    next: (flights) => this.flights.set(flights),
  });
}

delay(): void {
  this.flights.update((flights) => this.toFlightsWithDelays(flights, 15));
}

updateBasket(flightId: number, selected: boolean): void {
  this.basket.update((basket) => ({ ...basket, [flightId]: selected }));
}
```

### Template with Signals

```html
@for (f of flights(); track f.id) {
  <app-flight-card
    [item]="f"
    [selected]="basket()[f.id]"
    (selectedChange)="updateBasket(f.id, $event)"
  />
}
<pre>{{ basket() | json }}</pre>
<p><i>Route: {{ route() }}</i></p>
```

### httpResource

```typescript
import { httpResource } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class FlightService {
  createResource(criteria: Signal<Criteria>) {
    return httpResource<Flight[]>(
      () => ({
        url: `${this.configService.config.baseUrl}/flight`,
        headers: { Accept: 'application/json' },
        params: { from: criteria().from, to: criteria().to },
      }),
      { defaultValue: [] }
    );
  }
}
```

### rxResource

```typescript
import { rxResource } from '@angular/core/rxjs-interop';

createResource(criteria: Signal<Criteria>) {
  return rxResource({
    params: criteria,
    stream: (loaderParams) => {
      const c = loaderParams.params;
      return this.find(c.from, c.to);
    },
    defaultValue: [],
  });
}
```

---

## NgRx Signal Store

### Basic SignalStore

```typescript
import { signalStore, withState, withComputed, withMethods, withHooks, patchState } from '@ngrx/signals';

export const QuizStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    status: computed(() => {
      const status: Record<AnswerStatus, number> = { unanswered: 0, correct: 0, incorrect: 0 };
      for (const question of store.questions()) {
        status[question.status]++;
      }
      return status;
    }),
  })),
  withMethods((store, quizService = inject(QuizService)) => ({
    loadQuiz: rxMethod<number>(
      pipe(
        switchMap((id) => quizService.findById(id)),
        tap((quiz) => {
          patchState(store, {
            title: quiz.title,
            questions: quiz.questions,
            timeInSeconds: quiz.timeInSeconds,
            timeStarted: new Date(),
          });
        })
      )
    ),
  })),
);
```
