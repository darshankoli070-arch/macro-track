-- Run this once in your Supabase project's SQL Editor (Supabase dashboard
-- > SQL Editor > New query > paste this whole file > Run).
--
-- This creates one table that stores every piece of app data as key/value
-- pairs per user (mirroring how the original Claude-artifact version stored
-- things), protected by row-level security so a user can only ever read or
-- write their own rows -- Supabase enforces this at the database level,
-- not just in the app's code.

create table if not exists kv_store (
  user_id uuid references auth.users(id) on delete cascade not null,
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table kv_store enable row level security;

create policy "Users can read their own data"
  on kv_store for select
  using (auth.uid() = user_id);

create policy "Users can insert their own data"
  on kv_store for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own data"
  on kv_store for update
  using (auth.uid() = user_id);

create policy "Users can delete their own data"
  on kv_store for delete
  using (auth.uid() = user_id);
