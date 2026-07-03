import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale-aware navigation APIs. Import `Link`, `useRouter`, `usePathname`,
 * `redirect` and `getPathname` from here (NOT from `next/link` / `next/navigation`)
 * so internal navigation preserves the active locale.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
