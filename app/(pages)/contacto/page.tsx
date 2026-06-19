import { Clock, Mail, MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { RevealOnScroll } from '@/components/animations';
import { ContactForm } from '@/components/forms/ContactForm';
import Container from '@/components/ui/Container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ObfuscatedEmail } from '@/components/ui/ObfuscatedEmail';
import Section, { SectionDescription, SectionHeader, SectionTitle } from '@/components/ui/Section';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Ponte en contacto conmigo para proyectos, colaboraciones o consultas.',
};

export default function ContactoPage() {
  return (
    <>
      {/* Hero */}
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

        <Container className="relative z-10">
          <RevealOnScroll>
            <SectionHeader centered>
              <SectionTitle size="xl" as="h1">
                Contacto
              </SectionTitle>
              <SectionDescription size="lg" className="mx-auto">
                ¿Tienes un proyecto en mente o quieres colaborar? Me encantaría escucharte.
              </SectionDescription>
            </SectionHeader>
          </RevealOnScroll>
        </Container>
      </section>

      {/* Content */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
            {/* Form */}
            <RevealOnScroll>
              <Card>
                <CardHeader>
                  <CardTitle>Envíame un mensaje</CardTitle>
                  <CardDescription>
                    Completa el formulario y te responderé lo antes posible
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ContactForm />
                </CardContent>
              </Card>
            </RevealOnScroll>

            {/* Sidebar */}
            <RevealOnScroll delay={0.2} className="space-y-6">
              {/* Contact info */}
              <Card>
                <CardHeader>
                  <CardTitle>Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail
                      className="h-5 w-5 text-[var(--color-primary)] mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-medium">Email</p>
                      <ObfuscatedEmail
                        user="jnzader"
                        domain="gmail.com"
                        className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin
                      className="h-5 w-5 text-[var(--color-primary)] mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-medium">Ubicación</p>
                      <p className="text-sm text-[var(--color-muted-foreground)]">
                        Córdoba, Argentina
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock
                      className="h-5 w-5 text-[var(--color-primary)] mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-medium">Horario de respuesta</p>
                      <p className="text-sm text-[var(--color-muted-foreground)]">
                        24-48 horas hábiles
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social links */}
              <Card>
                <CardHeader>
                  <CardTitle>Redes Sociales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a
                    href="https://github.com/JNZader"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm hover:text-[var(--color-primary)] transition-colors"
                    aria-label="Visitar perfil de GitHub"
                  >
                    <FaGithub className="h-5 w-5" aria-hidden="true" />
                    GitHub
                  </a>

                  <a
                    href="https://www.linkedin.com/in/jnzader/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm hover:text-[var(--color-primary)] transition-colors"
                    aria-label="Visitar perfil de LinkedIn"
                  >
                    <FaLinkedin className="h-5 w-5" aria-hidden="true" />
                    LinkedIn
                  </a>
                </CardContent>
              </Card>
            </RevealOnScroll>
          </div>
        </Container>
      </Section>
    </>
  );
}
