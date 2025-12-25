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
      const text = blockValue?.children?.[0]?.text ?? '';
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

    h3: ({ children, value }: { children?: React.ReactNode; value?: unknown }) => {
      const blockValue = value as { children?: Array<{ text?: string }> };
      const text = blockValue?.children?.[0]?.text ?? '';
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

    h4: ({ children }) => (
      <h4 className="mt-6 mb-2 text-xl font-semibold text-foreground">{children}</h4>
    ),

    // Párrafos
    normal: ({ children }) => <p className="mb-6 leading-relaxed text-foreground">{children}</p>,

    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-primary bg-muted py-4 pl-6 pr-4 italic text-foreground">
        {children}
      </blockquote>
    ),
  },

  list: {
    // Listas desordenadas
    bullet: ({ children }) => (
      <ul className="mb-6 ml-6 list-disc space-y-2 marker:text-primary">{children}</ul>
    ),

    // Listas ordenadas
    number: ({ children }) => (
      <ol className="mb-6 ml-6 list-decimal space-y-2 marker:text-primary">{children}</ol>
    ),
  },

  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed text-foreground">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed text-foreground">{children}</li>,
  },

  marks: {
    // Links
    link: ({ children, value }) => {
      const rel = value?.href?.startsWith('/') ? undefined : 'noopener noreferrer';
      const target = value?.blank ? '_blank' : undefined;

      return (
        <Link
          href={value?.href ?? '#'}
          rel={rel}
          target={target}
          className="font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
        >
          {children}
        </Link>
      );
    },

    // Code inline
    code: ({ children }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-error">
        {children}
      </code>
    ),

    // Strong
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,

    // Emphasis
    em: ({ children }) => <em className="italic text-foreground">{children}</em>,

    // Underline
    underline: ({ children }) => <u className="underline text-foreground">{children}</u>,

    // Strike-through
    'strike-through': ({ children }) => <s className="line-through text-foreground">{children}</s>,
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
          <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
            <Image
              src={imageUrl}
              alt={imageValue.alt ?? 'Post image'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 900px"
            />
          </div>
          {imageValue.caption && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
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
          language={codeValue.language ?? 'typescript'}
          filename={codeValue.filename}
        />
      );
    },
  },
};

export function PortableTextRenderer({ value }: Readonly<PortableTextRendererProps>) {
  return (
    <div className="prose prose-lg max-w-none">
      <PortableText value={value} components={components} />
    </div>
  );
}
