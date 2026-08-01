import { NextRequest, NextResponse } from 'next/server';
import { fetchAvailability, updateAvailability } from '@/lib/db';
import { verifyAdminToken, sendUnauthorized, sendValidationError, sendRateLimited } from '@/lib/apiMiddleware';
import { AvailabilitySchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  try {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key)) {
      return sendRateLimited();
    }

    const status = await fetchAvailability();
    return NextResponse.json({ status });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key)) {
      return sendRateLimited();
    }

    if (!verifyAdminToken(request)) {
      return sendUnauthorized();
    }

    const body = await request.json();
    const validationResult = AvailabilitySchema.safeParse(body);
    if (!validationResult.success) {
      return sendValidationError(validationResult.error.issues[0]?.message || 'Invalid status');
    }

    await updateAvailability(validationResult.data.status);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 });
  }
}
