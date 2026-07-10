import { Clock, Mail, MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { RevealOnScroll } from '@/components/animations';
import { ContactForm } from '@/components/forms/ContactForm';
import Container from '@/components/ui/Container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { InteriorHero } from '@/components/ui/InteriorHero';
import { ObfuscatedEmail } from '@/components/ui/ObfuscatedEmail';
import Section from '@/components/ui/Section';
import { localeAlternates } from '@/lib/seo/alternates';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Contact');
  return {
    title: t('metaTitle'),
    alternates: await localeAlternates('/contacto'),
    description: t('metaDescription'),
  };
}

export default async function ContactoPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Contact');
  return (
    <>
      <InteriorHero variant="contact" title={t('heroTitle')} description={t('heroSubtitle')} />

      {/* Content */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
            {/* Form */}
            <RevealOnScroll>
              <Card>
                <CardHeader>
                  <CardTitle>{t('formCardTitle')}</CardTitle>
                  <CardDescription>{t('formCardDescription')}</CardDescription>
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
                  <CardTitle>{t('infoTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-medium">{t('emailLabel')}</p>
                      <ObfuscatedEmail
                        user="jnzader"
                        domain="gmail.com"
                        className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-primary"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-medium">{t('locationLabel')}</p>
                      <p className="text-sm text-muted-foreground">{t('location')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-medium">{t('responseLabel')}</p>
                      <p className="text-sm text-muted-foreground">{t('responseTime')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social links */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('socialTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ExternalLink
                    href="https://github.com/JNZader"
                    trackLabel="GitHub"
                    className="flex min-h-11 items-center gap-3 rounded-md text-sm transition-colors hover:text-primary"
                    aria-label={t('githubAria')}
                  >
                    <FaGithub className="h-5 w-5" aria-hidden="true" />
                    GitHub
                  </ExternalLink>

                  <ExternalLink
                    href="https://www.linkedin.com/in/jnzader/"
                    trackLabel="LinkedIn"
                    className="flex min-h-11 items-center gap-3 rounded-md text-sm transition-colors hover:text-primary"
                    aria-label={t('linkedinAria')}
                  >
                    <FaLinkedin className="h-5 w-5" aria-hidden="true" />
                    LinkedIn
                  </ExternalLink>
                </CardContent>
              </Card>
            </RevealOnScroll>
          </div>
        </Container>
      </Section>
    </>
  );
}
