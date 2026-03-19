/**
 * iOrder Market — Central Configuration
 *
 * Single source of truth for ports, URLs, and service settings.
 * All microservices and apps import from here.
 * Values can be overridden via environment variables (K8s, Docker, .env).
 */

export const config = {
  services: {
    apiGateway: {
      port: Number(process.env['API_GATEWAY_PORT']) || 3000,
      host: process.env['API_GATEWAY_HOST'] || 'localhost',
    },
    products: {
      port: Number(process.env['PRODUCTS_SERVICE_PORT']) || 3001,
      host: process.env['PRODUCTS_SERVICE_HOST'] || 'localhost',
    },
    auth: {
      port: Number(process.env['AUTH_SERVICE_PORT']) || 3002,
      host: process.env['AUTH_SERVICE_HOST'] || 'localhost',
    },
  },

  apps: {
    web: {
      port: Number(process.env['WEB_PORT']) || 4200,
    },
    admin: {
      port: Number(process.env['ADMIN_PORT']) || 4201,
    },
  },

  database: {
    url:
      process.env['DATABASE_URL'] || 'postgresql://iorder:iorder_secret@localhost:5432/iorder_db',
  },

  redpanda: {
    brokers: (process.env['REDPANDA_BROKERS'] || 'localhost:19092').split(','),
  },

  jwt: {
    secret: process.env['JWT_SECRET'] || 'dev-secret-change-in-production',
    expiration: Number(process.env['JWT_EXPIRATION']) || 3600,
  },

  cors: {
    get origins() {
      return [
        `http://localhost:${config.apps.web.port}`,
        `http://localhost:${config.apps.admin.port}`,
      ];
    },
  },
} as const;

/** Build full URL for a service */
export function serviceUrl(service: keyof typeof config.services): string {
  const { host, port } = config.services[service];
  return `http://${host}:${port}`;
}
