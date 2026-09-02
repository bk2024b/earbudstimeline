import Link from 'next/link';
import Image from 'next/image';
import { canonicalFor, JsonLd } from '@/lib/seo';
import { getSupabase } from '@/lib/supabase';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { applyFilter, applySort } from '@/lib/guideFilters';
import EarbudsIcon from '@/components/EarbudsIcon';
import AdSlot from '@/components/AdSlot';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

// Hand-curated cards for the original static guide pages (dedicated page.js
// files, not driven by GUIDE_PAGES). Kept separate so their icon/description
// stay hand-tuned instead of falling back to the generic GUIDE_PAGES copy.
const curatedGuides = [
  { slug: 'best-wireless-earbuds', icon: '🎧', en: 'Best Wireless Earbuds', fr: 'Meilleurs écouteurs sans fil', enDesc: 'The best wireless earbuds across budgets and use cases.', frDesc: 'Les meilleurs écouteurs sans fil, tous budgets et usages confondus.', cat: 'Basics' },
  { slug: 'best-budget-earbuds', icon: '💰', en: 'Best Budget Earbuds', fr: 'Meilleurs écouteurs pas chers', enDesc: 'Strong wireless earbuds when you want to spend less.', frDesc: 'De bons écouteurs sans fil pour dépenser moins.', cat: 'Price' },
  { slug: 'best-earbuds-under-50', icon: '💵', en: 'Best Earbuds Under $50', fr: 'Meilleurs écouteurs sous 50 $', enDesc: 'The best options at $50 or less.', frDesc: 'Les meilleures options à 50 $ ou moins.', cat: 'Price' },
  { slug: 'best-earbuds-under-75', icon: '💵', en: 'Best Earbuds Under $75', fr: 'Meilleurs écouteurs sous 75 $', enDesc: 'The best earbuds you can buy for $75 or less.', frDesc: 'Les meilleurs écouteurs à 75 $ ou moins.', cat: 'Price' },
  { slug: 'best-earbuds-under-100', icon: '💵', en: 'Best Earbuds Under $100', fr: 'Meilleurs écouteurs sous 100 $', enDesc: 'Our top wireless earbuds below $100.', frDesc: 'Nos meilleurs écouteurs sans fil sous 100 $.', cat: 'Price' },
  { slug: 'best-earbuds-under-150', icon: '💎', en: 'Best Earbuds Under $150', fr: 'Meilleurs écouteurs sous 150 $', enDesc: 'Premium features without crossing $150.', frDesc: 'Des fonctions premium sans dépasser 150 $.', cat: 'Price' },
  { slug: 'best-earbuds-under-200', icon: '💎', en: 'Best Earbuds Under $200', fr: 'Meilleurs écouteurs sous 200 $', enDesc: 'High-end earbuds below the $200 mark.', frDesc: 'Des écouteurs haut de gamme sous 200 $.', cat: 'Price' },
  { slug: 'best-battery-life-earbuds', icon: '🔋', en: 'Best Earbuds for Battery Life', fr: 'Meilleurs écouteurs pour l’autonomie', enDesc: 'Earbuds for people who hate charging.', frDesc: 'Les écouteurs pour ceux qui veulent recharger le moins possible.', cat: 'Use case' },
  { slug: 'best-noise-cancelling-earbuds', icon: '🔇', en: 'Best Noise-Cancelling Earbuds', fr: 'Meilleurs écouteurs avec réduction de bruit', enDesc: 'Top picks for blocking unwanted noise.', frDesc: 'Les meilleurs choix pour réduire les bruits environnants.', cat: 'Features' },
  { slug: 'best-earbuds-for-iphone', icon: '', en: 'Best Earbuds for iPhone', fr: 'Meilleurs écouteurs pour iPhone', enDesc: 'Earbuds that pair well with Apple devices.', frDesc: 'Les écouteurs adaptés à l’écosystème Apple.', cat: 'Devices' },
  { slug: 'best-earbuds-for-android', icon: '▣', en: 'Best Earbuds for Android', fr: 'Meilleurs écouteurs pour Android', enDesc: 'Great choices for Android phones.', frDesc: 'Les meilleurs choix pour les smartphones Android.', cat: 'Devices' },
  { slug: 'best-earbuds-for-music', icon: '🎵', en: 'Best Earbuds for Music', fr: 'Meilleurs écouteurs pour la musique', enDesc: 'Models selected for everyday music listening.', frDesc: 'Des modèles pensés pour écouter de la musique au quotidien.', cat: 'Audio' },
  { slug: 'best-earbuds-for-audiophiles', icon: '🎼', en: 'Best Earbuds for Audiophiles', fr: 'Meilleurs écouteurs pour audiophiles', enDesc: 'Prioritizing sound quality and listening detail.', frDesc: 'Priorité à la qualité sonore et aux détails musicaux.', cat: 'Audio' },
  { slug: 'best-earbuds-for-bass', icon: '🔊', en: 'Best Earbuds for Bass', fr: 'Meilleurs écouteurs pour les basses', enDesc: 'For listeners who want deeper, stronger bass.', frDesc: 'Pour ceux qui recherchent des basses profondes et présentes.', cat: 'Audio' },
  { slug: 'best-earbuds-for-podcasts', icon: '🎙️', en: 'Best Earbuds for Podcasts', fr: 'Meilleurs écouteurs pour podcasts', enDesc: 'Clear, comfortable listening for spoken audio.', frDesc: 'Pour écouter clairement podcasts et contenus parlés.', cat: 'Audio' },
  { slug: 'best-earbuds-for-calls', icon: '📞', en: 'Best Earbuds for Calls', fr: 'Meilleurs écouteurs pour les appels', enDesc: 'Prioritizing microphones and call usability.', frDesc: 'Des modèles adaptés aux appels et aux microphones.', cat: 'Work' },
  { slug: 'best-earbuds-for-working', icon: '💻', en: 'Best Earbuds for Working', fr: 'Meilleurs écouteurs pour travailler', enDesc: 'Good choices for focused workdays and meetings.', frDesc: 'Pour travailler, se concentrer et participer aux réunions.', cat: 'Work' },
  { slug: 'best-earbuds-for-students', icon: '📚', en: 'Best Earbuds for Students', fr: 'Meilleurs écouteurs pour étudiants', enDesc: 'Practical earbuds for study, calls and everyday use.', frDesc: 'Des écouteurs pratiques pour les études et le quotidien.', cat: 'Work' },
  { slug: 'best-earbuds-for-gaming', icon: '🎮', en: 'Best Earbuds for Gaming', fr: 'Meilleurs écouteurs pour jouer', enDesc: 'Wireless earbuds for gaming and low-latency use.', frDesc: 'Des écouteurs sans fil pour jouer avec une bonne réactivité.', cat: 'Entertainment' },
  { slug: 'best-earbuds-for-commuting', icon: '🚇', en: 'Best Earbuds for Commuting', fr: 'Meilleurs écouteurs pour les trajets', enDesc: 'For trains, buses and noisy daily commutes.', frDesc: 'Pour les transports et les trajets quotidiens.', cat: 'Travel' },
  { slug: 'best-earbuds-for-travel', icon: '✈️', en: 'Best Earbuds for Travel', fr: 'Meilleurs écouteurs pour voyager', enDesc: 'Travel-friendly earbuds for long days away.', frDesc: 'Des écouteurs pratiques pour les voyages et longues journées.', cat: 'Travel' },
  { slug: 'best-earbuds-for-long-flights', icon: '✈️', en: 'Best Earbuds for Long Flights', fr: 'Meilleurs écouteurs pour les longs vols', enDesc: 'Comfort, battery and noise reduction for long flights.', frDesc: 'Confort, autonomie et réduction du bruit pour les longs vols.', cat: 'Travel' },
  { slug: 'best-earbuds-for-sleep', icon: '🌙', en: 'Best Earbuds for Sleep', fr: 'Meilleurs écouteurs pour dormir', enDesc: 'Models to consider for quiet nighttime listening.', frDesc: 'Des modèles à considérer pour une écoute nocturne discrète.', cat: 'Lifestyle' },
  { slug: 'best-earbuds-for-gym', icon: '🏋️', en: 'Best Earbuds for the Gym', fr: 'Meilleurs écouteurs pour la salle', enDesc: 'Sweat-friendly picks for workouts.', frDesc: 'Des modèles adaptés aux entraînements et à la transpiration.', cat: 'Sport' },
  { slug: 'best-earbuds-for-sport', icon: '🏃', en: 'Best Earbuds for Sport', fr: 'Meilleurs écouteurs pour le sport', enDesc: 'Wireless earbuds for active use.', frDesc: 'Des écouteurs sans fil pour les activités sportives.', cat: 'Sport' },
  { slug: 'best-earbuds-for-running', icon: '🏃', en: 'Best Earbuds for Running', fr: 'Meilleurs écouteurs pour courir', enDesc: 'Secure and practical earbuds for runners.', frDesc: 'Des écouteurs stables et pratiques pour courir.', cat: 'Sport' },
  { slug: 'best-earbuds-for-cycling', icon: '🚴', en: 'Best Earbuds for Cycling', fr: 'Meilleurs écouteurs pour le vélo', enDesc: 'Considerations for cycling and outdoor awareness.', frDesc: 'Pour le vélo et les activités où l’environnement compte.', cat: 'Sport' },
  { slug: 'best-earbuds-for-walking', icon: '🚶', en: 'Best Earbuds for Walking', fr: 'Meilleurs écouteurs pour marcher', enDesc: 'Comfortable picks for walks and everyday use.', frDesc: 'Des modèles confortables pour marcher au quotidien.', cat: 'Sport' },
  { slug: 'best-earbuds-for-outdoor-use', icon: '🌤️', en: 'Best Earbuds for Outdoor Use', fr: 'Meilleurs écouteurs pour l’extérieur', enDesc: 'Resistance, awareness and battery for outdoor use.', frDesc: 'Résistance, autonomie et perception de l’environnement.', cat: 'Sport' },
  { slug: 'best-earbuds-for-large-ears', icon: '👂', en: 'Best Earbuds for Large Ears', fr: 'Meilleurs écouteurs pour grandes oreilles', enDesc: 'Models worth considering for larger ears.', frDesc: 'Des modèles à considérer pour les grandes oreilles.', cat: 'Fit' },
  { slug: 'best-earbuds-for-small-ears', icon: '👂', en: 'Best Earbuds for Small Ears', fr: 'Meilleurs écouteurs pour petites oreilles', enDesc: 'Smaller and more comfortable options to consider.', frDesc: 'Des options plus compactes à considérer pour les petites oreilles.', cat: 'Fit' },
  { slug: 'best-premium-earbuds', icon: '👑', en: 'Best Premium Earbuds', fr: 'Meilleurs écouteurs premium', enDesc: 'The best wireless earbuds once price stops being the limiting factor.', frDesc: 'Les meilleurs écouteurs sans fil quand le prix n’est plus la contrainte.', cat: 'Price' },
];

// Every other GUIDE_PAGES entry (brand hubs, comparisons, feature pages) was
// previously reachable only via the sitemap — no internal link pointed to
// most of them. Rather than hand-writing ~45 more curated cards (and having
// this list silently go stale every time a guide is added to GUIDE_PAGES),
// we derive their hub cards straight from GUIDE_PAGES itself: the source of
// truth becomes the single array in lib/guidePages.js, so a future addition
// there is automatically linked from this hub with no extra step.
const GUIDE_CATEGORY = {
  'best-earbuds-for-office': 'Use case',
  'best-earbuds-with-best-microphone': 'Use case',
  'best-earbuds-for-video-meetings': 'Use case',
  'best-sport-earbuds': 'Use case',
  'best-earbuds-for-gaming-pc': 'Use case',
  'best-gaming-earbuds-under-100': 'Use case',
  'sony-earbuds-guide': 'Brands',
  'google-pixel-buds-guide': 'Brands',
  'jbl-earbuds-guide': 'Brands',
  'skullcandy-earbuds-guide': 'Brands',
  'xiaomi-redmi-earbuds-guide': 'Brands',
  'soundcore-earbuds-guide': 'Brands',
  'oppo-earbuds-guide': 'Brands',
  'jabra-earbuds-guide': 'Brands',
  'oneplus-earbuds-guide': 'Brands',
  'audio-technica-earbuds-guide': 'Brands',
  'huawei-earbuds-guide': 'Brands',
  'sennheiser-earbuds-guide': 'Brands',
  'technics-earbuds-guide': 'Brands',
  'beats-earbuds-guide': 'Brands',
  'shokz-earbuds-guide': 'Brands',
  'bose-earbuds-guide': 'Brands',
  'samsung-earbuds-guide': 'Brands',
  'nothing-ear-reviews': 'Brands',
  'airpods-vs-galaxy-buds': 'Comparisons',
  'sony-vs-apple': 'Comparisons',
  'bose-vs-sony': 'Comparisons',
  'beats-vs-airpods': 'Comparisons',
  'jbl-vs-soundcore': 'Comparisons',
  'jabra-vs-bose': 'Comparisons',
  'huawei-vs-samsung': 'Comparisons',
};
const GUIDE_ICON = { 'Use case': '🎯', Brands: '🏷️', Comparisons: '⚖️', Features: '⚙️' };

const curatedSlugs = new Set(curatedGuides.map((g) => g.slug));

// Picks a representative model for a DB-driven guide's card thumbnail by
// running its actual filter/sort against the real catalog — the same logic
// the guide's own detail page uses — so the photo shown here always matches
// what visitors land on, instead of a generic icon.
async function loadGeneratedGuides() {
  const supabase = getSupabase();
  const { data: rows, error } = await supabase
    .from('guides')
    .select('slug, title_en, title_fr, description_en, description_fr, category, icon, filter, sort, render_variant')
    .eq('status', 'published');
  if (error || !rows?.length) return [];

  const dbGuides = rows.filter((g) => !curatedSlugs.has(g.slug));
  if (!dbGuides.length) return [];

  const [models, brands] = await Promise.all([getAllEarbuds(), getBrands()]);
  const brandMap = new Map(brands.map((b) => [b.id, b]));

  return dbGuides.map((g) => {
    const cat = g.category || GUIDE_CATEGORY[g.slug] || 'Features';
    let thumbnail = null;
    // Bespoke ANC/Budget pages rank by data this page doesn't have loaded
    // (ANC intelligence scores, value-per-dollar) — skip the computed photo
    // for those two and fall back to the icon tile, same as curated guides.
    if (g.render_variant === 'standard') {
      const filtered = applyFilter(models, g.filter);
      const sorted = applySort(filtered, g.sort || []);
      const pick = sorted[0];
      if (pick?.image_url) thumbnail = { url: pick.image_url, name: pick.name, color: brandMap.get(pick.brand_id)?.color };
      else if (pick) thumbnail = { url: null, name: pick.name, color: brandMap.get(pick.brand_id)?.color };
    }
    return {
      slug: g.slug,
      icon: g.icon || GUIDE_ICON[cat] || '📄',
      en: g.title_en,
      fr: g.title_fr,
      enDesc: g.description_en,
      frDesc: g.description_fr,
      cat,
      thumbnail,
    };
  });
}

const categories = ['All', 'Price', 'Use case', 'Audio', 'Sport', 'Travel', 'Work', 'Features', 'Devices', 'Fit', 'Lifestyle', 'Brands', 'Comparisons', 'Basics', 'Entertainment'];
const categoryId = (category) => category.toLowerCase().replace(/\s+/g, '-');

export async function generateMetadata({ params }) {
  const { locale } = params;
  const title = locale === 'fr' ? 'Guides écouteurs sans fil 2026' : 'Wireless Earbuds Guides 2026';
  return {
    title: `${title} | EarbudsTimeline`,
    description: locale === 'fr' ? 'Tous nos guides pour trouver les meilleurs écouteurs sans fil selon votre budget, vos appareils et votre usage.' : 'All our guides for finding the best wireless earbuds by budget, device and use case.',
    ...canonicalFor(`/${locale}/guides`),
  };
}

export default async function GuidesPage({ params }) {
  const { locale } = params;
  const fr = locale === 'fr';
  const title = fr ? 'Guides écouteurs' : 'Earbuds Guides';
  const intro = fr ? 'Trouvez les écouteurs adaptés à votre budget, votre appareil et votre façon de les utiliser.' : 'Find the right earbuds for your budget, device and the way you use them.';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description: intro,
    url: `https://earbudstimeline.com/${locale}/guides`,
    inLanguage: locale,
  };

  const generatedGuides = await loadGeneratedGuides();
  const guides = [...curatedGuides, ...generatedGuides];

  const sections = categories
    .filter((c) => c !== 'All')
    .map((cat) => ({ cat, items: guides.filter((g) => g.cat === cat) }))
    .filter((s) => s.items.length > 0);

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-6xl mx-auto">
        <div className="font-mono text-xs text-accent uppercase mb-3">Guides · 2026</div>
        <h1 className="font-display font-bold text-[38px] sm:text-[54px] leading-tight mb-4">{title}</h1>
        <p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">{intro}</p>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-8 pb-2">
          {categories.map((category) => (
            category === 'All' ? (
              <span key={category} className="shrink-0 px-3 py-1.5 rounded-full border border-line bg-panel text-dim text-xs font-mono">
                {fr ? 'Tous' : 'All'}
              </span>
            ) : (
              <a key={category} href={`#${categoryId(category)}`} className="shrink-0 px-3 py-1.5 rounded-full border border-line bg-panel text-dim text-xs font-mono hover:border-accent hover:text-accent transition-colors">
                {category}
              </a>
            )
          ))}
        </div>

        {sections.map(({ cat, items }) => (
          <section key={cat} id={categoryId(cat)} className="mt-12 scroll-mt-24">
            <h2 className="font-mono text-xs text-accent uppercase tracking-[0.12em] mb-4">{cat} · {items.length}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((guide) => (
                <Link key={guide.slug} href={`/${locale}/guides/${guide.slug}`} className="group block bg-panel border border-line rounded-2xl overflow-hidden hover:border-accent transition-colors">
                  <div className="relative w-full aspect-[16/9] bg-panel2 overflow-hidden">
                    {guide.thumbnail?.url ? (
                      <>
                        <Image
                          src={guide.thumbnail.url}
                          alt={guide.thumbnail.name || ''}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                          className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent opacity-70" />
                      </>
                    ) : guide.thumbnail?.color ? (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${guide.thumbnail.color}22, transparent)` }}>
                        <EarbudsIcon color={guide.thumbnail.color} className="w-14 h-14" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl opacity-80" aria-hidden="true">{guide.icon}</span>
                      </div>
                    )}
                    <span className="absolute top-2.5 right-2.5 font-mono text-[9px] uppercase text-dim bg-ink/80 backdrop-blur border border-line rounded-full px-2 py-1">{guide.cat}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-semibold text-[17px] leading-snug group-hover:text-accent transition-colors">{fr ? guide.fr : guide.en}</h3>
                    <p className="text-dim text-[13px] leading-6 mt-2 line-clamp-2">{fr ? guide.frDesc : guide.enDesc}</p>
                    <div className="mt-4 text-accent font-mono text-[10px] uppercase">{fr ? 'Lire le guide →' : 'Read guide →'}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </article>
      <AdSlot
        variant="native"
        zoneKey={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_KEY}
        invokeDomain={process.env.NEXT_PUBLIC_ADSTERRA_SITEWIDE_NATIVE_DOMAIN}
        label={locale === 'en' ? 'Advertisement' : 'Publicité'}
      />
      <Footer locale={locale} />
    </>
  );
}
