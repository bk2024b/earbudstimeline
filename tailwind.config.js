/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0B',
        panel: '#141416',
        panel2: '#1C1C1F',
        line: '#27272A',
        dim: '#9A9AA3',
        accent: '#22D07A',
        amber: '#FFB454',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      typography: {
        invert: {
          css: {
            '--tw-prose-body': '#E4E4E7',
            '--tw-prose-headings': '#FFFFFF',
            '--tw-prose-links': '#22D07A',
            '--tw-prose-bold': '#FFFFFF',
            '--tw-prose-quotes': '#9A9AA3',
            '--tw-prose-quote-borders': '#27272A',
            '--tw-prose-bullets': '#9A9AA3',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
