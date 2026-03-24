---
name: create-microservice
description: Create a new ElysiaJS microservice with standard structure, health check, metrics, and observability
user_invocable: true
---

# Create ElysiaJS Microservice

Create a new ElysiaJS microservice following the established patterns of the iOrder project.

## Arguments

The user provides the service name and optionally a description. Parse the arguments:
- First argument: service name (e.g., `orders-service`, `notifications-service`, `payments-service`)
- Second argument (optional): brief description of what the service does

## Rules (STRICTLY FOLLOW)

1. Create the service in `microservices/<service-name>/`
2. Follow the established patterns from existing services (api-gateway, auth-service, products-service)
3. Include health check endpoint (`GET /health`)
4. Include Prometheus metrics (`GET /metrics`)
5. Include observability plugin (OpenTelemetry)
6. Use config from `config/index.ts` for ports and settings
7. Use types from `@iorder/shared-contracts`
8. Run on Bun runtime

## Service Template

### Directory Structure
```
microservices/<service-name>/
├── src/
│   ├── index.ts          # Entry point
│   ├── metrics.ts        # Prometheus metrics plugin
│   └── routes/
│       └── <domain>.ts   # Route handlers
├── package.json
└── tsconfig.json
```

### Entry Point (`src/index.ts`)
```typescript
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import config from '../../../config';
import { observabilityPlugin } from '@iorder/shared-observability';
import { metricsPlugin } from './metrics';

const port = config.services.<serviceName>.port;
const isDev = process.env.NODE_ENV !== 'production';

const app = new Elysia()
  .use(cors({ origin: config.cors.origins, credentials: true }))
  .use(observabilityPlugin({ serviceName: '<service-name>' }))
  .use(metricsPlugin)
  .use(isDev ? openapi() : (app: Elysia) => app)
  .get('/health', () => ({ status: 'ok', service: '<service-name>' }))
  // .use(routes)
  .listen(port);

console.log(`<service-name> running on port ${port}`);
export type App = typeof app;
```

### Metrics Plugin (`src/metrics.ts`)
Copy the pattern from `microservices/products-service/src/metrics.ts`:
- `http_requests_total` counter
- `http_request_duration_seconds` histogram
- `/metrics` endpoint
- Exclude `/metrics` and `/health` from tracking

### package.json
```json
{
  "name": "<service-name>",
  "private": true,
  "dependencies": {
    "elysia": "^1.2.0",
    "@elysiajs/cors": "*",
    "@elysiajs/openapi": "*"
  }
}
```

### tsconfig.json
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*.ts"]
}
```

## After Creation

1. Add the service port to `config/index.ts` → `services` object
2. Add the service port to `config/ports.json`
3. Register the service in `infrastructure/docker/docker-compose.dev.yml`
4. Add proxy route in `microservices/api-gateway/src/routes/`
5. Add Sheriff tags in `sheriff.config.ts` for the new service
6. Add workspace entry in root `knip.json`
7. Update `infrastructure/helm/iorder/templates/` with deployment, service, hpa
8. Tell the user what was created and what manual steps remain
