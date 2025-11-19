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
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      {/* Project Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-sm">Sin imagen</span>
          </div>
        )}

        {/* Featured Badge */}
        {project.featured && (
          <div className="absolute top-4 left-4">
            <Badge variant="default" className="text-xs bg-primary">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Destacado
            </Badge>
          </div>
        )}

        {/* Source Badge */}
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="text-xs">
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

        {/* Quick Actions - appear on hover */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
          {project.github && (
            <Button size="icon" variant="secondary" asChild className="h-8 w-8 shadow-md">
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver código en GitHub"
                onClick={(e) => e.stopPropagation()}
              >
                <FaGithub className="h-4 w-4" />
              </a>
            </Button>
          )}
          {project.demo && (
            <Button size="icon" variant="secondary" asChild className="h-8 w-8 shadow-md">
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver demo"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Project Content */}
      <CardContent className="flex-1 flex flex-col p-6">
        {/* Title */}
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
          <Link href={`/proyectos/${project.id}`}>{project.title}</Link>
        </h3>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
          {project.description}
        </p>

        {/* Stars (for GitHub projects) */}
        {project.source === 'github' && project.stars !== undefined && project.stars > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span>{project.stars}</span>
          </div>
        )}

        {/* Technologies */}
        <div className="flex flex-wrap gap-1 mb-4">
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

        {/* Actions */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/proyectos/${project.id}`}>
              Ver detalles
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>

          <div className="flex space-x-1">
            {project.github && (
              <Button size="icon" variant="ghost" asChild className="h-8 w-8">
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
              <Button size="icon" variant="ghost" asChild className="h-8 w-8">
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
