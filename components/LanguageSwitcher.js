'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

export default function LanguageSwitcher() {
  const t = useTranslations('language');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const other = locale === 'en' ? 'fr' : 'en';

  // Les articles de blog ont un slug propre à chaque langue (traductions = lignes
  // distinctes) — impossible de deviner le bon slug ici, donc on retombe sur l'index
  // du blog dans l'autre langue plutôt que de générer un lien cassé. Le lien précis
  // vers la traduction, quand elle existe, est affiché directement sur la page article.
  const isBlogArticle = /^\/blog\/.+/.test(pathname);
  const target = isBlogArticle ? '/blog' : pathname;

  return (
    <button
      type="button"
      onClick={() => router.replace(target, { locale: other })}
      className="text-xs text-dim hover:text-accent border border-line rounded-full px-2.5 py-1 transition-colors"
      aria-label={t('switchTo')}
    >
      {other.toUpperCase()}
    </button>
  );
}
