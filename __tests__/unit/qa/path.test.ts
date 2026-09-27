import { describe, expect, it } from 'vitest';
import { parsePublishedQaPath } from '@/lib/qa';
import { QA_LOCALE } from '@/lib/qa/types';

describe('parsePublishedQaPath', () => {
  it('reads a Spanish project detail as project + slug', () => {
    expect(parsePublishedQaPath('/proyectos/apigen')).toEqual({
      locale: QA_LOCALE.ES,
      preferSlug: 'apigen',
      kind: 'project',
    });
  });

  it('reads an English project detail as project + slug', () => {
    expect(parsePublishedQaPath('/en/proyectos/apigen')).toEqual({
      locale: QA_LOCALE.EN,
      preferSlug: 'apigen',
      kind: 'project',
    });
  });

  it('reads a Spanish blog detail as blog + slug', () => {
    expect(parsePublishedQaPath('/blog/foo')).toEqual({
      locale: QA_LOCALE.ES,
      preferSlug: 'foo',
      kind: 'blog',
    });
  });

  it('reads an English blog detail as blog + slug', () => {
    expect(parsePublishedQaPath('/en/blog/foo')).toEqual({
      locale: QA_LOCALE.EN,
      preferSlug: 'foo',
      kind: 'blog',
    });
  });

  it('treats list and site paths as site-wide', () => {
    expect(parsePublishedQaPath('/proyectos')).toEqual({
      locale: QA_LOCALE.ES,
      preferSlug: null,
      kind: 'site',
    });
    expect(parsePublishedQaPath('/')).toEqual({
      locale: QA_LOCALE.ES,
      preferSlug: null,
      kind: 'site',
    });
    expect(parsePublishedQaPath('/contacto')).toEqual({
      locale: QA_LOCALE.ES,
      preferSlug: null,
      kind: 'site',
    });
    expect(parsePublishedQaPath('/en/contacto')).toEqual({
      locale: QA_LOCALE.EN,
      preferSlug: null,
      kind: 'site',
    });
  });
});
