/**
 * Main navigation shared across Header and Footer. `key` maps to a label in the
 * `Nav` message namespace (messages/{locale}.json); `href` is locale-agnostic
 * (the locale prefix is applied by the i18n-aware Link).
 */
export const MAIN_NAVIGATION = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/sobre-mi' },
  { key: 'projects', href: '/proyectos' },
  { key: 'blog', href: '/blog' },
  { key: 'contact', href: '/contacto' },
] as const;

/**
 * Type for a single navigation item
 */
export type NavigationItem = (typeof MAIN_NAVIGATION)[number];

/** Nav message key. */
export type NavKey = NavigationItem['key'];
