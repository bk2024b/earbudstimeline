'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import ConfirmSubmitButton from './ConfirmSubmitButton';
import { deleteEarbud, updateEarbudBuyUrl } from '@/app/admin/(dashboard)/earbuds/actions';
import { ExternalLink, Link2, Plus, Check, X, Loader2 } from 'lucide-react';

export default function EarbudsManager({ earbuds: initialEarbuds = [], brands = [], initialBrand = 'all' }) {
  const [earbuds, setEarbuds] = useState(initialEarbuds);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'no-image', 'no-buy-url', 'has-buy-url', 'marquant', 'anc', etc.

  // État de la modale d'édition rapide du lien d'achat
  const [editingBuyUrlModel, setEditingBuyUrlModel] = useState(null);
  const [buyUrlInput, setBuyUrlInput] = useState('');
  const [isSavingBuyUrl, setIsSavingBuyUrl] = useState(false);
  const [buyUrlError, setBuyUrlError] = useState(null);
  const inputRef = useRef(null);

  // Synchronise si initialEarbuds change depuis le serveur
  useEffect(() => {
    setEarbuds(initialEarbuds);
  }, [initialEarbuds]);

  const QA_STATUS_STYLES = {
    VERIFIED: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
    GOOD: 'bg-accent/15 border-accent/40 text-accent',
    INCOMPLETE: 'bg-amber/15 border-amber/40 text-amber',
    NEEDS_RESEARCH: 'bg-rose-500/15 border-rose-500/40 text-rose-400',
  };

  const brandMap = useMemo(() => {
    const map = new Map();
    brands.forEach((b) => map.set(b.id, b));
    return map;
  }, [brands]);

  const filteredEarbuds = useMemo(() => {
    const q = search.trim().toLowerCase();

    return earbuds.filter((e) => {
      // 1. Filtre marque
      if (selectedBrand !== 'all' && e.brand_id !== selectedBrand) {
        return false;
      }

      // 2. Filtres rapides
      if (filterMode === 'no-image' && e.image_url) return false;
      if (filterMode === 'no-buy-url' && e.buy_url) return false;
      if (filterMode === 'has-buy-url' && !e.buy_url) return false;
      if (filterMode === 'marquant' && !e.marquant) return false;
      if (filterMode === 'anc' && !e.anc) return false;
      if (
        ['VERIFIED', 'GOOD', 'INCOMPLETE', 'NEEDS_RESEARCH'].includes(filterMode) &&
        e.qa_status !== filterMode
      ) {
        return false;
      }

      // 3. Recherche textuelle
      if (q) {
        const brandName = brandMap.get(e.brand_id)?.name?.toLowerCase() || '';
        const matchName = e.name?.toLowerCase().includes(q);
        const matchGamme = e.gamme?.toLowerCase().includes(q);
        const matchBrand = brandName.includes(q);
        const matchId = e.id?.toLowerCase().includes(q);
        const matchChip = e.chip?.toLowerCase().includes(q);
        if (!matchName && !matchGamme && !matchBrand && !matchId && !matchChip) {
          return false;
        }
      }

      return true;
    });
  }, [earbuds, search, selectedBrand, filterMode, brandMap]);

  // Ouverture du popup pour un modèle
  function openBuyUrlModal(model) {
    setEditingBuyUrlModel(model);
    setBuyUrlInput(model.buy_url || '');
    setBuyUrlError(null);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);
  }

  // Fermeture du popup
  function closeBuyUrlModal() {
    setEditingBuyUrlModel(null);
    setBuyUrlInput('');
    setBuyUrlError(null);
  }

  // Sauvegarde rapide du lien d'achat
  async function handleSaveBuyUrl(e) {
    if (e) e.preventDefault();
    if (!editingBuyUrlModel) return;

    setIsSavingBuyUrl(true);
    setBuyUrlError(null);

    try {
      const res = await updateEarbudBuyUrl(editingBuyUrlModel.id, buyUrlInput);
      if (res.ok) {
        const updatedUrl = buyUrlInput.trim() || null;
        // Mise à jour de l'état local immédiatement
        setEarbuds((prev) =>
          prev.map((item) =>
            item.id === editingBuyUrlModel.id ? { ...item, buy_url: updatedUrl } : item
          )
        );
        closeBuyUrlModal();
      }
    } catch (err) {
      setBuyUrlError(err.message || 'Erreur lors de la mise à jour du lien');
    } finally {
      setIsSavingBuyUrl(false);
    }
  }

  // Coller depuis le presse-papier
  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setBuyUrlInput(text.trim());
    } catch {
      // Ignore si refus d'autorisation
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Barre de recherche et filtres */}
      <div className="bg-panel border border-line rounded-xl p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="search"
              placeholder="Rechercher par nom, gamme, puce, marque..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-panel2 border border-line rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-dim outline-none focus:border-accent"
            />
            <span className="absolute left-3 top-2.5 text-xs text-dim">🔍</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent"
            >
              <option value="all">Toutes les marques ({earbuds.length})</option>
              {brands.map((b) => {
                const count = earbuds.filter((e) => e.brand_id === b.id).length;
                return (
                  <option key={b.id} value={b.id}>
                    {b.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Filtres secondaires */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1 border-t border-line/50">
          <span className="text-dim text-[11px]">Affichage rapide :</span>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded-full border transition-colors ${
              filterMode === 'all'
                ? 'bg-accent/15 border-accent text-accent font-medium'
                : 'border-line text-dim hover:text-white'
            }`}
          >
            Tous ({filteredEarbuds.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('no-buy-url')}
            className={`px-2.5 py-1 rounded-full border transition-colors ${
              filterMode === 'no-buy-url'
                ? 'bg-amber/20 border-amber text-amber font-semibold shadow-sm'
                : 'border-line text-amber/80 hover:text-amber'
            }`}
          >
            🔗 Sans lien ({earbuds.filter((e) => !e.buy_url).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('has-buy-url')}
            className={`px-2.5 py-1 rounded-full border transition-colors ${
              filterMode === 'has-buy-url'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 font-semibold'
                : 'border-line text-dim hover:text-white'
            }`}
          >
            ✓ Avec lien ({earbuds.filter((e) => e.buy_url).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('no-image')}
            className={`px-2.5 py-1 rounded-full border transition-colors ${
              filterMode === 'no-image'
                ? 'bg-accent/15 border-accent text-accent font-medium'
                : 'border-line text-dim hover:text-white'
            }`}
          >
            📷 Sans photo ({earbuds.filter((e) => !e.image_url).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('marquant')}
            className={`px-2.5 py-1 rounded-full border transition-colors ${
              filterMode === 'marquant'
                ? 'bg-accent/15 border-accent text-accent font-medium'
                : 'border-line text-dim hover:text-white'
            }`}
          >
            ★ Marquants ({earbuds.filter((e) => e.marquant).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('anc')}
            className={`px-2.5 py-1 rounded-full border transition-colors ${
              filterMode === 'anc'
                ? 'bg-accent/15 border-accent text-accent font-medium'
                : 'border-line text-dim hover:text-white'
            }`}
          >
            🎧 Avec ANC ({earbuds.filter((e) => e.anc).length})
          </button>

          <span className="text-dim text-[11px] ml-1">· Qualité :</span>
          {['VERIFIED', 'GOOD', 'INCOMPLETE', 'NEEDS_RESEARCH'].map((status) => {
            const count = earbuds.filter((e) => e.qa_status === status).length;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilterMode(status)}
                className={`px-2.5 py-1 rounded-full border transition-colors font-mono ${
                  filterMode === status
                    ? QA_STATUS_STYLES[status]
                    : 'border-line text-dim hover:text-white'
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste des écouteurs */}
      <div className="flex flex-col gap-2.5">
        {filteredEarbuds.map((e) => {
          const brand = brandMap.get(e.brand_id);
          const brandColor = brand?.color || '#333';

          return (
            <div
              key={e.id}
              className="flex items-center justify-between bg-panel border border-line rounded-xl p-3 sm:p-4 gap-3.5 flex-wrap hover:border-line/80 transition-colors"
            >
              {/* Miniature + Infos */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Vignette photo */}
                <div
                  className="w-12 h-12 rounded-lg border border-line bg-panel2 flex-none flex items-center justify-center overflow-hidden"
                  style={{ borderLeftColor: brandColor, borderLeftWidth: '3px' }}
                >
                  {e.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.image_url} alt="" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-lg opacity-40">🎧</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white truncate">{e.name}</span>
                    {e.marquant && (
                      <span className="text-[11px] px-1.5 py-0.2 rounded bg-amber/15 text-amber border border-amber/30">
                        ★ Marquant
                      </span>
                    )}
                    {e.price && (
                      <span className="text-xs font-mono text-dim">
                        {e.price} $
                      </span>
                    )}
                    {e.qa_status && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${
                          QA_STATUS_STYLES[e.qa_status] || 'border-line text-dim'
                        }`}
                        title="Score qualité DATA V1"
                      >
                        {e.quality_score}/100 · {e.qa_status}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-dim flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span className="text-white/80">{brand?.name || e.brand_id}</span>
                    <span>·</span>
                    <span>{e.gamme}</span>
                    <span>·</span>
                    <span>{e.release_date?.slice(0, 4)}</span>
                    {e.anc && (
                      <>
                        <span>·</span>
                        <span className="text-accent">ANC</span>
                      </>
                    )}
                    {e.battery_case_h && (
                      <>
                        <span>·</span>
                        <span>{e.battery_case_h}h</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Bouton rapide d'état du lien d'achat */}
              <div className="flex items-center gap-2">
                {e.buy_url ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openBuyUrlModal(e)}
                      title="Modifier le lien d'achat"
                      className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-400 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Lien OK</span>
                    </button>
                    <a
                      href={e.buy_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ouvrir le lien d'achat"
                      className="text-dim hover:text-white p-1 rounded hover:bg-panel2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openBuyUrlModal(e)}
                    title="Ajouter un lien d'achat en 1 clic"
                    className="text-xs font-medium text-amber bg-amber/10 border border-amber/30 hover:bg-amber/20 hover:border-amber px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Lien</span>
                  </button>
                )}
              </div>

              {/* Actions rapides */}
              <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
                <a
                  href={`/fr/ecouteurs/${e.id}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Voir la fiche publique"
                  className="text-xs text-dim hover:text-white px-2 py-1 rounded bg-panel2 border border-line/60 flex items-center gap-1"
                >
                  <span>↗</span>
                  <span className="hidden sm:inline">Voir</span>
                </a>
                <Link
                  href={`/admin/earbuds/new?cloneFrom=${e.id}`}
                  title="Dupliquer cet écouteur"
                  className="text-xs text-dim hover:text-accent px-2 py-1 rounded bg-panel2 border border-line/60 flex items-center gap-1"
                >
                  <span>📋</span>
                  <span className="hidden sm:inline">Dupliquer</span>
                </Link>
                <Link
                  href={`/admin/earbuds/${e.id}`}
                  className="text-xs text-ink bg-accent font-semibold px-3 py-1 rounded hover:opacity-90"
                >
                  Modifier
                </Link>
                <form action={deleteEarbud.bind(null, e.id, e.brand_id)}>
                  <ConfirmSubmitButton
                    className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1"
                    message={`Supprimer définitivement ${e.name} ?`}
                  >
                    Supprimer
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          );
        })}

        {filteredEarbuds.length === 0 && (
          <div className="bg-panel border border-line rounded-xl p-8 text-center text-dim text-sm">
            Aucun écouteur ne correspond aux filtres ou à la recherche.
          </div>
        )}
      </div>

      {/* POPUP MODAL : Édition rapide du lien d'achat */}
      {editingBuyUrlModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          {/* Clic hors de la modale pour fermer */}
          <div className="fixed inset-0" onClick={closeBuyUrlModal} />

          <div
            className="relative w-full max-w-lg bg-panel border border-line rounded-2xl shadow-2xl p-6 z-10 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header du popup */}
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-accent">
                  Lien d'achat rapide
                </div>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {editingBuyUrlModel.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeBuyUrlModal}
                className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-dim hover:text-white hover:border-line/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSaveBuyUrl} className="flex flex-col gap-3">
              <label className="text-xs text-dim flex flex-col gap-1.5">
                <span>URL marchande ou affiliée (Amazon, constructeur, etc.) :</span>
                <div className="relative flex items-center">
                  <input
                    ref={inputRef}
                    type="url"
                    value={buyUrlInput}
                    onChange={(e) => setBuyUrlInput(e.target.value)}
                    placeholder="https://www.amazon.fr/dp/..."
                    className="w-full bg-panel2 border border-line rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-dim outline-none focus:border-accent pr-20"
                  />
                  {buyUrlInput && (
                    <button
                      type="button"
                      onClick={() => setBuyUrlInput('')}
                      className="absolute right-2 text-xs text-dim hover:text-white px-2 py-1 bg-panel rounded"
                    >
                      Effacer
                    </button>
                  )}
                </div>
              </label>

              {/* Raccourcis utiles */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <button
                  type="button"
                  onClick={handlePaste}
                  className="px-2.5 py-1 rounded bg-panel2 border border-line text-dim hover:text-white flex items-center gap-1"
                >
                  📋 Coller du presse-papier
                </button>
                {buyUrlInput && (
                  <a
                    href={buyUrlInput}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded bg-panel2 border border-line text-accent hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Tester le lien</span>
                  </a>
                )}
              </div>

              {buyUrlError && (
                <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg p-2.5">
                  {buyUrlError}
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex items-center justify-end gap-2.5 mt-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={closeBuyUrlModal}
                  disabled={isSavingBuyUrl}
                  className="px-4 py-2 rounded-xl border border-line text-sm text-dim hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingBuyUrl}
                  className="px-5 py-2 rounded-xl bg-accent text-ink font-bold text-sm hover:opacity-90 flex items-center gap-1.5 transition-all shadow-md shadow-accent/20 disabled:opacity-50"
                >
                  {isSavingBuyUrl ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Enregistrer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
