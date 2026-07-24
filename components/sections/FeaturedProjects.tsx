import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { FeaturedProjectCard } from '@/components/projects/FeaturedProjectCard';
import { Button } from '@/components/ui/button';
import Section, { SectionDescription, SectionHeader, SectionTitle } from '@/components/ui/Section';
import { Link } from '@/i18n/navigation';
import { getSanityProjects } from '@/lib/data/projects-page';
import { selectFeaturedProjects } from '@/lib/utils/projects';

interface FeaturedProjectsProps {
  locale: string;
}

export async function FeaturedProjects({ locale }: Readonly<FeaturedProjectsProps>) {
  const t = await getTranslations('Home');
  const tProjects = await getTranslations('Projects');
  const projects = await getSanityProjects(locale);
  const featuredProjects = selectFeaturedProjects(projects);

  if (featuredProjects.length === 0) {
    return null;
  }

  return (
    <Section className="content-auto">
      <SectionHeader centered>
        <SectionTitle>{t('featuredProjectsTitle')}</SectionTitle>
        <SectionDescription className="mx-auto">{t('featuredProjectsSubtitle')}</SectionDescription>
      </SectionHeader>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {featuredProjects.map((project) => (
          <FeaturedProjectCard
            key={project.id}
            project={project}
            badgeCuratedLabel={tProjects('badgeCurated')}
            viewDetailsLabel={tProjects('viewDetails')}
          />
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
