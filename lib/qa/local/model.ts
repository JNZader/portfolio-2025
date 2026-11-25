/**
 * In-browser engine for the opt-in local chat.
 *
 * Transformers.js 4.3.2 runs `onnx-community/LFM3-1.7B-ONNX`. That release
 * added LFM3 and is the version the model card documents. WebLLM
 * (`mlc-ai/LFM3-1.7B-q4f16_1-MLC`) would be a second runtime and typically
 * wants SharedArrayBuffer threads, which need COOP and COEP on every
 * response. Those headers break Giscus and Vercel Analytics, so they stay
 * off and WebLLM stays out.
 *
 * Weights stay on Hugging Face and are cached by the browser (Cache API,
 * key `transformers-cache`). They are not vendored here. License: LFM Open
 * License 1.0.
 */
export const LOCAL_MODEL_ID = 'onnx-community/LFM3-1.7B-ONNX';

export const LOCAL_CACHE_NAME = 'transformers-cache';

/** q4f16 weights observed on the Hub (`model_q4f16.onnx_data`, ~1.01 GiB). */
export const LOCAL_DOWNLOAD_LABEL = {
  q4f16: '~1 GB',
  q4: '~1.2 GB',
} as const;

/**
 * Grounded answers are short. Thinking stays off via the chat template.
 * Temperature sits in the low band the model card recommends for this task.
 */
export const LOCAL_GENERATION = {
  maxNewTokens: 320,
  temperature: 0.2,
  topK: 50,
  repetitionPenalty: 1.1,
} as const;

export type LocalDevice = 'webgpu' | 'wasm';
export type LocalDtype = 'q4f16' | 'q4';
