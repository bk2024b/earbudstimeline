export function Stat({ value, label }) {
  return (
    <div>
      <b className="block font-display font-bold text-[28px]">{value}</b>
      <span className="text-dim text-[12.5px] uppercase tracking-[0.08em]">{label}</span>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="text-dim text-xs text-center pt-5 border-t border-line mt-8">
      © 2026 EarbudsTimeline — dans la continuité de PhoneTimeline
    </footer>
  );
}

export function Badge({ children, gold }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-md border text-xs font-mono ${
        gold ? 'bg-amber/15 border-amber text-amber' : 'bg-panel2 border-line text-dim'
      }`}
    >
      {children}
    </span>
  );
}
