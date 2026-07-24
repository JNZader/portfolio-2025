import { ArrowLeft, Download, ExternalLink, Mail, Star } from 'lucide-react';
import Image from 'next/image';
import type { getTranslations } from 'next-intl/server';
import { FaGithub } from 'react-icons/fa';
import type { BreadcrumbList, CreativeWork, SoftwareSourceCode, WithContext } from 'schema-dts';
import { PortableTextRenderer } from '@/components/blog/PortableTextRenderer';
import { MarkdownContent } from '@/components/markdown/MarkdownContent';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import { Link } from '@/i18n/navigation';
import type { Project } from '@/lib/github/types';
import { getTechIcon } from '@/lib/utils/tech-icons';

interface ProjectDetailProps {
  project: Project;
  locale: string;
  t: Awaited<ReturnType<typeof getTranslations>>;
  tMarkdown: Awaited<ReturnType<typeof getTranslations>>;
  body: Project['body'];
  readme: string | null;
  repoInfo: { owner: string; repo: string } | undefined;
  hasLinks: boolean;
  projectSchema: WithContext<SoftwareSourceCode | CreativeWork>;
  breadcrumbSchema: WithContext<BreadcrumbList>;
}

export function ProjectDetail({
  project,
  locale,
  t,
  tMarkdown,
  body,
  readme,
  repoInfo,
  hasLinks,
  projectSchema,
  breadcrumbSchema,
}: Readonly<ProjectDetailProps>) {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <JsonLd data={projectSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* Breadcrumbs */}
      <Container className="pt-8 pb-4">
        <Breadcrumbs
          items={[
            { name: t('breadcrumbHome'), href: '/' },
            { name: t('breadcrumbProjects'), href: '/proyectos' },
            { name: project.title, href: `/proyectos/${project.id}` },
          ]}
        />
      </Container>

      {/* Back Button */}
      <div className="border-b border-border">
        <Container>
          <div className="py-4">
            <Link
              href="/proyectos"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToProjects')}
            </Link>
          </div>
        </Container>
      </div>

      {/* Project Hero */}
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Project Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline" className="text-sm">
                  {project.source === 'github' ? 'GitHub' : t('curated')}
                </Badge>
                {project.featured && (
                  <Badge variant="default" className="text-sm bg-primary">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    {t('featured')}
                  </Badge>
                )}
              </div>

              <h1 className="text-display-lg text-4xl md:text-5xl font-bold mb-4">
                {project.title}
              </h1>

              <p className="text-xl text-muted-foreground mb-6">{project.description}</p>

              {/* Stars (for GitHub projects) */}
              {project.source === 'github' && project.stars !== undefined && project.stars > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span>
                    {project.stars} {t('stars')}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              {hasLinks && (
                <div className="flex flex-wrap gap-4">
                  {project.demo && (
                    <Button asChild>
                      <a href={project.demo} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {t('viewDemo')}
                      </a>
                    </Button>
                  )}
                  {project.github && (
                    <Button variant="outline" asChild>
                      <a href={project.github} target="_blank" rel="noopener noreferrer">
                        <FaGithub className="mr-2 h-4 w-4" />
                        {project.repoIsOrigin ? t('viewOrigin') : t('viewCode')}
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Project Image */}
            {project.image && (
              <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-12 bg-muted">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Project Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-6">{t('descriptionHeading')}</h2>
                {body && body.length > 0 ? (
                  <PortableTextRenderer value={body} />
                ) : readme ? (
                  <MarkdownContent
                    content={readme}
                    repoInfo={repoInfo}
                    labels={{ list: tMarkdown('list'), table: tMarkdown('table') }}
                  />
                ) : (
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Technologies */}
                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold mb-4">{t('technologies')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => {
                      const { icon: TechIcon, color } = getTechIcon(tech);
                      return (
                        <span
                          key={tech}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs rounded-full transition-all duration-200 hover:scale-105"
                        >
                          <TechIcon className={`w-3.5 h-3.5 ${color}`} />
                          {tech}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Project Info */}
                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold mb-4">{t('info')}</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">{t('sourceLabel')}</span>
                      <span className="ml-2 text-muted-foreground">
                        {project.source === 'github' ? 'GitHub' : t('curated')}
                      </span>
                    </div>
                    {project.featured && (
                      <div>
                        <span className="font-medium">{t('statusLabel')}</span>
                        <span className="ml-2 text-muted-foreground">{t('featured')}</span>
                      </div>
                    )}
                    {project.stars !== undefined && project.stars > 0 && (
                      <div>
                        <span className="font-medium">{t('starsLabel')}</span>
                        <span className="ml-2 text-muted-foreground">{project.stars}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Links */}
                {hasLinks && (
                  <div className="bg-card p-6 rounded-lg border border-border">
                    <h3 className="text-lg font-semibold mb-4">{t('links')}</h3>
                    <div className="space-y-3">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                        >
                          <FaGithub className="h-4 w-4" />
                          {project.repoIsOrigin ? t('repoOrigin') : t('repoGithub')}
                        </a>
                      )}
                      {project.demo && (
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {t('liveDemo')}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Closing conversion CTA */}
            <div className="mt-16 text-center bg-card p-8 md:p-12 rounded-xl border border-border">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">{t('ctaHeading')}</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">{t('ctaBody')}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/contacto">
                    <Mail className="mr-2 h-4 w-4" />
                    {t('contact')}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href={locale === 'en' ? '/api/resume?locale=en' : '/api/resume'} download>
                    <Download className="mr-2 h-4 w-4" />
                    {t('downloadCv')}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
