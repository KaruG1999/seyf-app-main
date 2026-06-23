create table if not exists cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  cycle_days integer not null default 28 check (cycle_days > 0),
  principal_mxn numeric(18, 2) not null default 0 check (principal_mxn >= 0),
  start_date timestamptz not null,
  expected_end_date timestamptz not null,
  reference_rate_annual_percent numeric(8, 4),
  projected_yield_mxn numeric(18, 2),
  status text not null default 'active' check (
    status in ('active', 'completed', 'cancelled')
  ),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cycles_user_id_idx
  on cycles (user_id, created_at desc);
