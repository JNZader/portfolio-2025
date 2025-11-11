import { withCache } from './cache';
import { getFeaturedRepos, getReposByTopic, normalizeGitHubRepo } from './client';
import type { Project } from './types';

/**
 * Obtener proyectos featured con cache
 */
export async function getCachedFeaturedProjects(): Promise<Project[]> {
  return withCache('github-featured-projects', async () => {
    const repos = await getFeaturedRepos();
    return repos.map(normalizeGitHubRepo);
  });
}

/**
 * Obtener proyectos por topic con cache
 */
export async function getCachedProjectsByTopic(topic: string): Promise<Project[]> {
  return withCache(`github-projects-${topic}`, async () => {
    const repos = await getReposByTopic(topic);
    return repos.map(normalizeGitHubRepo);
  });
}
