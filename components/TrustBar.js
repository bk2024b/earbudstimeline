import { ShieldCheck, Zap, Search, Heart } from 'lucide-react';

const ITEMS = [
  { icon: ShieldCheck, title: 'Données fiables', desc: 'Fiches vérifiées, structurées par modèle et par génération.' },
  { icon: Zap, title: 'Toujours à jour', desc: 'Nouveaux modèles et corrections ajoutés en continu.' },
  { icon: Search, title: 'Recherche avancée', desc: 'Filtrez par marque, ANC, Bluetooth et prix.' },
  { icon: Heart, title: '100% indépendant', desc: "Aucune marque ne finance ce site. Juste la passion de l'audio." },
];

export default function TrustBar() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      {ITEMS.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
            <Icon size={17} />
          </span>
          <div>
            <p className="m-0 text-[13.5px] font-medium">{title}</p>
            <p className="m-0 text-dim text-xs mt-0.5">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
