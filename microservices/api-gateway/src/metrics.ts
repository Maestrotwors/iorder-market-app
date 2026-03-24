import { Elysia } from 'elysia';
import { Registry, collectDefaultMetrics, Counter, Histogram } from 'prom-client';

const register = new Registry();

collectDefaultMetrics({ register });

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status_code'] as const,
  registers: [register],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path', 'status_code'] as const,
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

export const metricsPlugin = new Elysia({ name: 'metrics' })
  .onBeforeHandle(({ store }) => {
    (store as Record<string, number>).startTime = performance.now();
  })
  .onAfterResponse(({ request, store, set }) => {
    const duration = (performance.now() - (store as Record<string, number>).startTime) / 1000;
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/metrics' || path === '/health') return;

    const method = request.method;
    const statusCode = String(set.status ?? 200);

    httpRequestsTotal.inc({ method, path, status_code: statusCode });
    httpRequestDuration.observe({ method, path, status_code: statusCode }, duration);
  })
  .get('/metrics', async () => {
    const metrics = await register.metrics();
    return new Response(metrics, {
      headers: { 'Content-Type': register.contentType },
    });
  });
