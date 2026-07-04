import { DEFAULT_SITE_URL, SITE_URL } from '@/lib/config/site-config';
import { logger } from '@/lib/monitoring/logger';

const LOCALHOST_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

/**
 * Guarded getter for the base site URL, meant for transactional/email link
 * generators (newsletter confirm/unsubscribe, GDPR data-export/data-deletion
 * confirmations).
 *
 * Why this exists: `SITE_URL` in `site-config.ts` is already a safe
 * module-level constant (falls back to `DEFAULT_SITE_URL`, the real
 * production domain, when `NEXT_PUBLIC_SITE_URL` is unset) — SEO/metadata
 * code was never the problem. The email-link call sites, however, read
 * `process.env.NEXT_PUBLIC_SITE_URL` directly with either no fallback at
 * all (→ a literal `"undefined/api/..."` link) or a
 * `?? 'http://localhost:3000'` fallback — both of which can ship a broken
 * or localhost link in a REAL GDPR/newsletter email if the env var is
 * missing or misconfigured in production.
 *
 * This re-uses `SITE_URL`/`DEFAULT_SITE_URL` as the single source of truth
 * for "what the safe default is" instead of introducing a second one, and
 * adds the loud-log-on-misconfiguration behavior on top:
 * - In production, if the raw env var is missing OR points at localhost,
 *   log a loud `logger.error` (surfaces in Sentry) so the misconfiguration
 *   doesn't go unnoticed, then return the safe production fallback
 *   (best-effort, not a throw — taking down the whole newsletter/GDPR flow
 *   over a bad env var is worse than shipping the correct fallback domain).
 * - In development, localhost is allowed silently (expected local setup).
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalhost = !!raw && LOCALHOST_PATTERN.test(raw);
  const isMisconfigured = isProduction && (!raw || isLocalhost);

  if (isMisconfigured) {
    logger.error(
      'NEXT_PUBLIC_SITE_URL is missing or points at localhost in production. ' +
        'Email links (newsletter/GDPR confirmations) will fall back to the ' +
        'default domain — fix the env var.',
      undefined,
      { rawValue: raw ?? '(unset)' }
    );
  }

  const resolved = isMisconfigured ? DEFAULT_SITE_URL : (raw ?? SITE_URL);

  return resolved.replace(/\/+$/, '');
}
