import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { config } from '../../../config';
import { healthRoutes } from './routes/health';
import { proxyRoutes } from './routes/proxy';

const { port } = config.services.apiGateway;

const app = new Elysia()
  .use(cors({
    origin: config.cors.origins,
    credentials: true,
  }))
  .use(healthRoutes)
  .use(proxyRoutes)
  .listen(port);

console.log(`API Gateway running at http://localhost:${port}`);

export type App = typeof app;
