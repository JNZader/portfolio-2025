export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string | null;
  } | null;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepo[];
}

export interface GitHubError {
  message: string;
  documentation_url?: string;
  status?: number;
}

export interface GitHubRateLimit {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

// Tipo normalizado para combinar con Sanity
export interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
  url: string;
  github?: string;
  demo?: string;
  tech: string[];
  stars?: number;
  source: 'sanity' | 'github';
  featured?: boolean;
}
