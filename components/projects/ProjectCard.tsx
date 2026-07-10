'use client';

import { ArrowRight, ExternalLink, Star } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { FaGithub } from 'react-icons/fa';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import type { Project } from '@/lib/github/types';

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
}

function visualVariant(project: Project): number {
  const seed = `${project.id}:${project.title}:${project.tech.join(':')}`;
  let hash = 0;
  for (const character of seed) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return hash % 3;
}

function projectInitials(title: string): string {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
}

function ProjectVisual({ project }: Readonly<{ project: Project }>) {
  const variant = visualVariant(project);
  const technologies = Array.from(
    new Set(project.tech.length > 0 ? project.tech.slice(0, 3) : [projectInitials(project.title)])
  );

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-primary/15 via-background to-tertiary/15 p-5"
      data-project-visual={variant}
      aria-hidden="true"
    >
      <div className="absolute inset-4 rounded-xl border border-primary/10" />
      {variant === 0 && (
        <div className="relative flex w-full max-w-64 items-center justify-between gap-2">
          {technologies.map((technology, index) => (
            <div key={technology} className="contents">
              {index > 0 && <div className="h-px min-w-3 flex-1 bg-primary/40" />}
              <div className="flex min-h-14 min-w-14 items-center justify-center rounded-lg border border-primary/25 bg-background/85 px-2 text-center font-mono text-[10px] font-semibold text-foreground shadow-sm">
                {technology}
              </div>
            </div>
          ))}
        </div>
      )}
      {variant === 1 && (
        <div className="w-full max-w-64 overflow-hidden rounded-xl border border-border/70 bg-gray-950 p-3 font-mono text-[10px] text-gray-300 shadow-lg">
          <div className="mb-3 flex gap-1.5">
            <span className="size-2 rounded-full bg-error" />
            <span className="size-2 rounded-full bg-warning" />
            <span className="size-2 rounded-full bg-success" />
          </div>
          <p className="truncate text-primary-100">
            $ {project.title.toLowerCase().replace(/\s+/g, '-')}
          </p>
          {technologies.map((technology) => (
            <p key={technology} className="mt-1 truncate text-gray-300">
              <span className="text-success">✓</span> {technology}
            </p>
          ))}
        </div>
      )}
      {variant === 2 && (
        <div className="relative flex size-32 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-dashed border-primary/35" />
          <div className="absolute left-0 top-1/2 h-px w-8 bg-primary/35" />
          <div className="absolute right-0 top-1/2 h-px w-8 bg-primary/35" />
          <div className="absolute left-1/2 top-0 h-8 w-px bg-primary/35" />
          <div className="absolute bottom-0 left-1/2 h-8 w-px bg-primary/35" />
          <div className="flex size-16 items-center justify-center rounded-2xl border border-primary/30 bg-background/90 text-lg font-bold text-primary shadow-md">
            {projectInitials(project.title)}
          </div>
          {technologies.slice(0, 2).map((technology, index) => (
            <span
              key={technology}
              className={`absolute rounded-full border border-border bg-background px-2 py-1 font-mono text-[9px] text-muted-foreground shadow-sm ${index === 0 ? '-left-5 top-0' : '-right-5 bottom-0'}`}
            >
              {technology}
            </span>
          ))}
        </div>
      )}
    </div>
  );
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
            <Image
              src={project.image}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              className="object-cover"
            />
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
            className="after:absolute after:inset-0 after:content-['']"
          >
            {project.title}
          </Link>
        </h3>

        {project.privateCaseStudy && (
          <Badge variant="outline" className="mb-3 w-fit text-[11px]">
            Private Case Study
          </Badge>
        )}

        <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        {project.source === 'github' && project.stars !== undefined && project.stars > 0 && (
          <div className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Star className="size-4 fill-yellow-500 text-yellow-500" />
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
            <Link href={`/proyectos/${project.id}`}>
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
