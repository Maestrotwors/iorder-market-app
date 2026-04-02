import { Elysia } from 'elysia';

const app = new Elysia().get('/api/health', () => ({ status: 'ok' })).listen(3000);

console.log(`iorder-main is running at http://localhost:${app.server?.port}`);

export type App = typeof app;
