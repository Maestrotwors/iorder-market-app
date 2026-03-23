#!/usr/bin/env bash
# Argo CD setup script for iOrder Market
# Installs Argo CD, applies Application, ensures tunnel, runs stable port-forward.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ARGOCD_NAMESPACE="argocd"
PORT=8443

cleanup() {
  echo ""
  echo "[INFO] Shutting down..."
  kill "$PF_PID" 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "=== iOrder Market — Argo CD Setup ==="

# 1. Ensure minikube is running
if ! minikube status 2>/dev/null | grep -q "apiserver: Running"; then
  echo "[INFO] Starting minikube..."
  minikube start
fi

# 2. Install Argo CD if not installed
if kubectl get namespace "$ARGOCD_NAMESPACE" &>/dev/null; then
  echo "[OK] Argo CD namespace exists."
else
  echo "[INFO] Installing Argo CD..."
  kubectl create namespace "$ARGOCD_NAMESPACE"
  kubectl apply -n "$ARGOCD_NAMESPACE" \
    -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
fi

# 3. Wait for ArgoCD deployments to be ready
echo "[INFO] Waiting for Argo CD..."
for DEPLOY in argocd-server argocd-repo-server argocd-application-controller; do
  kubectl rollout status deployment "$DEPLOY" -n "$ARGOCD_NAMESPACE" --timeout=300s 2>/dev/null || \
  kubectl rollout status statefulset "$DEPLOY" -n "$ARGOCD_NAMESPACE" --timeout=300s 2>/dev/null || true
done
echo "[OK] Argo CD ready."

# 4. Set polling interval to 30s
kubectl patch configmap argocd-cm -n "$ARGOCD_NAMESPACE" \
  --type merge -p '{"data":{"timeout.reconciliation":"30s"}}' 2>/dev/null || true

# 5. Apply application manifest
kubectl apply -f "$PROJECT_ROOT/infrastructure/argocd/application.yaml"
echo "[OK] Application 'iorder-market' applied."

# 6. Ensure minikube tunnel for LoadBalancer services
if ! pgrep -f "minikube tunnel" >/dev/null 2>&1; then
  echo "[INFO] Starting minikube tunnel..."
  nohup minikube tunnel &>/tmp/minikube-tunnel.log &
  sleep 2
fi
echo "[OK] Minikube tunnel running."

# 7. Print credentials
ADMIN_PASSWORD=$(kubectl -n "$ARGOCD_NAMESPACE" get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d 2>/dev/null || echo "<not found>")

echo ""
echo "========================================"
echo "  Argo CD ready"
echo "  URL:      https://localhost:${PORT}"
echo "  Login:    admin"
echo "  Password: ${ADMIN_PASSWORD}"
echo "========================================"
echo ""

# 8. Stable port-forward with auto-restart
echo "[INFO] Starting port-forward (auto-restarts on failure)..."
echo "[INFO] Press Ctrl+C to stop."

while true; do
  kubectl port-forward svc/argocd-server -n "$ARGOCD_NAMESPACE" "${PORT}:443" 2>/dev/null &
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

    # Wait for argocd after recovery
    for DEPLOY in argocd-server argocd-repo-server; do
      kubectl rollout status deployment "$DEPLOY" -n "$ARGOCD_NAMESPACE" --timeout=300s 2>/dev/null || true
    done
  fi

  # Ensure tunnel after recovery
  if ! pgrep -f "minikube tunnel" >/dev/null 2>&1; then
    nohup minikube tunnel &>/tmp/minikube-tunnel.log &
    sleep 2
  fi
done
