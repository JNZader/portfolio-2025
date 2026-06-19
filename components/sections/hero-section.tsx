import { ArrowRight, Download, Mail } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';
import { HeroBackground } from '@/components/ui/HeroBackground';

// Lazy-load below-the-fold / decorative client widgets so they don't inflate the
// hero's First Load JS. ssr: true keeps them server-rendered (no layout shift).
const ScrollIndicator = dynamic(
  () => import('@/components/ui/ScrollIndicator').then((mod) => ({ default: mod.ScrollIndicator })),
  { ssr: true }
);
const HeroTerminal = dynamic(
  () => import('@/components/sections/HeroTerminal').then((mod) => ({ default: mod.HeroTerminal })),
  { ssr: true }
);

interface HeroSectionProps {
  greeting?: string;
  jobTitle?: string;
  title: string;
  subtitle?: string;
  description: string;
  primaryCta: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  /** CV/resume download href — rendered as the filled primary CTA via <a download>. */
  cvHref?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    email?: string;
    cv?: string;
  };
  showScrollIndicator?: boolean;
}

export function HeroSection({
  greeting = '¡Hola!',
  jobTitle,
  title,
  subtitle,
  description,
  primaryCta,
  secondaryCta,
  cvHref,
  socialLinks,
  showScrollIndicator = true,
}: Readonly<HeroSectionProps>) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <HeroBackground />

      <Container className="relative z-10">
        <div className="grid items-center gap-12 pb-20 lg:grid-cols-2 lg:gap-10">
          {/* Left column — text + CTAs (stacks first on mobile) */}
          <div className="mx-auto max-w-2xl space-y-8 text-center lg:mx-0 lg:text-left">
            {/* Greeting Badge with stagger animation */}
            {greeting && (
              <div className="animate-hero-reveal-1 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm text-base font-medium glass">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                </span>
                {greeting}
              </div>
            )}

            {/* Job title indicator - new hierarchy element */}
            {jobTitle && (
              <p className="animate-hero-reveal-2 text-sm md:text-base uppercase tracking-widest text-muted-foreground font-medium">
                {jobTitle}
              </p>
            )}

            {/* Main Heading - Enhanced with display typography */}
            <h1 className="animate-hero-reveal-3 text-4xl md:text-6xl lg:text-7xl text-display-lg">
              {title}
              {subtitle && (
                <>
                  <br />
                  <span className="gradient-text-accent">{subtitle}</span>
                </>
              )}
            </h1>

            {/* Description with better styling */}
            <p className="animate-hero-reveal-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {description}
            </p>

            {/* CTA hierarchy: Descargar CV (filled, lowest-friction recruiter action) >
              primaryCta (outline) > secondaryCta (ghost). */}
            <div className="animate-hero-reveal-5 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {cvHref && (
                <Button size="lg" className="btn-ripple shine-effect" asChild>
                  {/* Plain <a download> (not next/Link) so the PDF attachment from
                    /api/resume downloads instead of SPA-navigating. */}
                  <a href={cvHref} download>
                    <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                    Descargar CV
                  </a>
                </Button>
              )}
              <Button size="lg" variant="outline-glow" className="btn-ripple" asChild>
                <Link href={primaryCta.href}>
                  {primaryCta.text}
                  <ArrowRight
                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
              {secondaryCta && (
                <Button size="lg" variant="ghost" className="btn-ripple" asChild>
                  <Link href={secondaryCta.href}>
                    <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                    {secondaryCta.text}
                  </Link>
                </Button>
              )}
            </div>

            {/* Social Links with hover effects */}
            {socialLinks && (
              <div className="animate-hero-reveal-6 flex justify-center lg:justify-start gap-3">
                {socialLinks.github && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:bg-primary/10 hover:text-primary transition-colors"
                    asChild
                  >
                    <a
                      href={socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Visitar perfil de GitHub"
                    >
                      <FaGithub className="h-5 w-5" aria-hidden="true" />
                    </a>
                  </Button>
                )}
                {socialLinks.linkedin && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:bg-primary/10 hover:text-primary transition-colors"
                    asChild
                  >
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Visitar perfil de LinkedIn"
                    >
                      <FaLinkedin className="h-5 w-5" aria-hidden="true" />
                    </a>
                  </Button>
                )}
                {socialLinks.email && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:bg-primary/10 hover:text-primary transition-colors"
                    asChild
                  >
                    <a href={`mailto:${socialLinks.email}`} aria-label="Enviar correo electrónico">
                      <Mail className="h-5 w-5" aria-hidden="true" />
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Right column — animated backend terminal (stacks below text on mobile) */}
          <div className="animate-hero-reveal-3 w-full max-w-xl mx-auto lg:mx-0 lg:justify-self-end">
            <HeroTerminal />
            {/* Always-visible caption: states the achievement for mobile (no hover),
                non-technical recruiters, and SEO — the terminal itself is aria-hidden. */}
            <p className="mt-3 text-center text-xs text-muted-foreground lg:text-left">
              <span className="font-medium text-foreground">apigen</span> — una herramienta que
              construí: de un schema SQL a una API Spring Boot completa y corriendo.
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        {showScrollIndicator && (
          <div className="animate-hero-reveal-5 absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <ScrollIndicator targetId="content" />
          </div>
        )}
      </Container>
    </section>
  );
}
