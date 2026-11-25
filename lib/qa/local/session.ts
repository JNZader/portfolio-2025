import type { LocalDevice, LocalDtype } from '@/lib/qa/local/model';

export type LocalPhase = 'off' | 'probing' | 'confirm' | 'loading' | 'ready';

export interface LocalSession {
  phase: LocalPhase;
  progress: number;
  degraded: boolean;
  unsupported: boolean;
  cached: boolean;
  device: LocalDevice | null;
  dtype: LocalDtype | null;
  downloadLabel: string | null;
}

export const INITIAL_LOCAL_SESSION: LocalSession = {
  phase: 'off',
  progress: 0,
  degraded: false,
  unsupported: false,
  cached: false,
  device: null,
  dtype: null,
  downloadLabel: null,
};

export type LocalEvent =
  | { type: 'toggle-on' }
  | { type: 'toggle-off' }
  | { type: 'probe-unsupported' }
  | {
      type: 'probe-ready';
      device: LocalDevice;
      dtype: LocalDtype;
      downloadLabel: string;
      cached: boolean;
    }
  | { type: 'confirm' }
  | { type: 'progress'; progress: number }
  | { type: 'ready' }
  | { type: 'load-error' }
  | { type: 'generation-error' };

function clampProgress(progress: number): number {
  if (!Number.isFinite(progress)) return 0;
  return Math.max(0, Math.min(100, Math.round(progress)));
}

export function reduceLocalSession(state: LocalSession, event: LocalEvent): LocalSession {
  switch (event.type) {
    case 'toggle-on':
      if (state.phase !== 'off') return state;
      return { ...INITIAL_LOCAL_SESSION, phase: 'probing' };
    case 'toggle-off':
      return { ...INITIAL_LOCAL_SESSION };
    case 'probe-unsupported':
      if (state.phase !== 'probing') return state;
      return { ...INITIAL_LOCAL_SESSION, unsupported: true };
    case 'probe-ready':
      if (state.phase !== 'probing') return state;
      return {
        ...INITIAL_LOCAL_SESSION,
        phase: event.cached ? 'loading' : 'confirm',
        device: event.device,
        dtype: event.dtype,
        downloadLabel: event.downloadLabel,
        cached: event.cached,
      };
    case 'confirm':
      if (state.phase !== 'confirm' || !state.device || !state.dtype) return state;
      return { ...state, phase: 'loading', progress: 0 };
    case 'progress':
      if (state.phase !== 'loading') return state;
      return { ...state, progress: Math.max(state.progress, clampProgress(event.progress)) };
    case 'ready':
      if (state.phase !== 'loading') return state;
      return { ...state, phase: 'ready', progress: 100, degraded: false };
    case 'load-error':
      if (state.phase !== 'loading' && state.phase !== 'probing') return state;
      return { ...INITIAL_LOCAL_SESSION, degraded: true };
    case 'generation-error':
      if (state.phase !== 'ready') return state;
      return { ...INITIAL_LOCAL_SESSION, degraded: true };
    default:
      return state;
  }
}

export function isLocalSwitchOn(state: LocalSession): boolean {
  return state.phase !== 'off';
}

/** Local generation only after a successful load, and not after a fallback. */
export function shouldAnswerLocally(state: LocalSession): boolean {
  return state.phase === 'ready';
}

export function localNotice(state: LocalSession): 'fallback' | 'unsupported' | null {
  if (state.unsupported) return 'unsupported';
  if (state.degraded) return 'fallback';
  return null;
}
