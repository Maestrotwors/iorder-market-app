/**
 * Generates Helm values-ports.yaml from config/ports.json (single source of truth).
 *
 * Usage: bun scripts/generate-helm-ports.ts
 *
 * Output: infrastructure/helm/iorder/values-ports.yaml
 * Used in: helm install/upgrade -f values-ports.yaml -f values-dev.yaml
 */

import ports from '../config/ports.json';

const { services, infrastructure, kubernetes } = ports;
const { postgresql, redpanda } = infrastructure;

const yaml = `# Auto-generated from config/ports.json — do not edit manually
# Regenerate: bun scripts/generate-helm-ports.ts

apiGateway:
  host: ${services.apiGateway.host}
  port: ${services.apiGateway.port}

productsService:
  host: ${services.products.host}
  port: ${services.products.port}

authService:
  host: ${services.auth.host}
  port: ${services.auth.port}

frontend:
  nodePort: ${kubernetes.frontendNodePort}

postgresql:
  host: ${postgresql.host}
  port: ${postgresql.port}
  database: ${postgresql.database}
  username: ${postgresql.username}

redpanda:
  host: ${redpanda.host}
  kafka:
    port: ${redpanda.kafka}
  schemaRegistry:
    port: ${redpanda.schemaRegistry}
  restProxy:
    port: ${redpanda.restProxy}
`;

const outPath = 'infrastructure/helm/iorder/values-ports.yaml';
await Bun.write(outPath, yaml);
console.log(`Generated: ${outPath}`);
