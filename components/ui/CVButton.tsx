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
  /** 'filled' (default, acción principal above-fold) o 'outline' (eco callado, p.ej. sidebar). */
  variant?: 'filled' | 'outline';
  /** Fuerza ancho completo en todos los breakpoints (útil dentro de cards angostas). */
  fullWidth?: boolean;
}

// Marker "btn-*" para que el reset global de globals.css
// (`a:not([class*='btn'])`) NO subraye estos anchors. h-14/px-6/rounded-md
// para matchear la altura y el radio de los demás CTA del hero (Button lg).
const HALF_BASE =
  'btn-cv flex h-14 items-center justify-center gap-2 whitespace-nowrap px-6 font-medium no-underline transition-colors duration-200';

/**
 * Botón de CV con acción dividida (segmentado): "CV" dicho UNA sola vez + dos
 * acciones por ícono → [ CV ⬇ │ 👁 ].
 *
 * - Mitad primaria "CV ⬇": descarga el PDF. El texto "CV" va PEGADO al ícono de
 *   descarga (no es una celda muerta), así que todo el bloque es un target
 *   clickeable y obvio como acción principal.
 * - Mitad "👁": navegación visible a /cv (versión HTML indexable), acompaña sin competir.
 *
 * Ambas acciones llevan aria-label (nombre accesible para lectores de pantalla)
 * + title (tooltip en hover, solo desktop), y la navegación a /cv también muestra
 * su nombre para no depender del hover para
 * funcionar. El <a href="/cv"> queda crawleable con su etiqueta visible.
 * filled = acción principal above-fold; outline = eco callado (p.ej. sidebar).
 */
export async function CVButton({
  className,
  pdfHref,
  viewHref = '/cv',
  variant = 'filled',
  fullWidth = false,
}: Readonly<CVButtonProps>) {
  const t = await getTranslations('Common');
  const locale = await getLocale();
  const resolvedPdfHref = pdfHref ?? (locale === 'en' ? '/api/resume?locale=en' : '/api/resume');
  const downloadLabel = t('cvDownload');
  const viewLabel = t('cvView');
  const isOutline = variant === 'outline';
  return (
    <div
      className={cn(
        'inline-flex items-stretch overflow-hidden rounded-lg',
        fullWidth ? 'w-full' : 'w-full sm:w-auto',
        // Outline: el borde envuelve todo el control segmentado (sin fills fuertes).
        isOutline && 'border border-primary/30',
        className
      )}
    >
      {/* CV ⬇ — descarga. "CV" (label visible) + ícono de descarga, un solo target.
          El aria-label/title dan el nombre completo ("Descargar CV"). */}
      <a
        href={resolvedPdfHref}
        download
        aria-label={downloadLabel}
        title={downloadLabel}
        className={cn(
          HALF_BASE,
          fullWidth ? 'flex-1' : 'flex-1 sm:flex-none',
          isOutline
            ? 'text-primary hover:bg-primary/10'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        )}
      >
        CV
        <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
      </a>

      {/* 👁 — versión HTML. El nombre visible evita confundirlo con una previsualización. */}
      <Link
        href={viewHref}
        aria-label={viewLabel}
        title={viewLabel}
        className={cn(
          HALF_BASE,
          'shrink-0 border-l px-4 text-primary',
          isOutline
            ? 'border-primary/25 hover:bg-primary/10'
            : 'border-primary/15 bg-primary/5 hover:bg-primary/15'
        )}
      >
        <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{viewLabel}</span>
      </Link>
    </div>
  );
}
