import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';

export const metadata: Metadata = {
  title: 'Sobre mí',
  description: 'Conoce más sobre mi experiencia y habilidades',
};

export default function SobreMiPage() {
  return (
    <Section>
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Sobre mí</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Técnico en Desarrollo de Software y Backend Java Developer con más de 20 años de
              experiencia en tecnología. Combino expertise técnico con gestión empresarial,
              enfocándome en construir soluciones robustas que resuelven desafíos reales de negocio.
            </p>

            <h2 className="text-2xl font-semibold mt-12 mb-4">Experiencia</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Con más de 20 años en tecnología y 11 años como productor agropecuario, he
              desarrollado una perspectiva única que combina conocimiento técnico profundo con
              experiencia en gestión empresarial. Mi enfoque está en construir soluciones escalables
              y mantenibles utilizando arquitecturas modernas y mejores prácticas.
            </p>

            <h2 className="text-2xl font-semibold mt-12 mb-4">Stack Tecnológico</h2>
            <div className="grid grid-cols-2 gap-4 not-prose">
              {[
                'Java / Spring Boot',
                'React / Next.js',
                'TypeScript',
                'Node.js',
                'Python',
                'PostgreSQL / MySQL',
                'Docker',
                'Git / GitHub',
              ].map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                >
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-sm font-medium">{skill}</span>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-semibold mt-12 mb-4">Educación</h2>
            <ul className="text-gray-600 dark:text-gray-300 space-y-2">
              <li>
                <strong>Técnico en Desarrollo de Software</strong> | Universidad Gastón Dachary |
                2023-2025
              </li>
              <li>
                <strong>Java Oriented Object Development</strong> | Alura LATAM | 2024
              </li>
              <li>
                <strong>Argentina Programa</strong> | Intermediate Java Developer | 2022-2023
              </li>
              <li>
                <strong>CCNA Certification</strong> | Fundación Proydesa | 2009
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-12 mb-4">Áreas de Expertise</h2>
            <ul className="text-gray-600 dark:text-gray-300 space-y-2">
              <li>• Desarrollo Full-stack con frameworks modernos</li>
              <li>• Arquitectura de APIs REST con Spring Boot</li>
              <li>• Optimización de PostgreSQL y diseño de bases de datos</li>
              <li>• Implementación de modelos de Machine Learning</li>
              <li>• Patrones de arquitectura (Atomic Design, SOLID)</li>
              <li>• Liderazgo técnico combinando expertise técnico y de negocio</li>
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
