import { env, type ProgressInfo, pipeline, TextStreamer } from '@huggingface/transformers';
import { extractAssistantText } from '@/lib/qa/local/assistant-text';
import { LOCAL_GENERATION, LOCAL_MODEL_ID } from '@/lib/qa/local/model';
import { ORT_ASYNCIFY_MJS, ORT_ASYNCIFY_WASM, ORT_PUBLIC_PATH } from '@/lib/qa/local/ort';
import { type MainToWorker, type WorkerToMain, workerErrorMessage } from '@/lib/qa/local/protocol';

interface WorkerScope {
  location: { origin: string };
  postMessage(message: WorkerToMain): void;
  onmessage: ((event: MessageEvent<MainToWorker>) => void) | null;
}

const scope = globalThis as unknown as WorkerScope;

interface LocalPipeline {
  tokenizer: ConstructorParameters<typeof TextStreamer>[0];
  (
    messages: Array<{ role: 'system' | 'user'; content: string }>,
    options: Record<string, unknown>
  ): Promise<unknown>;
  dispose(): Promise<void>;
}

let generator: LocalPipeline | null = null;

function post(message: WorkerToMain) {
  scope.postMessage(message);
}

/**
 * Point ONNX Runtime at the same-origin wasm pair and force one thread.
 * Multi-thread WASM needs cross-origin isolation, which this site does not
 * enable (Giscus and Analytics).
 */
function configureRuntime() {
  env.allowLocalModels = false;
  env.allowRemoteModels = true;
  env.useBrowserCache = true;
  const wasm = env.backends.onnx.wasm;
  if (!wasm) return;
  wasm.numThreads = 1;
  wasm.wasmPaths = {
    mjs: `${scope.location.origin}${ORT_PUBLIC_PATH}${ORT_ASYNCIFY_MJS}`,
    wasm: `${scope.location.origin}${ORT_PUBLIC_PATH}${ORT_ASYNCIFY_WASM}`,
  };
}

async function load(device: 'webgpu' | 'wasm', dtype: 'q4f16' | 'q4') {
  configureRuntime();
  const loaded = await pipeline('text-generation', LOCAL_MODEL_ID, {
    device,
    dtype,
    progress_callback: (info: ProgressInfo) => {
      if (info.status !== 'progress_total') return;
      post({ type: 'progress', progress: Math.round(info.progress) });
    },
  });
  generator = loaded as unknown as LocalPipeline;
  post({ type: 'ready' });
}

async function generate(system: string, question: string) {
  if (!generator) throw new Error('local model is not loaded');
  const active = generator;
  let streamed = '';
  const streamer = new TextStreamer(active.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: (text) => {
      if (!text) return;
      streamed += text;
      post({ type: 'token', text });
    },
  });
  const output = await active(
    [
      { role: 'system', content: system },
      { role: 'user', content: question },
    ],
    {
      max_new_tokens: LOCAL_GENERATION.maxNewTokens,
      do_sample: true,
      temperature: LOCAL_GENERATION.temperature,
      top_k: LOCAL_GENERATION.topK,
      repetition_penalty: LOCAL_GENERATION.repetitionPenalty,
      tokenizer_encode_kwargs: { enable_thinking: false },
      streamer,
    }
  );
  const text = extractAssistantText(output) || streamed.trim();
  if (!text) throw new Error('empty local answer');
  post({ type: 'done', text });
}

scope.onmessage = (event) => {
  const message = event.data;
  const task =
    message.type === 'load'
      ? load(message.device, message.dtype)
      : generate(message.system, message.question);
  task.catch((error: unknown) => {
    post({ type: 'error', message: workerErrorMessage(error) });
  });
};
