#!/bin/bash
# iOrder Market — Rebuild & redeploy a single service
# Usage: bash scripts/k8s-deploy-service.sh <service-name>
#   bun run k8s:deploy:gateway
#   bun run k8s:deploy:products
#   bun run k8s:deploy:auth
#   bun run k8s:deploy:frontend

set -e

SERVICE="${1:-}"
RELEASE_NAME="iorder-market"

if [ -z "$SERVICE" ]; then
  echo "Usage: $0 <service>"
  echo "  frontend | api-gateway | products-service | auth-service"
  exit 1
fi

echo "=== Deploy: $SERVICE ==="

eval $(minikube docker-env)

if [ "$SERVICE" = "frontend" ]; then
  echo "[1/2] Building Angular + Docker image..."
  bun run ng build web 2>&1 | tail -3
  docker build -f infrastructure/docker/Dockerfile.frontend -t "iorder/frontend:latest" . -q
else
  echo "[1/2] Building Docker image..."
  docker build -f infrastructure/docker/Dockerfile.microservice --build-arg SERVICE="$SERVICE" -t "iorder/$SERVICE:latest" . -q
fi
echo "  ✓ $SERVICE"

echo "[2/2] Rolling restart..."
kubectl rollout restart deployment "$RELEASE_NAME-$SERVICE"
kubectl rollout status deployment "$RELEASE_NAME-$SERVICE" --timeout=120s

echo ""
echo "✓ $SERVICE updated"
