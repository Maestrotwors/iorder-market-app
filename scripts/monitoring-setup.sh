#!/usr/bin/env bash
# Prometheus + Grafana monitoring setup for iOrder Market
# Installs kube-prometheus-stack, ensures tunnel, runs stable port-forward to Grafana.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MONITORING_NAMESPACE="monitoring"
GRAFANA_PORT=3100

cleanup() {
  echo ""
  echo "[INFO] Shutting down..."
  kill "$PF_PID" 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "=== iOrder Market — Monitoring Setup (Prometheus + Grafana) ==="

# 1. Ensure minikube is running
if ! minikube status 2>/dev/null | grep -q "apiserver: Running"; then
  echo "[INFO] Starting minikube..."
  minikube start
fi

# 2. Create monitoring namespace
if kubectl get namespace "$MONITORING_NAMESPACE" &>/dev/null; then
  echo "[OK] Namespace '$MONITORING_NAMESPACE' exists."
else
  echo "[INFO] Creating namespace '$MONITORING_NAMESPACE'..."
  kubectl create namespace "$MONITORING_NAMESPACE"
fi

# 3. Add Helm repo
echo "[INFO] Adding prometheus-community Helm repo..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts 2>/dev/null || true
helm repo update

# 4. Install/upgrade kube-prometheus-stack
echo "[INFO] Installing kube-prometheus-stack..."
helm upgrade --install prometheus-stack prometheus-community/kube-prometheus-stack \
  -n "$MONITORING_NAMESPACE" \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set prometheus.prometheusSpec.podMonitorSelectorNilUsesHelmValues=false \
  --set grafana.adminPassword=admin \
  --set grafana.sidecar.dashboards.enabled=true \
  --set grafana.sidecar.dashboards.searchNamespace=ALL \
  --set alertmanager.enabled=false \
  --set 'grafana.sidecar.dashboards.label=grafana_dashboard' \
  --timeout 5m0s

# 5. Wait for deployments to roll out
echo "[INFO] Waiting for monitoring deployments..."
for DEPLOY in prometheus-stack-grafana prometheus-stack-kube-prom-operator; do
  kubectl rollout status deployment "$DEPLOY" -n "$MONITORING_NAMESPACE" --timeout=300s 2>/dev/null || true
done
echo "[OK] Monitoring stack ready."

# 6. Ensure minikube tunnel for LoadBalancer services
if ! pgrep -f "minikube tunnel" >/dev/null 2>&1; then
  echo "[INFO] Starting minikube tunnel..."
  nohup minikube tunnel &>/tmp/minikube-tunnel.log &
  sleep 2
fi
echo "[OK] Minikube tunnel running."

# 7. Print Grafana credentials
echo ""
echo "========================================"
echo "  Grafana ready"
echo "  URL:      http://localhost:${GRAFANA_PORT}"
echo "  Login:    admin"
echo "  Password: admin"
echo "========================================"
echo ""

# 8. Stable port-forward with auto-restart
echo "[INFO] Starting port-forward (auto-restarts on failure)..."
echo "[INFO] Press Ctrl+C to stop."

while true; do
  kubectl port-forward svc/prometheus-stack-grafana -n "$MONITORING_NAMESPACE" "${GRAFANA_PORT}:80" 2>/dev/null &
  PF_PID=$!

  # Wait for port-forward to die
  wait "$PF_PID" 2>/dev/null || true

  echo "[WARN] Port-forward dropped, restarting in 3s..."
  sleep 3

  # Check minikube is still alive
  if ! kubectl cluster-info &>/dev/null; then
    echo "[WARN] Cluster unreachable, waiting for recovery..."
    while ! kubectl cluster-info &>/dev/null; do
      sleep 5
    done
    echo "[OK] Cluster back online."

    # Wait for Grafana after recovery
    for DEPLOY in prometheus-stack-grafana prometheus-stack-kube-prom-operator; do
      kubectl rollout status deployment "$DEPLOY" -n "$MONITORING_NAMESPACE" --timeout=300s 2>/dev/null || true
    done
  fi

  # Ensure tunnel after recovery
  if ! pgrep -f "minikube tunnel" >/dev/null 2>&1; then
    nohup minikube tunnel &>/tmp/minikube-tunnel.log &
    sleep 2
  fi
done
