import type { LucideIcon } from 'lucide-react';
import {
  Box,
  Cloud,
  Code2,
  Database,
  GitBranch,
  Layers,
  Palette,
  Server,
  Target,
  Zap,
} from 'lucide-react';

export interface Skill {
  name: string;
  icon: LucideIcon;
  color: string;
}

export interface SkillsData {
  backend: Skill[];
  frontend: Skill[];
  databases?: Skill[];
  devops: Skill[];
}

/**
 * Centralized skills data for consistent display across the site
 * Used in: Home page, About page
 */
export const SKILLS_DATA: SkillsData = {
  backend: [
    { name: 'Java', icon: Code2, color: 'text-orange-600 dark:text-orange-400' },
    { name: 'Spring Boot', icon: Layers, color: 'text-green-600 dark:text-green-400' },
    { name: 'Go', icon: Code2, color: 'text-cyan-600 dark:text-cyan-400' },
    { name: 'Rust', icon: Code2, color: 'text-orange-700 dark:text-orange-500' },
    { name: 'Python', icon: Code2, color: 'text-blue-600 dark:text-blue-400' },
    { name: 'Node.js', icon: Server, color: 'text-green-600 dark:text-green-400' },
  ],
  frontend: [
    { name: 'React', icon: Code2, color: 'text-cyan-600 dark:text-cyan-400' },
    { name: 'Next.js', icon: Layers, color: 'text-foreground' },
    { name: 'TypeScript', icon: Code2, color: 'text-blue-600 dark:text-blue-400' },
    { name: 'Vite', icon: Zap, color: 'text-purple-600 dark:text-purple-400' },
    { name: 'Mantine', icon: Box, color: 'text-blue-500 dark:text-blue-300' },
    { name: 'Tailwind CSS', icon: Palette, color: 'text-teal-600 dark:text-teal-400' },
  ],
  databases: [
    { name: 'PostgreSQL', icon: Database, color: 'text-blue-600 dark:text-blue-400' },
    { name: 'MySQL', icon: Database, color: 'text-orange-600 dark:text-orange-400' },
    { name: 'MongoDB', icon: Database, color: 'text-green-600 dark:text-green-400' },
    { name: 'Redis', icon: Database, color: 'text-red-600 dark:text-red-400' },
    { name: 'Supabase', icon: Database, color: 'text-emerald-600 dark:text-emerald-400' },
  ],
  devops: [
    { name: 'Docker', icon: Server, color: 'text-blue-600 dark:text-blue-400' },
    { name: 'Terraform', icon: Cloud, color: 'text-purple-600 dark:text-purple-400' },
    { name: 'Git', icon: GitBranch, color: 'text-orange-600 dark:text-orange-400' },
    { name: 'GitHub', icon: GitBranch, color: 'text-foreground' },
    { name: 'CI/CD', icon: Target, color: 'text-green-600 dark:text-green-400' },
    { name: 'Linux', icon: Server, color: 'text-yellow-600 dark:text-yellow-400' },
  ],
};

/**
 * Simplified skills for home page (fewer items per category)
 */
export const SKILLS_DATA_HOME: SkillsData = {
  backend: [
    { name: 'Java', icon: Code2, color: 'text-orange-600 dark:text-orange-400' },
    { name: 'Spring Boot', icon: Layers, color: 'text-green-600 dark:text-green-400' },
    { name: 'Go', icon: Code2, color: 'text-cyan-600 dark:text-cyan-400' },
    { name: 'Rust', icon: Code2, color: 'text-orange-700 dark:text-orange-500' },
    { name: 'Python', icon: Code2, color: 'text-blue-600 dark:text-blue-400' },
  ],
  frontend: [
    { name: 'React', icon: Code2, color: 'text-cyan-600 dark:text-cyan-400' },
    { name: 'Next.js', icon: Layers, color: 'text-foreground' },
    { name: 'TypeScript', icon: Code2, color: 'text-blue-600 dark:text-blue-400' },
    { name: 'Tailwind CSS', icon: Palette, color: 'text-teal-600 dark:text-teal-400' },
  ],
  devops: [
    { name: 'Docker', icon: Server, color: 'text-blue-600 dark:text-blue-400' },
    { name: 'Git', icon: GitBranch, color: 'text-orange-600 dark:text-orange-400' },
    { name: 'CI/CD', icon: Target, color: 'text-green-600 dark:text-green-400' },
    { name: 'Linux', icon: Server, color: 'text-yellow-600 dark:text-yellow-400' },
  ],
};
