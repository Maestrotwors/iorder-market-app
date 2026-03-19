import { Elysia } from 'elysia';
import { config } from '../../../config';
import { auth } from './auth';

const { port } = config.services.auth;

const app = new Elysia()
  .get('/health', () => ({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  }))
  .mount(auth.handler)
  .listen(port);

console.log(`Auth Service running at http://localhost:${port}`);

export type AuthApp = typeof app;
