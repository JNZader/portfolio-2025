import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';

// Shared next/font definitions. Defined once here and consumed by every layout
// that renders <html> (app/[locale]/layout.tsx and the Studio layout) so the
// font CSS variables are applied consistently without duplicate declarations.

// Variable font with subsetting. 'optional' display eliminates render delay on
// slow connections — the font is used only if it loads within ~100ms.
export const inter = Inter({
  subsets: ['latin'],
  display: 'optional',
  variable: '--font-inter',
  preload: true,
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'sans-serif',
  ],
  adjustFontFallback: true,
});

// Display grotesk for headings — 'swap' so the distinctive face actually
// renders (the whole point of a display font); adjustFontFallback keeps CLS low.
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['500', '700'],
  preload: true,
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
  adjustFontFallback: true,
});

// Monospace for code blocks — 'optional' display for consistency.
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'optional',
  variable: '--font-mono',
  preload: true,
  fallback: ['Consolas', 'Monaco', 'Courier New', 'monospace'],
  adjustFontFallback: true,
});

/** Combined font CSS-variable classes for the <html> element. */
export const fontVariables = `${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`;
