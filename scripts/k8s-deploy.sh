#!/bin/bash
# iOrder Market — Build & Deploy to Minikube
# Usage: bun run k8s:deploy
#
# Frontend + API: http://localhost:30080
#   /           → Angular SPA
#   /api/*      → API Gateway → Microservices
#   /health     → API Gateway health

set -e

BACKEND_SERVICES=("api-gateway" "products-service" "auth-service")
DOCKERFILE_BACKEND="infrastructure/docker/Dockerfile.microservice"
DOCKERFILE_FRONTEND="infrastructure/docker/Dockerfile.frontend"
HELM_CHART="infrastructure/helm/iorder"
HELM_VALUES="infrastructure/helm/iorder/values-dev.yaml"
RELEASE_NAME="iorder"
PORT=30080

echo "=== iOrder K8s Deploy ==="
echo ""

# 1. Ensure minikube is running
if ! minikube status 2>/dev/null | grep -q "Running"; then
  echo "[0/6] Starting minikube..."
  minikube start
fi

# 2. Switch to minikube docker
eval $(minikube docker-env)

# 3. Build ALL images in parallel
echo "[1/4] Building all images in parallel..."
PIDS=()
LOGS_DIR=$(mktemp -d)

for svc in "${BACKEND_SERVICES[@]}"; do
  echo "  Starting $svc build..."
  docker build -f "$DOCKERFILE_BACKEND" --build-arg SERVICE="$svc" -t "iorder/$svc:latest" . -q \
    > "$LOGS_DIR/$svc.log" 2>&1 &
  PIDS+=($!)
done

echo "  Starting frontend build..."
docker build -f "$DOCKERFILE_FRONTEND" -t "iorder/frontend:latest" . \
  > "$LOGS_DIR/frontend.log" 2>&1 &
PIDS+=($!)

# Wait for all builds, fail if any fails
FAILED=0
ALL_SERVICES=("${BACKEND_SERVICES[@]}" "frontend")
for i in "${!PIDS[@]}"; do
  if wait "${PIDS[$i]}"; then
    echo "  ✓ ${ALL_SERVICES[$i]}"
  else
    echo "  ✗ ${ALL_SERVICES[$i]} FAILED:"
    cat "$LOGS_DIR/${ALL_SERVICES[$i]}.log"
    FAILED=1
  fi
done
rm -rf "$LOGS_DIR"

if [ "$FAILED" -eq 1 ]; then
  echo "Build failed. Aborting deploy."
  exit 1
fi

# 5. Deploy / upgrade with Helm (--wait ensures readiness before marking complete)
echo "[2/4] Deploying to Kubernetes..."
HELM_ARGS="$HELM_CHART -f $HELM_VALUES --wait --timeout 3m0s"
if helm status "$RELEASE_NAME" &>/dev/null; then
  helm upgrade "$RELEASE_NAME" $HELM_ARGS 2>&1
else
  helm install "$RELEASE_NAME" $HELM_ARGS 2>&1
fi

# 6. Rolling restart one-by-one to ensure zero downtime
echo "[3/4] Rolling restart (one service at a time)..."

# Restart frontend pods sequentially — wait for each to be fully ready
kubectl rollout restart deployment "$RELEASE_NAME-frontend" 2>/dev/null || true
kubectl rollout status deployment "$RELEASE_NAME-frontend" --timeout=120s

# Restart backend services one by one
for svc in "${BACKEND_SERVICES[@]}"; do
  echo "  Restarting $svc..."
  kubectl rollout restart deployment "$RELEASE_NAME-$svc" 2>/dev/null || true
  kubectl rollout status deployment "$RELEASE_NAME-$svc" --timeout=120s
done

# 7. Port-forward
echo "[4/4] Setting up port-forward..."
pkill -f "port-forward.*iorder-frontend" 2>/dev/null || true
sleep 1
kubectl port-forward svc/iorder-frontend ${PORT}:80 &>/tmp/k8s-portforward.log &
sleep 2

echo ""
echo "=== Deploy Complete ==="
kubectl get pods -o wide
echo ""
echo "Open: http://localhost:${PORT}"
echo ""
echo "  /           → Angular frontend"
echo "  /api/*      → API Gateway → Microservices"
echo "  /health     → API Gateway health check"
