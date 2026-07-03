import { type RenderOptions, render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { AnnouncerProvider } from '@/components/a11y/ScreenReaderAnnouncer';
import messages from '@/messages/es.json';

/**
 * Custom render function that wraps components with required providers
 * Use this instead of @testing-library/react render for components that
 * need context providers (NextIntlClientProvider, AnnouncerProvider).
 */
function AllTheProviders({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="es" messages={messages}>
      <AnnouncerProvider>{children}</AnnouncerProvider>
    </NextIntlClientProvider>
  );
}

function customRender(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render with custom render
export { customRender as render };
