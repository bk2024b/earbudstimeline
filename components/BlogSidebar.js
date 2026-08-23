import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import NewsletterSignup from '@/components/NewsletterSignup';
import { Clock, TrendingUp, Sparkles } from 'lucide-react';

export default async function BlogSidebar({ articles = [], locale = 'fr', excludeId }) {
  const t = await getTranslations({ locale, namespace: 'blog' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const tn = await getTranslations({ locale, namespace: 'newsletter' });

  const list = articles.filter((a) => a.id !== excludeId).slice(0, 5);

  return (
    <aside className="flex flex-col gap-8 sticky top-24">
      {/* Bloc Newsletter */}
      <NewsletterSignup
        locale={locale}
        title={tn('title')}
        subtitle={tn('subtitle')}
        placeholder={tn('placeholder')}
        cta={tn('cta')}
        successMessage={tn('success')}
      />

      {/* Raccourci vers le Finder IA */}
      <Link
        href="/trouver-mes-ecouteurs"
        className="p-5 rounded-2xl bg-gradient-to-br from-accent/15 via-panel to-panel border border-accent/30 hover:border-accent transition-all group flex flex-col gap-2 shadow-lg"
      >
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-accent font-semibold tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Timeline Intelligence</span>
        </div>
        <div className="font-display font-bold text-base text-fg group-hover:text-accent transition-colors">
          {locale === 'en' ? 'Find the best earbuds for your budget' : 'Trouvez les meilleurs écouteurs pour votre budget'}
        </div>
        <p className="text-xs text-dim m-0 leading-relaxed">
          {locale === 'en'
            ? 'Our engine analyzes ANC, battery life and specs across 150+ models.'
            : 'Notre moteur analyse ANC, autonomie et rapport qualité/prix.'}
        </p>
        <span className="text-xs font-semibold text-accent mt-2 flex items-center gap-1">
          <span>{locale === 'en' ? 'Launch Finder →' : 'Lancer la recherche →'}</span>
        </span>
      </Link>

      {/* Derniers articles */}
      {list.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.1em] text-dim font-medium pb-2 border-b border-line">
            <TrendingUp className="w-3.5 h-3.5 text-accent" />
            <span>{t('latestArticles') || 'Derniers articles'}</span>
          </div>

          <div className="flex flex-col gap-3">
            {list.map((a) => (
              <Link
                key={a.id}
                href={`/blog/${a.id}`}
                className="group flex items-start gap-3.5 bg-panel border border-line rounded-2xl p-3.5 hover:border-accent/60 transition-all hover:bg-panel2/50"
              >
                <div className="relative w-16 h-16 rounded-xl bg-panel2 shrink-0 overflow-hidden border border-line/60">
                  {a.cover_image_url ? (
                    <Image
                      src={a.cover_image_url}
                      alt={a.title}
                      fill
                      sizes="64px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl opacity-30">
                      🎧
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                  <p className="m-0 text-sm font-semibold text-fg leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                    {a.title}
                  </p>
                  <p className="m-0 text-dim text-xs font-mono flex items-center gap-1 mt-1.5">
                    <Clock className="w-3 h-3 text-dim/70" />
                    <span>{a.reading_minutes} {tc('minutesRead')}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
