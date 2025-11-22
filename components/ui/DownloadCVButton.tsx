'use client';

import { Download } from 'lucide-react';
import { unlockAchievement } from '@/lib/achievements';

interface DownloadCVButtonProps {
  className?: string;
  variant?: 'default' | 'outline';
}

export function DownloadCVButton({ className = '', variant = 'default' }: DownloadCVButtonProps) {
  const handleDownload = () => {
    unlockAchievement('cv_downloader');
  };

  const baseStyles =
    'inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105';
  const variantStyles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10',
  };

  return (
    <a
      href="/api/resume"
      onClick={handleDownload}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      download
    >
      <Download className="w-4 h-4" />
      Descargar CV
    </a>
  );
}
