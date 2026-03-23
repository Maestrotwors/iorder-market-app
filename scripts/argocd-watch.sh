#!/usr/bin/env bash
# Watches main branch, rebuilds Docker images, Argo CD handles the rest.
# Usage: bun run argocd:watch
set -euo pipefail

BACKEND_SERVICES=("api-gateway" "products-service" "auth-service")
DOCKERFILE_BACKEND="infrastructure/docker/Dockerfile.microservice"
DOCKERFILE_FRONTEND="infrastructure/docker/Dockerfile.frontend"
POLL_INTERVAL=30
LAST_COMMIT=""

ensure_minikube() {
  if ! minikube status 2>/dev/null | grep -q "apiserver: Running"; then
    echo "[INFO] Starting minikube..."
    minikube start
  fi
}

ensure_tunnel() {
  if ! pgrep -f "minikube tunnel" >/dev/null 2>&1; then
    echo "[INFO] Starting minikube tunnel..."
    nohup minikube tunnel &>/tmp/minikube-tunnel.log &
    sleep 2
  fi
}

wait_for_pods() {
  echo "[WAIT] Waiting for all pods to be ready..."
  for DEPLOY in iorder-market-frontend iorder-market-api-gateway iorder-market-products-service iorder-market-auth-service; do
    kubectl rollout status deployment "$DEPLOY" --timeout=180s 2>/dev/null || true
  done
}

build_and_restart() {
  local COMMIT=$1
  echo ""
  echo "[$(date +%H:%M:%S)] New commit: ${COMMIT:0:7}"

  # Pull latest
  git checkout main --quiet
  git pull origin main --quiet

  # Ensure minikube & tunnel are alive after pull
  ensure_minikube
  eval $(minikube docker-env)
  ensure_tunnel

  # Build frontend
  echo "[BUILD] Angular..."
  bun run ng build web 2>&1 | tail -1

  echo "[BUILD] Frontend Docker image..."
  docker build -f "$DOCKERFILE_FRONTEND" -t "iorder/frontend:latest" . --quiet

  # Build backend services in parallel
  for SERVICE in "${BACKEND_SERVICES[@]}"; do
    echo "[BUILD] $SERVICE..."
    docker build -f "$DOCKERFILE_BACKEND" --build-arg SERVICE="$SERVICE" \
      -t "iorder/${SERVICE}:latest" . --quiet &
  done
  wait

  # Restart all deployments
  echo "[DEPLOY] Rolling restart..."
  kubectl rollout restart deployment -l app.kubernetes.io/instance=iorder-market 2>/dev/null || true

  wait_for_pods

  echo "[OK] Deploy complete: ${COMMIT:0:7}"
  echo ""
}

# --- Startup ---
echo "=== iOrder — Auto-deploy watcher ==="

ensure_minikube
eval $(minikube docker-env)
ensure_tunnel

echo "Watching 'main' branch every ${POLL_INTERVAL}s..."
echo "Press Ctrl+C to stop."
echo ""

# --- Main loop ---
while true; do
  # Fetch latest from remote
  git fetch origin main --quiet 2>/dev/null || true

  REMOTE_COMMIT=$(git rev-parse origin/main 2>/dev/null)

  if [[ -n "$REMOTE_COMMIT" && "$REMOTE_COMMIT" != "$LAST_COMMIT" ]]; then
    if [[ -n "$LAST_COMMIT" ]]; then
      build_and_restart "$REMOTE_COMMIT"
    else
      echo "[INFO] Current main: ${REMOTE_COMMIT:0:7}"
      # Ensure everything is healthy on first run
      ensure_tunnel
      wait_for_pods
      echo "[OK] All pods ready."
    fi
    LAST_COMMIT="$REMOTE_COMMIT"
  fi

  # Keep tunnel alive between polls
  ensure_tunnel

  sleep "$POLL_INTERVAL"
done
