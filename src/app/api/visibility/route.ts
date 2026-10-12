import { NextRequest, NextResponse } from 'next/server';
import { fetchModuleVisibility, updateModuleVisibility } from '@/lib/db';
import { verifyAdminToken, sendUnauthorized, sendValidationError, sendRateLimited } from '@/lib/apiMiddleware';
import { ModuleVisibilitySchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimit';

// Never cache: a visibility change must take effect on the next page load.
export const dynamic = 'force-dynamic';

/**
 * GET is public on purpose: the site needs to know what to hide before it can
 * render. It exposes only the module names and their on/off state, never any
 * content.
 */
export async function GET(request: NextRequest) {
  try {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key)) {
      return sendRateLimited();
    }

    const visibility = await fetchModuleVisibility();
    return NextResponse.json(visibility);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch module visibility' }, { status: 500 });
  }
}

/**
 * Changing what the public can see is an admin action, so it is gated and
 * written to the audit log like every other write.
 */
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
    const validationResult = ModuleVisibilitySchema.safeParse(body);

    if (!validationResult.success) {
      return sendValidationError(validationResult.error.issues[0]?.message || 'Invalid module setting');
    }

    await updateModuleVisibility(validationResult.data.module, validationResult.data.visible);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update module visibility' }, { status: 500 });
  }
}
