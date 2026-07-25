import { describe, expect, it, vi } from 'vitest';

const permanentRedirect = vi.fn();
vi.mock('next/navigation', () => ({ permanentRedirect }));

describe('legacy About route', () => {
  it.each([
    ['es', '/?tag=a&tag=b&empty=&encoded=a%2Fb%3Fc#sobre-mi'],
    ['en', '/en?tag=a&tag=b&empty=&encoded=a%2Fb%3Fc#sobre-mi'],
  ] as const)('invokes the server redirect contract for %s', async (locale, target) => {
    permanentRedirect.mockClear();
    const { default: SobreMiPage } = await import('@/app/[locale]/(pages)/sobre-mi/page');

    await SobreMiPage({
      params: Promise.resolve({ locale }),
      searchParams: Promise.resolve({ tag: ['a', 'b'], empty: '', encoded: 'a/b?c' }),
    });

    expect(permanentRedirect).toHaveBeenCalledOnce();
    expect(permanentRedirect).toHaveBeenCalledWith(target);
  });
});
