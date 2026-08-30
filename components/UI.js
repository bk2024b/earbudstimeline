import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getBrands, getAllEarbuds } from '@/lib/queries';

export function Stat({ value, label }) {
  return (
    <div className="flex flex-col">
      <b className="block font-display font-bold text-3xl sm:text-4xl text-accent tracking-tight leading-none mb-1.5">{value}</b>
      <span className="text-dim text-[11px] font-mono uppercase tracking-wider">{label}</span>
    </div>
  );
}

export async function Footer({ locale }) {
  const [brands, models, t] = await Promise.all([
    getBrands(),
    getAllEarbuds(),
    getTranslations({ locale, namespace: 'footer' }),
  ]);
  const topBrands = [...brands]
    .map((b) => ({ ...b, count: models.filter((m) => m.brand_id === b.id).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <footer className="pt-10 border-t border-line mt-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8 text-xs">
        <FooterCol title={t('explore')}>
          <FooterLink href="/#marques">{t('allBrands')}</FooterLink>
          <FooterLink href="/annees">{t('byYear')}</FooterLink>
          <FooterLink href="/technologies">{t('byTechnology')}</FooterLink>
          <FooterLink href="/comparaisons">{t('allComparisons')}</FooterLink>
          <FooterLink href="/blog">Blog</FooterLink>
        </FooterCol>

        <FooterCol title={t('brands')}>
          {topBrands.map((b) => (
            <FooterLink key={b.id} href={`/marques/${b.id}`}>
              {b.name}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title={t('technologies')}>
          <FooterLink href="/technologies/anc">{t('anc')}</FooterLink>
          <FooterLink href="/technologies/usb-c">{t('usbC')}</FooterLink>
          <FooterLink href="/technologies/multipoint">{t('multipoint')}</FooterLink>
        </FooterCol>

        <FooterCol title={t('tools')}>
          <FooterLink href="/trouver-mes-ecouteurs">✨ {t('finder') || 'Trouver mes écouteurs'}</FooterLink>
          <FooterLink href="/comparer">{t('comparator')}</FooterLink>
          <FooterLink href="/comparaisons">{t('allComparisons')}</FooterLink>
        </FooterCol>
      </div>

      <p className="text-dim text-xs text-center pt-5 border-t border-line">
        {t('copyright')}{' '}
        <span className="mx-1">·</span>
        <Link href="/confidentialite" className="hover:text-accent transition-colors">
          {t('privacy')}
        </Link>
      </p>
    </footer>
  );
}

function FooterCol({ title, children }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-dim uppercase tracking-[0.08em] text-[11px] m-0 mb-1">{title}</p>
      {children}
    </div>
  );
}

function FooterLink({ href, children }) {
  return (
    <Link href={href} className="text-dim hover:text-accent transition-colors">
      {children}
    </Link>
  );
}

export function Badge({ children, gold }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-md border text-xs font-mono ${
        gold ? 'bg-amber/15 border-amber text-amber' : 'bg-panel2 border-line text-dim'
      }`}
    >
      {children}
    </span>
  );
}
