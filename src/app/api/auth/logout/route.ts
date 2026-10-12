import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth';
import { writeAuditLog } from '@/lib/db';

export async function POST() {
  await writeAuditLog({ action: 'logout', entity: 'auth', actor: 'admin' });

  const response = NextResponse.json({ ok: true }, { status: 200 });
  // Clearing the cookie is what actually ends the session.
  response.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });

  return response;
}
