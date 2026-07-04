import { useEffect, useRef, useState } from 'react';
import type { Step } from './hero-terminal-script';

/**
 * Drives the terminal typing cascade. Returns how many steps are fully revealed
 * (`done`), how many chars of the command at index `done` are typed (`typed`),
 * and the ref for the scrollable body. Pure setTimeout sequencing, no animation
 * library. Honors prefers-reduced-motion via the `reduced` param.
 */
export function useTypingSequence(
  script: Step[],
  reduced: boolean
): {
  done: number;
  typed: number;
  bodyRef: React.RefObject<HTMLDivElement | null>;
} {
  const [done, setDone] = useState(0); // steps fully revealed
  const [typed, setTyped] = useState(0); // chars typed of the command at index `done`
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) {
      setDone(script.length);
      setTyped(0);
      return;
    }

    const queued = timers.current;
    let delay = 500;

    let firstCmdTyped = false;
    script.forEach((step, idx) => {
      if (step.kind === 'cmd' && !firstCmdTyped) {
        // Only the signature command (the `apigen generate`) types char-by-char;
        // typing every later curl would drag. Type it, then commit it as revealed.
        firstCmdTyped = true;
        for (let c = 1; c <= step.text.length; c++) {
          queued.push(
            setTimeout(() => {
              setDone(idx);
              setTyped(c);
            }, delay)
          );
          delay += 34;
        }
        delay += 300;
        queued.push(
          setTimeout(() => {
            setDone(idx + 1);
            setTyped(0);
          }, delay)
        );
      } else {
        // Everything else — later commands included — replays whole at a readable
        // pace (the body auto-scrolls so the newest line stays in view).
        const pace =
          step.kind === 'cmd'
            ? 230
            : step.kind === 'created'
              ? 55
              : step.kind === 'banner'
                ? 60
                : step.kind === 'blank'
                  ? 120
                  : step.kind === 'json'
                    ? 110
                    : step.kind === 'cont'
                      ? 150
                      : step.kind === 'res'
                        ? 360
                        : step.kind === 'good'
                          ? 320
                          : 118; // dim
        delay += pace;
        queued.push(setTimeout(() => setDone(idx + 1), delay));
      }
    });

    return () => {
      for (const t of queued) clearTimeout(t);
      timers.current = [];
    };
  }, [reduced, script]);

  // Keep the newest line in view while running.
  // biome-ignore lint/correctness/useExhaustiveDependencies: done/typed are intentional scroll triggers, not read in the body
  useEffect(() => {
    if (reduced) return;
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [done, typed, reduced]);

  return { done, typed, bodyRef };
}
