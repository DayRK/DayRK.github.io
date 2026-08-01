import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdminToken, sendUnauthorized, sendValidationError, sendRateLimited } from '@/lib/apiMiddleware';
import { ProjectSchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting (public endpoint, but limited)
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key)) {
      return sendRateLimited();
    }

    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id, title, summary, stack, link FROM projects ORDER BY created_at DESC'
    );
    connection.release();

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const validationResult = ProjectSchema.safeParse(body);
    if (!validationResult.success) {
      return sendValidationError(
        validationResult.error.issues[0]?.message || 'Invalid input'
      );
    }

    const { title, summary, stack, link } = validationResult.data;

    const connection = await pool.getConnection();
    await connection.query(
      'INSERT INTO projects (title, summary, stack, link) VALUES (?, ?, ?, ?)',
      [title, summary, JSON.stringify(stack), link]
    );
    connection.release();

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
