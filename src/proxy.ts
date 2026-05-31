/**
 * proxy.ts — Route protection via Next.js 16 Proxy (renamed from middleware).
 *
 * OPTIMISTIC CHECK ONLY: this reads cookie presence — it does NOT verify the
 * token value, check claims, or query a database. Real authorization must
 * happen inside pages, Server Components, and Server Actions (see the Next.js
 * Proxy docs: "Proxy is meant for optimistic checks only").
 *
 * Secure-by-default strategy: the matcher covers ALL app routes except static
 * assets and API routes. Any new dashboard route is protected automatically —
 * no manual addition required.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/session-constants';

// Routes that do not require a session.
const PUBLIC_PATHS = ['/login'] as const;

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Cookie presence check — synchronous, no DB, no token verification.
  const sessionPresent = request.cookies.has(SESSION_COOKIE);

  console.log(
    `[proxy] ${request.method} ${pathname} — session:`,
    sessionPresent
  );

  // Root has no public landing in this backoffice — route by session.
  if (pathname === '/') {
    const dest = sessionPresent ? '/dashboard' : '/login';
    console.log('[proxy] root →', dest);
    return NextResponse.redirect(new URL(dest, request.url));
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p);

  // Unauthenticated user hitting a protected route → send to login.
  if (!isPublic && !sessionPresent) {
    console.log('[proxy] protected + no session →', pathname, '→ /login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Authenticated user hitting login → bounce to dashboard (avoid stale login page).
  if (pathname === '/login' && sessionPresent) {
    console.log('[proxy] /login + session → /dashboard (BOUNCE)');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  console.log('[proxy] allow →', pathname);
  return NextResponse.next();
}

/**
 * Matcher: runs on every route EXCEPT:
 *   - /api/* (API routes / Server Actions endpoint)
 *   - /_next/static/* (static assets)
 *   - /_next/image/* (image optimisation)
 *   - /favicon.ico
 *
 * New routes under /dashboard/** are protected automatically.
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
