import { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitStore {
  [key: string]: RateLimitEntry;
}

const rateLimitStore: RateLimitStore = {};
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // requests per window

// Login attempts get a much smaller allowance, and only failures count.
const LOGIN_WINDOW = 5 * 60 * 1000; // 5 minutes
export const LOGIN_MAX_ATTEMPTS = 8;

/**
 * Builds the key a limit is tracked under.
 * The visitor's IP is the first entry of x-forwarded-for, which is what Vercel
 * sets. The scope keeps one route's counter from resetting another's.
 */
export function getRateLimitKey(request: NextRequest, scope?: string): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip =
    forwarded?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  return `${scope ?? 'route'}:${ip}:${request.nextUrl.pathname}`;
}

/**
 * Counts a request and reports whether it is still inside the allowance.
 */
export function checkRateLimit(
  key: string,
  limit: number = RATE_LIMIT_MAX,
  windowMs: number = RATE_LIMIT_WINDOW
): boolean {
  const now = Date.now();
  const record = rateLimitStore[key];

  if (!record || now > record.resetTime) {
    rateLimitStore[key] = { count: 1, resetTime: now + windowMs };
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Checks the limit without counting the request.
 * Used by the login route so that successful logins do not eat the allowance.
 */
export function isRateLimited(
  key: string,
  limit: number = LOGIN_MAX_ATTEMPTS,
  windowMs: number = LOGIN_WINDOW
): boolean {
  const now = Date.now();
  const record = rateLimitStore[key];

  if (!record || now > record.resetTime) {
    return false;
  }

  return record.count >= limit;
}

/**
 * Counts one failed attempt against the key.
 */
export function recordFailedAttempt(key: string, windowMs: number = LOGIN_WINDOW): void {
  const now = Date.now();
  const record = rateLimitStore[key];

  if (!record || now > record.resetTime) {
    rateLimitStore[key] = { count: 1, resetTime: now + windowMs };
    return;
  }

  record.count++;
}

/**
 * Clears a key, so a correct login wipes the failed attempts before it.
 */
export function resetRateLimit(key: string): void {
  delete rateLimitStore[key];
}

// Cleanup old records every hour.
setInterval(() => {
  const now = Date.now();
  for (const key in rateLimitStore) {
    if (now > rateLimitStore[key].resetTime) {
      delete rateLimitStore[key];
    }
  }
}, 60 * 60 * 1000);
