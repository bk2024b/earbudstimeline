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
