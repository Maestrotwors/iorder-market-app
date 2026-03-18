#!/bin/bash
# Create RedPanda topics for iOrder Market

BROKER="localhost:19092"

topics=(
  "user.registered"
  "user.logged_in"
  "order.created"
  "order.status_changed"
  "order.cancelled"
  "payment.initiated"
  "payment.completed"
  "payment.failed"
  "product.created"
  "product.updated"
  "product.deleted"
  "stock.updated"
  "notification.send"
  "cdc.change"
)

for topic in "${topics[@]}"; do
  echo "Creating topic: $topic"
  rpk topic create "$topic" --brokers "$BROKER" --partitions 3 --replicas 1
done

echo "All topics created successfully!"
rpk topic list --brokers "$BROKER"
