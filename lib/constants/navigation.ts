/**
 * Main navigation links shared across Header and Footer components
 */
export const MAIN_NAVIGATION = [
  { name: 'Inicio', href: '/' },
  { name: 'Sobre mí', href: '/sobre-mi' },
  { name: 'Proyectos', href: '/proyectos' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contacto', href: '/contacto' },
] as const;

/**
 * Type for a single navigation item
 */
export type NavigationItem = (typeof MAIN_NAVIGATION)[number];
