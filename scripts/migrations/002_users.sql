create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  phone text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_email_idx on users (email) where email is not null;
