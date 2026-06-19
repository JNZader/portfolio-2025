import { getFeaturedRepos, getRepoReadme, getReposByTopic, normalizeGitHubRepo } from './client';
import type { Project } from './types';

/*
 * No in-process cache here on purpose. The consuming routes use ISR
 * (`export const revalidate = 3600`), so Next caches the rendered output for an
 * hour — a module-level Map would be a no-op in serverless (per-instance memory,
 * cold-empty on the path that matters), so it was removed. (Names kept as
 * `getCached*` to avoid churning callers.)
 */

/**
 * Featured projects from GitHub, with README preview images fetched in parallel.
 */
export async function getCachedFeaturedProjects(): Promise<Project[]> {
  const repos = await getFeaturedRepos();

  // Fetch READMEs in parallel for preview images
  const readmes = await Promise.all(
    repos.map((repo) => getRepoReadme(repo.owner.login, repo.name).catch(() => null))
  );

  return repos.map((repo, index) => normalizeGitHubRepo(repo, readmes[index] ?? undefined));
}

/**
 * Projects by GitHub topic, with README preview images fetched in parallel.
 */
export async function getCachedProjectsByTopic(topic: string): Promise<Project[]> {
  const repos = await getReposByTopic(topic);

  // Fetch READMEs in parallel for preview images
  const readmes = await Promise.all(
    repos.map((repo) => getRepoReadme(repo.owner.login, repo.name).catch(() => null))
  );

  return repos.map((repo, index) => normalizeGitHubRepo(repo, readmes[index] ?? undefined));
}
