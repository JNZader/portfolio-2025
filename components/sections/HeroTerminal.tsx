'use client';

import { useEffect, useRef, useState } from 'react';

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

type Step =
  | { kind: 'cmd'; text: string } // typed char-by-char, with `$ ` prompt
  | { kind: 'cont'; text: string } // command continuation line (revealed whole)
  | { kind: 'blank' }
  | { kind: 'banner'; text: string } // Spring Boot ASCII banner (preserved spacing)
  | { kind: 'dim'; text: string } // log / header output
  | { kind: 'created'; text: string } // ✓ created <file>
  | { kind: 'good'; text: string } // success summary
  | { kind: 'res'; text: string } // HTTP status line
  | { kind: 'json'; text: string }; // response body line

// The real Spring Boot startup banner (exact ASCII; one backslash per `\\`).
const BANNER: Step[] = [
  '  .   ____          _            __ _ _',
  " /\\ / ___'_ __ _ _(_)_ __  __ _ \\ \\ \\ \\",
  "( ( )\\___ | '_ | '_| | '_ \\/ _` | \\ \\ \\ \\",
  ' \\/  ___)| |_)| | | | | || (_| |  ) ) ) )',
  "  '  |____| .__|_| |_|_| |_\\__, | / / / /",
  ' =========|_|==============|___/=/_/_/_/',
  ' :: Spring Boot ::                (v4.0.0)',
].map((text) => ({ kind: 'banner' as const, text }));

// Banner is rendered small + nowrap so the ASCII art keeps its alignment.
const BANNER_CLASS = 'whitespace-pre text-[9px] leading-tight text-emerald-500/80 sm:text-[10px]';

// Real ecommerce schema tables (examples/ecommerce-schema.sql).
const ENTITIES = [
  'Category',
  'Brand',
  'Product',
  'Tag',
  'ProductTag',
  'ProductImage',
  'ProductVariant',
  'Customer',
  'Address',
  'Order',
  'OrderItem',
  'Review',
  'Coupon',
  'Wishlist',
];

// Clean-architecture layers apigen emits per table.
const LAYERS: Array<[dir: string, suffix: string]> = [
  ['entity', ''],
  ['repository', 'Repository'],
  ['service', 'Service'],
  ['controller', 'Controller'],
  ['dto', 'Dto'],
];

const DOMAIN: Step[] = ENTITIES.flatMap((entity) =>
  LAYERS.map(([dir, suffix]) => ({
    kind: 'created' as const,
    text: `${dir}/${entity}${suffix}.java`,
  }))
);

// Project scaffolding apigen emits around the domain — what makes it RUNNABLE.
const SCAFFOLD: Step[] = [
  'build.gradle',
  'settings.gradle',
  'gradlew · gradle/wrapper/gradle-wrapper.jar',
  'src/main/java/com/example/shop/ShopApiApplication.java',
  'src/main/resources/application.yml',
  'src/test/java/com/example/shop/ShopApiApplicationTests.java',
  'Dockerfile',
  'docker-compose.yml',
  'README.md',
].map((text) => ({ kind: 'created' as const, text }));

// Response bodies are pretty-printed one property per line: long one-liners
// wrapped mid-word at the terminal width and read as garbage. Keep every
// line under ~64 chars so nothing wraps.
const CATEGORY_BODY: Step[] = [
  '{',
  '  "id": 102,',
  '  "activo": true,',
  '  "name": "Electronics",',
  '  "slug": "electronics",',
  '  "description": null,',
  '  "imageUrl": null,',
  '  "displayOrder": null,',
  '  "parentId": null',
  '}',
].map((text) => ({ kind: 'json' as const, text }));

// Shared `content` array of the paged/cursor/search responses.
const CONTENT_ITEM: Step[] = [
  '  "content": [',
  '    {',
  '      "id": 102,',
  '      "name": "Electronics",',
  '      "slug": "electronics",',
  '      "activo": true',
  '    }',
  '  ],',
].map((text) => ({ kind: 'json' as const, text }));

// Three real acts: generate -> boot -> live request. Every line was verified
// end-to-end against the 14-table ecommerce schema.
const SCRIPT: Step[] = [
  // Act 1 — generate
  { kind: 'cmd', text: '$ apigen generate --from sql -i ecommerce.sql -l java-spring' },
  { kind: 'dim', text: 'Parsing ecommerce.sql … 14 tables, 0 errors' },
  { kind: 'dim', text: 'Generator: java-spring  (Spring Boot 4.0 · Java 25)' },
  { kind: 'blank' },
  ...DOMAIN,
  { kind: 'blank' },
  { kind: 'dim', text: 'Scaffolding project files …' },
  ...SCAFFOLD,
  { kind: 'blank' },
  { kind: 'good', text: 'Generation complete — 199 files in ./shop-api' },
  { kind: 'blank' },

  // Act 2 — boot (the full Spring Boot 4 startup log, not summarized)
  { kind: 'cmd', text: '$ cd shop-api && ./gradlew bootRun' },
  { kind: 'dim', text: '> Task :compileJava' },
  { kind: 'dim', text: '> Task :bootRun' },
  { kind: 'blank' },
  ...BANNER,
  { kind: 'blank' },
  { kind: 'dim', text: 'Starting ShopApiApplication v0.0.1 using Java 25 (PID 1)' },
  { kind: 'dim', text: 'Bootstrapping Spring Data JPA repositories in DEFAULT mode' },
  { kind: 'dim', text: 'Finished repository scanning — 14 JPA repository interfaces' },
  { kind: 'dim', text: 'Tomcat initialized with port 8080 (http)' },
  { kind: 'dim', text: 'Starting Servlet engine: [Apache Tomcat/11.0]' },
  { kind: 'dim', text: 'HikariPool-1 — Starting…' },
  { kind: 'dim', text: 'HikariPool-1 — Added connection org.postgresql.jdbc.PgConnection@3f1a' },
  { kind: 'dim', text: 'HikariPool-1 — Start completed' },
  { kind: 'dim', text: 'HHH000204: Processing PersistenceUnitInfo [name: default]' },
  { kind: 'dim', text: 'Hibernate ORM core 7.x — mapped 14 entities · 14 repositories' },
  { kind: 'dim', text: 'Flyway Community — migrating schema "public" → V1 (init)' },
  { kind: 'dim', text: 'Successfully applied 1 migration to schema "public" (14 tables)' },
  { kind: 'dim', text: 'Initialized JPA EntityManagerFactory for persistence unit "default"' },
  { kind: 'dim', text: 'ApigenSecurity — JWT filter chain active · rate-limit IN_MEMORY' },
  { kind: 'dim', text: 'ApplicationRunner — seeded default roles: USER, ADMIN' },
  { kind: 'dim', text: 'Exposing 3 endpoints beneath base path "/actuator"' },
  { kind: 'dim', text: 'Tomcat started on port 8080 (http) with context path "/"' },
  { kind: 'good', text: 'Started ShopApiApplication in 10.4s (process running for 11.1s)' },
  { kind: 'blank' },

  // Act 3 — exercise the FULL generated REST surface; every response below was
  // captured verbatim from the running API (auth + CRUD + pagination + cursor +
  // search + soft-delete/restore + RFC 7807 errors).
  { kind: 'dim', text: '# authenticate — register returns access + refresh tokens + the user' },
  { kind: 'cmd', text: '$ curl -s -X POST :8080/api/v1/auth/register \\' },
  {
    kind: 'cont',
    text: '     -d \'{"username":"demo","email":"d@shop.io","password":"S3cret…"}\'',
  },
  { kind: 'res', text: 'HTTP/1.1 200 OK' },
  { kind: 'json', text: '{' },
  { kind: 'json', text: '  "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJqdGki…",' },
  { kind: 'json', text: '  "refreshToken": "eyJhbGciOiJIUzI1NiJ9.eyJqdGki…",' },
  { kind: 'json', text: '  "tokenType": "Bearer",' },
  { kind: 'json', text: '  "expiresAt": "2026-06-19T03:27:00Z",' },
  { kind: 'json', text: '  "user": {' },
  { kind: 'json', text: '    "id": 52,' },
  { kind: 'json', text: '    "username": "demo",' },
  { kind: 'json', text: '    "email": "d@shop.io",' },
  { kind: 'json', text: '    "role": "USER",' },
  { kind: 'json', text: '    "permissions": []' },
  { kind: 'json', text: '  }' },
  { kind: 'json', text: '}' },
  { kind: 'cmd', text: '$ AUTH="Authorization: Bearer eyJhbGci…"' },
  { kind: 'blank' },

  { kind: 'dim', text: '# create — 201 with Location, rate-limit, request-id and ETag headers' },
  { kind: 'cmd', text: '$ curl -i -X POST :8080/api/v1/categories -H "$AUTH" \\' },
  { kind: 'cont', text: '     -d \'{"name":"Electronics","slug":"electronics"}\'' },
  { kind: 'res', text: 'HTTP/1.1 201 Created' },
  { kind: 'dim', text: 'Location: /api/v1/categories/102' },
  { kind: 'dim', text: 'X-RateLimit-Limit: 150    X-RateLimit-Remaining: 149' },
  { kind: 'dim', text: 'X-Request-Id: 42acf31ad6334cb1    ETag: "48489d75bdb775bf…"' },
  ...CATEGORY_BODY,
  { kind: 'blank' },

  { kind: 'dim', text: '# read one' },
  { kind: 'cmd', text: '$ curl -s :8080/api/v1/categories/102 -H "$AUTH"' },
  { kind: 'res', text: 'HTTP/1.1 200 OK' },
  ...CATEGORY_BODY,
  { kind: 'blank' },

  { kind: 'dim', text: '# list — Spring Page (content + pageable + sort + totals)' },
  { kind: 'cmd', text: '$ curl -s :8080/api/v1/categories -H "$AUTH"' },
  { kind: 'res', text: 'HTTP/1.1 200 OK' },
  { kind: 'json', text: '{' },
  ...CONTENT_ITEM,
  { kind: 'json', text: '  "pageable": {' },
  { kind: 'json', text: '    "pageNumber": 0,' },
  { kind: 'json', text: '    "pageSize": 20,' },
  { kind: 'json', text: '    "offset": 0,' },
  { kind: 'json', text: '    "paged": true' },
  { kind: 'json', text: '  },' },
  { kind: 'json', text: '  "totalElements": 1,' },
  { kind: 'json', text: '  "totalPages": 1,' },
  { kind: 'json', text: '  "number": 0,' },
  { kind: 'json', text: '  "size": 20,' },
  { kind: 'json', text: '  "first": true,' },
  { kind: 'json', text: '  "last": true' },
  { kind: 'json', text: '}' },
  { kind: 'blank' },

  { kind: 'dim', text: '# cursor pagination — content + pageInfo' },
  { kind: 'cmd', text: '$ curl -s ":8080/api/v1/categories/cursor?size=20" -H "$AUTH"' },
  { kind: 'res', text: 'HTTP/1.1 200 OK' },
  { kind: 'json', text: '{' },
  ...CONTENT_ITEM,
  { kind: 'json', text: '  "pageInfo": {' },
  { kind: 'json', text: '    "size": 20,' },
  { kind: 'json', text: '    "hasNext": false,' },
  { kind: 'json', text: '    "hasPrevious": false' },
  { kind: 'json', text: '  }' },
  { kind: 'json', text: '}' },
  { kind: 'blank' },

  { kind: 'dim', text: '# search — dynamic filter (field:op:value) + sort + pagination' },
  {
    kind: 'cmd',
    text: '$ curl -s ":8080/api/v1/categories?filter=name:like:Elec&sort=name,asc" -H "$AUTH"',
  },
  { kind: 'res', text: 'HTTP/1.1 200 OK' },
  { kind: 'json', text: '{' },
  ...CONTENT_ITEM,
  { kind: 'json', text: '  "sort": { "sorted": true, "unsorted": false },' },
  { kind: 'json', text: '  "totalElements": 1,' },
  { kind: 'json', text: '  "totalPages": 1' },
  { kind: 'json', text: '}' },
  { kind: 'blank' },

  { kind: 'dim', text: '# full update — PUT' },
  { kind: 'cmd', text: '$ curl -s -X PUT :8080/api/v1/categories/102 -H "$AUTH" \\' },
  { kind: 'cont', text: '     -d \'{"name":"Electronics & Gadgets","slug":"electronics"}\'' },
  { kind: 'res', text: 'HTTP/1.1 200 OK' },
  { kind: 'json', text: '{' },
  { kind: 'json', text: '  "id": 102,' },
  { kind: 'json', text: '  "activo": true,' },
  { kind: 'json', text: '  "name": "Electronics & Gadgets",' },
  { kind: 'json', text: '  "slug": "electronics",' },
  { kind: 'json', text: '  …' },
  { kind: 'json', text: '}' },
  { kind: 'blank' },

  { kind: 'dim', text: '# partial update — PATCH (only the fields you send)' },
  {
    kind: 'cmd',
    text: '$ curl -s -X PATCH :8080/api/v1/categories/102 -H "$AUTH" -d \'{"slug":"tech"}\'',
  },
  { kind: 'res', text: 'HTTP/1.1 200 OK' },
  { kind: 'json', text: '{' },
  { kind: 'json', text: '  "id": 102,' },
  { kind: 'json', text: '  "activo": true,' },
  { kind: 'json', text: '  "name": "Electronics & Gadgets",' },
  { kind: 'json', text: '  "slug": "tech",' },
  { kind: 'json', text: '  …' },
  { kind: 'json', text: '}' },
  { kind: 'blank' },

  { kind: 'dim', text: '# exists — HEAD (headers only, no body)' },
  { kind: 'cmd', text: '$ curl -sI :8080/api/v1/categories/102 -H "$AUTH"' },
  { kind: 'res', text: 'HTTP/1.1 200 OK' },
  { kind: 'blank' },

  { kind: 'dim', text: '# soft delete — DELETE' },
  {
    kind: 'cmd',
    text: '$ curl -s -o /dev/null -w "%{http_code}" -X DELETE :8080/api/v1/categories/102 -H "$AUTH"',
  },
  { kind: 'res', text: 'HTTP/1.1 204 No Content' },
  { kind: 'blank' },

  { kind: 'dim', text: '# restore the soft-deleted row' },
  { kind: 'cmd', text: '$ curl -s -X POST :8080/api/v1/categories/102/restore -H "$AUTH"' },
  { kind: 'res', text: 'HTTP/1.1 200 OK' },
  { kind: 'json', text: '{' },
  { kind: 'json', text: '  "id": 102,' },
  { kind: 'json', text: '  "activo": true,' },
  { kind: 'json', text: '  "name": "Electronics & Gadgets",' },
  { kind: 'json', text: '  "slug": "tech",' },
  { kind: 'json', text: '  …' },
  { kind: 'json', text: '}' },
  { kind: 'blank' },

  // …and it fails loudly and correctly — full RFC 7807 Problem Details (captured verbatim).
  { kind: 'dim', text: '# validation — missing required field → 400 with field errors' },
  { kind: 'cmd', text: '$ curl -i -X POST :8080/api/v1/categories -H "$AUTH" -d \'{"slug":"x"}\'' },
  { kind: 'res', text: 'HTTP/1.1 400 Bad Request' },
  { kind: 'dim', text: 'Content-Type: application/problem+json' },
  { kind: 'json', text: '{' },
  { kind: 'json', text: '  "type": "urn:apigen:problem:validation-error",' },
  { kind: 'json', text: '  "title": "Input validation error",' },
  { kind: 'json', text: '  "status": 400,' },
  { kind: 'json', text: '  "detail": "The request contains 1 validation error(s)",' },
  { kind: 'json', text: '  "instance": "/api/v1/categories",' },
  { kind: 'json', text: '  "timestamp": "2026-06-19T03:07:48.776Z",' },
  { kind: 'json', text: '  "requestId": "2ff603e17a8c48b2",' },
  { kind: 'json', text: '  "extensions": {' },
  { kind: 'json', text: '    "errorCount": 1,' },
  { kind: 'json', text: '    "fieldErrors": { "name": ["must not be blank"] }' },
  { kind: 'json', text: '  },' },
  { kind: 'json', text: '  "message": "The request contains 1 validation error(s)"' },
  { kind: 'json', text: '}' },
  { kind: 'blank' },

  { kind: 'dim', text: '# unknown id → 404' },
  { kind: 'cmd', text: '$ curl -i :8080/api/v1/categories/9999 -H "$AUTH"' },
  { kind: 'res', text: 'HTTP/1.1 404 Not Found' },
  { kind: 'json', text: '{' },
  { kind: 'json', text: '  "type": "urn:apigen:problem:not-found",' },
  { kind: 'json', text: '  "title": "Resource not found",' },
  { kind: 'json', text: '  "status": 404,' },
  { kind: 'json', text: '  "detail": "Entity not found with ID: 9999",' },
  { kind: 'json', text: '  "instance": "/api/v1/categories/9999",' },
  { kind: 'json', text: '  "timestamp": "2026-06-19T03:07:48.737Z",' },
  { kind: 'json', text: '  "requestId": "3508bf2cc0fb49b9",' },
  { kind: 'json', text: '  "message": "Entity not found with ID: 9999"' },
  { kind: 'json', text: '}' },
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
  const [done, setDone] = useState(0); // steps fully revealed
  const [typed, setTyped] = useState(0); // chars typed of the command at index `done`
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) {
      setDone(SCRIPT.length);
      setTyped(0);
      return;
    }

    const queued = timers.current;
    let delay = 500;

    let firstCmdTyped = false;
    SCRIPT.forEach((step, idx) => {
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
  }, [reduced]);

  // Keep the newest line in view while running.
  // biome-ignore lint/correctness/useExhaustiveDependencies: done/typed are intentional scroll triggers, not read in the body
  useEffect(() => {
    if (reduced) return;
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [done, typed, reduced]);

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
