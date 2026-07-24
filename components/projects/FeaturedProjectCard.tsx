'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import type { Project } from '@/lib/github/types';

interface FeaturedProjectCardProps {
  project: Project;
}

export function FeaturedProjectCard({ project }: Readonly<FeaturedProjectCardProps>) {
  const t = useTranslations('Projects');

  return (
    <Card
      variant="interactive"
      className="relative h-full overflow-hidden focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-ring/40"
    >
      <div className="absolute right-4 top-4">
        <Badge
          variant="secondary"
          className="border border-border/50 bg-background/85 shadow-sm backdrop-blur-sm"
        >
          {project.source === 'github' ? 'GitHub' : t('badgeCurated')}
        </Badge>
      </div>

      <CardContent className="flex flex-1 flex-col p-6 pt-14">
        <h3 className="mb-3 line-clamp-2 text-xl font-semibold">
          <Link
            href={`/proyectos/${project.id}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {project.title}
          </Link>
        </h3>

        <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {project.tech.slice(0, 3).map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
          {project.tech.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{project.tech.length - 3}
            </Badge>
          )}
        </div>

        <div className="mt-auto flex items-center border-t border-border/50 pt-4">
          <Button variant="ghost" size="sm" asChild className="group/btn relative z-10">
            <Link href={`/proyectos/${project.id}`}>
              {t('viewDetails')}
              <ArrowRight className="ml-1 size-4 transition-transform group-hover/btn:translate-x-1 motion-reduce:transition-none" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
