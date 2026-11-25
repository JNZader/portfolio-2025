/**
 * Content-Security-Policy sent on every route.
 *
 * Local mode adds only what Transformers.js needs in the browser:
 * - `wasm-unsafe-eval` so ONNX Runtime can compile its wasm glue
 * - `worker-src 'self' blob:` for the module worker and the blob URL ORT
 *   builds from the wasm factory
 * - Hugging Face Hub plus the hosts a real download redirects to
 *
 * Verified against `onnx-community/LFM3-1.7B-ONNX` (q4f16 weights and
 * tokenizer): the Hub 302s to `us.aws.cdn.hf.co` (Xet) and advertises
 * `cas-server.xethub.hf.co` for reconstruction metadata. `*.hf.co` covers
 * those and other regions (`eu.aws.cdn.hf.co`, …). `*.huggingface.co` covers
 * legacy `cdn-lfs*.huggingface.co` LFS redirects. The wasm files themselves
 * are copied to `/ort/` and are not loaded from a CDN.
 *
 * COOP and COEP are intentionally absent. Cross-origin isolation would break
 * Giscus and Vercel Analytics. WASM therefore runs single-threaded.
 */

interface PolicyEnv {
  NODE_ENV?: string;
  CI?: string;
}

const SCRIPT_HOSTS = [
  'https://vercel.live',
  'https://va.vercel-scripts.com',
  'https://*.giscus.app',
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://*.sanity.io',
  'https://core.sanity-cdn.com',
] as const;

const CONNECT_HOSTS = [
  'https://*.sanity.io',
  'https://cdn.sanity.io',
  'https://sanity-cdn.com',
  'https://*.sanity-cdn.com',
  'https://*.upstash.io',
  'https://vitals.vercel-insights.com',
  'https://va.vercel-scripts.com',
  'https://www.google-analytics.com',
  'https://analytics.google.com',
  'https://huggingface.co',
  'https://hf.co',
  'https://*.huggingface.co',
  'https://*.hf.co',
] as const;

export function buildContentSecurityPolicy(env: PolicyEnv = process.env): string {
  const upgrade = env.NODE_ENV === 'production' && !env.CI ? ['upgrade-insecure-requests'] : [];

  return [
    "default-src 'self'",
    `script-src 'self' 'wasm-unsafe-eval' 'unsafe-inline' ${SCRIPT_HOSTS.join(' ')}`,
    "worker-src 'self' blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maxcdn.bootstrapcdn.com",
    "img-src 'self' data: blob: https://cdn.sanity.io https://avatars.githubusercontent.com https://media.licdn.com https://www.google-analytics.com https://www.googletagmanager.com https://img.shields.io https://badgen.net https://raw.githubusercontent.com https://github.com https://api.securityscorecards.dev https://codecov.io https://results.pre-commit.ci",
    "font-src 'self' https://fonts.gstatic.com https://maxcdn.bootstrapcdn.com data:",
    `connect-src 'self' ${CONNECT_HOSTS.join(' ')}`,
    "frame-src 'self' https://giscus.app",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...upgrade,
  ].join('; ');
}
