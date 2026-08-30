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
        'surface-high': 'var(--color-surface-high)',
      },
      fontSize: {
        'display-hero': ['clamp(3.5rem, 8vw, 7.5rem)', { lineHeight: '0.95', letterSpacing: '-0.04em', fontWeight: '700' }],
        'display-lg':   ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.1',  letterSpacing: '-0.02em', fontWeight: '600' }],
        'h1':           ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.15',  letterSpacing: '-0.01em', fontWeight: '600' }],
        'h2':           ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.2', fontWeight: '600' }],
        'h3':           ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600' }],
        'h4':           ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'label':        ['0.875rem', { lineHeight: '1rem', letterSpacing: '0.08em', fontWeight: '600' }],
        'body-lg':      ['1.125rem', { lineHeight: '1.75rem' }],
        'caption':      ['0.75rem', { lineHeight: '1rem' }],
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        // Theme-aware : 0px en dark (Sonic Chronology), 4px en light (Obsidian Archive Light)
        base: 'var(--radius-base)',
      },
      boxShadow: {
        glow: '0 0 20px var(--color-glow)',
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
