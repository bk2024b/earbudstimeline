import { NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export default function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();

    const session = req.cookies.get('admin_session')?.value;
    if (!process.env.ADMIN_SESSION_SECRET || session !== process.env.ADMIN_SESSION_SECRET) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  // Tout sauf : fichiers statiques (contiennent un point), /admin (géré séparément
  // ci-dessus, jamais préfixé par une langue), _next, api.
  matcher: ['/admin/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
