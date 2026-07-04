import { beforeEach, describe, expect, it, vi } from 'vitest';

// First direct coverage of the PDF resume route. Focus: locale resolution
// (the i18n split between the Sanity `es` path and the bundled `resume.en.json`
// `en` path), the rate-limit gate, and the error fallback. jsPDF is NOT mocked
// -- it builds a real PDF headless so we exercise the whole render pipeline.

import type { ResumeDataRaw } from '@/lib/types/resume';

const limit = vi.fn();
vi.mock('@/lib/rate-limit/redis', () => ({
  resumeRateLimiter: { limit: (...args: unknown[]) => limit(...args) },
  getClientIdentifier: vi.fn().mockReturnValue('127.0.0.1'),
}));

const fetchResumeData = vi.fn();
vi.mock('@/sanity/lib/queries', () => ({
  fetchResumeData: (...args: unknown[]) => fetchResumeData(...args),
}));

vi.mock('@/lib/monitoring/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/resume/route';

// Minimal-but-valid ResumeDataRaw for the `es`/Sanity path. `email_encoded`
// is base64 of "es@example.com" so the decode branch is exercised.
function minimalResume(): ResumeDataRaw {
  return {
    personalInfo: {
      name: 'Test User',
      title: 'Backend Developer',
      email_encoded: Buffer.from('es@example.com', 'utf-8').toString('base64'),
      phone: '',
      location: 'Córdoba, Argentina',
      website: 'https://example.com',
      linkedin: 'https://www.linkedin.com/in/test/',
      github: 'https://github.com/test',
    },
    summary: 'A short professional summary used for the PDF render test.',
    experience: [
      {
        company: 'Freelance',
        position: 'Backend Developer',
        location: 'Córdoba, Argentina',
        startDate: '2024',
        endDate: 'Present',
        highlights: ['Built several end-to-end systems.'],
      },
    ],
    projects: [
      {
        name: 'Test Project',
        description: 'A description of the test project.',
        highlights: ['A highlight of the project.'],
      },
    ],
    education: [
      {
        institution: 'Test University',
        degree: 'Software Development Technician',
        location: 'Online',
        startDate: '2023',
        endDate: '2025',
        details: ['A detail line.'],
      },
    ],
    skills: {
      Languages: ['Java', 'Go', 'TypeScript'],
    },
    softSkills: ['Communication'],
    languages: [{ name: 'Spanish', level: 'Native' }],
  };
}

function request(url = 'https://x/api/resume') {
  return new NextRequest(url);
}

describe('GET /api/resume', () => {
  beforeEach(() => {
    limit.mockReset().mockResolvedValue({ success: true });
    fetchResumeData.mockReset().mockResolvedValue(minimalResume());
  });

  it('serves a PDF for the default (es) locale via Sanity', async () => {
    const res = await GET(request('https://x/api/resume'));

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    expect(res.headers.get('Content-Disposition')).toContain('attachment');
    expect(res.headers.get('Content-Disposition')).toContain('.pdf');
    // es path pulls from Sanity
    expect(fetchResumeData).toHaveBeenCalledTimes(1);
  });

  it('serves the en PDF from resume.en.json without hitting Sanity', async () => {
    const res = await GET(request('https://x/api/resume?locale=en'));

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    // key i18n assertion: en loads the bundled JSON, NOT Sanity
    expect(fetchResumeData).not.toHaveBeenCalled();
  });

  it('returns 429 when the rate limiter rejects the request', async () => {
    limit.mockResolvedValue({ success: false });

    const res = await GET(request('https://x/api/resume'));

    expect(res.status).toBe(429);
    expect(fetchResumeData).not.toHaveBeenCalled();
  });

  it('returns 500 when resume data loading fails', async () => {
    fetchResumeData.mockRejectedValue(new Error('sanity down'));

    const res = await GET(request('https://x/api/resume'));

    expect(res.status).toBe(500);
  });
});
