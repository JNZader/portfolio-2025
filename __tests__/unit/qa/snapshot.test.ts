import { describe, expect, it } from 'vitest';
import {
  buildPublishedSnapshot,
  QA_KIND,
  QA_LOCALE,
  type CorpusProject,
  type CorpusReadme,
} from '@/lib/qa';

const ORIGIN_MARKER = 'ORIGIN_LIBRARY_ONLY_DECEMBER_2014_BASE_CONTROLLER';
const PUBLIC_EMPTY_BODY_MARKER = 'PUBLIC_README_ONLY_EMPTY_BODY_PROJECT';

const CASE_STUDY_SLUGS = ['apigen', 'apigen-studio', 'biogas-platform'] as const;

const emptyBodyProject: CorpusProject = {
  slug: 'notes-tool',
  title: 'Notes Tool',
  lead: '',
  body: [],
};

const originReadme: CorpusReadme = {
  slug: 'apigen',
  text: `# APiGen\n\n${ORIGIN_MARKER}`,
  citation: 'JNZader-Vault/apigen',
};

const emptyBodyReadme: CorpusReadme = {
  slug: 'notes-tool',
  text: PUBLIC_EMPTY_BODY_MARKER,
  citation: 'JNZader/notes-tool',
};

describe('buildPublishedSnapshot', () => {
  it('includes both Spanish and English corpora', () => {
    const snapshot = buildPublishedSnapshot();

    expect(snapshot.es.length).toBeGreaterThan(0);
    expect(snapshot.en.length).toBeGreaterThan(0);
    expect(snapshot.es.every((chunk) => chunk.locale === QA_LOCALE.ES)).toBe(true);
    expect(snapshot.en.every((chunk) => chunk.locale === QA_LOCALE.EN)).toBe(true);
  });

  it('quotes resume education fields including dates for each locale', () => {
    const snapshot = buildPublishedSnapshot();
    const spanishEducation = snapshot.es.filter((chunk) => chunk.kind === QA_KIND.EDUCATION);
    const englishEducation = snapshot.en.filter((chunk) => chunk.kind === QA_KIND.EDUCATION);

    expect(
      spanishEducation.some(
        (chunk) =>
          chunk.text.includes('Técnico en Desarrollo de Software') &&
          chunk.text.includes('Universidad Gastón Dachary') &&
          chunk.text.includes('2023-12') &&
          chunk.text.includes('2025-07')
      )
    ).toBe(true);
    expect(
      englishEducation.some(
        (chunk) =>
          chunk.text.includes('Software Development Technician') &&
          chunk.text.includes('Universidad Gastón Dachary') &&
          chunk.text.includes('2023-12') &&
          chunk.text.includes('2025-07')
      )
    ).toBe(true);
    expect(
      spanishEducation.some((chunk) => chunk.text.includes('Software Development Technician'))
    ).toBe(false);
    expect(
      englishEducation.some((chunk) => chunk.text.includes('Técnico en Desarrollo de Software'))
    ).toBe(false);
  });

  it('includes apigen, apigen-studio, and biogas-platform as case-study chunks', () => {
    const snapshot = buildPublishedSnapshot();

    for (const corpus of [snapshot.es, snapshot.en]) {
      for (const slug of CASE_STUDY_SLUGS) {
        expect(
          corpus.some((chunk) => chunk.slug === slug && chunk.kind === QA_KIND.CASE_STUDY)
        ).toBe(true);
      }
    }
  });

  it('drops a supplied origin or Vault README for apigen', () => {
    const snapshot = buildPublishedSnapshot({ readmes: [originReadme] });

    expect(snapshot.es.some((chunk) => chunk.text.includes(ORIGIN_MARKER))).toBe(false);
    expect(snapshot.en.some((chunk) => chunk.text.includes(ORIGIN_MARKER))).toBe(false);
    expect(snapshot.es.some((chunk) => chunk.citation.includes('JNZader-Vault/apigen'))).toBe(
      false
    );
    expect(snapshot.en.some((chunk) => chunk.citation.includes('JNZader-Vault/apigen'))).toBe(
      false
    );
    expect(
      snapshot.es.some((chunk) => chunk.slug === 'apigen' && chunk.kind === QA_KIND.CASE_STUDY)
    ).toBe(true);
  });

  it('keeps a supplied public README only for an empty-body project', () => {
    const snapshot = buildPublishedSnapshot({
      projects: [emptyBodyProject],
      readmes: [originReadme, emptyBodyReadme],
    });
    const notes = snapshot.es.filter((chunk) => chunk.slug === 'notes-tool');

    expect(notes.some((chunk) => chunk.kind === QA_KIND.README)).toBe(true);
    expect(notes.some((chunk) => chunk.text.includes(PUBLIC_EMPTY_BODY_MARKER))).toBe(true);
    expect(notes.every((chunk) => chunk.citation === 'JNZader/notes-tool')).toBe(true);
    expect(snapshot.es.some((chunk) => chunk.text.includes(ORIGIN_MARKER))).toBe(false);
    expect(
      snapshot.es.some((chunk) => chunk.slug === 'apigen' && chunk.kind === QA_KIND.CASE_STUDY)
    ).toBe(true);
  });
});
