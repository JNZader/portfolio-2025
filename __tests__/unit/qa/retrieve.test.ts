import { describe, expect, it } from 'vitest';
import { apigen } from '@/lib/data/case-studies/apigen';
import { biogasPlatform } from '@/lib/data/case-studies/biogas-platform';
import resumeEn from '@/lib/data/resume.en.json';
import resumeEs from '@/lib/data/resume.json';
import {
  assembleCorpus,
  QA_KIND,
  QA_LOCALE,
  retrievePublishedChunks,
  toCorpusProject,
  toEducationRecord,
  type QaChunk,
} from '@/lib/qa';

function education(locale: typeof QA_LOCALE.ES | typeof QA_LOCALE.EN) {
  const source = locale === QA_LOCALE.EN ? resumeEn.education : resumeEs.education;
  return source.map((entry) => toEducationRecord(entry));
}

function publishedCorpus(locale: typeof QA_LOCALE.ES | typeof QA_LOCALE.EN) {
  return assembleCorpus({
    locale,
    projects: [toCorpusProject(apigen, locale), toCorpusProject(biogasPlatform, locale)],
    education: education(locale),
  });
}

function chunk(overrides: Partial<QaChunk> & Pick<QaChunk, 'id' | 'text'>): QaChunk {
  return {
    locale: QA_LOCALE.ES,
    kind: QA_KIND.CASE_STUDY,
    slug: 'fixture',
    title: 'Fixture',
    heading: null,
    href: '/proyectos/fixture',
    citation: 'Fixture',
    ...overrides,
  };
}

describe('retrievePublishedChunks', () => {
  it('returns an empty list when the query has no tokens', () => {
    expect(retrievePublishedChunks('   ', publishedCorpus(QA_LOCALE.ES), QA_LOCALE.ES)).toEqual([]);
  });

  it('returns an empty list when no chunk reaches the lexical floor', () => {
    expect(
      retrievePublishedChunks('precio del dólar mañana', publishedCorpus(QA_LOCALE.ES), QA_LOCALE.ES)
    ).toEqual([]);
  });

  it('keeps a chunk at the 0.25 lexical floor and drops one below it', () => {
    const floorChunk = chunk({ id: 'es:case-study:floor:0', text: 'unique token only' });

    expect(
      retrievePublishedChunks('alpha beta gamma unique', [floorChunk], QA_LOCALE.ES).map(
        (entry) => entry.id
      )
    ).toEqual(['es:case-study:floor:0']);
    expect(
      retrievePublishedChunks('alpha beta gamma delta unique', [floorChunk], QA_LOCALE.ES)
    ).toEqual([]);
  });

  it('returns at most four locale-scoped chunks, highest lexical score first', () => {
    const chunks = [
      chunk({ id: 'es:case-study:low:0', text: 'shared', slug: 'low' }),
      chunk({
        id: 'es:case-study:high:0',
        text: 'shared marker extra extra',
        heading: 'marker',
        slug: 'high',
      }),
      chunk({ id: 'es:case-study:mid:0', text: 'shared marker', slug: 'mid' }),
      chunk({ id: 'es:case-study:four:0', text: 'shared', slug: 'four' }),
      chunk({ id: 'es:case-study:five:0', text: 'unrelated prose', slug: 'five' }),
      chunk({ id: 'es:case-study:six:0', text: 'shared', slug: 'six' }),
      chunk({
        id: 'en:case-study:en:0',
        locale: QA_LOCALE.EN,
        text: 'shared marker extra extra extra',
        slug: 'english',
      }),
    ];

    const retrieved = retrievePublishedChunks('shared marker', chunks, QA_LOCALE.ES);

    expect(retrieved).toHaveLength(4);
    expect(retrieved.every((entry) => entry.locale === QA_LOCALE.ES)).toBe(true);
    expect(retrieved[0]?.id).toBe('es:case-study:high:0');
    expect(retrieved.map((entry) => entry.id)).not.toContain('es:case-study:five:0');
  });

  it('adds the formal-degree education chunk when intent matches and overlap is 0', () => {
    const retrieved = retrievePublishedChunks(
      'qué título tenés',
      publishedCorpus(QA_LOCALE.ES),
      QA_LOCALE.ES
    );

    expect(retrieved).toHaveLength(1);
    expect(retrieved[0]?.kind).toBe(QA_KIND.EDUCATION);
    expect(retrieved[0]?.href).toBe('/cv');
    expect(retrieved[0]?.text).toContain('Técnico en Desarrollo de Software');
    expect(retrieved[0]?.text).toContain('Universidad Gastón Dachary');
  });

  it('answers the Spanish education suggestion chip ¿Dónde estudiaste?', () => {
    const retrieved = retrievePublishedChunks(
      '¿Dónde estudiaste?',
      publishedCorpus(QA_LOCALE.ES),
      QA_LOCALE.ES
    );

    expect(retrieved.length).toBeGreaterThan(0);
    expect(retrieved[0]?.kind).toBe(QA_KIND.EDUCATION);
    expect(retrieved[0]?.text).toContain('Universidad Gastón Dachary');
  });

  it('answers qué estudiaste with the formal degree', () => {
    const retrieved = retrievePublishedChunks(
      '¿qué estudiaste?',
      publishedCorpus(QA_LOCALE.ES),
      QA_LOCALE.ES
    );

    expect(retrieved.length).toBeGreaterThan(0);
    expect(retrieved[0]?.kind).toBe(QA_KIND.EDUCATION);
  });

  it('answers the English education suggestion chip Where did you study?', () => {
    const retrieved = retrievePublishedChunks(
      'Where did you study?',
      publishedCorpus(QA_LOCALE.EN),
      QA_LOCALE.EN
    );

    expect(retrieved.length).toBeGreaterThan(0);
    expect(retrieved[0]?.kind).toBe(QA_KIND.EDUCATION);
    expect(retrieved[0]?.href).toBe('/en/cv');
    expect(retrieved[0]?.text).toContain('Software Development Technician');
  });

  it('does not append the degree when retrieval already found project material', () => {
    const retrieved = retrievePublishedChunks(
      'estudio de caso de apigen',
      publishedCorpus(QA_LOCALE.ES),
      QA_LOCALE.ES
    );

    expect(retrieved.length).toBeGreaterThan(0);
    expect(retrieved.every((chunk) => chunk.kind !== QA_KIND.EDUCATION)).toBe(true);
  });

  it('adds the English formal-degree chunk for the English education intent', () => {
    const retrieved = retrievePublishedChunks(
      'what degree do you have',
      publishedCorpus(QA_LOCALE.EN),
      QA_LOCALE.EN
    );

    expect(retrieved).toHaveLength(1);
    expect(retrieved[0]?.href).toBe('/en/cv');
    expect(retrieved[0]?.text).toContain('Software Development Technician');
  });

  it('does not retrieve English chunks for a Spanish locale', () => {
    expect(
      retrievePublishedChunks(
        'what degree do you have',
        publishedCorpus(QA_LOCALE.ES),
        QA_LOCALE.EN
      )
    ).toEqual([]);
  });

  it('excludes a below-floor preferSlug chunk instead of overriding the query', () => {
    const preferred = chunk({
      id: 'es:case-study:apigen:0',
      slug: 'apigen',
      text: 'unrelated private note',
    });
    const other = chunk({
      id: 'es:case-study:other:0',
      slug: 'other',
      text: 'shared marker extra extra',
      heading: 'marker',
    });

    const retrieved = retrievePublishedChunks('shared marker', [other, preferred], QA_LOCALE.ES, {
      preferSlug: 'apigen',
    });

    expect(retrieved.map((entry) => entry.id)).toEqual(['es:case-study:other:0']);
  });

  it('ranks a matching preferSlug chunk above an equal non-preferred chunk', () => {
    const preferred = chunk({
      id: 'es:case-study:apigen:0',
      slug: 'apigen',
      text: 'shared marker extra extra',
      heading: 'marker',
    });
    const other = chunk({
      id: 'es:case-study:other:0',
      slug: 'other',
      text: 'shared marker extra extra',
      heading: 'marker',
    });

    const retrieved = retrievePublishedChunks('shared marker', [other, preferred], QA_LOCALE.ES, {
      preferSlug: 'apigen',
    });

    expect(retrieved.map((entry) => entry.id)).toEqual([
      'es:case-study:apigen:0',
      'es:case-study:other:0',
    ]);
  });

  it('keeps site-wide ranking when preferSlug is omitted', () => {
    const preferred = chunk({
      id: 'es:case-study:apigen:0',
      slug: 'apigen',
      text: 'unrelated private note',
    });
    const other = chunk({
      id: 'es:case-study:other:0',
      slug: 'other',
      text: 'shared marker extra extra',
      heading: 'marker',
    });

    const retrieved = retrievePublishedChunks('shared marker', [other, preferred], QA_LOCALE.ES);

    expect(retrieved.map((entry) => entry.id)).toEqual(['es:case-study:other:0']);
  });

  it('is a no-op when preferSlug matches no chunk', () => {
    const other = chunk({
      id: 'es:case-study:other:0',
      slug: 'other',
      text: 'shared marker extra extra',
      heading: 'marker',
    });

    const retrieved = retrievePublishedChunks('shared marker', [other], QA_LOCALE.ES, {
      preferSlug: 'missing-blog-slug',
    });

    expect(retrieved.map((entry) => entry.id)).toEqual(['es:case-study:other:0']);
  });
});
