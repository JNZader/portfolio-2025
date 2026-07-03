import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// The page is a client component, so the noindex lives here: robots.txt only
// blocks crawling — externally-linked URLs can still get indexed without it.
export const metadata: Metadata = {
  title: 'Logros secretos',
  robots: { index: false, follow: false },
};

export default function SecretAchievementsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
