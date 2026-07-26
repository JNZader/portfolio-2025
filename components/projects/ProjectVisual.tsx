import type { Project } from '@/lib/github/types';

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

export function ProjectVisual({ project }: Readonly<{ project: Project }>) {
  const variant = visualVariant(project);
  const technologies = Array.from(
    new Set(project.tech.length > 0 ? project.tech.slice(0, 3) : [projectInitials(project.title)])
  );

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-primary/15 via-background to-tertiary/15 p-5"
      data-project-visual={variant}
      data-testid="project-visual-fallback"
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
