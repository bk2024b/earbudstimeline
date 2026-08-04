export default function EarbudsIcon({ color = '#9A9AA3', className = '' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="10" width="36" height="28" rx="10" stroke={color} strokeWidth="2" />
      <circle cx="18" cy="24" r="6" stroke={color} strokeWidth="2" />
      <circle cx="30" cy="24" r="6" stroke={color} strokeWidth="2" />
      <circle cx="24" cy="16" r="1.6" fill={color} />
    </svg>
  );
}
