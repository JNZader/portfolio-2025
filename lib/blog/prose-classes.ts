/**
 * Shared Tailwind Typography container classes used to wrap rendered blog
 * content. Kept in one place so `MarkdownRenderer` (react-markdown, markdown
 * string input) and `PortableTextRenderer` (Sanity Portable Text, block AST
 * input) stay visually consistent without duplicating the class string.
 */
export const PROSE_CLASSES = 'prose prose-lg max-w-none' as const;
