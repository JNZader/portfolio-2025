import { Download, Eye } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CVButtonProps {
  className?: string;
  /** Href del PDF descargable (acción primaria). */
  pdfHref?: string;
  /** Href de la versión HTML indexable. */
  viewHref?: string;
}

/**
 * Botón de CV con acción dividida.
 *
 * En reposo muestra solo "Descargar CV" (filled, acción primaria). Al hacer
 * hover o foco con teclado (desktop) revela a su izquierda "Ver online" → /cv.
 * En dispositivos sin hover (touch) ambas opciones quedan SIEMPRE visibles, así
 * que la versión HTML del CV es alcanzable en mobile y deja un <a href="/cv">
 * crawleable en el DOM. CSS puro, sin JavaScript.
 */
export function CVButton({
  className,
  pdfHref = '/api/resume',
  viewHref = '/cv',
}: Readonly<CVButtonProps>) {
  return (
    <div className={cn('group inline-flex items-stretch overflow-hidden rounded-lg', className)}>
      {/* Ver online — colapsado en reposo; se revela on hover/focus o en touch. */}
      <Link
        href={viewHref}
        className={cn(
          'flex items-center gap-2 whitespace-nowrap border-2 border-r-0 border-primary',
          'bg-primary/10 font-medium text-primary',
          'max-w-0 overflow-hidden px-0 opacity-0',
          'transition-all duration-200 ease-out',
          'group-hover:max-w-[12rem] group-hover:px-5 group-hover:opacity-100',
          'group-focus-within:max-w-[12rem] group-focus-within:px-5 group-focus-within:opacity-100',
          '[@media(hover:none)]:max-w-[12rem] [@media(hover:none)]:px-5 [@media(hover:none)]:opacity-100'
        )}
      >
        <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />
        Ver online
      </Link>

      {/* Descargar CV — acción primaria, siempre visible. */}
      <a
        href={pdfHref}
        download
        className={cn(
          'flex items-center gap-2 whitespace-nowrap rounded-lg bg-primary px-6 py-3',
          'font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90',
          'group-hover:rounded-l-none group-focus-within:rounded-l-none [@media(hover:none)]:rounded-l-none'
        )}
      >
        <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
        Descargar CV
      </a>
    </div>
  );
}
