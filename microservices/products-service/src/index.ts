import { Elysia } from 'elysia';
import { config } from '../../../config';
import { productRoutes } from './routes/products';

const { port } = config.services.products;

const app = new Elysia()
  .get('/health', () => ({
    status: 'ok',
    service: 'products-service',
    timestamp: new Date().toISOString(),
  }))
  .use(productRoutes)
  .listen(port);

console.log(`Products Service running at http://localhost:${port}`);

export type ProductsApp = typeof app;
