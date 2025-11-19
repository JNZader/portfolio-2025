import type { Metadata } from 'next';
import { RevealOnScroll } from '@/components/animations';
import { ObfuscatedEmail } from '@/components/ui/ObfuscatedEmail';
import Section, {
  SECTION_BG,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from '@/components/ui/Section';

export const metadata: Metadata = {
  title: 'Sobre mí',
  description:
    'Conoce más sobre mi experiencia, habilidades y pasión por el desarrollo. Backend Java Developer con más de 20 años en tecnología.',
};

export default function SobreMiPage() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <Section background={SECTION_BG.GRADIENT} spacing="xl">
        <RevealOnScroll>
          <SectionHeader centered>
            <SectionTitle size="xl">Sobre mí</SectionTitle>
            <SectionDescription size="lg" className="mx-auto">
              Desarrollador apasionado por crear soluciones tecnológicas robustas y escalables
            </SectionDescription>
          </SectionHeader>
        </RevealOnScroll>
      </Section>

      {/* Main Content */}
      <Section>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <RevealOnScroll className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Mi Historia</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Técnico en Desarrollo de Software y Backend Java Developer con más de 20 años de
                    experiencia en tecnología. Combino expertise técnico con gestión empresarial,
                    enfocándome en construir soluciones robustas que resuelven desafíos reales de
                    negocio.
                  </p>
                  <p>
                    Con más de 20 años en tecnología y 11 años como productor agropecuario, he
                    desarrollado una perspectiva única que combina conocimiento técnico profundo con
                    experiencia en gestión empresarial.
                  </p>
                  <p>
                    Mi enfoque está en construir soluciones escalables y mantenibles utilizando
                    arquitecturas modernas y mejores prácticas.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Mi Enfoque</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Creo firmemente en la importancia de escribir código limpio, mantenible y bien
                    documentado. Mi proceso de desarrollo siempre incluye:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Análisis detallado de requisitos y planificación estratégica</li>
                    <li>Diseño de arquitecturas escalables y modulares</li>
                    <li>Implementación con las mejores prácticas y estándares de la industria</li>
                    <li>Testing exhaustivo para garantizar calidad y confiabilidad</li>
                    <li>Optimización continua de rendimiento y experiencia de usuario</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Áreas de Expertise</h2>
                <div className="space-y-4 text-muted-foreground">
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Desarrollo Full-stack con frameworks modernos</li>
                    <li>Arquitectura de APIs REST con Spring Boot</li>
                    <li>Optimización de PostgreSQL y diseño de bases de datos</li>
                    <li>Implementación de modelos de Machine Learning</li>
                    <li>Patrones de arquitectura (Atomic Design, SOLID)</li>
                    <li>Liderazgo técnico combinando expertise técnico y de negocio</li>
                  </ul>
                </div>
              </div>
            </RevealOnScroll>

            {/* Sidebar */}
            <RevealOnScroll delay={0.2} className="space-y-8">
              {/* Skills */}
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-xl font-bold mb-4">Habilidades Técnicas</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Backend</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Java', 'Spring Boot', 'Node.js', 'Python', 'APIs REST'].map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-primary/10 text-primary text-sm rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Frontend</h4>
                    <div className="flex flex-wrap gap-2">
                      {['React', 'Next.js', 'TypeScript', 'Tailwind CSS'].map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-primary/10 text-primary text-sm rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Bases de Datos</h4>
                    <div className="flex flex-wrap gap-2">
                      {['PostgreSQL', 'MySQL', 'MongoDB'].map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-primary/10 text-primary text-sm rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">DevOps & Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Docker', 'Git', 'GitHub', 'Linux', 'CI/CD'].map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-primary/10 text-primary text-sm rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-xl font-bold mb-4">Educación</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Técnico en Desarrollo de Software</h4>
                    <p className="text-sm text-muted-foreground">
                      Universidad Gastón Dachary • 2023 - 2025
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Java Oriented Object Development</h4>
                    <p className="text-sm text-muted-foreground">Alura LATAM • 2024</p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Argentina Programa</h4>
                    <p className="text-sm text-muted-foreground">
                      Intermediate Java Developer • 2022 - 2023
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">CCNA Certification</h4>
                    <p className="text-sm text-muted-foreground">Fundación Proydesa • 2009</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-xl font-bold mb-4">Contacto</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong className="block mb-1">Email:</strong>
                    <ObfuscatedEmail
                      user="jnzader"
                      domain="gmail.com"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    />
                  </div>
                  <p>
                    <strong>Ubicación:</strong> Córdoba, Argentina
                  </p>
                  <p>
                    <strong>Disponibilidad:</strong> Abierto a nuevos proyectos
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </Section>
    </div>
  );
}
