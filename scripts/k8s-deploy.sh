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
HELM_VALUES_PORTS="infrastructure/helm/iorder/values-ports.yaml"
HELM_VALUES_DEV="infrastructure/helm/iorder/values-dev.yaml"
RELEASE_NAME="iorder-market"
EXTERNAL_DB_URL="${DATABASE_URL:-}"
PORT=$(bun -e 'import p from "./config/ports.json";console.log(p.kubernetes.frontendNodePort)')

echo "=== iOrder K8s Deploy ==="

# 0. Generate configs + ensure minikube
bun scripts/generate-env.ts
bun scripts/generate-helm-ports.ts

if ! minikube status 2>/dev/null | grep -q "Running"; then
  minikube start
fi

eval $(minikube docker-env)

# 1. Install observability stack (Loki + Tempo + Promtail) in background
echo "[0/3] Setting up observability stack..."
bash "$(dirname "$0")/observability-setup.sh" &>/tmp/observability-setup.log &
OBSERVABILITY_PID=$!

# 2. Ensure DB is running (in parallel with builds)
if [ -z "$EXTERNAL_DB_URL" ]; then
  if ! docker ps --format '{{.Names}}' | grep -q iorder-postgres; then
    docker compose -f infrastructure/docker/docker-compose.db.yml up -d &
  fi
fi

# 3. Build images (backend in parallel, frontend separately)
echo "[1/3] Building images..."

# Angular build runs in parallel with backend Docker builds
bun run ng build web 2>&1 | tail -3 &
NG_PID=$!

BACKEND_PIDS=()
for svc in "${BACKEND_SERVICES[@]}"; do
  (docker build -f "$DOCKERFILE_BACKEND" --build-arg SERVICE="$svc" -t "iorder/$svc:latest" . -q && echo "  ✓ $svc") &
  BACKEND_PIDS+=($!)
done

# Wait for backend builds only
for pid in "${BACKEND_PIDS[@]}"; do
  wait "$pid"
done

# Wait for Angular build, then build frontend Docker image
wait "$NG_PID"
docker build -f "$DOCKERFILE_FRONTEND" -t "iorder/frontend:latest" . -q
echo "  ✓ frontend"

# 4. Wait for observability setup before Helm deploy
if [ -n "${OBSERVABILITY_PID:-}" ]; then
  wait "$OBSERVABILITY_PID" 2>/dev/null || echo "[WARN] Observability setup had issues, check /tmp/observability-setup.log"
fi

# 5. Helm deploy
echo "[2/3] Deploying..."
HELM_ARGS="$HELM_CHART -f $HELM_VALUES_PORTS -f $HELM_VALUES_DEV --timeout 2m0s"

if [ -n "$EXTERNAL_DB_URL" ]; then
  HELM_ARGS="$HELM_ARGS --set database.external.enabled=true --set database.external.url=$EXTERNAL_DB_URL --set postgresql.enabled=false"
fi

if helm status "$RELEASE_NAME" &>/dev/null; then
  helm upgrade "$RELEASE_NAME" $HELM_ARGS 2>&1
else
  helm install "$RELEASE_NAME" $HELM_ARGS 2>&1
fi

# 6. Rolling restart ALL at once (zero-downtime — 2+ replicas, maxUnavailable: 0)
echo "[3/3] Rolling restart..."
for svc in frontend "${BACKEND_SERVICES[@]}"; do
  kubectl rollout restart deployment "$RELEASE_NAME-$svc" 2>/dev/null &
done
wait

# Wait for all rollouts in parallel
for svc in frontend "${BACKEND_SERVICES[@]}"; do
  kubectl rollout status deployment "$RELEASE_NAME-$svc" --timeout=120s &
done
wait

# Ensure minikube tunnel is running
if ! pgrep -f "minikube tunnel" >/dev/null; then
  echo "[INFO] Starting minikube tunnel..."
  nohup minikube tunnel &>/tmp/minikube-tunnel.log &
  sleep 2
fi

# Verify frontend is accessible
echo ""
echo "=== Deploy Complete ==="
kubectl get pods --field-selector=status.phase=Running -o wide
echo ""
if curl -s -o /dev/null -w "" http://localhost:${PORT}/ 2>/dev/null; then
  echo "✓ Frontend: http://localhost:${PORT}"
else
  echo "Frontend: http://localhost:${PORT} (may take a few seconds to become available)"
fi
echo "  /           → Angular frontend"
echo "  /api/*      → API Gateway → Microservices"
echo ""
echo "Observability:"
echo "  Grafana:    bun run monitoring:grafana → http://localhost:3100"
echo "  Logs:       Explore → Loki"
echo "  Traces:     Explore → Tempo"
