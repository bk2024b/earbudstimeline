-- EarbudsTimeline — données de départ
-- À exécuter après schema.sql
--
-- NOTE: les scores de performance (ANC, confort, appels, etc.) ne sont PAS
-- inventés dans ce seed. Ils seront ajoutés progressivement dans
-- earbuds_performance uniquement lorsqu'ils sont soutenus par des sources,
-- puis détaillés dans earbuds_evidence.

insert into brands (id, name, color) values
  ('apple',   'Apple',   '#F0F2F5'),
  ('samsung', 'Samsung', '#6C8CFF'),
  ('google',  'Google',  '#34D399'),
  ('sony',    'Sony',    '#FB7185'),
  ('nothing', 'Nothing', '#FACC15')
on conflict (id) do nothing;

insert into earbuds
  (id, brand_id, gamme, name, tagline, release_date, price, marquant, anc, battery_bud_h, battery_case_h, weight_g, water_rating, chip, bluetooth)
values
  -- Apple — AirPods
  ('ap1', 'apple', 'AirPods', 'AirPods (1re génération)', 'La fin du jack, le début d''une icône blanche', '2016-12-13', 159, true, false, 5, 24, 4, 'Non résistant', 'Apple W1', '4.2'),
  ('ap2', 'apple', 'AirPods', 'AirPods (2e génération)', 'Le chip H1 et « Dis Siri » en prime', '2019-03-20', 159, false, false, 5, 24, 4, 'Non résistant', 'Apple H1', '5.0'),
  ('ap3', 'apple', 'AirPods', 'AirPods (3e génération)', 'L''audio spatial descend dans la gamme classique', '2021-10-26', 179, true, false, 6, 30, 4.28, 'IPX4', 'Apple H1', '5.0'),
  ('ap4', 'apple', 'AirPods', 'AirPods 4', 'Le design ouvert, enfin abordable', '2024-09-20', 129, false, false, 5, 30, 4.3, 'IP54', 'Apple H2', '5.3'),
  ('ap4anc', 'apple', 'AirPods', 'AirPods 4 (ANC)', 'La réduction de bruit sort de la gamme Pro', '2024-09-20', 179, true, true, 4, 30, 4.3, 'IP54', 'Apple H2', '5.3'),
  -- Apple — AirPods Pro
  ('app1', 'apple', 'AirPods Pro', 'AirPods Pro (1re génération)', 'Premiers embouts intra-auriculaires chez Apple', '2019-10-30', 249, true, true, 4.5, 24, 5.4, 'IPX4', 'Apple H1', '5.0'),
  ('app2l', 'apple', 'AirPods Pro', 'AirPods Pro 2 (Lightning)', 'Le bond sonore : H2, audio adaptatif, 30h', '2022-09-23', 249, true, true, 6, 30, 5.3, 'IPX4', 'Apple H2', '5.3'),
  ('app2c', 'apple', 'AirPods Pro', 'AirPods Pro 2 (USB-C)', 'Même écouteur, nouveau port de charge', '2023-09-22', 249, false, true, 6, 30, 5.3, 'IP54', 'Apple H2', '5.3'),
  ('app3', 'apple', 'AirPods Pro', 'AirPods Pro 3', 'Capteur cardiaque et ANC doublée', '2025-09-19', 249, true, true, 8, 24, 5.5, 'IP57', 'Apple H2', '5.3'),
  -- Apple — AirPods Max
  ('apm1', 'apple', 'AirPods Max', 'AirPods Max', 'Apple s''attaque au casque premium', '2020-12-15', 549, true, true, 20, 20, 384.8, 'Non résistant', 'Apple H1', '5.0'),
  ('apm2', 'apple', 'AirPods Max', 'AirPods Max (USB-C)', 'Le Lightning s''efface enfin', '2024-09-20', 549, false, true, 20, 20, 384.8, 'Non résistant', 'Apple H1', '5.0'),

  -- Samsung — Galaxy Buds
  ('gb1', 'samsung', 'Galaxy Buds', 'Galaxy Buds', 'La réponse coréenne aux AirPods', '2019-03-08', 129, true, false, 6, 13, 5.6, 'IPX2', '—', '5.0'),
  ('gb2', 'samsung', 'Galaxy Buds', 'Galaxy Buds+', 'Le doublement d''autonomie qui change tout', '2020-02-14', 149, true, false, 11, 22, 6.3, 'IPX2', '—', '5.0'),
  ('gb3', 'samsung', 'Galaxy Buds', 'Galaxy Buds2', 'L''ANC descend dans la gamme grand public', '2021-08-27', 149, false, true, 5, 20, 5, 'IPX2', '—', '5.2'),
  ('gb4', 'samsung', 'Galaxy Buds', 'Galaxy Buds3', 'Le stem droit remplace enfin le haricot', '2024-07-24', 179, true, true, 6, 26, 5.7, 'IP57', '—', '5.4'),
  -- Samsung — Galaxy Buds Pro
  ('gbp1', 'samsung', 'Galaxy Buds Pro', 'Galaxy Buds Pro', 'Samsung découvre la réduction de bruit active', '2021-01-28', 199, true, true, 5, 18, 6.3, 'IPX7', '—', '5.0'),
  ('gbp2', 'samsung', 'Galaxy Buds Pro', 'Galaxy Buds2 Pro', 'Plus petits, toujours Pro', '2022-08-26', 229, false, true, 5, 18, 5.5, 'IPX7', '—', '5.3'),
  ('gbp3', 'samsung', 'Galaxy Buds Pro', 'Galaxy Buds3 Pro', 'Double transducteur et charge la plus rapide de la gamme', '2024-07-24', 249, true, true, 6, 26, 5.4, 'IP57', '—', '5.4'),
  -- Samsung — Galaxy Buds Live
  ('gbl1', 'samsung', 'Galaxy Buds Live', 'Galaxy Buds Live', 'La forme haricot qui divise', '2020-08-05', 169, true, true, 6, 21, 4.9, 'IPX2', '—', '5.0'),
  -- Samsung — Galaxy Buds FE
  ('gbfe1', 'samsung', 'Galaxy Buds FE', 'Galaxy Buds FE', 'L''essentiel Galaxy à moins de 100 $', '2023-10-04', 99, false, true, 5, 18.5, 5.7, 'IPX2', '—', '5.1'),

  -- Google — Pixel Buds
  ('pb1', 'google', 'Pixel Buds', 'Pixel Buds (1re génération)', 'Reliés par un fil, traduits par Google Assistant', '2017-11-15', 159, true, false, 5, 24, 6.9, 'Non résistant', '—', '4.1'),
  ('pb2', 'google', 'Pixel Buds', 'Pixel Buds (2e génération)', 'Enfin vraiment sans fil', '2020-04-28', 179, true, false, 5, 24, 5.8, 'IPX4', '—', '5.0'),
  -- Google — Pixel Buds A-Series
  ('pba', 'google', 'Pixel Buds A-Series', 'Pixel Buds A-Series', 'Les Pixel Buds à prix cassé', '2021-06-17', 99, true, false, 5, 24, 5.06, 'IPX4', '—', '5.0'),
  ('pb2a', 'google', 'Pixel Buds A-Series', 'Pixel Buds 2a', 'L''ANC du haut de gamme à 129 $', '2025-10-09', 129, true, true, 7, 20, 4.7, 'IP54', 'Google Tensor A1', '5.4'),
  -- Google — Pixel Buds Pro
  ('pbp1', 'google', 'Pixel Buds Pro', 'Pixel Buds Pro', 'Première puce dédiée et premier ANC Google', '2022-07-28', 199, true, true, 7, 20, 6.2, 'IPX4', '—', '5.0'),
  ('pbp2', 'google', 'Pixel Buds Pro', 'Pixel Buds Pro 2', 'La puce Tensor A1 s''invite dans l''oreille', '2024-08-22', 229, true, true, 8, 30, 4.7, 'IP54', 'Google Tensor A1', '5.3'),

  -- Sony — WF-1000X
  ('s1000x1', 'sony', 'WF-1000X', 'WF-1000X', 'Le pari (encore fragile) du sans-fil chez Sony', '2017-10-01', 199, true, true, 3, 9, 8.8, 'Non résistant', '—', '4.1'),
  ('s1000x3', 'sony', 'WF-1000X', 'WF-1000XM3', 'Le modèle qui a lancé la gamme XM', '2019-08-06', 229, true, true, 6, 24, 8.5, 'Non résistant', 'QN1e', '5.0'),
  ('s1000x4', 'sony', 'WF-1000X', 'WF-1000XM4', 'Le favori du grand public, ANC comprise', '2021-06-16', 279, true, true, 8, 24, 7.3, 'IPX4', 'V1', '5.2'),
  ('s1000x5', 'sony', 'WF-1000X', 'WF-1000XM5', 'Deux fois plus petits, tout aussi capables', '2023-07-25', 299, true, true, 8, 24, 5.9, 'IPX4', 'V2 + HD Noise Canceling', '5.3'),
  -- Sony — LinkBuds
  ('lb1', 'sony', 'LinkBuds', 'LinkBuds', 'Le trou au centre du transducteur, littéralement', '2022-03-02', 179, true, false, 5.5, 17.5, 4.1, 'IPX4', '—', '5.2'),
  ('lbs1', 'sony', 'LinkBuds', 'LinkBuds S', 'Le format LinkBuds, avec réduction de bruit', '2022-06-24', 199, false, true, 6, 20, 4.8, 'IPX4', 'V1', '5.2'),

  -- Nothing — Ear
  ('ne1', 'nothing', 'Ear', 'Ear (1)', 'La transparence comme signature', '2022-08-17', 99, true, true, 5.7, 34, 4.7, 'IP54', '—', '5.2'),
  ('ne2', 'nothing', 'Ear', 'Ear (2)', 'Le transducteur en céramique fait ses débuts', '2023-03-22', 149, true, true, 6.3, 36, 4.5, 'IP54', '—', '5.3'),
  ('ne2024', 'nothing', 'Ear', 'Ear', 'La transparence, version plus discrète', '2024-09-05', 179, false, true, 6, 40.5, 4.7, 'IP55', '—', '5.3'),
  -- Nothing — Ear (a)
  ('nea', 'nothing', 'Ear (a)', 'Ear (a)', 'Le jaune Nothing à prix serré', '2024-04-18', 99, true, true, 5.5, 40, 4.6, 'IP54', '—', '5.3'),
  -- Nothing — Ear (stick)
  ('nestick', 'nothing', 'Ear (stick)', 'Ear (stick)', 'Un rouge à lèvres pour boîtier', '2023-04-27', 99, true, false, 7, 29, 4.4, 'Non résistant', '—', '5.3')
on conflict (id) do nothing;

-- Performance / evidence
-- Intentionally empty: no subjective performance score is seeded without evidence.
-- Add verified records to earbuds_performance and earbuds_evidence after sourcing.


/* ========================================================================
   ANC INTELLIGENCE ENGINE
   ========================================================================

   Cette section est volontairement composée de fonctions et de vues
   calculées : aucune note ANC n'est copiée dans earbuds.

   Pipeline :

     earbuds_evidence
           ↓
     anc_environment_mapping
           ↓
     anc_environment_scores
           ↓
     anc_scores

   Le moteur distingue :
     - les preuves DIRECTES : airplane, train, traffic, office, voices ;
     - les preuves SUPPORTING : low_frequency, utiles comme signal secondaire ;
     - les données ambiguës : elles restent hors des sous-scores.

   Objectif : séparer la PERFORMANCE observée de la QUALITÉ/Couverture
   documentaire. Un produit peut avoir un ANC Score élevé tout en ayant
   une couverture faible ; cela signifie alors "très bon sur les preuves
   disponibles", et non "prouvé dans tous les environnements".
*/

/* ------------------------------------------------------------------------
   1. Normalisation des appréciations qualitatives

   Convertit les valeurs textuelles utilisées par les sources en une échelle
   commune 0–100. Les valeurs quantitatives numériques restent numériques.
------------------------------------------------------------------------ */

create or replace function public.anc_qualitative_to_score(
  p_value text
)
returns numeric
language sql
immutable
as $$
  select case lower(trim(p_value))
    when 'exceptional' then 95
    when 'outstanding' then 95
    when 'excellent' then 90
    when 'amazing' then 90
    when 'very strong' then 85
    when 'strong' then 80
    when 'good' then 70
    when 'moderate' then 60
    when 'weak' then 40
    when 'poor' then 25
    else null
  end;
$$;

/* ------------------------------------------------------------------------
   2. Poids documentaire de la source

   Ce coefficient mesure la force de l'EVIDENCE, pas la performance du
   produit. Une source éditoriale n'est donc pas considérée comme disant
   qu'un produit est moins performant ; elle fournit simplement une preuve
   moins reproductible qu'une mesure laboratoire.
------------------------------------------------------------------------ */

create or replace function public.anc_source_weight(
  p_source_type text
)
returns numeric
language sql
immutable
as $$
  select case lower(trim(p_source_type))
    when 'laboratory' then 1.00
    when 'editorial_test' then 0.85
    when 'community' then 0.70
    else 0.75
  end;
$$;

/* ------------------------------------------------------------------------
   3. Normalisation des preuves ANC

   La vue conserve les données originales et ajoute :
     - normalized_score
     - evidence_weight
     - confidence_weight

   Important : une preuve sans noise_category exploitable n'est PAS forcée
   dans un environnement. Cela évite de transformer arbitrairement
   "static noise", "shopping mall", "snoring", etc. en faux tests Office,
   Voices ou Traffic.
------------------------------------------------------------------------ */

drop view if exists public.earbuds_anc_environment_normalized;

create view public.earbuds_anc_environment_normalized
as
select
  ev.id,
  ev.earbud_id,

  ev.source_name,
  ev.source_type,
  ev.confidence,

  ev.noise_category,
  ev.measurement_context,
  ev.measurement_type,

  ev.value,
  ev.source_url,
  ev.notes,

  case
    when ev.value ~ '^[0-9]+(\.[0-9]+)?$'
      then greatest(0, least(100, ev.value::numeric))

    when lower(trim(ev.value)) in ('exceptional', 'outstanding')
      then 95

    when lower(trim(ev.value)) in ('excellent', 'amazing')
      then 90

    when lower(trim(ev.value)) = 'very strong'
      then 85

    when lower(trim(ev.value)) = 'strong'
      then 80

    when lower(trim(ev.value)) = 'good'
      then 70

    when lower(trim(ev.value)) = 'moderate'
      then 60

    when lower(trim(ev.value)) = 'weak'
      then 40

    when lower(trim(ev.value)) = 'poor'
      then 25

    else null
  end as normalized_score,

  public.anc_source_weight(ev.source_type)
    as evidence_weight,

  case
    when lower(trim(ev.confidence)) = 'high' then 1.00
    when lower(trim(ev.confidence)) = 'medium' then 0.75
    when lower(trim(ev.confidence)) = 'low' then 0.50
    else 0.75
  end as confidence_weight

from public.earbuds_evidence ev
where ev.metric = 'anc';

/* ------------------------------------------------------------------------
   4. Classification des preuves par environnement

   Taxonomie actuelle :

     Travel  → airplane, train
     Office  → office
     Traffic → traffic
     Voices  → voices

   low_frequency est uniquement un signal SUPPORTING.

   Les autres catégories restent NULL tant qu'une règle de classification
   explicite n'a pas été définie.
------------------------------------------------------------------------ */

drop view if exists public.earbuds_anc_environment_mapping;

create view public.earbuds_anc_environment_mapping
as
select
  ev.id,
  ev.earbud_id,

  ev.value,
  ev.measurement_type,
  ev.measurement_context,
  ev.noise_category,

  ev.source_name,
  ev.source_type,
  ev.confidence,
  ev.source_url,
  ev.notes,

  case
    when ev.noise_category in ('airplane', 'train')
      then 'travel'

    when ev.noise_category = 'traffic'
      then 'traffic'

    when ev.noise_category = 'office'
      then 'office'

    when ev.noise_category = 'voices'
      then 'voices'

    when ev.noise_category = 'low_frequency'
      then 'supporting_low_frequency'

    else null
  end as environment,

  case
    when ev.noise_category in (
      'airplane',
      'train',
      'traffic',
      'office',
      'voices'
    )
      then 'direct'

    when ev.noise_category = 'low_frequency'
      then 'supporting'

    else null
  end as evidence_role

from public.earbuds_evidence ev
where ev.metric = 'anc';

/* ------------------------------------------------------------------------
   5. Sous-scores ANC par environnement

   Les preuves DIRECTES ont un poids de 1.00.
   Les preuves SUPPORTING ont un poids de 0.35.

   Les coefficients de source et de confiance sont ensuite appliqués.

   Résultat :
     - anc_travel_score
     - anc_office_score
     - anc_traffic_score
     - anc_voices_score
     - couverture documentaire
     - nombre de preuves/sources
------------------------------------------------------------------------ */

drop view if exists public.earbuds_anc_environment_scores;

create view public.earbuds_anc_environment_scores
as
with evidence as (
  select
    m.earbud_id,
    m.environment,
    m.evidence_role,
    m.source_name,
    m.source_type,
    m.confidence,
    m.value,

    case
      when m.value ~ '^[0-9]+(\.[0-9]+)?$'
        then greatest(0, least(100, m.value::numeric))

      when lower(trim(m.value)) in ('exceptional', 'outstanding')
        then 95

      when lower(trim(m.value)) in ('excellent', 'amazing')
        then 90

      when lower(trim(m.value)) = 'very strong'
        then 85

      when lower(trim(m.value)) = 'strong'
        then 80

      when lower(trim(m.value)) = 'good'
        then 70

      when lower(trim(m.value)) = 'moderate'
        then 60

      when lower(trim(m.value)) = 'weak'
        then 40

      when lower(trim(m.value)) = 'poor'
        then 25

      else null
    end as normalized_score,

    case
      when m.evidence_role = 'direct' then 1.00
      when m.evidence_role = 'supporting' then 0.35
      else 0
    end as role_weight,

    public.anc_source_weight(m.source_type)
      as source_weight,

    case
      when lower(trim(m.confidence)) = 'high' then 1.00
      when lower(trim(m.confidence)) = 'medium' then 0.75
      when lower(trim(m.confidence)) = 'low' then 0.50
      else 0.75
    end as confidence_weight

  from public.earbuds_anc_environment_mapping m
  where m.environment in (
    'travel',
    'office',
    'traffic',
    'voices',
    'supporting_low_frequency'
  )
),

evidence_weighted as (
  select
    *,

    normalized_score
      * role_weight
      * source_weight
      * confidence_weight
      as weighted_score,

    role_weight
      * source_weight
      * confidence_weight
      as total_weight

  from evidence
  where normalized_score is not null
),

aggregated as (
  select
    earbud_id,

    round(
      sum(weighted_score) filter (
        where environment in ('travel', 'supporting_low_frequency')
      )
      /
      nullif(
        sum(total_weight) filter (
          where environment in ('travel', 'supporting_low_frequency')
        ),
        0
      ),
      2
    ) as anc_travel_score,

    round(
      sum(weighted_score) filter (
        where environment = 'office'
      )
      /
      nullif(
        sum(total_weight) filter (
          where environment = 'office'
        ),
        0
      ),
      2
    ) as anc_office_score,

    round(
      sum(weighted_score) filter (
        where environment in ('traffic', 'supporting_low_frequency')
      )
      /
      nullif(
        sum(total_weight) filter (
          where environment in ('traffic', 'supporting_low_frequency')
        ),
        0
      ),
      2
    ) as anc_traffic_score,

    round(
      sum(weighted_score) filter (
        where environment = 'voices'
      )
      /
      nullif(
        sum(total_weight) filter (
          where environment = 'voices'
        ),
        0
      ),
      2
    ) as anc_voices_score,

    count(*) filter (
      where evidence_role = 'direct'
    ) as direct_evidence_count,

    count(*) filter (
      where evidence_role = 'supporting'
    ) as supporting_evidence_count,

    count(distinct source_name)
      as source_count,

    count(distinct environment) filter (
      where evidence_role = 'direct'
    ) as environment_count

  from evidence_weighted
  group by earbud_id
)

select
  a.*,

  round(
    (a.environment_count / 4.0) * 100,
    2
  ) as coverage_score,

  round(
    least(
      100,
      (least(a.source_count, 3) / 3.0 * 30)
      +
      (least(a.direct_evidence_count, 6) / 6.0 * 40)
      +
      (a.environment_count / 4.0 * 30)
    ),
    2
  ) as confidence_score

from aggregated a;

/* ------------------------------------------------------------------------
   6. ANC Score /100

   Poids métier :
     Travel  = 30 %
     Office  = 25 %
     Traffic = 25 %
     Voices  = 20 %

   IMPORTANT : un sous-score NULL n'est PAS traité comme zéro.
   Le score est normalisé uniquement sur les dimensions documentées.

   Ainsi :
     Traffic = 100 seul → ANC Score 100, mais couverture 25 %.

   Cela sépare correctement :
     - "performance sur les preuves disponibles"
     - "niveau de couverture des preuves"
------------------------------------------------------------------------ */

drop view if exists public.earbuds_anc_scores;

create view public.earbuds_anc_scores
as
with base as (
  select
    s.*,

    0.30::numeric as travel_weight,
    0.25::numeric as office_weight,
    0.25::numeric as traffic_weight,
    0.20::numeric as voices_weight

  from public.earbuds_anc_environment_scores s
),

weighted as (
  select
    *,

    (
      case when anc_travel_score is not null then travel_weight else 0 end
      +
      case when anc_office_score is not null then office_weight else 0 end
      +
      case when anc_traffic_score is not null then traffic_weight else 0 end
      +
      case when anc_voices_score is not null then voices_weight else 0 end
    ) as available_weight,

    coalesce(anc_travel_score * travel_weight, 0)
      + coalesce(anc_office_score * office_weight, 0)
      + coalesce(anc_traffic_score * traffic_weight, 0)
      + coalesce(anc_voices_score * voices_weight, 0)
      as weighted_total

  from base
),

final as (
  select
    *,
    round(
      weighted_total / nullif(available_weight, 0),
      2
    ) as anc_score
  from weighted
)

select
  earbud_id,

  anc_travel_score,
  anc_office_score,
  anc_traffic_score,
  anc_voices_score,

  anc_score,

  direct_evidence_count,
  supporting_evidence_count,
  environment_count,
  source_count,

  coverage_score,
  confidence_score,

  (
    case when anc_travel_score is not null then 1 else 0 end
    + case when anc_office_score is not null then 1 else 0 end
    + case when anc_traffic_score is not null then 1 else 0 end
    + case when anc_voices_score is not null then 1 else 0 end
  ) as scored_dimensions,

  round(
    (
      (
        case when anc_travel_score is not null then 1 else 0 end
        + case when anc_office_score is not null then 1 else 0 end
        + case when anc_traffic_score is not null then 1 else 0 end
        + case when anc_voices_score is not null then 1 else 0 end
      ) / 4.0
    ) * 100,
    2
  ) as score_coverage

from final;

/* ------------------------------------------------------------------------
   7. Correction de classification connue

   L'AirPods Pro 3 possède une preuve explicite "traffic" qui doit être
   classée comme telle. La donnée source reste inchangée ; on ne fait ici
   qu'une correction de catégorisation.

   Cette instruction est volontairement conditionnelle et idempotente.
------------------------------------------------------------------------ */

update public.earbuds_evidence
set noise_category = 'traffic'
where id = 8
  and metric = 'anc'
  and measurement_context = 'traffic'
  and noise_category is null;

/* ------------------------------------------------------------------------
   8. Contrôle rapide après seed
------------------------------------------------------------------------ */

-- select *
-- from public.earbuds_anc_scores
-- order by anc_score desc nulls last;

-- Contrôle de couverture :
-- select
--   count(*) as scored_earbuds,
--   count(*) filter (where score_coverage = 100) as fully_covered,
--   count(*) filter (where score_coverage < 100) as partially_covered
-- from public.earbuds_anc_scores;
