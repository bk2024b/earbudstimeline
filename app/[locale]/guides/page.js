import Link from 'next/link';
import { canonicalFor, JsonLd } from '@/lib/seo';
import AdSlot from '@/components/AdSlot';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

const guides = [
  { slug: 'best-wireless-earbuds', icon: '🎧', en: 'Best Wireless Earbuds', fr: 'Meilleurs écouteurs sans fil', enDesc: 'The best wireless earbuds across budgets and use cases.', frDesc: 'Les meilleurs écouteurs sans fil, tous budgets et usages confondus.', cat: 'Basics' },
  { slug: 'best-budget-earbuds', icon: '💰', en: 'Best Budget Earbuds', fr: 'Meilleurs écouteurs pas chers', enDesc: 'Strong wireless earbuds when you want to spend less.', frDesc: 'De bons écouteurs sans fil pour dépenser moins.', cat: 'Price' },
  { slug: 'best-earbuds-under-50', icon: '💵', en: 'Best Earbuds Under $50', fr: 'Meilleurs écouteurs sous 50 $', enDesc: 'The best options at $50 or less.', frDesc: 'Les meilleures options à 50 $ ou moins.', cat: 'Price' },
  { slug: 'best-earbuds-under-75', icon: '💵', en: 'Best Earbuds Under $75', fr: 'Meilleurs écouteurs sous 75 $', enDesc: 'The best earbuds you can buy for $75 or less.', frDesc: 'Les meilleurs écouteurs à 75 $ ou moins.', cat: 'Price' },
  { slug: 'best-earbuds-under-100', icon: '💵', en: 'Best Earbuds Under $100', fr: 'Meilleurs écouteurs sous 100 $', enDesc: 'Our top wireless earbuds below $100.', frDesc: 'Nos meilleurs écouteurs sans fil sous 100 $.', cat: 'Price' },
  { slug: 'best-earbuds-under-150', icon: '💎', en: 'Best Earbuds Under $150', fr: 'Meilleurs écouteurs sous 150 $', enDesc: 'Premium features without crossing $150.', frDesc: 'Des fonctions premium sans dépasser 150 $.', cat: 'Price' },
  { slug: 'best-earbuds-under-200', icon: '💎', en: 'Best Earbuds Under $200', fr: 'Meilleurs écouteurs sous 200 $', enDesc: 'High-end earbuds below the $200 mark.', frDesc: 'Des écouteurs haut de gamme sous 200 $.', cat: 'Price' },
  { slug: 'best-battery-life-earbuds', icon: '🔋', en: 'Best Earbuds for Battery Life', fr: 'Meilleurs écouteurs pour l’autonomie', enDesc: 'Earbuds for people who hate charging.', frDesc: 'Les écouteurs pour ceux qui veulent recharger le moins possible.', cat: 'Use case' },
  { slug: 'best-noise-cancelling-earbuds', icon: '🔇', en: 'Best Noise-Cancelling Earbuds', fr: 'Meilleurs écouteurs avec réduction de bruit', enDesc: 'Top picks for blocking unwanted noise.', frDesc: 'Les meilleurs choix pour réduire les bruits environnants.', cat: 'Features' },
  { slug: 'best-earbuds-for-iphone', icon: '', en: 'Best Earbuds for iPhone', fr: 'Meilleurs écouteurs pour iPhone', enDesc: 'Earbuds that pair well with Apple devices.', frDesc: 'Les écouteurs adaptés à l’écosystème Apple.', cat: 'Devices' },
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
];

const categories = ['All', 'Price', 'Audio', 'Sport', 'Travel', 'Work', 'Features', 'Devices', 'Fit', 'Lifestyle'];

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

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-6xl mx-auto">
        <div className="font-mono text-xs text-accent uppercase mb-3">Guides · 2026</div>
        <h1 className="font-display font-bold text-[38px] sm:text-[54px] leading-tight mb-4">{title}</h1>
        <p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">{intro}</p>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-8 pb-2">
          {categories.map((category) => (
            <span key={category} className="shrink-0 px-3 py-1.5 rounded-full border border-line bg-panel text-dim text-xs font-mono">
              {category === 'All' ? (fr ? 'Tous' : 'All') : category}
            </span>
          ))}
        </div>

        <section className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {guides.map((guide) => (
            <Link key={guide.slug} href={`/${locale}/guides/${guide.slug}`} className="group block bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-colors">
              <div className="flex items-start justify-between gap-4">
                <span className="text-2xl" aria-hidden="true">{guide.icon}</span>
                <span className="font-mono text-[9px] uppercase text-dim border border-line rounded-full px-2 py-1">{guide.cat}</span>
              </div>
              <h2 className="font-display font-semibold text-[19px] mt-5 group-hover:text-accent transition-colors">{fr ? guide.fr : guide.en}</h2>
              <p className="text-dim text-sm leading-6 mt-2">{fr ? guide.frDesc : guide.enDesc}</p>
              <div className="mt-5 text-accent font-mono text-[10px] uppercase">{fr ? 'Lire le guide →' : 'Read guide →'}</div>
            </Link>
          ))}
        </section>
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
