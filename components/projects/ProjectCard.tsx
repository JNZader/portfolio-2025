'use client';

import { ArrowRight, ExternalLink, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Project } from '@/lib/github/types';

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
}

export default function ProjectCard({ project, priority = false }: Readonly<ProjectCardProps>) {
  return (
    <Card
      variant="interactive"
      className="overflow-hidden h-full flex flex-col hover:shadow-primary/10"
    >
      {/* Project Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {project.image ? (
          <>
            <Image
              src={project.image}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              className="object-cover group-hover:scale-110 group-hover:brightness-110 transition-all duration-500"
            />
            {/* Gradient overlay for better badge contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
            <span className="text-sm">Sin imagen</span>
          </div>
        )}

        {/* Featured Badge */}
        {project.featured && (
          <div className="absolute top-4 left-4 animate-scale-in">
            <Badge
              variant="default"
              className="text-xs bg-gradient-to-r from-primary to-primary-600 border-0 shadow-lg shadow-primary/30"
            >
              <Star className="w-3 h-3 mr-1 fill-current animate-glow-pulse" />
              Destacado
            </Badge>
          </div>
        )}

        {/* Source Badge */}
        <div className="absolute top-4 right-4">
          <Badge
            variant="secondary"
            className="text-xs backdrop-blur-sm bg-background/80 border border-border/50 shadow-md"
          >
            {project.source === 'github' ? (
              <>
                <FaGithub className="w-3 h-3 mr-1" />
                GitHub
              </>
            ) : (
              'Curado'
            )}
          </Badge>
        </div>
      </div>

      {/* Project Content */}
      <CardContent className="flex-1 flex flex-col p-6">
        {/* Title */}
        <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2">
          <Link href={`/proyectos/${project.id}`} className="hover:underline underline-offset-4">
            {project.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1 leading-relaxed">
          {project.description}
        </p>

        {/* Stars (for GitHub projects) */}
        {project.source === 'github' && project.stars !== undefined && project.stars > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 group-hover:text-yellow-600 transition-colors">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 group-hover:scale-110 transition-transform" />
            <span className="font-medium">{project.stars}</span>
          </div>
        )}

        {/* Technologies */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tech.slice(0, 4).map((tech, index) => (
            <Badge
              key={tech}
              variant="secondary"
              className="text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200 hover:scale-105"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {tech}
            </Badge>
          ))}
          {project.tech.length > 4 && (
            <Badge
              variant="outline"
              className="text-xs hover:bg-muted transition-colors duration-200"
            >
              +{project.tech.length - 4}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
          <Button variant="ghost" size="sm" asChild className="group/btn">
            <Link href={`/proyectos/${project.id}`}>
              Ver detalles
              <ArrowRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
            </Link>
          </Button>

          <div className="flex space-x-1">
            {project.github && (
              <Button
                size="icon"
                variant="ghost"
                asChild
                className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-110"
              >
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Ver código en GitHub"
                >
                  <FaGithub className="h-4 w-4" />
                </a>
              </Button>
            )}
            {project.demo && (
              <Button
                size="icon"
                variant="ghost"
                asChild
                className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-110"
              >
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Ver demo"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
