# EarbudsTimeline

L'historique complet des écouteurs sans fil, marque par marque — même logique que PhoneTimeline
(marques → gammes → fiche modèle avec "ADN de la gamme" → comparateur), en Next.js (App Router) +
Supabase, déployable sur Vercel.

## Stack

- **Next.js 14** (App Router, React Server Components)
- **Supabase** (Postgres + accès public en lecture via RLS)
- **Tailwind CSS**
- **Vercel** pour le déploiement

## 1. Créer le projet Supabase

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, exécutez `supabase/schema.sql` puis `supabase/seed.sql` (dans cet ordre).
   - `schema.sql` crée les tables `brands` et `earbuds` avec RLS activé + policies de lecture publique.
   - `seed.sql` insère 5 marques et 37 écouteurs (Apple, Samsung, Google, Sony, Nothing).
3. Dans **Project Settings → API**, récupérez `Project URL` et la clé `anon public`.

## 2. Configurer le projet local

```bash
cp .env.local.example .env.local
# puis renseignez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev
```

Le site tourne sur http://localhost:3000.

## 3. Déployer sur Vercel

```bash
npm i -g vercel
vercel
```

Ou via l'UI Vercel : importez le repo GitHub, ajoutez les deux variables d'environnement
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) dans **Project Settings → Environment
Variables**, puis déployez.

## Structure

```
app/
  page.js                     Accueil (stats, waveform, marques, derniers ajouts)
  marques/[brand]/page.js     Page marque (filtre par gamme via ?gamme=)
  ecouteurs/[slug]/page.js    Fiche modèle + ADN de la gamme + lien comparateur
  comparer/page.js            Comparateur (2 modèles via ?a=&b=)
components/
  Waveform.js                 Le "waveform" chronologique (100% server, liens purs)
  CompareSelectors.js         Seuls composants client du site (sync URL <-> selects)
  QuickCompareSelect.js
lib/
  supabase.js, queries.js, format.js
supabase/
  schema.sql, seed.sql
```

## Modifier / ajouter des modèles

Ajoutez des lignes dans `earbuds` via le SQL Editor de Supabase (ou une migration), en respectant
le même `gamme` pour qu'un nouveau modèle s'intègre à l'historique "ADN" existant. Les pages sont
en `revalidate = 3600` (ISR) : les nouvelles données apparaissent au plus tard une heure après
insertion, ou immédiatement après un redeploy.
