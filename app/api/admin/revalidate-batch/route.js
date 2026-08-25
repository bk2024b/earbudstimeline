import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

// Called once at the end of scripts/bulk-image-pipeline.mjs, after a batch of
// earbuds has had its image_url updated directly via the Supabase service
// role key (bypassing the normal admin Server Actions). Those actions
// already call revalidatePath/revalidateTag on save — this route reproduces
// that same effect for a whole batch in one request, so pages don't have to
// wait for the hourly ISR revalidation (revalidate = 3600) to show the new
// photos.
//
// Protected by the same ADMIN_SESSION_SECRET used for the admin cookie —
// no new secret to manage. Never exposed to the browser: only called
// server-side by the batch script itself.

function revalidateOne(brandId, earbudId) {
  revalidateTag('earbuds-all');
  revalidateTag('earbuds-search-catalog');
  revalidateTag('brands-all');
  if (brandId) {
    revalidateTag('earbuds-brand', brandId);
    revalidateTag('brand', brandId);
  }
  if (earbudId) revalidateTag('earbud', earbudId);

  revalidatePath('/admin');
  revalidatePath('/admin/earbuds');
  revalidatePath('/');
  revalidatePath('/fr');
  revalidatePath('/en');

  if (brandId) {
    revalidatePath(`/fr/marques/${brandId}`);
    revalidatePath(`/en/marques/${brandId}`);
    revalidatePath(`/marques/${brandId}`);
  }
  if (earbudId) {
    revalidatePath(`/fr/ecouteurs/${earbudId}`);
    revalidatePath(`/en/ecouteurs/${earbudId}`);
    revalidatePath(`/ecouteurs/${earbudId}`);
  }
}

export async function POST(request) {
  const secret = request.headers.get('x-admin-secret');
  if (!process.env.ADMIN_SESSION_SECRET || secret !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const items = Array.isArray(body?.items) ? body.items : [];
  if (items.length === 0) {
    return NextResponse.json({ error: 'no_items' }, { status: 400 });
  }

  for (const item of items) {
    revalidateOne(item.brandId, item.id);
  }

  return NextResponse.json({ ok: true, revalidated: items.length });
}
