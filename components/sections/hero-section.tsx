import { ArrowRight, FileText, Mail } from 'lucide-react';
import Link from 'next/link';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';
import { HeroBackground } from '@/components/ui/HeroBackground';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';

interface HeroSectionProps {
  greeting?: string;
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
  greeting = '👋 ¡Hola!',
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
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
          {/* Greeting Badge */}
          {greeting && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm text-sm font-medium animate-scale-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              {greeting}
            </div>
          )}

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            {title}
            {subtitle && (
              <>
                <br />
                <span
                  className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text
  text-transparent"
                >
                  {subtitle}
                </span>
              </>
            )}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href={primaryCta.href}>
                {primaryCta.text}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {secondaryCta && (
              <Button size="lg" variant="outline" asChild>
                <Link href={secondaryCta.href}>
                  {secondaryCta.text}
                  <Mail className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          {/* Social Links */}
          {socialLinks && (
            <div className="flex justify-center gap-4">
              {socialLinks.github && (
                <Button size="icon" variant="outline" asChild>
                  <a
                    href={socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                  >
                    <FaGithub className="h-5 w-5" aria-hidden="true" />
                  </a>
                </Button>
              )}
              {socialLinks.linkedin && (
                <Button size="icon" variant="outline" asChild>
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedin className="h-5 w-5" aria-hidden="true" />
                  </a>
                </Button>
              )}
              {socialLinks.cv && (
                <Button size="icon" variant="outline" asChild>
                  <a href={socialLinks.cv} aria-label="Descargar CV">
                    <FileText className="h-5 w-5" />
                  </a>
                </Button>
              )}
              {socialLinks.email && (
                <Button size="icon" variant="outline" asChild>
                  <a href={`mailto:${socialLinks.email}`} aria-label="Email">
                    <Mail className="h-5 w-5" />
                  </a>
                </Button>
              )}
            </div>
          )}

          {/* Scroll Indicator */}
          {showScrollIndicator && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <ScrollIndicator targetId="content" />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
