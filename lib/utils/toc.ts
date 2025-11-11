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
export function generateTableOfContents(body: PortableTextBlock[]): TocItem[] {
  const toc: TocItem[] = [];

  body.forEach((block) => {
    if (block._type === 'block' && (block.style === 'h2' || block.style === 'h3')) {
      const children = block.children as PortableTextChild[] | undefined;
      const text = children?.map((child) => child.text || '').join('') || '';

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
 * Convierte heading a slug (para IDs)
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}
