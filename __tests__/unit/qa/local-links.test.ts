import { describe, expect, it } from 'vitest';
import { filterUngroundedLinks, isGroundedHref } from '@/lib/qa/local/links';
import type { GroundedSource } from '@/lib/qa/local/links';

const chunks: GroundedSource[] = [
  {
    href: '/cv',
    title: 'Resumen',
    heading: null,
    citation: 'Resumen',
    text: 'Ver https://github.com/JNZader/portfolio-2025 para el repo.',
  },
  {
    href: '/proyectos/biogas-platform',
    title: 'Biogas',
    heading: 'Arquitectura',
    citation: 'Biogas — Arquitectura',
    text: 'Tres capas.',
  },
];

describe('filterUngroundedLinks', () => {
  it('keeps a markdown link whose href is a retrieved source', () => {
    const filtered = filterUngroundedLinks('Título en [CV](/cv).', chunks);

    expect(filtered).toBe('Título en [CV](/cv).');
    expect(isGroundedHref('/cv', chunks)).toBe(true);
  });

  it('drops the link and keeps the label when the href was invented', () => {
    const filtered = filterUngroundedLinks(
      'Ver [CV](/cv) y [phish](https://evil.example/x).',
      chunks
    );

    expect(filtered).toBe('Ver [CV](/cv) y phish.');
    expect(filtered).not.toContain('evil.example');
  });

  it('keeps a bare URL only when the chunk text contains that exact URL', () => {
    const filtered = filterUngroundedLinks(
      'Repo https://github.com/JNZader/portfolio-2025 y también https://evil.example/a.',
      chunks
    );

    expect(filtered).toContain('https://github.com/JNZader/portfolio-2025');
    expect(filtered).not.toContain('evil.example');
  });

  it('does not treat a prefix of a source URL as allowed', () => {
    expect(isGroundedHref('https://github.com', chunks)).toBe(false);
    expect(isGroundedHref('https://github.com/JNZader', chunks)).toBe(false);
  });

  it('keeps a bare bracket path that matches a source and removes the rest', () => {
    const filtered = filterUngroundedLinks('Ver [/cv] y [/secret].', chunks);

    expect(filtered).toContain('[/cv]');
    expect(filtered).not.toContain('/secret');
  });

  it('strips javascript and protocol-relative links to their labels', () => {
    const filtered = filterUngroundedLinks(
      'No [click](javascript:alert(1)) ni [ext](//evil.example/a).',
      chunks
    );

    expect(filtered).toBe('No click ni ext.');
  });

  it('accepts a trailing slash as the same source path', () => {
    expect(isGroundedHref('/cv/', chunks)).toBe(true);
    expect(isGroundedHref('/proyectos/biogas-platform/', chunks)).toBe(true);
  });
});
