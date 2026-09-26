import { describe, expect, it } from 'vitest';
import { apigen } from '@/lib/data/case-studies/apigen';
import { biogasPlatform } from '@/lib/data/case-studies/biogas-platform';
import resumeEn from '@/lib/data/resume.en.json';
import resumeEs from '@/lib/data/resume.json';
import {
  assembleCorpus,
  matchQuery,
  QA_KIND,
  QA_LOCALE,
  QA_MATCH_STATUS,
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
});

describe('matchQuery', () => {
  it('still hits the published education shortcut', () => {
    const match = matchQuery('qué título tenés', publishedCorpus(QA_LOCALE.ES), QA_LOCALE.ES);
    expect(match.status).toBe(QA_MATCH_STATUS.HIT);
  });
});
