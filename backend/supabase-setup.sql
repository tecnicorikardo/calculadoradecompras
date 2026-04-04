-- Execute este SQL no Supabase SQL Editor
-- https://supabase.com/dashboard/project/eunbgdzfclupauicnqjx/sql

create table if not exists pro_users (
  device_id text primary key,
  activated_at timestamptz not null default now()
);

-- Desabilita RLS (acesso só via service_role no backend)
alter table pro_users disable row level security;
