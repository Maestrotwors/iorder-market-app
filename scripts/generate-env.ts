/**
 * Generates .env files from config/ports.json (single source of truth).
 *
 * Usage: bun scripts/generate-env.ts
 *
 * Outputs:
 *   .env        — local dev (hosts = localhost)
 *   .env.docker — docker-compose.dev.yml (hosts = service names)
 *   .env.test   — docker-compose.test.yml (hosts = service names, test DB)
 */

import ports from '../config/ports.json';

const { postgresql, redis, redpanda, redpandaConsole } = ports.infrastructure;
const { services, apps, kubernetes } = ports;

/** Internal Kafka port for docker network communication (external = redpanda.kafka) */
const KAFKA_INTERNAL_PORT = 9092;

interface EnvOptions {
  runtime?: string;
  nodeEnv: string;
  /** 'localhost' for local dev, 'docker' for container service names */
  hostMode: 'localhost' | 'docker';
  dbName: string;
  jwtSecret: string;
  otelEndpoint: string;
}

function generateEnv(label: string, opts: EnvOptions): string {
  const host = (serviceHost: string) => (opts.hostMode === 'docker' ? serviceHost : 'localhost');

  const dbHost = host(postgresql.host);
  const dbUrl = `postgresql://${postgresql.username}:${postgresql.password}@${dbHost}:${postgresql.port}/${opts.dbName}`;
  const rpBrokers =
    opts.hostMode === 'docker'
      ? `${redpanda.host}:${KAFKA_INTERNAL_PORT}`
      : `localhost:${redpanda.kafka}`;

  const lines: string[] = [
    `# Auto-generated from config/ports.json — do not edit manually`,
    `# Environment: ${label}`,
    '',
  ];

  if (opts.runtime) lines.push(`RUNTIME=${opts.runtime}`);
  lines.push(`NODE_ENV=${opts.nodeEnv}`);

  lines.push('', '# Services');
  lines.push(`API_GATEWAY_HOST=${host(services.apiGateway.host)}`);
  lines.push(`API_GATEWAY_PORT=${services.apiGateway.port}`);
  lines.push(`PRODUCTS_SERVICE_HOST=${host(services.products.host)}`);
  lines.push(`PRODUCTS_SERVICE_PORT=${services.products.port}`);
  lines.push(`AUTH_SERVICE_HOST=${host(services.auth.host)}`);
  lines.push(`AUTH_SERVICE_PORT=${services.auth.port}`);

  lines.push('', '# Apps');
  lines.push(`WEB_PORT=${apps.web.port}`);
  lines.push(`ADMIN_PORT=${apps.admin.port}`);

  lines.push('', '# Database');
  lines.push(`DATABASE_HOST=${dbHost}`);
  lines.push(`DATABASE_PORT=${postgresql.port}`);
  lines.push(`DATABASE_NAME=${opts.dbName}`);
  lines.push(`DATABASE_USERNAME=${postgresql.username}`);
  lines.push(`DATABASE_PASSWORD=${postgresql.password}`);
  lines.push(`DATABASE_URL=${dbUrl}`);
  lines.push(`POSTGRES_DB=${opts.dbName}`);
  lines.push(`POSTGRES_USER=${postgresql.username}`);
  lines.push(`POSTGRES_PASSWORD=${postgresql.password}`);

  lines.push('', '# Redis');
  lines.push(`REDIS_HOST=${host(redis.host)}`);
  lines.push(`REDIS_PORT=${redis.port}`);
  lines.push(`REDIS_PASSWORD=${redis.password}`);
  lines.push(`REDIS_URL=redis://:${redis.password}@${host(redis.host)}:${redis.port}`);

  lines.push('', '# RedPanda');
  lines.push(`REDPANDA_BROKERS=${rpBrokers}`);
  lines.push(`REDPANDA_KAFKA_PORT=${redpanda.kafka}`);
  lines.push(`REDPANDA_SCHEMA_PORT=${redpanda.schemaRegistry}`);
  lines.push(`REDPANDA_PROXY_PORT=${redpanda.restProxy}`);
  lines.push(`REDPANDA_CONSOLE_PORT=${redpandaConsole.port}`);

  lines.push('', '# JWT');
  lines.push(`JWT_SECRET=${opts.jwtSecret}`);
  lines.push(`JWT_EXPIRATION=3600`);

  lines.push('', '# Observability');
  lines.push(`OTEL_EXPORTER_OTLP_ENDPOINT=${opts.otelEndpoint}`);

  lines.push('', '# Kubernetes');
  lines.push(`FRONTEND_NODE_PORT=${kubernetes.frontendNodePort}`);
  lines.push('');

  return lines.join('\n');
}

// --- Generate all env files ---

const envLocal = generateEnv('local dev', {
  nodeEnv: 'development',
  hostMode: 'localhost',
  dbName: postgresql.database,
  jwtSecret: 'dev-secret-change-in-production-at-least-32-chars',
  otelEndpoint: 'http://localhost:4318',
});

const envDocker = generateEnv('docker dev', {
  runtime: 'docker',
  nodeEnv: 'development',
  hostMode: 'docker',
  dbName: postgresql.database,
  jwtSecret: 'dev-secret-change-in-production-at-least-32-chars',
  otelEndpoint: 'http://localhost:4318',
});

const envTest = generateEnv('docker test', {
  runtime: 'docker',
  nodeEnv: 'test',
  hostMode: 'docker',
  dbName: 'iorder_test',
  jwtSecret: 'test-secret-must-be-32-chars-long!!',
  otelEndpoint: 'http://localhost:4318',
});

await Bun.write('.env', envLocal);
await Bun.write('.env.docker', envDocker);
await Bun.write('.env.test', envTest);

console.log('Generated from config/ports.json:');
console.log('  .env        — local dev (hosts = localhost)');
console.log('  .env.docker — Docker Compose dev (hosts = service names)');
console.log('  .env.test   — Docker Compose test (hosts = service names, test DB)');
