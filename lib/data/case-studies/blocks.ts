import type { PortableTextBlock } from 'sanity';

function span(text: string) {
  return {
    _key:
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 32) || 'span',
    _type: 'span' as const,
    marks: [],
    text,
  };
}

export function block(text: string, style: 'normal' | 'h2' | 'h3' = 'normal'): PortableTextBlock {
  return {
    _key: `${style}-${
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 24) || 'block'
    }`,
    _type: 'block',
    children: [span(text)],
    markDefs: [],
    style,
  } as PortableTextBlock;
}

export function bullet(text: string): PortableTextBlock {
  return {
    _key: `bullet-${
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 24) || 'item'
    }`,
    _type: 'block',
    children: [span(text)],
    level: 1,
    listItem: 'bullet',
    markDefs: [],
    style: 'normal',
  } as PortableTextBlock;
}

// Architecture diagram block (rendered by PortableTextRenderer's `mermaid` type).
// Cast through unknown: this is a custom PortableText block, not a standard one.
export function mermaid(chart: string, caption?: string): PortableTextBlock {
  return {
    _key: `mermaid-${chart.replace(/[^a-z0-9]+/gi, '-').slice(0, 24) || 'diagram'}`,
    _type: 'mermaid',
    chart,
    caption,
  } as unknown as PortableTextBlock;
}
