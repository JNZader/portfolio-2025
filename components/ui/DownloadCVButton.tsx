'use client';

import { Download } from 'lucide-react';
import { unlockAchievement } from '@/lib/achievements';
import { cn } from '@/lib/utils';

interface DownloadCVButtonProps {
  className?: string;
  variant?: 'default' | 'outline';
}

export function DownloadCVButton({
  className,
  variant = 'default',
}: Readonly<DownloadCVButtonProps>) {
  const handleDownload = () => {
    unlockAchievement('cv_downloader');
  };

  return (
    <a
      href="/api/resume"
      onClick={handleDownload}
      className={cn(
        'inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105',
        variant === 'default'
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : 'border-2 border-primary text-primary hover:bg-primary/10',
        className
      )}
      download
    >
      <Download className="w-4 h-4" aria-hidden="true" />
      Descargar CV
    </a>
  );
}
