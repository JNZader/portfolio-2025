import {
  Award,
  Briefcase,
  Code2,
  Database,
  GitBranch,
  Layers,
  Palette,
  Server,
  Target,
  TrendingUp,
} from 'lucide-react';
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
import { generatePersonSchema, generateWebSiteSchema } from '@/lib/seo/schema';

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

export default function HomePage() {
  // Generate structured data schemas
  const personSchema = generatePersonSchema();
  const websiteSchema = generateWebSiteSchema();

  const stats = [
    { value: '20+', label: 'Años en Tecnología', icon: TrendingUp },
    { value: '15+', label: 'Proyectos Completados', icon: Briefcase },
    { value: '4+', label: 'Certificaciones', icon: Award },
    { value: '100%', label: 'Compromiso', icon: Target },
  ];

  const skillsData = {
    backend: [
      { name: 'Java', icon: Code2, color: 'text-orange-600 dark:text-orange-400' },
      { name: 'Spring Boot', icon: Layers, color: 'text-green-600 dark:text-green-400' },
      { name: 'PostgreSQL', icon: Database, color: 'text-blue-600 dark:text-blue-400' },
      { name: 'APIs REST', icon: Server, color: 'text-purple-600 dark:text-purple-400' },
    ],
    frontend: [
      { name: 'React', icon: Code2, color: 'text-cyan-600 dark:text-cyan-400' },
      { name: 'Next.js', icon: Layers, color: 'text-gray-900 dark:text-white' },
      { name: 'TypeScript', icon: Code2, color: 'text-blue-600 dark:text-blue-400' },
      { name: 'Tailwind', icon: Palette, color: 'text-teal-600 dark:text-teal-400' },
    ],
    devops: [
      { name: 'Docker', icon: Server, color: 'text-blue-600 dark:text-blue-400' },
      { name: 'Git', icon: GitBranch, color: 'text-orange-600 dark:text-orange-400' },
      { name: 'CI/CD', icon: Target, color: 'text-green-600 dark:text-green-400' },
      { name: 'Linux', icon: Server, color: 'text-yellow-600 dark:text-yellow-400' },
    ],
  };

  return (
    <>
      {/* Structured Data */}
      <JsonLd data={personSchema} />
      <JsonLd data={websiteSchema} />

      {/* Hero Section */}
      <HeroSection
        greeting="Hola! Soy Javier Zader"
        title="Backend Java Developer"
        subtitle="especializado en Spring Boot"
        description="Creo soluciones robustas y escalables combinando más de 20 años de experiencia en tecnología con frameworks modernos. Especializado en Java, Spring Boot, React y arquitecturas de microservicios."
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
        }}
      />

      {/* Quick Stats */}
      <Section background={SECTION_BG.MUTED} spacing="lg">
        <StaggeredReveal
          staggerDelay={0.1}
          className="flex flex-wrap justify-center gap-8 md:gap-16"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center group">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-primary group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </StaggeredReveal>
      </Section>

      {/* Decorative Divider */}
      <SectionDivider variant="gradient" />

      {/* About Preview */}
      <Section id="content">
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
                      Con más de 20 años en el mundo tecnológico, he evolucionado desde
                      administrador de sistemas hasta desarrollador backend especializado en Java y
                      Spring Boot.
                    </p>
                    <p>
                      Me apasiona resolver problemas complejos mediante código elegante y eficiente.
                      Siempre estoy aprendiendo nuevas tecnologías y mejores prácticas para
                      mantenerme actualizado en este campo en constante evolución.
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
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="text-lg font-bold mb-4">Habilidades Técnicas</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Backend</h4>
                      <div className="flex flex-wrap gap-2">
                        {skillsData.backend.map((skill) => {
                          const SkillIcon = skill.icon;
                          return (
                            <span
                              key={skill.name}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs rounded-full transition-all duration-200 hover:scale-105"
                            >
                              <SkillIcon className={`w-3.5 h-3.5 ${skill.color}`} />
                              {skill.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">Frontend</h4>
                      <div className="flex flex-wrap gap-2">
                        {skillsData.frontend.map((skill) => {
                          const SkillIcon = skill.icon;
                          return (
                            <span
                              key={skill.name}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs rounded-full transition-all duration-200 hover:scale-105"
                            >
                              <SkillIcon className={`w-3.5 h-3.5 ${skill.color}`} />
                              {skill.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">DevOps</h4>
                      <div className="flex flex-wrap gap-2">
                        {skillsData.devops.map((skill) => {
                          const SkillIcon = skill.icon;
                          return (
                            <span
                              key={skill.name}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs rounded-full transition-all duration-200 hover:scale-105"
                            >
                              <SkillIcon className={`w-3.5 h-3.5 ${skill.color}`} />
                              {skill.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Experience Card */}
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="text-lg font-bold mb-4">Experiencia</h3>
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
