import { Elysia } from 'elysia';
import type { ApiResponse, PaginatedResponse, IProduct } from '@iorder/shared-contracts';
import { serviceUrl } from '../../../../config';

const PRODUCTS_URL = serviceUrl('products');

export const proxyRoutes = new Elysia({ prefix: '/api' })
  .get('/products', async ({ query }) => {
    const params = new URLSearchParams(query as Record<string, string>);
    const res = await fetch(`${PRODUCTS_URL}/products?${params}`);
    return res.json() as Promise<PaginatedResponse<IProduct>>;
  })
  .get('/products/:id', async ({ params }) => {
    const res = await fetch(`${PRODUCTS_URL}/products/${params.id}`);
    return res.json() as Promise<ApiResponse<IProduct>>;
  });
