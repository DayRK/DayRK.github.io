import { NextRequest, NextResponse } from 'next/server';
import { deleteContactMessage, setContactRead } from '@/lib/db';
import { verifyAdminToken, sendUnauthorized, sendValidationError, sendRateLimited } from '@/lib/apiMiddleware';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimit';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key)) {
      return sendRateLimited();
    }

    if (!verifyAdminToken(request)) {
      return sendUnauthorized();
    }

    const { id } = await params;
    const messageId = Number(id);

    if (!Number.isInteger(messageId) || messageId <= 0) {
      return sendValidationError('Invalid message id');
    }

    const body = await request.json();
    const isRead = body?.isRead === true;

    await setContactRead(messageId, isRead);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update the message' }, { status: 500 });
  }
}

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
    const messageId = Number(id);

    if (!Number.isInteger(messageId) || messageId <= 0) {
      return sendValidationError('Invalid message id');
    }

    await deleteContactMessage(messageId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete the message' }, { status: 500 });
  }
}
