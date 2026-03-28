#!/bin/bash
# iOrder Market — Build image & mark ArgoCD app for sync
# Usage: bash scripts/k8s-build.sh <service>
#   bun run k8s:build:gateway
#   bun run k8s:build:products
#   bun run k8s:build:auth
#   bun run k8s:build:frontend

set -e

SERVICE="${1:-}"
ARGOCD_SERVER="localhost:8443"

if [ -z "$SERVICE" ]; then
  echo "Usage: $0 <service>"
  echo "  frontend | api-gateway | products-service | auth-service"
  exit 1
fi

# Map service name to ArgoCD app name and Helm parameter
case "$SERVICE" in
  frontend)         ARGOCD_APP="iorder-frontend";          PARAM="frontend.deployTimestamp" ;;
  api-gateway)      ARGOCD_APP="iorder-api-gateway";       PARAM="apiGateway.deployTimestamp" ;;
  products-service) ARGOCD_APP="iorder-products-service";  PARAM="productsService.deployTimestamp" ;;
  auth-service)     ARGOCD_APP="iorder-auth-service";      PARAM="authService.deployTimestamp" ;;
  *)
    echo "Unknown service: $SERVICE"
    echo "  frontend | api-gateway | products-service | auth-service"
    exit 1
    ;;
esac

echo "=== Build: $SERVICE ==="

# 1. Build Docker image in Minikube context
eval $(minikube docker-env)

if [ "$SERVICE" = "frontend" ]; then
  echo "[1/2] Building Angular + Docker image..."
  bun run ng build web 2>&1 | tail -3
  docker build -f infrastructure/docker/Dockerfile.frontend -t "iorder/frontend:latest" . -q
else
  echo "[1/2] Building Docker image..."
  docker build -f infrastructure/docker/Dockerfile.microservice --build-arg SERVICE="$SERVICE" -t "iorder/$SERVICE:latest" . -q
fi
echo "  ✓ Image built"

# 2. Set deploy timestamp in ArgoCD → app becomes OutOfSync
echo "[2/2] Marking $ARGOCD_APP for deploy..."
TIMESTAMP=$(date +%s)

# Login if needed (skip TLS for local dev)
argocd login "$ARGOCD_SERVER" --insecure --username admin \
  --password "$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d)" \
  --grpc-web 2>/dev/null

argocd app set "$ARGOCD_APP" -p "$PARAM=$TIMESTAMP" --grpc-web 2>/dev/null
echo "  ✓ $ARGOCD_APP marked OutOfSync"

echo ""
echo "=== Ready ==="
echo "Go to ArgoCD → $ARGOCD_APP → click SYNC"
echo "https://$ARGOCD_SERVER/applications/argocd/$ARGOCD_APP"
