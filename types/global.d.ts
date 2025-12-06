/**
 * Tipos globales del proyecto
 */

// Nullable helpers
export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;

// Async helpers
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> = T extends (
    ...args: unknown[]
  ) => Promise<infer R>
  ? R
  : never;

// ID types
export type ID = string | number;

// Pagination
export interface PaginationParams {
    page: number;
    pageSize: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
}

// SEO Metadata
export interface SeoMetadata {
    title: string;
    description: string;
    keywords?: string[];
    ogImage?: string;
    canonical?: string;
}

// Image
export interface ImageData {
    url: string;
    alt: string;
    width?: number;
    height?: number;
    blurDataURL?: string;
}