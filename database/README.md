# iOrder Database

PostgreSQL database with Prisma ORM and WAL-based Change Data Capture.

## Schema
Defined in `prisma/schema.prisma`. Main entities:
- User, SupplierProfile
- Category, Product
- Order, OrderItem
- Cart, CartItem
- Payment
- Notification
- AuditLog (CDC)

## Commands

```bash
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations
npm run db:push        # Push schema changes (dev)
npm run db:studio      # Open Prisma Studio GUI
```

## WAL / CDC Pipeline

```
PostgreSQL WAL → CDC Connector → RedPanda Topics → Consumer Services
```

Setup script: `scripts/setup-wal.sql`
