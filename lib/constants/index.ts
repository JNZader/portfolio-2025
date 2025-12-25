/**
 * Constantes globales del proyecto
 */

import { SITE_CONFIG as siteConfig } from '../config/site-config';

export type { SiteConfig } from '../config/site-config';
// Site Config
export { SITE_CONFIG } from '../config/site-config';
export type { Skill, SkillsData } from './skills';
// Skills
export { SKILLS_DATA, SKILLS_DATA_HOME } from './skills';

// Internal reference for use in this file
const SITE_CONFIG = siteConfig;

// Reading time
export const WORDS_PER_MINUTE = 200;

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;

// Date formats
export const DATE_FORMATS = {
  long: 'PPPP', // 'January 1st, 2025'
  short: 'PP', // '01/01/2025'
  time: 'p', // '12:00 AM'
  datetime: 'PPpp', // 'January 1st, 2025 at 12:00 AM'
} as const;

// Breakpoints (sync with Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Animation durations (ms)
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// API Routes
export const API_ROUTES = {
  contact: '/api/contact',
  newsletter: {
    subscribe: '/api/newsletter/subscribe',
    unsubscribe: '/api/newsletter/unsubscribe',
    confirm: '/api/newsletter/confirm',
  },
} as const;

// External Links
export const SOCIAL_LINKS = {
  github: SITE_CONFIG.author.github,
  linkedin: SITE_CONFIG.author.linkedin,
} as const;

// Regex patterns (designed to prevent ReDoS attacks)
export const REGEX_PATTERNS = {
  // RFC 5321 compliant email regex - use with length check (max 254 chars)
  // Requires TLD (e.g., .com, .org) to be valid
  email:
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9][a-zA-Z0-9-]*(?:\.[a-zA-Z0-9][a-zA-Z0-9-]*)*\.[a-zA-Z]{2,}$/,
  url: /^https?:\/\/.+/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  hexColor: /^#(?:[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
} as const;

// Max lengths for regex validation (prevent ReDoS)
export const MAX_LENGTHS = {
  email: 254, // RFC 5321
  url: 2048, // Common browser limit
  slug: 200,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;
