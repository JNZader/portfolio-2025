import { describe, expect, it } from 'vitest';
import { activeLocalModelId, LOCAL_MODEL_ID, STAGED_SMALL_MODEL } from '@/lib/qa/local/model';
import { readSmallModelConfig } from '@/lib/qa/local/small-model';

describe('staged small model', () => {
  it('keeps the in-browser engine on LFM3', () => {
    expect(activeLocalModelId()).toBe(LOCAL_MODEL_ID);
    expect(activeLocalModelId()).toBe('onnx-community/LFM3-1.7B-ONNX');
  });

  it('reads the staged LFM2.5 config without selecting it', () => {
    expect(STAGED_SMALL_MODEL.id).toBe('JNZader/portfolio-chat-lfm2.5-350m-ONNX');
    expect(STAGED_SMALL_MODEL.baseModel).toBe('LiquidAI/LFM2.5-350M');
    expect(STAGED_SMALL_MODEL.dtype).toBe('q4f16');
    expect(STAGED_SMALL_MODEL.revision).toBe('main');
    expect(STAGED_SMALL_MODEL.publishedAt).toBeNull();
    expect(STAGED_SMALL_MODEL.id).not.toBe(activeLocalModelId());
  });

  it('rejects a dtype the browser loader does not know', () => {
    expect(() =>
      readSmallModelConfig({
        id: 'org/model',
        revision: 'main',
        dtype: 'fp32',
        baseModel: 'LiquidAI/LFM2.5-350M',
        publishedAt: null,
      })
    ).toThrow(/dtype/);
  });
});
