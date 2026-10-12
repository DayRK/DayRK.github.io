import { NextRequest, NextResponse } from 'next/server';
import { deleteMedia } from '@/lib/db';
import { verifyAdminToken, sendUnauthorized, sendValidationError, sendRateLimited } from '@/lib/apiMiddleware';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimit';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key)) {
      return sendRateLimited();
    }

    if (!verifyAdminToken(request)) {
      return sendUnauthorized();
    }

    const { id } = await params;
    const mediaId = Number(id);

    if (!Number.isInteger(mediaId) || mediaId <= 0) {
      return sendValidationError('Invalid media id');
    }

    await deleteMedia(mediaId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
