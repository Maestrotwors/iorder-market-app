# @iorder/shared-logic

Business logic shared between Angular web app and future Ionic mobile apps.

## Contents
- `utils/price.utils` — formatPrice, calculateTotalWithTax, applyDiscount
- `utils/order.utils` — canCancelOrder, isValidStatusTransition, getOrderStatusLabel
- `validators/` — isValidEmail, isStrongPassword, isValidPhone

## Usage

```typescript
import { formatPrice, canCancelOrder, isValidEmail } from '@iorder/shared-logic';
```
