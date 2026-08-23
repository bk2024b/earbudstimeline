import { SITE_URL } from '@/lib/seo';

const AI_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'CCBot',
  'cohere-ai',
];

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/*?*'] },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: '/', disallow: ['/admin', '/*?*'] })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
