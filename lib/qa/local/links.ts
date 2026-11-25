export interface GroundedSource {
  href: string;
  text: string;
  citation: string;
  title: string;
  heading: string | null;
}

const MARKDOWN_LINK = /\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g;
const BARE_BRACKET = /\[(\/[^\]\s]+)\]/g;
const BARE_URL = /\bhttps?:\/\/[^\s<>)\]]+/g;
const KEPT_LINK = /⟦L(\d+)⟧/g;

function normalizeRef(value: string): string {
  const trimmed = value.trim().replace(/[.,;:!?]+$/g, '');
  if (trimmed.length > 1 && trimmed.endsWith('/')) return trimmed.slice(0, -1);
  return trimmed;
}

function boundedIncludes(blob: string, needle: string): boolean {
  if (!needle) return false;
  let from = 0;
  while (from < blob.length) {
    const at = blob.indexOf(needle, from);
    if (at < 0) return false;
    const next = blob.charAt(at + needle.length);
    if (!next || !/[A-Za-z0-9/_#?=&.-]/.test(next)) return true;
    from = at + 1;
  }
  return false;
}

export function isGroundedHref(href: string, chunks: readonly GroundedSource[]): boolean {
  const norm = normalizeRef(href);
  if (!norm || norm.startsWith('javascript:') || norm.startsWith('data:')) return false;
  for (const chunk of chunks) {
    if (normalizeRef(chunk.href) === norm) return true;
    const blob = [chunk.text, chunk.citation, chunk.title, chunk.heading ?? ''].join('\n');
    if (boundedIncludes(blob, href) || boundedIncludes(blob, norm)) return true;
  }
  return false;
}

function tidy(text: string): string {
  return text
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Keep markdown links, bare URLs and [/path] citations only when that target
 * is a retrieved href or appears in the chunk text. Invented targets lose
 * the link and keep the label, if any.
 */
export function filterUngroundedLinks(answer: string, chunks: readonly GroundedSource[]): string {
  const kept: string[] = [];
  const withoutMarkdown = answer.replace(MARKDOWN_LINK, (full, label: string, href: string) => {
    if (!isGroundedHref(href, chunks)) return label;
    const token = `⟦L${kept.length}⟧`;
    kept.push(full);
    return token;
  });
  const withoutBarePaths = withoutMarkdown.replace(BARE_BRACKET, (full, href: string) =>
    isGroundedHref(href, chunks) ? full : ''
  );
  const withoutUrls = withoutBarePaths.replace(BARE_URL, (url) => {
    const cleaned = url.replace(/[.,;:!?]+$/g, '');
    return isGroundedHref(cleaned, chunks) ? url : '';
  });
  const restored = withoutUrls.replace(
    KEPT_LINK,
    (_token, index: string) => kept[Number(index)] ?? ''
  );
  return tidy(restored);
}
