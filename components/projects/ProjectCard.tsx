'use client';

import { ArrowRight, ExternalLink, Star } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { FaGithub } from 'react-icons/fa';
import { ViewTransitionBoundary } from '@/components/page-transition';
import { ProjectVisual } from '@/components/projects/ProjectVisual';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import type { Project } from '@/lib/github/types';

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
}

export default function ProjectCard({ project, priority = false }: Readonly<ProjectCardProps>) {
  const t = useTranslations('Projects');

  return (
    <Card
      variant="interactive"
      className="relative h-full overflow-hidden focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-ring/40"
    >
      <div className="relative h-48 overflow-hidden bg-muted">
        {project.image ? (
          <>
            <ViewTransitionBoundary name={`project-${project.id}`} share="morph" default="none">
              <Image
                src={project.image}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={priority}
                className="object-cover"
              />
            </ViewTransitionBoundary>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
          </>
        ) : (
          <ProjectVisual project={project} />
        )}

        {project.featured && (
          <div className="absolute left-4 top-4">
            <Badge variant="default" className="border-0 bg-primary shadow-md">
              <Star className="mr-1 size-3 fill-current" />
              {t('badgeFeatured')}
            </Badge>
          </div>
        )}

        <div className="absolute right-4 top-4">
          <Badge
            variant="secondary"
            className="border border-border/50 bg-background/85 shadow-sm backdrop-blur-sm"
          >
            {project.source === 'github' ? (
              <>
                <FaGithub className="mr-1 size-3" />
                {t('sourceGithub')}
              </>
            ) : (
              t('badgeCurated')
            )}
          </Badge>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col p-6">
        <h3 className="mb-3 line-clamp-2 text-xl font-semibold">
          <Link
            href={`/proyectos/${project.id}`}
            transitionTypes={['nav-forward']}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {project.title}
          </Link>
        </h3>

        {project.privateCaseStudy && (
          <Badge variant="outline" className="mb-3 w-fit text-[11px]">
            {t('privateCaseStudy')}
          </Badge>
        )}

        <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        {project.source === 'github' && project.stars !== undefined && project.stars > 0 && (
          <div className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Star className="size-4 fill-warning text-warning" />
            <span className="font-medium">{project.stars}</span>
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-1.5">
          {project.tech.slice(0, 4).map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
          {project.tech.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{project.tech.length - 4}
            </Badge>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-4">
          <Button variant="ghost" size="sm" asChild className="group/btn relative z-10">
            <Link href={`/proyectos/${project.id}`} transitionTypes={['nav-forward']}>
              {t('viewDetails')}
              <ArrowRight className="ml-1 size-4 transition-transform group-hover/btn:translate-x-1 motion-reduce:transition-none" />
            </Link>
          </Button>

          <div className="relative z-10 flex gap-1">
            {project.github && (
              <Button size="icon" variant="ghost" asChild>
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('viewRepoAria', { title: project.title })}
                >
                  <FaGithub className="size-4" />
                </a>
              </Button>
            )}
            {project.demo && (
              <Button size="icon" variant="ghost" asChild>
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('viewDemoAria', { title: project.title })}
                >
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
