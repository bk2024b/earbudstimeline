const ICONS = {
  facebook: (
    <path d="M13.5 9H15V6.5h-1.5C11.6 6.5 10.5 7.6 10.5 9.5V11H9v2.5h1.5V19h2.5v-5.5H15l.5-2.5h-2v-1c0-.6.2-1 1-1z" />
  ),
  twitter: (
    <path d="M17.5 6.5h1.9l-4.2 4.8 4.9 6.4h-3.9l-3-4-3.5 4H7.8l4.5-5.1-4.7-6.1h4l2.8 3.7 3.1-3.7zM16.8 16.5h1l-6.4-8.4h-1z" />
  ),
  reddit: (
    <path d="M19 12c0-1.1-.9-2-2-2-.5 0-1 .2-1.3.5-1-.6-2.3-1-3.7-1.1l.7-3 2.4.5c0 .7.6 1.2 1.2 1.2.7 0 1.2-.6 1.2-1.2S16.9 5.6 16.2 5.6c-.5 0-.9.3-1.1.6l-2.8-.6c-.2 0-.3.1-.4.2l-.8 3.5c-1.5.1-2.8.5-3.8 1.1-.3-.3-.8-.5-1.3-.5-1.1 0-2 .9-2 2 0 .8.5 1.5 1.1 1.8 0 .2-.1.4-.1.6 0 2 2.4 3.7 5.4 3.7s5.4-1.6 5.4-3.7c0-.2 0-.4-.1-.6.7-.3 1.1-1 1.1-1.8zM8.5 13c0-.6.5-1 1-1s1 .4 1 1-.5 1-1 1-1-.4-1-1zm5.5 2.5c-.7.7-1.9.8-2 .8s-1.3-.1-2-.8c-.1-.1-.1-.3 0-.4.1-.1.3-.1.4 0 .5.5 1.3.6 1.6.6s1.1-.1 1.6-.6c.1-.1.3-.1.4 0 .1.1.1.3 0 .4zm-.1-1.5c-.5 0-1-.4-1-1s.5-1 1-1 1 .4 1 1-.5 1-1 1z" />
  ),
  linkedin: (
    <path d="M8.5 9.5h-2v8h2v-8zm-1-3.2c-.7 0-1.2.5-1.2 1.2s.5 1.2 1.2 1.2 1.2-.5 1.2-1.2-.5-1.2-1.2-1.2zM17.5 12.9c0-2-1.1-3-2.6-3-1.2 0-1.7.7-2 1.1v-1h-2v8h2v-4.4c0-.4 0-.9.3-1.2.2-.3.6-.6 1.1-.6.8 0 1.2.5 1.2 1.6v4.6h2v-4.9z" />
  ),
};

const NETWORKS = [
  {
    id: 'facebook',
    label: 'Facebook',
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'twitter',
    label: 'X',
    href: (url, title) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: 'reddit',
    label: 'Reddit',
    href: (url, title) => `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
];

export default function ShareButtons({ url, title, label }) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-dim mr-1">{label}</span>}
      {NETWORKS.map((n) => (
        <a
          key={n.id}
          href={n.href(url, title)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={n.label}
          title={n.label}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-line text-dim hover:text-accent hover:border-accent transition-colors"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            {ICONS[n.id]}
          </svg>
        </a>
      ))}
    </div>
  );
}
