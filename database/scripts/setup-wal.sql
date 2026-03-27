-- Enable WAL for Change Data Capture (CDC)
-- This script configures PostgreSQL for logical replication
-- WAL level is set via PostgreSQL startup parameters (command args)

-- Create a publication for CDC (idempotent)
-- Publishes all changes to existing Prisma-managed tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'iorder_cdc') THEN
    CREATE PUBLICATION iorder_cdc FOR TABLE
      "user",
      session,
      account,
      verification,
      products;
    RAISE NOTICE 'Publication iorder_cdc created.';
  ELSE
    RAISE NOTICE 'Publication iorder_cdc already exists, skipping.';
  END IF;
END
$$;

-- Create a replication slot for the CDC consumer (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_replication_slots WHERE slot_name = 'iorder_cdc_slot') THEN
    PERFORM pg_create_logical_replication_slot('iorder_cdc_slot', 'pgoutput');
    RAISE NOTICE 'Replication slot iorder_cdc_slot created.';
  ELSE
    RAISE NOTICE 'Replication slot iorder_cdc_slot already exists, skipping.';
  END IF;
END
$$;

-- Verify WAL settings
-- SHOW wal_level;
-- SELECT * FROM pg_replication_slots;
-- SELECT * FROM pg_publication_tables;
