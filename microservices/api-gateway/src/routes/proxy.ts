import { Elysia } from 'elysia';
import type { ApiResponse, PaginatedResponse, IProduct } from '@iorder/shared-contracts';
import { serviceUrl } from '../../../../config';

const PRODUCTS_URL = serviceUrl('products');
const AUTH_URL = serviceUrl('auth');

export const proxyRoutes = new Elysia({ prefix: '/api' })
  // ---- Products Health ----
  .get('/products/health', async () => {
    const res = await fetch(`${PRODUCTS_URL}/health`);
    return res.json();
  })

  // ---- Auth Health ----
  .get('/auth/health', async () => {
    const res = await fetch(`${AUTH_URL}/health`);
    return res.json();
  })

  // ---- Products ----
  .get('/products', async ({ query }) => {
    const params = new URLSearchParams(query as Record<string, string>);
    const res = await fetch(`${PRODUCTS_URL}/products?${params}`);
    return res.json() as Promise<PaginatedResponse<IProduct>>;
  })
  .get('/products/:id', async ({ params }) => {
    const res = await fetch(`${PRODUCTS_URL}/products/${params.id}`);
    return res.json() as Promise<ApiResponse<IProduct>>;
  })

  // ---- Auth (Better Auth — full passthrough proxy) ----
  .all('/auth/*', async ({ request }) => {
    const url = new URL(request.url);
    const authPath = url.pathname; // /api/auth/...
    const targetUrl = `${AUTH_URL}${authPath}${url.search}`;

    const res = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      // @ts-expect-error Bun supports duplex for streaming request bodies
      duplex: 'half',
    });

    // Forward response with all headers (especially Set-Cookie)
    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      responseHeaders.append(key, value);
    });

    return new Response(res.body, {
      status: res.status,
      headers: responseHeaders,
    });
  });
