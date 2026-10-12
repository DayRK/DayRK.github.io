import { NextRequest, NextResponse } from 'next/server';
import { createPost, fetchAllPosts, fetchPosts } from '@/lib/db';
import { verifyAdminToken, sendUnauthorized, sendValidationError, sendRateLimited } from '@/lib/apiMiddleware';
import { PostSchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  try {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key)) {
      return sendRateLimited();
    }

    // With a valid admin token the draft posts are included; without one only
    // published posts are returned.
    const posts = verifyAdminToken(request) ? await fetchAllPosts() : await fetchPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
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
    const validationResult = PostSchema.safeParse(body);
    if (!validationResult.success) {
      return sendValidationError(validationResult.error.issues[0]?.message || 'Invalid input');
    }

    await createPost(validationResult.data);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
