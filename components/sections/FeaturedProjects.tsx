import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { FeaturedProjectCard } from '@/components/projects/FeaturedProjectCard';
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

  const [spotlight, ...railProjects] = projects;

  return (
    <Section id="featured-projects" className="content-auto">
      <SectionHeader centered>
        <SectionTitle>{t('featuredProjectsTitle')}</SectionTitle>
        <SectionDescription className="mx-auto">{t('featuredProjectsSubtitle')}</SectionDescription>
      </SectionHeader>

      <div
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain pb-4"
        data-testid="featured-projects-rail"
        data-scroll-snap="x mandatory"
      >
        <div
          className="w-[85%] shrink-0 snap-start md:w-[58%]"
          data-testid="featured-project-spotlight"
          data-featured-project-role="spotlight"
        >
          <FeaturedProjectCard
            project={spotlight}
            spotlight
            badgeCuratedLabel={tProjects('badgeCurated')}
            sourceGithubLabel={tProjects('sourceGithub')}
            viewDetailsLabel={tProjects('viewDetails')}
          />
        </div>
        {railProjects.map((project) => (
          <div
            key={project.id}
            className="w-[85%] shrink-0 snap-start md:w-[32%]"
            data-testid="featured-project-rail-card"
            data-featured-project-role="rail"
          >
            <FeaturedProjectCard
              project={project}
              badgeCuratedLabel={tProjects('badgeCurated')}
              sourceGithubLabel={tProjects('sourceGithub')}
              viewDetailsLabel={tProjects('viewDetails')}
            />
          </div>
        ))}
      </div>

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
