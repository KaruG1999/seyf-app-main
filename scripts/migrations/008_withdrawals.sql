create table if not exists withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  type text not null default 'withdrawal' check (type = 'withdrawal'),
  status text not null default 'pending' check (
    status in ('pending', 'completed', 'failed')
  ),
  amount_mxn numeric(18, 2) not null check (amount_mxn >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists withdrawals_user_id_idx
  on withdrawals (user_id, created_at desc);

create index if not exists withdrawals_status_idx on withdrawals (status);
