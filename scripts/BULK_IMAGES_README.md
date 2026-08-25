# Bulk image pipeline — installation et usage

Remplace le passage par `/admin/earbuds/[id]` ou `/admin/earbuds/bulk-images`
pour le cas le plus courant : tu as trouvé une URL d'image sur le web pour un
écouteur donné. Le script télécharge, détoure (rembg), optimise en webp,
uploade sur Supabase Storage, met à jour la fiche, puis rafraîchit le cache.

Tourne en local via `node`, jamais sur Vercel — pas de contrainte de taille de
package serverless ni de cold start lié à rembg.

## Installation (une seule fois)

```bash
# Dans la racine du projet
npm install sharp
```

`rembg` doit déjà être accessible dans le PATH de ton terminal (active ton
venv/environnement si besoin avant de lancer le script).

Vérifie que ton `.env.local` contient bien :
```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_SESSION_SECRET=...
```
Les deux premières sont déjà là si l'admin fonctionne chez toi. La troisième
aussi (c'est celle qui protège `/admin/login`) — le script la réutilise pour
appeler la route de revalidation, pas besoin d'en créer une nouvelle.

## Emplacement des fichiers dans le repo

```
scripts/bulk-image-pipeline.mjs
scripts/sample-photos.csv
app/api/admin/revalidate-batch/route.js
```

## Format du CSV

```csv
id,image_url
app3,https://exemple.com/airpods-pro-3.jpg
gb4,https://exemple.com/galaxy-buds3.jpg
```

- `id` = l'identifiant exact de l'écouteur dans Supabase (celui qu'on voit
  dans l'URL `/admin/earbuds/<id>`).
- `image_url` = le lien direct vers l'image trouvée sur le web (pas une page,
  l'URL de l'image elle-même — clic droit → "copier l'adresse de l'image").

Astuce : le widget **"📷 Écouteurs sans photo"** sur `/admin` est ta liste de
travail — c'est elle que tu transformes en CSV au fur et à mesure.

## Lancer le script

Test à blanc d'abord (vérifie que chaque `id` existe en base et que chaque
URL répond, sans rien télécharger ni modifier) :
```bash
node scripts/bulk-image-pipeline.mjs scripts/photos-a-traiter.csv --dry-run
```

Run complet :
```bash
node scripts/bulk-image-pipeline.mjs scripts/photos-a-traiter.csv
```

Le script affiche une ligne par écouteur (✓ ou ✗ avec la raison), puis un
résumé, puis rafraîchit automatiquement les pages concernées si le serveur
Next.js (dev ou prod) est joignable à l'adresse `SITE_BASE_URL` (par défaut
`http://localhost:3000` — mets `SITE_BASE_URL=https://earbudstimeline.com`
dans `.env.local` si tu veux rafraîchir la prod directement après un run).

## Ce que fait chaque étape

1. **Download** — récupère l'image brute depuis `image_url`.
2. **rembg** — détourage, sortie en PNG avec fond transparent.
3. **sharp** — resize à 1600px max, export webp qualité ~82%, réduit la
   qualité par paliers si le fichier dépasse 500 Ko (même logique que
   `lib/clientImageOptimization.js`, côté serveur cette fois).
4. **Upload** — envoi dans le bucket `media/earbuds/` de Supabase Storage.
5. **DB update** — `image_url`, `image_count`, `quality_score` et
   `qa_status` sont recalculés et enregistrés sur la ligne `earbuds`.
6. **Revalidation** — un seul appel à `/api/admin/revalidate-batch` à la fin
   du run pour rafraîchir toutes les pages touchées d'un coup.

## Si une ligne échoue

Le script continue sur les lignes suivantes et affiche la raison de l'échec
à la fin (URL 404, id introuvable, rembg qui plante sur un format
inhabituel...). Corrige juste les lignes en erreur dans le CSV et relance —
les lignes déjà traitées avec succès ne seront pas re-téléchargées tant que
tu ne les remets pas dans le fichier.

Pour les cas où rembg produit un résultat imparfait sur une photo
compliquée, l'admin web (`/admin/earbuds/[id]`) reste disponible pour
uploader une version corrigée à la main — le script couvre le cas général,
pas les 100% des cas.
