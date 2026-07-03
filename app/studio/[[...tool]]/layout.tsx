import type { ReactNode } from 'react';
import { fontVariables } from '@/lib/fonts';
import '../../globals.css';

/**
 * Root layout for Sanity Studio. Studio lives outside the `[locale]` segment
 * (its basePath is coupled to `/studio`), and the app root layout is a
 * pass-through, so Studio owns its own <html>/<body> here. Single-locale (es),
 * no portfolio header/footer.
 */
export default function StudioLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning className={fontVariables}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
