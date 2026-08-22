'use client';

import { useState } from 'react';
import FormField from './FormField';
import RichTextEditor from './RichTextEditor';
import MarkdownImporter from './MarkdownImporter';

export default function ArticleForm({
  action,
  defaults = {},
  sourceArticle = null,
  lockId = false,
  submitLabel = 'Enregistrer',
  models = [],
  brands = [],
}) {
  const [status, setStatus] = useState(defaults.status || 'draft');
  const [locale, setLocale] = useState(defaults.locale || (sourceArticle ? 'en' : 'fr'));
  const [title, setTitle] = useState(defaults.title || '');
  const [excerpt, setExcerpt] = useState(defaults.excerpt || '');
  const [slugId, setSlugId] = useState(defaults.id || '');
  const [contentHtml, setContentHtml] = useState(defaults.content_html || '');

  function handleMarkdownImport(result) {
    if (!result) return;
    if (result.title) setTitle(result.title);
    if (result.excerpt) setExcerpt(result.excerpt);
    if (!lockId && result.id) setSlugId(result.id);
    if (result.status) setStatus(result.status);
    if (result.content_html) setContentHtml(result.content_html);
    if (result.locale === 'fr' || result.locale === 'en') setLocale(result.locale);
  }

  return (
    <div className="max-w-3xl flex flex-col gap-4">
      {/* Module d'importation de fichier Markdown avec auto-linking */}
      <MarkdownImporter
        models={models}
        brands={brands}
        locale={locale}
        onImport={handleMarkdownImport}
      />

      <form action={action} encType="multipart/form-data" className="flex flex-col gap-4">
        {sourceArticle && (
          <div className="bg-panel2 border border-line rounded-xl p-4 mb-2">
            <p className="text-xs text-accent uppercase tracking-[0.08em] mb-2">
              Traduction de l&apos;article français « {sourceArticle.title} »
            </p>
            <p className="text-xs text-dim mb-1">
              <b className="text-white">Titre FR :</b> {sourceArticle.title}
            </p>
            <p className="text-xs text-dim">
              <b className="text-white">Extrait FR :</b> {sourceArticle.excerpt}
            </p>
          </div>
        )}

        <div>
          <label htmlFor="article-locale" className="block text-xs text-dim mb-1.5">
            Langue de l&apos;article
          </label>
          <select
            id="article-locale"
            name="locale"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="w-full bg-panel2 border border-line rounded-lg px-3 py-2.5 outline-none focus:border-accent text-white"
          >
            <option value="fr">Français (FR)</option>
            <option value="en">English (EN)</option>
          </select>
          <p className="text-xs text-dim mt-1.5">
            Choisissez la langue principale du contenu. Elle détermine notamment la version du site sur laquelle l&apos;article sera publié.
          </p>
        </div>

        {sourceArticle && <input type="hidden" name="translation_of" value={sourceArticle.id} />}

        {!lockId && (
          <FormField
            label="Identifiant (slug, optionnel)"
            name="id"
            placeholder="laisser vide pour le générer depuis le titre"
            value={slugId}
            onChange={(e) => setSlugId(e.target.value)}
          />
        )}

        <FormField
          label="Titre"
          name="title"
          placeholder="ex. Les meilleurs écouteurs sortis en 2024"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-dim text-xs">Extrait (affiché sur les cartes d&apos;articles)</span>
          <textarea
            name="excerpt"
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
            className="bg-panel2 border border-line rounded-lg px-3 py-2.5 outline-none focus:border-accent resize-y text-white"
          />
        </label>

        <div>
          <label className="block text-xs text-dim mb-1.5">Image de couverture</label>
          {defaults.cover_image_url && (
            <div className="mb-2.5 w-40 aspect-video rounded-lg bg-panel2 border border-line flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={defaults.cover_image_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <input
            type="file"
            name="cover_image"
            accept="image/*"
            className="w-full text-sm text-dim file:mr-3 file:py-2 file:px-3 file:rounded-lg file:bg-panel2 file:text-white file:text-xs file:cursor-pointer"
          />
          {defaults.cover_image_url && (
            <p className="text-xs text-dim mt-1.5">Laisser vide pour conserver l&apos;image actuelle.</p>
          )}
        </div>

        <RichTextEditor
          name="content_html"
          value={contentHtml}
          onChange={(html) => setContentHtml(html)}
          defaultValue={defaults.content_html || ''}
        />

        <div>
          <label className="block text-xs text-dim mb-1.5">Statut</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStatus('draft')}
              className={`px-3 py-2 rounded-lg text-sm border ${
                status === 'draft' ? 'bg-panel2 border-accent text-white' : 'border-line text-dim'
              }`}
            >
              Brouillon
            </button>
            <button
              type="button"
              onClick={() => setStatus('published')}
              className={`px-3 py-2 rounded-lg text-sm border ${
                status === 'published' ? 'bg-accent border-accent text-ink font-semibold' : 'border-line text-dim'
              }`}
            >
              Publié
            </button>
          </div>
          <input type="hidden" name="status" value={status} />
        </div>

        <button type="submit" className="bg-accent text-ink font-semibold rounded-lg px-4 py-2.5 text-sm w-fit mt-2">
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
