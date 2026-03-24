import { Elysia } from 'elysia';
import { openapi } from '@elysiajs/openapi';
import { config } from '../../../config';
import { initTracer, observabilityPlugin } from '@iorder/shared-observability';
import { auth } from './auth';
import { metricsPlugin } from './metrics';

const SERVICE_NAME = 'auth-service';

initTracer({
  serviceName: SERVICE_NAME,
  otlpEndpoint: config.observability.otlpEndpoint,
  isDev: config.isDev,
});

const { port } = config.services.auth;

const app = new Elysia();

if (config.isDev) {
  app.use(
    openapi({
      path: '/api-help',
      documentation: {
        info: {
          title: 'iOrder Market — Auth Service',
          version: '0.0.1',
          description:
            'Authentication microservice powered by Better Auth. Handles sign-up, sign-in, session management, and role-based access.',
        },
        tags: [
          { name: 'Health', description: 'Service health check' },
          { name: 'Auth', description: 'Better Auth endpoints (sign-up, sign-in, sessions)' },
        ],
      },
    }),
  );
}

app
  .use(metricsPlugin)
  .use(observabilityPlugin({ serviceName: SERVICE_NAME }))
  .get(
    '/health',
    () => ({
      status: 'ok',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
    }),
    {
      detail: {
        summary: 'Auth service health check',
        tags: ['Health'],
      },
    },
  )
  .mount(auth.handler)
  .listen(port);

console.log(`Auth Service running at http://localhost:${port}`);
if (config.isDev) console.log(`API Docs at http://localhost:${port}/api-help`);

export type AuthApp = typeof app;
