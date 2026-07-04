import { Download, Eye } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface CVButtonProps {
  className?: string;
  /** Href del PDF descargable (acción primaria). Si no se pasa, se resuelve por locale. */
  pdfHref?: string;
  /** Href de la versión HTML indexable. */
  viewHref?: string;
}

// Marker "btn-*" para que el reset global de globals.css
// (`a:not([class*='btn'])`) NO subraye estos anchors. h-14/px-6/rounded-md
// para matchear la altura y el radio de los demás CTA del hero (Button lg).
const HALF_BASE =
  'btn-cv flex h-14 items-center justify-center gap-2 whitespace-nowrap px-6 font-medium no-underline transition-colors duration-200';

/**
 * Botón de CV con acción dividida (segmentado).
 *
 * Dos mitades SIEMPRE visibles: "Descargar CV" (filled, acción primaria) y
 * "Ver" → /cv (versión HTML indexable). No usa hover-expand, así que no
 * mueve el layout, y funciona igual en mobile (no depende de hover). Deja un
 * <a href="/cv"> crawleable en el DOM. Full-width en mobile, content-width en
 * desktop, para alinear con los demás CTA del hero.
 */
export async function CVButton({ className, pdfHref, viewHref = '/cv' }: Readonly<CVButtonProps>) {
  const t = await getTranslations('Common');
  const locale = await getLocale();
  const resolvedPdfHref = pdfHref ?? (locale === 'en' ? '/api/resume?locale=en' : '/api/resume');
  return (
    <div
      className={cn(
        'inline-flex w-full items-stretch overflow-hidden rounded-lg sm:w-auto',
        className
      )}
    >
      {/* Descargar CV — acción primaria, filled. */}
      <a
        href={resolvedPdfHref}
        download
        className={cn(
          HALF_BASE,
          'flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90'
        )}
      >
        <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
        {t('cvDownload')}
      </a>

      {/* Ver — versión HTML, secundaria. Label corto para que no se corte. */}
      <Link
        href={viewHref}
        className={cn(
          HALF_BASE,
          'flex-1 sm:flex-none border-l border-primary/20 bg-primary/10 text-primary hover:bg-primary/20'
        )}
      >
        <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />
        {t('cvView')}
      </Link>
    </div>
  );
}
