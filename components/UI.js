import Link from 'next/link';
import { getBrands, getAllEarbuds } from '@/lib/queries';

export function Stat({ value, label }) {
  return (
    <div>
      <b className="block font-display font-bold text-[28px]">{value}</b>
      <span className="text-dim text-[12.5px] uppercase tracking-[0.08em]">{label}</span>
    </div>
  );
}

export async function Footer() {
  const [brands, models] = await Promise.all([getBrands(), getAllEarbuds()]);
  const topBrands = [...brands]
    .map((b) => ({ ...b, count: models.filter((m) => m.brand_id === b.id).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <footer className="pt-10 border-t border-line mt-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8 text-xs">
        <FooterCol title="Explorer">
          <FooterLink href="/#marques">Toutes les marques</FooterLink>
          <FooterLink href="/annees">Par année</FooterLink>
          <FooterLink href="/technologies">Par technologie</FooterLink>
          <FooterLink href="/comparaisons">Comparaisons</FooterLink>
          <FooterLink href="/blog">Blog</FooterLink>
        </FooterCol>

        <FooterCol title="Marques">
          {topBrands.map((b) => (
            <FooterLink key={b.id} href={`/marques/${b.id}`}>
              {b.name}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Technologies">
          <FooterLink href="/technologies/anc">Réduction de bruit (ANC)</FooterLink>
          <FooterLink href="/technologies/usb-c">USB-C</FooterLink>
          <FooterLink href="/technologies/multipoint">Multipoint</FooterLink>
        </FooterCol>

        <FooterCol title="Outils">
          <FooterLink href="/comparer">Comparateur</FooterLink>
          <FooterLink href="/comparaisons">Toutes les comparaisons</FooterLink>
        </FooterCol>
      </div>

      <p className="text-dim text-xs text-center pt-5 border-t border-line">
        © 2026 EarbudsTimeline — dans la continuité de PhoneTimeline
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
