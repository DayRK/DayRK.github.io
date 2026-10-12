import { NextRequest, NextResponse } from 'next/server';
import { validateAdminPassword, getAdminToken, sessionCookieOptions, SESSION_COOKIE } from '@/lib/auth';
import { AdminLoginSchema } from '@/lib/validation';
import { getRateLimitKey, isRateLimited, recordFailedAttempt, resetRateLimit, LOGIN_MAX_ATTEMPTS } from '@/lib/rateLimit';
import { writeAuditLog } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Only failed attempts count, so a correct password never gets throttled.
    const key = getRateLimitKey(request, 'login');

    if (isRateLimited(key, LOGIN_MAX_ATTEMPTS)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    const validationResult = AdminLoginSchema.safeParse(body);
    if (!validationResult.success) {
      recordFailedAttempt(key);
      return NextResponse.json({ error: 'Invalid password format' }, { status: 400 });
    }

    const { password } = validationResult.data;

    const isValid = await validateAdminPassword(password);
    if (!isValid) {
      recordFailedAttempt(key);
      console.warn('Failed admin login attempt');
      await writeAuditLog({ action: 'login_failed', entity: 'auth', actor: 'anonymous' });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = getAdminToken(password);
    if (!token) {
      return NextResponse.json({ error: 'Token generation failed' }, { status: 500 });
    }

    resetRateLimit(key);

    await writeAuditLog({ action: 'login', entity: 'auth', actor: 'admin' });

    // The session goes into an HTTP-only cookie, never into the response body,
    // so scripts in the browser cannot read it.
    const response = NextResponse.json({ ok: true }, { status: 200 });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
