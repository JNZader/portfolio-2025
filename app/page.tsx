import { Award, Briefcase, Target, TrendingUp } from 'lucide-react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { RevealOnScroll, StaggeredReveal } from '@/components/animations';
import { NewsletterSkeleton } from '@/components/newsletter/NewsletterSkeleton';
import { HeroSection } from '@/components/sections/hero-section';
import { JsonLd } from '@/components/seo/JsonLd';
import Section, {
  SECTION_BG,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from '@/components/ui/Section';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { SkillsList } from '@/components/ui/SkillsList';
import { SKILLS_DATA_HOME } from '@/lib/constants';
import { generatePersonSchema, generateWebSiteSchema } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: 'Inicio',
  description:
    'Desarrollador backend con más de 20 años en tecnología. Experiencia en soporte técnico, mantenimiento de sistemas y desarrollo de software con Java, Spring Boot y React.',
  openGraph: {
    title: 'Javier Zader - Backend Developer',
    description:
      'Desarrollador backend con más de 20 años en tecnología. Especializado en Java, Spring Boot y React.',
  },
};

// Lazy load newsletter component (below the fold)
const NewsletterHero = dynamic(
  () =>
    import('@/components/newsletter/NewsletterHero').then((mod) => ({
      default: mod.NewsletterHero,
    })),
  {
    loading: () => <NewsletterSkeleton />,
    ssr: true,
  }
);

const STATS = [
  { value: '20+', label: 'Años en Tecnología', icon: TrendingUp },
  { value: '15+', label: 'Proyectos Completados', icon: Briefcase },
  { value: '4+', label: 'Certificaciones', icon: Award },
  { value: '100%', label: 'Compromiso', icon: Target },
];

export default function HomePage() {
  // Generate structured data schemas
  const personSchema = generatePersonSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <>
      {/* Structured Data */}
      <JsonLd data={personSchema} />
      <JsonLd data={websiteSchema} />

      {/* Hero Section */}
      <HeroSection
        greeting="¡Hola!"
        jobTitle="Backend Developer · Java & Spring Boot"
        title="Javier Zader"
        description="Desarrollador backend con más de 20 años en tecnología. Experiencia en soporte técnico, mantenimiento de sistemas y desarrollo de software con Java, Spring Boot y React."
        primaryCta={{
          text: 'Ver Proyectos',
          href: '/proyectos',
        }}
        secondaryCta={{
          text: 'Contactar',
          href: '/contacto',
        }}
        socialLinks={{
          github: 'https://github.com/JNZader',
          linkedin: 'https://www.linkedin.com/in/jnzader/',
          cv: '/api/resume',
        }}
      />

      {/* Quick Stats - below the fold, use content-visibility */}
      <Section background={SECTION_BG.MUTED} spacing="lg" className="content-auto">
        <StaggeredReveal
          staggerDelay={0.1}
          className="flex flex-wrap justify-center gap-8 md:gap-16"
        >
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="text-center group card-hover p-6 rounded-xl bg-card/50 border border-transparent hover:border-primary/20"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-display text-primary">{stat.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </StaggeredReveal>
      </Section>

      {/* Decorative Divider */}
      <SectionDivider variant="gradient" />

      {/* About Preview - below the fold, use content-visibility */}
      <Section id="content" className="content-auto">
        <RevealOnScroll>
          <SectionHeader centered>
            <SectionTitle>Sobre Mí</SectionTitle>
            <SectionDescription className="mx-auto">
              Desarrollador apasionado por crear soluciones tecnológicas robustas y escalables
            </SectionDescription>
          </SectionHeader>
        </RevealOnScroll>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <RevealOnScroll className="lg:col-span-2">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Mi Trayectoria</h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p>
                      Con más de 20 años en el mundo tecnológico, mi camino comenzó en soporte
                      técnico y mantenimiento de equipos, lo que me dio una base sólida para
                      entender los sistemas desde su núcleo.
                    </p>
                    <p>
                      Esa experiencia práctica me llevó naturalmente al desarrollo de software,
                      donde hoy me especializo en Java y Spring Boot. Siempre estoy aprendiendo
                      nuevas tecnologías para seguir creciendo profesionalmente.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Mi Enfoque</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                    <li>Arquitecturas escalables y modulares</li>
                    <li>Código limpio, mantenible y bien documentado</li>
                    <li>Testing exhaustivo para garantizar calidad</li>
                    <li>Optimización continua de rendimiento</li>
                  </ul>
                </div>
              </div>
            </RevealOnScroll>

            {/* Sidebar */}
            <RevealOnScroll delay={0.2}>
              <div className="space-y-6">
                {/* Skills Card */}
                <div className="glass-card p-6 rounded-xl card-hover">
                  <h3 className="text-lg font-bold mb-4 heading-accent">Habilidades Técnicas</h3>
                  <div className="space-y-4">
                    <SkillsList title="Backend" skills={SKILLS_DATA_HOME.backend} />
                    <SkillsList title="Frontend" skills={SKILLS_DATA_HOME.frontend} />
                    <SkillsList title="DevOps" skills={SKILLS_DATA_HOME.devops} />
                  </div>
                </div>

                {/* Experience Card */}
                <div className="glass-card p-6 rounded-xl card-hover">
                  <h3 className="text-lg font-bold mb-4 heading-accent">Experiencia</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm">Backend Developer</h4>
                      <p className="text-xs text-muted-foreground">20+ años en tecnología</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Certificaciones</h4>
                      <p className="text-xs text-muted-foreground">4+ certificaciones técnicas</p>
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </Section>

      {/* Decorative Divider */}
      <SectionDivider variant="dots" />

      {/* Newsletter Section */}
      <Suspense fallback={<NewsletterSkeleton />}>
        <NewsletterHero />
      </Suspense>
    </>
  );
}
