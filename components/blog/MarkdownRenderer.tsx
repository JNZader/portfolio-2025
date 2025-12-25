'use client';

import Link from 'next/link';
import type React from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { slugifyHeading } from '@/lib/utils/toc';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
}

/**
 * Safely converts React children to a string
 * Handles objects, arrays, and primitives appropriately
 */
function childrenToString(children: React.ReactNode): string {
  if (children === null || children === undefined) {
    return '';
  }

  if (typeof children === 'string') {
    return children;
  }

  if (typeof children === 'number' || typeof children === 'boolean') {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(childrenToString).join('');
  }

  if (typeof children === 'object' && 'props' in children) {
    const element = children as { props?: { children?: React.ReactNode } };
    if (element.props?.children) {
      return childrenToString(element.props.children);
    }
  }

  // Fallback for other object types
  return '';
}

// Define component renderers outside the function to avoid recreation on every render
const markdownComponents: Components = {
  // Headings con IDs para TOC
  h2: ({ children }: { children?: React.ReactNode }) => {
    const text = childrenToString(children);
    const id = slugifyHeading(text);
    return (
      <h2 id={id} className="mt-12 mb-4 scroll-mt-24 text-3xl font-bold text-foreground">
        <a href={`#${id}`} className="group flex items-center gap-2 hover:text-primary">
          {children}
          <span className="opacity-0 transition-opacity group-hover:opacity-100">#</span>
        </a>
      </h2>
    );
  },

  h3: ({ children }: { children?: React.ReactNode }) => {
    const text = childrenToString(children);
    const id = slugifyHeading(text);
    return (
      <h3 id={id} className="mt-8 mb-3 scroll-mt-24 text-2xl font-semibold text-foreground">
        <a href={`#${id}`} className="group flex items-center gap-2 hover:text-primary">
          {children}
          <span className="opacity-0 transition-opacity group-hover:opacity-100">#</span>
        </a>
      </h3>
    );
  },

  h4: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="mt-6 mb-2 text-xl font-semibold text-foreground">{children}</h4>
  ),

  // Paragraphs
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-6 leading-relaxed text-foreground">{children}</p>
  ),

  // Blockquotes
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-6 border-l-4 border-primary bg-muted py-4 pl-6 pr-4 italic text-foreground">
      {children}
    </blockquote>
  ),

  // Lists
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-6 ml-6 list-disc space-y-2 marker:text-primary">{children}</ul>
  ),

  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-6 ml-6 list-decimal space-y-2 marker:text-primary">{children}</ol>
  ),

  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed text-foreground">{children}</li>
  ),

  // Links
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
    const isExternal = href?.startsWith('http');
    return (
      <Link
        href={href ?? '#'}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        target={isExternal ? '_blank' : undefined}
        className="font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
      >
        {children}
      </Link>
    );
  },

  // Code blocks
  code: ({ className, children }: { className?: string; children?: React.ReactNode }) => {
    const match = /language-(\w+)/.exec(className ?? '');
    const language = match ? match[1] : '';
    const codeString = childrenToString(children).replace(/\n$/, '');

    // Inline code (no language specified and single line)
    if (!match) {
      return (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-error">
          {children}
        </code>
      );
    }

    // Code block
    return <CodeBlock code={codeString} language={language} />;
  },

  // Pre (wrapper for code blocks)
  pre: ({ children }: { children?: React.ReactNode }) => <>{children}</>,

  // Strong
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),

  // Emphasis
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic text-foreground">{children}</em>
  ),

  // Horizontal rule
  hr: () => <hr className="my-8 border-border" />,

  // Tables (GFM)
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-6 overflow-x-auto">
      <table className="min-w-full divide-y divide-border">{children}</table>
    </div>
  ),

  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="bg-muted">{children}</thead>
  ),

  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">{children}</th>
  ),

  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="px-4 py-3 text-sm text-foreground border-t border-border">{children}</td>
  ),
};

export function MarkdownRenderer({ content }: Readonly<MarkdownRendererProps>) {
  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
