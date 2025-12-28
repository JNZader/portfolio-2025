/**
 * Utilities for parsing and extracting content from GitHub READMEs
 */

// Known badge hostnames
const BADGE_HOSTS = [
  'shields.io',
  'img.shields.io',
  'travis-ci.org',
  'travis-ci.com',
  'coveralls.io',
  'badgen.net',
  'badge.fury.io',
  'codecov.io',
  'david-dm.org',
  'snyk.io',
];

// Badge URL patterns
const BADGE_PATTERNS = ['/badge', 'flat-square', 'flat', 'plastic', 'for-the-badge'];

/**
 * Check if an image URL is likely a badge
 */
function isBadgeUrl(src: string, alt: string): boolean {
  try {
    const url = new URL(src, 'https://example.com');
    const hostname = url.hostname.toLowerCase();

    // Check against known badge hosts
    if (BADGE_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`))) {
      return true;
    }

    // Check URL patterns
    if (BADGE_PATTERNS.some((pattern) => src.includes(pattern))) {
      return true;
    }

    // Check alt text patterns (common badge descriptions)
    const altLower = alt.toLowerCase();
    const badgeAltPatterns = [
      'license',
      'build',
      'coverage',
      'version',
      'npm',
      'downloads',
      'status',
      'ci',
      'test',
      'passing',
      'failing',
    ];
    if (src.endsWith('.svg') && badgeAltPatterns.some((pattern) => altLower.includes(pattern))) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Transform a GitHub image URL to raw.githubusercontent.com format
 */
export function transformToRawUrl(
  src: string,
  owner: string,
  repo: string,
  branch = 'main'
): string {
  if (!src) return src;

  // Already a raw URL
  if (src.includes('raw.githubusercontent.com')) {
    return src;
  }

  // Already an absolute URL (not GitHub)
  if (src.startsWith('http://') || src.startsWith('https://')) {
    // Transform GitHub blob URLs to raw
    const blobMatch = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/.exec(src);
    if (blobMatch) {
      const [, blobOwner, blobRepo, blobBranch, path] = blobMatch;
      return `https://raw.githubusercontent.com/${blobOwner}/${blobRepo}/${blobBranch}/${path}`;
    }
    // Return as-is for other absolute URLs
    return src;
  }

  // Relative URL - convert to raw.githubusercontent.com
  const cleanPath = src.replace(/^\.?\//, '');
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${cleanPath}`;
}

/**
 * Extract the first non-badge image from a README markdown content
 * Returns the image URL transformed to raw.githubusercontent.com format
 */
export function extractFirstImageFromReadme(
  readme: string,
  owner: string,
  repo: string,
  branch = 'main'
): string | undefined {
  if (!readme) return undefined;

  // Match markdown images: ![alt](url) or ![alt](url "title")
  const markdownImageRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

  // Match HTML images: <img src="url" ... />
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*\/?>/gi;

  // Collect all images
  const images: Array<{ src: string; alt: string }> = [];

  // Find markdown images
  for (const match of readme.matchAll(markdownImageRegex)) {
    images.push({ alt: match[1] || '', src: match[2] });
  }

  // Find HTML images
  for (const match of readme.matchAll(htmlImageRegex)) {
    images.push({ src: match[1], alt: match[2] || '' });
  }

  // Find the first non-badge image
  for (const img of images) {
    if (!isBadgeUrl(img.src, img.alt)) {
      return transformToRawUrl(img.src, owner, repo, branch);
    }
  }

  return undefined;
}
