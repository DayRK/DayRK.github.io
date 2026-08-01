import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

export function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;

  const token = authHeader.replace('Bearer ', '');
  const decoded = verifyToken(token);

  return decoded !== null && decoded.isAdmin === true;
}

export function getAdminTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  return authHeader.replace('Bearer ', '');
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
