import { HeroSection } from '@/components/sections/hero-section';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection
        greeting="👋 ¡Hola! Soy Javier Zader"
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
          email: 'jnzader@gmail.com',
        }}
      />

      {/* Quick Stats */}
      <Section className="bg-gray-100 dark:bg-gray-800">
        <Container>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">20+</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Años en Tecnología
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">15+</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Proyectos Completados
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">4+</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">Certificaciones</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">100%</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">Compromiso</div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
