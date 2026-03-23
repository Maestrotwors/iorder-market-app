#!/usr/bin/env bash
# Argo CD setup script for iOrder Market
# Installs Argo CD, applies the Application manifest, and starts port-forward.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ARGOCD_NAMESPACE="argocd"
PORT=8443

echo "=== iOrder Market — Argo CD Setup ==="

# 1. Install Argo CD if not already installed
if kubectl get namespace "$ARGOCD_NAMESPACE" &>/dev/null; then
  echo "[INFO] Namespace '$ARGOCD_NAMESPACE' already exists, skipping install."
else
  echo "[INFO] Creating namespace '$ARGOCD_NAMESPACE' and installing Argo CD..."
  kubectl create namespace "$ARGOCD_NAMESPACE"
  kubectl apply -n "$ARGOCD_NAMESPACE" \
    -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
  echo "[INFO] Argo CD manifests applied."
fi

# 2. Wait for Argo CD pods to be ready
echo "[INFO] Waiting for Argo CD pods to be ready (timeout 300s)..."
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/part-of=argocd \
  -n "$ARGOCD_NAMESPACE" \
  --timeout=300s
echo "[INFO] All Argo CD pods are ready."

# 3. Apply the iOrder Application manifest
echo "[INFO] Applying iOrder Application manifest..."
kubectl apply -f "$PROJECT_ROOT/infrastructure/argocd/application.yaml"
echo "[INFO] Application 'iorder-market' created."

# 4. Start port-forward to argocd-server
echo "[INFO] Starting port-forward on localhost:${PORT} -> argocd-server:443..."
kubectl port-forward svc/argocd-server -n "$ARGOCD_NAMESPACE" "${PORT}:443" &
PF_PID=$!

# Give port-forward a moment to establish
sleep 2

if kill -0 "$PF_PID" 2>/dev/null; then
  echo "[INFO] Port-forward running (PID: $PF_PID)."
else
  echo "[ERROR] Port-forward failed to start."
  exit 1
fi

# 5. Print admin password and URL
ADMIN_PASSWORD=$(kubectl -n "$ARGOCD_NAMESPACE" get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d 2>/dev/null || echo "<secret not found>")

echo ""
echo "========================================"
echo "  Argo CD is ready"
echo "========================================"
echo "  URL:      https://localhost:${PORT}"
echo "  Username: admin"
echo "  Password: ${ADMIN_PASSWORD}"
echo "========================================"
echo ""
echo "Sync is MANUAL — open the UI and click 'Sync' on 'iorder-market'."
echo "To stop port-forward: kill $PF_PID"
