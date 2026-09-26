export { assembleCorpus, toCorpusProject, toEducationRecord } from '@/lib/qa/chunk';
export { matchQuery } from '@/lib/qa/match';
export type { PublishedQaPathContext, PublishedQaPathKind } from '@/lib/qa/path';
export { parsePublishedQaPath } from '@/lib/qa/path';
export { QA_GREETING, QA_NO_EVIDENCE, retrievePublishedChunks } from '@/lib/qa/retrieve';
export type { PublishedSnapshot, PublishedSnapshotInput } from '@/lib/qa/snapshot';
export { buildPublishedSnapshot } from '@/lib/qa/snapshot';
export { isGreeting } from '@/lib/qa/text';
export type {
  CaseStudySource,
  CorpusInput,
  CorpusProject,
  CorpusReadme,
  EducationRecord,
  EducationSource,
  QaChunk,
  QaHit,
  QaKind,
  QaLocale,
  QaMatch,
  QaMatchStatus,
  QaRefusal,
} from '@/lib/qa/types';
export { QA_KIND, QA_LOCALE, QA_MATCH_STATUS } from '@/lib/qa/types';
