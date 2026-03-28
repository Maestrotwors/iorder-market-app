#!/bin/bash
# Create RedPanda topics for iOrder Market
# Usage: bash infrastructure/redpanda/create-topics.sh [broker] [partitions]
#
# Partitions guide:
#   dev:  1 (single instance)
#   prod: 9 (3 replicas × 3 nodes)

BROKER="${1:-localhost:19092}"
PARTITIONS="${2:-3}"

topics=(
  "product.created"
  "product.updated"
  "product.deleted"
)

echo "Creating topics on broker: $BROKER (partitions=$PARTITIONS)"
for topic in "${topics[@]}"; do
  rpk topic create "$topic" --brokers "$BROKER" --partitions "$PARTITIONS" --replicas 1 2>/dev/null && echo "  + $topic" || echo "  = $topic (exists)"
done

echo ""
echo "All topics:"
rpk topic list --brokers "$BROKER"
