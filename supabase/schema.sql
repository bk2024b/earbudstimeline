-- EarbudsTimeline — schéma Supabase
-- À exécuter dans l'éditeur SQL de votre projet Supabase, avant seed.sql
--
-- Régénéré le 2026-08-20 pour refléter l'état réel de la base de production
-- (reconstruit à partir de l'usage effectif du code : lib/earbudsCsv.js,
-- lib/qualityScore.js, components/admin/EarbudForm.js). L'ancienne version de
-- ce fichier ne listait que les colonnes du lancement initial et avait dérivé
-- par rapport aux colonnes ajoutées depuis via des migrations ad-hoc jamais
-- reportées ici (image_url, usb_c, multipoint, codec, tagline_en, et tout le
-- standard DATA V1). Un clone frais du repo suivant le README aurait donc
-- produit une base incomplète, cassant les pages comparateur et ANC finder.
--
-- Sur un projet déjà existant, utilisez plutôt migrate_data_v1.sql (ALTER
-- TABLE idempotents) — ce fichier-ci reste la référence "table rasée /
-- nouveau projet".

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
  tagline_en text,
  release_date date not null,
  price numeric,
  marquant boolean not null default false,
  anc boolean not null default false,
  battery_bud_h numeric not null,
  battery_case_h numeric not null,
  weight_g numeric not null,
  water_rating text not null default 'Non résistant',
  chip text not null default '—',
  bluetooth text not null,
  usb_c boolean not null default false,
  multipoint boolean not null default false,
  codec text not null default '—',
  buy_url text,
  image_url text,

  -- Standard DATA V1 — champs optionnels ajoutés après le lancement initial
  -- (voir lib/earbudsCsv.js : CSV_COLUMNS_DATA_V1). Absents = simplement vides ;
  -- l'import CSV historique continue de fonctionner sans eux.
  family text,
  generation text,
  variant text,
  announcement_date date,
  status text not null default 'released',
  type text,
  transparency boolean not null default false,
  codecs text[],
  charging_time_h numeric,
  wireless_charging boolean not null default false,
  microphones text,
  spatial_audio boolean not null default false,
  ecosystem text,
  app text,
  image_count integer not null default 0,
  source_primary text,
  source_secondary text,
  source_checked_at date,
  data_confidence text,
  notes text,

  -- Quality Score DATA V1 — recalculé côté serveur avant chaque insert/update
  -- (voir lib/qualityScore.js), jamais saisi manuellement.
  quality_score integer not null default 0 check (quality_score between 0 and 100),
  qa_status text not null default 'NEEDS_RESEARCH'
    check (qa_status in ('VERIFIED', 'GOOD', 'INCOMPLETE', 'NEEDS_RESEARCH'))
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
