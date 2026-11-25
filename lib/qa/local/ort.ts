/**
 * Same-origin ONNX Runtime glue copied from `onnxruntime-web` at build time.
 * Transformers.js would otherwise fetch these from cdn.jsdelivr.net.
 * The webgpu build of ORT 1.31 loads the asyncify pair.
 */
export const ORT_PUBLIC_PATH = '/ort/';
export const ORT_ASYNCIFY_MJS = 'ort-wasm-simd-threaded.asyncify.mjs';
export const ORT_ASYNCIFY_WASM = 'ort-wasm-simd-threaded.asyncify.wasm';
