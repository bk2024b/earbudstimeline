import './globals.css';
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import Header from '@/components/Header';
import { SITE_URL } from '@/lib/seo';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});
const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "EarbudsTimeline — l'historique complet des écouteurs sans fil",
  description: "L'historique complet des écouteurs sans fil, marque par marque.",
  alternates: { canonical: '/' },
  openGraph: {
    title: 'EarbudsTimeline',
    description: "L'historique complet des écouteurs sans fil, marque par marque.",
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="bg-ink text-white font-body antialiased">
        <div className="max-w-[1080px] mx-auto px-5 pb-20">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
