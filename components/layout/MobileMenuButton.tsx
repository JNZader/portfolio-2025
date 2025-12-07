'use client';

import { Menu } from 'lucide-react';
import { useState } from 'react';
import MobileMenu from './MobileMenu';

interface MobileMenuButtonProps {
  navigation: Array<{ name: string; href: string }>;
}

/**
 * Mobile Menu Button - Client Component
 * Extracted from Header for Server Component optimization
 * Manages mobile menu open/close state
 */
export function MobileMenuButton({ navigation }: MobileMenuButtonProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={(e) => {
          e.stopPropagation();
          setMobileMenuOpen(true);
        }}
        aria-label="Abrir menú de navegación"
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-menu"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navigation={navigation}
      />
    </>
  );
}
