import { slugify } from './slug.js';

/**
 * Parse un bloc YAML Frontmatter basique en objet JS.
 */
export function parseFrontmatter(rawContent) {
  const trimmed = rawContent.trim();
  if (!trimmed.startsWith('---')) {
    return { data: {}, body: rawContent };
  }

  const match = trimmed.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, body: rawContent };
  }

  const yamlBlock = match[1];
  const body = match[2];
  const data = {};

  const lines = yamlBlock.split(/\r?\n/);
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    // Nettoyer les guillemets éventuels
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else if (value.toLowerCase() === 'true') {
      value = true;
    } else if (value.toLowerCase() === 'false') {
      value = false;
    } else if (value !== '' && !isNaN(Number(value))) {
      value = Number(value);
    }

    if (key) {
      data[key] = value;
    }
  }

  return { data, body };
}

/**
 * Convertit un texte Markdown simple en HTML propre compatible avec TipTap / Prose.
 */
export function markdownToHtml(markdown) {
  if (!markdown) return '';

  let text = markdown.trim();

  // 1. Protéger les blocs de code ```
  const codeBlocks = [];
  text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
    codeBlocks.push(`<pre><code>${escapeHtml(code.trim())}</code></pre>`);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // 2. Protéger le code inline `
  const inlineCodes = [];
  text = text.replace(/`([^`]+)`/g, (match, code) => {
    inlineCodes.push(`<code>${escapeHtml(code)}</code>`);
    return `__INLINE_CODE_${inlineCodes.length - 1}__`;
  });

  // 3. Images ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg" />');

  // 4. Liens [texte](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-accent underline">$1</a>');

  // 5. Titres H3, H2, H1 -> convertis en H2 ou H3 (l'éditeur TipTap supporte H2 et H3)
  text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h2>$1</h2>');

  // 6. Formatage inline : Gras (** ou __) et Italique (* ou _)
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

  // 7. Citations (> bloc)
  text = text.replace(/^\> (.*$)/gim, '<blockquote><p>$1</p></blockquote>');

  // 8. Listes à puces (- item ou * item)
  text = text.replace(/^[-*]\s+(.*)$/gim, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>(\r?\n)?)+/g, '<ul>$&</ul>');

  // 9. Listes numérotées (1. item)
  text = text.replace(/^\d+\.\s+(.*)$/gim, '<oli>$1</oli>');
  text = text.replace(/(<oli>.*<\/oli>(\r?\n)?)+/g, (match) => {
    return '<ol>' + match.replaceAll('<oli>', '<li>').replaceAll('</oli>', '</li>') + '</ol>';
  });

  // 10. Lignes horizontales
  text = text.replace(/^---$/gim, '<hr />');

  // 11. Tableaux Markdown (| col1 | col2 |)
  text = text.replace(/((?:\|[^\n]+\|\r?\n?)+)/g, (match) => {
    const rawLines = match.trim().split(/\r?\n/).filter((l) => l.trim().startsWith('|'));
    if (rawLines.length < 2) return match;

    const isSeparator = /^\|(?:\s*:?-+:?\s*\|)+$/.test(rawLines[1].trim());
    if (!isSeparator) return match;

    const parseRow = (line) =>
      line
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => cell.trim());

    const headerCells = parseRow(rawLines[0]);
    const headerHtml = `<thead><tr>${headerCells.map((c) => `<th>${c}</th>`).join('')}</tr></thead>`;

    const bodyRows = rawLines.slice(2);
    const bodyHtml = bodyRows
      .map((row) => {
        const cells = parseRow(row);
        return `<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`;
      })
      .join('');

    return `<table class="border-collapse border border-line w-full text-left my-4">${headerHtml}<tbody>${bodyHtml}</tbody></table>`;
  });

  // 12. Paragraphes : découper par double saut de ligne
  const blocks = text.split(/\r?\n\s*\r?\n/);
  const formattedBlocks = blocks.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (
      trimmed.startsWith('<h2>') ||
      trimmed.startsWith('<h3>') ||
      trimmed.startsWith('<ul>') ||
      trimmed.startsWith('<ol>') ||
      trimmed.startsWith('<blockquote>') ||
      trimmed.startsWith('<pre>') ||
      trimmed.startsWith('<hr') ||
      trimmed.startsWith('<img') ||
      trimmed.startsWith('<table') ||
      trimmed.startsWith('__CODE_BLOCK_')
    ) {
      return trimmed;
    }
    // Remplacer les retours à la ligne simples dans un paragraphe par des espaces
    const inner = trimmed.replace(/\r?\n/g, ' ');
    return `<p>${inner}</p>`;
  });

  let html = formattedBlocks.filter(Boolean).join('\n');

  // Restaurer le code
  html = html.replace(/__INLINE_CODE_(\d+)__/g, (match, idx) => inlineCodes[Number(idx)] || '');
  html = html.replace(/__CODE_BLOCK_(\d+)__/g, (match, idx) => codeBlocks[Number(idx)] || '');

  return html;
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Construit le dictionnaire d'entités reconnaissables (modèles, marques, technologies)
 * trié par longueur décroissante de nom pour éviter les conflits d'auto-linking.
 */
export function buildEntitiesDictionary(models = [], brands = [], locale = 'fr') {
  const prefix = `/${locale}`;
  const entities = [];

  // 1. Modèles d'écouteurs (ex: "AirPods Pro 2", "WF-1000XM5", "Galaxy Buds3 Pro")
  for (const m of models) {
    if (!m.name) continue;
    entities.push({
      type: 'model',
      name: m.name,
      url: `${prefix}/ecouteurs/${m.id}`,
      id: m.id,
    });

    // Variantes de nom courantes sans parenthèses ou suffixes si pertinent
    const cleanedName = m.name.replace(/\s*\([^)]*\)/g, '').trim();
    if (cleanedName && cleanedName !== m.name && cleanedName.length > 3) {
      entities.push({
        type: 'model',
        name: cleanedName,
        url: `${prefix}/ecouteurs/${m.id}`,
        id: m.id,
      });
    }
  }

  // 2. Marques (ex: "Apple", "Samsung", "Sony", "Google", "Nothing")
  for (const b of brands) {
    if (!b.name) continue;
    entities.push({
      type: 'brand',
      name: b.name,
      url: `${prefix}/marques/${b.id}`,
      id: b.id,
    });
  }

  // 3. Technologies et Hubs
  const techKeywords = [
    { name: 'Réduction de bruit active', url: `${prefix}/technologies/anc`, type: 'tech' },
    { name: 'Réduction active du bruit', url: `${prefix}/technologies/anc`, type: 'tech' },
    { name: 'Active Noise Cancellation', url: `${prefix}/technologies/anc`, type: 'tech' },
    { name: 'ANC', url: `${prefix}/technologies/anc`, type: 'tech' },
    { name: 'Multipoint', url: `${prefix}/technologies/multipoint`, type: 'tech' },
    { name: 'Bluetooth Multipoint', url: `${prefix}/technologies/multipoint`, type: 'tech' },
    { name: 'USB-C', url: `${prefix}/technologies/usb-c`, type: 'tech' },
    { name: 'LDAC', url: `${prefix}/technologies/codecs/ldac`, type: 'tech' },
    { name: 'aptX Adaptive', url: `${prefix}/technologies/codecs/aptx-adaptive`, type: 'tech' },
    { name: 'aptX Lossless', url: `${prefix}/technologies/codecs/aptx-lossless`, type: 'tech' },
    { name: 'aptX HD', url: `${prefix}/technologies/codecs/aptx-hd`, type: 'tech' },
    { name: 'aptX', url: `${prefix}/technologies/codecs/aptx`, type: 'tech' },
    { name: 'LHDC', url: `${prefix}/technologies/codecs/lhdc`, type: 'tech' },
    { name: 'LC3', url: `${prefix}/technologies/codecs/lc3`, type: 'tech' },
    { name: 'AAC', url: `${prefix}/technologies/codecs/aac`, type: 'tech' },
    { name: 'Bluetooth 5.4', url: `${prefix}/technologies/bluetooth/5.4`, type: 'tech' },
    { name: 'Bluetooth 5.3', url: `${prefix}/technologies/bluetooth/5.3`, type: 'tech' },
    { name: 'Bluetooth 5.2', url: `${prefix}/technologies/bluetooth/5.2`, type: 'tech' },
    { name: 'Bluetooth 5.0', url: `${prefix}/technologies/bluetooth/5.0`, type: 'tech' },
  ];

  for (const t of techKeywords) {
    entities.push(t);
  }

  // Dédupliquer et trier par longueur décroissante (les noms les plus longs d'abord)
  const seen = new Set();
  const uniqueSorted = [];

  const sorted = entities.sort((a, b) => b.name.length - a.name.length);
  for (const item of sorted) {
    const key = item.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueSorted.push(item);
    }
  }

  return uniqueSorted;
}

/**
 * Échappe les caractères réservés des expressions régulières.
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Applique l'auto-linking sur un contenu HTML en protégeant les balises existantes
 * et les liens <a> déjà présents.
 */
export function applyAutoLinking(html, entities = []) {
  if (!html || !entities.length) return { html, stats: { totalLinks: 0, byType: {}, matchedEntities: [] } };

  const matchedSet = new Set();
  const stats = {
    totalLinks: 0,
    byType: { model: 0, brand: 0, tech: 0 },
    matchedEntities: [],
  };

  // Découper le HTML en segments : tags HTML / balises <a> complètes / blocs de code vs texte brut
  const tagOrLinkRegex = /(<a\b[^>]*>[\s\S]*?<\/a>|<pre\b[^>]*>[\s\S]*?<\/pre>|<code\b[^>]*>[\s\S]*?<\/code>|<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>|<[^>]+>)/gi;

  const parts = html.split(tagOrLinkRegex);

  // Limite à 2 occurrences automatiques par entité par article pour éviter le spam de liens
  const linkedEntityOccurrences = new Map();

  for (let i = 0; i < parts.length; i++) {
    const segment = parts[i];
    // Si c'est une balise HTML, un lien ou un titre, on ne touche pas
    if (segment.startsWith('<') || !segment.trim()) {
      continue;
    }

    let text = segment;

    for (const entity of entities) {
      const timesLinked = linkedEntityOccurrences.get(entity.name) || 0;
      if (timesLinked >= 2) continue;

      const escapedName = escapeRegExp(entity.name);
      const regex = new RegExp(`(?<=^|[\\s.,!?;:()«»"'’\\[\\]])(${escapedName})(?=$|[\\s.,!?;:()«»"'’\\[\\]])`, 'gi');

      text = text.replace(regex, (match) => {
        const currentCount = linkedEntityOccurrences.get(entity.name) || 0;
        if (currentCount >= 2) return match;

        linkedEntityOccurrences.set(entity.name, currentCount + 1);
        stats.totalLinks += 1;
        stats.byType[entity.type] = (stats.byType[entity.type] || 0) + 1;

        if (!matchedSet.has(entity.name)) {
          matchedSet.add(entity.name);
          stats.matchedEntities.push({
            name: entity.name,
            type: entity.type,
            url: entity.url,
          });
        }

        return `<a href="${entity.url}" class="text-accent underline">${match}</a>`;
      });
    }

    parts[i] = text;
  }

  return {
    html: parts.join(''),
    stats,
  };
}

/**
 * Fonction principale d'analyse d'un fichier Markdown d'article.
 */
export function parseArticleMarkdown(mdContent, { models = [], brands = [], locale = 'fr', autoLink = true } = {}) {
  if (!mdContent || typeof mdContent !== 'string') {
    return null;
  }

  // 1. Extraction Frontmatter
  const { data: frontmatter, body } = parseFrontmatter(mdContent);

  // 2. Détection heuristique
  let title = frontmatter.title || '';
  let excerpt = frontmatter.excerpt || '';
  let status = frontmatter.status === 'published' ? 'published' : 'draft';
  const detectedLocale = frontmatter.locale || locale;
  let id = frontmatter.id || frontmatter.slug || '';
  const cover_image_url = frontmatter.cover_image_url || frontmatter.cover_image || null;
  const translation_of = frontmatter.translation_of || null;

  let cleanBody = body;

  // Si pas de titre dans le frontmatter, chercher le premier titre Markdown (# Titre ou ## Titre)
  if (!title) {
    const titleMatch = cleanBody.match(/^#\s+(.*)$/m) || cleanBody.match(/^##\s+(.*)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
      cleanBody = cleanBody.replace(titleMatch[0], '').trim();
    }
  }

  // Si pas de slug, le dériver du titre
  if (!id && title) {
    id = slugify(title);
  }

  // Si pas d'extrait dans le frontmatter, chercher le premier paragraphe
  if (!excerpt) {
    const paragraphs = cleanBody.split(/\r?\n\s*\r?\n/);
    for (const p of paragraphs) {
      const trimmed = p.trim();
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('>') && !trimmed.startsWith('![')) {
        excerpt = trimmed.replace(/[*_`#]/g, '').slice(0, 250).trim();
        if (trimmed.length > 250) excerpt += '…';
        break;
      }
    }
  }

  // 3. Conversion du corps en HTML
  let htmlContent = markdownToHtml(cleanBody);

  // 4. Application de l'auto-linking des entités
  let linkingStats = { totalLinks: 0, byType: {}, matchedEntities: [] };

  if (autoLink && (models.length > 0 || brands.length > 0)) {
    const entities = buildEntitiesDictionary(models, brands, detectedLocale);
    const linkResult = applyAutoLinking(htmlContent, entities);
    htmlContent = linkResult.html;
    linkingStats = linkResult.stats;
  }

  return {
    title,
    excerpt,
    id,
    status,
    locale: detectedLocale,
    cover_image_url,
    translation_of,
    content_html: htmlContent,
    linkingStats,
  };
}
