'use client';

import { useState, useRef } from 'react';
import { parseArticleMarkdown } from '@/lib/markdownArticleParser';

export default function MarkdownImporter({ models = [], brands = [], locale = 'fr', onImport }) {
  const [isDragging, setIsDragging] = useState(false);
  const [autoLink, setAutoLink] = useState(true);
  const [parsedResult, setParsedResult] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  function handleFile(file) {
    if (!file) return;
    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown') && !file.name.endsWith('.txt')) {
      alert('Veuillez sélectionner un fichier Markdown (.md ou .markdown)');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        const result = parseArticleMarkdown(content, {
          models,
          brands,
          locale,
          autoLink,
        });
        setParsedResult(result);
        if (onImport) {
          onImport(result);
        }
      }
    };
    reader.readAsText(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleManualApply() {
    if (parsedResult && onImport) {
      onImport(parsedResult);
    }
  }

  function handleReset() {
    setParsedResult(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="bg-panel border border-line rounded-xl p-4 mb-3">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-base">📄</span>
          <h3 className="font-semibold text-sm text-white">Importer depuis un fichier Markdown (.md)</h3>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-xs text-dim hover:text-white select-none">
          <input
            type="checkbox"
            checked={autoLink}
            onChange={(e) => setAutoLink(e.target.checked)}
            className="rounded border-line bg-panel2 accent-accent cursor-pointer"
          />
          Auto-lier les modèles, marques et technologies
        </label>
      </div>

      {!parsedResult ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-accent bg-accent/5'
              : 'border-line/60 bg-panel2/40 hover:border-accent/60 hover:bg-panel2/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
          />
          <p className="text-xs text-white font-medium mb-1">
            Glissez-déposez votre fichier <code className="bg-panel px-1.5 py-0.5 rounded text-accent">.md</code> ici, ou cliquez pour parcourir
          </p>
          <p className="text-[11px] text-dim">
            Détection automatique : Frontmatter YAML, titre H1, extrait, slug, contenu et création des liens internes.
          </p>
        </div>
      ) : (
        <div className="bg-panel2 rounded-lg p-3 border border-line flex flex-col gap-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-accent font-medium">✓ Fichier importé :</span>
              <span className="text-white font-mono text-[11px] bg-panel px-2 py-0.5 rounded border border-line">
                {fileName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualApply}
                className="bg-accent text-ink font-semibold text-xs px-3 py-1 rounded-md hover:opacity-90"
              >
                Réappliquer au formulaire
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-dim hover:text-white px-2 py-1"
              >
                Changer de fichier
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-line/50">
            <div>
              <span className="text-dim block text-[11px]">Titre extrait :</span>
              <span className="text-white font-medium line-clamp-1">{parsedResult.title || '—'}</span>
            </div>
            <div>
              <span className="text-dim block text-[11px]">Identifiant (slug) :</span>
              <span className="text-white font-mono text-[11px] line-clamp-1">{parsedResult.id || '—'}</span>
            </div>
          </div>

          {parsedResult.linkingStats?.totalLinks > 0 && (
            <div className="pt-2 border-t border-line/50 text-xs">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-accent font-medium">🔗 {parsedResult.linkingStats.totalLinks} liens automatiques créés :</span>
                {parsedResult.linkingStats.byType.model > 0 && (
                  <span className="bg-panel px-2 py-0.5 rounded text-[11px] text-dim border border-line">
                    {parsedResult.linkingStats.byType.model} modèle(s)
                  </span>
                )}
                {parsedResult.linkingStats.byType.brand > 0 && (
                  <span className="bg-panel px-2 py-0.5 rounded text-[11px] text-dim border border-line">
                    {parsedResult.linkingStats.byType.brand} marque(s)
                  </span>
                )}
                {parsedResult.linkingStats.byType.tech > 0 && (
                  <span className="bg-panel px-2 py-0.5 rounded text-[11px] text-dim border border-line">
                    {parsedResult.linkingStats.byType.tech} techno(s)
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {parsedResult.linkingStats.matchedEntities.map((ent, i) => (
                  <span
                    key={i}
                    className="bg-panel px-1.5 py-0.5 rounded text-[10px] text-white border border-line/80"
                    title={ent.url}
                  >
                    {ent.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
