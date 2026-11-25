import type { LocalEngine } from '@/lib/qa/local/contract';
import type { WorkerToMain } from '@/lib/qa/local/protocol';

export type { LocalEngine };

const LOAD_TIMEOUT_MS = 10 * 60 * 1000;
const GENERATE_TIMEOUT_MS = 3 * 60 * 1000;

/**
 * The worker module (and Transformers.js) is only pulled in when this
 * function runs. Keep the call site a dynamic import.
 */
export function createLocalEngine(): LocalEngine {
  // Classic worker: webpack loads Transformers.js with importScripts, which
  // module workers are not allowed to call.
  const worker = new Worker(new URL('./local-qa.worker.ts', import.meta.url));
  let settled = false;

  let pendingLoad: {
    resolve: () => void;
    reject: (error: Error) => void;
    onProgress: (progress: number) => void;
    timer: ReturnType<typeof setTimeout>;
  } | null = null;
  let pendingGenerate: {
    resolve: (text: string) => void;
    reject: (error: Error) => void;
    onToken: (text: string) => void;
    timer: ReturnType<typeof setTimeout>;
  } | null = null;

  function fail(error: Error) {
    const load = pendingLoad;
    const generate = pendingGenerate;
    pendingLoad = null;
    pendingGenerate = null;
    if (load) {
      clearTimeout(load.timer);
      load.reject(error);
    }
    if (generate) {
      clearTimeout(generate.timer);
      generate.reject(error);
    }
  }

  worker.onmessage = (event: MessageEvent<WorkerToMain>) => {
    const data = event.data;
    if (data.type === 'progress') {
      pendingLoad?.onProgress(data.progress);
      return;
    }
    if (data.type === 'ready' && pendingLoad) {
      clearTimeout(pendingLoad.timer);
      const resolve = pendingLoad.resolve;
      pendingLoad = null;
      resolve();
      return;
    }
    if (data.type === 'token') {
      pendingGenerate?.onToken(data.text);
      return;
    }
    if (data.type === 'done' && pendingGenerate) {
      clearTimeout(pendingGenerate.timer);
      const resolve = pendingGenerate.resolve;
      pendingGenerate = null;
      resolve(data.text);
      return;
    }
    if (data.type === 'error') {
      fail(new Error(data.message));
    }
  };

  worker.onerror = () => {
    fail(new Error('local worker failed'));
  };

  return {
    load({ device, dtype, onProgress }) {
      if (settled) return Promise.reject(new Error('local engine disposed'));
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          fail(new Error('local model load timed out'));
        }, LOAD_TIMEOUT_MS);
        pendingLoad = { resolve, reject, onProgress, timer };
        worker.postMessage({ type: 'load', device, dtype });
      });
    },
    generate({ system, question, onToken }) {
      if (settled) return Promise.reject(new Error('local engine disposed'));
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          fail(new Error('local generation timed out'));
        }, GENERATE_TIMEOUT_MS);
        pendingGenerate = { resolve, reject, onToken, timer };
        worker.postMessage({ type: 'generate', system, question });
      });
    },
    dispose() {
      if (settled) return;
      settled = true;
      fail(new Error('local engine disposed'));
      worker.terminate();
    },
  };
}
