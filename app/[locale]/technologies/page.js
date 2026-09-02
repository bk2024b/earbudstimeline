import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { getAllEarbuds } from '@/lib/queries';
import { getBluetoothVersionList, getCodecList } from '@/lib/tech';
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, canonicalFor, JsonLd } from '@/lib/seo';
import AdSlot from '@/components/AdSlot';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'tech' });
  return {
    title: `${t('hubTitle')} — ANC, Bluetooth, USB-C, codecs | EarbudsTimeline`,
    description: t('hubIntro'),
    ...canonicalFor(`/${locale}/technologies`),
  };
}

function Card({ href, title, count, t }) {
  return (
    <Link
      href={href}
      className="hardware-card group bg-panel p-5"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="m-0 font-display font-bold text-base text-fg group-hover:text-accent transition-colors">{title}</h3>
        <span className="font-mono text-[10px] text-accent/80 bg-accent/10 px-2 py-0.5 rounded-base font-semibold">
          {count}
        </span>
      </div>
      <p className="m-0 text-dim text-xs font-mono">{t('modelsCount', { count })}</p>
    </Link>
  );
}

export default async function TechnologiesPage({ params }) {
  const { locale } = params;
  const models = await getAllEarbuds();
  const [t, ti] = await Promise.all([
    getTranslations({ locale, namespace: 'tech' }),
    getTranslations({ locale, namespace: 'techIndex' }),
  ]);

  const ancCount = models.filter((m) => m.anc).length;
  const usbcCount = models.filter((m) => m.usb_c).length;
  const multipointCount = models.filter((m) => m.multipoint).length;
  const btVersions = getBluetoothVersionList(models);
  const codecs = getCodecList(models);
  const homeLabel = locale === 'en' ? 'Home' : 'Accueil';

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: homeLabel, url: '/' },
          { name: t('hubTitle'), url: '/technologies' },
        ], locale)}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: t('hubTitle'),
          description: ti('browseIntro', { count: models.length }),
          url: '/technologies',
          locale,
          items: [
            { url: '/technologies/anc', name: ti('ancCard') },
            { url: '/technologies/usb-c', name: 'USB-C' },
            { url: '/technologies/multipoint', name: ti('multipointCard') },
            ...btVersions.map((v) => ({ url: `/technologies/bluetooth/${v.version}`, name: `Bluetooth ${v.version}` })),
            ...codecs.map((c) => ({ url: `/technologies/codecs/${c.slug}`, name: c.name })),
          ],
        })}
      />

      <div className="path-indicator text-accent mb-2">{t('hubTitle')}</div>
      <h1 className="font-display font-bold text-3xl sm:text-4xl text-fg mb-2">{t('hubTitle')}</h1>
      <p className="text-dim text-sm mb-10 leading-relaxed max-w-2xl">{ti('browseIntro', { count: models.length })}</p>

      <div className="path-indicator text-accent text-[11px] mb-4">{ti('featuresTitle')}</div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 mb-10">
        <Card href="/technologies/anc" title={ti('ancCard')} count={ancCount} t={t} />
        <Card href="/technologies/usb-c" title="USB-C" count={usbcCount} t={t} />
        <Card href="/technologies/multipoint" title={ti('multipointCard')} count={multipointCount} t={t} />
      </div>

      <div className="path-indicator text-accent text-[11px] mb-4">{ti('bluetoothVersionsTitle')}</div>
      <div className="flex gap-2 flex-wrap mb-10">
        {btVersions.map((v) => (
          <Link
            key={v.version}
            href={`/technologies/bluetooth/${v.version}`}
            className="hardware-card group bg-panel px-3.5 py-1.5 rounded-base text-dim text-xs hover:text-fg transition-colors flex items-center gap-1.5"
          >
            <span className="font-mono text-fg group-hover:text-accent transition-colors">Bluetooth {v.version}</span>
            <span className="text-[10px] text-accent/80 font-mono">· {v.count}</span>
          </Link>
        ))}
      </div>

      <div className="path-indicator text-accent text-[11px] mb-4">{ti('codecsTitle')}</div>
      <div className="flex gap-2 flex-wrap mb-12">
        {codecs.map((c) => (
          <Link
            key={c.slug}
            href={`/technologies/codecs/${c.slug}`}
            className="hardware-card group bg-panel px-3.5 py-1.5 rounded-base text-dim text-xs hover:text-fg transition-colors flex items-center gap-1.5"
          >
            <span className="font-mono text-fg group-hover:text-accent transition-colors">{c.name}</span>
            <span className="text-[10px] text-accent/80 font-mono">· {c.count}</span>
          </Link>
        ))}
      </div>

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
