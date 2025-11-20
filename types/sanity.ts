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
	mainImage: Image & {
		alt: string;
	};
	technologies?: string[];
	demoUrl?: string;
	githubUrl?: string;
	featured: boolean;
	publishedAt: string;
	body?: PortableTextBlock[];
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
	body: PortableTextBlock[];
}