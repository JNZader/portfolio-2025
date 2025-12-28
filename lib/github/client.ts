import { Octokit } from 'octokit';
import { logger } from '@/lib/monitoring/logger';
import { extractFirstImageFromReadme } from './readme-utils';
import type { GitHubRateLimit, GitHubRepo, Project } from './types';

// Singleton pattern para reutilizar instancia
let octokitInstance: Octokit | null = null;

function getOctokit(): Octokit {
  octokitInstance ??= new Octokit({
    auth: process.env.GITHUB_TOKEN,
    userAgent: 'portfolio-next-app/1.0.0',
    timeZone: 'America/New_York',
    baseUrl: 'https://api.github.com',
  });
  return octokitInstance;
}

/**
 * Obtener repos del usuario filtrados por topic
 */
export async function getReposByTopic(topic: string, username?: string): Promise<GitHubRepo[]> {
  const octokit = getOctokit();
  const user = username ?? process.env.NEXT_PUBLIC_GITHUB_USERNAME;

  if (!user) {
    logger.warn('GitHub username not configured', {
      service: 'github',
      action: 'getReposByTopic',
      fallback: 'empty_array',
    });
    return [];
  }

  try {
    const { data } = await octokit.rest.search.repos({
      q: `user:${user} topic:${topic}`,
      sort: 'updated',
      order: 'desc',
      per_page: 12,
    });

    return data.items as GitHubRepo[];
  } catch (error) {
    logger.error('Error fetching GitHub repos', error as Error, {
      service: 'github',
      action: 'getReposByTopic',
      topic,
    });
    return [];
  }
}

/**
 * Obtener repos destacados (con topic "portfolio" o "featured")
 */
export async function getFeaturedRepos(username?: string): Promise<GitHubRepo[]> {
  const octokit = getOctokit();
  const user = username ?? process.env.NEXT_PUBLIC_GITHUB_USERNAME;

  if (!user) {
    logger.warn('GitHub username not configured', {
      service: 'github',
      action: 'getFeaturedRepos',
      fallback: 'empty_array',
    });
    return [];
  }

  try {
    const query = `user:${user}`;
    logger.debug('GitHub Search Query', { service: 'github', query });

    const { data } = await octokit.rest.search.repos({
      q: query,
      sort: 'updated',
      order: 'desc',
      per_page: 6,
    });

    logger.info('GitHub repos fetched', {
      service: 'github',
      totalCount: data.total_count,
      returned: data.items.length,
    });

    // Filtrar localmente por topics (más confiable que Search API)
    const filtered = data.items.filter(
      (repo) => repo.topics?.includes('portfolio') || repo.topics?.includes('featured')
    );

    logger.debug('Filtered repos by topics', {
      service: 'github',
      filteredCount: filtered.length,
    });

    return filtered.length > 0
      ? (filtered as GitHubRepo[])
      : (data.items.slice(0, 3) as GitHubRepo[]);
  } catch (error) {
    logger.error('Error fetching featured repos', error as Error, {
      service: 'github',
      action: 'getFeaturedRepos',
    });
    return [];
  }
}

/**
 * Obtener un repo específico
 */
export async function getRepo(owner: string, repo: string): Promise<GitHubRepo | null> {
  const octokit = getOctokit();

  try {
    const { data } = await octokit.rest.repos.get({
      owner,
      repo,
    });

    return data as GitHubRepo;
  } catch (error) {
    logger.error('Error fetching repo', error as Error, {
      service: 'github',
      action: 'getRepo',
      owner,
      repo,
    });
    return null;
  }
}

/**
 * Obtener el README de un repositorio
 */
export async function getRepoReadme(owner: string, repo: string): Promise<string | null> {
  const octokit = getOctokit();

  try {
    const { data } = await octokit.rest.repos.getReadme({
      owner,
      repo,
      mediaType: {
        format: 'raw',
      },
    });

    // El contenido viene como string cuando usamos format: 'raw'
    return data as unknown as string;
  } catch (error) {
    logger.error('Error fetching README', error as Error, {
      service: 'github',
      action: 'getRepoReadme',
      owner,
      repo,
    });
    return null;
  }
}

/**
 * Obtener rate limit actual
 */
export async function getRateLimit(): Promise<GitHubRateLimit> {
  const octokit = getOctokit();

  try {
    const { data } = await octokit.rest.rateLimit.get();
    return data.rate;
  } catch (error) {
    logger.error('Error fetching rate limit', error as Error, {
      service: 'github',
      action: 'getRateLimit',
    });
    throw error;
  }
}

/**
 * Normalizar repo de GitHub a formato Project
 * @param repo - Repositorio de GitHub
 * @param readme - Contenido del README (opcional, para extraer imagen de preview)
 */
export function normalizeGitHubRepo(repo: GitHubRepo, readme?: string): Project {
  // Extract preview image from README if available
  let image: string | undefined;
  if (readme) {
    image = extractFirstImageFromReadme(readme, repo.owner.login, repo.name);
  }

  return {
    id: `github-${repo.id}`,
    title: repo.name,
    description: repo.description ?? 'Sin descripción',
    image,
    url: repo.html_url,
    github: repo.html_url,
    demo: repo.homepage ?? undefined,
    tech: repo.language ? [repo.language, ...repo.topics.slice(0, 4)] : repo.topics.slice(0, 5),
    stars: repo.stargazers_count,
    source: 'github',
  };
}
