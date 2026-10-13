import { apigen } from '@/lib/data/case-studies/apigen';
import { apigenStudio } from '@/lib/data/case-studies/apigen-studio';
import { biogasPlatform } from '@/lib/data/case-studies/biogas-platform';
import resumeEn from '@/lib/data/resume.en.json';
import resumeEs from '@/lib/data/resume.json';
import {
  assembleCorpus,
  toCorpusProject,
  toCvProjectRecord,
  toEducationRecord,
} from '@/lib/qa/chunk';
import {
  type CorpusProject,
  type CorpusReadme,
  QA_LOCALE,
  type QaChunk,
  type QaLocale,
} from '@/lib/qa/types';

const LOCAL_CASE_STUDIES = [apigen, apigenStudio, biogasPlatform] as const;

export interface PublishedSnapshotInput {
  readmes?: readonly CorpusReadme[];
  projects?: readonly CorpusProject[];
}

export interface PublishedSnapshot {
  es: QaChunk[];
  en: QaChunk[];
}

function educationFor(locale: QaLocale) {
  const source = locale === QA_LOCALE.EN ? resumeEn.education : resumeEs.education;
  return source.map((entry) => toEducationRecord(entry));
}

function projectsFor(locale: QaLocale, extra: readonly CorpusProject[]): CorpusProject[] {
  return [...LOCAL_CASE_STUDIES.map((project) => toCorpusProject(project, locale)), ...extra];
}

function resumeFor(locale: QaLocale) {
  return locale === QA_LOCALE.EN ? resumeEn : resumeEs;
}

function corpusFor(locale: QaLocale, input?: PublishedSnapshotInput): QaChunk[] {
  const resume = resumeFor(locale);
  return assembleCorpus({
    locale,
    projects: projectsFor(locale, input?.projects ?? []),
    education: educationFor(locale),
    readmes: input?.readmes,
    summary: resume.summary,
    cvProjects: resume.projects.map(toCvProjectRecord),
  });
}

/** Build-time corpus for both locales. No GitHub, no HTTP. */
export function buildPublishedSnapshot(input?: PublishedSnapshotInput): PublishedSnapshot {
  return {
    es: corpusFor(QA_LOCALE.ES, input),
    en: corpusFor(QA_LOCALE.EN, input),
  };
}
