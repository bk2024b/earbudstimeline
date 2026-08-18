import '../globals.css';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { NextIntlClientProvider } from 'next-intl';
import { routing } from '@/i18n/routing';
import Header from '@/components/Header';
import { SITE_URL } from '@/lib/seo';
import { getSearchCatalog, getBrands } from '@/lib/queries';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEn = locale === 'en';

  return {
    metadataBase: new URL(SITE_URL),
    title: isEn
      ? 'EarbudsTimeline — The complete history of wireless earbuds'
      : "EarbudsTimeline — l'historique complet des écouteurs sans fil",
    description: isEn
      ? 'The complete history of wireless earbuds, brand by brand.'
      : "L'historique complet des écouteurs sans fil, marque par marque.",
    alternates: { canonical: `/${locale}`, languages: { en: '/en', fr: '/fr' } },
    openGraph: {
      title: 'EarbudsTimeline',
      description: isEn
        ? 'The complete history of wireless earbuds, brand by brand.'
        : "L'historique complet des écouteurs sans fil, marque par marque.",
      images: ['/og-image.png'],
    },
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const [messages, searchCatalog, brands] = await Promise.all([
    (await import(`../../messages/${locale}.json`)).default,
    getSearchCatalog().catch(() => []),
    getBrands().catch(() => []),
  ]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="max-w-[1080px] mx-auto px-5 pb-20">
        <Header models={searchCatalog} brands={brands} />
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
