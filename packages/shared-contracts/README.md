# @iorder/shared-contracts

Shared types, DTOs, and API contracts used by both frontend and backend.

## Contents
- `enums/` — UserRole, OrderStatus, PaymentStatus
- `types/` — IUser, IProduct, IOrder, ICart, INotification, ApiResponse, SSEEvent
- `dto/` — Zod schemas for validation (LoginSchema, CreateProductSchema, CreateOrderSchema)
- `events/` — RedPanda event topics and payload types

## Usage

```typescript
import { IProduct, CreateProductSchema, EventTopics } from '@iorder/shared-contracts';
```
