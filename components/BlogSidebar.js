import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import NewsletterSignup from '@/components/NewsletterSignup';

export default async function BlogSidebar({ articles, locale, excludeId }) {
  const t = await getTranslations({ locale, namespace: 'blog' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const tn = await getTranslations({ locale, namespace: 'newsletter' });

  const list = articles.filter((a) => a.id !== excludeId).slice(0, 6);

  return (
    <aside className="flex flex-col gap-6">
      <NewsletterSignup
        locale={locale}
        title={tn('title')}
        subtitle={tn('subtitle')}
        placeholder={tn('placeholder')}
        cta={tn('cta')}
        successMessage={tn('success')}
      />

      {list.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xs uppercase tracking-[0.1em] text-dim">{t('latestArticles')}</h2>
          <div className="flex flex-col gap-3">
            {list.map((a) => (
              <Link
                key={a.id}
                href={`/blog/${a.id}`}
                className="flex items-center gap-3 bg-panel border border-line rounded-xl p-3 hover:border-accent transition-colors"
              >
                <div className="relative w-14 h-14 rounded-lg bg-panel2 shrink-0 overflow-hidden">
                  {a.cover_image_url && (
                    <Image src={a.cover_image_url} alt="" fill sizes="56px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="m-0 text-[13px] font-medium leading-snug line-clamp-2">{a.title}</p>
                  <p className="m-0 text-dim text-[11px] mt-1">
                    {a.reading_minutes} {tc('minutesRead')}
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
