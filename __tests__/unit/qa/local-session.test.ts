import { describe, expect, it } from 'vitest';
import {
  INITIAL_LOCAL_SESSION,
  isLocalSwitchOn,
  localNotice,
  reduceLocalSession,
  shouldAnswerLocally,
} from '@/lib/qa/local/session';

const probed = {
  type: 'probe-ready' as const,
  device: 'webgpu' as const,
  dtype: 'q4f16' as const,
  downloadLabel: '~1 GB',
  cached: false,
};

describe('local mode session', () => {
  it('stays off until the visitor opts in', () => {
    expect(isLocalSwitchOn(INITIAL_LOCAL_SESSION)).toBe(false);
    expect(shouldAnswerLocally(INITIAL_LOCAL_SESSION)).toBe(false);
    expect(localNotice(INITIAL_LOCAL_SESSION)).toBeNull();
  });

  it('asks for confirmation before a download', () => {
    const probing = reduceLocalSession(INITIAL_LOCAL_SESSION, { type: 'toggle-on' });
    const confirm = reduceLocalSession(probing, probed);

    expect(probing.phase).toBe('probing');
    expect(confirm.phase).toBe('confirm');
    expect(confirm.downloadLabel).toBe('~1 GB');
    expect(shouldAnswerLocally(confirm)).toBe(false);
    expect(isLocalSwitchOn(confirm)).toBe(true);
  });

  it('starts loading only after confirmation', () => {
    const confirm = reduceLocalSession(
      reduceLocalSession(INITIAL_LOCAL_SESSION, { type: 'toggle-on' }),
      probed
    );
    const ignored = reduceLocalSession(INITIAL_LOCAL_SESSION, { type: 'confirm' });
    const loading = reduceLocalSession(confirm, { type: 'confirm' });
    const progressed = reduceLocalSession(loading, { type: 'progress', progress: 40 });
    const ready = reduceLocalSession(progressed, { type: 'ready' });

    expect(ignored.phase).toBe('off');
    expect(loading.phase).toBe('loading');
    expect(progressed.progress).toBe(40);
    expect(shouldAnswerLocally(ready)).toBe(true);
  });

  it('skips confirmation when the weights are already cached', () => {
    const loading = reduceLocalSession(
      reduceLocalSession(INITIAL_LOCAL_SESSION, { type: 'toggle-on' }),
      { ...probed, cached: true }
    );

    expect(loading.phase).toBe('loading');
    expect(loading.cached).toBe(true);
    expect(shouldAnswerLocally(loading)).toBe(false);
  });

  it('cancels a confirmation without downloading', () => {
    const confirm = reduceLocalSession(
      reduceLocalSession(INITIAL_LOCAL_SESSION, { type: 'toggle-on' }),
      probed
    );
    const off = reduceLocalSession(confirm, { type: 'toggle-off' });

    expect(off).toEqual(INITIAL_LOCAL_SESSION);
    expect(shouldAnswerLocally(off)).toBe(false);
  });

  it('ignores a late probe after the visitor turned the switch off', () => {
    const probing = reduceLocalSession(INITIAL_LOCAL_SESSION, { type: 'toggle-on' });
    const off = reduceLocalSession(probing, { type: 'toggle-off' });
    const late = reduceLocalSession(off, probed);

    expect(late.phase).toBe('off');
  });

  it('falls back to the cloud path when the model fails to load', () => {
    const loading = reduceLocalSession(
      reduceLocalSession(
        reduceLocalSession(INITIAL_LOCAL_SESSION, { type: 'toggle-on' }),
        probed
      ),
      { type: 'confirm' }
    );
    const failed = reduceLocalSession(loading, { type: 'load-error' });

    expect(failed.phase).toBe('off');
    expect(isLocalSwitchOn(failed)).toBe(false);
    expect(shouldAnswerLocally(failed)).toBe(false);
    expect(localNotice(failed)).toBe('fallback');
  });

  it('falls back to the cloud path when generation fails', () => {
    const ready = reduceLocalSession(
      reduceLocalSession(
        reduceLocalSession(
          reduceLocalSession(INITIAL_LOCAL_SESSION, { type: 'toggle-on' }),
          probed
        ),
        { type: 'confirm' }
      ),
      { type: 'ready' }
    );
    const failed = reduceLocalSession(ready, { type: 'generation-error' });

    expect(shouldAnswerLocally(ready)).toBe(true);
    expect(shouldAnswerLocally(failed)).toBe(false);
    expect(localNotice(failed)).toBe('fallback');
  });

  it('tells the visitor when the browser cannot run the model', () => {
    const probing = reduceLocalSession(INITIAL_LOCAL_SESSION, { type: 'toggle-on' });
    const unsupported = reduceLocalSession(probing, { type: 'probe-unsupported' });

    expect(unsupported.phase).toBe('off');
    expect(localNotice(unsupported)).toBe('unsupported');
    expect(shouldAnswerLocally(unsupported)).toBe(false);
  });
});
