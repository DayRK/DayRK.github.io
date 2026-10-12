import { createHash, timingSafeEqual } from 'crypto';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Compares two secrets without leaking their length or the position of the
 * first wrong character. A plain === returns early on the first mismatch,
 * which lets an attacker guess one character at a time by timing the reply.
 */
function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  // Length still has to match for the compare below, so hash both first: the
  // digests are always 32 bytes, which hides the real length and keeps the
  // comparison time constant.
  const digestA = createHash('sha256').update(bufferA).digest();
  const digestB = createHash('sha256').update(bufferB).digest();

  return timingSafeEqual(digestA, digestB);
}

/**
 * The admin password and JWT secret must come from the environment.
 * There is deliberately no fallback value: a guessable default would let
 * anyone into the dashboard, so a missing value is treated as a hard error.
 */
function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is not set. Add it to .env.local (and to Vercel) before starting the app.`);
  }

  return value;
}

/**
 * The admin session lives in an HTTP-only cookie, so browser scripts cannot
 * read it. That is what keeps a stolen XSS payload from walking off with the
 * session the way a localStorage token would.
 */
export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

export type AdminRole = 'admin' | 'editor';

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export function generateToken(data: Record<string, unknown>): string {
  return jwt.sign(data, requireEnv('JWT_SECRET'), { expiresIn: '24h' });
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    return jwt.verify(token, requireEnv('JWT_SECRET')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function validateAdminPassword(password: string): Promise<boolean> {
  if (!password) return false;

  const adminPassword = requireEnv('ADMIN_PASSWORD');

  if (adminPassword.startsWith('$2')) {
    return comparePassword(password, adminPassword);
  }

  return safeEqual(password, adminPassword);
}

export function getAdminToken(password: string): string | null {
  if (safeEqual(password, requireEnv('ADMIN_PASSWORD'))) {
    return generateToken({ isAdmin: true, role: 'admin' satisfies AdminRole });
  }

  return null;
}

/**
 * Reads the role out of a session token. Authorization checks go through this
 * instead of trusting anything the browser sends.
 */
export function getRoleFromToken(token: string): AdminRole | null {
  const decoded = verifyToken(token);
  const role = decoded?.role;

  if (role === 'admin' || role === 'editor') {
    return role;
  }

  return null;
}
