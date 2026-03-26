---
name: create-feature
description: Create an FSD feature slice with component + NGRX Signal Store + barrel export
user_invocable: true
---

# Create FSD Feature

Create a complete Feature-Sliced Design feature with component and store.

## Arguments

Parse the arguments:
- First argument: feature name (e.g., `product-catalog`, `order-checkout`, `cart`)
- Second argument (optional): domain — `customer`, `supplier`, or `admin` (default: ask user)

## Structure Created

```
frontend/web/src/app/features/{{domain}}/{{kebab-name}}/
├── {{kebab-name}}.component.ts    — Thin component (inject store, read, call)
├── {{kebab-name}}.store.ts        — NGRX Signal Store (all logic here)
└── index.ts                       — Barrel export
```

## Store Template ({{kebab-name}}.store.ts)

```typescript
import { computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface {{PascalName}}State {
  loading: boolean;
  error: string | null;
}

const initialState: {{PascalName}}State = {
  loading: false,
  error: null,
};

export const {{PascalName}}Store = signalStore(
  withState(initialState),
  withComputed((store) => ({
    hasError: computed(() => !!store.error()),
  })),
  withMethods((store, http = inject(HttpClient)) => ({
    async load() {
      patchState(store, { loading: true, error: null });
      try {
        // TODO: implement API call
        patchState(store, { loading: false });
      } catch (e) {
        patchState(store, { loading: false, error: (e as Error).message });
      }
    },
  })),
);
```

## Component Template ({{kebab-name}}.component.ts)

```typescript
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { {{PascalName}}Store } from './{{kebab-name}}.store';

@Component({
  selector: 'app-{{kebab-name}}',
  standalone: true,
  imports: [],
  providers: [{{PascalName}}Store],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: block; }
  `,
  template: `
    @if (store.loading()) {
      <p>Loading...</p>
    } @else {
      <!-- TODO: implement template -->
    }
  `,
})
export class {{PascalName}}Component {
  readonly store = inject({{PascalName}}Store);
}
```

## Barrel Export (index.ts)

```typescript
export { {{PascalName}}Component } from './{{kebab-name}}.component';
export { {{PascalName}}Store } from './{{kebab-name}}.store';
```

## Rules (STRICTLY FOLLOW)

1. **Store has ALL logic** — API calls, computations, state transitions
2. **Component is thin** — only `inject(Store)`, read signals, call store methods
3. Store is `providedIn` component (local) unless user says "global"
4. Use `patchState()` for state updates, never mutate directly
5. Use `withComputed()` for derived state
6. Single-file component: inline template + inline SCSS styles
7. OnPush + standalone + no test file
8. Follow FSD: features can import from entities, shared, store, ui — NOT from other features or pages

## After Creation

1. Create all 3 files
2. Tell user the selector and how to use it in a page
3. Suggest adding a route in `app.routes.ts` if appropriate
