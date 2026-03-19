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
import { form, FormField } from '@angular/forms/signals';

// 1. Define model as signal
readonly model = signal({ email: '', password: '' });

// 2. Create form from model
readonly myForm = form(this.model);

// 3. Access controls in template
// <input [formField]="myForm.controls.email" />

// 4. Check validity
// myForm.valid()       — boolean signal
// myForm.dirty()       — boolean signal
// myForm.touched()     — boolean signal

// 5. Read current value
// this.model()         — { email: string, password: string }
```

## Patterns

### Simple Form

```typescript
readonly loginModel = signal({ email: '', password: '' });
readonly loginForm = form(this.loginModel);

onSubmit() {
  if (!this.loginForm.valid()) return;
  const { email, password } = this.loginModel();
  this.store.login(email, password);
}
```

```html
<form (ngSubmit)="onSubmit()">
  <input type="email" [formField]="loginForm.controls.email" />
  <input type="password" [formField]="loginForm.controls.password" />
  <button type="submit" [disabled]="!loginForm.valid()">Sign In</button>
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
readonly productForm = form(this.productModel);
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
  address: {
    street: '',
    city: '',
    zipCode: '',
  },
});
readonly orderForm = form(this.orderModel);
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
readonly searchForm = form(this.model);

onSearch() {
  if (!this.searchForm.valid()) return;
  this.store.search(this.model().query);
}
```

```html
<form (ngSubmit)="onSearch()">
  <input [formField]="searchForm.controls.query" />
  <button [disabled]="store.loading()">
    @if (store.loading()) { Searching... } @else { Search }
  </button>
</form>
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
- Submit method: `onSubmit()` or `on{{Action}}()` (e.g., `onSearch()`, `onSave()`)
- Always check `form.valid()` before submit
- Submit delegates to Store — no HTTP calls in the component
- Use types from `@iorder/shared-contracts` for model shape when applicable
- Always add `FormField` to the component's `imports` array

## Checklist

1. Add `import { form, FormField } from '@angular/forms/signals'`
2. Add `FormField` to component `imports: [FormField]`
3. Create model signal with the data shape
4. Create form instance with `form(this.model)`
5. Bind fields in template with `[formField]`
6. Handle submit with validity check
7. Delegate action to Store
