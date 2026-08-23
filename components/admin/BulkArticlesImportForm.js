'use client';

import { useState, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import { parseArticleMarkdown } from '@/lib/markdownArticleParser';
import { importBulkArticles } from '@/app/admin/(dashboard)/articles/actions';
import { slugify } from '@/lib/slug';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  Eye,
  X,
  Loader2,
  RefreshCw,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function BulkArticlesImportForm({
  models = [],
  brands = [],
  existingArticles = [],
}) {
  const [items, setItems] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [autoLink, setAutoLink] = useState(true);
  const [defaultLocale, setDefaultLocale] = useState('fr');
  const [defaultStatus, setDefaultStatus] = useState('draft');
  const [overwrite, setOverwrite] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

  const fileInputRef = useRef(null);
  const existingIdsSet = useMemo(
    () => new Set(existingArticles.map((a) => a.id)),
    [existingArticles]
  );

  // Analyse et conversion d'un texte Markdown
  function processMarkdownFile(filename, text) {
    const parsed = parseArticleMarkdown(text, {
      models,
      brands,
      locale: defaultLocale,
      autoLink,
    });

    const title = parsed.title || filename.replace(/\.(md|markdown|txt)$/i, '').replace(/[-_]/g, ' ');
    const id = slugify(parsed.id || title);
    const isDuplicate = existingIdsSet.has(id);

    return {
      id,
      filename,
      title,
      excerpt: parsed.excerpt || '',
      content_html: parsed.content_html || '',
      table_of_contents: parsed.table_of_contents || [],
      word_count: parsed.word_count || 0,
      reading_minutes: parsed.reading_minutes || 1,
      locale: parsed.locale || defaultLocale,
      status: parsed.status || defaultStatus,
      cover_image_url: parsed.cover_image_url || null,
      translation_of: parsed.translation_of || null,
      isDuplicate,
      selected: true,
      errors: !title || !parsed.content_html ? ['Titre ou contenu manquant'] : [],
    };
  }

  // Traitement des fichiers reçus (multi-md, csv, json)
  async function handleFiles(fileList) {
    if (!fileList || fileList.length === 0) return;
    setResults(null);

    const newItems = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (['md', 'markdown', 'txt'].includes(ext)) {
        const text = await file.text();
        newItems.push(processMarkdownFile(file.name, text));
      } else if (ext === 'csv') {
        const text = await file.text();
        await new Promise((resolve) => {
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: (res) => {
              (res.data || []).forEach((row, idx) => {
                const title = row.title || row.titre || '';
                const id = slugify(row.id || title || `article-${Date.now()}-${idx}`);
                const content_html = row.content_html || row.content || '';
                const isDuplicate = existingIdsSet.has(id);
                newItems.push({
                  id,
                  filename: `${file.name} (ligne ${idx + 1})`,
                  title,
                  excerpt: row.excerpt || row.description || '',
                  content_html,
                  table_of_contents: [],
                  word_count: content_html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length,
                  reading_minutes: Math.max(1, Math.round(content_html.length / 1000)),
                  locale: row.locale === 'en' ? 'en' : defaultLocale,
                  status: row.status === 'published' ? 'published' : defaultStatus,
                  cover_image_url: row.cover_image_url || row.image || null,
                  translation_of: row.translation_of || null,
                  isDuplicate,
                  selected: true,
                  errors: !title || !content_html ? ['Titre ou contenu manquant'] : [],
                });
              });
              resolve();
            },
          });
        });
      } else if (ext === 'json') {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          const arrayData = Array.isArray(data) ? data : [data];
          arrayData.forEach((row, idx) => {
            const title = row.title || '';
            const id = slugify(row.id || title || `article-${idx}`);
            const isDuplicate = existingIdsSet.has(id);
            newItems.push({
              id,
              filename: `${file.name} (#${idx + 1})`,
              title,
              excerpt: row.excerpt || '',
              content_html: row.content_html || row.content || '',
              table_of_contents: row.table_of_contents || [],
              word_count: Number(row.word_count) || 0,
              reading_minutes: Number(row.reading_minutes) || 1,
              locale: row.locale === 'en' ? 'en' : defaultLocale,
              status: row.status === 'published' ? 'published' : defaultStatus,
              cover_image_url: row.cover_image_url || null,
              translation_of: row.translation_of || null,
              isDuplicate,
              selected: true,
              errors: !title || !(row.content_html || row.content) ? ['Titre ou contenu manquant'] : [],
            });
          });
        } catch {
          // JSON invalide
        }
      }
    }

    setItems((prev) => [...prev, ...newItems]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  // Statistiques de la file d'attente
  const validItems = items.filter((item) => item.errors.length === 0 && (!item.isDuplicate || overwrite));
  const duplicateCount = items.filter((item) => item.isDuplicate).length;
  const errorCount = items.filter((item) => item.errors.length > 0).length;

  // Lancement de l'importation
  async function handleExecuteImport() {
    const toImport = items.filter((item) => item.selected && item.errors.length === 0 && (!item.isDuplicate || overwrite));
    if (toImport.length === 0) return;

    setSubmitting(true);
    setResults(null);

    try {
      const res = await importBulkArticles({
        articles: toImport,
        overwrite,
      });
      setResults(res);
      // Supprime les items importés avec succès de la liste
      const successIds = new Set((res || []).filter((r) => r.ok).map((r) => r.id));
      setItems((prev) => prev.filter((item) => !successIds.has(item.id)));
    } catch (e) {
      setResults([{ id: '?', title: 'Erreur générale', ok: false, error: e.message }]);
    } finally {
      setSubmitting(false);
    }
  }

  // Actions de modification sur un item
  function toggleSelectItem(idx) {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, selected: !item.selected } : item))
    );
  }

  function updateItemLocale(idx, locale) {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, locale } : item))
    );
  }

  function updateItemStatus(idx, status) {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, status } : item))
    );
  }

  function removeItem(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function clearAll() {
    setItems([]);
    setResults(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Zone de drop de fichiers */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
          isDragging
            ? 'border-accent bg-accent/10 scale-[1.01]'
            : 'border-line bg-panel hover:border-accent/50 hover:bg-panel2/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".md,.markdown,.txt,.csv,.json"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <div className="w-14 h-14 rounded-2xl bg-panel2 border border-line flex items-center justify-center text-accent">
          <UploadCloud className="w-7 h-7" />
        </div>
        <div>
          <p className="font-semibold text-white text-base">
            Glissez-déposez vos fichiers ici, ou cliquez pour parcourir
          </p>
          <p className="text-xs text-dim mt-1">
            Prend en charge plusieurs fichiers Markdown (<code>.md</code>, <code>.markdown</code>), ou un export <code>.csv</code> / <code>.json</code>
          </p>
        </div>
      </div>

      {/* Options globales d'import */}
      <div className="bg-panel border border-line rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer text-white select-none">
            <input
              type="checkbox"
              checked={autoLink}
              onChange={(e) => setAutoLink(e.target.checked)}
              className="rounded border-line bg-panel2 accent-accent cursor-pointer"
            />
            <span>Auto-lier modèles et marques</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-white select-none">
            <input
              type="checkbox"
              checked={overwrite}
              onChange={(e) => setOverwrite(e.target.checked)}
              className="rounded border-line bg-panel2 accent-accent cursor-pointer"
            />
            <span>Écraser si l'article existe déjà</span>
          </label>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-dim">Langue par défaut :</span>
            <select
              value={defaultLocale}
              onChange={(e) => setDefaultLocale(e.target.value)}
              className="bg-panel2 border border-line rounded-lg px-2.5 py-1 text-white outline-none focus:border-accent"
            >
              <option value="fr">Français (FR)</option>
              <option value="en">English (EN)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-dim">Statut initial :</span>
            <select
              value={defaultStatus}
              onChange={(e) => setDefaultStatus(e.target.value)}
              className="bg-panel2 border border-line rounded-lg px-2.5 py-1 text-white outline-none focus:border-accent"
            >
              <option value="draft">Brouillon (draft)</option>
              <option value="published">Publié direct (published)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des articles prêts à importer */}
      {items.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h3 className="font-display font-bold text-lg text-white">
                Articles détectés ({items.length})
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {validItems.length} prêts
              </span>
              {duplicateCount > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber/15 text-amber border border-amber/30">
                  {duplicateCount} existants {overwrite ? '(seront mis à jour)' : '(ignorés)'}
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  {errorCount} invalides
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-dim hover:text-rose-400 px-3 py-1.5 rounded-lg border border-line hover:border-rose-400/40 transition-colors"
              >
                Tout effacer
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={submitting || validItems.length === 0}
                className="bg-accent text-ink font-bold text-sm px-5 py-2 rounded-xl hover:opacity-90 transition-all shadow-md shadow-accent/20 flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importation en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Importer les {validItems.length} articles</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-panel border border-line rounded-2xl overflow-hidden divide-y divide-line/60">
            {items.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="p-4 flex items-center justify-between gap-4 flex-wrap hover:bg-panel2/40 transition-colors"
              >
                {/* Checkbox + Titre + Fichier */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleSelectItem(idx)}
                    className="rounded border-line bg-panel2 accent-accent cursor-pointer w-4 h-4 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-white truncate max-w-md">
                        {item.title}
                      </span>
                      {item.isDuplicate && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber/15 text-amber border border-amber/30">
                          {overwrite ? 'Mise à jour' : 'Existant'}
                        </span>
                      )}
                      {item.errors.length > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          {item.errors.join(', ')}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-dim flex items-center gap-2 flex-wrap mt-0.5 font-mono">
                      <span>slug: {item.id}</span>
                      <span>·</span>
                      <span>{item.word_count} mots</span>
                      <span>·</span>
                      <span>~{item.reading_minutes} min</span>
                      {item.table_of_contents?.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-accent">{item.table_of_contents.length} sections TOC</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sélecteurs Langue & Statut par ligne */}
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={item.locale}
                    onChange={(e) => updateItemLocale(idx, e.target.value)}
                    className="bg-panel2 border border-line rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-accent"
                  >
                    <option value="fr">FR</option>
                    <option value="en">EN</option>
                  </select>

                  <select
                    value={item.status}
                    onChange={(e) => updateItemStatus(idx, e.target.value)}
                    className={`border rounded-lg px-2.5 py-1 text-xs outline-none focus:border-accent ${
                      item.status === 'published'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                        : 'bg-panel2 border-line text-dim'
                    }`}
                  >
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    title="Prévisualiser l'article"
                    className="p-1.5 rounded-lg border border-line text-dim hover:text-white hover:bg-panel2"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    title="Retirer de la liste"
                    className="p-1.5 rounded-lg border border-line text-dim hover:text-rose-400 hover:bg-panel2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rapport des résultats après import */}
      {results && (
        <div className="bg-panel border border-line rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-white">
              Rapport d'importation
            </h3>
            <span className="text-xs text-dim">
              {results.filter((r) => r.ok).length} succès / {results.length} traités
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {results.map((r, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                  r.ok
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  {r.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span className="font-semibold text-white">{r.title}</span>
                  <span className="font-mono text-dim">({r.id})</span>
                  {r.updated && <span className="text-amber">· Mis à jour</span>}
                </div>

                {r.ok ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={`/${r.locale || 'fr'}/blog/${r.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-emerald-400 hover:text-white flex items-center gap-1"
                    >
                      <span>Voir</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={`/admin/articles/${r.id}`}
                      className="underline text-dim hover:text-white"
                    >
                      Éditer
                    </a>
                  </div>
                ) : (
                  <span>{r.error}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de prévisualisation HTML */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setPreviewItem(null)} />
          <div
            className="relative w-full max-w-3xl max-h-[85vh] bg-panel border border-line rounded-2xl shadow-2xl p-6 z-10 flex flex-col gap-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="text-xs font-mono text-accent uppercase tracking-wider">
                  Prévisualisation ({previewItem.locale.toUpperCase()})
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {previewItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-dim hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-2 prose max-w-none">
              {previewItem.excerpt && (
                <div className="p-3.5 rounded-xl bg-accent/10 border border-accent/30 text-xs text-dim mb-4">
                  <strong className="text-accent">Extrait : </strong>
                  {previewItem.excerpt}
                </div>
              )}
              <div dangerouslySetInnerHTML={{ __html: previewItem.content_html }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
