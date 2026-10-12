import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, sendUnauthorized } from '@/lib/apiMiddleware';
import { fetchAuditLog, fetchSystemStats } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Admin-only system view: content counts plus the recent audit trail.
 */
export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) return sendUnauthorized();

  try {
    const [stats, log] = await Promise.all([fetchSystemStats(), fetchAuditLog(25)]);

    return NextResponse.json({ stats, log });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load system information' },
      { status: 500 }
    );
  }
}
