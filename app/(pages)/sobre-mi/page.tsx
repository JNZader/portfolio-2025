import { Award, BookOpen, Code2, GraduationCap } from 'lucide-react';
import type { Metadata } from 'next';
import { RevealOnScroll } from '@/components/animations';
import { ClickableAvatar } from '@/components/features/ClickableAvatar';
import { DownloadCVButton } from '@/components/ui/DownloadCVButton';
import { HeroBackground } from '@/components/ui/HeroBackground';
import { ObfuscatedEmail } from '@/components/ui/ObfuscatedEmail';
import Section, { SectionDescription, SectionHeader, SectionTitle } from '@/components/ui/Section';
import { SkillsList } from '@/components/ui/SkillsList';
import { SKILLS_DATA } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Sobre mí',
  description:
    'Conoce más sobre mi experiencia, habilidades y pasión por el desarrollo. Backend Java Developer con más de 20 años en tecnología.',
};

export default function SobreMiPage() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <HeroBackground />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealOnScroll>
            <SectionHeader centered>
              <div className="flex flex-col items-center gap-8 mb-6">
                <ClickableAvatar
                  src="https://media.licdn.com/dms/image/v2/D4D03AQE7TmC2O6j21g/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1699301363482?e=1765411200&v=beta&t=iKb1tXsTUVK5R62jF_Owebju8_oScP6J3ulMO0NepSE"
                  alt="Javier Zader"
                  size={160}
                  priority
                />
              </div>
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
                  <SkillsList title="Backend" skills={SKILLS_DATA.backend} />
                  <SkillsList title="Frontend" skills={SKILLS_DATA.frontend} />
                  {SKILLS_DATA.databases && (
                    <SkillsList title="Bases de Datos" skills={SKILLS_DATA.databases} />
                  )}
                  <SkillsList title="DevOps & Tools" skills={SKILLS_DATA.devops} />
                </div>
              </div>

              {/* Education - Timeline */}
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-xl font-bold mb-6">Educación</h3>
                <div className="space-y-6 relative">
                  {/* Timeline line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

                  {/* Timeline items */}
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                      <GraduationCap className="w-3 h-3 text-primary" />
                    </div>
                    <h4 className="font-semibold text-sm">Técnico en Desarrollo de Software</h4>
                    <p className="text-xs text-muted-foreground mt-1">Universidad Gastón Dachary</p>
                    <p className="text-xs text-muted-foreground">2023 - 2025</p>
                  </div>

                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-orange-500/10 border-2 border-orange-500 flex items-center justify-center">
                      <Code2 className="w-3 h-3 text-orange-500" />
                    </div>
                    <h4 className="font-semibold text-sm">Java Oriented Object Development</h4>
                    <p className="text-xs text-muted-foreground mt-1">Alura LATAM</p>
                    <p className="text-xs text-muted-foreground">2024</p>
                  </div>

                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center">
                      <BookOpen className="w-3 h-3 text-green-500" />
                    </div>
                    <h4 className="font-semibold text-sm">Argentina Programa</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Intermediate Java Developer
                    </p>
                    <p className="text-xs text-muted-foreground">2022 - 2023</p>
                  </div>

                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-500/10 border-2 border-blue-500 flex items-center justify-center">
                      <Award className="w-3 h-3 text-blue-500" />
                    </div>
                    <h4 className="font-semibold text-sm">CCNA Certification</h4>
                    <p className="text-xs text-muted-foreground mt-1">Fundación Proydesa</p>
                    <p className="text-xs text-muted-foreground">2009</p>
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
                <div className="mt-6">
                  <DownloadCVButton className="w-full justify-center" />
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </Section>
    </div>
  );
}
