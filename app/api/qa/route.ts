import { type NextRequest, NextResponse } from 'next/server';
import { buildPublishedSnapshot, matchQuery, QA_MATCH_STATUS } from '@/lib/qa';
import { CSRF_ERROR_RESPONSE, verifyCsrf } from '@/lib/security/security-config';
import { qaQuerySchema } from '@/lib/validations/qa';

const INVALID_REQUEST = {
  message: 'Invalid request',
  status: 400,
} as const;

const METHOD_NOT_ALLOWED = {
  message: 'Method not allowed',
  status: 405,
} as const;

function invalidRequest() {
  return NextResponse.json(
    { message: INVALID_REQUEST.message },
    { status: INVALID_REQUEST.status }
  );
}

export function GET(_request: NextRequest) {
  return NextResponse.json(
    { message: METHOD_NOT_ALLOWED.message },
    { status: METHOD_NOT_ALLOWED.status, headers: { Allow: 'POST' } }
  );
}

export async function POST(request: NextRequest) {
  if (!verifyCsrf(request)) {
    return NextResponse.json(
      { message: CSRF_ERROR_RESPONSE.message },
      { status: CSRF_ERROR_RESPONSE.status }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidRequest();
  }

  const parsed = qaQuerySchema.safeParse(body);
  if (!parsed.success) {
    return invalidRequest();
  }

  const { query, locale } = parsed.data;
  const snapshot = buildPublishedSnapshot();
  const match = matchQuery(query, snapshot[locale], locale);

  if (match.status === QA_MATCH_STATUS.REFUSED) {
    return NextResponse.json({ status: QA_MATCH_STATUS.REFUSED });
  }

  const { text, href, citation, title, heading } = match.chunk;
  return NextResponse.json({
    status: QA_MATCH_STATUS.HIT,
    text,
    href,
    citation,
    title,
    heading,
  });
}
