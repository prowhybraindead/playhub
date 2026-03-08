create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  banner_url text,
  bio text,
  status text default 'Exploring the deep ocean',
  is_online boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null check (plan in ('free', 'dolphin_friend', 'dolphin_neon')) default 'free',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.currency_rates (
  currency_code text primary key,
  rate_to_usd numeric(18, 8) not null,
  last_updated timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('free', 'dolphin_friend', 'dolphin_neon')),
  amount_usd numeric(12, 2) not null,
  currency_code text not null,
  converted_amount numeric(12, 2) not null,
  status text not null check (status in ('success', 'failed')),
  created_at timestamptz not null default now()
);

drop table if exists public.chat_messages cascade;
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  room_id text not null default 'global',
  message text not null check (char_length(message) between 1 and 1000),
  created_at timestamptz not null default now()
);

create table if not exists public.i18n_translations (
  id uuid primary key default gen_random_uuid(),
  original_text text not null,
  translated_text text not null,
  target_language text not null,
  created_at timestamptz not null default now(),
  unique(original_text, target_language)
);



create index if not exists chat_messages_room_created_idx on public.chat_messages(room_id, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, is_online)
  values (new.id, split_part(new.email, '@', 1), false)
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, plan)
  values (new.id, 'free')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.currency_rates enable row level security;
alter table public.transactions enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "profiles_select_own_or_public" on public.profiles;
create policy "profiles_select_own_or_public"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own"
on public.profiles for all
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
on public.subscriptions for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "subscriptions_upsert_own" on public.subscriptions;
create policy "subscriptions_upsert_own"
on public.subscriptions for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "subscriptions_update_own" on public.subscriptions;
create policy "subscriptions_update_own"
on public.subscriptions for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "currency_rates_read_all" on public.currency_rates;
create policy "currency_rates_read_all"
on public.currency_rates for select
to authenticated
using (true);

drop policy if exists "currency_rates_write_authenticated" on public.currency_rates;
create policy "currency_rates_write_authenticated"
on public.currency_rates for all
to authenticated
using (true)
with check (true);

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own"
on public.transactions for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own"
on public.transactions for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "chat_messages_read" on public.chat_messages;
create policy "chat_messages_read"
on public.chat_messages for select
to authenticated
using (true);

drop policy if exists "chat_messages_insert_own_or_bot" on public.chat_messages;
create policy "chat_messages_insert_own_or_bot"
on public.chat_messages for insert
to authenticated
with check (user_id is null or auth.uid() = user_id);

alter table public.i18n_translations enable row level security;

drop policy if exists "i18n_translations_read_all" on public.i18n_translations;
create policy "i18n_translations_read_all"
on public.i18n_translations for select
to public
using (true);

drop policy if exists "i18n_translations_insert" on public.i18n_translations;
create policy "i18n_translations_insert"
on public.i18n_translations for insert
to public
with check (true);

-- Safely add tables to realtime publication by catching exceptions if they are already added
DO $$
BEGIN
    alter publication supabase_realtime add table public.profiles;
EXCEPTION WHEN duplicate_object THEN
    -- do nothing
END $$;

DO $$
BEGIN
    alter publication supabase_realtime add table public.chat_messages;
EXCEPTION WHEN duplicate_object THEN
    -- do nothing
END $$;

DO $$
BEGIN
    alter publication supabase_realtime add table public.subscriptions;
EXCEPTION WHEN duplicate_object THEN
    -- do nothing
END $$;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
on storage.objects for select
to public
using (bucket_id = 'avatars');

drop policy if exists "avatars_upload_own" on storage.objects;
create policy "avatars_upload_own"
on storage.objects for insert
to authenticated
with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "banners_public_read" on storage.objects;
create policy "banners_public_read"
on storage.objects for select
to public
using (bucket_id = 'banners');

drop policy if exists "banners_upload_own" on storage.objects;
create policy "banners_upload_own"
on storage.objects for insert
to authenticated
with check (bucket_id = 'banners' and auth.uid()::text = (storage.foldername(name))[1]);

-- Reload PostgREST schema cache to ensure API sees new columns
NOTIFY pgrst, 'reload schema';
