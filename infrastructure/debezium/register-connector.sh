#!/bin/bash
# Register PostgreSQL CDC connector in Debezium (products table)
# Usage: bash infrastructure/debezium/register-connector.sh

DEBEZIUM_HOST="${DEBEZIUM_HOST:-localhost}"
DEBEZIUM_PORT="${DEBEZIUM_PORT:-8083}"

echo "Waiting for Debezium Connect to be ready..."
for i in $(seq 1 30); do
  if curl -sf "http://${DEBEZIUM_HOST}:${DEBEZIUM_PORT}/connectors" > /dev/null 2>&1; then
    echo "Debezium Connect is ready!"
    break
  fi
  echo "Attempt $i: Debezium not ready, waiting 5s..."
  sleep 5
done

echo "Registering PostgreSQL CDC connector (products table)..."
curl -sf -X PUT "http://${DEBEZIUM_HOST}:${DEBEZIUM_PORT}/connectors/iorder-products-cdc/config" \
  -H "Content-Type: application/json" \
  -d '{
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "'"${DB_HOST:-postgres}"'",
    "database.port": "5432",
    "database.user": "'"${DB_USER:-iorder}"'",
    "database.password": "'"${DB_PASSWORD:-iorder_secret}"'",
    "database.dbname": "'"${DB_NAME:-iorder_db}"'",
    "topic.prefix": "cdc",
    "schema.include.list": "public",
    "table.include.list": "public.products",
    "plugin.name": "pgoutput",
    "slot.name": "iorder_products_slot",
    "publication.autocreate.mode": "all_tables",
    "key.converter": "org.apache.kafka.connect.json.JsonConverter",
    "key.converter.schemas.enable": false,
    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
    "value.converter.schemas.enable": false,
    "tombstones.on.delete": false,
    "transforms": "unwrap",
    "transforms.unwrap.type": "io.debezium.transforms.ExtractNewRecordState",
    "transforms.unwrap.drop.tombstones": true,
    "transforms.unwrap.delete.handling.mode": "rewrite"
  }'

echo ""
echo "Connector status:"
curl -sf "http://${DEBEZIUM_HOST}:${DEBEZIUM_PORT}/connectors/iorder-products-cdc/status" | python3 -m json.tool 2>/dev/null || \
  curl -sf "http://${DEBEZIUM_HOST}:${DEBEZIUM_PORT}/connectors/iorder-products-cdc/status"
