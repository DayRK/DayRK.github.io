import { NextRequest, NextResponse } from 'next/server';
import { deleteProject, updateProject } from '@/lib/db';
import { verifyAdminToken, sendUnauthorized, sendValidationError, sendRateLimited } from '@/lib/apiMiddleware';
import { ProjectSchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimit';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key)) {
      return sendRateLimited();
    }

    if (!verifyAdminToken(request)) {
      return sendUnauthorized();
    }

    const body = await request.json();
    const validationResult = ProjectSchema.safeParse(body);
    if (!validationResult.success) {
      return sendValidationError(validationResult.error.issues[0]?.message || 'Invalid input');
    }

    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id, 10);

    if (isNaN(projectId)) {
      return sendValidationError('Invalid project ID');
    }

    await updateProject(projectId, validationResult.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key)) {
      return sendRateLimited();
    }

    if (!verifyAdminToken(request)) {
      return sendUnauthorized();
    }

    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id, 10);
    if (isNaN(projectId)) {
      return sendValidationError('Invalid project ID');
    }

    await deleteProject(projectId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
