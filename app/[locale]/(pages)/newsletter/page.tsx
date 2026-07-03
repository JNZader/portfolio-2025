import type { Metadata } from 'next';
import { NewsletterForm } from '@/components/newsletter/NewsletterForm';
import Container from '@/components/ui/Container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Section from '@/components/ui/Section';

export const metadata: Metadata = {
  title: 'Newsletter - Portfolio 2025',
  description: 'Suscríbete a nuestra newsletter para recibir contenido exclusivo.',
};

export default function NewsletterPage() {
  return (
    <>
      {/* Hero */}
      <Section className="bg-[var(--color-muted)]">
        <Container>
          <div className="py-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Newsletter</h1>
            <p className="text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
              Recibe contenido exclusivo, tips de programación y actualizaciones directamente en tu
              inbox.
            </p>
          </div>
        </Container>
      </Section>

      {/* Content */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
            {/* Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Suscríbete Ahora</CardTitle>
                  <CardDescription>Te enviaremos un email de confirmación</CardDescription>
                </CardHeader>
                <CardContent>
                  <NewsletterForm />
                </CardContent>
              </Card>

              {/* Benefits */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">¿Qué recibirás?</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  <BenefitCard
                    icon="📝"
                    title="Artículos Exclusivos"
                    description="Contenido que no encontrarás en el blog público"
                  />
                  <BenefitCard
                    icon="💡"
                    title="Tips y Trucos"
                    description="Mejores prácticas y soluciones a problemas comunes"
                  />
                  <BenefitCard
                    icon="🚀"
                    title="Actualizaciones"
                    description="Entérate primero de nuevos proyectos y lanzamientos"
                  />
                  <BenefitCard
                    icon="🎁"
                    title="Recursos Gratis"
                    description="Plantillas, snippets y herramientas útiles"
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatItem label="Frecuencia" value="Semanal" />
                  <StatItem label="Suscriptores" value="1,234+" />
                  <StatItem label="Open Rate" value="42%" />
                </CardContent>
              </Card>

              {/* Privacy */}
              <Card>
                <CardHeader>
                  <CardTitle>Tu Privacidad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-[var(--color-muted-foreground)]">
                  <p>✅ Double opt-in (confirmación requerida)</p>
                  <p>✅ Sin spam, solo contenido de calidad</p>
                  <p>✅ Puedes darte de baja en cualquier momento</p>
                  <p>✅ Tu email nunca será compartido</p>
                  <p>✅ GDPR compliant</p>
                </CardContent>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}

function BenefitCard({
  icon,
  title,
  description,
}: Readonly<{
  icon: string;
  title: string;
  description: string;
}>) {
  return (
    <div className="flex gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-[var(--color-muted-foreground)]">{description}</p>
      </div>
    </div>
  );
}

function StatItem({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-[var(--color-muted-foreground)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
