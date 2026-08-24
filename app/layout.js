import './globals.css';
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import { getLocale } from 'next-intl/server';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
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
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
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

export default async function RootLayout({ children }) {
  // Preconnect vers l'origine Supabase Storage (images produits/articles) —
  // accélère le premier chargement d'image externe (Lighthouse "preconnect
  // candidates"). Dérivé de la variable d'env plutôt que codé en dur, pour ne
  // pas casser si le projet Supabase change.
  let supabaseOrigin = null;
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      supabaseOrigin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
    }
  } catch {
    // URL invalide/absente : on se passe simplement du preconnect, pas bloquant.
  }

  // Résolu via le contexte de requête next-intl (middleware + plugin), pas via
  // `params` : ce layout racine est au-dessus du segment [locale] et ne reçoit
  // donc jamais la locale par les params. Sans ça, <html lang> restait figé sur
  // "fr" même sur les routes /en/*.
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {supabaseOrigin && <link rel="preconnect" href={supabaseOrigin} />}
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
