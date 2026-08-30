export default function StatTile({ icon: Icon, value, label }) {
  return (
    <div className="hardware-card bg-panel p-4 flex items-center gap-3.5">
      <span className="w-10 h-10 rounded-base bg-accent/10 border border-accent/25 text-accent flex items-center justify-center shrink-0">
        <Icon size={18} />
      </span>
      <div>
        <b className="block font-display font-bold text-lg text-fg leading-tight">{value}</b>
        <span className="text-dim text-[11px] font-mono uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}
