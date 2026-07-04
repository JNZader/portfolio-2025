'use client';

import { useEffect, useState } from 'react';
import { SCRIPT } from './hero-terminal-script';
import { useTypingSequence } from './useTypingSequence';

/**
 * Animated terminal that REPLAYS a real, end-to-end `apigen` run.
 *
 * The author ran this exact flow against a 14-table ecommerce SQL schema and
 * verified every line with real execution (curl, not mocks):
 *   1. `apigen generate` scaffolds a COMPLETE Spring Boot project — every table
 *      becomes 5 clean-architecture layers, plus build.gradle / Application /
 *      Dockerfile / tests = 199 files.
 *   2. `./gradlew bootRun` actually boots it (Spring Boot 4 / Java 25 / Postgres /
 *      Hikari / Hibernate / Tomcat).
 *   3. Real `curl`s exercise the whole generated surface: auth (access+refresh JWT),
 *      full CRUD, pagination, cursor pagination, dynamic search (filter:op:value +
 *      sort), soft-delete + restore, and RFC 7807 Problem Details on errors (400 with
 *      field errors / 404). EVERY response body + header below was captured verbatim
 *      from the running API, not hand-written.
 *
 * It demos apigen's value DIRECTLY ("watch a DB schema become a running API")
 * instead of explaining it — a backend-engineering signal for technical reviewers,
 * legible (schema -> running API) for non-technical ones.
 *
 * - The first command types char-by-char, output streams; the body auto-scrolls
 *   while running and stays scrollable afterwards so the full run is browsable.
 * - prefers-reduced-motion: everything renders instantly, no animation/scroll.
 * - Pure setTimeout sequencing, no animation library. Real apigen output.
 */

// Banner is rendered small + nowrap so the ASCII art keeps its alignment.
const BANNER_CLASS = 'whitespace-pre text-[9px] leading-tight text-emerald-500/80 sm:text-[10px]';

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

/** Renders a command line: the `$ ` prompt in emerald, the rest in light slate. */
function CommandLine({ text, cursor }: { text: string; cursor?: boolean }) {
  const prompt = text.startsWith('$ ');
  return (
    <div className="whitespace-pre-wrap break-words text-slate-200">
      {prompt && <span className="text-emerald-400">$ </span>}
      {prompt ? text.slice(2) : text}
      {cursor && <span className="ml-px inline-block animate-pulse">▋</span>}
    </div>
  );
}

export function HeroTerminal() {
  const reduced = usePrefersReducedMotion();
  const { done, typed, bodyRef } = useTypingSequence(SCRIPT, reduced);

  const finished = done >= SCRIPT.length;
  const typing = !finished && SCRIPT[done]?.kind === 'cmd' && typed > 0 ? SCRIPT[done] : null;

  return (
    <div
      className="glass-card overflow-hidden rounded-xl border border-border/60 shadow-2xl shadow-primary/5"
      aria-hidden="true"
    >
      {/* Terminal chrome — hover/tap the bar for what this is */}
      <div className="group relative flex cursor-help items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <span className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-3 font-mono text-xs text-muted-foreground">
          apigen — sql schema → running api
        </span>
        <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full border border-border/70 font-mono text-[10px] text-muted-foreground transition-colors group-hover:border-primary/60 group-hover:text-primary">
          i
        </span>

        {/* Tooltip: explains the terminal is a real apigen example */}
        <div
          role="tooltip"
          className="pointer-events-none absolute right-3 top-full z-20 mt-2 w-72 max-w-[calc(100%-1.5rem)] rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-left text-[11px] leading-snug text-slate-300 opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100"
        >
          <span className="font-semibold text-slate-100">Ejemplo real generado con apigen.</span> De
          un schema SQL a una API Spring Boot completa y corriendo — cada línea (archivos, arranque
          y respuestas) fue capturada de la app en vivo, no es una maqueta.
        </div>
      </div>

      {/* Terminal body — dark in both themes; scrollable so the full run is browsable */}
      <div
        ref={bodyRef}
        // tabIndex={-1}: el contenedor scrolleable puede volverse keyboard-focusable
        // (Chrome), y un elemento enfocable dentro de aria-hidden viola ARIA.
        tabIndex={-1}
        className="max-h-[19rem] overflow-y-auto bg-slate-950 px-4 py-4 font-mono text-[11px] leading-relaxed sm:text-xs md:text-[13px]"
      >
        {SCRIPT.slice(0, done).map((line, i) => {
          if (line.kind === 'blank') {
            // biome-ignore lint/suspicious/noArrayIndexKey: static log, never reorders
            return <div key={i} className="h-3" />;
          }
          if (line.kind === 'cmd' || line.kind === 'cont') {
            // biome-ignore lint/suspicious/noArrayIndexKey: static log, never reorders
            return <CommandLine key={i} text={line.text} />;
          }
          if (line.kind === 'banner') {
            // ASCII art — preserve exact spacing (no wrap) at a small size so it fits.
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: static log, never reorders
              <div key={i} className={BANNER_CLASS}>
                {line.text}
              </div>
            );
          }
          if (line.kind === 'dim') {
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: static log, never reorders
              <div key={i} className="whitespace-pre-wrap break-words text-slate-500">
                {line.text}
              </div>
            );
          }
          if (line.kind === 'created') {
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: static log, never reorders
              <div key={i} className="whitespace-pre-wrap break-words text-slate-300">
                <span className="text-emerald-400">✓</span>{' '}
                <span className="text-slate-500">created</span> {line.text}
              </div>
            );
          }
          if (line.kind === 'res') {
            // A real HTTP response: status in sky, body (after a 3-space gap) dimmed.
            const sep = line.text.indexOf('   ');
            const status = sep === -1 ? line.text : line.text.slice(0, sep);
            const body = sep === -1 ? '' : line.text.slice(sep + 3);
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: static log, never reorders
              <div key={i} className="whitespace-pre-wrap break-words">
                <span className="text-sky-400">←</span>{' '}
                <span className="font-semibold text-sky-300">{status}</span>
                {body && <span className="text-slate-400"> {body}</span>}
              </div>
            );
          }
          if (line.kind === 'json') {
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: static log, never reorders
              <div key={i} className="whitespace-pre-wrap break-words text-slate-400">
                {line.text}
              </div>
            );
          }
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: static log, never reorders
            <div key={i} className="whitespace-pre-wrap break-words font-semibold text-emerald-400">
              ✓ {line.text}
            </div>
          );
        })}

        {/* The command currently being typed */}
        {typing && <CommandLine text={typing.text.slice(0, typed)} cursor />}

        {/* Trailing cursor once the run has finished */}
        {finished && (
          <div className="mt-1 text-emerald-400">
            $ <span className="ml-px inline-block animate-pulse">▋</span>
          </div>
        )}
      </div>
    </div>
  );
}
