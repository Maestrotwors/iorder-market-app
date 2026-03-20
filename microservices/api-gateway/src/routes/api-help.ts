import { Elysia } from 'elysia';
import { config, serviceUrl } from '../../../../config';

const SERVICES = [
  {
    name: 'Products',
    description: 'Product catalog (products-service)',
    url: serviceUrl('products'),
  },
  {
    name: 'Auth',
    description: 'Authentication (auth-service via Better Auth)',
    url: serviceUrl('auth'),
  },
] as const;

interface OpenAPISpec {
  paths?: Record<string, Record<string, Record<string, unknown>>>;
  components?: { schemas?: Record<string, unknown> };
}

async function fetchSpec(url: string): Promise<OpenAPISpec | null> {
  try {
    const res = await fetch(`${url}/api-help/json`);
    return res.ok ? ((await res.json()) as OpenAPISpec) : null;
  } catch {
    return null;
  }
}

async function buildMergedSpec(): Promise<object> {
  const specs = await Promise.all(SERVICES.map((s) => fetchSpec(s.url)));

  const paths: Record<string, unknown> = {
    '/api/health': {
      get: {
        summary: 'API Gateway health check',
        tags: ['Gateway'],
        operationId: 'gatewayHealth',
        responses: { '200': { description: 'OK' } },
      },
    },
  };
  const schemas: Record<string, unknown> = {};

  specs.forEach((spec, i) => {
    if (!spec?.paths) return;
    const tag = SERVICES[i].name;

    for (const [path, methods] of Object.entries(spec.paths)) {
      const tagged: Record<string, unknown> = {};
      for (const [method, cfg] of Object.entries(methods)) {
        tagged[method] = { ...cfg, tags: [tag] };
      }
      paths[`/api${path}`] = tagged;
    }

    if (spec.components?.schemas) {
      for (const [name, schema] of Object.entries(spec.components.schemas)) {
        schemas[`${tag}_${name}`] = schema;
      }
    }
  });

  return {
    openapi: '3.0.3',
    info: {
      title: 'iOrder Market — API',
      version: '0.0.1',
      description: 'Unified API documentation for all iOrder Market microservices.',
    },
    tags: [
      { name: 'Gateway', description: 'API Gateway endpoints' },
      ...SERVICES.map(({ name, description }) => ({ name, description })),
    ],
    paths,
    components: { schemas },
  };
}

let cache: { spec: object; time: number } | null = null;

async function getMergedSpec(): Promise<object> {
  if (cache && Date.now() - cache.time < 10_000) return cache.spec;
  const spec = await buildMergedSpec();
  cache = { spec, time: Date.now() };
  return spec;
}

const SCALAR_HTML = `<!doctype html>
<html>
<head>
  <title>iOrder Market — API Docs</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <div id="app"></div>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  <script>
    Scalar.createApiReference('#app', {
      url: '/api-help/json',
      theme: 'purple',
      darkMode: true,
      layout: 'modern',
    })
  </script>
</body>
</html>`;

export const apiHelpRoutes = config.isDev
  ? new Elysia()
      .get('/api-help', ({ set }) => {
        set.headers['content-type'] = 'text/html';
        return SCALAR_HTML;
      })
      .get('/api-help/json', () => getMergedSpec())
  : new Elysia();
