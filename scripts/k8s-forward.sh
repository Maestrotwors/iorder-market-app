#!/bin/bash
# Stable port-forward with keepalive and instant reconnect
# Usage: bash scripts/k8s-forward.sh [port]

PORT=${1:-30080}
SVC="svc/iorder-frontend"

forward() {
  kubectl port-forward "$SVC" "${PORT}:80" &>/dev/null &
  FWD_PID=$!

  # Wait for forward to be ready
  for i in $(seq 1 10); do
    if curl -s -o /dev/null --max-time 1 "http://localhost:${PORT}/" 2>/dev/null; then
      return 0
    fi
    sleep 0.3
  done
  return 1
}

cleanup() {
  kill $FWD_PID 2>/dev/null
  exit 0
}
trap cleanup EXIT INT TERM

echo "Port-forward http://localhost:${PORT} (keepalive)"

while true; do
  # Start forward if not running
  if ! kill -0 $FWD_PID 2>/dev/null; then
    forward
  fi

  # Keepalive check — if site is down, restart forward immediately
  if ! curl -s -o /dev/null --max-time 1 "http://localhost:${PORT}/" 2>/dev/null; then
    kill $FWD_PID 2>/dev/null
    sleep 0.2
    forward
  fi

  sleep 2
done
