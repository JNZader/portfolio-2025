import { ArrowRight, FileText, Mail, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';
import { HeroBackground } from '@/components/ui/HeroBackground';

// Lazy load ScrollIndicator - it's below the fold and non-critical
const ScrollIndicator = dynamic(
  () => import('@/components/ui/ScrollIndicator').then((mod) => ({ default: mod.ScrollIndicator })),
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
  socialLinks,
  showScrollIndicator = true,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <HeroBackground />

      <Container className="text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
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
          <h1 className="animate-hero-reveal-2 text-4xl md:text-6xl lg:text-7xl text-display-lg">
            {title}
            {subtitle && (
              <>
                <br />
                <span className="gradient-text-accent">{subtitle}</span>
              </>
            )}
          </h1>

          {/* Description with better styling */}
          <p className="animate-hero-reveal-3 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>

          {/* CTA Buttons with enhanced styling */}
          <div className="animate-hero-reveal-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="btn-ripple shine-effect" asChild>
              <Link href={primaryCta.href}>
                <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                {primaryCta.text}
                <ArrowRight
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </Button>
            {secondaryCta && (
              <Button size="lg" variant="outline-glow" className="btn-ripple" asChild>
                <Link href={secondaryCta.href}>
                  {secondaryCta.text}
                  <Mail className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            )}
          </div>

          {/* Social Links with hover effects */}
          {socialLinks && (
            <div className="animate-hero-reveal-5 flex justify-center gap-3">
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
              {socialLinks.cv && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="hover:bg-primary/10 hover:text-primary transition-colors"
                  asChild
                >
                  <a href={socialLinks.cv} aria-label="Descargar currículum vitae">
                    <FileText className="h-5 w-5" aria-hidden="true" />
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

          {/* Scroll Indicator */}
          {showScrollIndicator && (
            <div className="animate-hero-reveal-5 absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <ScrollIndicator targetId="content" />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
