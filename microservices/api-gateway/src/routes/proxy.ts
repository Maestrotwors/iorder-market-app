import { Elysia } from 'elysia';
import { serviceUrl } from '../../../../config';

const PRODUCTS_URL = serviceUrl('products');
const AUTH_URL = serviceUrl('auth');

/**
 * Generic passthrough proxy — forwards request as-is to the target service.
 * API Gateway only checks auth (via middleware), never validates request body.
 * Validation is the responsibility of each microservice.
 */
function proxyPass(targetBaseUrl: string) {
  return async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    // Strip /api prefix: /api/products/123 -> /products/123
    const path = url.pathname.replace(/^\/api/, '');
    const targetUrl = `${targetBaseUrl}${path}${url.search}`;
    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';

    const res = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: hasBody ? request.body : undefined,
      duplex: 'half',
    });

    return new Response(res.body, {
      status: res.status,
      headers: res.headers,
    });
  };
}

export const proxyRoutes = new Elysia({ prefix: '/api' })
  // ---- Auth — public, no auth check (login/signup/session) ----
  .all('/auth/*', proxyPass(AUTH_URL), {
    detail: {
      summary: 'Auth proxy (public)',
      description: 'Proxies all auth requests to Better Auth service. No auth check required.',
      tags: ['Auth'],
    },
  })

  // ---- Products — proxy everything to products-service ----
  .all('/products/*', proxyPass(PRODUCTS_URL), {
    detail: {
      summary: 'Products proxy',
      description:
        'Proxies all /api/products/* requests to products-service. Validation happens in the microservice.',
      tags: ['Products'],
    },
  })
  .get('/products', proxyPass(PRODUCTS_URL), {
    detail: {
      summary: 'Products list proxy',
      description: 'Proxies GET /api/products to products-service.',
      tags: ['Products'],
    },
  });
