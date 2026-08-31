'use client';

import { useState } from 'react';
import FormField from './FormField';
import GuidePairListEditor from './GuidePairListEditor';
import GuideFilterEditor, { coerceClauseValue } from './GuideFilterEditor';
import GuideSortEditor from './GuideSortEditor';

// --- Convert between the stored JSON shape (guideFilters.js) and the
// editor's per-row UI state (strings, easy to bind to inputs). ---

function filterToClauseState(filter) {
  const clauses = filter?.clauses;
  if (!Array.isArray(clauses)) return [];
  return clauses.map((c) => (c.named
    ? { mode: 'named', named: c.named }
    : { mode: 'field', field: c.field || '', op: c.op || 'eq', value: Array.isArray(c.value) ? c.value.join(',') : (c.value ?? '').toString(), flags: c.flags || '' }
  ));
}

function clauseStateToFilter(clauses) {
  if (!clauses.length) return null;
  return {
    clauses: clauses.map((c) => (c.mode === 'named'
      ? { named: c.named }
      : { field: c.field, op: c.op, value: coerceClauseValue(c.op, c.value), ...(c.op === 'regex' && c.flags ? { flags: c.flags } : {}) }
    )),
  };
}

function sortToRuleState(sort) {
  if (!Array.isArray(sort)) return [];
  return sort.map((r) => (r.computed
    ? { mode: 'computed', computed: r.computed, direction: r.direction || 'desc' }
    : { mode: 'field', field: r.field || '', type: r.type || 'number', direction: r.direction || 'desc' }
  ));
}

function ruleStateToSort(rules) {
  return rules.map((r) => (r.mode === 'computed'
    ? { computed: r.computed, direction: r.direction }
    : { field: r.field, type: r.type, direction: r.direction }
  ));
}

export default function GuideForm({ action, defaults = {}, lockSlug = false, submitLabel = 'Enregistrer' }) {
  const [status, setStatus] = useState(defaults.status || 'draft');
  const [slug, setSlug] = useState(defaults.slug || '');
  const [priority, setPriority] = useState(defaults.priority ?? 0.75);

  const [titleEn, setTitleEn] = useState(defaults.title_en || '');
  const [descriptionEn, setDescriptionEn] = useState(defaults.description_en || '');
  const [introEn, setIntroEn] = useState(defaults.intro_en || '');
  const [sectionsEn, setSectionsEn] = useState(defaults.sections_en || []);
  const [faqEn, setFaqEn] = useState(defaults.faq_en || []);

  const [titleFr, setTitleFr] = useState(defaults.title_fr || '');
  const [descriptionFr, setDescriptionFr] = useState(defaults.description_fr || '');
  const [introFr, setIntroFr] = useState(defaults.intro_fr || '');
  const [sectionsFr, setSectionsFr] = useState(defaults.sections_fr || []);
  const [faqFr, setFaqFr] = useState(defaults.faq_fr || []);

  const [clauses, setClauses] = useState(filterToClauseState(defaults.filter));
  const [sortRules, setSortRules] = useState(sortToRuleState(defaults.sort));

  if (defaults.render_variant && defaults.render_variant !== 'standard') {
    return (
      <div className="max-w-2xl bg-amber/10 border border-amber/40 rounded-xl p-5 text-sm text-white">
        <p className="font-semibold mb-2">⚠️ Guide à rendu spécial (« {defaults.render_variant} »)</p>
        <p className="text-dim">
          « {defaults.slug} » utilise un template bespoke (ANC Intelligence ou Value-per-Dollar) codé en dur dans
          <code className="mx-1 text-xs bg-panel2 px-1.5 py-0.5 rounded">app/[locale]/guides/[slug]/page.js</code>
          plutôt que le filtre/tri déclaratif standard. Ce formulaire ne gère pas ce cas pour éviter de casser le rendu —
          modifiez son contenu directement en base ou dans le code.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="max-w-3xl flex flex-col gap-5">
      {!lockSlug && (
        <FormField
          label="Identifiant (slug, optionnel)"
          name="slug"
          placeholder="laisser vide pour le générer depuis le titre anglais"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
      )}

      <FormField
        label="Priorité (0 à 1, influence l'ordre dans le sitemap)"
        name="priority"
        type="number"
        step="0.05"
        min="0"
        max="1"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      />

      <div className="bg-panel border border-line rounded-xl p-4 flex flex-col gap-3">
        <p className="text-xs text-accent uppercase tracking-[0.08em]">🇬🇧 Contenu — Anglais</p>
        <FormField label="Titre" name="title_en" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} required />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-dim text-xs">Description (meta + carte)</span>
          <textarea name="description_en" rows={2} value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} required className="bg-panel2 border border-line rounded-lg px-3 py-2.5 outline-none focus:border-accent resize-y text-white" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-dim text-xs">Intro (premier paragraphe de la page)</span>
          <textarea name="intro_en" rows={3} value={introEn} onChange={(e) => setIntroEn(e.target.value)} required className="bg-panel2 border border-line rounded-lg px-3 py-2.5 outline-none focus:border-accent resize-y text-white" />
        </label>
        <GuidePairListEditor label="Sections" hint="Titre + paragraphe, affichés sous le catalogue." items={sectionsEn} onChange={setSectionsEn} keyLabel="Titre de section" valueLabel="Texte" addLabel="Ajouter une section" />
        <GuidePairListEditor label="FAQ (optionnel)" items={faqEn} onChange={setFaqEn} keyLabel="Question" valueLabel="Réponse" addLabel="Ajouter une question" />
      </div>

      <div className="bg-panel border border-line rounded-xl p-4 flex flex-col gap-3">
        <p className="text-xs text-accent uppercase tracking-[0.08em]">🇫🇷 Contenu — Français</p>
        <FormField label="Titre" name="title_fr" value={titleFr} onChange={(e) => setTitleFr(e.target.value)} required />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-dim text-xs">Description (meta + carte)</span>
          <textarea name="description_fr" rows={2} value={descriptionFr} onChange={(e) => setDescriptionFr(e.target.value)} required className="bg-panel2 border border-line rounded-lg px-3 py-2.5 outline-none focus:border-accent resize-y text-white" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-dim text-xs">Intro (premier paragraphe de la page)</span>
          <textarea name="intro_fr" rows={3} value={introFr} onChange={(e) => setIntroFr(e.target.value)} required className="bg-panel2 border border-line rounded-lg px-3 py-2.5 outline-none focus:border-accent resize-y text-white" />
        </label>
        <GuidePairListEditor label="Sections" hint="Titre + paragraphe, affichés sous le catalogue." items={sectionsFr} onChange={setSectionsFr} keyLabel="Titre de section" valueLabel="Texte" addLabel="Ajouter une section" />
        <GuidePairListEditor label="FAQ (optionnel)" items={faqFr} onChange={setFaqFr} keyLabel="Question" valueLabel="Réponse" addLabel="Ajouter une question" />
      </div>

      <GuideFilterEditor clauses={clauses} onChange={setClauses} />
      <GuideSortEditor rules={sortRules} onChange={setSortRules} />

      <input type="hidden" name="sections_en" value={JSON.stringify(sectionsEn.filter((s) => s[0] || s[1]))} />
      <input type="hidden" name="faq_en" value={JSON.stringify(faqEn.filter((f) => f[0] || f[1]))} />
      <input type="hidden" name="sections_fr" value={JSON.stringify(sectionsFr.filter((s) => s[0] || s[1]))} />
      <input type="hidden" name="faq_fr" value={JSON.stringify(faqFr.filter((f) => f[0] || f[1]))} />
      <input type="hidden" name="filter" value={JSON.stringify(clauseStateToFilter(clauses))} />
      <input type="hidden" name="sort" value={JSON.stringify(ruleStateToSort(sortRules))} />

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
  );
}
