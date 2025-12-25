'use client';

import { CheckSquare, Code, ExternalLink, Info, List, Square, Table, Terminal } from 'lucide-react';
import React from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { SyntaxHighlighter } from '@/components/blog/SyntaxHighlighter';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

// Helper to safely extract text content from React nodes
function getTextContent(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return node.toString();
  if (Array.isArray(node)) return node.map(getTextContent).join('');
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return getTextContent(props.children);
  }
  return '';
}

// Extract components outside the parent component to avoid S6478
const markdownComponents: Components = {
  // Headings
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold mb-6 mt-8 pb-2 border-b-2 border-primary/20 flex items-center gap-2">
      <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary-600 rounded-full" />
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-semibold mb-4 mt-8 flex items-center gap-2">
      <div className="w-1 h-6 bg-gradient-to-b from-primary to-tertiary rounded-full" />
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-semibold mb-3 mt-6 text-primary">{children}</h3>
  ),
  h4: ({ children }) => <h4 className="text-lg font-semibold mb-2 mt-4">{children}</h4>,

  // Paragraphs
  p: ({ children }) => <p className="mb-4 leading-relaxed text-muted-foreground">{children}</p>,

  // Lists
  ul: ({ children }) => (
    <ul className="mb-4 space-y-2 ml-6 list-none">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <List className="w-3 h-3" />
        <span>Lista</span>
      </div>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 space-y-2 ml-6 list-decimal list-inside">{children}</ol>
  ),
  li: ({ children, ...props }) => {
    // Check if it's a task list item
    const childString = getTextContent(children);
    if (childString.includes('[ ]') || childString.includes('[x]')) {
      const isChecked = childString.includes('[x]');
      const text = childString.replace(/\[[x ]]\s*/, '');
      return (
        <li className="flex items-start gap-2" {...props}>
          {isChecked ? (
            <CheckSquare className="w-4 h-4 mt-1 text-success flex-shrink-0" />
          ) : (
            <Square className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
          )}
          <span className={isChecked ? 'line-through text-muted-foreground' : ''}>{text}</span>
        </li>
      );
    }
    return (
      <li
        className="flex items-start gap-2 before:content-['▸'] before:text-primary before:font-bold"
        {...props}
      >
        <span className="flex-1">{children}</span>
      </li>
    );
  },

  // Links
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary hover:text-primary-700 dark:hover:text-primary-600 underline underline-offset-2 transition-colors"
    >
      {children}
      <ExternalLink className="w-3 h-3" />
    </a>
  ),

  // Code blocks
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className ?? '');
    const language = match ? match[1] : '';

    return match ? (
      <div className="relative group my-6">
        <div className="absolute -top-8 left-0 flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-mono rounded-t-md">
          <Terminal className="w-3 h-3" />
          {language}
        </div>
        <div className="rounded-lg bg-[#282c34] shadow-lg overflow-hidden">
          <SyntaxHighlighter
            code={getTextContent(children).replace(/\n$/, '')}
            language={language}
            showLineNumbers
            wrapLines
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
            }}
          />
        </div>
      </div>
    ) : (
      <code
        className="px-2 py-1 bg-muted text-primary rounded text-sm font-mono inline-flex items-center gap-1"
        {...props}
      >
        <Code className="w-3 h-3" />
        {children}
      </code>
    );
  },

  // Blockquotes
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-primary/30 pl-4 py-2 my-6 bg-primary/5 rounded-r-lg">
      <div className="flex items-start gap-2">
        <Info className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
        <div className="flex-1 text-muted-foreground italic">{children}</div>
      </div>
    </blockquote>
  ),

  // Tables
  table: ({ children }) => (
    <div className="my-6 overflow-hidden rounded-lg border border-border shadow-sm">
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border">
        <Table className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">Tabla</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">{children}</table>
      </div>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted/30 border-b border-border">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
  tr: ({ children }) => <tr className="hover:bg-muted/30 transition-colors">{children}</tr>,
  th: ({ children }) => (
    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">{children}</th>
  ),
  td: ({ children }) => <td className="px-4 py-3 text-sm text-muted-foreground">{children}</td>,

  // Horizontal rule
  hr: () => <hr className="my-8 border-t border-border" />,

  // Images
  img: ({ alt, src, ...props }) => {
    // Detect badges/shields (common patterns)
    const srcStr = typeof src === 'string' ? src : '';
    const altStr = typeof alt === 'string' ? alt : '';

    // Safely parse hostname to prevent URL substring manipulation attacks
    let hostname: string | null = null;
    try {
      const url = new URL(srcStr, 'https://example.com');
      hostname = url.hostname.toLowerCase();
    } catch {
      hostname = null;
    }

    // Check against known badge provider hostnames (secure hostname comparison)
    const isBadgeHost =
      hostname === 'shields.io' ||
      hostname === 'img.shields.io' ||
      hostname === 'travis-ci.org' ||
      hostname === 'travis-ci.com' ||
      hostname === 'coveralls.io' ||
      hostname === 'badgen.net' ||
      hostname?.endsWith('.shields.io') ||
      hostname?.endsWith('.travis-ci.org') ||
      hostname?.endsWith('.coveralls.io');

    // Additional heuristics for badge detection (path-based, not host-based)
    const isBadgePattern =
      srcStr.includes('/badge') ||
      srcStr.includes('flat-square') ||
      (srcStr.endsWith('.svg') &&
        (altStr.toLowerCase().includes('license') ||
          altStr.toLowerCase().includes('build') ||
          altStr.toLowerCase().includes('coverage') ||
          altStr.toLowerCase().includes('version')));

    const isBadge = isBadgeHost || isBadgePattern;

    // Render badges inline
    if (isBadge) {
      return (
        // biome-ignore lint/performance/noImgElement: external images from README need native img
        <img
          src={src}
          alt={alt ?? ''}
          className="inline-block h-5 mr-1 align-middle"
          loading="lazy"
          {...props}
        />
      );
    }

    // Render regular images with wrapper
    return (
      <div className="my-6 rounded-lg overflow-hidden border border-border shadow-md">
        {/* biome-ignore lint/performance/noImgElement: external images from README need native img */}
        <img src={src} alt={alt ?? ''} className="w-full h-auto" loading="lazy" {...props} />
        {alt && (
          <div className="px-4 py-2 bg-muted/50 text-xs text-muted-foreground text-center">
            {alt}
          </div>
        )}
      </div>
    );
  },

  // Preformatted text (fallback for non-code blocks)
  pre: ({ children }) => (
    <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm my-4">{children}</pre>
  ),

  // Strong/Bold
  strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,

  // Emphasis/Italic
  em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,

  // Delete/Strikethrough
  del: ({ children }) => <del className="line-through text-muted-foreground">{children}</del>,
};

export function MarkdownContent({ content, className = '' }: Readonly<MarkdownContentProps>) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
