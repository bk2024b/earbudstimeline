'use client';

import { useState } from 'react';
import FormField from './FormField';
import RichTextEditor from './RichTextEditor';

export default function ArticleForm({ action, defaults = {}, lockId = false, submitLabel = 'Enregistrer' }) {
  const [status, setStatus] = useState(defaults.status || 'draft');

  return (
    <form action={action} encType="multipart/form-data" className="max-w-3xl flex flex-col gap-4">
      {!lockId && (
        <FormField
          label="Identifiant (slug, optionnel)"
          name="id"
          placeholder="laisser vide pour le générer depuis le titre"
        />
      )}

      <FormField label="Titre" name="title" placeholder="ex. Les meilleurs écouteurs sortis en 2024" defaultValue={defaults.title} required />

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-dim text-xs">Extrait (affiché sur les cartes d'articles)</span>
        <textarea
          name="excerpt"
          rows={2}
          defaultValue={defaults.excerpt}
          required
          className="bg-panel2 border border-line rounded-lg px-3 py-2.5 outline-none focus:border-accent resize-y"
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
          className="w-full text-sm text-dim file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-panel2 file:text-white file:text-xs file:cursor-pointer"
        />
        {defaults.cover_image_url && (
          <p className="text-xs text-dim mt-1.5">Laisser vide pour conserver l&apos;image actuelle.</p>
        )}
      </div>

      <RichTextEditor name="content_html" defaultValue={defaults.content_html || ''} />

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

      <button type="submit" className="bg-accent text-ink font-semibold rounded-lg px-4 py-2.5 text-sm w-fit">
        {submitLabel}
      </button>
    </form>
  );
}
