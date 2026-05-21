// @types/react-syntax-highlighter@15 lags behind the v16 package and ships
// only the top-level entry. Declare the deep ESM subpaths used by the lazy
// PrismLight loader so TS 6 stops erroring on TS7016.
declare module 'react-syntax-highlighter/dist/esm/prism-light' {
  import type { ComponentType } from 'react';
  // biome-ignore lint/suspicious/noExplicitAny: upstream ships no types
  const SyntaxHighlighter: ComponentType<any> & {
    // biome-ignore lint/suspicious/noExplicitAny: upstream ships no types
    registerLanguage: (name: string, def: any) => void;
  };
  export default SyntaxHighlighter;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/*' {
  // biome-ignore lint/suspicious/noExplicitAny: prism language definitions are opaque
  const language: any;
  export default language;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  import type { CSSProperties } from 'react';
  export const vscDarkPlus: Record<string, CSSProperties>;
}
