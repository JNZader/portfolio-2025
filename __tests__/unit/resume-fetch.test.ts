import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SanityResumeData } from '@/lib/types/resume';

// Mock sanityFetch
const mockSanityFetch = vi.fn();
vi.mock('@/sanity/lib/client', () => ({
  sanityFetch: (...args: unknown[]) => mockSanityFetch(...args),
  client: {},
}));

// Mock logger
const mockLoggerWarn = vi.fn();
vi.mock('@/lib/monitoring/logger', () => ({
  logger: {
    warn: (...args: unknown[]) => mockLoggerWarn(...args),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Import after mocks are set up
const { fetchResumeData, transformSkills } = await import(
  '@/sanity/lib/queries'
);

// Sample Sanity response matching the schema
const sanityResumeData: SanityResumeData = {
  personalInfo: {
    name: 'Test Name',
    title: 'Test Title',
    email_encoded: 'dGVzdEBleGFtcGxlLmNvbQ==',
    phone: '+54 123 456 7890',
    location: 'Córdoba, Argentina',
    website: 'https://example.com',
    linkedin: 'https://linkedin.com/in/test',
    github: 'https://github.com/test',
  },
  summary: 'Test professional summary',
  experience: [
    {
      company: 'Test Corp',
      position: 'Developer',
      location: 'Remote',
      startDate: '2024',
      endDate: 'Presente',
      highlights: ['Built stuff'],
    },
  ],
  projects: [
    {
      name: 'Test Project',
      description: 'A test project',
      highlights: ['Feature 1'],
    },
  ],
  education: [
    {
      institution: 'Test University',
      degree: 'CS Degree',
      location: 'Argentina',
      startDate: '2020',
      endDate: '2024',
      details: ['GPA 4.0'],
    },
  ],
  skills: [
    { category: 'Lenguajes', items: ['Java', 'Python'] },
    { category: 'Frameworks', items: ['Spring Boot', 'React'] },
  ],
  softSkills: ['Teamwork', 'Leadership'],
  languages: [
    { name: 'Español', level: 'Nativo' },
    { name: 'Inglés', level: 'Intermedio' },
  ],
};

describe('transformSkills', () => {
  it('converts Sanity skills array to Record<string, string[]>', () => {
    const result = transformSkills([
      { category: 'Lenguajes', items: ['Java', 'Python'] },
      { category: 'Frameworks', items: ['Spring Boot'] },
    ]);

    expect(result).toEqual({
      Lenguajes: ['Java', 'Python'],
      Frameworks: ['Spring Boot'],
    });
  });

  it('returns empty object for empty array', () => {
    const result = transformSkills([]);
    expect(result).toEqual({});
  });
});

describe('fetchResumeData', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns Sanity data when available', async () => {
    mockSanityFetch.mockResolvedValueOnce(sanityResumeData);

    const result = await fetchResumeData();

    expect(mockSanityFetch).toHaveBeenCalledOnce();
    expect(result.personalInfo.name).toBe('Test Name');
    expect(result.summary).toBe('Test professional summary');
    expect(result.experience).toHaveLength(1);
    expect(result.projects).toHaveLength(1);
    expect(result.education).toHaveLength(1);
    expect(result.languages).toHaveLength(2);
    expect(result.softSkills).toEqual(['Teamwork', 'Leadership']);
  });

  it('transforms skills from array to Record format', async () => {
    mockSanityFetch.mockResolvedValueOnce(sanityResumeData);

    const result = await fetchResumeData();

    expect(result.skills).toEqual({
      Lenguajes: ['Java', 'Python'],
      Frameworks: ['Spring Boot', 'React'],
    });
  });

  it('falls back to JSON when Sanity returns null', async () => {
    mockSanityFetch.mockResolvedValueOnce(null);

    const result = await fetchResumeData();

    expect(mockLoggerWarn).toHaveBeenCalledWith(
      'Sanity resume data is empty or incomplete, using JSON fallback',
    );
    // Fallback data should have the JSON file structure
    expect(result.personalInfo.name).toBe('Javier Norberto Zader');
  });

  it('falls back to JSON when Sanity response is missing required fields', async () => {
    const incompleteData = {
      personalInfo: { name: 'Test' },
      // missing summary
    };
    mockSanityFetch.mockResolvedValueOnce(incompleteData);

    const result = await fetchResumeData();

    expect(mockLoggerWarn).toHaveBeenCalledWith(
      'Sanity resume data is empty or incomplete, using JSON fallback',
    );
    expect(result.personalInfo.name).toBe('Javier Norberto Zader');
  });

  it('falls back to JSON when Sanity throws an error', async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error('Network timeout'));

    const result = await fetchResumeData();

    expect(mockLoggerWarn).toHaveBeenCalledWith(
      'Failed to fetch resume from Sanity, using JSON fallback',
      { error: 'Network timeout' },
    );
    expect(result.personalInfo.name).toBe('Javier Norberto Zader');
  });

  it('falls back to JSON when Sanity throws a non-Error', async () => {
    mockSanityFetch.mockRejectedValueOnce('some string error');

    const result = await fetchResumeData();

    expect(mockLoggerWarn).toHaveBeenCalledWith(
      'Failed to fetch resume from Sanity, using JSON fallback',
      { error: 'some string error' },
    );
    expect(result.personalInfo.name).toBe('Javier Norberto Zader');
  });

  it('handles missing optional arrays from Sanity gracefully', async () => {
    const minimalData: SanityResumeData = {
      ...sanityResumeData,
      projects: undefined,
      softSkills: undefined,
      skills: [],
      experience: [],
      education: [],
      languages: [],
    };
    mockSanityFetch.mockResolvedValueOnce(minimalData);

    const result = await fetchResumeData();

    expect(result.experience).toEqual([]);
    expect(result.projects).toBeUndefined();
    expect(result.education).toEqual([]);
    expect(result.skills).toEqual({});
    expect(result.softSkills).toBeUndefined();
    expect(result.languages).toEqual([]);
  });
});
