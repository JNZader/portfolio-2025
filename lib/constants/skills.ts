import type { LucideIcon } from 'lucide-react';
import { Code2, Database, GitBranch, Layers, Palette, Server, Target } from 'lucide-react';

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
    { name: 'Node.js', icon: Server, color: 'text-green-600 dark:text-green-400' },
    { name: 'Python', icon: Code2, color: 'text-blue-600 dark:text-blue-400' },
    { name: 'APIs REST', icon: Server, color: 'text-purple-600 dark:text-purple-400' },
  ],
  frontend: [
    { name: 'React', icon: Code2, color: 'text-cyan-600 dark:text-cyan-400' },
    { name: 'Next.js', icon: Layers, color: 'text-foreground' },
    { name: 'TypeScript', icon: Code2, color: 'text-blue-600 dark:text-blue-400' },
    { name: 'Tailwind CSS', icon: Palette, color: 'text-teal-600 dark:text-teal-400' },
  ],
  databases: [
    { name: 'PostgreSQL', icon: Database, color: 'text-blue-600 dark:text-blue-400' },
    { name: 'MySQL', icon: Database, color: 'text-orange-600 dark:text-orange-400' },
    { name: 'MongoDB', icon: Database, color: 'text-green-600 dark:text-green-400' },
  ],
  devops: [
    { name: 'Docker', icon: Server, color: 'text-blue-600 dark:text-blue-400' },
    { name: 'Git', icon: GitBranch, color: 'text-orange-600 dark:text-orange-400' },
    { name: 'GitHub', icon: GitBranch, color: 'text-foreground' },
    { name: 'Linux', icon: Server, color: 'text-yellow-600 dark:text-yellow-400' },
    { name: 'CI/CD', icon: Target, color: 'text-green-600 dark:text-green-400' },
  ],
};

/**
 * Simplified skills for home page (fewer items per category)
 * Home page shows PostgreSQL in backend for visual grouping
 */
export const SKILLS_DATA_HOME: SkillsData = {
  backend: [
    { name: 'Java', icon: Code2, color: 'text-orange-600 dark:text-orange-400' },
    { name: 'Spring Boot', icon: Layers, color: 'text-green-600 dark:text-green-400' },
    { name: 'PostgreSQL', icon: Database, color: 'text-blue-600 dark:text-blue-400' },
    { name: 'APIs REST', icon: Server, color: 'text-purple-600 dark:text-purple-400' },
  ],
  frontend: SKILLS_DATA.frontend,
  devops: [
    { name: 'Docker', icon: Server, color: 'text-blue-600 dark:text-blue-400' },
    { name: 'Git', icon: GitBranch, color: 'text-orange-600 dark:text-orange-400' },
    { name: 'CI/CD', icon: Target, color: 'text-green-600 dark:text-green-400' },
    { name: 'Linux', icon: Server, color: 'text-yellow-600 dark:text-yellow-400' },
  ],
};
