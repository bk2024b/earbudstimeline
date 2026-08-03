-- EarbudsTimeline — schéma Supabase
-- À exécuter dans l'éditeur SQL de votre projet Supabase, avant seed.sql

create table if not exists brands (
  id text primary key,
  name text not null,
  color text not null
);

create table if not exists earbuds (
  id text primary key,
  brand_id text not null references brands(id) on delete cascade,
  gamme text not null,
  name text not null,
  tagline text not null,
  release_date date not null,
  price numeric,
  marquant boolean not null default false,
  anc boolean not null default false,
  battery_bud_h numeric not null,
  battery_case_h numeric not null,
  weight_g numeric not null,
  water_rating text not null,
  chip text not null default '—',
  bluetooth text not null
);

create index if not exists earbuds_brand_idx on earbuds (brand_id);
create index if not exists earbuds_gamme_idx on earbuds (brand_id, gamme);
create index if not exists earbuds_date_idx on earbuds (release_date);

alter table brands enable row level security;
alter table earbuds enable row level security;

drop policy if exists "Public read brands" on brands;
create policy "Public read brands" on brands for select using (true);

drop policy if exists "Public read earbuds" on earbuds;
create policy "Public read earbuds" on earbuds for select using (true);
