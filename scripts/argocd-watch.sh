#!/usr/bin/env bash
# Watches main branch, rebuilds Docker images, Argo CD handles the rest.
# Usage: bun run argocd:watch
set -euo pipefail

BACKEND_SERVICES=("api-gateway" "products-service" "auth-service")
DOCKERFILE_BACKEND="infrastructure/docker/Dockerfile.microservice"
DOCKERFILE_FRONTEND="infrastructure/docker/Dockerfile.frontend"
POLL_INTERVAL=30
LAST_COMMIT=""

echo "=== iOrder — Auto-deploy watcher ==="
echo "Watching 'main' branch every ${POLL_INTERVAL}s..."
echo "Press Ctrl+C to stop."
echo ""

# Use Minikube's Docker daemon
eval $(minikube docker-env)

build_and_restart() {
  local COMMIT=$1
  echo ""
  echo "[$(date +%H:%M:%S)] New commit: ${COMMIT:0:7}"

  # Pull latest
  git checkout main --quiet
  git pull origin main --quiet

  # Build frontend
  echo "[BUILD] Angular..."
  bun run ng build web 2>&1 | tail -1

  echo "[BUILD] Frontend Docker image..."
  docker build -f "$DOCKERFILE_FRONTEND" -t iorder-frontend:latest . --quiet

  # Build backend services in parallel
  for SERVICE in "${BACKEND_SERVICES[@]}"; do
    echo "[BUILD] $SERVICE..."
    docker build -f "$DOCKERFILE_BACKEND" --build-arg SERVICE="$SERVICE" \
      -t "iorder-${SERVICE}:latest" . --quiet &
  done
  wait

  # Restart all deployments
  echo "[DEPLOY] Rolling restart..."
  kubectl rollout restart deployment -l app.kubernetes.io/instance=iorder-market 2>/dev/null || true

  # Wait for rollout
  for DEPLOY in iorder-market-frontend iorder-market-api-gateway iorder-market-products-service iorder-market-auth-service; do
    kubectl rollout status deployment "$DEPLOY" --timeout=120s 2>/dev/null || true
  done

  echo "[OK] Deploy complete: ${COMMIT:0:7}"
  echo ""
}

# Main loop
while true; do
  # Fetch latest from remote
  git fetch origin main --quiet 2>/dev/null || true

  REMOTE_COMMIT=$(git rev-parse origin/main 2>/dev/null)

  if [[ -n "$REMOTE_COMMIT" && "$REMOTE_COMMIT" != "$LAST_COMMIT" ]]; then
    if [[ -n "$LAST_COMMIT" ]]; then
      build_and_restart "$REMOTE_COMMIT"
    else
      echo "[INFO] Current main: ${REMOTE_COMMIT:0:7}"
    fi
    LAST_COMMIT="$REMOTE_COMMIT"
  fi

  sleep "$POLL_INTERVAL"
done
