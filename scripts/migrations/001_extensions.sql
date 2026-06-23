-- Core extensions for UUID generation and migration bookkeeping.
create extension if not exists pgcrypto;

create table if not exists schema_migrations (
  version text primary key,
  applied_at timestamptz not null default now()
);
