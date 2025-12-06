'use client';

import { useState } from 'react';
import { SyntaxHighlighter } from '@/components/blog/SyntaxHighlighter';
import { Button } from '@/components/ui/button';

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
}

export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-6 overflow-hidden rounded-lg border bg-gray-950">
      {/* Header */}
      {(filename || language) && (
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-2">
          <div className="flex items-center gap-2">
            {filename && <span className="text-sm font-mono text-gray-300">{filename}</span>}
            {!filename && language && (
              <span className="text-xs font-mono text-gray-500 uppercase">{language}</span>
            )}
          </div>

          {/* Copy button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 text-xs opacity-0 transition-opacity group-hover:opacity-100"
          >
            {copied ? (
              <>
                <CheckIcon className="mr-1 h-3 w-3" />
                Copiado
              </>
            ) : (
              <>
                <CopyIcon className="mr-1 h-3 w-3" />
                Copiar
              </>
            )}
          </Button>
        </div>
      )}

      {/* Code */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter code={code} language={language} showLineNumbers wrapLines />
      </div>
    </div>
  );
}

// Icons
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <title>Copiar c&oacute;digo</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <title>Copiado</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}
