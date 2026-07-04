import type { Image, PortableTextBlock } from 'sanity';

/**
 * Category
 */
export interface Category {
    _id: string;
    title: string;
    slug: {
        current: string;
    };
    description?: string;
    color?: string;
    postCount?: number;
}

/**
 * Author
 */
export interface Author {
    name: string;
    image?: Image;
    bio?: string;
}

/**
 * Project
 */
export interface Project {
	_id: string;
	_updatedAt?: string;
	title: string;
	slug: {
		current: string;
	};
	excerpt: string;
	excerptEn?: string;
	mainImage?: Image & {
		alt: string;
	};
	technologies?: string[];
	demoUrl?: string;
	githubUrl?: string;
	featured: boolean;
	privateCaseStudy?: boolean;
	repoIsOrigin?: boolean;
	publishedAt: string;
	/** Explicit ordering for curated projects (lower = first). Falls back to
	 *  publishedAt when unset, so GitHub/Sanity-only projects still sort by date. */
	displayOrder?: number;
	body?: PortableTextBlock[];
	bodyEn?: PortableTextBlock[];
}

/**
 * Blog Post
 */
export interface Post {
	_id: string;
	_updatedAt?: string;
	title: string;
	slug: {
		current: string;
	};
	excerpt: string;
	mainImage: Image & {
		alt: string;
	};
	categories: Category[];
	author?: Author;
	publishedAt: string;
	readingTime?: number;
	featured: boolean;
	seo?: {
		metaTitle?: string;
		metaDescription?: string;
		keywords?: string[];
	};
	markdownBody?: string;
	body?: PortableTextBlock[];
	bodyEn?: PortableTextBlock[];
}
