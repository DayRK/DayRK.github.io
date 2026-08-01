import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdminToken, sendUnauthorized, sendValidationError, sendRateLimited } from '@/lib/apiMiddleware';
import { ProjectSchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimit';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id, 10);

    if (isNaN(projectId)) {
      return sendValidationError('Invalid project ID');
    }

    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE projects SET title = ?, summary = ?, stack = ?, link = ? WHERE id = ?',
      [title, summary, JSON.stringify(stack), link, projectId]
    );
    connection.release();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id, 10);
    if (isNaN(projectId)) {
      return sendValidationError('Invalid project ID');
    }

    const connection = await pool.getConnection();
    await connection.query('DELETE FROM projects WHERE id = ?', [projectId]);
    connection.release();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
