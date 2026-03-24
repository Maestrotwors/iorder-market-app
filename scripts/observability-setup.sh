#!/usr/bin/env bash
# Observability stack setup: Loki (logs) + Tempo (traces) + Promtail (log collection)
# Integrates with existing kube-prometheus-stack (Prometheus + Grafana)
set -euo pipefail

MONITORING_NAMESPACE="monitoring"
GRAFANA_PORT=3100

echo "=== iOrder Market — Observability Setup (Loki + Tempo + Promtail) ==="

# 1. Ensure minikube is running
if ! minikube status 2>/dev/null | grep -q "apiserver: Running"; then
  echo "[INFO] Starting minikube..."
  minikube start
fi

# 2. Ensure monitoring namespace exists
if ! kubectl get namespace "$MONITORING_NAMESPACE" &>/dev/null; then
  echo "[INFO] Creating namespace '$MONITORING_NAMESPACE'..."
  kubectl create namespace "$MONITORING_NAMESPACE"
fi

# 3. Add Grafana Helm repo
echo "[INFO] Adding Grafana Helm repo..."
helm repo add grafana https://grafana.github.io/helm-charts 2>/dev/null || true
helm repo update

# ──────────────────────────────────────────────
# 4. Install Loki (log storage)
# ──────────────────────────────────────────────
echo "[INFO] Installing Loki..."
helm upgrade --install loki grafana/loki \
  -n "$MONITORING_NAMESPACE" \
  --set deploymentMode=SingleBinary \
  --set loki.auth_enabled=false \
  --set loki.commonConfig.replication_factor=1 \
  --set singleBinary.replicas=1 \
  --set loki.storage.type=filesystem \
  --set loki.schemaConfig.configs[0].from=2024-01-01 \
  --set loki.schemaConfig.configs[0].store=tsdb \
  --set loki.schemaConfig.configs[0].object_store=filesystem \
  --set loki.schemaConfig.configs[0].schema=v13 \
  --set loki.schemaConfig.configs[0].index.prefix=index_ \
  --set loki.schemaConfig.configs[0].index.period=24h \
  --set chunksCache.enabled=false \
  --set resultsCache.enabled=false \
  --set read.replicas=0 \
  --set write.replicas=0 \
  --set backend.replicas=0 \
  --set gateway.enabled=false \
  --timeout 5m0s

# ──────────────────────────────────────────────
# 5. Install Tempo (trace storage)
# ──────────────────────────────────────────────
echo "[INFO] Installing Tempo..."
helm upgrade --install tempo grafana/tempo \
  -n "$MONITORING_NAMESPACE" \
  --set tempo.reportingEnabled=false \
  --set tempo.metricsGenerator.enabled=false \
  --timeout 5m0s

# ──────────────────────────────────────────────
# 6. Install Promtail (log collector → Loki)
# ──────────────────────────────────────────────
echo "[INFO] Installing Promtail..."
helm upgrade --install promtail grafana/promtail \
  -n "$MONITORING_NAMESPACE" \
  --set "config.clients[0].url=http://loki:3100/loki/api/v1/push" \
  --set config.snippets.pipelineStages[0].cri='{}' \
  --timeout 5m0s

# ──────────────────────────────────────────────
# 7. Upgrade Grafana with Loki + Tempo datasources
# ──────────────────────────────────────────────
echo "[INFO] Upgrading Prometheus stack with Loki + Tempo datasources..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts 2>/dev/null || true

# Create a temporary values file for datasources
DATASOURCES_VALUES=$(mktemp)
cat > "$DATASOURCES_VALUES" <<'YAML'
grafana:
  adminPassword: admin
  sidecar:
    dashboards:
      enabled: true
      searchNamespace: ALL
      label: grafana_dashboard
  additionalDataSources:
    - name: Loki
      type: loki
      url: http://loki:3100
      access: proxy
      isDefault: false
      jsonData:
        derivedFields:
          - datasourceUid: tempo
            matcherRegex: '"traceId":"(\w+)"'
            name: TraceID
            url: '$${__value.raw}'
    - name: Tempo
      type: tempo
      uid: tempo
      url: http://tempo:3100
      access: proxy
      isDefault: false
      jsonData:
        tracesToLogsV2:
          datasourceUid: loki
          filterByTraceID: true
          filterBySpanID: false
        nodeGraph:
          enabled: true
        serviceMap:
          datasourceUid: prometheus
alertmanager:
  enabled: false
prometheus:
  prometheusSpec:
    serviceMonitorSelectorNilUsesHelmValues: false
    podMonitorSelectorNilUsesHelmValues: false
YAML

helm upgrade --install prometheus-stack prometheus-community/kube-prometheus-stack \
  -n "$MONITORING_NAMESPACE" \
  -f "$DATASOURCES_VALUES" \
  --timeout 5m0s

rm -f "$DATASOURCES_VALUES"

# ──────────────────────────────────────────────
# 8. Wait for deployments
# ──────────────────────────────────────────────
echo "[INFO] Waiting for observability deployments..."
for DEPLOY in loki tempo; do
  kubectl rollout status statefulset "$DEPLOY" -n "$MONITORING_NAMESPACE" --timeout=300s 2>/dev/null || \
  kubectl rollout status deployment "$DEPLOY" -n "$MONITORING_NAMESPACE" --timeout=300s 2>/dev/null || true
done

kubectl rollout status daemonset promtail -n "$MONITORING_NAMESPACE" --timeout=300s 2>/dev/null || true

echo "[OK] Observability stack ready."

# ──────────────────────────────────────────────
# 9. Print info
# ──────────────────────────────────────────────
echo ""
echo "========================================"
echo "  Observability Stack Ready"
echo ""
echo "  Grafana:     http://localhost:${GRAFANA_PORT}"
echo "  Login:       admin / admin"
echo ""
echo "  Datasources:"
echo "    - Prometheus  (metrics)"
echo "    - Loki        (logs)"
echo "    - Tempo       (traces)"
echo ""
echo "  Trace correlation:"
echo "    Log → Trace:  click traceId in Loki → opens in Tempo"
echo "    Trace → Log:  click span in Tempo → shows related logs"
echo ""
echo "  OTLP endpoint for services:"
echo "    http://tempo.monitoring:4318"
echo "========================================"
echo ""
echo "[INFO] Run 'bun run monitoring:grafana' to port-forward Grafana."
