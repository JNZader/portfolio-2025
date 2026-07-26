import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { FeaturedProjectCard } from '@/components/projects/FeaturedProjectCard';
import { FeaturedProjectsRail } from '@/components/projects/FeaturedProjectsRail';
import { Button } from '@/components/ui/button';
import Section, { SectionDescription, SectionHeader, SectionTitle } from '@/components/ui/Section';
import { Link } from '@/i18n/navigation';
import { getSanityProjects } from '@/lib/data/projects-page';
import type { Project } from '@/lib/github/types';
import { selectFeaturedProjects } from '@/lib/utils/projects';

interface FeaturedProjectsProps {
  locale: string;
  featuredProjects?: Project[];
}

export async function FeaturedProjects({
  locale,
  featuredProjects,
}: Readonly<FeaturedProjectsProps>) {
  const t = await getTranslations('Home');
  const tProjects = await getTranslations('Projects');
  const projects = featuredProjects ?? selectFeaturedProjects(await getSanityProjects(locale));

  if (projects.length === 0) {
    return null;
  }

  return (
    <Section id="featured-projects" className="content-auto">
      <SectionHeader centered>
        <SectionTitle>{t('featuredProjectsTitle')}</SectionTitle>
        <SectionDescription className="mx-auto">{t('featuredProjectsSubtitle')}</SectionDescription>
      </SectionHeader>

      <FeaturedProjectsRail itemCount={projects.length}>
        {projects.map((project) => (
          <li
            key={project.id}
            className="flex basis-[86%] shrink-0 snap-start md:basis-[calc((100%_-_1.5rem)/2)] lg:basis-[calc((100%_-_3rem)/3)]"
            data-testid="featured-project-card"
            data-featured-project-item
          >
            <FeaturedProjectCard
              project={project}
              badgeCuratedLabel={tProjects('badgeCurated')}
              sourceGithubLabel={tProjects('sourceGithub')}
              viewDetailsLabel={tProjects('viewDetails')}
            />
          </li>
        ))}
      </FeaturedProjectsRail>

      <div className="mt-12 flex justify-center">
        <Button variant="default" size="lg" asChild className="group/btn">
          <Link href="/proyectos">
            {t('featuredProjectsCta')}
            <ArrowRight className="ml-1 size-4 transition-transform group-hover/btn:translate-x-1 motion-reduce:transition-none" />
          </Link>
        </Button>
      </div>
    </Section>
  );
}
