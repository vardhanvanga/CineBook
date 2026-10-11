import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PROTECTED_ROUTES = [
  '/profile',
  '/my-bookings',
  '/checkout',
  '/payment',
  '/booking/success',
  '/ticket',
];

const ADMIN_ROUTES = [
  '/admin',
];

const AUTH_ROUTES = [
  '/login',
  '/register',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('cinebook_session')?.value;

  const session = token ? await verifyToken(token) : null;

  // Redirect authenticated users away from auth pages
  if (AUTH_ROUTES.some(route => pathname.startsWith(route)) && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect customer routes
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route)) && !session) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Protect admin routes
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
