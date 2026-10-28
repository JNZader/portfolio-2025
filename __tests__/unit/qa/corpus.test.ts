import { describe, expect, it } from 'vitest';
import { block, mermaid } from '@/lib/data/case-studies/blocks';
import { apigen } from '@/lib/data/case-studies/apigen';
import { biogasPlatform } from '@/lib/data/case-studies/biogas-platform';
import resumeEn from '@/lib/data/resume.en.json';
import resumeEs from '@/lib/data/resume.json';
import {
  assembleCorpus,
  buildPublishedSnapshot,
  QA_KIND,
  QA_LOCALE,
  retrievePublishedChunks,
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
    const retrieved = retrievePublishedChunks('notes tool', corpus, QA_LOCALE.ES);

    expect(retrieved.length).toBeGreaterThan(0);
    expect(retrieved[0]?.kind).toBe(QA_KIND.README);
    expect(retrieved[0]?.text).toContain('MARKER_NOTES');
    expect(retrieved[0]?.citation).toBe('JNZader/notes-tool');
    expect(retrieved[0]?.href).toBe('/proyectos/notes-tool');
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
    expect(retrievePublishedChunks('unique diagram token', corpus, QA_LOCALE.ES)).toEqual([]);
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

describe('retrievePublishedChunks on the published corpus', () => {
  it('answers the current APiGen platform from the case study', () => {
    const corpus = publishedCorpus(QA_LOCALE.ES, [], [
      {
        slug: 'apigen',
        text: ORIGIN_MARKER,
        citation: 'JNZader-Vault/apigen',
      },
    ]);
    const retrieved = retrievePublishedChunks('qué es apigen', corpus, QA_LOCALE.ES);

    expect(retrieved.length).toBeGreaterThan(0);
    expect(retrieved[0]?.kind).toBe(QA_KIND.CASE_STUDY);
    expect(retrieved[0]?.href).toBe('/proyectos/apigen');
    expect(retrieved[0]?.text.toLowerCase()).toContain('apigen');
    expect(retrieved.every((chunk) => !chunk.text.includes(ORIGIN_MARKER))).toBe(true);
  });

  it('answers Biogas from the case study page, not from a supplied repo', () => {
    const corpus = publishedCorpus(QA_LOCALE.ES, [], [
      {
        slug: 'biogas-platform',
        text: PUBLIC_REPO_MARKER,
        citation: 'github.com/example/biogas',
      },
    ]);
    const retrieved = retrievePublishedChunks('biogas', corpus, QA_LOCALE.ES);

    expect(retrieved.length).toBeGreaterThan(0);
    expect(retrieved[0]?.href).toBe('/proyectos/biogas-platform');
    expect(retrieved[0]?.citation).not.toContain('github.com');
    expect(retrieved.every((chunk) => !chunk.text.includes(PUBLIC_REPO_MARKER))).toBe(true);
    expect(retrieved[0]?.text.toLowerCase()).toMatch(/biogas|biogás/);
  });

  it('quotes the Gastón Dachary degree and its published dates', () => {
    const corpus = publishedCorpus(QA_LOCALE.ES);
    const retrieved = retrievePublishedChunks('qué título tenés', corpus, QA_LOCALE.ES);
    const degree = retrieved.find((chunk) => chunk.kind === QA_KIND.EDUCATION);

    expect(degree).toBeDefined();
    expect(degree?.href).toBe('/cv');
    expect(degree?.text).toContain('Técnico en Desarrollo de Software');
    expect(degree?.text).toContain('Universidad Gastón Dachary');
    expect(degree?.text).toContain('2023-12');
    expect(degree?.text).toContain('2025-07');
    expect(degree?.text).not.toContain('Software Development Technician');
  });

  it('quotes the English degree from resume.en.json', () => {
    const corpus = publishedCorpus(QA_LOCALE.EN);
    const retrieved = retrievePublishedChunks('what degree do you have', corpus, QA_LOCALE.EN);
    const degree = retrieved.find((chunk) => chunk.kind === QA_KIND.EDUCATION);

    expect(degree).toBeDefined();
    expect(degree?.href).toBe('/en/cv');
    expect(degree?.text).toContain('Software Development Technician');
    expect(degree?.text).toContain('Universidad Gastón Dachary');
    expect(degree?.text).toContain('2023-12');
    expect(degree?.text).toContain('2025-07');
    expect(degree?.text).not.toContain('Técnico en Desarrollo de Software');
  });

  it('prefers a named certificate over the formal degree', () => {
    const corpus = publishedCorpus(QA_LOCALE.ES);
    const retrieved = retrievePublishedChunks('ccna', corpus, QA_LOCALE.ES);

    expect(retrieved.length).toBeGreaterThan(0);
    expect(retrieved[0]?.text).toContain('Cisco Certified Network Associate (CCNA)');
    expect(retrieved[0]?.text).not.toContain('Gastón Dachary');
  });

  it('refuses a question the published corpus does not cover', () => {
    const corpus = publishedCorpus(QA_LOCALE.ES);
    expect(retrievePublishedChunks('precio del dólar mañana', corpus, QA_LOCALE.ES)).toEqual([]);
  });

  it('does not answer an English question from the Spanish corpus', () => {
    const corpus = publishedCorpus(QA_LOCALE.ES);
    expect(retrievePublishedChunks('what degree do you have', corpus, QA_LOCALE.EN)).toEqual([]);
  });
});

describe('retrieval battery on the real published snapshot', () => {
  const snapshot = buildPublishedSnapshot();

  it('answers a Spanish question about IA work (two-character token)', () => {
    const retrieved = retrievePublishedChunks('¿Laburás con IA?', snapshot.es, QA_LOCALE.ES);

    expect(retrieved.length).toBeGreaterThan(0);
    expect(retrieved.some((chunk) => /\bia\b|\binteligencia artificial\b/i.test(chunk.text))).toBe(
      true
    );
  });

  it('answers an English question about AI work', () => {
    const retrieved = retrievePublishedChunks('What AI work have you published?', snapshot.en, QA_LOCALE.EN);

    expect(retrieved.length).toBeGreaterThan(0);
  });

  it('matches singular corpus wording from a plural question', () => {
    const retrieved = retrievePublishedChunks('¿qué proyectos hiciste?', snapshot.es, QA_LOCALE.ES);

    expect(retrieved.length).toBeGreaterThan(0);
  });

  it('keeps vowel-final plurals on the same stem as their singular (pipelines/pipeline)', () => {
    const retrieved = retrievePublishedChunks(
      '¿qué pipelines procesan datos?',
      snapshot.es,
      QA_LOCALE.ES
    );

    expect(retrieved.length).toBeGreaterThan(0);
  });

  it('matches English service/services on the same stem', () => {
    const retrieved = retrievePublishedChunks(
      'Which services does the platform include?',
      snapshot.en,
      QA_LOCALE.EN
    );

    expect(retrieved.length).toBeGreaterThan(0);
  });

  it('matches tecnología wording from a stack question via synonyms', () => {
    const retrieved = retrievePublishedChunks('¿qué stack usaste?', snapshot.es, QA_LOCALE.ES);

    expect(retrieved.length).toBeGreaterThan(0);
  });

  it('keeps refusing fully off-corpus questions', () => {
    expect(retrievePublishedChunks('capital de Francia', snapshot.es, QA_LOCALE.ES)).toEqual([]);
  });
});

describe('published CV corpus', () => {
  it('quotes Consorcio and ghagga from the published CV, not GitHub', () => {
    const snapshot = buildPublishedSnapshot();
    const consorcio = snapshot.es.filter((chunk) =>
      chunk.text.toLowerCase().includes('consorcio canalero')
    );
    const ghagga = snapshot.es.filter((chunk) => chunk.text.toLowerCase().includes('ghagga'));

    expect(consorcio.length).toBeGreaterThan(0);
    expect(consorcio.every((chunk) => chunk.href === '/cv')).toBe(true);
    expect(consorcio.every((chunk) => chunk.kind === QA_KIND.CV_PROJECT)).toBe(true);
    expect(ghagga.length).toBeGreaterThan(0);
    expect(ghagga.every((chunk) => chunk.href === '/cv')).toBe(true);
  });
});
