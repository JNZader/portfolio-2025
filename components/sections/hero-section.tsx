import { ArrowRight, FileText, Mail } from 'lucide-react';
import Link from 'next/link';
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
                    <GithubIcon className="h-5 w-5" />
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
                    <LinkedinIcon className="h-5 w-5" />
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

// Helper components: GitHub and LinkedIn icons
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="GitHub"
    >
      <title>GitHub</title>
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="LinkedIn"
    >
      <title>LinkedIn</title>
      <path
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136
  2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144
  0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782
  13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24
   .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  );
}
