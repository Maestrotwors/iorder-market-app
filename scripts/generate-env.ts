/**
 * Generates .env files from config/ports.json (single source of truth).
 *
 * Usage: bun scripts/generate-env.ts
 *
 * Outputs:
 *   .env.db     — for docker-compose.db.yml (PostgreSQL)
 *   .env        — for local dev (ports only, hosts = localhost)
 *   .env.docker — for docker-compose services (hosts = service names)
 */

import ports from '../config/ports.json';

const { postgresql, redpanda, redpandaConsole } = ports.infrastructure;
const { services, apps, kubernetes } = ports;

// .env.db — PostgreSQL container
const envDb = `# Auto-generated from config/ports.json — do not edit manually
POSTGRES_DB=${postgresql.database}
POSTGRES_USER=${postgresql.username}
POSTGRES_PASSWORD=${postgresql.password}
DB_PORT=${postgresql.port}
`;

// .env — local dev (no HOST overrides, config/index.ts defaults to localhost)
const envLocal = `# Auto-generated from config/ports.json — do not edit manually
# Hosts default to localhost (see config/index.ts)

# Service ports
API_GATEWAY_PORT=${services.apiGateway.port}
PRODUCTS_SERVICE_PORT=${services.products.port}
AUTH_SERVICE_PORT=${services.auth.port}

# App ports
WEB_PORT=${apps.web.port}
ADMIN_PORT=${apps.admin.port}

# PostgreSQL (localhost for local dev)
DATABASE_URL=postgresql://${postgresql.username}:${postgresql.password}@localhost:${postgresql.port}/${postgresql.database}

# RedPanda
REDPANDA_BROKERS=localhost:${redpanda.kafka}
REDPANDA_KAFKA_PORT=${redpanda.kafka}
REDPANDA_SCHEMA_PORT=${redpanda.schemaRegistry}
REDPANDA_PROXY_PORT=${redpanda.restProxy}
REDPANDA_CONSOLE_PORT=${redpandaConsole.port}

# Kubernetes
FRONTEND_NODE_PORT=${kubernetes.frontendNodePort}
`;

// .env.docker — for docker-compose services (hosts = service names)
const envDocker = `# Auto-generated from config/ports.json — do not edit manually
# Used by: docker-compose.yml services

RUNTIME=docker

API_GATEWAY_HOST=${services.apiGateway.host}
API_GATEWAY_PORT=${services.apiGateway.port}
PRODUCTS_SERVICE_HOST=${services.products.host}
PRODUCTS_SERVICE_PORT=${services.products.port}
AUTH_SERVICE_HOST=${services.auth.host}
AUTH_SERVICE_PORT=${services.auth.port}

DATABASE_HOST=${postgresql.host}
DATABASE_PORT=${postgresql.port}
DATABASE_NAME=${postgresql.database}
DATABASE_USERNAME=${postgresql.username}
DATABASE_PASSWORD=${postgresql.password}
DATABASE_URL=postgresql://${postgresql.username}:${postgresql.password}@${postgresql.host}:${postgresql.port}/${postgresql.database}

REDPANDA_BROKERS=${redpanda.host}:${redpanda.kafka}
`;

await Bun.write('.env.db', envDb);
await Bun.write('.env', envLocal);
await Bun.write('.env.docker', envDocker);

console.log('Generated:');
console.log('  .env        — Local dev (hosts = localhost)');
console.log('  .env.db     — PostgreSQL container');
console.log('  .env.docker — Docker Compose services (hosts = service names)');
