import type { Category, Post } from '@/types/sanity';

/**
 * Posts por página
 */
export const POSTS_PER_PAGE = 6;

/**
 * Calcula el número total de páginas
 */
export function getTotalPages(total: number, perPage: number = POSTS_PER_PAGE): number {
  return Math.ceil(total / perPage);
}

/**
 * Calcula el rango para la query de paginación
 */
export function getPaginationRange(page: number, perPage: number = POSTS_PER_PAGE) {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return { start, end };
}

/**
 * Genera array de números de página
 */
export function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  const delta = 2; // Cuántas páginas mostrar a cada lado
  const range: (number | 'ellipsis')[] = [];
  const rangeWithDots: (number | 'ellipsis')[] = [];

  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(totalPages - 1, currentPage + delta);
    i++
  ) {
    range.push(i);
  }

  if (currentPage - delta > 2) {
    rangeWithDots.push(1, 'ellipsis');
  } else {
    rangeWithDots.push(1);
  }

  rangeWithDots.push(...range);

  if (currentPage + delta < totalPages - 1) {
    rangeWithDots.push('ellipsis', totalPages);
  } else if (totalPages > 1) {
    rangeWithDots.push(totalPages);
  }

  return rangeWithDots;
}

/**
 * Extrae categoría única de un post
 */
export function getPrimaryCategory(post: Post): Category | undefined {
  return post.categories?.[0];
}

// Time unit configuration for relative time formatting
const TIME_UNITS = [
  { seconds: 60, unit: 'minuto', plural: 's', divisor: 60 },
  { seconds: 3600, unit: 'hora', plural: 's', divisor: 3600 },
  { seconds: 86400, unit: 'día', plural: 's', divisor: 86400 },
  { seconds: 604800, unit: 'semana', plural: 's', divisor: 604800 },
  { seconds: 2592000, unit: 'mes', plural: 'es', divisor: 2592000 },
  { seconds: 31536000, unit: 'año', plural: 's', divisor: 31536000 },
] as const;

/**
 * Formatea fecha de publicación de manera relativa
 */
export function getRelativeTime(date: string): string {
  const now = new Date();
  const publishedDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - publishedDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'hace un momento';
  }

  // Find the appropriate time unit
  for (let i = TIME_UNITS.length - 1; i >= 0; i--) {
    const { seconds, unit, plural, divisor } = TIME_UNITS[i];
    if (diffInSeconds >= seconds) {
      const value = Math.floor(diffInSeconds / divisor);
      return `hace ${value} ${unit}${value > 1 ? plural : ''}`;
    }
  }

  // Fallback for less than a minute
  const minutes = Math.floor(diffInSeconds / 60);
  return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
}
