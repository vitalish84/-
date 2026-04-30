-- הרץ את הקוד הזה ב-Supabase Dashboard → SQL Editor

create table if not exists public.homeowners (
  id          text        primary key,
  name        text        not null,
  apartment   text        not null,
  building    text        not null default '',
  phone       text        not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.requirements (
  homeowner_id  text        primary key references public.homeowners(id) on delete cascade,
  categories    jsonb       not null default '{}',
  updated_at    timestamptz not null default now()
);

-- אפשר גישה ציבורית (אפליקציה קהילתית)
alter table public.homeowners enable row level security;
alter table public.requirements enable row level security;

create policy "public_all" on public.homeowners
  for all to anon using (true) with check (true);

create policy "public_all" on public.requirements
  for all to anon using (true) with check (true);
