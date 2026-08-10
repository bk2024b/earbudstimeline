import Link from 'next/link';
import { getAllEarbuds } from '@/lib/queries';
import { getBluetoothVersionList, getCodecList } from '@/lib/tech';
import { buildBreadcrumbJsonLd, canonicalFor, JsonLd } from '@/lib/seo';
import { Footer } from '@/components/UI';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Technologies — ANC, Bluetooth, USB-C, codecs | EarbudsTimeline',
  description: 'Tous les écouteurs sans fil classés par technologie : réduction de bruit, USB-C, multipoint, version Bluetooth et codecs audio.',
  ...canonicalFor('/technologies'),
};

function Card({ href, title, count }) {
  return (
    <Link
      href={href}
      className="bg-panel border border-line rounded-2xl p-5 hover:border-accent hover:-translate-y-0.5 transition-all"
    >
      <h3 className="m-0 mb-1 text-[15px]">{title}</h3>
      <p className="m-0 text-dim text-xs">{count} modèle{count > 1 ? 's' : ''}</p>
    </Link>
  );
}

export default async function TechnologiesPage() {
  const models = await getAllEarbuds();

  const ancCount = models.filter((m) => m.anc).length;
  const usbcCount = models.filter((m) => m.usb_c).length;
  const multipointCount = models.filter((m) => m.multipoint).length;
  const btVersions = getBluetoothVersionList(models);
  const codecs = getCodecList(models);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Accueil', url: '/' },
          { name: 'Technologies', url: '/technologies' },
        ])}
      />

      <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3.5">Technologies</div>
      <h1 className="font-display font-bold text-[32px] mb-2">Écouteurs par technologie</h1>
      <p className="text-dim text-[13.5px] mb-10">
        Parcourez {models.length} écouteurs référencés selon leurs caractéristiques techniques.
      </p>

      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">Fonctionnalités</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5 mb-10">
        <Card href="/technologies/anc" title="Réduction de bruit active (ANC)" count={ancCount} />
        <Card href="/technologies/usb-c" title="USB-C" count={usbcCount} />
        <Card href="/technologies/multipoint" title="Multipoint" count={multipointCount} />
      </div>

      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">Versions Bluetooth</h2>
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

      <h2 className="text-xs uppercase tracking-[0.1em] text-dim mb-4">Codecs audio</h2>
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

      <Footer />
    </>
  );
}
