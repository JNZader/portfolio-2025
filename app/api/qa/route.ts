import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from 'ai';
import { type NextRequest, NextResponse } from 'next/server';
import {
  buildPublishedSnapshot,
  QA_NO_EVIDENCE,
  type QaChunk,
  type QaLocale,
  retrievePublishedChunks,
} from '@/lib/qa';
import { CSRF_ERROR_RESPONSE, verifyCsrf } from '@/lib/security/security-config';
import { latestUserText, QA_QUERY_MAX_LENGTH, qaChatSchema } from '@/lib/validations/qa';

const INVALID_REQUEST = {
  message: 'Invalid request',
  status: 400,
} as const;

const METHOD_NOT_ALLOWED = {
  message: 'Method not allowed',
  status: 405,
} as const;

const SERVICE_UNAVAILABLE = {
  message: 'The published Q&A service is unavailable.',
  status: 503,
} as const;

function invalidRequest() {
  return NextResponse.json(
    { message: INVALID_REQUEST.message },
    { status: INVALID_REQUEST.status }
  );
}

function refusedAssistantResponse() {
  const id = crypto.randomUUID();
  const stream = createUIMessageStream({
    execute({ writer }) {
      writer.write({ type: 'text-start', id });
      writer.write({ type: 'text-delta', id, delta: QA_NO_EVIDENCE });
      writer.write({ type: 'text-end', id });
    },
  });
  return createUIMessageStreamResponse({ stream });
}

function sourcePayload(chunk: QaChunk) {
  return {
    title: chunk.title,
    heading: chunk.heading,
    href: chunk.href,
    citation: chunk.citation,
    text: chunk.text,
  };
}

function systemPrompt(locale: QaLocale, chunks: readonly QaChunk[]): string {
  const language = locale === 'es' ? 'Spanish' : 'English';
  return [
    'Answer ONLY from SOURCES.',
    'If the sources are insufficient, say you have no published quote.',
    'Cite only the provided hrefs as markdown links.',
    `Reply in ${language}.`,
    'Engineer-to-peer. No hype. Never invent repositories or private READMEs.',
    'SOURCES:',
    JSON.stringify(chunks.map(sourcePayload)),
  ].join('\n');
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

  const parsed = qaChatSchema.safeParse(body);
  if (!parsed.success) {
    return invalidRequest();
  }

  const { messages, locale } = parsed.data;
  const query = latestUserText(messages);
  if (!query || query.length > QA_QUERY_MAX_LENGTH) {
    return invalidRequest();
  }

  const snapshot = buildPublishedSnapshot();
  const chunks = retrievePublishedChunks(query, snapshot[locale], locale);
  if (chunks.length === 0) {
    return refusedAssistantResponse();
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: SERVICE_UNAVAILABLE.message },
      { status: SERVICE_UNAVAILABLE.status }
    );
  }

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt(locale, chunks),
    messages: await convertToModelMessages(messages as UIMessage[]),
  });

  return result.toUIMessageStreamResponse();
}
