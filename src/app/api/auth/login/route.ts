import { NextRequest, NextResponse } from 'next/server';
import { validateAdminPassword, getAdminToken } from '@/lib/auth';
import { AdminLoginSchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = AdminLoginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid password format' },
        { status: 400 }
      );
    }

    const { password } = validationResult.data;

    // Verify password
    const isValid = await validateAdminPassword(password);
    if (!isValid) {
      // Log failed attempt (in production, log to database or monitoring service)
      console.warn(`Failed admin login attempt from ${getRateLimitKey(request)}`);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token
    const token = getAdminToken(password);
    if (!token) {
      return NextResponse.json(
        { error: 'Token generation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { token, expiresIn: '24h' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
