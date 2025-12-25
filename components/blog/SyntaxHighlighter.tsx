'use client';

import dynamic from 'next/dynamic';
import { type CSSProperties, Suspense } from 'react';

// Loading skeleton for code blocks
function CodeSkeleton() {
  return (
    <div className="animate-pulse bg-gray-900 rounded-lg p-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-800 rounded w-3/4" />
        <div className="h-4 bg-gray-800 rounded w-1/2" />
        <div className="h-4 bg-gray-800 rounded w-5/6" />
        <div className="h-4 bg-gray-800 rounded w-2/3" />
      </div>
    </div>
  );
}

// Lazy load the syntax highlighter - reduces initial bundle significantly
// Uses PrismLight for smaller bundle (only loads needed languages)
const LazyHighlighter = dynamic(
  () =>
    import('react-syntax-highlighter/dist/esm/prism-light').then(async (mod) => {
      const SyntaxHighlighter = mod.default;

      // Import only the languages we need
      const [
        javascript,
        typescript,
        jsx,
        tsx,
        css,
        json,
        bash,
        markdown,
        python,
        sql,
        yaml,
        go,
        rust,
      ] = await Promise.all([
        import('react-syntax-highlighter/dist/esm/languages/prism/javascript'),
        import('react-syntax-highlighter/dist/esm/languages/prism/typescript'),
        import('react-syntax-highlighter/dist/esm/languages/prism/jsx'),
        import('react-syntax-highlighter/dist/esm/languages/prism/tsx'),
        import('react-syntax-highlighter/dist/esm/languages/prism/css'),
        import('react-syntax-highlighter/dist/esm/languages/prism/json'),
        import('react-syntax-highlighter/dist/esm/languages/prism/bash'),
        import('react-syntax-highlighter/dist/esm/languages/prism/markdown'),
        import('react-syntax-highlighter/dist/esm/languages/prism/python'),
        import('react-syntax-highlighter/dist/esm/languages/prism/sql'),
        import('react-syntax-highlighter/dist/esm/languages/prism/yaml'),
        import('react-syntax-highlighter/dist/esm/languages/prism/go'),
        import('react-syntax-highlighter/dist/esm/languages/prism/rust'),
      ]);

      // Register languages
      SyntaxHighlighter.registerLanguage('javascript', javascript.default);
      SyntaxHighlighter.registerLanguage('js', javascript.default);
      SyntaxHighlighter.registerLanguage('typescript', typescript.default);
      SyntaxHighlighter.registerLanguage('ts', typescript.default);
      SyntaxHighlighter.registerLanguage('jsx', jsx.default);
      SyntaxHighlighter.registerLanguage('tsx', tsx.default);
      SyntaxHighlighter.registerLanguage('css', css.default);
      SyntaxHighlighter.registerLanguage('json', json.default);
      SyntaxHighlighter.registerLanguage('bash', bash.default);
      SyntaxHighlighter.registerLanguage('shell', bash.default);
      SyntaxHighlighter.registerLanguage('sh', bash.default);
      SyntaxHighlighter.registerLanguage('markdown', markdown.default);
      SyntaxHighlighter.registerLanguage('md', markdown.default);
      SyntaxHighlighter.registerLanguage('python', python.default);
      SyntaxHighlighter.registerLanguage('py', python.default);
      SyntaxHighlighter.registerLanguage('sql', sql.default);
      SyntaxHighlighter.registerLanguage('yaml', yaml.default);
      SyntaxHighlighter.registerLanguage('yml', yaml.default);
      SyntaxHighlighter.registerLanguage('go', go.default);
      SyntaxHighlighter.registerLanguage('rust', rust.default);
      SyntaxHighlighter.registerLanguage('rs', rust.default);

      return SyntaxHighlighter;
    }),
  {
    ssr: false,
    loading: () => <CodeSkeleton />,
  }
);

// Import style separately (this will be tree-shaken properly)
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SyntaxHighlighterProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  wrapLines?: boolean;
  customStyle?: CSSProperties;
  className?: string;
}

export function SyntaxHighlighter({
  code,
  language,
  showLineNumbers = true,
  wrapLines = true,
  customStyle,
  className,
}: Readonly<SyntaxHighlighterProps>) {
  return (
    <Suspense fallback={<CodeSkeleton />}>
      <LazyHighlighter
        language={language.toLowerCase()}
        style={vscDarkPlus}
        showLineNumbers={showLineNumbers}
        wrapLines={wrapLines}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '0.875rem',
          ...customStyle,
        }}
        className={className}
      >
        {code}
      </LazyHighlighter>
    </Suspense>
  );
}

export { CodeSkeleton };
