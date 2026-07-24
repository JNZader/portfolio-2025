import type { Project } from '@/lib/github/types';

export const MAX_FEATURED_PROJECTS = 4;
export const MIN_FEATURED_PROJECTS = 3;

/**
 * Select a curated subset of projects to feature on the home page.
 *
 * Priority:
 * 1. Projects with `featured: true`.
 * 2. If fewer than 3 featured projects exist, fill with the first available
 *    projects from the merged list.
 * 3. Cap at 4 projects maximum.
 */
export function selectFeaturedProjects(projects: Project[]): Project[] {
  if (projects.length === 0) return [];

  const featured = projects.filter((project) => project.featured);
  const remaining = projects.filter((project) => !project.featured);
  const all = [...featured, ...remaining];
  const target = Math.min(MAX_FEATURED_PROJECTS, Math.max(MIN_FEATURED_PROJECTS, all.length));

  return all.slice(0, target);
}
