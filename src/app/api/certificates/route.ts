import { NextRequest, NextResponse } from 'next/server';
import { createCertificate, fetchCertificates } from '@/lib/db';
import { verifyAdminToken, sendUnauthorized, sendValidationError, sendRateLimited } from '@/lib/apiMiddleware';
import { CertificateSchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  try {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key)) {
      return sendRateLimited();
    }

    const certificates = await fetchCertificates();
    return NextResponse.json(certificates);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key)) {
      return sendRateLimited();
    }

    if (!verifyAdminToken(request)) {
      return sendUnauthorized();
    }

    const body = await request.json();
    const validationResult = CertificateSchema.safeParse(body);
    if (!validationResult.success) {
      return sendValidationError(validationResult.error.issues[0]?.message || 'Invalid input');
    }

    await createCertificate(validationResult.data);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 });
  }
}
