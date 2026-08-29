import '../globals.css';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { NextIntlClientProvider } from 'next-intl';
import { routing } from '@/i18n/routing';
import { display, body, mono } from '@/lib/fonts';
import Header from '@/components/Header';
import MicrosoftClarity from '@/components/MicrosoftClarity';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import CookieConsent from '@/components/CookieConsent';
import SocialBar from '@/components/SocialBar';
import { SITE_URL } from '@/lib/seo';

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
    alternates: {
      canonical: `/${locale}`,
      languages: { en: '/en', fr: '/fr' },
    },
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

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* Lien d'évitement : invisible tant qu'il n'a pas le focus clavier,
          permet de sauter la nav (recherche, langues, thème) pour atteindre
          directement le contenu. Voir la classe .skip-link dans globals.css. */}
      <a href="#main-content" className="skip-link">
        {locale === 'en' ? 'Skip to content' : 'Aller au contenu'}
      </a>
      <div className="max-w-[1280px] mx-auto px-5 pb-20">
        <Header />
        <main id="main-content">{children}</main>
      </div>
      {/* Chargé ici (routes publiques [locale] uniquement) et pas dans le
          layout racine : Clarity fait de l'enregistrement de session, GA
          mesure du trafic réel — dans les deux cas on évite de compter
          l'usage de /admin comme du trafic visiteur. */}
      <MicrosoftClarity />
      <GoogleAnalytics />
      <SocialBar />
      <CookieConsent />
    </NextIntlClientProvider>
  );
}
