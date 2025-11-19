import { RevealOnScroll, StaggeredReveal } from '@/components/animations';
import { NewsletterHero } from '@/components/newsletter/NewsletterHero';
import { HeroSection } from '@/components/sections/hero-section';
import Section, { SectionDescription, SectionHeader, SectionTitle } from '@/components/ui/Section';

export default function HomePage() {
  const stats = [
    { value: '20+', label: 'Años en Tecnología' },
    { value: '15+', label: 'Proyectos Completados' },
    { value: '4+', label: 'Certificaciones' },
    { value: '100%', label: 'Compromiso' },
  ];

  return (
    <>
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
      <Section background="muted" spacing="lg">
        <StaggeredReveal
          staggerDelay={0.1}
          className="flex flex-wrap justify-center gap-8 md:gap-16"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold text-primary">{stat.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </StaggeredReveal>
      </Section>

      {/* About Preview */}
      <Section>
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
                      <div className="flex flex-wrap gap-1">
                        {['Java', 'Spring Boot', 'PostgreSQL', 'APIs REST'].map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">Frontend</h4>
                      <div className="flex flex-wrap gap-1">
                        {['React', 'Next.js', 'TypeScript', 'Tailwind'].map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">DevOps</h4>
                      <div className="flex flex-wrap gap-1">
                        {['Docker', 'Git', 'CI/CD', 'Linux'].map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                          >
                            {skill}
                          </span>
                        ))}
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

      {/* Newsletter Section */}
      <NewsletterHero />
    </>
  );
}
