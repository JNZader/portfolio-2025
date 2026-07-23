/**
 * Centralized client IP resolution.
 *
 * On Vercel, `x-forwarded-for` is partially attacker-controlled: the client
 * can prepend arbitrary entries and Vercel APPENDS the real connecting IP.
 * Trusting the FIRST entry lets an attacker rotate fake IPs to bypass every
 * rate limiter (contact, newsletter, GDPR) and forge the GDPR IP audit trail.
 *
 * Resolution order:
 * 1. `x-vercel-forwarded-for` — set by Vercel's edge, not spoofable by the
 *    client. The last entry is the IP Vercel appended (the real client).
 * 2. `x-real-ip` — also set by Vercel's edge.
 * 3. LAST `x-forwarded-for` entry — only outside Vercel (dev/self-host),
 *    where the immediate proxy appends the connecting IP at the end.
 * 4. `'unknown'` — safe shared bucket when nothing trustworthy exists.
 */

function lastEntry(headerValue: string | null): string | undefined {
  if (!headerValue) return undefined;
  const last = headerValue.split(',').at(-1)?.trim();
  return last || undefined;
}

function singleValue(headerValue: string | null): string | undefined {
  const value = headerValue?.trim();
  return value || undefined;
}

export function getClientIp(request: Request): string {
  return (
    lastEntry(request.headers.get('x-vercel-forwarded-for')) ??
    singleValue(request.headers.get('x-real-ip')) ??
    lastEntry(request.headers.get('x-forwarded-for')) ??
    'unknown'
  );
}
