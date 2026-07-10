import {
  ArrowRight,
  Braces,
  Database,
  Mail,
  MessageSquare,
  Newspaper,
  Rss,
  Send,
  Server,
  Sparkles,
} from 'lucide-react';
import type { ReactNode } from 'react';
import Container from '@/components/ui/Container';
import { cn } from '@/lib/utils';

const HERO_VARIANTS = {
  PROJECTS: 'projects',
  CONTACT: 'contact',
  BLOG: 'blog',
  NEWSLETTER: 'newsletter',
  ABOUT: 'about',
} as const;

type HeroVariant = (typeof HERO_VARIANTS)[keyof typeof HERO_VARIANTS];

interface InteriorHeroProps {
  title: ReactNode;
  description: ReactNode;
  variant: HeroVariant;
  /** Right-column content that replaces the decorative motif card (e.g. a profile photo). */
  media?: ReactNode;
  /** Optional CTA(s) rendered under the description (e.g. the CV button). */
  actions?: ReactNode;
}

// Each variant positions/colors the single blurred blob to vary the composition.
const BLOB_BY_VARIANT: Record<HeroVariant, string> = {
  projects: '-right-24 -top-32 bg-primary/10',
  contact: '-bottom-36 -left-24 bg-tertiary/10',
  blog: '-right-24 -top-32 bg-primary/10',
  newsletter: '-bottom-36 -left-24 bg-tertiary/10',
  about: '-right-24 -top-32 bg-primary/10',
};

function ProjectsMotif() {
  return (
    <div
      className="relative mx-auto flex h-48 w-full max-w-sm items-center justify-center"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute left-1/2 top-1/2 h-2/3 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
      <div className="z-10 flex size-20 items-center justify-center rounded-2xl border border-primary/30 bg-background/90 text-primary shadow-lg">
        <Braces className="size-9" />
      </div>
      <div className="absolute left-4 top-4 flex size-12 items-center justify-center rounded-xl border bg-card text-muted-foreground shadow-sm">
        <Database className="size-5" />
      </div>
      <div className="absolute right-4 top-4 flex size-12 items-center justify-center rounded-xl border bg-card text-muted-foreground shadow-sm">
        <Server className="size-5" />
      </div>
      <div className="absolute bottom-2 right-1/2 flex h-10 translate-x-1/2 items-center gap-2 rounded-lg border bg-card px-3 font-mono text-[10px] text-muted-foreground shadow-sm">
        <span className="size-1.5 rounded-full bg-success" />
        API / build / ship
      </div>
    </div>
  );
}

function ContactMotif() {
  return (
    <div
      className="relative mx-auto flex h-48 w-full max-w-sm items-center justify-center"
      aria-hidden="true"
    >
      <div className="absolute left-8 top-5 max-w-52 rounded-2xl rounded-bl-sm border bg-card px-4 py-3 shadow-sm">
        <span className="block h-2 w-28 rounded-full bg-primary/25" />
        <span className="mt-2 block h-2 w-20 rounded-full bg-muted-foreground/15" />
      </div>
      <div className="absolute bottom-5 right-8 max-w-52 rounded-2xl rounded-br-sm border border-primary/25 bg-primary/10 px-4 py-3 shadow-sm">
        <span className="block h-2 w-24 rounded-full bg-primary/35" />
        <span className="mt-2 block h-2 w-32 rounded-full bg-primary/20" />
      </div>
      <div className="z-10 flex size-20 items-center justify-center rounded-full border border-primary/30 bg-background text-primary shadow-lg">
        <Mail className="size-8" />
      </div>
      <MessageSquare className="absolute bottom-7 left-8 size-5 text-muted-foreground/40" />
      <ArrowRight className="absolute right-12 top-10 size-5 text-primary/40" />
    </div>
  );
}

function BlogMotif() {
  return (
    <div
      className="relative mx-auto flex h-48 w-full max-w-sm items-center justify-center"
      aria-hidden="true"
    >
      <div className="absolute left-6 top-6 h-28 w-48 -rotate-3 rounded-2xl border bg-card shadow-sm" />
      <div className="absolute bottom-6 right-6 h-28 w-48 rotate-2 rounded-2xl border border-primary/25 bg-primary/5 shadow-sm" />
      <div className="z-10 flex size-20 items-center justify-center rounded-2xl border border-primary/30 bg-background/90 text-primary shadow-lg">
        <Newspaper className="size-9" />
      </div>
      <div className="absolute left-10 top-10 flex size-10 items-center justify-center rounded-lg border bg-card text-muted-foreground shadow-sm">
        <Rss className="size-4" />
      </div>
    </div>
  );
}

function NewsletterMotif() {
  return (
    <div
      className="relative mx-auto flex h-48 w-full max-w-sm items-center justify-center"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-1/2 h-2/3 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
      <div className="z-10 flex size-20 items-center justify-center rounded-2xl border border-primary/30 bg-background/90 text-primary shadow-lg">
        <Mail className="size-8" />
      </div>
      <div className="absolute right-6 top-6 flex size-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary shadow-sm">
        <Send className="size-5" />
      </div>
      <Sparkles className="absolute bottom-8 left-8 size-5 text-primary/40" />
      <div className="absolute bottom-4 right-1/2 flex h-9 translate-x-1/2 items-center gap-2 rounded-lg border bg-card px-3 text-[10px] text-muted-foreground shadow-sm">
        <span className="size-1.5 rounded-full bg-success" />
        double opt-in
      </div>
    </div>
  );
}

const MOTIF_BY_VARIANT: Partial<Record<HeroVariant, ReactNode>> = {
  projects: <ProjectsMotif />,
  contact: <ContactMotif />,
  blog: <BlogMotif />,
  newsletter: <NewsletterMotif />,
};

/**
 * Shared hero for interior pages (projects, contact, blog, newsletter, about).
 * Left column: accent bar + title + description + optional actions.
 * Right column: a `media` slot (e.g. profile photo) when provided, otherwise a
 * decorative motif card chosen by `variant`. Keeps every interior page on one
 * visual language; the full-screen landing hero (`HeroSection`) is separate.
 */
export function InteriorHero({
  title,
  description,
  variant,
  media,
  actions,
}: Readonly<InteriorHeroProps>) {
  return (
    <section className="relative overflow-hidden border-b py-16 md:py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/8 via-background to-tertiary/8" />
      <div
        className={cn('absolute -z-10 size-72 rounded-full blur-3xl', BLOB_BY_VARIANT[variant])}
      />
      <Container>
        <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)] md:gap-14">
          <div className="max-w-2xl">
            <div className="mb-5 h-1 w-16 rounded-full bg-gradient-to-r from-primary to-tertiary" />
            <h1 className="text-display-lg text-4xl md:text-5xl">{title}</h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
              {description}
            </p>
            {actions && <div className="mt-8">{actions}</div>}
          </div>
          {media ? (
            <div className="flex justify-center md:justify-end">{media}</div>
          ) : (
            <div className="rounded-3xl border border-border/70 bg-card/55 p-4 shadow-sm backdrop-blur-sm md:p-6">
              {MOTIF_BY_VARIANT[variant]}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
