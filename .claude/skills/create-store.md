---
name: create-store
description: Create an NgRx Signal Store — either component-level (local) or global (providedIn root)
user_invocable: true
---

# Create NgRx Signal Store

Create a new NgRx Signal Store.

## Arguments

The user provides the store name and optionally the scope. Parse the arguments:
- First argument: store name (e.g., `product`, `cart`, `auth`)
- Second argument (optional): scope — `local` (component-level) or `global` (providedIn root). Default: `local`
- Third argument (optional): path relative to `frontend/web/src/app/`

If no path is provided, ask the user where to place the store.

## Rules (STRICTLY FOLLOW)

1. Use `signalStore()` from `@ngrx/signals`
2. Use `withState()` for state definition
3. Use `withComputed()` for derived/computed values
4. Use `withMethods()` for actions and side effects
5. Use `patchState()` for immutable state updates
6. Use `withEntities<T>()` from `@ngrx/signals/entities` for entity collections
7. Use `rxMethod()` from `@ngrx/signals/rxjs-interop` for RxJS-based side effects
8. **All logic and computations in the Store** — components only read and call methods
9. Store can inject services (HttpClient, other stores, etc.)
10. Use types from `@iorder/shared-contracts`

## Local Store Template (component-level)

A local store is NOT `providedIn: 'root'`. It is provided at the component level via `providers`.

File name: `{{kebab-name}}.store.ts`

```typescript
import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';

// Define the state interface
interface {{PascalName}}State {
  items: {{ItemType}}[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: {{PascalName}}State = {
  items: [],
  loading: false,
  error: null,
};

export const {{PascalName}}Store = signalStore(
  withState(initialState),
  withComputed((store) => ({
    itemCount: computed(() => store.items().length),
    hasError: computed(() => !!store.error()),
  })),
  withMethods((store) => ({
    setItems(items: {{ItemType}}[]) {
      patchState(store, { items, loading: false, error: null });
    },
    setLoading() {
      patchState(store, { loading: true, error: null });
    },
    setError(error: string) {
      patchState(store, { loading: false, error });
    },
    reset() {
      patchState(store, initialState);
    },
  }))
);
```

Usage in component:
```typescript
@Component({
  // ...
  providers: [{{PascalName}}Store],
})
export class {{PascalName}}Component {
  readonly store = inject({{PascalName}}Store);
}
```

## Global Store Template (providedIn root)

A global store uses `{ providedIn: 'root' }` and is a singleton across the app.

File name: `{{kebab-name}}.store.ts`

```typescript
import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  withHooks,
  patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// Define the state interface
interface {{PascalName}}State {
  data: {{DataType}} | null;
  loading: boolean;
  error: string | null;
}

const initialState: {{PascalName}}State = {
  data: null,
  loading: false,
  error: null,
};

export const {{PascalName}}Store = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isReady: computed(() => !!store.data() && !store.loading()),
    hasError: computed(() => !!store.error()),
  })),
  withMethods((store, http = inject(HttpClient)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          http.get<{{DataType}}>('/api/{{endpoint}}').pipe(
            tap({
              next: (data) => patchState(store, { data, loading: false }),
              error: (err) =>
                patchState(store, {
                  loading: false,
                  error: err.message,
                }),
            })
          )
        )
      )
    ),
    reset() {
      patchState(store, initialState);
    },
  })),
  withHooks({
    onInit(store) {
      // Auto-load on init if needed:
      // store.load();
    },
  })
);
```

## Entity Store Template (for collections)

When the store manages a collection of entities, use `withEntities`:

```typescript
import { computed, inject } from '@angular/core';
import { signalStore, withComputed, withMethods, patchState } from '@ngrx/signals';
import {
  withEntities,
  addEntity,
  addEntities,
  updateEntity,
  removeEntity,
  setEntities,
} from '@ngrx/signals/entities';
import type { IProduct } from '@iorder/shared-contracts';

export const ProductStore = signalStore(
  withEntities<IProduct>(),
  withComputed((store) => ({
    totalProducts: computed(() => store.entities().length),
    isEmpty: computed(() => store.entities().length === 0),
  })),
  withMethods((store) => ({
    setProducts(products: IProduct[]) {
      patchState(store, setEntities(products));
    },
    addProduct(product: IProduct) {
      patchState(store, addEntity(product));
    },
    removeProduct(id: string) {
      patchState(store, removeEntity(id));
    },
    updateProduct(id: string, changes: Partial<IProduct>) {
      patchState(store, updateEntity({ id, changes }));
    },
  }))
);
```

## Global User Store (reference)

The global user store at `frontend/web/src/app/core/stores/auth.store.ts` holds:
- Current user info (`IUser | null`)
- Authentication state (`isAuthenticated`, `userRole`)
- Login/logout methods
- Token management

All components that need user info should inject this store.

## Conventions

- File name: `{{kebab-name}}.store.ts`
- Store name: `{{PascalName}}Store`
- Place local stores next to the component that uses them
- Place global stores in `frontend/web/src/app/core/stores/`
- Use types from `@iorder/shared-contracts` for state interfaces
- Always define an `initialState` const
- Always define a state interface

## After Creation

1. Create the store file
2. If local — remind to add it to component's `providers` array
3. If global — it's auto-provided via `providedIn: 'root'`
4. Tell the user the file path and store name
