import { DONATE_URL } from '@/lib/donate';

export default function DonateButton({ label, className = '' }) {
  return (
    <a
      href={DONATE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-ink text-sm font-medium hover:opacity-90 transition-opacity ${className}`}
    >
      <span aria-hidden="true">☕</span>
      {label}
    </a>
  );
}
