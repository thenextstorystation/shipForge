import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validation/contact';
import { insertContactSubmission } from '@/lib/db/contact';
import type { ContactApiResponse } from '@/lib/content/types';

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ContactApiResponse>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'VALIDATION_ERROR', fields: {} },
      { status: 400 },
    );
  }

  // Honeypot check — silent 200, no DB write.
  if (
    body !== null &&
    typeof body === 'object' &&
    '_hp' in body &&
    (body as Record<string, unknown>)['_hp'] !== ''
  ) {
    return NextResponse.json({ ok: true, id: 'bot' }, { status: 200 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Partial<Record<'name' | 'email' | 'message', string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as 'name' | 'email' | 'message';
      if (key && !fields[key]) {
        fields[key] = issue.message;
      }
    }
    return NextResponse.json(
      { ok: false, error: 'VALIDATION_ERROR', fields },
      { status: 400 },
    );
  }

  try {
    const { name, email, message } = parsed.data;
    const id = await insertContactSubmission({ name, email, message });
    return NextResponse.json({ ok: true, id }, { status: 200 });
  } catch (err) {
    console.error('[/api/contact] DB insert failed:', err);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

export async function GET(): Promise<NextResponse<ContactApiResponse>> {
  return NextResponse.json(
    { ok: false, error: 'METHOD_NOT_ALLOWED' },
    { status: 405 },
  );
}

export async function PUT(): Promise<NextResponse<ContactApiResponse>> {
  return NextResponse.json(
    { ok: false, error: 'METHOD_NOT_ALLOWED' },
    { status: 405 },
  );
}

export async function DELETE(): Promise<NextResponse<ContactApiResponse>> {
  return NextResponse.json(
    { ok: false, error: 'METHOD_NOT_ALLOWED' },
    { status: 405 },
  );
}
