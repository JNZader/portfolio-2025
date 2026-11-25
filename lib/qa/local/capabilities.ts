import {
  LOCAL_CACHE_NAME,
  LOCAL_DOWNLOAD_LABEL,
  LOCAL_MODEL_ID,
  type LocalDevice,
  type LocalDtype,
} from '@/lib/qa/local/model';

export interface SupportedLocalBackend {
  supported: true;
  device: LocalDevice;
  dtype: LocalDtype;
  downloadLabel: string;
}

export type LocalProbe = SupportedLocalBackend | { supported: false };

interface GpuAdapterLike {
  features: { has(name: string): boolean };
}

interface GpuLike {
  requestAdapter(): Promise<GpuAdapterLike | null>;
}

function readGpu(nav: Navigator): GpuLike | null {
  const candidate = (nav as Navigator & { gpu?: GpuLike }).gpu;
  if (!candidate || typeof candidate.requestAdapter !== 'function') return null;
  return candidate;
}

function deviceMemoryGb(nav: Navigator): number | null {
  const value = (nav as Navigator & { deviceMemory?: number }).deviceMemory;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * Single-thread WASM of a 1.7B model needs several GB. `deviceMemory` is
 * missing on Firefox, so those browsers may still try and fall back on error.
 * Below 8 GB the download is skipped.
 */
export function wasmFallbackFeasible(nav: Navigator = navigator): boolean {
  if (typeof WebAssembly === 'undefined') return false;
  const memory = deviceMemoryGb(nav);
  if (memory !== null && memory < 8) return false;
  return true;
}

/**
 * Prefer WebGPU q4f16 when `shader-f16` is present. Without f16, the q4
 * graph (fp32 activations) still runs on WebGPU. WASM q4 is the last resort
 * and stays single-threaded because the site does not send COOP/COEP.
 */
export async function probeLocalBackend(nav: Navigator = navigator): Promise<LocalProbe> {
  const gpu = readGpu(nav);
  if (gpu) {
    try {
      const adapter = await gpu.requestAdapter();
      if (adapter) {
        if (adapter.features.has('shader-f16')) {
          return {
            supported: true,
            device: 'webgpu',
            dtype: 'q4f16',
            downloadLabel: LOCAL_DOWNLOAD_LABEL.q4f16,
          };
        }
        return {
          supported: true,
          device: 'webgpu',
          dtype: 'q4',
          downloadLabel: LOCAL_DOWNLOAD_LABEL.q4,
        };
      }
    } catch {
      // Fall through to the WASM check.
    }
  }

  if (!wasmFallbackFeasible(nav)) return { supported: false };
  return {
    supported: true,
    device: 'wasm',
    dtype: 'q4',
    downloadLabel: LOCAL_DOWNLOAD_LABEL.q4,
  };
}

function weightFile(dtype: LocalDtype): string {
  return dtype === 'q4f16' ? 'onnx/model_q4f16.onnx_data' : 'onnx/model_q4.onnx_data';
}

export function isCachedModelUrl(url: string, dtype: LocalDtype): boolean {
  return url.includes(LOCAL_MODEL_ID) && url.includes(weightFile(dtype));
}

/** True when the transformers.js Cache API already holds this dtype's weights. */
export async function isModelCached(dtype: LocalDtype): Promise<boolean> {
  if (typeof caches === 'undefined') return false;
  try {
    const names = await caches.keys();
    if (!names.includes(LOCAL_CACHE_NAME)) return false;
    const cache = await caches.open(LOCAL_CACHE_NAME);
    const keys = await cache.keys();
    return keys.some((request) => isCachedModelUrl(request.url, dtype));
  } catch {
    return false;
  }
}
