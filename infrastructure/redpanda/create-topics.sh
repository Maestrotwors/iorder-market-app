#!/bin/bash
# Create RedPanda topics for iOrder Market
# Usage: bash infrastructure/redpanda/create-topics.sh [broker]

BROKER="${1:-localhost:19092}"

topics=(
  "product.created"
  "product.updated"
  "product.deleted"
)

echo "Creating topics on broker: $BROKER"
for topic in "${topics[@]}"; do
  rpk topic create "$topic" --brokers "$BROKER" --partitions 3 --replicas 1 2>/dev/null && echo "  + $topic" || echo "  = $topic (exists)"
done

echo ""
echo "All topics:"
rpk topic list --brokers "$BROKER"
