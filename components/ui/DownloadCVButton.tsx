import { Download } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { cn } from '@/lib/utils';

interface DownloadCVButtonProps {
  className?: string;
  variant?: 'default' | 'outline';
}

export async function DownloadCVButton({
  className,
  variant = 'default',
}: Readonly<DownloadCVButtonProps>) {
  const t = await getTranslations('Common');
  const locale = await getLocale();
  const pdfHref = locale === 'en' ? '/api/resume?locale=en' : '/api/resume';
  return (
    <a
      href={pdfHref}
      // h-14 + no scale-on-hover to match the CVButton visual language.
      className={cn(
        'btn-cv inline-flex h-14 items-center justify-center gap-2 rounded-lg px-6 font-medium no-underline transition-colors duration-200',
        variant === 'default'
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : 'border-2 border-primary text-primary hover:bg-primary/10',
        className
      )}
      download
    >
      <Download className="w-4 h-4" aria-hidden="true" />
      {t('cvDownload')}
    </a>
  );
}
