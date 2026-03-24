import { trace } from '@opentelemetry/api';
import {
  BasicTracerProvider,
  BatchSpanProcessor,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

export interface TracerConfig {
  serviceName: string;
  serviceVersion?: string;
  /** OTLP HTTP endpoint, e.g. http://tempo:4318. Defaults to OTEL_EXPORTER_OTLP_ENDPOINT env var. */
  otlpEndpoint?: string;
  /** Use SimpleSpanProcessor (dev) instead of BatchSpanProcessor (prod). */
  isDev?: boolean;
}

let provider: BasicTracerProvider | null = null;

export function initTracer(config: TracerConfig): BasicTracerProvider {
  if (provider) return provider;

  const endpoint =
    config.otlpEndpoint ??
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ??
    'http://localhost:4318';

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: config.serviceName,
    [ATTR_SERVICE_VERSION]: config.serviceVersion ?? '0.0.1',
  });

  const exporter = new OTLPTraceExporter({
    url: `${endpoint}/v1/traces`,
  });

  // Dev: flush immediately; Prod: batch for performance
  const spanProcessors = config.isDev
    ? [new SimpleSpanProcessor(exporter)]
    : [new BatchSpanProcessor(exporter)];

  provider = new BasicTracerProvider({ resource, spanProcessors });

  trace.setGlobalTracerProvider(provider);

  return provider;
}

export function getTracer(name: string) {
  return trace.getTracer(name);
}

export async function shutdownTracer(): Promise<void> {
  if (provider) {
    await provider.shutdown();
    provider = null;
  }
}
