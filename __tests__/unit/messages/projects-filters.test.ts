import es from '@/messages/es.json';
import en from '@/messages/en.json';
import { describe, expect, it } from 'vitest';

/**
 * Proyectos filters redesign — bilingual parity for the new Projects.* keys
 * (segmented-control label, tech-bar label, More trigger + aria label,
 * dropdown search placeholder, dropdown no-results message).
 */
const NEW_KEYS = [
  'sourceLabel',
  'techBarLabel',
  'techMore',
  'techMoreAria',
  'techSearchPlaceholder',
  'techNoResults',
] as const;

const esProjects = es.Projects as Record<string, string>;
const enProjects = en.Projects as Record<string, string>;

describe('projects filters redesign messages', () => {
  it('defines all new Projects keys in both catalogs with non-empty copy', () => {
    for (const key of NEW_KEYS) {
      expect(esProjects[key], `es.Projects.${key}`).toEqual(expect.any(String));
      expect(enProjects[key], `en.Projects.${key}`).toEqual(expect.any(String));
      expect(esProjects[key].trim(), `es.Projects.${key}`).not.toBe('');
      expect(enProjects[key].trim(), `en.Projects.${key}`).not.toBe('');
    }
  });

  it('keeps key parity between both Projects catalogs', () => {
    expect(Object.keys(enProjects).sort()).toEqual(Object.keys(esProjects).sort());
  });

  it('interpolates the remaining count placeholder in both locales', () => {
    for (const projects of [esProjects, enProjects]) {
      expect(projects.techMore).toContain('{count}');
      expect(projects.techMoreAria).toContain('{count}');
    }
  });
});
