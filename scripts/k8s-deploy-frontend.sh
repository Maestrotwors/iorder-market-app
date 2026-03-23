#!/bin/bash
# iOrder Market — Rebuild & redeploy frontend only (zero downtime)
# Usage: bun run k8s:deploy:frontend

set -e

PORT=$(bun -e 'import p from "./config/ports.json";console.log(p.kubernetes.frontendNodePort)')

echo "=== Frontend K8s Update ==="

# 1. Build Angular locally
echo "[1/3] Building Angular..."
bun run ng build web 2>&1 | tail -3

# 2. Build Docker image in minikube
echo "[2/3] Building Docker image..."
eval $(minikube docker-env)
docker build -f infrastructure/docker/Dockerfile.frontend -t iorder/frontend:latest . -q
echo "  ✓ frontend image"

# 3. Rolling restart (zero downtime — maxUnavailable: 0, 2 replicas)
# Do NOT touch port-forward — it stays connected to the Service
echo "[3/3] Rolling restart..."
kubectl rollout restart deployment iorder-market-frontend
kubectl rollout status deployment iorder-market-frontend --timeout=120s

echo ""
echo "✓ Frontend updated: http://localhost:${PORT}"
