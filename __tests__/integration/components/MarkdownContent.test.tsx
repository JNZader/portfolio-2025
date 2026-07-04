import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MarkdownContent } from '@/components/markdown/MarkdownContent';

// The two heavy client children lazy-load via next/dynamic (SyntaxHighlighter)
// and run mermaid (MermaidDiagram). We mock them with deterministic stand-ins so
// the fenced-code assertion is synchronous and these tests focus on the
// markdown rendering + sanitization surface, not on syntax highlighting internals.
vi.mock('@/components/blog/SyntaxHighlighter', () => ({
  SyntaxHighlighter: ({ code, language }: { code: string; language: string }) => (
    <pre data-testid="syntax-highlighter" data-language={language}>
      {code}
    </pre>
  ),
}));

vi.mock('@/components/markdown/MermaidDiagram', () => ({
  MermaidDiagram: ({ chart }: { chart: string }) => (
    <div data-testid="mermaid-diagram">{chart}</div>
  ),
}));

describe('MarkdownContent', () => {
  describe('basic markdown rendering', () => {
    it('renders headings, paragraph, list, code block and link', () => {
      const content = [
        '# Título principal',
        '',
        'Un párrafo de ejemplo.',
        '',
        '- primer item',
        '- segundo item',
        '',
        '```javascript',
        'const x = 1;',
        '```',
        '',
        '[GitHub](https://github.com/JNZader)',
      ].join('\n');

      const { container } = render(<MarkdownContent content={content} />);

      // Heading
      const h1 = container.querySelector('h1');
      expect(h1).not.toBeNull();
      expect(h1?.textContent).toContain('Título principal');

      // Paragraph
      expect(container.querySelector('p')?.textContent).toContain('Un párrafo de ejemplo.');

      // List items render
      const listItems = container.querySelectorAll('li');
      expect(listItems.length).toBe(2);
      expect(listItems[0].textContent).toContain('primer item');
      expect(listItems[1].textContent).toContain('segundo item');

      // Fenced code block routed through the (mocked) SyntaxHighlighter
      const highlighter = container.querySelector('[data-testid="syntax-highlighter"]');
      expect(highlighter).not.toBeNull();
      expect(highlighter?.getAttribute('data-language')).toBe('javascript');
      expect(highlighter?.textContent).toContain('const x = 1;');

      // Link: real <a href>
      const anchor = container.querySelector('a');
      expect(anchor).not.toBeNull();
      expect(anchor?.getAttribute('href')).toBe('https://github.com/JNZader');
    });

    it('applies the custom ▸ bullet marker on non-task list items', () => {
      const { container } = render(<MarkdownContent content={'- solo item'} />);
      const li = container.querySelector('li');
      expect(li).not.toBeNull();
      // The ▸ marker is a CSS ::before pseudo-element declared via a utility class.
      expect(li?.className).toContain("before:content-['▸']");
    });
  });

  describe('sanitization / XSS neutralization', () => {
    it('strips raw <script> tags and never executes them', () => {
      // biome-ignore lint/suspicious/noExplicitAny: test-only global probe
      (window as any).__xss = undefined;
      const content = 'Antes\n\n<script>window.__xss = 1</script>\n\nDespués';

      const { container } = render(<MarkdownContent content={content} />);

      expect(container.querySelector('script')).toBeNull();
      // biome-ignore lint/suspicious/noExplicitAny: test-only global probe
      expect((window as any).__xss).toBeUndefined();
    });

    it('strips inline event handlers (onerror) from raw <img>', () => {
      // biome-ignore lint/suspicious/noExplicitAny: test-only global probe
      (window as any).__xss = undefined;
      const content = '<img src="x" onerror="window.__xss = 1">';

      const { container } = render(<MarkdownContent content={content} />);

      const img = container.querySelector('img');
      expect(img).not.toBeNull();
      expect(img?.getAttribute('onerror')).toBeNull();
      // biome-ignore lint/suspicious/noExplicitAny: test-only global probe
      expect((window as any).__xss).toBeUndefined();
    });

    it('neutralizes javascript: URLs in links', () => {
      const content = '[click](javascript:alert(1))';

      const { container } = render(<MarkdownContent content={content} />);

      const anchor = container.querySelector('a');
      // Anchor may exist but its href must NOT be a javascript: URL.
      const href = anchor?.getAttribute('href') ?? '';
      expect(href.toLowerCase().startsWith('javascript:')).toBe(false);
    });
  });

  describe('GitHub image URL transform', () => {
    const repoInfo = { owner: 'JNZader', repo: 'ghagga', branch: 'main' } as const;

    it('rewrites a relative image src to raw.githubusercontent.com', () => {
      const { container } = render(
        <MarkdownContent content={'![logo](assets/logo.png)'} repoInfo={repoInfo} />
      );

      const img = container.querySelector('img');
      expect(img).not.toBeNull();
      expect(img?.getAttribute('src')).toBe(
        'https://raw.githubusercontent.com/JNZader/ghagga/main/assets/logo.png'
      );
    });

    it('strips a single leading ./ or / from the relative path', () => {
      const { container } = render(
        <MarkdownContent content={'![logo](./docs/logo.png)'} repoInfo={repoInfo} />
      );

      expect(container.querySelector('img')?.getAttribute('src')).toBe(
        'https://raw.githubusercontent.com/JNZader/ghagga/main/docs/logo.png'
      );
    });

    it('defaults the branch to main when repoInfo.branch is omitted', () => {
      const { container } = render(
        <MarkdownContent
          content={'![logo](assets/logo.png)'}
          repoInfo={{ owner: 'JNZader', repo: 'ghagga' }}
        />
      );

      expect(container.querySelector('img')?.getAttribute('src')).toBe(
        'https://raw.githubusercontent.com/JNZader/ghagga/main/assets/logo.png'
      );
    });

    it('leaves an absolute https:// image src unchanged', () => {
      const { container } = render(
        <MarkdownContent
          content={'![pic](https://example.com/pic.png)'}
          repoInfo={repoInfo}
        />
      );

      expect(container.querySelector('img')?.getAttribute('src')).toBe(
        'https://example.com/pic.png'
      );
    });

    it('rewrites a github.com blob URL to a raw URL even without repoInfo', () => {
      const { container } = render(
        <MarkdownContent
          content={'![img](https://github.com/foo/bar/blob/dev/path/img.png)'}
        />
      );

      expect(container.querySelector('img')?.getAttribute('src')).toBe(
        'https://raw.githubusercontent.com/foo/bar/dev/path/img.png'
      );
    });
  });
});
