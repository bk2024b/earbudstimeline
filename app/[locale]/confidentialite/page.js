import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { canonicalFor } from '@/lib/seo';
import { Footer } from '@/components/UI';
import { Shield, ExternalLink } from 'lucide-react';

export async function generateMetadata({ params }) {
  const { locale } = params;
  const isEn = locale === 'en';
  const title = isEn
    ? 'Privacy Policy — EarbudsTimeline'
    : 'Politique de Confidentialité — EarbudsTimeline';
  const description = isEn
    ? 'How EarbudsTimeline collects, uses, and protects your data, including information about cookies, analytics, and advertising.'
    : 'Comment EarbudsTimeline collecte, utilise et protège vos données, y compris les cookies, les analyses et la publicité.';
  return {
    title,
    description,
    ...canonicalFor(`/${locale}/confidentialite`),
    openGraph: { title, description },
  };
}

const LAST_UPDATED = '2026-08-24';

export default async function PrivacyPolicyPage({ params }) {
  const { locale } = params;
  const isEn = locale === 'en';

  const updated = new Date(LAST_UPDATED).toLocaleDateString(
    isEn ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-mono uppercase tracking-wider mb-4">
          <Shield className="w-3.5 h-3.5" />
          <span>{isEn ? 'Legal' : 'Légal'}</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-fg leading-tight mb-3">
          {isEn ? 'Privacy Policy' : 'Politique de Confidentialité'}
        </h1>
        <p className="text-sm text-dim">
          {isEn ? 'Last updated:' : 'Dernière mise à jour :'}{' '}
          <span className="text-fg font-medium">{updated}</span>
        </p>
      </div>

      <div className="prose max-w-none text-[15px] leading-relaxed">

        {isEn ? (
          <>
            <p>
              EarbudsTimeline (<strong>earbudstimeline.com</strong>) is an independent editorial site that catalogs the history of wireless earbuds. This privacy policy explains what data we collect, why, and how you can control it.
            </p>

            <h2>1. Data We Collect</h2>
            <p>We collect the following categories of data:</p>
            <ul>
              <li><strong>Usage analytics</strong> — pages visited, session duration, browser and device type, via Google Analytics 4 and Microsoft Clarity.</li>
              <li><strong>Newsletter email address</strong> — only if you voluntarily subscribe via the newsletter form. Stored securely in our Supabase database.</li>
              <li><strong>Technical data</strong> — IP address (anonymized), HTTP headers, language and region settings.</li>
            </ul>
            <p>We <strong>do not</strong> collect names, phone numbers, or payment information. We do not require user registration.</p>

            <h2>2. Cookies & Local Storage</h2>
            <p>We use the following cookies and local storage:</p>
            <ul>
              <li><strong>Theme preference</strong> — stored in <code>localStorage</code> (key: <code>theme</code>) to remember your light/dark mode choice. This never leaves your device.</li>
              <li><strong>Google Analytics</strong> — sets <code>_ga</code> and <code>_ga_*</code> cookies to distinguish users for audience measurement. Data is anonymized.</li>
              <li><strong>Microsoft Clarity</strong> — uses session storage for heatmap and session recording analysis.</li>
              <li><strong>Google AdSense</strong> — sets cookies to display personalized or non-personalized ads based on your browsing context. See Google's privacy policy below.</li>
            </ul>

            <h2>3. Google AdSense & Advertising</h2>
            <p>
              EarbudsTimeline displays ads served by <strong>Google AdSense</strong> (publisher ID: <code>ca-pub-3521871496373731</code>). Google may use cookies to serve ads based on your prior visits to our site and other sites. You can opt out of personalized advertising by visiting{' '}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-accent inline-flex items-center gap-1">
                Google Ads Settings <ExternalLink className="w-3 h-3" />
              </a>.
            </p>
            <p>
              We comply with the IAB's TCF 2.2 framework where required. For EEA and UK visitors, a consent banner may be displayed before advertising cookies are set.
            </p>

            <h2>4. Google Analytics</h2>
            <p>
              We use Google Analytics 4 to understand how visitors use the site. IP addresses are anonymized. You can opt out via the{' '}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-accent inline-flex items-center gap-1">
                Google Analytics Opt-out Browser Add-on <ExternalLink className="w-3 h-3" />
              </a>.
            </p>

            <h2>5. Microsoft Clarity</h2>
            <p>
              We use Microsoft Clarity for session recordings and heatmaps. This helps us improve the user experience. Clarity may record mouse movements, clicks, and scrolling patterns. See{' '}
              <a href="https://privacy.microsoft.com/en-us/privacystatement" target="_blank" rel="noopener noreferrer" className="text-accent inline-flex items-center gap-1">
                Microsoft's Privacy Statement <ExternalLink className="w-3 h-3" />
              </a>.
            </p>

            <h2>6. Newsletter</h2>
            <p>
              If you subscribe to our newsletter, your email address is stored in our database solely to send you updates about new articles and catalog changes. You can unsubscribe at any time by clicking the unsubscribe link in any email we send.
            </p>

            <h2>7. Affiliate Links</h2>
            <p>
              Some product links on this site are affiliate links. When you click on them and make a purchase, we may earn a small commission at no extra cost to you. This helps fund the site. Affiliate links are clearly identified.
            </p>

            <h2>8. Data Retention</h2>
            <p>
              Analytics data is retained for 14 months (Google Analytics default). Newsletter emails are retained until you unsubscribe. We do not sell personal data to third parties.
            </p>

            <h2>9. Your Rights</h2>
            <p>
              If you are located in the European Economic Area, United Kingdom, or California, you have rights including access to, correction of, and deletion of your personal data. Contact us at{' '}
              <a href="mailto:contact@earbudstimeline.com" className="text-accent">contact@earbudstimeline.com</a> to exercise these rights.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this policy as our services evolve. Material changes will be noted with an updated date at the top of this page.
            </p>

            <h2>11. Contact</h2>
            <p>
              Questions? Email us at{' '}
              <a href="mailto:contact@earbudstimeline.com" className="text-accent">contact@earbudstimeline.com</a>.
            </p>
          </>
        ) : (
          <>
            <p>
              EarbudsTimeline (<strong>earbudstimeline.com</strong>) est un site éditorial indépendant qui catalogue l'histoire des écouteurs sans fil. Cette politique de confidentialité explique quelles données nous collectons, pourquoi, et comment vous pouvez les contrôler.
            </p>

            <h2>1. Données Collectées</h2>
            <p>Nous collectons les catégories de données suivantes :</p>
            <ul>
              <li><strong>Analyses d'utilisation</strong> — pages visitées, durée de session, type de navigateur et d'appareil, via Google Analytics 4 et Microsoft Clarity.</li>
              <li><strong>Adresse e-mail (newsletter)</strong> — uniquement si vous vous abonnez volontairement via notre formulaire de newsletter. Stockée de manière sécurisée dans notre base de données Supabase.</li>
              <li><strong>Données techniques</strong> — adresse IP (anonymisée), en-têtes HTTP, paramètres de langue et de région.</li>
            </ul>
            <p>Nous ne collectons <strong>pas</strong> de nom, numéro de téléphone ou information de paiement. Aucune inscription n'est requise.</p>

            <h2>2. Cookies & Stockage Local</h2>
            <p>Nous utilisons les cookies et le stockage local suivants :</p>
            <ul>
              <li><strong>Préférence de thème</strong> — stockée dans le <code>localStorage</code> (clé : <code>theme</code>) pour mémoriser votre choix clair/sombre. Cette donnée ne quitte jamais votre appareil.</li>
              <li><strong>Google Analytics</strong> — définit les cookies <code>_ga</code> et <code>_ga_*</code> pour distinguer les utilisateurs à des fins d'audience. Les données sont anonymisées.</li>
              <li><strong>Microsoft Clarity</strong> — utilise le stockage de session pour l'analyse de cartes thermiques et l'enregistrement de sessions.</li>
              <li><strong>Google AdSense</strong> — définit des cookies pour afficher des publicités personnalisées ou non personnalisées selon votre contexte de navigation. Voir la politique de confidentialité de Google ci-dessous.</li>
            </ul>

            <h2>3. Google AdSense & Publicité</h2>
            <p>
              EarbudsTimeline affiche des publicités via <strong>Google AdSense</strong> (ID éditeur : <code>ca-pub-3521871496373731</code>). Google peut utiliser des cookies pour diffuser des annonces basées sur vos visites précédentes sur notre site et d'autres sites. Vous pouvez désactiver la publicité personnalisée en visitant les{' '}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-accent inline-flex items-center gap-1">
                Paramètres des annonces Google <ExternalLink className="w-3 h-3" />
              </a>.
            </p>
            <p>
              Nous respectons le cadre TCF 2.2 de l'IAB là où cela est requis. Pour les visiteurs de l'EEE et du Royaume-Uni, une bannière de consentement peut s'afficher avant la pose de cookies publicitaires.
            </p>

            <h2>4. Google Analytics</h2>
            <p>
              Nous utilisons Google Analytics 4 pour comprendre comment les visiteurs utilisent le site. Les adresses IP sont anonymisées. Vous pouvez vous désinscrire via le{' '}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-accent inline-flex items-center gap-1">
                Module complémentaire de désactivation de Google Analytics <ExternalLink className="w-3 h-3" />
              </a>.
            </p>

            <h2>5. Microsoft Clarity</h2>
            <p>
              Nous utilisons Microsoft Clarity pour les enregistrements de sessions et les cartes thermiques, afin d'améliorer l'expérience utilisateur. Clarity peut enregistrer les mouvements de souris, les clics et les patterns de défilement. Voir la{' '}
              <a href="https://privacy.microsoft.com/fr-fr/privacystatement" target="_blank" rel="noopener noreferrer" className="text-accent inline-flex items-center gap-1">
                Déclaration de confidentialité de Microsoft <ExternalLink className="w-3 h-3" />
              </a>.
            </p>

            <h2>6. Newsletter</h2>
            <p>
              Si vous vous abonnez à notre newsletter, votre adresse e-mail est stockée dans notre base de données uniquement pour vous envoyer des mises à jour sur les nouveaux articles et les changements du catalogue. Vous pouvez vous désabonner à tout moment en cliquant sur le lien de désinscription dans chaque e-mail que nous envoyons.
            </p>

            <h2>7. Liens d'Affiliation</h2>
            <p>
              Certains liens produit sur ce site sont des liens affiliés. Lorsque vous cliquez dessus et effectuez un achat, nous pouvons percevoir une petite commission sans coût supplémentaire pour vous. Cela contribue au financement du site. Les liens affiliés sont clairement identifiés.
            </p>

            <h2>8. Durée de Conservation</h2>
            <p>
              Les données analytiques sont conservées 14 mois (paramètre par défaut de Google Analytics). Les e-mails de newsletter sont conservés jusqu'à désinscription. Nous ne vendons pas de données personnelles à des tiers.
            </p>

            <h2>9. Vos Droits</h2>
            <p>
              Si vous résidez dans l'Espace Économique Européen, au Royaume-Uni ou en Californie, vous disposez de droits incluant l'accès, la rectification et la suppression de vos données personnelles. Contactez-nous à{' '}
              <a href="mailto:contact@earbudstimeline.com" className="text-accent">contact@earbudstimeline.com</a> pour exercer ces droits.
            </p>

            <h2>10. Modifications de cette Politique</h2>
            <p>
              Nous pouvons mettre à jour cette politique au fil de l'évolution de nos services. Les modifications importantes seront notées avec une date de mise à jour en haut de cette page.
            </p>

            <h2>11. Contact</h2>
            <p>
              Des questions ? Écrivez-nous à{' '}
              <a href="mailto:contact@earbudstimeline.com" className="text-accent">contact@earbudstimeline.com</a>.
            </p>
          </>
        )}
      </div>

      <div className="mt-12 pt-6 border-t border-line">
        <Link
          href="/"
          className="text-xs text-dim hover:text-accent transition-colors"
        >
          ← {isEn ? 'Back to EarbudsTimeline' : 'Retour à EarbudsTimeline'}
        </Link>
      </div>

      <Footer locale={locale} />
    </div>
  );
}
