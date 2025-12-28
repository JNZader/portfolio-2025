import { withCache } from './cache';
import { getFeaturedRepos, getRepoReadme, getReposByTopic, normalizeGitHubRepo } from './client';
import type { Project } from './types';

/**
 * Obtener proyectos featured con cache
 * Incluye extracción de imagen de preview del README
 */
export async function getCachedFeaturedProjects(): Promise<Project[]> {
  return withCache('github-featured-projects', async () => {
    const repos = await getFeaturedRepos();

    // Fetch READMEs in parallel for preview images
    const readmes = await Promise.all(
      repos.map((repo) => getRepoReadme(repo.owner.login, repo.name).catch(() => null))
    );

    return repos.map((repo, index) => normalizeGitHubRepo(repo, readmes[index] ?? undefined));
  });
}

/**
 * Obtener proyectos por topic con cache
 * Incluye extracción de imagen de preview del README
 */
export async function getCachedProjectsByTopic(topic: string): Promise<Project[]> {
  return withCache(`github-projects-${topic}`, async () => {
    const repos = await getReposByTopic(topic);

    // Fetch READMEs in parallel for preview images
    const readmes = await Promise.all(
      repos.map((repo) => getRepoReadme(repo.owner.login, repo.name).catch(() => null))
    );

    return repos.map((repo, index) => normalizeGitHubRepo(repo, readmes[index] ?? undefined));
  });
}
