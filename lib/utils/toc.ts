import type { PortableTextBlock } from 'sanity';

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface PortableTextChild {
  _type?: string;
  text?: string;
  marks?: string[];
}

/**
 * Genera Table of Contents desde Portable Text
 * Extrae h2 y h3 del body
 */
export function generateTableOfContents(body?: PortableTextBlock[]): TocItem[] {
  if (!body) return [];

  const toc: TocItem[] = [];

  body.forEach((block) => {
    if (block._type === 'block' && (block.style === 'h2' || block.style === 'h3')) {
      const children = block.children as PortableTextChild[] | undefined;
      const text = children?.map((child) => child.text ?? '').join('') ?? '';

      if (text) {
        const id = slugifyHeading(text);
        toc.push({
          id,
          text,
          level: block.style === 'h2' ? 2 : 3,
        });
      }
    }
  });

  return toc;
}

/**
 * Genera Table of Contents desde Markdown
 * Extrae ## y ### del contenido
 */
export function generateTableOfContentsFromMarkdown(markdown: string): TocItem[] {
  const toc: TocItem[] = [];
  const lines = markdown.split('\n');

  const h2Regex = /^## (.+)$/;
  const h3Regex = /^### (.+)$/;

  for (const line of lines) {
    // Match ## and ### headings (not inside code blocks)
    const h2Match = h2Regex.exec(line);
    const h3Match = h3Regex.exec(line);

    if (h2Match) {
      const text = h2Match[1].trim();
      toc.push({
        id: slugifyHeading(text),
        text,
        level: 2,
      });
    } else if (h3Match) {
      const text = h3Match[1].trim();
      toc.push({
        id: slugifyHeading(text),
        text,
        level: 3,
      });
    }
  }

  return toc;
}

/**
 * Convierte heading a slug (para IDs)
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .replaceAll(/[^\w\s-]/g, '')
    .replaceAll(/\s+/g, '-')
    .replaceAll(/--+/g, '-')
    .trim();
}
