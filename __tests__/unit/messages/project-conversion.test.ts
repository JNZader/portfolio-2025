import es from '@/messages/es.json';
import en from '@/messages/en.json';
import { describe, expect, it } from 'vitest';

describe('project conversion messages', () => {
  it('keeps localized APiGen captions in parity and removes obsolete action keys', () => {
    expect(es.Home.apigenCaption).toBe(
      '<b>apigen</b> — una herramienta que construí: de un schema SQL a una API Spring Boot completa y corriendo.'
    );
    expect(en.Home.apigenCaption).toBe(
      '<b>apigen</b> — a tool I built that turns a SQL schema into a complete, running Spring Boot API.'
    );
    expect(es.Home).not.toHaveProperty('apigenCaseStudy');
    expect(es.Home).not.toHaveProperty('apigenGithub');
    expect(en.Home).not.toHaveProperty('apigenCaseStudy');
    expect(en.Home).not.toHaveProperty('apigenGithub');
    expect(es.Common.cvView).toBe('Ver CV');
    expect(en.Common.cvView).toBe('View CV');
  });
});
