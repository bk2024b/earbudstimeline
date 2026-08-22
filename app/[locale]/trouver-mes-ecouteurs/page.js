import { getTranslations } from 'next-intl/server';
import { getAllEarbuds, getBrands, getAncScores } from '@/lib/queries';
import { canonicalFor, JsonLd } from '@/lib/seo';
import TimelineIntelligenceFinder from '@/components/TimelineIntelligenceFinder';
import { Footer } from '@/components/UI';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEn = locale === 'en';
  const title = isEn
    ? 'Earbuds Finder — Find the Best Earbuds for Your Needs | EarbudsTimeline'
    : 'Earbuds Finder — Trouvez les meilleurs écouteurs selon vos besoins | EarbudsTimeline';
  const description = isEn
    ? 'Find the best wireless earbuds for your budget and priorities, with evidence-based ANC scores for Travel, Office, Traffic and Voices.'
    : 'Trouvez les meilleurs écouteurs sans fil selon votre budget et vos priorités, avec des scores ANC fondés sur les preuves pour Voyage, Bureau, Trafic et Voix.';
  return { title, description, ...canonicalFor(`/${locale}/trouver-mes-ecouteurs`), openGraph: { title, description } };
}

export default async function FinderPage({ params }) {
  const { locale } = await params;
  const [models, brands, ancScores, t] = await Promise.all([
    getAllEarbuds(),
    getBrands(),
    getAncScores(),
    getTranslations({ locale, namespace: 'intelligence' }),
  ]);

  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'EarbudsTimeline Finder',
        applicationCategory: 'ShoppingApplication',
        operatingSystem: 'All',
        description: locale === 'en'
          ? 'Find the best wireless earbuds using budget, priorities and evidence-based ANC intelligence.'
          : 'Trouvez les meilleurs écouteurs sans fil selon votre budget, vos priorités et notre moteur ANC fondé sur les preuves.',
      }} />
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 font-mono text-xs text-accent uppercase tracking-wider bg-accent/10 border border-accent/30 rounded-full px-3.5 py-1 mb-4">✨ Earbuds Finder</div>
        <h1 className="font-display font-bold text-3xl sm:text-5xl leading-tight mb-4">
          {t('pageTitleLine1')} <span className="text-accent">{t('pageTitleAccent')}</span>
        </h1>
        <p className="text-sm sm:text-base text-dim leading-relaxed">{locale === 'en' ? 'A recommendation engine powered by catalog data and our evidence-based ANC intelligence layer.' : 'Un moteur de recommandation alimenté par le catalogue et notre couche d’intelligence ANC fondée sur les preuves.'}</p>
      </div>
      <TimelineIntelligenceFinder initialModels={models} initialBrands={brands} initialAncScores={ancScores} />
      <Footer />
    </>
  );
}
