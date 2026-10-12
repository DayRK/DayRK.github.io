import { NextRequest, NextResponse } from 'next/server';
import { createContactMessage, fetchContactMessages } from '@/lib/db';
import { verifyAdminToken, sendUnauthorized, sendValidationError, sendRateLimited } from '@/lib/apiMiddleware';
import { ContactSchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimit';

// Public submissions are throttled harder than reads: 5 messages per 10 min.
const CONTACT_WINDOW = 10 * 60 * 1000;
const CONTACT_MAX = 5;

export async function GET(request: NextRequest) {
  try {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key)) {
      return sendRateLimited();
    }

    if (!verifyAdminToken(request)) {
      return sendUnauthorized();
    }

    const messages = await fetchContactMessages();
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const key = getRateLimitKey(request, 'contact');
    if (!checkRateLimit(key, CONTACT_MAX, CONTACT_WINDOW)) {
      return sendRateLimited();
    }

    const body = await request.json();
    const validationResult = ContactSchema.safeParse(body);

    if (!validationResult.success) {
      return sendValidationError(validationResult.error.issues[0]?.message || 'Invalid input');
    }

    // Honeypot: a real form never fills this in. Reply success so bots do not
    // learn they were caught, but store nothing.
    if (validationResult.data.website) {
      return NextResponse.json({ success: true }, { status: 201 });
    }

    await createContactMessage({
      name: validationResult.data.name,
      email: validationResult.data.email,
      subject: validationResult.data.subject,
      message: validationResult.data.message,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to send the message' }, { status: 500 });
  }
}
