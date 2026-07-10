import { describe, expect, it } from 'vitest';
import { localizedPath, localizedUrl } from '@/lib/seo/locale-url';

describe('localized SEO URLs', () => {
  it('keeps Spanish paths prefix-less', () => {
    expect(localizedPath('/proyectos/apigen', 'es')).toBe('/proyectos/apigen');
  });

  it('prefixes English project paths for Open Graph and JSON-LD', () => {
    expect(localizedPath('/proyectos/apigen', 'en')).toBe('/en/proyectos/apigen');
    expect(localizedUrl('/proyectos/apigen', 'en')).toBe(
      'https://javierzader.com/en/proyectos/apigen'
    );
  });
});
