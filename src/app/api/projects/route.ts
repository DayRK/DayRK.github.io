import { NextRequest, NextResponse } from 'next/server';
import { createProject, fetchProjects } from '@/lib/db';
import { verifyAdminToken, sendUnauthorized, sendValidationError, sendRateLimited } from '@/lib/apiMiddleware';
import { ProjectSchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  try {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key)) {
      return sendRateLimited();
    }

    const projects = await fetchProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
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
    const validationResult = ProjectSchema.safeParse(body);
    if (!validationResult.success) {
      return sendValidationError(validationResult.error.issues[0]?.message || 'Invalid input');
    }

    await createProject(validationResult.data);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
