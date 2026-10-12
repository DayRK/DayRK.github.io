import { NextRequest, NextResponse } from 'next/server';
import { searchContent, fetchModuleVisibility } from '@/lib/db';
import { sendValidationError, sendRateLimited } from '@/lib/apiMiddleware';
import { SearchQuerySchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimit';
import { isModuleVisible } from '@/lib/modules';

// Public read-only endpoint. Throttled so one visitor cannot hammer the database.
export async function GET(request: NextRequest) {
  try {
    const key = getRateLimitKey(request, 'search');
    if (!checkRateLimit(key)) {
      return sendRateLimited();
    }

    const query = request.nextUrl.searchParams.get('q') ?? '';
    const validationResult = SearchQuerySchema.safeParse({ q: query });

    if (!validationResult.success) {
      return sendValidationError(validationResult.error.issues[0]?.message || 'Invalid search query');
    }

    const results = await searchContent(validationResult.data.q);

    // Never hand back content that belongs to a module hidden from the public.
    const visibility = await fetchModuleVisibility();

    if (!isModuleVisible(visibility, 'projects')) results.projects = [];
    if (!isModuleVisible(visibility, 'experience')) results.experience = [];
    if (!isModuleVisible(visibility, 'certificates')) results.certificates = [];
    if (!isModuleVisible(visibility, 'blog')) results.posts = [];

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
