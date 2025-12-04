'use client';

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
        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Abrir menú de navegación"
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-menu"
      >
        <MenuIcon className="h-6 w-6" />
      </button>

      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navigation={navigation}
      />
    </>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  );
}
