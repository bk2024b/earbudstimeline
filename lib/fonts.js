import { Space_Grotesk, Inter, IBM_Plex_Mono } from 'next/font/google';

export const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});
// Inter remplace IBM Plex Sans — les deux design bibles (Sonic Chronology et
// Obsidian Archive Light) spécifient Inter pour tout le texte courant/lecture.
export const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});
export const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});
