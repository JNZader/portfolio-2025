'use client';

import { useEffect, useId, useRef, useState } from 'react';

interface MermaidDiagramProps {
  chart: string;
}

/**
 * Renders a Mermaid diagram from a text definition.
 * Uses dynamic import to avoid loading mermaid on pages that don't need it.
 * Supports both light and dark themes via CSS media query detection.
 */
export function MermaidDiagram({ chart }: Readonly<MermaidDiagramProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const uniqueId = useId().replace(/:/g, '-');

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      try {
        const mermaid = (await import('mermaid')).default;

        // Detect current theme
        const isDark =
          document.documentElement.classList.contains('dark') ||
          window.matchMedia('(prefers-color-scheme: dark)').matches;

        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          securityLevel: 'strict',
          fontFamily: 'inherit',
        });

        const { svg } = await mermaid.render(`mermaid${uniqueId}`, chart.trim());

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error rendering diagram');
          setIsLoading(false);
        }
      }
    }

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [chart, uniqueId]);

  if (error) {
    return (
      <div className="my-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm text-destructive font-medium mb-2">Error rendering Mermaid diagram</p>
        <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-lg border border-border bg-card p-4 overflow-x-auto">
      {isLoading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
          Loading diagram...
        </div>
      )}
      <div ref={containerRef} className="flex justify-center [&>svg]:max-w-full" />
    </div>
  );
}
