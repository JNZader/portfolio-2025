import type { PortableTextBlock } from 'sanity';
import {
  type CaseStudySource,
  type CorpusInput,
  type CorpusProject,
  type CorpusReadme,
  type EducationRecord,
  type EducationSource,
  QA_KIND,
  QA_LOCALE,
  type QaChunk,
  type QaLocale,
} from '@/lib/qa/types';
import { localizedPath } from '@/lib/seo/locale-url';

interface ReadBlock {
  heading: string | null;
  listItem: boolean;
  text: string;
}

interface DraftSection {
  heading: string | null;
  lines: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readBlock(block: PortableTextBlock): ReadBlock {
  const record = block as unknown as Record<string, unknown>;
  const type = typeof record._type === 'string' ? record._type : '';
  if (type === 'mermaid') {
    const caption = typeof record.caption === 'string' ? record.caption.trim() : '';
    return { heading: null, listItem: false, text: caption };
  }

  const style = typeof record.style === 'string' ? record.style : '';
  const children = Array.isArray(record.children) ? record.children : [];
  const text = children
    .map((child) => {
      if (!isRecord(child) || typeof child.text !== 'string') return '';
      return child.text;
    })
    .join('')
    .trim();

  return {
    heading: /^h[1-6]$/.test(style) ? text : null,
    listItem: typeof record.listItem === 'string',
    text,
  };
}

function hasProse(blocks: readonly PortableTextBlock[]): boolean {
  return blocks.some((block) => readBlock(block).text.length > 0);
}

export function toCorpusProject(project: CaseStudySource, locale: QaLocale): CorpusProject {
  const english = locale === QA_LOCALE.EN;
  return {
    slug: project.slug.current,
    title: project.title,
    lead: english ? (project.excerptEn ?? '') : project.excerpt,
    body: english ? (project.bodyEn ?? []) : (project.body ?? []),
  };
}

export function toEducationRecord(entry: EducationSource): EducationRecord {
  return {
    institution: entry.institution,
    degree: entry.degree,
    location: entry.location,
    startDate: entry.startDate,
    endDate: entry.endDate,
    details: entry.details ?? [],
  };
}

function sectionText(heading: string | null, lines: readonly string[]): string {
  return [heading, ...lines]
    .filter((line) => line && line.trim().length > 0)
    .join('\n')
    .trim();
}

function chunkProse(
  project: CorpusProject,
  locale: QaLocale,
  kind: typeof QA_KIND.CASE_STUDY | typeof QA_KIND.README
): QaChunk[] {
  const drafts: DraftSection[] = [{ heading: null, lines: [] }];

  for (const block of project.body) {
    const read = readBlock(block);
    if (read.heading !== null) {
      if (read.text.length > 0) drafts.push({ heading: read.text, lines: [] });
      continue;
    }
    if (read.text.length === 0) continue;
    const line = read.listItem ? `- ${read.text}` : read.text;
    drafts[drafts.length - 1]?.lines.push(line);
  }

  const href = localizedPath(`/proyectos/${project.slug}`, locale);
  const chunks: QaChunk[] = [];

  drafts.forEach((draft, index) => {
    const lines =
      index === 0 && project.lead.trim() ? [project.lead.trim(), ...draft.lines] : draft.lines;
    const text = sectionText(draft.heading, lines);
    if (!text) return;
    chunks.push({
      id: `${locale}:${kind}:${project.slug}:${chunks.length}`,
      locale,
      kind,
      slug: project.slug,
      title: project.title,
      heading: draft.heading,
      text,
      href,
      citation: draft.heading ? `${project.title} — ${draft.heading}` : project.title,
    });
  });

  return chunks;
}

function chunkReadme(project: CorpusProject, readme: CorpusReadme, locale: QaLocale): QaChunk[] {
  const withoutFences = readme.text.replace(/```[\s\S]*?```/g, '');
  const drafts: DraftSection[] = [{ heading: null, lines: [] }];

  for (const line of withoutFences.split('\n')) {
    const heading = /^(#{1,3})\s+(.+)$/.exec(line.trim());
    if (heading?.[2]) {
      drafts.push({ heading: heading[2].trim(), lines: [] });
      continue;
    }
    const trimmed = line.trim();
    if (trimmed.length > 0) drafts[drafts.length - 1]?.lines.push(trimmed);
  }

  const href = localizedPath(`/proyectos/${project.slug}`, locale);
  const chunks: QaChunk[] = [];
  const lead = project.lead.trim();

  drafts.forEach((draft, index) => {
    const lines = index === 0 && lead ? [lead, ...draft.lines] : draft.lines;
    const text = sectionText(draft.heading, lines);
    if (!text) return;
    const citation = draft.heading ? `${readme.citation} — ${draft.heading}` : readme.citation;
    chunks.push({
      id: `${locale}:${QA_KIND.README}:${project.slug}:${chunks.length}`,
      locale,
      kind: QA_KIND.README,
      slug: project.slug,
      title: project.title,
      heading: draft.heading,
      text,
      href,
      citation,
    });
  });

  return chunks;
}

function educationText(record: EducationRecord): string {
  return [
    record.institution,
    record.degree,
    record.location,
    `${record.startDate} – ${record.endDate}`,
    ...record.details,
  ]
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');
}

function chunkEducation(record: EducationRecord, locale: QaLocale, index: number): QaChunk {
  const slug = `${record.institution} ${record.degree}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    id: `${locale}:${QA_KIND.EDUCATION}:${slug}:${index}`,
    locale,
    kind: QA_KIND.EDUCATION,
    slug,
    title: record.institution,
    heading: record.degree,
    text: educationText(record),
    href: localizedPath('/cv', locale),
    citation: `${record.institution} — ${record.degree}`,
  };
}

/**
 * Published corpus for one locale.
 * A project with case-study prose keeps that prose and drops any README
 * passed for the same slug. English does not fall back to the Spanish body.
 */
export function assembleCorpus(input: CorpusInput): QaChunk[] {
  const readmes = new Map((input.readmes ?? []).map((readme) => [readme.slug, readme]));
  const chunks: QaChunk[] = [];

  for (const project of input.projects) {
    if (hasProse(project.body)) {
      chunks.push(...chunkProse(project, input.locale, QA_KIND.CASE_STUDY));
      continue;
    }
    const readme = readmes.get(project.slug);
    if (readme) chunks.push(...chunkReadme(project, readme, input.locale));
  }

  input.education.forEach((record, index) => {
    chunks.push(chunkEducation(record, input.locale, index));
  });

  return chunks;
}
