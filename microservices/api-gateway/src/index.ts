import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { config } from '../../../config';
import { healthRoutes } from './routes/health';
import { proxyRoutes } from './routes/proxy';
import { apiHelpRoutes } from './routes/api-help';

const { port } = config.services.apiGateway;

const app = new Elysia()
  .use(
    cors({
      origin: config.cors.origins,
      credentials: true,
    }),
  )
  .get('/', () => ({
    name: 'iOrder Market API',
    version: '0.0.1',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      auth: '/api/auth',
      docs: '/api-help',
    },
  }))
  .use(apiHelpRoutes)
  .use(healthRoutes)
  .use(proxyRoutes)
  .listen(port);

console.log(`API Gateway running at http://localhost:${port}`);
console.log(`API Docs at http://localhost:${port}/api-help`);

export type App = typeof app;
