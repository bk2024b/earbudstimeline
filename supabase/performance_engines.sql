/* ============================================================================
   EARbudstimeline — PERFORMANCE ENGINES
   ============================================================================

   Purpose
   -------
   Add independent performance engines for:
     - sound
     - calls / microphone
     - comfort
     - battery

   This file is intentionally separate from seed.sql and from the existing ANC
   engine. It does NOT alter earbuds, ANC functions, Finder logic, or existing
   scores.

   Design principles
   -----------------
   1. Never invent a performance score when there is no evidence.
   2. Numeric evidence is kept on the 0–100 scale.
   3. Qualitative evidence is normalized only when the wording is explicit.
   4. Source/confidence weights affect evidence reliability, not the product's
      intrinsic performance.
   5. Missing dimensions are NULL, never 0.
   6. Every engine exposes score_coverage, evidence_count, source_count and
      status so downstream Overall / Value-per-Dollar logic can penalize weak
      documentation instead of confusing "unknown" with "bad".

   Expected existing earbuds_evidence columns:
     earbud_id, metric, value, measurement_type, measurement_context,
     noise_category, source_url, source_name, source_type, confidence, notes

   Supported metric values already enforced by the existing CHECK constraint:
     anc, comfort, calls, sound, latency, battery, value, overall
============================================================================ */

/* --------------------------------------------------------------------------
   1. Generic qualitative normalization
   -------------------------------------------------------------------------- */
create or replace function public.performance_qualitative_to_score(p_value text)
returns numeric
language sql
immutable
as $$
  select case lower(trim(coalesce(p_value, '')))
    when 'exceptional' then 95
    when 'outstanding' then 95
    when 'excellent' then 90
    when 'amazing' then 90
    when 'very strong' then 85
    when 'very good' then 85
    when 'strong' then 80
    when 'good' then 70
    when 'moderate' then 60
    when 'average' then 55
    when 'fair' then 50
    when 'weak' then 40
    when 'poor' then 25
    when 'very poor' then 15
    when 'insufficient_evidence' then null
    when 'insufficient evidence' then null
    else null
  end;
$$;

/* --------------------------------------------------------------------------
   2. Source reliability
   -------------------------------------------------------------------------- */
create or replace function public.performance_source_weight(p_source_type text)
returns numeric
language sql
immutable
as $$
  select case lower(trim(coalesce(p_source_type, '')))
    when 'laboratory' then 1.00
    when 'editorial_test' then 0.85
    when 'official' then 0.80
    when 'manufacturer' then 0.70
    when 'aggregated' then 0.75
    when 'community' then 0.65
    else 0.60
  end;
$$;

/* --------------------------------------------------------------------------
   3. Confidence reliability
   -------------------------------------------------------------------------- */
create or replace function public.performance_confidence_weight(p_confidence text)
returns numeric
language sql
immutable
as $$
  select case lower(trim(coalesce(p_confidence, '')))
    when 'high' then 1.00
    when 'medium' then 0.80
    when 'low' then 0.60
    else 0.70
  end;
$$;

/* --------------------------------------------------------------------------
   4. Normalize a single evidence value

   Numeric values are accepted only when they are already between 0 and 100.
   Qualitative values use the explicit dictionary above.
   Other text remains NULL rather than being guessed.
   -------------------------------------------------------------------------- */
create or replace function public.performance_value_to_score(p_value text)
returns numeric
language plpgsql
immutable
as $$
declare
  v numeric;
begin
  begin
    v := trim(p_value)::numeric;
  exception when others then
    v := null;
  end;

  if v is not null then
    if v >= 0 and v <= 100 then
      return v;
    end if;
    return null;
  end if;

  return public.performance_qualitative_to_score(p_value);
end;
$$;

/* --------------------------------------------------------------------------
   5. Common normalized evidence view
   -------------------------------------------------------------------------- */
create or replace view public.performance_evidence_normalized as
select
  e.earbud_id,
  e.metric,
  e.value,
  e.measurement_type,
  e.measurement_context,
  e.noise_category,
  e.source_url,
  e.source_name,
  e.source_type,
  e.confidence,
  e.notes,
  public.performance_value_to_score(e.value) as normalized_score,
  public.performance_source_weight(e.source_type)
    * public.performance_confidence_weight(e.confidence) as evidence_weight
from public.earbuds_evidence e
where e.metric in ('sound', 'calls', 'comfort', 'battery');

/* --------------------------------------------------------------------------
   6. Generic aggregation helper

   Uses weighted mean. Duplicate evidence from the same source/context is not
   silently collapsed: it remains evidence, but source_count is exposed so
   consumers can distinguish broad corroboration from repeated claims.
   -------------------------------------------------------------------------- */
create or replace view public.performance_metric_scores as
select
  e.earbud_id,
  e.metric,
  round(
    sum(e.normalized_score * e.evidence_weight)
      / nullif(sum(e.evidence_weight), 0),
    2
  ) as score,
  count(*) filter (where e.normalized_score is not null) as evidence_count,
  count(distinct e.source_name) filter (where e.normalized_score is not null) as source_count,
  count(distinct e.measurement_context)
    filter (where e.normalized_score is not null and nullif(trim(e.measurement_context), '') is not null)
    as context_count
from public.performance_evidence_normalized e
where e.normalized_score is not null
group by e.earbud_id, e.metric;

/* --------------------------------------------------------------------------
   7. Sound engine

   Coverage is based on distinct documented contexts, capped at four. We do
   not require arbitrary context names; evidence can therefore be imported
   from different providers without schema coupling.
   -------------------------------------------------------------------------- */
create or replace view public.earbuds_sound_scores as
select
  b.id as earbud_id,
  b.name as earbud,
  coalesce(s.score, null) as sound_score,
  coalesce(s.context_count, 0) as evidence_context_count,
  coalesce(s.evidence_count, 0) as evidence_count,
  coalesce(s.source_count, 0) as source_count,
  round(least(coalesce(s.context_count, 0), 4) * 25, 2) as score_coverage,
  case
    when coalesce(s.evidence_count, 0) = 0 then 'NO_EVIDENCE'
    when least(coalesce(s.context_count, 0), 4) >= 4 then 'COMPLETE'
    else 'PARTIAL'
  end as status
from public.earbuds b
left join public.performance_metric_scores s
  on s.earbud_id = b.id
 and s.metric = 'sound';

/* --------------------------------------------------------------------------
   8. Calls engine
   -------------------------------------------------------------------------- */
create or replace view public.earbuds_calls_scores as
select
  b.id as earbud_id,
  b.name as earbud,
  coalesce(s.score, null) as calls_score,
  coalesce(s.context_count, 0) as evidence_context_count,
  coalesce(s.evidence_count, 0) as evidence_count,
  coalesce(s.source_count, 0) as source_count,
  round(least(coalesce(s.context_count, 0), 4) * 25, 2) as score_coverage,
  case
    when coalesce(s.evidence_count, 0) = 0 then 'NO_EVIDENCE'
    when least(coalesce(s.context_count, 0), 4) >= 4 then 'COMPLETE'
    else 'PARTIAL'
  end as status
from public.earbuds b
left join public.performance_metric_scores s
  on s.earbud_id = b.id
 and s.metric = 'calls';

/* --------------------------------------------------------------------------
   9. Comfort engine
   -------------------------------------------------------------------------- */
create or replace view public.earbuds_comfort_scores as
select
  b.id as earbud_id,
  b.name as earbud,
  coalesce(s.score, null) as comfort_score,
  coalesce(s.context_count, 0) as evidence_context_count,
  coalesce(s.evidence_count, 0) as evidence_count,
  coalesce(s.source_count, 0) as source_count,
  round(least(coalesce(s.context_count, 0), 4) * 25, 2) as score_coverage,
  case
    when coalesce(s.evidence_count, 0) = 0 then 'NO_EVIDENCE'
    when least(coalesce(s.context_count, 0), 4) >= 4 then 'COMPLETE'
    else 'PARTIAL'
  end as status
from public.earbuds b
left join public.performance_metric_scores s
  on s.earbud_id = b.id
 and s.metric = 'comfort';

/* --------------------------------------------------------------------------
   10. Battery engine

   Battery is primarily an objective engine and therefore uses structured
   earbuds fields instead of requiring subjective evidence.

   Formula:
     60% = per-bud endurance, capped at 12 h
     40% = total case endurance, capped at 60 h

   This is deliberately transparent and deterministic. It does not claim that
   12 h / 60 h are universal "ideal" values; they are normalization ceilings.
   -------------------------------------------------------------------------- */
create or replace view public.earbuds_battery_scores as
select
  b.id as earbud_id,
  b.name as earbud,
  round(
    least(greatest(b.battery_bud_h, 0), 12) / 12 * 60
    + least(greatest(b.battery_case_h, 0), 60) / 60 * 40,
    2
  ) as battery_score,
  2 as evidence_count,
  0 as source_count,
  100.00 as score_coverage,
  'COMPLETE' as status
from public.earbuds b
where b.battery_bud_h is not null
  and b.battery_case_h is not null;

/* --------------------------------------------------------------------------
   11. Unified performance view

   One row per earbud. NULL means "not documented", never "zero performance".
   -------------------------------------------------------------------------- */
create or replace view public.earbuds_performance_engines as
select
  b.id as earbud_id,
  b.name as earbud,

  ss.sound_score,
  ss.score_coverage as sound_coverage,
  ss.evidence_count as sound_evidence_count,
  ss.source_count as sound_source_count,
  ss.status as sound_status,

  cs.calls_score,
  cs.score_coverage as calls_coverage,
  cs.evidence_count as calls_evidence_count,
  cs.source_count as calls_source_count,
  cs.status as calls_status,

  fs.comfort_score,
  fs.score_coverage as comfort_coverage,
  fs.evidence_count as comfort_evidence_count,
  fs.source_count as comfort_source_count,
  fs.status as comfort_status,

  bs.battery_score,
  bs.score_coverage as battery_coverage,
  bs.evidence_count as battery_evidence_count,
  bs.source_count as battery_source_count,
  bs.status as battery_status
from public.earbuds b
left join public.earbuds_sound_scores ss on ss.earbud_id = b.id
left join public.earbuds_calls_scores cs on cs.earbud_id = b.id
left join public.earbuds_comfort_scores fs on fs.earbud_id = b.id
left join public.earbuds_battery_scores bs on bs.earbud_id = b.id;

/* --------------------------------------------------------------------------
   12. Audit helper

   Quickly shows how many earbuds are documented by each new engine.
   -------------------------------------------------------------------------- */
create or replace view public.performance_engines_audit as
select 'sound' as metric,
       count(*) filter (where sound_score is not null) as scored,
       count(*) filter (where sound_status = 'PARTIAL') as partial,
       count(*) filter (where sound_status = 'COMPLETE') as complete,
       count(*) filter (where sound_status = 'NO_EVIDENCE') as no_evidence
from public.earbuds_performance_engines
union all
select 'calls',
       count(*) filter (where calls_score is not null),
       count(*) filter (where calls_status = 'PARTIAL'),
       count(*) filter (where calls_status = 'COMPLETE'),
       count(*) filter (where calls_status = 'NO_EVIDENCE')
from public.earbuds_performance_engines
union all
select 'comfort',
       count(*) filter (where comfort_score is not null),
       count(*) filter (where comfort_status = 'PARTIAL'),
       count(*) filter (where comfort_status = 'COMPLETE'),
       count(*) filter (where comfort_status = 'NO_EVIDENCE')
from public.earbuds_performance_engines
union all
select 'battery',
       count(*) filter (where battery_score is not null),
       count(*) filter (where battery_status = 'PARTIAL'),
       count(*) filter (where battery_status = 'COMPLETE'),
       count(*) filter (where battery_status = 'NO_EVIDENCE')
from public.earbuds_performance_engines;

/* --------------------------------------------------------------------------
   Verification queries
   --------------------------------------------------------------------------

   select * from public.performance_engines_audit;
   select * from public.earbuds_performance_engines order by earbud;

   Expected initial behavior:
     - battery: most/all seeded earbuds scored from structured data
     - sound/calls/comfort: NO_EVIDENCE until matching evidence is imported
     - no missing evidence is converted to 0
============================================================================ */
