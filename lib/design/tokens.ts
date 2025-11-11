/**
 * Design Tokens
 * Complementa las CSS variables de shadcn/ui con tokens tipados
 * Compatible con HSL y OKLCH (usa las variables CSS directamente)
 */

export const tokens = {
  /**
   * COLORES
   * Referencia a las CSS variables (agnostic de formato HSL/OKLCH)
   */
  colors: {
    // Semantic colors - usar con Tailwind o var() en CSS
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    primary: 'var(--primary)',
    primaryForeground: 'var(--primary-foreground)',
    secondary: 'var(--secondary)',
    secondaryForeground: 'var(--secondary-foreground)',
    muted: 'var(--muted)',
    mutedForeground: 'var(--muted-foreground)',
    accent: 'var(--accent)',
    accentForeground: 'var(--accent-foreground)',
    destructive: 'var(--destructive)',
    destructiveForeground: 'var(--destructive-foreground)',
    border: 'var(--border)',
    input: 'var(--input)',
    ring: 'var(--ring)',
    card: 'var(--card)',
    cardForeground: 'var(--card-foreground)',
    popover: 'var(--popover)',
    popoverForeground: 'var(--popover-foreground)',
  },

  /**
   * ESPACIADO
   * Sistema de 4px base
   */
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },

  /**
   * RADIO
   */
  radius: {
    sm: 'calc(var(--radius) - 4px)',
    md: 'calc(var(--radius) - 2px)',
    lg: 'var(--radius)',
    full: '9999px',
  },
} as const;

export type ColorKey = keyof typeof tokens.colors;
export type SpacingKey = keyof typeof tokens.spacing;
export type RadiusKey = keyof typeof tokens.radius;
