# iOrder Market

E-commerce platform with microservices architecture.

## Architecture

- **Frontend**: Angular 21 (web + admin panels)
- **Backend**: ElysiaJS microservices on Bun runtime
- **Database**: PostgreSQL + Prisma ORM
- **Message Broker**: RedPanda (Kafka-compatible)
- **Real-time**: SSE (buyer/supplier), WebSockets (admin)
- **Future**: Ionic mobile apps sharing components with web

## Project Structure

```
├── apps/
│   ├── web/                       # Angular — buyer & supplier portal
│   ├── admin/                     # Angular — admin panel (WebSockets)
│   └── mobile/                    # (future) Ionic mobile apps
├── microservices/
│   ├── api-gateway/               # ElysiaJS — entry point, proxy, SSE
│   └── products-service/          # ElysiaJS — products CRUD
├── packages/
│   ├── shared-contracts/          # DTOs, types, API contracts (shared!)
│   ├── shared-logic/              # Business logic (web + mobile)
│   └── shared-ui/                 # Angular components (web + mobile)
├── database/
│   └── prisma/                    # Schema, migrations, seeds
└── infrastructure/
    ├── docker/                    # Docker Compose
    ├── ci-cd/                     # GitHub Actions
    └── redpanda/                  # Message broker config
```

## Shared Types (Frontend + Backend)

The same TypeScript types from `@iorder/shared-contracts` are used in both:

- **ElysiaJS routes** (backend) — return `PaginatedResponse<IProduct>`
- **Angular services** (frontend) — consume `PaginatedResponse<IProduct>`

## Quick Start

```bash
# 1. Install dependencies
npm install
cd microservices/api-gateway && bun install
cd microservices/products-service && bun install

# 2. Start infrastructure (PostgreSQL + RedPanda)
npm run docker:up

# 3. Generate Prisma client and run migrations
npm run db:generate
npm run db:migrate

# 4. Start microservices
npm run start:gateway     # ElysiaJS on Bun — port 3000
npm run start:products    # ElysiaJS on Bun — port 3001

# 5. Start web app
npm run start:web         # Angular — port 4200
```

## Claude Agents

| Agent | Command | Responsibility |
|-------|---------|----------------|
| Frontend | `/frontend` | Angular apps, shared UI, Ionic prep |
| Backend | `/backend` | ElysiaJS microservices on Bun |
| Database | `/database` | Prisma, migrations, WAL/CDC |
| DevOps | `/devops` | Docker, CI/CD, infrastructure |

## Communication Pattern

```
Client (HTTP request) → API Gateway (ElysiaJS) → fetch → Microservice (ElysiaJS)
                     ← JSON response (typed via shared-contracts) ←──────┘
```

- **Buyer/Supplier**: HTTP + SSE (lightweight, auto-reconnect)
- **Admin**: HTTP + WebSockets (bidirectional, real-time control)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 21, Signals, Standalone Components |
| Backend | ElysiaJS, Bun runtime |
| Database | PostgreSQL 16, Prisma 6 |
| Messaging | RedPanda (Kafka-compatible) |
| Validation | Zod |
| Monorepo | Nx |
| CI/CD | GitHub Actions |
| Containers | Docker Compose |
