import { Elysia } from 'elysia';
import { openapi } from '@elysiajs/openapi';
import { config } from '../../../config';
import { initTracer, observabilityPlugin } from '@iorder/shared-observability';
import { productRoutes } from './routes/products';
import { metricsPlugin } from './metrics';
import { initProducer } from './producer';
import * as z from 'zod';

const SERVICE_NAME = 'products-service';

initTracer({
  serviceName: SERVICE_NAME,
  otlpEndpoint: config.observability.otlpEndpoint,
  isDev: config.isDev,
});

const { port } = config.services.products;

const app = new Elysia();

if (config.isDev) {
  app.use(
    openapi({
      path: '/api-help',
      documentation: {
        info: {
          title: 'iOrder Market — Products Service',
          version: '0.0.1',
          description:
            'Microservice for product catalog management: CRUD operations, search, filtering, and pagination.',
        },
        tags: [
          { name: 'Health', description: 'Service health check' },
          { name: 'Products', description: 'Product catalog operations' },
        ],
      },
      mapJsonSchema: {
        zod: z.toJSONSchema,
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
      service: 'products-service',
      timestamp: new Date().toISOString(),
    }),
    {
      detail: {
        summary: 'Products service health check',
        tags: ['Health'],
      },
    },
  )
  .use(productRoutes);

initProducer().catch((err) => console.warn('RedPanda producer init failed (non-critical):', err));

app.listen(port);

console.log(`Products Service running at http://localhost:${port}`);
if (config.isDev) console.log(`API Docs at http://localhost:${port}/api-help`);

export type ProductsApp = typeof app;
