import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/monitoring/logger';
import { buildResumePdf, PDF_LABELS, type PdfLocale } from '@/lib/pdf/resume-pdf';
import { getClientIdentifier, resumeRateLimiter } from '@/lib/rate-limit/redis';
import type { ResumeData, ResumeDataRaw } from '@/lib/types/resume';
import { fetchResumeData } from '@/sanity/lib/queries';

function resolvePdfLocale(request: NextRequest): PdfLocale {
  return request.nextUrl.searchParams.get('locale') === 'en' ? 'en' : 'es';
}

async function loadResumeRaw(locale: PdfLocale): Promise<ResumeDataRaw> {
  if (locale === 'en') {
    const { default: en } = await import('@/lib/data/resume.en.json');
    return en as ResumeDataRaw;
  }
  return fetchResumeData();
}

/**
 * API Route to generate the CV in PDF.
 * Endpoint: /api/resume
 * Rate limited: 10 requests per hour per IP.
 */
export async function GET(request: NextRequest) {
  const locale = resolvePdfLocale(request);
  const labels = PDF_LABELS[locale];
  try {
    const clientId = getClientIdentifier(request);
    const { success } = await resumeRateLimiter.limit(clientId);

    if (!success) {
      logger.warn('Resume rate limit exceeded', { ip: clientId });
      return new NextResponse(labels.rateLimit, {
        status: 429,
        headers: { 'Retry-After': '3600' },
      });
    }

    const rawData: ResumeDataRaw = await loadResumeRaw(locale);

    let decodedEmail: string;
    try {
      decodedEmail = Buffer.from(rawData.personalInfo.email_encoded, 'base64').toString('utf-8');
    } catch {
      logger.warn('Failed to decode email_encoded from resume data, using fallback');
      decodedEmail = 'jnzader@gmail.com';
    }

    const data: ResumeData = {
      ...rawData,
      personalInfo: {
        ...rawData.personalInfo,
        email: decodedEmail,
      },
    };

    const pdfBuffer = await buildResumePdf(data, labels);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CV-${data.personalInfo.name.replaceAll(' ', '-')}.pdf"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    logger.error('Error generating PDF resume', error as Error, {
      path: '/api/resume',
      method: 'GET',
    });
    return new NextResponse(labels.error, { status: 500 });
  }
}
