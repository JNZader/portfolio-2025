import { describe, expect, it } from 'vitest';
import { buildAboutRedirect } from '@/lib/seo/about-redirect';

describe('buildAboutRedirect', () => {
  it.each([
    ['es', {}, '/#sobre-mi'],
    ['en', {}, '/en#sobre-mi'],
    ['es', { campaign: 'spring sale' }, '/?campaign=spring+sale#sobre-mi'],
    ['en', { tag: ['a', 'b'], empty: '' }, '/en?tag=a&tag=b&empty=#sobre-mi'],
    ['es', { 'utm key': 'a/b?c' }, '/?utm+key=a%2Fb%3Fc#sobre-mi'],
  ] as const)('builds a locale-aware URL for %s', (locale, params, expected) => {
    expect(buildAboutRedirect(locale, params)).toBe(expected);
  });
});
