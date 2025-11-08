import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Section className="pt-32 pb-16 sm:pt-40 sm:pb-24">
        <Container>
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Hola, soy{' '}
              <span className="bg-gradient-to-r from-blue-600 dark:from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Javier Zader
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto sm:text-xl">
              Backend Java Developer y Full Stack especializado en crear soluciones robustas con
              Spring Boot, React y arquitecturas modernas.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/proyectos"
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-colors"
              >
                Ver Proyectos
              </a>
              <a
                href="/contacto"
                className="rounded-lg border border-gray-300 dark:border-gray-700 px-6 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Contactar
              </a>
            </div>
          </div>
        </Container>
      </Section>

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
