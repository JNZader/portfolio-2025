import { permanentRedirect } from 'next/navigation';
import { buildAboutRedirect } from '@/lib/seo/about-redirect';

// Excluded from PageTransition: this page never renders content, it only
// redirects to the locale-prefixed about route.
export default async function SobreMiPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  permanentRedirect(buildAboutRedirect(locale, query));
}
