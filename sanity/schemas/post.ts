import { defineField, defineType } from 'sanity';
import { DocumentTextIcon } from '@sanity/icons';

export default defineType({
    name: 'post',
    title: 'Blog Post',
    type: 'document',
    icon: DocumentTextIcon,
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required().min(10).max(100),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'excerpt',
            title: 'Excerpt',
            type: 'text',
            rows: 4,
            description: 'Short summary for SEO and preview cards',
            validation: (Rule) => Rule.required().min(100).max(300),
        }),
        defineField({
            name: 'mainImage',
            title: 'Main Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            fields: [
                {
                    name: 'alt',
                    type: 'string',
                    title: 'Alternative text',
                    validation: (Rule) => Rule.required(),
                },
            ],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'categories',
            title: 'Categories',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'category' }] }],
            validation: (Rule) => Rule.required().min(1).max(3),
        }),
        defineField({
            name: 'author',
            title: 'Author',
            type: 'object',
            fields: [
                { name: 'name', type: 'string', title: 'Name' },
                { name: 'image', type: 'image', title: 'Image' },
                { name: 'bio', type: 'text', title: 'Bio', rows: 2 },
            ],
        }),
        defineField({
            name: 'publishedAt',
            title: 'Published at',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'readingTime',
            title: 'Reading Time (minutes)',
            type: 'number',
            description: 'Auto-calculated, but can be overridden',
        }),
        defineField({
            name: 'featured',
            title: 'Featured',
            type: 'boolean',
            description: 'Show this post in featured section',
            initialValue: false,
        }),
        defineField({
            name: 'seo',
            title: 'SEO',
            type: 'object',
            fields: [
                {
                    name: 'metaTitle',
                    type: 'string',
                    title: 'Meta Title',
                    description: 'Override default title for SEO',
                },
                {
                    name: 'metaDescription',
                    type: 'text',
                    title: 'Meta Description',
                    rows: 3,
                    validation: (Rule) => Rule.max(160),
                },
                {
                    name: 'keywords',
                    type: 'array',
                    title: 'Keywords',
                    of: [{ type: 'string' }],
                },
            ],
            options: {
                collapsible: true,
                collapsed: true,
            },
        }),
        defineField({
            name: 'markdownBody',
            title: 'Body (Markdown)',
            type: 'markdown',
            description: 'Write content in Markdown - easier for copy/paste. If both fields have content, Markdown takes priority.',
        }),
        defineField({
            name: 'body',
            title: 'Body (Rich Text)',
            type: 'array',
            description: 'Alternative: Use the visual editor. Only used if Markdown Body is empty.',
            of: [
                {
                    type: 'block',
                    styles: [
                        { title: 'Normal', value: 'normal' },
                        { title: 'H2', value: 'h2' },
                        { title: 'H3', value: 'h3' },
                        { title: 'H4', value: 'h4' },
                        { title: 'Quote', value: 'blockquote' },
                    ],
                    lists: [
                        { title: 'Bullet', value: 'bullet' },
                        { title: 'Numbered', value: 'number' },
                    ],
                    marks: {
                        decorators: [
                            { title: 'Strong', value: 'strong' },
                            { title: 'Emphasis', value: 'em' },
                            { title: 'Code', value: 'code' },
                            { title: 'Underline', value: 'underline' },
                            { title: 'Strike', value: 'strike-through' },
                        ],
                        annotations: [
                            {
                                name: 'link',
                                type: 'object',
                                title: 'Link',
                                fields: [
                                    {
                                        name: 'href',
                                        type: 'url',
                                        title: 'URL',
                                        validation: (Rule) =>
                                            Rule.uri({
                                                allowRelative: true,
                                                scheme: ['http', 'https', 'mailto', 'tel'],
                                            }),
                                    },
                                    {
                                        name: 'blank',
                                        type: 'boolean',
                                        title: 'Open in new tab',
                                        initialValue: true,
                                    },
                                ],
                            },
                        ],
                    },
                },
                {
                    type: 'image',
                    options: { hotspot: true },
                    fields: [
                        {
                            name: 'alt',
                            type: 'string',
                            title: 'Alternative text',
                            validation: (Rule) => Rule.required(),
                        },
                        {
                            name: 'caption',
                            type: 'string',
                            title: 'Caption',
                        },
                    ],
                },
                {
                    type: 'code',
                    title: 'Code Block',
                    options: {
                        language: 'typescript',
                        languageAlternatives: [
                            { title: 'TypeScript', value: 'typescript' },
                            { title: 'JavaScript', value: 'javascript' },
                            { title: 'JSX', value: 'jsx' },
                            { title: 'HTML', value: 'html' },
                            { title: 'CSS', value: 'css' },
                            { title: 'SCSS', value: 'scss' },
                            { title: 'JSON', value: 'json' },
                            { title: 'Markdown', value: 'markdown' },
                            { title: 'Bash', value: 'bash' },
                            { title: 'Python', value: 'python' },
                            { title: 'SQL', value: 'sql' },
                        ],
                        withFilename: true,
                    },
                },
            ],
        }),
    ],
    preview: {
        select: {
            title: 'title',
            author: 'author.name',
            media: 'mainImage',
            categories: 'categories',
        },
        prepare(selection) {
            const { title, author, media } = selection;
            return {
                title,
                subtitle: author ? `by ${author}` : 'No author',
                media,
            };
        },
    },
    orderings: [
        {
            title: 'Published Date, New',
            name: 'publishedAtDesc',
            by: [{ field: 'publishedAt', direction: 'desc' }],
        },
        {
            title: 'Featured First',
            name: 'featuredFirst',
            by: [
                { field: 'featured', direction: 'desc' },
                { field: 'publishedAt', direction: 'desc' },
            ],
        },
    ],
});