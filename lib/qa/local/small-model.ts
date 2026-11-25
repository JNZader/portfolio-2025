import raw from '@/lib/qa/local/small-model.json';

export const SMALL_MODEL_DTYPES = ['q4', 'q4f16'] as const;

export type SmallModelDtype = (typeof SMALL_MODEL_DTYPES)[number];

/** Revision the retrain workflow bumps. The local engine does not load it yet. */
export interface SmallModelConfig {
  id: string;
  revision: string;
  dtype: SmallModelDtype;
  baseModel: string;
  publishedAt: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function readSmallModelConfig(value: unknown): SmallModelConfig {
  if (!isRecord(value)) throw new Error('small model config must be an object');
  const { id, revision, dtype, baseModel, publishedAt } = value;
  if (typeof id !== 'string' || id.length === 0) throw new Error('small model id is required');
  if (typeof revision !== 'string' || revision.length === 0) {
    throw new Error('small model revision is required');
  }
  if (dtype !== 'q4' && dtype !== 'q4f16') throw new Error('small model dtype must be q4 or q4f16');
  if (typeof baseModel !== 'string' || baseModel.length === 0) {
    throw new Error('small model baseModel is required');
  }
  if (publishedAt !== null && typeof publishedAt !== 'string') {
    throw new Error('small model publishedAt must be a string or null');
  }
  return { id, revision, dtype, baseModel, publishedAt };
}

export const STAGED_SMALL_MODEL = readSmallModelConfig(raw);
