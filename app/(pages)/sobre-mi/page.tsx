import { Code2, Database, GitBranch, Layers, Palette, Server, Target } from 'lucide-react';
import type { Metadata } from 'next';
import { RevealOnScroll } from '@/components/animations';
import { ObfuscatedEmail } from '@/components/ui/ObfuscatedEmail';
import Section, { SectionDescription, SectionHeader, SectionTitle } from '@/components/ui/Section';

export const metadata: Metadata = {
  title: 'Sobre mí',
  description:
    'Conoce más sobre mi experiencia, habilidades y pasión por el desarrollo. Backend Java Developer con más de 20 años en tecnología.',
};

export default function SobreMiPage() {
  const skillsData = {
    backend: [
      { name: 'Java', icon: Code2, color: 'text-orange-600 dark:text-orange-400' },
      { name: 'Spring Boot', icon: Layers, color: 'text-green-600 dark:text-green-400' },
      { name: 'Node.js', icon: Server, color: 'text-green-600 dark:text-green-400' },
      { name: 'Python', icon: Code2, color: 'text-blue-600 dark:text-blue-400' },
      { name: 'APIs REST', icon: Server, color: 'text-purple-600 dark:text-purple-400' },
    ],
    frontend: [
      { name: 'React', icon: Code2, color: 'text-cyan-600 dark:text-cyan-400' },
      { name: 'Next.js', icon: Layers, color: 'text-gray-900 dark:text-white' },
      { name: 'TypeScript', icon: Code2, color: 'text-blue-600 dark:text-blue-400' },
      { name: 'Tailwind CSS', icon: Palette, color: 'text-teal-600 dark:text-teal-400' },
    ],
    databases: [
      { name: 'PostgreSQL', icon: Database, color: 'text-blue-600 dark:text-blue-400' },
      { name: 'MySQL', icon: Database, color: 'text-orange-600 dark:text-orange-400' },
      { name: 'MongoDB', icon: Database, color: 'text-green-600 dark:text-green-400' },
    ],
    devops: [
      { name: 'Docker', icon: Server, color: 'text-blue-600 dark:text-blue-400' },
      { name: 'Git', icon: GitBranch, color: 'text-orange-600 dark:text-orange-400' },
      { name: 'GitHub', icon: GitBranch, color: 'text-gray-900 dark:text-white' },
      { name: 'Linux', icon: Server, color: 'text-yellow-600 dark:text-yellow-400' },
      { name: 'CI/CD', icon: Target, color: 'text-green-600 dark:text-green-400' },
    ],
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-tertiary/5" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        </div>

        {/* Animated blobs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-tertiary/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        />

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 -z-10 opacity-[0.02] dark:opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealOnScroll>
            <SectionHeader centered>
              <SectionTitle size="xl">Sobre mí</SectionTitle>
              <SectionDescription size="lg" className="mx-auto">
                Desarrollador apasionado por crear soluciones tecnológicas robustas y escalables
              </SectionDescription>
            </SectionHeader>
          </RevealOnScroll>
        </div>
      </section>

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
                    <h4 className="font-semibold mb-2">Frontend</h4>
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
                    <h4 className="font-semibold mb-2">Bases de Datos</h4>
                    <div className="flex flex-wrap gap-2">
                      {skillsData.databases.map((skill) => {
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
                    <h4 className="font-semibold mb-2">DevOps & Tools</h4>
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
