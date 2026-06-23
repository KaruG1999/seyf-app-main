create table if not exists advances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  type text not null default 'advance' check (type = 'advance'),
  status text not null default 'pending' check (
    status in ('pending', 'completed', 'failed', 'liquidated')
  ),
  amount_mxn numeric(18, 2) not null check (amount_mxn >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists advances_user_id_idx
  on advances (user_id, created_at desc);

create index if not exists advances_status_idx on advances (status);
