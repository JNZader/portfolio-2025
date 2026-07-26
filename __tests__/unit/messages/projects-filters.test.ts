import { execSync } from 'node:child_process';
import { createTranslator } from 'next-intl';
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

  it('interpolates the remaining count via ICU plural rules in both locales', () => {
    for (const projects of [esProjects, enProjects]) {
      for (const key of ['techMore', 'techMoreAria'] as const) {
        expect(projects[key], `${key} must use an ICU plural on {count}`).toContain(
          '{count, plural,'
        );
        expect(projects[key]).toContain('one {');
        expect(projects[key]).toContain('other {');
      }
    }
  });

  it('renders grammatical singular and plural copy in both locales', () => {
    const tEs = createTranslator({ locale: 'es', namespace: 'Projects', messages: es });
    const tEn = createTranslator({ locale: 'en', namespace: 'Projects', messages: en });

    // Singular branch (was the ungrammatical "Mostrar 1 tecnologías más")
    expect(tEs('techMore', { count: 1 })).toBe('+1 más');
    expect(tEs('techMoreAria', { count: 1 })).toBe('Mostrar 1 tecnología más');
    expect(tEn('techMore', { count: 1 })).toBe('+1 more');
    expect(tEn('techMoreAria', { count: 1 })).toBe('Show 1 more technology');

    // Plural branch
    expect(tEs('techMore', { count: 3 })).toBe('+3 más');
    expect(tEs('techMoreAria', { count: 3 })).toBe('Mostrar 3 tecnologías más');
    expect(tEn('techMore', { count: 3 })).toBe('+3 more');
    expect(tEn('techMoreAria', { count: 3 })).toBe('Show 3 more technologies');
  });

  it('pruned keys are verified unused before deletion (usage guard)', () => {
    // The removed toggle/panel referenced these Projects.* keys. Before
    // deletion, a repo-wide search confirmed no remaining reference — Blog
    // uses its own `filters` key in the Blog namespace and is unaffected.
    const PRUNED = ['filters', 'sourceHeading', 'techHeading', 'techHint'];
    const projectsSourceRefs = execSync(
      `grep -rn "useTranslations('Projects')" --include="*.tsx" app components || true`,
      { cwd: process.cwd(), encoding: 'utf8' }
    );
    const files = projectsSourceRefs
      .split('\n')
      .filter(Boolean)
      .map((line) => line.split(':')[0]);
    for (const file of new Set(files)) {
      const content = execSync(`cat "${file}"`, { cwd: process.cwd(), encoding: 'utf8' });
      for (const key of PRUNED) {
        expect(content.includes(`'${key}'`), `${file} must not reference Projects.${key}`).toBe(
          false
        );
      }
    }

    for (const key of ['sourceHeading', 'techHeading', 'techHint'] as const) {
      expect(esProjects[key], `es.Projects.${key} must be pruned`).toBeUndefined();
      expect(enProjects[key], `en.Projects.${key} must be pruned`).toBeUndefined();
    }
    expect(esProjects.filters, 'es.Projects.filters must be pruned').toBeUndefined();
    expect(enProjects.filters, 'en.Projects.filters must be pruned').toBeUndefined();
  });
});
