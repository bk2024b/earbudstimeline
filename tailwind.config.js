/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Toujours sombre, quel que soit le thème — sert exclusivement de couleur
        // de texte sur les surfaces claires/accent (ex. "bg-accent text-ink").
        ink: '#0A0A0B',
        // Theme-aware : leur valeur réelle vient des variables CSS définies dans
        // globals.css (:root = sombre par défaut, .light = clair). L'admin est
        // protégé du mode clair via .force-dark, qui réaffirme les valeurs sombres.
        page: 'var(--color-page)',
        panel: 'var(--color-panel)',
        panel2: 'var(--color-panel2)',
        line: 'var(--color-line)',
        dim: 'var(--color-dim)',
        fg: 'var(--color-fg)',
        accent: 'var(--color-accent)',
        amber: 'var(--color-amber)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      typography: {
        // Configuré directement sur le variant par défaut (pas prose-invert) avec des
        // variables CSS, pour que la même classe "prose" s'adapte automatiquement au
        // thème clair/sombre — au lieu de forcer un rendu sombre partout.
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--color-fg-muted)',
            '--tw-prose-headings': 'var(--color-fg)',
            '--tw-prose-links': 'var(--color-accent)',
            '--tw-prose-bold': 'var(--color-fg)',
            '--tw-prose-quotes': 'var(--color-dim)',
            '--tw-prose-quote-borders': 'var(--color-line)',
            '--tw-prose-bullets': 'var(--color-dim)',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
