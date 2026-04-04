import { Elysia } from 'elysia';
import { config } from '@iorder/config';

const app = new Elysia()
  .get('/api/health', () => ({ status: 'ok' }))
  .listen(config.ports.iorderMain);

console.log(`iorder-main is running at http://${config.hosts.iorderMain}:${app.server?.port}`);

export type App = typeof app;
