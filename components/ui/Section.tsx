import { cva } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '@/lib/utils';
import Container from './Container';

export type SectionBackground =
  | 'default'
  | 'muted'
  | 'accent'
  | 'primary'
  | 'gradient'
  | 'gradient-primary';

export type SectionSpacing = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const sectionVariants = cva('w-full', {
  variants: {
    spacing: {
      none: 'py-0',
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
      xl: 'py-20',
      '2xl': 'py-24',
    } satisfies Record<SectionSpacing, string>,
    background: {
      default: 'bg-background',
      muted: 'bg-muted/50',
      accent: 'bg-accent/50',
      primary: 'bg-primary/5',
      gradient: 'bg-gradient-to-br from-background via-background to-muted/20',
      'gradient-primary': 'bg-gradient-to-br from-primary/5 via-background to-secondary/5',
    } satisfies Record<SectionBackground, string>,
  },
  defaultVariants: {
    spacing: 'xl',
    background: 'default',
  },
});

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  container?: boolean;
  spacing?: SectionSpacing | null;
  background?: SectionBackground | null;
}

function Section({
  className,
  spacing,
  background,
  container = true,
  children,
  ...props
}: SectionProps) {
  const content = container ? <Container>{children}</Container> : children;

  return (
    <section className={cn(sectionVariants({ spacing, background, className }))} {...props}>
      {content}
    </section>
  );
}

function SectionHeader({
  className,
  centered = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  centered?: boolean;
}) {
  return <div className={cn('mb-12', centered && 'text-center', className)} {...props} />;
}

function SectionTitle({
  className,
  size = 'lg',
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const sizeClasses = {
    sm: 'text-2xl font-bold',
    md: 'text-3xl font-bold',
    lg: 'text-4xl font-bold',
    xl: 'text-4xl md:text-5xl font-bold',
  };

  return <h2 className={cn(sizeClasses[size], 'mb-4', className)} {...props} />;
}

function SectionDescription({
  className,
  size = 'md',
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <p className={cn(sizeClasses[size], 'text-muted-foreground max-w-2xl', className)} {...props} />
  );
}

export default Section;
export { Section, SectionHeader, SectionTitle, SectionDescription, sectionVariants };
