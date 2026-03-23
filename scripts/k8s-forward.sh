#!/bin/bash
# Stable access to K8s services via minikube tunnel (no port-forward)
# LoadBalancer service gets a stable external IP — survives pod restarts
# Usage: bash scripts/k8s-forward.sh

echo "Starting minikube tunnel (requires sudo)..."
echo "This provides stable access — no drops during rolling restarts."
echo ""

# minikube tunnel assigns external IPs to LoadBalancer services
# It works at Service level, not Pod level — zero downtime guaranteed
exec minikube tunnel
