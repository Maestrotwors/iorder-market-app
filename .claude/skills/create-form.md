---
name: create-form
description: Create an Angular Signal Form using @angular/forms/signals — all forms in this project MUST use Signal Forms, never Reactive Forms
user_invocable: true
---

# Create Angular Signal Form

Create an Angular Signal Form. **All forms in this project use Signal Forms exclusively. Never use Reactive Forms (FormBuilder, FormGroup, FormControl, Validators).**

## Arguments

The user describes what form they need. Parse the context:
- What entity/action the form is for (e.g., login, product creation, address editing)
- Where to add it (existing component, new component, store)
- What fields are needed

## Rules (STRICTLY FOLLOW)

1. **Signal Forms ONLY** — use `form()` and `FormField` from `@angular/forms/signals`
2. **NEVER use Reactive Forms** — no `FormBuilder`, `FormGroup`, `FormControl`, `Validators`
3. Form model is a `signal()` with the data shape
4. `form()` wraps the signal to create a reactive form
5. `[formField]` directive binds fields in the template
6. `FormField` must be added to the component's `imports` array
7. Form state is fully reactive via signals — no subscribe/unsubscribe

## Core API

```typescript
import { signal } from '@angular/core';
import { form, FormField, required, email, submit, debounce } from '@angular/forms/signals';

// 1. Define model as signal (NEVER use null — only '', 0, [], false)
readonly model = signal({ email: '', password: '' });

// 2. Create form with schema function (validators as second arg)
readonly myForm = form(this.model, (field) => {
  required(field.email, { message: 'Email is required' });
  email(field.email, { message: 'Enter a valid email' });
  debounce(field.email, 500);
  required(field.password, { message: 'Password is required' });
});

// 3. Access controls in template
// <input [formField]="myForm.controls.email" />

// 4. Check validity — call field as FUNCTION, then call flags as FUNCTION
// myForm.controls.email().valid()   — ✅ correct
// myForm.controls.email.valid       — ❌ WRONG

// 5. Submit — callback MUST be async
onSubmit(event: Event) {
  event.preventDefault();
  submit(this.myForm, {
    action: async () => {
      await this.store.login(this.model());
    },
  });
}
```

**CRITICAL rules:**

| Rule | Wrong | Correct |
|------|-------|---------|
| Never `null` in model | `signal({ x: null })` | `signal({ x: '' })` |
| Field flags are functions | `form.field.valid` | `form.field().valid()` |
| No native attrs with `[formField]` | `[formField]="f" [disabled]="x"` | Use `disabled()` from signals |
| `submit()` must be async | `submit(f, { action: () => {} })` | `submit(f, { action: async () => {} })` |

Available validators: `required`, `email`, `min`, `max`, `minLength`, `maxLength`, `pattern`
Available modifiers: `disabled`, `hidden`, `readonly`, `debounce`, `applyWhen`, `applyEach`, `metadata`
Async: `validate`, `validateAsync` (requires `onError`), `validateHttp`, `validateStandardSchema`

## Patterns

### Simple Form with Validation

```typescript
readonly loginModel = signal({ email: '', password: '' });
readonly loginForm = form(this.loginModel, (field) => {
  required(field.email);
  email(field.email);
  required(field.password);
});

onSubmit(event: Event) {
  event.preventDefault();
  submit(this.loginForm, {
    action: async () => {
      await this.store.login(this.loginModel());
    },
  });
}
```

```html
<form (submit)="onSubmit($event)">
  <input type="email" [formField]="loginForm.controls.email" />
  <input type="password" [formField]="loginForm.controls.password" />
  <button type="submit">Sign In</button>
</form>
```

### Form with Multiple Field Types

```typescript
readonly productModel = signal({
  name: '',
  price: 0,
  description: '',
  category: '',
  inStock: true,
});
readonly productForm = form(this.productModel, (field) => {
  required(field.name);
  min(field.price, 0);
  required(field.category);
});
```

```html
<input type="text" [formField]="productForm.controls.name" />
<input type="number" [formField]="productForm.controls.price" />
<textarea [formField]="productForm.controls.description"></textarea>
<select [formField]="productForm.controls.category">
  <option value="food">Food</option>
  <option value="drinks">Drinks</option>
</select>
<input type="checkbox" [formField]="productForm.controls.inStock" />
```

### Nested Object

```typescript
readonly orderModel = signal({
  comment: '',
  address: { street: '', city: '', zipCode: '' },
});
readonly orderForm = form(this.orderModel, (field) => {
  required(field.address.street);
  required(field.address.city);
  required(field.address.zipCode);
});
```

```html
<input [formField]="orderForm.controls.comment" />
<input [formField]="orderForm.controls.address.controls.street" />
<input [formField]="orderForm.controls.address.controls.city" />
<input [formField]="orderForm.controls.address.controls.zipCode" />
```

### Form with Loading State (via Store)

```typescript
readonly store = inject(SomeStore);
readonly model = signal({ query: '' });
readonly searchForm = form(this.model, (field) => {
  required(field.query);
});

onSearch(event: Event) {
  event.preventDefault();
  submit(this.searchForm, {
    action: async () => {
      await this.store.search(this.model().query);
    },
  });
}
```

```html
<form (submit)="onSearch($event)">
  <input [formField]="searchForm.controls.query" />
  <button [disabled]="store.loading()">
    @if (store.loading()) { Searching... } @else { Search }
  </button>
</form>
```

### Form with Backend Data (linkedSignal + disabled during loading)

```typescript
readonly resource = httpResource<MyModel>(() => `/api/data/${this.id()}`);
private readonly formModel = linkedSignal({
  source: this.resource.value,
  computation: (data) => data ? toFormModel(data) : EMPTY_MODEL,
});
protected readonly myForm = form(this.formModel, (field) => {
  disabled(field, () => this.resource.isLoading());
  required(field.name);
});
```

### Reset Form

```typescript
readonly initialData = { name: '', email: '' };
readonly model = signal({ ...this.initialData });
readonly myForm = form(this.model);

resetForm() {
  this.model.set({ ...this.initialData });
}
```

### Pre-fill Form (edit mode)

```typescript
readonly model = signal({ name: '', price: 0, description: '' });
readonly editForm = form(this.model);

loadProduct(product: IProduct) {
  this.model.set({
    name: product.name,
    price: product.price,
    description: product.description,
  });
}
```

## Conventions

- Form model signal: `{{camelName}}Model`
- Form instance: `{{camelName}}Form`
- Submit: use `submit()` from `@angular/forms/signals` — it runs only when form is valid
- Submit delegates to Store — no HTTP calls in the component
- Use types from `@iorder/shared-contracts` for model shape when applicable
- Always add `FormField` to the component's `imports` array

## Checklist

1. Add `import { form, FormField, required, submit, ... } from '@angular/forms/signals'`
2. Add `FormField` to component `imports: [FormField]`
3. Create model signal with the data shape (no `null` values!)
4. Create form with `form(this.model, (field) => { ...validators })` schema function
5. Bind fields in template with `[formField]`
6. Handle submit with `submit(form, { action: async () => {} })`
7. Delegate action to Store
