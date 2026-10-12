import { NextRequest, NextResponse } from 'next/server';

/**
 * Cross-site request forgery (CSRF) guard.
 *
 * The admin session lives in a cookie, and a browser attaches cookies to
 * requests automatically - even ones started by another site. So a page on
 * evil.com could POST to our API and the browser would happily send the admin
 * cookie along. To stop that, every state-changing API request that carries
 * the session cookie must come from our own origin.
 *
 * A request that proves itself with an Authorization header is exempt: a
 * cross-site form cannot set that header, so it cannot be forged.
 *
 * The cookie name is written out here on purpose. This file runs in the edge
 * runtime, which cannot import the auth module (it pulls in Node-only crypto).
 *
 * Next.js 16 calls this file "proxy" (it used to be "middleware").
 */
const SESSION_COOKIE = 'admin_session';
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function isSameOrigin(request: NextRequest): boolean {
  const host = request.headers.get('host');
  const source = request.headers.get('origin') || request.headers.get('referer');

  if (!host || !source) return false;

  try {
    return new URL(source).host === host;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  if (MUTATING_METHODS.has(request.method)) {
    const hasSessionCookie = request.cookies.has(SESSION_COOKIE);
    const usesBearerToken = request.headers.get('authorization')?.startsWith('Bearer ');

    if (hasSessionCookie && !usesBearerToken && !isSameOrigin(request)) {
      return NextResponse.json(
        { error: 'Cross-site request blocked' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
