import { Elysia } from 'elysia';
import { trace, SpanKind, SpanStatusCode, type Context as OtelContext } from '@opentelemetry/api';
import { serviceUrl } from '../../../../config';
import { injectTraceContext } from '@iorder/shared-observability';
import { authMiddleware, type AuthUser } from '../middleware/auth';

const PRODUCTS_URL = serviceUrl('products');
const AUTH_URL = serviceUrl('auth');

const proxyTracer = trace.getTracer('api-gateway-proxy');

/**
 * Generic passthrough proxy — forwards request as-is to the target service.
 * For authenticated routes, injects X-User-* headers so microservices
 * can identify the caller without their own auth logic.
 * Propagates W3C trace context (traceparent) to downstream services.
 *
 * @param stripApi - if true, strips /api prefix (default: true).
 *   Set to false for services that expect /api/* paths (e.g. Better Auth with basePath: '/api/auth').
 */
function proxyPass(targetBaseUrl: string, { stripApi = true } = {}) {
  return async ({
    request,
    user,
    store,
  }: {
    request: Request;
    user?: AuthUser;
    store: Record<string, unknown>;
  }) => {
    const url = new URL(request.url);
    const path = stripApi ? url.pathname.replace(/^\/api/, '') : url.pathname;
    const targetUrl = `${targetBaseUrl}${path}${url.search}`;
    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';

    const headers = new Headers(request.headers);

    // Forward authenticated user info via trusted headers
    if (user) {
      headers.set('X-User-Id', user.id);
      headers.set('X-User-Email', user.email);
      headers.set('X-User-Role', user.role);
    }

    // Strip auth headers — microservices trust X-User-* from gateway only
    headers.delete('authorization');

    // Propagate trace context to downstream service
    const parentOtelContext = store.__otelContext as OtelContext | undefined;
    const proxySpan = parentOtelContext
      ? proxyTracer.startSpan(
          `proxy ${request.method} ${path}`,
          { kind: SpanKind.CLIENT, attributes: { 'http.url': targetUrl } },
          parentOtelContext,
        )
      : null;

    if (proxySpan && parentOtelContext) {
      const outgoingCtx = trace.setSpan(parentOtelContext, proxySpan);
      injectTraceContext(outgoingCtx, headers);
    }

    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      duplex: 'half',
    });

    if (proxySpan) {
      proxySpan.setAttributes({ 'http.status_code': res.status });
      if (res.status >= 500) {
        proxySpan.setStatus({ code: SpanStatusCode.ERROR });
      }
      proxySpan.end();
    }

    return new Response(res.body, {
      status: res.status,
      headers: res.headers,
    });
  };
}

export const proxyRoutes = new Elysia({ prefix: '/api' })
  .use(authMiddleware)

  // ---- Auth — public, no auth check (login/signup/session/token) ----
  .all('/auth/*', proxyPass(AUTH_URL, { stripApi: false }), {
    detail: {
      summary: 'Auth proxy (public)',
      description:
        'Proxies all auth requests to Better Auth service including /api/auth/token for JWT. No auth check required.',
      tags: ['Auth'],
    },
  })

  // ---- Products — protected, requires valid JWT ----
  .all('/products/*', proxyPass(PRODUCTS_URL), {
    auth: true,
    detail: {
      summary: 'Products proxy (protected)',
      description:
        'Proxies all /api/products/* requests to products-service. Requires valid JWT in Authorization header.',
      tags: ['Products'],
    },
  })
  .get('/products', proxyPass(PRODUCTS_URL), {
    auth: true,
    detail: {
      summary: 'Products list proxy (protected)',
      description: 'Proxies GET /api/products to products-service. Requires valid JWT.',
      tags: ['Products'],
    },
  });
