create table if not exists transaction_events (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (
    entity_type in ('deposit', 'advance', 'withdrawal')
  ),
  entity_id uuid not null,
  from_status text,
  to_status text not null,
  actor text not null default 'system',
  timestamp timestamptz not null default now()
);

create index if not exists transaction_events_entity_idx
  on transaction_events (entity_type, entity_id, timestamp desc);

create index if not exists transaction_events_timestamp_idx
  on transaction_events (timestamp desc);
