import { describe, expect, it, vi } from 'vitest';
import {
  isCachedModelUrl,
  isModelCached,
  probeLocalBackend,
  wasmFallbackFeasible,
} from '@/lib/qa/local/capabilities';

function navigatorWith(gpu: unknown, deviceMemory?: number): Navigator {
  return { gpu, deviceMemory } as unknown as Navigator;
}

describe('probeLocalBackend', () => {
  it('selects q4f16 on WebGPU when shader-f16 is available', async () => {
    const nav = navigatorWith({
      requestAdapter: async () => ({ features: { has: (name: string) => name === 'shader-f16' } }),
    });

    await expect(probeLocalBackend(nav)).resolves.toEqual({
      supported: true,
      device: 'webgpu',
      dtype: 'q4f16',
      downloadLabel: '~1 GB',
    });
  });

  it('selects q4 on WebGPU when f16 is missing', async () => {
    const nav = navigatorWith({
      requestAdapter: async () => ({ features: { has: () => false } }),
    });

    await expect(probeLocalBackend(nav)).resolves.toMatchObject({
      supported: true,
      device: 'webgpu',
      dtype: 'q4',
      downloadLabel: '~1.2 GB',
    });
  });

  it('uses single-thread WASM only when WebGPU is missing and memory allows it', async () => {
    const nav = navigatorWith(undefined, 8);

    await expect(probeLocalBackend(nav)).resolves.toMatchObject({
      supported: true,
      device: 'wasm',
      dtype: 'q4',
    });
    expect(wasmFallbackFeasible(nav)).toBe(true);
  });

  it('refuses WASM on a low-memory device and keeps the cloud path', async () => {
    const nav = navigatorWith(undefined, 4);

    await expect(probeLocalBackend(nav)).resolves.toEqual({ supported: false });
    expect(wasmFallbackFeasible(nav)).toBe(false);
  });

  it('falls through to WASM when requestAdapter throws', async () => {
    const nav = navigatorWith(
      {
        requestAdapter: async () => {
          throw new Error('gpu reset');
        },
      },
      8
    );

    await expect(probeLocalBackend(nav)).resolves.toMatchObject({ device: 'wasm' });
  });
});

describe('isCachedModelUrl', () => {
  it('matches the q4f16 weight file and not the q4 file', () => {
    const q4f16 =
      'https://huggingface.co/onnx-community/LFM3-1.7B-ONNX/resolve/main/onnx/model_q4f16.onnx_data';
    const q4 =
      'https://huggingface.co/onnx-community/LFM3-1.7B-ONNX/resolve/main/onnx/model_q4.onnx_data';

    expect(isCachedModelUrl(q4f16, 'q4f16')).toBe(true);
    expect(isCachedModelUrl(q4f16, 'q4')).toBe(false);
    expect(isCachedModelUrl(q4, 'q4')).toBe(true);
    expect(isCachedModelUrl('https://example.com/model_q4f16.onnx_data', 'q4f16')).toBe(false);
  });
});

describe('isModelCached', () => {
  it('reports a hit only when the transformers cache holds the weight file', async () => {
    vi.stubGlobal('caches', {
      keys: async () => ['transformers-cache'],
      open: async () => ({
        keys: async () => [
          new Request(
            'https://huggingface.co/onnx-community/LFM3-1.7B-ONNX/resolve/main/onnx/model_q4f16.onnx_data'
          ),
        ],
      }),
    });

    try {
      await expect(isModelCached('q4f16')).resolves.toBe(true);
      await expect(isModelCached('q4')).resolves.toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
