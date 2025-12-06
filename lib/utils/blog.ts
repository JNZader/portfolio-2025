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

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `hace ${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `hace ${diffInYears} año${diffInYears > 1 ? 's' : ''}`;
}
