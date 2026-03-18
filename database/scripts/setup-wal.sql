-- Enable WAL for Change Data Capture (CDC)
-- This script configures PostgreSQL for logical replication

-- Set WAL level to logical (requires PostgreSQL restart)
-- ALTER SYSTEM SET wal_level = 'logical';

-- Create a publication for CDC
-- This publishes all changes to the specified tables
CREATE PUBLICATION iorder_cdc FOR TABLE
  users,
  products,
  orders,
  order_items,
  payments,
  notifications;

-- Create a replication slot for the CDC consumer
-- SELECT pg_create_logical_replication_slot('iorder_cdc_slot', 'pgoutput');

-- Verify WAL settings
-- SHOW wal_level;
-- SELECT * FROM pg_replication_slots;
-- SELECT * FROM pg_publication_tables;
