export {
  assembleCorpus,
  toCorpusProject,
  toCvProjectRecord,
  toEducationRecord,
} from '@/lib/qa/chunk';
export type { PublishedQaPathContext, PublishedQaPathKind } from '@/lib/qa/path';
export { parsePublishedQaPath } from '@/lib/qa/path';
export {
  QA_GREETING,
  QA_NO_EVIDENCE,
  QA_UNAVAILABLE,
  retrievePublishedChunks,
} from '@/lib/qa/retrieve';
export type { PublishedSnapshot, PublishedSnapshotInput } from '@/lib/qa/snapshot';
export { buildPublishedSnapshot } from '@/lib/qa/snapshot';
export { isGreeting } from '@/lib/qa/text';
export type {
  CaseStudySource,
  CorpusInput,
  CorpusProject,
  CorpusReadme,
  CvProjectRecord,
  CvProjectSource,
  EducationRecord,
  EducationSource,
  QaChunk,
  QaKind,
  QaLocale,
} from '@/lib/qa/types';
export { QA_KIND, QA_LOCALE } from '@/lib/qa/types';
