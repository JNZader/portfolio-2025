import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ title, description, action }: Readonly<EmptyStateProps>) {
  const t = useTranslations('Blog');
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Icon */}
      <div className="mb-4 rounded-full bg-muted p-6">
        <FileText className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
      </div>

      {/* Text */}
      <h2 className="mb-2 text-xl font-semibold">{title ?? t('emptyTitle')}</h2>
      <p className="mb-6 max-w-md text-muted-foreground">{description ?? t('emptyDescription')}</p>

      {/* Action */}
      {action && (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
