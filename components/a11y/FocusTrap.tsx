'use client';

import { FocusTrap as FocusTrapComponent } from 'focus-trap-react';
import type { ReactNode } from 'react';

interface FocusTrapProps {
  children: ReactNode;
  active?: boolean;
  onDeactivate?: () => void;
}

export function FocusTrap({ children, active = true, onDeactivate }: Readonly<FocusTrapProps>) {
  return (
    <FocusTrapComponent
      active={active}
      focusTrapOptions={{
        onDeactivate,
        escapeDeactivates: true,
        clickOutsideDeactivates: false,
        initialFocus: false,
        returnFocusOnDeactivate: true,
      }}
    >
      {children}
    </FocusTrapComponent>
  );
}
