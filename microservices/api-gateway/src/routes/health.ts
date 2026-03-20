import { Elysia } from 'elysia';

export const healthRoutes = new Elysia({ prefix: '/api' }).get(
  '/health',
  () => ({
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
  }),
  {
    detail: {
      summary: 'API Gateway health check',
      tags: ['Health'],
    },
  },
);
