import { Elysia } from 'elysia';
import {
  trace,
  context,
  propagation,
  SpanStatusCode,
  SpanKind,
  type Span,
  type Context as OtelContext,
} from '@opentelemetry/api';
import { createLogger, type Logger } from './logger';

export interface ObservabilityPluginConfig {
  serviceName: string;
  /** Paths to exclude from tracing/logging (default: /metrics, /health) */
  ignorePaths?: string[];
}

/**
 * Header getter for extracting W3C trace context from incoming requests.
 */
const headerGetter = {
  get(carrier: Headers, key: string): string | undefined {
    return carrier.get(key) ?? undefined;
  },
  keys(_carrier: Headers): string[] {
    return [];
  },
};

/**
 * Header setter for injecting W3C trace context into outgoing requests.
 */
export const headerSetter = {
  set(carrier: Headers, key: string, value: string): void {
    carrier.set(key, value);
  },
};

/**
 * Elysia plugin that adds structured JSON logging and OpenTelemetry tracing.
 *
 * - Creates a span per HTTP request (SERVER kind)
 * - Extracts incoming W3C traceparent from request headers
 * - Stores span + OTel context in Elysia store for downstream propagation
 * - Logs each request as structured JSON with traceId
 *
 * Usage:
 *   app.use(observabilityPlugin({ serviceName: 'my-service' }))
 */
export function observabilityPlugin(config: ObservabilityPluginConfig) {
  const logger = createLogger(config.serviceName);
  const tracer = trace.getTracer(config.serviceName);
  const ignorePaths = new Set(config.ignorePaths ?? ['/metrics', '/health']);

  return new Elysia({ name: 'observability' })
    .decorate('logger', logger)
    .onBeforeHandle(({ request, store }) => {
      const url = new URL(request.url);
      if (ignorePaths.has(url.pathname)) return;

      // Extract parent trace context from incoming headers (W3C traceparent)
      const parentContext = propagation.extract(
        context.active(),
        request.headers,
        headerGetter,
      );

      // Start a new SERVER span
      const span = tracer.startSpan(
        `${request.method} ${url.pathname}`,
        {
          kind: SpanKind.SERVER,
          attributes: {
            'http.method': request.method,
            'http.url': url.pathname,
            'http.target': `${url.pathname}${url.search}`,
            'http.user_agent': request.headers.get('user-agent') ?? '',
          },
        },
        parentContext,
      );

      // Build context that carries the span (for propagation in proxy)
      const spanContext = trace.setSpan(parentContext, span);

      const s = store as Record<string, unknown>;
      s.__otelSpan = span;
      s.__otelContext = spanContext;
      s.__otelStartTime = performance.now();
    })
    .onAfterResponse(({ request, store, set }) => {
      const s = store as Record<string, unknown>;
      const span = s.__otelSpan as Span | undefined;
      if (!span) return;

      const duration = performance.now() - (s.__otelStartTime as number);
      const url = new URL(request.url);
      const statusCode = Number(set.status ?? 200);

      span.setAttributes({
        'http.status_code': statusCode,
        'http.response_time_ms': Math.round(duration),
      });

      if (statusCode >= 500) {
        span.setStatus({ code: SpanStatusCode.ERROR });
      }

      span.end();

      logger.info('request', {
        method: request.method,
        path: url.pathname,
        statusCode,
        duration: Math.round(duration),
        traceId: span.spanContext().traceId,
        spanId: span.spanContext().spanId,
      });
    })
    .onError(({ request, store, error }) => {
      const s = store as Record<string, unknown>;
      const span = s.__otelSpan as Span | undefined;
      const url = new URL(request.url);

      if (span) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message,
        });
        span.recordException(error);
        span.end();
      }

      logger.error('request_error', {
        method: request.method,
        path: url.pathname,
        error: error.message,
        stack: error.stack,
      });
    });
}

/**
 * Inject W3C traceparent into outgoing request headers for trace propagation.
 * Call this in proxy/HTTP client before making downstream requests.
 *
 * @param otelContext - The OTel context from Elysia store (`store.__otelContext`)
 * @param headers - The outgoing request Headers object
 */
export function injectTraceContext(
  otelContext: OtelContext,
  headers: Headers,
): void {
  propagation.inject(otelContext, headers, headerSetter);
}

export type { Logger };
