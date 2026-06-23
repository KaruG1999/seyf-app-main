create table if not exists user_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users (id) on delete cascade,
  pollar_wallet_id text unique,
  stellar_public_key text unique,
  status text not null default 'provisioning' check (
    status in ('provisioning', 'active', 'error')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_wallets_user_id_idx on user_wallets (user_id);
