import {
  Code2,
  Database,
  GitBranch,
  Globe,
  Layers,
  type LucideIcon,
  Palette,
  Server,
  Smartphone,
  Terminal,
} from 'lucide-react';

export interface TechIconMapping {
  icon: LucideIcon;
  color: string;
}

const techIconMap: Record<string, TechIconMapping> = {
  // Backend
  java: { icon: Code2, color: 'text-orange-600 dark:text-orange-400' },
  'spring boot': { icon: Layers, color: 'text-green-600 dark:text-green-400' },
  spring: { icon: Layers, color: 'text-green-600 dark:text-green-400' },
  'node.js': { icon: Server, color: 'text-green-600 dark:text-green-400' },
  nodejs: { icon: Server, color: 'text-green-600 dark:text-green-400' },
  python: { icon: Code2, color: 'text-blue-600 dark:text-blue-400' },
  django: { icon: Server, color: 'text-green-600 dark:text-green-400' },
  flask: { icon: Server, color: 'text-muted-foreground' },
  express: { icon: Server, color: 'text-muted-foreground' },
  fastapi: { icon: Server, color: 'text-teal-600 dark:text-teal-400' },
  'api rest': { icon: Server, color: 'text-purple-600 dark:text-purple-400' },
  rest: { icon: Server, color: 'text-purple-600 dark:text-purple-400' },
  graphql: { icon: Server, color: 'text-pink-600 dark:text-pink-400' },

  // Frontend
  react: { icon: Code2, color: 'text-cyan-600 dark:text-cyan-400' },
  'react.js': { icon: Code2, color: 'text-cyan-600 dark:text-cyan-400' },
  'next.js': { icon: Layers, color: 'text-foreground' },
  nextjs: { icon: Layers, color: 'text-foreground' },
  vue: { icon: Code2, color: 'text-green-600 dark:text-green-400' },
  'vue.js': { icon: Code2, color: 'text-green-600 dark:text-green-400' },
  angular: { icon: Code2, color: 'text-red-600 dark:text-red-400' },
  svelte: { icon: Code2, color: 'text-orange-600 dark:text-orange-400' },
  typescript: { icon: Code2, color: 'text-blue-600 dark:text-blue-400' },
  javascript: { icon: Code2, color: 'text-yellow-600 dark:text-yellow-400' },
  html: { icon: Globe, color: 'text-orange-600 dark:text-orange-400' },
  css: { icon: Palette, color: 'text-blue-600 dark:text-blue-400' },
  tailwind: { icon: Palette, color: 'text-teal-600 dark:text-teal-400' },
  'tailwind css': { icon: Palette, color: 'text-teal-600 dark:text-teal-400' },
  sass: { icon: Palette, color: 'text-pink-600 dark:text-pink-400' },
  scss: { icon: Palette, color: 'text-pink-600 dark:text-pink-400' },

  // Mobile
  'react native': { icon: Smartphone, color: 'text-cyan-600 dark:text-cyan-400' },
  flutter: { icon: Smartphone, color: 'text-blue-600 dark:text-blue-400' },
  kotlin: { icon: Smartphone, color: 'text-purple-600 dark:text-purple-400' },
  swift: { icon: Smartphone, color: 'text-orange-600 dark:text-orange-400' },

  // Database
  postgresql: { icon: Database, color: 'text-blue-600 dark:text-blue-400' },
  postgres: { icon: Database, color: 'text-blue-600 dark:text-blue-400' },
  mysql: { icon: Database, color: 'text-orange-600 dark:text-orange-400' },
  mongodb: { icon: Database, color: 'text-green-600 dark:text-green-400' },
  redis: { icon: Database, color: 'text-red-600 dark:text-red-400' },
  sqlite: { icon: Database, color: 'text-blue-600 dark:text-blue-400' },
  mariadb: { icon: Database, color: 'text-blue-600 dark:text-blue-400' },
  dynamodb: { icon: Database, color: 'text-blue-600 dark:text-blue-400' },

  // DevOps
  docker: { icon: Server, color: 'text-blue-600 dark:text-blue-400' },
  kubernetes: { icon: Server, color: 'text-blue-600 dark:text-blue-400' },
  k8s: { icon: Server, color: 'text-blue-600 dark:text-blue-400' },
  git: { icon: GitBranch, color: 'text-orange-600 dark:text-orange-400' },
  github: { icon: GitBranch, color: 'text-foreground' },
  gitlab: { icon: GitBranch, color: 'text-orange-600 dark:text-orange-400' },
  'ci/cd': { icon: GitBranch, color: 'text-green-600 dark:text-green-400' },
  jenkins: { icon: Server, color: 'text-red-600 dark:text-red-400' },
  terraform: { icon: Server, color: 'text-purple-600 dark:text-purple-400' },
  ansible: { icon: Server, color: 'text-red-600 dark:text-red-400' },
  aws: { icon: Server, color: 'text-orange-600 dark:text-orange-400' },
  azure: { icon: Server, color: 'text-blue-600 dark:text-blue-400' },
  gcp: { icon: Server, color: 'text-blue-600 dark:text-blue-400' },
  linux: { icon: Terminal, color: 'text-yellow-600 dark:text-yellow-400' },
  bash: { icon: Terminal, color: 'text-green-600 dark:text-green-400' },
  shell: { icon: Terminal, color: 'text-green-600 dark:text-green-400' },
};

/**
 * Get icon and color for a technology
 */
export function getTechIcon(tech: string): TechIconMapping {
  const normalized = tech.toLowerCase().trim();
  return (
    techIconMap[normalized] || {
      icon: Code2,
      color: 'text-muted-foreground',
    }
  );
}

/**
 * Get all tech icons with their mappings
 */
export function getAllTechIcons(): Record<string, TechIconMapping> {
  return techIconMap;
}
