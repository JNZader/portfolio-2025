'use client';

import { useCallback, useReducer, useRef, useState } from 'react';
import { isModelCached, probeLocalBackend } from '@/lib/qa/local/capabilities';
import type { LocalEngine } from '@/lib/qa/local/contract';
import {
  INITIAL_LOCAL_SESSION,
  isLocalSwitchOn,
  localNotice,
  reduceLocalSession,
  shouldAnswerLocally,
} from '@/lib/qa/local/session';

export interface LocalTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources: Array<{ title: string; href: string; citation: string }>;
}

export interface LocalAskContext {
  locale: string;
  path: string;
  priorQuery: string | null;
}

function disposed(error: unknown): boolean {
  return error instanceof Error && error.message === 'local engine disposed';
}

/**
 * Opt-in local chat. The engine module is imported only after the visitor
 * confirms the download (or the weights are already in the Cache API).
 */
export function useLocalQa() {
  const [session, dispatch] = useReducer(reduceLocalSession, INITIAL_LOCAL_SESSION);
  const sessionRef = useRef(session);
  const engineRef = useRef<LocalEngine | null>(null);
  const runRef = useRef(0);
  const [turns, setTurns] = useState<LocalTurn[]>([]);
  const [pending, setPending] = useState(false);

  sessionRef.current = session;

  const disposeEngine = useCallback(() => {
    runRef.current += 1;
    engineRef.current?.dispose();
    engineRef.current = null;
  }, []);

  const loadEngine = useCallback(
    async (gen: number, device: 'webgpu' | 'wasm', dtype: 'q4f16' | 'q4') => {
      try {
        const { createLocalEngine } = await import('@/lib/qa/local/engine');
        if (gen !== runRef.current) return;
        const engine = createLocalEngine();
        engineRef.current = engine;
        await engine.load({
          device,
          dtype,
          onProgress: (progress) => {
            if (gen !== runRef.current) return;
            dispatch({ type: 'progress', progress });
          },
        });
        if (gen !== runRef.current) {
          engine.dispose();
          return;
        }
        dispatch({ type: 'ready' });
      } catch (error) {
        if (gen !== runRef.current || disposed(error)) return;
        engineRef.current?.dispose();
        engineRef.current = null;
        dispatch({ type: 'load-error' });
      }
    },
    []
  );

  const toggle = useCallback(() => {
    if (isLocalSwitchOn(sessionRef.current)) {
      disposeEngine();
      dispatch({ type: 'toggle-off' });
      return;
    }
    const gen = runRef.current + 1;
    runRef.current = gen;
    dispatch({ type: 'toggle-on' });
    void (async () => {
      const capability = await probeLocalBackend();
      if (gen !== runRef.current) return;
      if (!capability.supported) {
        dispatch({ type: 'probe-unsupported' });
        return;
      }
      const cached = await isModelCached(capability.dtype);
      if (gen !== runRef.current) return;
      dispatch({
        type: 'probe-ready',
        device: capability.device,
        dtype: capability.dtype,
        downloadLabel: capability.downloadLabel,
        cached,
      });
      if (cached) void loadEngine(gen, capability.device, capability.dtype);
    })();
  }, [disposeEngine, loadEngine]);

  const confirm = useCallback(() => {
    const current = sessionRef.current;
    if (current.phase !== 'confirm' || !current.device || !current.dtype) return;
    dispatch({ type: 'confirm' });
    void loadEngine(runRef.current, current.device, current.dtype);
  }, [loadEngine]);

  const cancel = useCallback(() => {
    disposeEngine();
    dispatch({ type: 'toggle-off' });
  }, [disposeEngine]);

  const ask = useCallback(
    async (query: string, context: LocalAskContext): Promise<'handled' | 'fallback'> => {
      if (!shouldAnswerLocally(sessionRef.current)) return 'fallback';
      const engine = engineRef.current;
      if (!engine) {
        dispatch({ type: 'generation-error' });
        return 'fallback';
      }

      const userId = crypto.randomUUID();
      const assistantId = crypto.randomUUID();
      setPending(true);
      setTurns((current) => [
        ...current,
        { id: userId, role: 'user', text: query, sources: [] },
        { id: assistantId, role: 'assistant', text: '', sources: [] },
      ]);

      try {
        const { runLocalAnswer } = await import('@/lib/qa/local/run');
        const result = await runLocalAnswer({
          engine,
          query,
          priorQuery: context.priorQuery,
          locale: context.locale,
          path: context.path,
          onToken: (text) => {
            setTurns((current) =>
              current.map((turn) =>
                turn.id === assistantId ? { ...turn, text: turn.text + text } : turn
              )
            );
          },
        });
        setTurns((current) =>
          current.map((turn) =>
            turn.id === assistantId ? { ...turn, text: result.text, sources: result.sources } : turn
          )
        );
        return 'handled';
      } catch (error) {
        setTurns((current) =>
          current.filter((turn) => turn.id !== userId && turn.id !== assistantId)
        );
        if (!disposed(error)) {
          dispatch({ type: 'generation-error' });
          disposeEngine();
        }
        return 'fallback';
      } finally {
        setPending(false);
      }
    },
    [disposeEngine]
  );

  return {
    session,
    turns,
    pending,
    switchOn: isLocalSwitchOn(session),
    notice: localNotice(session),
    toggle,
    confirm,
    cancel,
    ask,
  };
}
