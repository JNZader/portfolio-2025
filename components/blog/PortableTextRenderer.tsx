import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from '@portabletext/react';
import Image from 'next/image';
import Link from 'next/link';
import { slugifyHeading } from '@/lib/utils/toc';
import { getImageUrl } from '@/sanity/lib/image';
import { CodeBlock } from './CodeBlock';

interface PortableTextRendererProps {
  value: PortableTextBlock[];
}

const components: PortableTextComponents = {
  block: {
    // Headings con IDs para TOC
    h2: ({ children, value }: { children?: React.ReactNode; value?: unknown }) => {
      const blockValue = value as { children?: Array<{ text?: string }> };
      const text = blockValue?.children?.[0]?.text || '';
      const id = slugifyHeading(text);

      return (
        <h2 id={id} className="mt-12 mb-4 scroll-mt-24 text-3xl font-bold">
          <a
            href={`#${id}`}
            className="group flex items-center gap-2 hover:text-[var(--color-primary)]"
          >
            {children}
            <span className="opacity-0 transition-opacity group-hover:opacity-100">#</span>
          </a>
        </h2>
      );
    },

    h3: ({ children, value }: { children?: React.ReactNode; value?: unknown }) => {
      const blockValue = value as { children?: Array<{ text?: string }> };
      const text = blockValue?.children?.[0]?.text || '';
      const id = slugifyHeading(text);

      return (
        <h3 id={id} className="mt-8 mb-3 scroll-mt-24 text-2xl font-semibold">
          <a
            href={`#${id}`}
            className="group flex items-center gap-2 hover:text-[var(--color-primary)]"
          >
            {children}
            <span className="opacity-0 transition-opacity group-hover:opacity-100">#</span>
          </a>
        </h3>
      );
    },

    h4: ({ children }) => <h4 className="mt-6 mb-2 text-xl font-semibold">{children}</h4>,

    // Párrafos
    normal: ({ children }) => (
      <p className="mb-6 leading-relaxed text-[var(--color-foreground)]">{children}</p>
    ),

    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-[var(--color-primary)] bg-[var(--color-muted)] py-4 pl-6 pr-4 italic">
        {children}
      </blockquote>
    ),
  },

  list: {
    // Listas desordenadas
    bullet: ({ children }) => (
      <ul className="mb-6 ml-6 list-disc space-y-2 marker:text-[var(--color-primary)]">
        {children}
      </ul>
    ),

    // Listas ordenadas
    number: ({ children }) => (
      <ol className="mb-6 ml-6 list-decimal space-y-2 marker:text-[var(--color-primary)]">
        {children}
      </ol>
    ),
  },

  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },

  marks: {
    // Links
    link: ({ children, value }) => {
      const rel = !value?.href?.startsWith('/') ? 'noopener noreferrer' : undefined;
      const target = value?.blank ? '_blank' : undefined;

      return (
        <Link
          href={value?.href || '#'}
          rel={rel}
          target={target}
          className="font-medium text-[var(--color-primary)] underline decoration-[var(--color-primary)]/30 underline-offset-4 transition-colors hover:decoration-[var(--color-primary)]"
        >
          {children}
        </Link>
      );
    },

    // Code inline
    code: ({ children }) => (
      <code className="rounded bg-[var(--color-muted)] px-1.5 py-0.5 font-mono text-sm text-[var(--color-error)]">
        {children}
      </code>
    ),

    // Strong
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,

    // Emphasis
    em: ({ children }) => <em className="italic">{children}</em>,

    // Underline
    underline: ({ children }) => <u className="underline">{children}</u>,

    // Strike-through
    'strike-through': ({ children }) => <s className="line-through">{children}</s>,
  },

  types: {
    // Imágenes inline
    image: ({ value }: { value: unknown }) => {
      const imageValue = value as {
        alt?: string;
        caption?: string;
        asset?: { _ref: string; _type: string };
      };
      const imageUrl = getImageUrl(imageValue, 1200, 800);

      if (!imageUrl) return null;

      return (
        <figure className="my-8">
          <div className="relative aspect-video overflow-hidden rounded-lg border bg-[var(--color-muted)]">
            <Image
              src={imageUrl}
              alt={imageValue.alt || 'Post image'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 900px"
            />
          </div>
          {imageValue.caption && (
            <figcaption className="mt-2 text-center text-sm text-[var(--color-muted-foreground)]">
              {imageValue.caption}
            </figcaption>
          )}
        </figure>
      );
    },

    // Code blocks
    code: ({ value }: { value: unknown }) => {
      const codeValue = value as {
        code: string;
        language?: string;
        filename?: string;
      };
      return (
        <CodeBlock
          code={codeValue.code}
          language={codeValue.language || 'typescript'}
          filename={codeValue.filename}
        />
      );
    },
  },
};

export function PortableTextRenderer({ value }: PortableTextRendererProps) {
  return (
    <div className="prose prose-lg max-w-none">
      <PortableText value={value} components={components} />
    </div>
  );
}
