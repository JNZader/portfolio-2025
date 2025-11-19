import { Octokit } from 'octokit';
import type { GitHubRateLimit, GitHubRepo, Project } from './types';

// Singleton pattern para reutilizar instancia
let octokitInstance: Octokit | null = null;

function getOctokit(): Octokit {
  if (!octokitInstance) {
    octokitInstance = new Octokit({
      auth: process.env.GITHUB_TOKEN,
      userAgent: 'portfolio-next-app/1.0.0',
      timeZone: 'America/New_York',
      baseUrl: 'https://api.github.com',
    });
  }
  return octokitInstance;
}

/**
 * Obtener repos del usuario filtrados por topic
 */
export async function getReposByTopic(topic: string, username?: string): Promise<GitHubRepo[]> {
  const octokit = getOctokit();
  const user = username || process.env.NEXT_PUBLIC_GITHUB_USERNAME;

  if (!user) {
    console.warn('GitHub username not configured - skipping GitHub projects');
    return []; // Fallback silencioso cuando no está configurado
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
    console.error('Error fetching GitHub repos:', error);
    return []; // Fallback silencioso en caso de error
  }
}

/**
 * Obtener repos destacados (con topic "portfolio" o "featured")
 */
export async function getFeaturedRepos(username?: string): Promise<GitHubRepo[]> {
  const octokit = getOctokit();
  const user = username || process.env.NEXT_PUBLIC_GITHUB_USERNAME;

  if (!user) {
    console.warn('GitHub username not configured - skipping GitHub projects');
    return []; // Fallback silencioso cuando no está configurado
  }

  try {
    // Estrategia: Fetch all repos + filter locally
    // Más confiable que GitHub Search API topic filter debido a indexing delays
    const query = `user:${user}`;
    console.log('🔍 GitHub Search Query:', query);

    const { data } = await octokit.rest.search.repos({
      q: query,
      sort: 'updated',
      order: 'desc',
      per_page: 6,
    });

    console.log(`✅ GitHub API Response: Found ${data.total_count} repos`);
    console.log(
      '📦 Repos:',
      data.items.map((r) => ({ name: r.name, topics: r.topics, stars: r.stargazers_count }))
    );

    // Filtrar localmente por topics (más confiable que Search API)
    const filtered = data.items.filter(
      (repo) => repo.topics?.includes('portfolio') || repo.topics?.includes('featured')
    );

    console.log(`🎯 Filtered repos with topics: ${filtered.length}`);

    return filtered.length > 0
      ? (filtered as GitHubRepo[])
      : (data.items.slice(0, 3) as GitHubRepo[]);
  } catch (error) {
    console.error('❌ Error fetching featured repos:', error);
    return []; // Fallback silencioso
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
    console.error(`Error fetching repo ${owner}/${repo}:`, error);
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
    console.error(`Error fetching README for ${owner}/${repo}:`, error);
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
    console.error('Error fetching rate limit:', error);
    throw error;
  }
}

/**
 * Normalizar repo de GitHub a formato Project
 */
export function normalizeGitHubRepo(repo: GitHubRepo): Project {
  return {
    id: `github-${repo.id}`,
    title: repo.name,
    description: repo.description || 'Sin descripción',
    url: repo.html_url,
    github: repo.html_url,
    demo: repo.homepage || undefined,
    tech: repo.language ? [repo.language, ...repo.topics.slice(0, 4)] : repo.topics.slice(0, 5),
    stars: repo.stargazers_count,
    source: 'github',
  };
}
