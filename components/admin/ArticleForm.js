'use client';

import { useState } from 'react';
import FormField from './FormField';
import RichTextEditor from './RichTextEditor';
import MarkdownImporter from './MarkdownImporter';

export default function ArticleForm({ action, defaults = {}, sourceArticle = null, lockId = false, submitLabel = 'Enregistrer', models = [], brands = [] }) {
  const [status, setStatus] = useState(defaults.status || 'draft');
  const [locale, setLocale] = useState(defaults.locale || (sourceArticle ? 'en' : 'fr'));
  const [title, setTitle] = useState(defaults.title || '');
  const [excerpt, setExcerpt] = useState(defaults.excerpt || '');
  const [slugId, setSlugId] = useState(defaults.id || '');
  const [contentHtml, setContentHtml] = useState(defaults.content_html || '');
  const [tableOfContents, setTableOfContents] = useState(defaults.table_of_contents || []);
  const [wordCount, setWordCount] = useState(defaults.word_count || 0);
  const [readingMinutes, setReadingMinutes] = useState(defaults.reading_minutes || 1);

  function handleMarkdownImport(result) {
    if (!result) return;
    if (result.title) setTitle(result.title);
    if (result.excerpt) setExcerpt(result.excerpt);
    if (!lockId && result.id) setSlugId(result.id);
    if (result.status) setStatus(result.status);
    if (result.content_html) setContentHtml(result.content_html);
    if (result.locale === 'fr' || result.locale === 'en') setLocale(result.locale);
    if (Array.isArray(result.table_of_contents)) setTableOfContents(result.table_of_contents);
    if (Number.isFinite(result.word_count)) setWordCount(result.word_count);
    if (Number.isFinite(result.reading_minutes)) setReadingMinutes(result.reading_minutes);
  }

  return (
    <div className="max-w-3xl flex flex-col gap-4">
      <MarkdownImporter models={models} brands={brands} locale={locale} onImport={handleMarkdownImport} />

      <form action={action} encType="multipart/form-data" className="flex flex-col gap-4">
        {sourceArticle && (
          <div className="bg-panel2 border border-line rounded-xl p-4 mb-2">
            <p className="text-xs text-accent uppercase tracking-[0.08em] mb-2">Traduction de l&apos;article français « {sourceArticle.title} »</p>
            <p className="text-xs text-dim mb-1"><b className="text-white">Titre FR :</b> {sourceArticle.title}</p>
            <p className="text-xs text-dim"><b className="text-white">Extrait FR :</b> {sourceArticle.excerpt}</p>
          </div>
        )}

        <div>
          <label htmlFor="article-locale" className="block text-xs text-dim mb-1.5">Langue de l&apos;article</label>
          <select id="article-locale" name="locale" value={locale} onChange={(e) => setLocale(e.target.value)} className="w-full bg-panel2 border border-line rounded-lg px-3 py-2.5 outline-none focus:border-accent text-white">
            <option value="fr">Français (FR)</option>
            <option value="en">English (EN)</option>
          </select>
          <p className="text-xs text-dim mt-1.5">Choisissez la langue principale du contenu.</p>
        </div>

        {sourceArticle && <input type="hidden" name="translation_of" value={sourceArticle.id} />}
        {!lockId && <FormField label="Identifiant (slug, optionnel)" name="id" placeholder="laisser vide pour le générer depuis le titre" value={slugId} onChange={(e) => setSlugId(e.target.value)} />}
        <FormField label="Titre" name="title" placeholder="ex. Les meilleurs écouteurs sortis en 2024" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-dim text-xs">Extrait (affiché sur les cartes d&apos;articles)</span>
          <textarea name="excerpt" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required className="bg-panel2 border border-line rounded-lg px-3 py-2.5 outline-none focus:border-accent resize-y text-white" />
        </label>

        <div>
          <label className="block text-xs text-dim mb-1.5">Image de couverture</label>
          {defaults.cover_image_url && <div className="mb-2.5 w-40 aspect-video rounded-lg bg-panel2 border border-line flex items-center justify-center overflow-hidden"><img src={defaults.cover_image_url} alt="" className="w-full h-full object-cover" /></div>}
          <input type="file" name="cover_image" accept="image/*" className="w-full text-sm text-dim file:mr-3 file:py-2 file:px-3 file:rounded-lg file:bg-panel2 file:text-white file:text-xs file:cursor-pointer" />
          {defaults.cover_image_url && <p className="text-xs text-dim mt-1.5">Laisser vide pour conserver l&apos;image actuelle.</p>}
        </div>

        <RichTextEditor name="content_html" value={contentHtml} onChange={(html) => setContentHtml(html)} defaultValue={defaults.content_html || ''} />

        <input type="hidden" name="table_of_contents" value={JSON.stringify(tableOfContents)} />
        <input type="hidden" name="word_count" value={wordCount} />
        <input type="hidden" name="reading_minutes" value={readingMinutes} />

        {tableOfContents.length > 0 && (
          <div className="bg-panel2 border border-line rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div><p className="text-xs text-white font-semibold">Structure éditoriale</p><p className="text-[11px] text-dim">Détectée automatiquement depuis le Markdown</p></div>
              <span className="text-[10px] text-accent border border-line rounded px-2 py-1">{tableOfContents.length} sections</span>
            </div>
            <div className="flex gap-2 text-[11px] text-dim mb-3"><span>{wordCount.toLocaleString('fr-FR')} mots</span><span>·</span><span>{readingMinutes} min de lecture</span></div>
            <div className="space-y-1.5">
              {tableOfContents.map((item) => <div key={item.id} className="flex gap-2 text-xs" style={{ paddingLeft: `${Math.max(0, item.level - 2) * 16}px` }}><span className="text-accent font-mono text-[10px]">H{item.level}</span><span className="text-white">{item.title}</span></div>)}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs text-dim mb-1.5">Statut</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStatus('draft')} className={`px-3 py-2 rounded-lg text-sm border ${status === 'draft' ? 'bg-panel2 border-accent text-white' : 'border-line text-dim'}`}>Brouillon</button>
            <button type="button" onClick={() => setStatus('published')} className={`px-3 py-2 rounded-lg text-sm border ${status === 'published' ? 'bg-accent border-accent text-ink font-semibold' : 'border-line text-dim'}`}>Publié</button>
          </div>
          <input type="hidden" name="status" value={status} />
        </div>

        <button type="submit" className="bg-accent text-ink font-semibold rounded-lg px-4 py-2.5 text-sm w-fit mt-2">{submitLabel}</button>
      </form>
    </div>
  );
}
