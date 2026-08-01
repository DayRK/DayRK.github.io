import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdminToken, sendUnauthorized, sendValidationError, sendRateLimited } from '@/lib/apiMiddleware';
import { AvailabilitySchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key)) {
      return sendRateLimited();
    }

    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT status FROM availability WHERE id = 1'
    );
    connection.release();

    const normalizedRows = Array.isArray(rows) ? rows : [];
    const status = normalizedRows.length > 0 && typeof normalizedRows[0] === 'object' && normalizedRows[0] !== null
      ? (normalizedRows[0] as { status?: string }).status || 'Open to Commissions'
      : 'Open to Commissions';
    return NextResponse.json({ status });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key)) {
      return sendRateLimited();
    }

    // Authentication check
    if (!verifyAdminToken(request)) {
      return sendUnauthorized();
    }

    const body = await request.json();

    // Input validation
    const validationResult = AvailabilitySchema.safeParse(body);
    if (!validationResult.success) {
      return sendValidationError(
        validationResult.error.issues[0]?.message || 'Invalid status'
      );
    }

    const { status } = validationResult.data;

    const connection = await pool.getConnection();
    await connection.query(
      'INSERT INTO availability (id, status) VALUES (1, ?) ON DUPLICATE KEY UPDATE status = ?',
      [status, status]
    );
    connection.release();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    );
  }
}
