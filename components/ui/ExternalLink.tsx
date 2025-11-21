import Link from 'next/link';
import type { ComponentProps } from 'react';
import { trackExternalLink } from '@/lib/analytics/events';

interface ExternalLinkProps extends Omit<ComponentProps<typeof Link>, 'onClick'> {
  href: string;
  children: React.ReactNode;
  trackLabel?: string;
}

/**
 * External link component with analytics tracking
 * Automatically opens in new tab and tracks click events
 */
export function ExternalLink({ href, children, trackLabel, ...props }: ExternalLinkProps) {
  const handleClick = () => {
    const label = trackLabel || (typeof children === 'string' ? children : href);
    trackExternalLink(href, label);
  };

  return (
    <Link href={href} onClick={handleClick} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </Link>
  );
}
