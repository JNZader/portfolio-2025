import type { PortableTextBlock } from 'sanity';

export const QA_LOCALE = {
  ES: 'es',
  EN: 'en',
} as const;

export type QaLocale = (typeof QA_LOCALE)[keyof typeof QA_LOCALE];

export const QA_KIND = {
  CASE_STUDY: 'case-study',
  README: 'readme',
  EDUCATION: 'education',
} as const;

export type QaKind = (typeof QA_KIND)[keyof typeof QA_KIND];

export const QA_MATCH_STATUS = {
  HIT: 'hit',
  REFUSED: 'refused',
} as const;

export type QaMatchStatus = (typeof QA_MATCH_STATUS)[keyof typeof QA_MATCH_STATUS];

export interface SlugRef {
  current: string;
}

/** Published case study fields the corpus is allowed to read. */
export interface CaseStudySource {
  title: string;
  slug: SlugRef;
  excerpt: string;
  excerptEn?: string;
  body?: readonly PortableTextBlock[];
  bodyEn?: readonly PortableTextBlock[];
}

export interface CorpusProject {
  slug: string;
  title: string;
  lead: string;
  body: readonly PortableTextBlock[];
}

/** README text supplied by the caller. Corte 1 does not fetch it. */
export interface CorpusReadme {
  slug: string;
  text: string;
  citation: string;
}

/** Resume education entry before details are normalized. */
export interface EducationSource {
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  details?: readonly string[];
}

export interface EducationRecord {
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  details: readonly string[];
}

export interface QaChunk {
  id: string;
  locale: QaLocale;
  kind: QaKind;
  slug: string;
  title: string;
  heading: string | null;
  text: string;
  href: string;
  citation: string;
}

export interface CorpusInput {
  locale: QaLocale;
  projects: readonly CorpusProject[];
  education: readonly EducationRecord[];
  readmes?: readonly CorpusReadme[];
}

export interface QaHit {
  status: typeof QA_MATCH_STATUS.HIT;
  chunk: QaChunk;
}

export interface QaRefusal {
  status: typeof QA_MATCH_STATUS.REFUSED;
}

export type QaMatch = QaHit | QaRefusal;
