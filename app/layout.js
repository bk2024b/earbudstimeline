import './globals.css';
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
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
  verification: {
    google: 'ZilcoLVCMEUHQtUAAU3aOgfPqvd9MSjazLClBqS-CVA',
  },
  openGraph: {
    title: 'EarbudsTimeline',
    description: "L'historique complet des écouteurs sans fil, marque par marque.",
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        {/* Anti-flash : applique le thème sauvegardé sur <html> avant le premier
            rendu, pour éviter un clignotement sombre→clair au chargement.
            Reste sans effet sur l'admin, qui neutralise .light via .force-dark
            (voir app/admin/layout.js et globals.css). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='light'){document.documentElement.classList.add('light')}}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-page text-fg font-body antialiased">
        {children}
      </body>
    </html>
  );
}
