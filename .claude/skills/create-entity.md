---
name: create-entity
description: Create an FSD entity with TypeScript types, optional NGRX entity store, and barrel export
user_invocable: true
---

# Create FSD Entity

Create a Feature-Sliced Design entity — a business object with types and optional store.

## Arguments

Parse the arguments:
- First argument: entity name (e.g., `product`, `order`, `user`, `cart-item`)
- Second argument (optional): `with-store` — also create an entity store (default: types only)

## Structure Created

### Types only (default)

```
frontend/web/src/app/entities/{{kebab-name}}/
├── {{kebab-name}}.types.ts     — TypeScript interfaces/types
└── index.ts                    — Barrel export
```

### With store (`with-store`)

```
frontend/web/src/app/entities/{{kebab-name}}/
├── {{kebab-name}}.types.ts     — TypeScript interfaces/types
├── {{kebab-name}}.store.ts     — NGRX Signal Store for entity collection
└── index.ts                    — Barrel export
```

## Types Template ({{kebab-name}}.types.ts)

Prefer re-exporting from shared-contracts when the type exists there:

```typescript
// Re-export shared contract types for frontend consumption
export type { I{{PascalName}} } from '@iorder/shared-contracts';

// Frontend-specific types (not in shared contracts)
export interface {{PascalName}}ViewModel {
  // Add frontend-specific fields here
}
```

If the type doesn't exist in shared-contracts, define it locally:

```typescript
export interface I{{PascalName}} {
  id: string;
  // TODO: define entity fields
  createdAt: Date;
  updatedAt: Date;
}
```

## Entity Store Template ({{kebab-name}}.store.ts)

For entity collections, use `withEntities` from `@ngrx/signals/entities`:

```typescript
import { computed } from '@angular/core';
import { signalStore, withMethods, withComputed, patchState } from '@ngrx/signals';
import { withEntities, setAllEntities, addEntity, removeEntity, updateEntity } from '@ngrx/signals/entities';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { I{{PascalName}} } from './{{kebab-name}}.types';

export const {{PascalName}}Store = signalStore(
  { providedIn: 'root' },
  withEntities<I{{PascalName}}>(),
  withComputed(({ entities }) => ({
    count: computed(() => entities().length),
  })),
  withMethods((store, http = inject(HttpClient)) => ({
    async loadAll() {
      // TODO: implement API call
      // const res = await firstValueFrom(http.get<ApiResponse<I{{PascalName}}[]>>('/api/{{kebab-name}}s'));
      // patchState(store, setAllEntities(res.data));
    },
    add(entity: I{{PascalName}}) {
      patchState(store, addEntity(entity));
    },
    remove(id: string) {
      patchState(store, removeEntity(id));
    },
  })),
);
```

## Barrel Export (index.ts)

```typescript
export type { I{{PascalName}} } from './{{kebab-name}}.types';
// If store exists:
// export { {{PascalName}}Store } from './{{kebab-name}}.store';
```

## Rules (STRICTLY FOLLOW)

1. **Entities are business objects** — Product, Order, User, CartItem, Address
2. **Entity layer has NO UI** — only types, stores, and pure logic
3. **Re-export from shared-contracts** when the interface exists there (DRY)
4. Entity stores are typically `providedIn: 'root'` (global, shared across features)
5. Use `withEntities<T>()` for collection management
6. FSD: entities can import from shared and @iorder/* — NOT from features, widgets, or pages
7. Create `frontend/web/src/app/entities/` directory if it doesn't exist

## After Creation

1. Create files in `frontend/web/src/app/entities/{{kebab-name}}/`
2. Ensure `entities/` directory exists (create if needed)
3. Tell user how to import: `import { I{{PascalName}} } from '@entities/{{kebab-name}}'`
4. Suggest which features might use this entity
