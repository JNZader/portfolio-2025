import type { LocalDevice, LocalDtype } from '@/lib/qa/local/model';

export type MainToWorker =
  | { type: 'load'; device: LocalDevice; dtype: LocalDtype }
  | { type: 'generate'; system: string; question: string };

export type WorkerToMain =
  | { type: 'progress'; progress: number }
  | { type: 'ready' }
  | { type: 'token'; text: string }
  | { type: 'done'; text: string }
  | { type: 'error'; message: string };

export function workerErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message.slice(0, 300);
  return 'local model failed';
}
