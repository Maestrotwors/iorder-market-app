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

# 3. Build all images (sequential — minikube VM has limited resources)
echo "[1/4] Building images..."
for svc in "${BACKEND_SERVICES[@]}"; do
  echo "  Building $svc..."
  docker build -f "$DOCKERFILE_BACKEND" --build-arg SERVICE="$svc" -t "iorder/$svc:latest" . -q
  echo "  ✓ $svc"
done

echo "  Building frontend..."
docker build -f "$DOCKERFILE_FRONTEND" -t "iorder/frontend:latest" . -q
echo "  ✓ frontend"

# 5. Deploy / upgrade with Helm (--wait ensures readiness before marking complete)
echo "[2/4] Deploying to Kubernetes..."
HELM_ARGS="$HELM_CHART -f $HELM_VALUES --wait --timeout 3m0s"
if helm status "$RELEASE_NAME" &>/dev/null; then
  helm upgrade "$RELEASE_NAME" $HELM_ARGS 2>&1
else
  helm install "$RELEASE_NAME" $HELM_ARGS 2>&1
fi

# 6. Rolling restart all app deployments one-by-one
echo "[3/4] Rolling restart (one service at a time)..."
ALL_DEPLOYMENTS=("frontend" "${BACKEND_SERVICES[@]}")
for svc in "${ALL_DEPLOYMENTS[@]}"; do
  if kubectl get deployment "$RELEASE_NAME-$svc" &>/dev/null; then
    echo "  Restarting $svc..."
    kubectl rollout restart deployment "$RELEASE_NAME-$svc"
    kubectl rollout status deployment "$RELEASE_NAME-$svc" --timeout=120s
  fi
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
