import { getTranslations } from 'next-intl/server';
import { getAllEarbuds, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd } from '@/lib/seo';
import TimelineIntelligenceFinder from '@/components/TimelineIntelligenceFinder';
import { Footer } from '@/components/UI';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'Timeline Intelligence — Find the Perfect Earbuds for Your Budget | EarbudsTimeline'
    : 'Timeline Intelligence — Trouver les écouteurs parfaits pour votre budget | EarbudsTimeline';

  const description = isEn
    ? 'Enter your budget and preferences. Our Timeline Intelligence engine analyzes historical specs, ANC, battery life, weight, and market value to recommend the #1 best wireless earbuds.'
    : 'Entrez votre budget et vos préférences. Notre moteur Timeline Intelligence analyse les specs historiques, l’ANC, l’autonomie, le poids et le rapport qualité/prix pour recommander les meilleurs écouteurs sans fil.';

  return {
    title,
    description,
    ...canonicalFor(`/${locale}/trouver-mes-ecouteurs`),
    openGraph: {
      title,
      description,
    },
  };
}

export default async function FinderPage({ params }) {
  const { locale } = await params;
  const [models, brands, t] = await Promise.all([
    getAllEarbuds(),
    getBrands(),
    getTranslations({ locale, namespace: 'intelligence' }),
  ]);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'EarbudsTimeline Intelligence Finder',
          applicationCategory: 'ShoppingApplication',
          operatingSystem: 'All',
          description:
            locale === 'en'
              ? 'Find the best wireless earbuds based on budget and historical timeline data.'
              : 'Trouvez les meilleurs écouteurs sans fil selon votre budget et l’analyse historique.',
        }}
      />

      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 font-mono text-xs text-accent uppercase tracking-wider bg-accent/10 border border-accent/30 rounded-full px-3.5 py-1 mb-4">
          <span>✨</span>
          <span>Timeline Intelligence</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-5xl leading-tight mb-4">
          {t('pageTitleLine1')}{' '}
          <span className="text-accent">{t('pageTitleAccent')}</span>
        </h1>
        <p className="text-sm sm:text-base text-dim leading-relaxed">
          {t('pageSubtitle')}
        </p>
      </div>

      {/* Moteur interactif */}
      <TimelineIntelligenceFinder initialModels={models} initialBrands={brands} />

      <Footer />
    </>
  );
}
