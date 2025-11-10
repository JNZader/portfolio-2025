import { ArrowRight, Github, Linkedin, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';

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
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-white to-blue-50 dark:from-gray-950 dark:via-gray-950 dark:to-blue-950/20">
      <Container className="text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Greeting Badge */}
          {greeting && (
            <div className="inline-block px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm font-medium">
              {greeting}
            </div>
          )}

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            {title}
            {subtitle && (
              <>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
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
                    <Github className="h-5 w-5" />
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
                    <Linkedin className="h-5 w-5" />
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
              <div className="w-6 h-10 border-2 border-gray-300 dark:border-gray-700 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 animate-bounce"></div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
