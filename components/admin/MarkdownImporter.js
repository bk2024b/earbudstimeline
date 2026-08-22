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
        const result = parseArticleMarkdown(content, { models, brands, locale, autoLink });
        setParsedResult(result);
        if (onImport) onImport(result);
      }
    };
    reader.readAsText(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  function handleManualApply() {
    if (parsedResult && onImport) onImport(parsedResult);
  }

  function handleReset() {
    setParsedResult(null);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const toc = parsedResult?.table_of_contents || [];

  return (
    <div className="bg-panel border border-line rounded-xl p-4 mb-3">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-base">📄</span>
          <h3 className="font-semibold text-sm text-white">Importer depuis un fichier Markdown (.md)</h3>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-xs text-dim hover:text-white select-none">
          <input type="checkbox" checked={autoLink} onChange={(e) => setAutoLink(e.target.checked)} className="rounded border-line bg-panel2 accent-accent cursor-pointer" />
          Auto-lier les modèles, marques et technologies
        </label>
      </div>

      {!parsedResult ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragging ? 'border-accent bg-accent/5' : 'border-line/60 bg-panel2/40 hover:border-accent/60 hover:bg-panel2/80'}`}
        >
          <input ref={fileInputRef} type="file" accept=".md,.markdown,.txt" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" />
          <p className="text-xs text-white font-medium mb-1">Glissez-déposez votre fichier <code className="bg-panel px-1.5 py-0.5 rounded text-accent">.md</code> ici, ou cliquez pour parcourir</p>
          <p className="text-[11px] text-dim">Détection automatique : Frontmatter, titre, extrait, slug, contenu, structure H2-H4, table des matières et liens internes.</p>
        </div>
      ) : (
        <div className="bg-panel2 rounded-lg p-3 border border-line flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-accent font-medium">✓ Fichier analysé :</span>
              <span className="text-white font-mono text-[11px] bg-panel px-2 py-0.5 rounded border border-line">{fileName}</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleManualApply} className="bg-accent text-ink font-semibold text-xs px-3 py-1 rounded-md hover:opacity-90">Réappliquer au formulaire</button>
              <button type="button" onClick={handleReset} className="text-xs text-dim hover:text-white px-2 py-1">Changer de fichier</button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <Stat label="Mots" value={parsedResult.word_count?.toLocaleString('fr-FR') || '—'} />
            <Stat label="Lecture" value={parsedResult.reading_minutes ? `${parsedResult.reading_minutes} min` : '—'} />
            <Stat label="Sections" value={toc.length} />
            <Stat label="Liens" value={parsedResult.linkingStats?.totalLinks || 0} />
          </div>

          <div className="border-t border-line/50 pt-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-white font-semibold">Table des matières détectée</p>
                <p className="text-[11px] text-dim">H1 = titre de l’article · H2-H4 = navigation</p>
              </div>
              <span className="text-[10px] bg-panel border border-line rounded px-2 py-1 text-accent">{toc.length} sections</span>
            </div>
            {toc.length > 0 ? (
              <div className="max-h-56 overflow-auto space-y-1 pr-1">
                {toc.map((item) => (
                  <div key={item.id} className="flex items-start gap-2 text-xs" style={{ paddingLeft: `${Math.max(0, item.level - 2) * 16}px` }}>
                    <span className="text-accent font-mono text-[10px] mt-0.5">H{item.level}</span>
                    <span className="text-white line-clamp-2">{item.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-dim">Aucun H2-H4 détecté dans le document.</p>
            )}
          </div>

          {parsedResult.linkingStats?.totalLinks > 0 && (
            <div className="pt-2 border-t border-line/50 text-xs">
              <span className="text-accent font-medium">🔗 {parsedResult.linkingStats.totalLinks} liens automatiques :</span>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {parsedResult.linkingStats.matchedEntities.map((ent, i) => <span key={i} className="bg-panel px-1.5 py-0.5 rounded text-[10px] text-white border border-line/80">{ent.name}</span>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-panel border border-line rounded-lg px-3 py-2">
      <span className="block text-[10px] text-dim uppercase tracking-wide">{label}</span>
      <span className="block text-sm text-white font-semibold mt-0.5">{value}</span>
    </div>
  );
}
