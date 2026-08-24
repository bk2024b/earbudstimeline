function toBase64Url(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export default function cloudflareImageLoader({ src, width, quality }) {
  const cdn = process.env.NEXT_PUBLIC_IMAGE_CDN_URL;

  // Keep local/static images untouched. The CDN is only for Supabase media.
  if (!cdn || !src.includes('.supabase.co/storage/v1/object/public/')) {
    return src;
  }

  const encoded = toBase64Url(src);
  const params = new URLSearchParams({
    src: encoded,
    w: String(width || 640),
    q: String(quality || 82),
  });

  return `${cdn.replace(/\/$/, '')}/image?${params.toString()}`;
}
