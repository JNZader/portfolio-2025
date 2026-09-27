import { describe, expect, it } from 'vitest';
import { block, mermaid } from '@/lib/data/case-studies/blocks';
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
  toCorpusProject,
  toEducationRecord,
  type CorpusProject,
  type CorpusReadme,
} from '@/lib/qa';

const ORIGIN_MARKER = 'ORIGIN_LIBRARY_ONLY_DECEMBER_2014_BASE_CONTROLLER';
const PUBLIC_REPO_MARKER = 'PUBLIC_REPO_ONLY_NOT_IN_THE_CASE_STUDY';
const PUBLIC_README_CITATION = 'github.com/example/biogas';

function education(locale: typeof QA_LOCALE.ES | typeof QA_LOCALE.EN) {
  const source = locale === QA_LOCALE.EN ? resumeEn.education : resumeEs.education;
  return source.map((entry) => toEducationRecord(entry));
}

function publishedCorpus(
  locale: typeof QA_LOCALE.ES | typeof QA_LOCALE.EN,
  extraProjects: readonly CorpusProject[] = [],
  readmes: readonly CorpusReadme[] = []
) {
  return assembleCorpus({
    locale,
    projects: [
      toCorpusProject(apigen, locale),
      toCorpusProject(biogasPlatform, locale),
      ...extraProjects,
    ],
    education: education(locale),
    readmes,
  });
}

describe('assembleCorpus', () => {
  it('drops an origin README when the case study has prose', () => {
    const corpus = publishedCorpus(QA_LOCALE.ES, [], [
      {
        slug: 'apigen',
        text: `# APiGen\n\n${ORIGIN_MARKER}`,
        citation: 'JNZader-Vault/apigen',
      },
    ]);

    expect(corpus.some((chunk) => chunk.text.includes(ORIGIN_MARKER))).toBe(false);
    expect(corpus.some((chunk) => chunk.citation.includes('JNZader-Vault/apigen'))).toBe(false);
    expect(corpus.some((chunk) => chunk.slug === 'apigen' && chunk.kind === QA_KIND.CASE_STUDY)).toBe(
      true
    );
  });

  it('drops a public README for Biogas because the case study has no repo link in the corpus', () => {
    const corpus = publishedCorpus(QA_LOCALE.ES, [], [
      {
        slug: 'biogas-platform',
        text: PUBLIC_REPO_MARKER,
        citation: PUBLIC_README_CITATION,
      },
    ]);
    const biogas = corpus.filter((chunk) => chunk.slug === 'biogas-platform');

    expect(biogas.length).toBeGreaterThan(0);
    expect(biogas.every((chunk) => chunk.kind === QA_KIND.CASE_STUDY)).toBe(true);
    expect(biogas.every((chunk) => !chunk.text.includes(PUBLIC_REPO_MARKER))).toBe(true);
    expect(biogas.every((chunk) => chunk.citation !== PUBLIC_README_CITATION)).toBe(true);
    expect(biogas.every((chunk) => chunk.href === '/proyectos/biogas-platform')).toBe(true);
  });

  it('keeps a README only for a project with an empty body', () => {
    const notes: CorpusProject = {
      slug: 'notes-tool',
      title: 'Notes Tool',
      lead: '',
      body: [],
    };
    const corpus = publishedCorpus(
      QA_LOCALE.ES,
      [notes],
      [
        {
          slug: 'notes-tool',
          text: 'Busqueda local MARKER_NOTES',
          citation: 'JNZader/notes-tool',
        },
      ]
    );
    const match = matchQuery('notes tool', corpus, QA_LOCALE.ES);

    expect(match.status).toBe(QA_MATCH_STATUS.HIT);
    if (match.status !== QA_MATCH_STATUS.HIT) return;
    expect(match.chunk.kind).toBe(QA_KIND.README);
    expect(match.chunk.text).toContain('MARKER_NOTES');
    expect(match.chunk.citation).toBe('JNZader/notes-tool');
    expect(match.chunk.href).toBe('/proyectos/notes-tool');
  });

  it('does not quote mermaid chart source', () => {
    const diagramHost: CorpusProject = {
      slug: 'chart-fixture',
      title: 'Chart Fixture',
      lead: '',
      body: [block('Intro visible del host'), mermaid('UNIQUE_DIAGRAM_TOKEN flowchart')],
    };
    const corpus = assembleCorpus({
      locale: QA_LOCALE.ES,
      projects: [diagramHost],
      education: [],
    });

    expect(corpus.some((chunk) => chunk.text.includes('UNIQUE_DIAGRAM_TOKEN'))).toBe(false);
    expect(matchQuery('unique diagram token', corpus, QA_LOCALE.ES).status).toBe(
      QA_MATCH_STATUS.REFUSED
    );
  });

  it('keeps English prose out of the Spanish body', () => {
    const corpus = publishedCorpus(QA_LOCALE.ES);
    const apigenChunks = corpus.filter((chunk) => chunk.slug === 'apigen');

    expect(apigenChunks.some((chunk) => chunk.text.includes('OpenAPI'))).toBe(true);
    expect(apigenChunks.some((chunk) => chunk.text.includes('Software Development Technician'))).toBe(
      false
    );
    expect(
      apigenChunks.some((chunk) => chunk.text.includes('always the same path'))
    ).toBe(false);
  });
});

describe('matchQuery', () => {
  it('answers the current APiGen platform from the case study', () => {
    const corpus = publishedCorpus(QA_LOCALE.ES, [], [
      {
        slug: 'apigen',
        text: ORIGIN_MARKER,
        citation: 'JNZader-Vault/apigen',
      },
    ]);
    const match = matchQuery('qué es apigen', corpus, QA_LOCALE.ES);

    expect(match.status).toBe(QA_MATCH_STATUS.HIT);
    if (match.status !== QA_MATCH_STATUS.HIT) return;
    expect(match.chunk.kind).toBe(QA_KIND.CASE_STUDY);
    expect(match.chunk.href).toBe('/proyectos/apigen');
    expect(match.chunk.text).toContain('contrato OpenAPI');
    expect(match.chunk.text).not.toContain(ORIGIN_MARKER);
  });

  it('answers Biogas from the case study page, not from a supplied repo', () => {
    const corpus = publishedCorpus(QA_LOCALE.ES, [], [
      {
        slug: 'biogas-platform',
        text: PUBLIC_REPO_MARKER,
        citation: 'github.com/example/biogas',
      },
    ]);
    const match = matchQuery('biogas', corpus, QA_LOCALE.ES);

    expect(match.status).toBe(QA_MATCH_STATUS.HIT);
    if (match.status !== QA_MATCH_STATUS.HIT) return;
    expect(match.chunk.href).toBe('/proyectos/biogas-platform');
    expect(match.chunk.citation).not.toContain('github.com');
    expect(match.chunk.text).not.toContain(PUBLIC_REPO_MARKER);
    expect(match.chunk.text.toLowerCase()).toContain('biogás');
  });

  it('quotes the Gastón Dachary degree and its published dates', () => {
    const corpus = publishedCorpus(QA_LOCALE.ES);
    const match = matchQuery('qué título tenés', corpus, QA_LOCALE.ES);

    expect(match.status).toBe(QA_MATCH_STATUS.HIT);
    if (match.status !== QA_MATCH_STATUS.HIT) return;
    expect(match.chunk.kind).toBe(QA_KIND.EDUCATION);
    expect(match.chunk.href).toBe('/cv');
    expect(match.chunk.text).toContain('Técnico en Desarrollo de Software');
    expect(match.chunk.text).toContain('Universidad Gastón Dachary');
    expect(match.chunk.text).toContain('2023-12');
    expect(match.chunk.text).toContain('2025-07');
    expect(match.chunk.text).not.toContain('Software Development Technician');
  });

  it('quotes the English degree from resume.en.json', () => {
    const corpus = publishedCorpus(QA_LOCALE.EN);
    const match = matchQuery('what degree do you have', corpus, QA_LOCALE.EN);

    expect(match.status).toBe(QA_MATCH_STATUS.HIT);
    if (match.status !== QA_MATCH_STATUS.HIT) return;
    expect(match.chunk.href).toBe('/en/cv');
    expect(match.chunk.text).toContain('Software Development Technician');
    expect(match.chunk.text).toContain('Universidad Gastón Dachary');
    expect(match.chunk.text).toContain('2023-12');
    expect(match.chunk.text).toContain('2025-07');
    expect(match.chunk.text).not.toContain('Técnico en Desarrollo de Software');
  });

  it('prefers a named certificate over the formal degree', () => {
    const corpus = publishedCorpus(QA_LOCALE.ES);
    const match = matchQuery('ccna', corpus, QA_LOCALE.ES);

    expect(match.status).toBe(QA_MATCH_STATUS.HIT);
    if (match.status !== QA_MATCH_STATUS.HIT) return;
    expect(match.chunk.text).toContain('Cisco Certified Network Associate (CCNA)');
    expect(match.chunk.text).not.toContain('Gastón Dachary');
  });

  it('refuses a question the published corpus does not cover', () => {
    const corpus = publishedCorpus(QA_LOCALE.ES);
    expect(matchQuery('precio del dólar mañana', corpus, QA_LOCALE.ES).status).toBe(
      QA_MATCH_STATUS.REFUSED
    );
  });

  it('does not answer an English question from the Spanish corpus', () => {
    const corpus = publishedCorpus(QA_LOCALE.ES);
    const match = matchQuery('what degree do you have', corpus, QA_LOCALE.EN);

    expect(match.status).toBe(QA_MATCH_STATUS.REFUSED);
  });
});
