'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Animated terminal showing a realistic Spring Boot 3.x startup log.
 *
 * Gives the hero a backend SUBJECT (the #1 finding of the 5vr UI/UX review):
 * within ~2s a visitor *feels* "backend Java engineer", not "generic landing".
 *
 * - Command line types char-by-char, then the output streams line-by-line.
 * - prefers-reduced-motion: the whole log renders instantly, no typing, no
 *   blinking cursor.
 * - Pure setTimeout sequencing, no animation library (the repo deliberately
 *   dropped framer-motion to save ~60KB).
 */

const COMMAND = '$ ./mvnw spring-boot:run';

type Line =
  | { kind: 'blank' }
  | { kind: 'banner'; text: string }
  | { kind: 'info'; text: string }
  | { kind: 'ok'; text: string };

// Real Spring Boot banner + authentic log message fragments (no fabricated claims).
const OUTPUT: Line[] = [
  { kind: 'blank' },
  { kind: 'banner', text: '  .   ____          _            __ _ _' },
  { kind: 'banner', text: ' /\\\\ / ___\'_ __ _ _(_)_ __  __ _ \\ \\ \\ \\' },
  { kind: 'banner', text: '( ( )\\___ | \'_ | \'_| | \'_ \\/ _` | \\ \\ \\ \\' },
  { kind: 'banner', text: ' \\\\/  ___)| |_)| | | | | || (_| |  ) ) ) )' },
  { kind: 'banner', text: "  '  |____| .__|_| |_|_| |_\\__, | / / / /" },
  { kind: 'banner', text: ' =========|_|==============|___/=/_/_/_/' },
  { kind: 'banner', text: ' :: Spring Boot ::        (v3.4.0)' },
  { kind: 'blank' },
  { kind: 'info', text: 'Starting ApiApplication using Java 21' },
  { kind: 'info', text: 'The following 1 profile is active: "prod"' },
  { kind: 'info', text: 'Tomcat initialized with port 8080 (http)' },
  { kind: 'info', text: 'Bootstrapping Spring Data JPA repositories' },
  { kind: 'info', text: 'HikariPool-1 - Start completed' },
  { kind: 'info', text: 'Tomcat started on port 8080 (http)' },
  { kind: 'ok', text: 'Started ApiApplication in 1.42s (JVM running for 1.68)' },
  { kind: 'info', text: 'GET /api/health -> 200 OK (12ms)' },
];

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = globalThis.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export function HeroTerminal() {
  const reduced = usePrefersReducedMotion();
  const [typed, setTyped] = useState(0); // chars of COMMAND typed
  const [lines, setLines] = useState(0); // output lines revealed
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Reduced motion (or SSR-safe default flips): show everything at once.
    if (reduced) {
      setTyped(COMMAND.length);
      setLines(OUTPUT.length);
      return;
    }

    const queued = timers.current;
    let delay = 350;

    // Phase 1: type the command, char by char.
    for (let i = 1; i <= COMMAND.length; i++) {
      queued.push(setTimeout(() => setTyped(i), delay));
      delay += 45;
    }

    // Phase 2: stream the output lines (banner faster, logs at a readable pace).
    delay += 250;
    for (let i = 1; i <= OUTPUT.length; i++) {
      const step = OUTPUT[i - 1].kind === 'banner' ? 55 : 150;
      queued.push(setTimeout(() => setLines(i), delay));
      delay += step;
    }

    return () => {
      for (const t of queued) clearTimeout(t);
      timers.current = [];
    };
  }, [reduced]);

  const commandDone = typed >= COMMAND.length;

  return (
    <div
      className="glass-card overflow-hidden rounded-xl border border-border/60 shadow-2xl shadow-primary/5"
      aria-hidden="true"
    >
      {/* Terminal chrome */}
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <span className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-3 font-mono text-xs text-muted-foreground">api — spring-boot:run</span>
      </div>

      {/* Terminal body — dark in both themes for authenticity */}
      <div className="bg-slate-950 px-4 py-4 font-mono text-[11px] leading-relaxed sm:text-xs md:text-[13px]">
        {/* Command line */}
        <div className="whitespace-pre text-slate-200">
          <span className="text-emerald-400">{COMMAND.slice(0, typed).slice(0, 2)}</span>
          {COMMAND.slice(2, typed)}
          {!commandDone && <span className="ml-px inline-block animate-pulse">▋</span>}
        </div>

        {/* Output */}
        {OUTPUT.slice(0, lines).map((line, i) => {
          if (line.kind === 'blank') {
            // biome-ignore lint/suspicious/noArrayIndexKey: static log, never reorders
            return <div key={i} className="h-3" />;
          }
          if (line.kind === 'banner') {
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: static log, never reorders
              <div key={i} className="whitespace-pre text-primary/55">
                {line.text}
              </div>
            );
          }
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: static log, never reorders
            <div key={i} className="whitespace-pre-wrap break-words text-slate-400">
              <span className={line.kind === 'ok' ? 'text-emerald-400' : 'text-sky-400/90'}>
                INFO
              </span>{' '}
              <span className={line.kind === 'ok' ? 'text-slate-200' : ''}>{line.text}</span>
            </div>
          );
        })}

        {/* Trailing cursor once the log has finished streaming */}
        {commandDone && lines >= OUTPUT.length && (
          <div className="text-emerald-400">
            $ <span className="ml-px inline-block animate-pulse">▋</span>
          </div>
        )}
      </div>
    </div>
  );
}
