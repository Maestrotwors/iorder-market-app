---
name: create-component
description: Create a new Angular 21 single-file standalone component with inline template, inline styles, and OnPush change detection
user_invocable: true
---

# Create Angular Component

Create a new Angular 21 single-file standalone component.

## Arguments

The user provides the component name and optionally the path. Parse the arguments:
- First argument: component name (e.g., `product-card`, `order-list`)
- Second argument (optional): path relative to `frontend/web/src/app/` (e.g., `domains/customer/catalog`)

If no path is provided, ask the user where to place the component.

## Rules (STRICTLY FOLLOW)

Every component MUST be:
1. **Single-file** — template, styles, and logic in ONE `.ts` file (inline `template` and `styles`)
2. **Standalone** — `standalone: true` (no NgModules)
3. **OnPush** — `changeDetection: ChangeDetectionStrategy.OnPush`
4. **Zoneless-compatible** — use Signals for all reactivity
5. **No test file** — do not create `.spec.ts`
6. **No separate HTML/SCSS files** — everything is inline
7. **SCSS** for inline styles

## Component Template

```typescript
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';

@Component({
  selector: 'app-{{kebab-name}}',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
  `,
  template: `
    <div>
      <!-- TODO: implement template -->
    </div>
  `,
})
export class {{PascalName}}Component {
  // Inject store if needed:
  // readonly store = inject(SomeStore);

  // Local signals:
  // readonly isLoading = signal(false);

  // Computed:
  // readonly displayName = computed(() => ...);
}
```

## Conventions

- Selector prefix: `app-`
- File name: `{{kebab-name}}.component.ts`
- Class name: `{{PascalName}}Component`
- Use `inject()` for DI, never constructor injection
- Use `signal()`, `computed()`, `input()`, `output()` — never decorators
- Use `input.required()` for mandatory inputs
- Use `model()` for two-way binding
- Components are thin — inject Store, read data, call store methods. No business logic.
- Use new control flow: `@if`, `@for`, `@switch`, `@defer`

## After Creation

1. Create the component file
2. Tell the user the file path and component selector
3. Remind to add it to the appropriate route or parent component if needed
