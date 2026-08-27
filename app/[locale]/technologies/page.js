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
      className="bg-panel border border-line rounded-2xl p-5 hover:border-accent hover:-translate-y-0.5 transition-all"
    >
      <h3 className="m-0 mb-1 text-[15px]">{title}</h3>
      <p className="m-0 text-dim text-xs">{t('modelsCount', { count })}</p>
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

      <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3.5">{t('hubTitle')}</div>
      <h1 className="font-display font-bold text-[32px] mb-2">{t('hubTitle')}</h1>
      <p className="text-dim text-[13.5px] mb-10">{ti('browseIntro', { count: models.length })}</p>

      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">{ti('featuresTitle')}</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5 mb-10">
        <Card href="/technologies/anc" title={ti('ancCard')} count={ancCount} t={t} />
        <Card href="/technologies/usb-c" title="USB-C" count={usbcCount} t={t} />
        <Card href="/technologies/multipoint" title={ti('multipointCard')} count={multipointCount} t={t} />
      </div>

      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">{ti('bluetoothVersionsTitle')}</h2>
      <div className="flex gap-2 flex-wrap mb-10">
        {btVersions.map((v) => (
          <Link
            key={v.version}
            href={`/technologies/bluetooth/${v.version}`}
            className="px-3.5 py-1.5 rounded-full border border-line text-dim text-xs hover:border-accent hover:text-accent transition-colors"
          >
            Bluetooth {v.version} · {v.count}
          </Link>
        ))}
      </div>

      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">{ti('codecsTitle')}</h2>
      <div className="flex gap-2 flex-wrap mb-12">
        {codecs.map((c) => (
          <Link
            key={c.slug}
            href={`/technologies/codecs/${c.slug}`}
            className="px-3.5 py-1.5 rounded-full border border-line text-dim text-xs hover:border-accent hover:text-accent transition-colors"
          >
            {c.name} · {c.count}
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
