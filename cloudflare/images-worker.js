const ALLOWED_FORMATS = new Set(['image/avif', 'image/webp']);

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function negotiateFormat(request) {
  const accept = request.headers.get('Accept') || '';
  if (accept.includes('image/avif')) return 'avif';
  if (accept.includes('image/webp')) return 'webp';
  return undefined;
}

export default {
  async fetch(request, env) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405 });
    }

    const requestUrl = new URL(request.url);
    const encodedSource = requestUrl.searchParams.get('src');
    if (!encodedSource) {
      return new Response('Missing src', { status: 400 });
    }

    let source;
    try {
      source = new URL(decodeBase64Url(encodedSource));
    } catch {
      return new Response('Invalid image source', { status: 400 });
    }

    const allowedHost = env.SUPABASE_HOST;
    if (!allowedHost || source.hostname !== allowedHost) {
      return new Response('Source not allowed', { status: 403 });
    }

    if (!source.pathname.startsWith('/storage/v1/object/public/')) {
      return new Response('Source path not allowed', { status: 403 });
    }

    const width = Math.min(Math.max(parseInt(requestUrl.searchParams.get('w') || '640', 10) || 640, 64), 1600);
    const quality = Math.min(Math.max(parseInt(requestUrl.searchParams.get('q') || '82', 10) || 82, 40), 90);
    const format = negotiateFormat(request);

    const imageRequest = new Request(source.toString(), {
      method: 'GET',
      headers: {
        Accept: request.headers.get('Accept') || 'image/avif,image/webp,image/*,*/*;q=0.8',
      },
    });

    const response = await fetch(imageRequest, {
      cf: {
        image: {
          width,
          fit: 'scale-down',
          quality,
          ...(format && ALLOWED_FORMATS.has(`image/${format}`) ? { format } : {}),
        },
      },
    });

    if (!response.ok) return response;

    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Vary', 'Accept');
    headers.set('X-EarbudsTimeline-Image-CDN', 'cloudflare');

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  },
};
