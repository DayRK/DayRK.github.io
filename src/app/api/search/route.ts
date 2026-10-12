import { NextRequest, NextResponse } from 'next/server';
import { searchContent } from '@/lib/db';
import { sendValidationError, sendRateLimited } from '@/lib/apiMiddleware';
import { SearchQuerySchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimit';

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
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
