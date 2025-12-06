import Link from 'next/link';
import Container from '@/components/ui/Container';
import { MAIN_NAVIGATION } from '@/lib/constants/navigation';
import { MobileMenuButton } from './MobileMenuButton';
import { NavLink } from './NavLink';
import { ThemeToggle, ThemeToggleMobile } from './ThemeToggle';

const navigation = [...MAIN_NAVIGATION];

/**
 * Header - Server Component
 * Static structure rendered on server, client components handle interactivity
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/60 backdrop-blur-xl backdrop-saturate-150 shadow-sm supports-[backdrop-filter]:bg-background/60">
      <Container>
        <nav
          id="main-navigation"
          className="flex h-16 items-center justify-between gap-8"
          aria-label="Principal"
        >
          {/* Logo - Static */}
          <div className="flex lg:flex-1">
            <Link
              href="/"
              className="group -m-1.5 p-1.5 flex items-center gap-1"
              aria-label="Ir a página de inicio"
            >
              <span className="text-2xl font-black tracking-tight gradient-text-accent">JZ</span>
              <span className="hidden sm:inline text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                dev
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Client component for active state */}
          <div className="hidden md:flex md:gap-x-8">
            {navigation.map((item) => (
              <NavLink key={item.name} href={item.href}>
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Desktop theme toggle - Client component */}
          <div className="hidden md:flex md:flex-1 md:justify-end">
            <ThemeToggle />
          </div>

          {/* Mobile controls - Client components */}
          <div className="flex md:hidden gap-2">
            <ThemeToggleMobile />
            <MobileMenuButton navigation={navigation} />
          </div>
        </nav>
      </Container>
    </header>
  );
}
