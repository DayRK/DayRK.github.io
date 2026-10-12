import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, getRoleFromToken, verifyToken, type AdminRole } from './auth';

/**
 * The session can arrive two ways:
 *  - the HTTP-only cookie, which is how the admin dashboard works now
 *  - a bearer header, kept so scripts and tests can still call the API
 * The cookie is checked first.
 */
export function getSessionToken(request: NextRequest): string | null {
  const cookieToken = request.cookies.get(SESSION_COOKIE)?.value;
  if (cookieToken) return cookieToken;

  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  return authHeader.replace('Bearer ', '');
}

export function getAdminRole(request: NextRequest): AdminRole | null {
  const token = getSessionToken(request);
  if (!token) return null;

  return getRoleFromToken(token);
}

export function verifyAdminToken(request: NextRequest): boolean {
  const token = getSessionToken(request);
  if (!token) return false;

  const decoded = verifyToken(token);

  return decoded !== null && decoded.isAdmin === true && decoded.role === 'admin';
}

/**
 * Role-based access control. Writes require the admin role; an editor role
 * would be refused here rather than in the browser.
 */
export function requireRole(request: NextRequest, role: AdminRole): boolean {
  return getAdminRole(request) === role;
}

export function getAdminTokenFromRequest(request: NextRequest): string | null {
  return getSessionToken(request);
}

export function sendUnauthorized(): NextResponse {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}

export function sendForbidden(): NextResponse {
  return NextResponse.json(
    { error: 'Forbidden' },
    { status: 403 }
  );
}

export function sendRateLimited(): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429 }
  );
}

export function sendValidationError(message: string): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  );
}
