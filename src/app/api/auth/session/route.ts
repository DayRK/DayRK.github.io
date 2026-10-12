import { NextRequest, NextResponse } from 'next/server';
import { getAdminRole } from '@/lib/apiMiddleware';

/**
 * Tells the admin page whether the cookie session is still valid, so it can
 * decide to show the login form or the dashboard without reading a token.
 */
export async function GET(request: NextRequest) {
  const role = getAdminRole(request);

  if (!role) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  return NextResponse.json({ authenticated: true, role }, { status: 200 });
}
