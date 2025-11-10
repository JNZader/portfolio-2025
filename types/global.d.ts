/**
 * Tipos globales del proyecto
 */

// Nullable helpers
export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;

// Async helpers
export type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
        ...args: any
    ) => Promise<infer R>
    ? R
    : any;

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
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
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