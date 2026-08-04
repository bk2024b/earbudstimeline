export default function StatTile({ icon: Icon, value, label }) {
  return (
    <div className="bg-panel border border-line rounded-xl p-4 flex items-center gap-3">
      <span className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
        <Icon size={17} />
      </span>
      <div>
        <b className="block font-display text-base leading-tight">{value}</b>
        <span className="text-dim text-[11px] uppercase tracking-wide">{label}</span>
      </div>
    </div>
  );
}
