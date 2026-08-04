export default function FormField({ label, name, hint, ...props }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-dim text-xs">{label}</span>
      <input
        name={name}
        className="bg-panel2 border border-line rounded-lg px-3 py-2.5 outline-none focus:border-accent"
        {...props}
      />
      {hint && <span className="text-dim text-[11px]">{hint}</span>}
    </label>
  );
}
