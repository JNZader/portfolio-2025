import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { ProjectVisual } from '@/components/projects/ProjectVisual';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import type { Project } from '@/lib/github/types';

interface FeaturedProjectCardProps {
  project: Project;
  badgeCuratedLabel: string;
  sourceGithubLabel: string;
  viewDetailsLabel: string;
  spotlight?: boolean;
}

export function FeaturedProjectCard({
  project,
  badgeCuratedLabel,
  sourceGithubLabel,
  viewDetailsLabel,
  spotlight = false,
}: Readonly<FeaturedProjectCardProps>) {
  return (
    <Card
      variant="interactive"
      className="relative h-full overflow-hidden focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-ring/40"
    >
      <div className="relative h-48 overflow-hidden bg-muted md:h-56">
        {project.image ? (
          <>
            <Image
              src={project.image}
              alt=""
              fill
              sizes={spotlight ? '(max-width: 768px) 85vw, 58vw' : '(max-width: 768px) 85vw, 32vw'}
              priority={spotlight}
              data-testid="project-image"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
          </>
        ) : (
          <ProjectVisual project={project} />
        )}
        <div className="absolute right-4 top-4">
          <Badge
            variant="secondary"
            className="border border-border/50 bg-background/85 shadow-sm backdrop-blur-sm"
          >
            {project.source === 'github' ? sourceGithubLabel : badgeCuratedLabel}
          </Badge>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col p-6">
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
              {viewDetailsLabel}
              <ArrowRight className="ml-1 size-4 transition-transform group-hover/btn:translate-x-1 motion-reduce:transition-none" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
