import { NextRequest, NextResponse } from 'next/server';
import { fetchMedia, uploadMedia } from '@/lib/db';
import { verifyAdminToken, sendUnauthorized, sendValidationError, sendRateLimited } from '@/lib/apiMiddleware';
import { MediaMetaSchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimit';

// 5 MB, and only the image types the site actually renders.
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export async function GET(request: NextRequest) {
  try {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key)) {
      return sendRateLimited();
    }

    if (!verifyAdminToken(request)) {
      return sendUnauthorized();
    }

    const media = await fetchMedia();
    return NextResponse.json(media);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
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

    const formData = await request.formData();
    const file = formData.get('file');
    const alt = String(formData.get('alt') ?? '');

    if (!(file instanceof File)) {
      return sendValidationError('No file was uploaded');
    }

    // Trust the declared type only as a first check; the real gate is the
    // allow-list below plus the size cap.
    if (!ALLOWED_TYPES.includes(file.type)) {
      return sendValidationError('Only JPEG, PNG, WebP, GIF or AVIF images are allowed');
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return sendValidationError('Image must be 5 MB or smaller');
    }

    const meta = MediaMetaSchema.safeParse({ alt });
    if (!meta.success) {
      return sendValidationError(meta.error.issues[0]?.message || 'Invalid input');
    }

    const buffer = await file.arrayBuffer();

    const created = await uploadMedia({
      buffer,
      filename: file.name || 'upload',
      mimeType: file.type,
      alt: meta.data.alt,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload the image' }, { status: 500 });
  }
}
