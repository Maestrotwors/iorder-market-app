#!/usr/bin/env bash
# Watches RC tags, rebuilds Docker images, Argo CD handles the rest.
# Usage: bun run argocd:watch
#
# Workflow:
#   1. Run `bun run release:test` to create an RC tag and push it
#   2. This script detects the new tag and rebuilds images locally
#   3. ArgoCD syncs the Helm chart and rolls out new pods
set -euo pipefail

BACKEND_SERVICES=("api-gateway" "products-service" "auth-service")
DOCKERFILE_BACKEND="infrastructure/docker/Dockerfile.microservice"
DOCKERFILE_FRONTEND="infrastructure/docker/Dockerfile.frontend"
POLL_INTERVAL=30
LAST_TAG=""

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

get_latest_rc_tag() {
  git fetch origin --tags --quiet 2>/dev/null || true
  git tag -l "v*-rc.*" | sort -V | tail -1
}

build_and_deploy() {
  local TAG=$1
  echo ""
  echo "[$(date +%H:%M:%S)] New RC tag: ${TAG}"

  # Checkout the tagged commit
  git checkout "$TAG" --quiet 2>/dev/null

  # Ensure minikube & tunnel are alive
  ensure_minikube
  eval $(minikube docker-env)
  ensure_tunnel

  # Build frontend
  echo "[BUILD] Angular..."
  bun run ng build web 2>&1 | tail -1

  echo "[BUILD] Frontend Docker image..."
  docker build -f "$DOCKERFILE_FRONTEND" -t "iorder/frontend:latest" -t "iorder/frontend:${TAG}" . --quiet

  # Build backend services in parallel
  for SERVICE in "${BACKEND_SERVICES[@]}"; do
    echo "[BUILD] $SERVICE..."
    docker build -f "$DOCKERFILE_BACKEND" --build-arg SERVICE="$SERVICE" \
      -t "iorder/${SERVICE}:latest" -t "iorder/${SERVICE}:${TAG}" . --quiet &
  done
  wait

  # Restart all deployments to pick up new images
  echo "[DEPLOY] Rolling restart..."
  kubectl rollout restart deployment -l app.kubernetes.io/instance=iorder-market 2>/dev/null || true

  wait_for_pods

  # Cleanup dangling Docker images to prevent disk full
  docker image prune -f --filter "until=1h" &>/dev/null || true

  # Return to main
  git checkout main --quiet 2>/dev/null

  echo "[OK] Deploy complete: ${TAG}"
  echo ""
}

# --- Startup ---
echo "=== iOrder — RC Tag Deploy Watcher ==="

ensure_minikube
eval $(minikube docker-env)
ensure_tunnel

echo "Watching for new RC tags (v*-rc.*) every ${POLL_INTERVAL}s..."
echo "Create a tag with: bun run release:test"
echo "Press Ctrl+C to stop."
echo ""

# --- Main loop ---
while true; do
  LATEST_TAG=$(get_latest_rc_tag)

  if [[ -n "$LATEST_TAG" && "$LATEST_TAG" != "$LAST_TAG" ]]; then
    if [[ -n "$LAST_TAG" ]]; then
      build_and_deploy "$LATEST_TAG"
    else
      echo "[INFO] Current latest RC: ${LATEST_TAG}"
      ensure_tunnel
      wait_for_pods
      echo "[OK] All pods ready."
    fi
    LAST_TAG="$LATEST_TAG"
  fi

  # Keep tunnel alive between polls
  ensure_tunnel

  sleep "$POLL_INTERVAL"
done
