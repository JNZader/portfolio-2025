import { Award, BookOpen, Code2, GraduationCap } from 'lucide-react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { RevealOnScroll } from '@/components/animations';
import { DownloadCVButton } from '@/components/ui/DownloadCVButton';
import { HeroBackground } from '@/components/ui/HeroBackground';
import { ObfuscatedEmail } from '@/components/ui/ObfuscatedEmail';
import Section, { SectionDescription, SectionHeader, SectionTitle } from '@/components/ui/Section';
import { SkillsList } from '@/components/ui/SkillsList';
import { SKILLS_DATA } from '@/lib/constants';

// Lazy load ScrollIndicator - non-critical
const ScrollIndicator = dynamic(
  () => import('@/components/ui/ScrollIndicator').then((mod) => ({ default: mod.ScrollIndicator })),
  { ssr: true }
);

export const metadata: Metadata = {
  title: 'Sobre mí',
  description:
    'Conoce más sobre mi experiencia, habilidades y los proyectos que construyo. Software developer trabajando en backend, frontend, edge ML y AI tooling.',
};

export default function SobreMiPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <HeroBackground />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealOnScroll>
            <SectionHeader centered>
              <div className="flex flex-col items-center gap-8 mb-6">
                <Image
                  src="/images/profile.jpg"
                  alt="Javier Zader"
                  width={160}
                  height={160}
                  priority
                  className="rounded-full ring-4 ring-primary/20 hover:ring-primary/40 transition-all hover:scale-110 duration-500"
                />
              </div>
              <SectionTitle size="xl">Sobre mí</SectionTitle>
              <SectionDescription size="lg" className="mx-auto">
                Construyo soluciones de software end-to-end — backend, frontend, AI, ML, edge
              </SectionDescription>
            </SectionHeader>
          </RevealOnScroll>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <ScrollIndicator targetId="content" />
        </div>
      </section>

      {/* Main Content */}
      <Section id="content">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <RevealOnScroll className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Mi Historia</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Hola, soy Javier. Software developer en Córdoba. Soy Técnico en Desarrollo de
                    Software (Universidad Gastón Dachary, 2025), y antes de dedicarme a esto pasé
                    varios años como productor agropecuario, lo que me dio una idea bastante directa
                    de cómo es operar algo con tiempos y consecuencias reales.
                  </p>
                  <p>
                    En el último año me enfoqué en construir proyectos completos end-to-end:
                    backends en Java/Spring, Go y Rust; frontends en React; pipelines de ML con
                    inferencia en el edge; y herramientas para developers: code review con AI
                    multi-agente, plantillas para empezar proyectos nuevos, e instalación y
                    configuración automática de herramientas de developer en máquinas nuevas. Cada
                    proyecto me empuja a stacks nuevos.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Cómo trabajo</h2>
                <div className="space-y-4 text-muted-foreground">
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong>Entender el problema antes de escribir código.</strong> Le dedico
                      tiempo a leer, discutir y mapear lo que tengo que resolver antes de tirar la
                      primera línea.
                    </li>
                    <li>
                      <strong>Decisiones técnicas con su tradeoff explícito.</strong> Cada elección
                      tiene una contrapartida; trato de elegirlas conscientemente y poder explicar
                      por qué.
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Áreas en las que trabajo</h2>
                <div className="space-y-4 text-muted-foreground">
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong>Backend:</strong> Java/Spring Boot, Go (Gin), Rust (Axum/Tokio),
                      Python (FastAPI)
                    </li>
                    <li>
                      <strong>Frontend:</strong> React, Next.js, Vite, Mantine, Zustand, Zod, React
                      Flow
                    </li>
                    <li>
                      <strong>Edge industrial:</strong> Modbus TCP/RTU, MQTT, ML inference local con
                      ONNX
                    </li>
                    <li>
                      <strong>ML pipelines:</strong> training en Python, inferencia en Rust con
                      parity tests, SHAP para explicabilidad
                    </li>
                    <li>
                      <strong>AI tooling:</strong> servidores MCP, sistemas multi-agente,
                      integración con SAST/SCA (Semgrep, Trivy, Gitleaks)
                    </li>
                    <li>
                      <strong>DevOps:</strong> Docker, GitLab CI, GitHub Actions
                    </li>
                    <li>
                      <strong>Spec-Driven Development</strong> con OpenSpec, conventional commits
                    </li>
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
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-purple-500/10 border-2 border-purple-500 flex items-center justify-center">
                      <BookOpen className="w-3 h-3 text-purple-500" />
                    </div>
                    <h4 className="font-semibold text-sm">
                      ONE Tech Foundation G8 — Data Science, ETL y ML
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">Alura LATAM</p>
                    <p className="text-xs text-muted-foreground">2024 - 2025</p>
                  </div>

                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-orange-500/10 border-2 border-orange-500 flex items-center justify-center">
                      <Code2 className="w-3 h-3 text-orange-500" />
                    </div>
                    <h4 className="font-semibold text-sm">Java y Spring Boot G6 — ONE</h4>
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
    </>
  );
}
