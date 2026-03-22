/**
 * iOrder Market — Central Configuration
 *
 * Single source of truth: config/ports.json
 * All ports, hosts, DB settings, and infrastructure config live there.
 *
 * Host resolution:
 *   - Local dev:    localhost (default)
 *   - Docker:       service name from ports.json (via env RUNTIME=docker)
 *   - Kubernetes:   service name from ports.json (via env from ConfigMap)
 */

import ports from './ports.json';

const env = (key: string) => process.env[key];
const envNum = (key: string) => (env(key) ? Number(env(key)) : undefined);

/** In Docker/K8s, use service names. Locally, use localhost. */
const isContainerized = !!env('KUBERNETES_SERVICE_HOST') || env('RUNTIME') === 'docker';
const defaultHost = (serviceHost: string) => (isContainerized ? serviceHost : 'localhost');

export const config = {
  services: {
    apiGateway: {
      port: envNum('API_GATEWAY_PORT') ?? ports.services.apiGateway.port,
      host: env('API_GATEWAY_HOST') ?? defaultHost(ports.services.apiGateway.host),
    },
    products: {
      port: envNum('PRODUCTS_SERVICE_PORT') ?? ports.services.products.port,
      host: env('PRODUCTS_SERVICE_HOST') ?? defaultHost(ports.services.products.host),
    },
    auth: {
      port: envNum('AUTH_SERVICE_PORT') ?? ports.services.auth.port,
      host: env('AUTH_SERVICE_HOST') ?? defaultHost(ports.services.auth.host),
    },
  },

  apps: {
    web: { port: envNum('WEB_PORT') ?? ports.apps.web.port },
    admin: { port: envNum('ADMIN_PORT') ?? ports.apps.admin.port },
  },

  database: {
    host: env('DATABASE_HOST') ?? defaultHost(ports.infrastructure.postgresql.host),
    port: envNum('DATABASE_PORT') ?? ports.infrastructure.postgresql.port,
    name: env('DATABASE_NAME') ?? ports.infrastructure.postgresql.database,
    username: env('DATABASE_USERNAME') ?? ports.infrastructure.postgresql.username,
    password: env('DATABASE_PASSWORD') ?? ports.infrastructure.postgresql.password,
    get url() {
      return (
        env('DATABASE_URL') ??
        `postgresql://${this.username}:${this.password}@${this.host}:${this.port}/${this.name}`
      );
    },
  },

  redpanda: {
    host: env('REDPANDA_HOST') ?? defaultHost(ports.infrastructure.redpanda.host),
    brokers: (
      env('REDPANDA_BROKERS') ??
      `${defaultHost(ports.infrastructure.redpanda.host)}:${ports.infrastructure.redpanda.kafka}`
    ).split(','),
  },

  jwt: {
    secret: env('JWT_SECRET') ?? 'dev-secret-change-in-production',
    expiration: envNum('JWT_EXPIRATION') ?? 3600,
  },

  isDev: (env('NODE_ENV') ?? 'development') !== 'production',

  cors: {
    get origins() {
      const extra = env('CORS_ORIGINS')?.split(',') ?? [];
      return [
        `http://localhost:${config.apps.web.port}`,
        `http://localhost:${config.apps.admin.port}`,
        `http://localhost:${ports.kubernetes.frontendNodePort}`,
        ...extra,
      ];
    },
  },
} as const;

/** Build full URL for a service */
export function serviceUrl(service: keyof typeof config.services): string {
  const { host, port } = config.services[service];
  return `http://${host}:${port}`;
}

/** Re-export ports.json for scripts that need raw values */
export { ports };
