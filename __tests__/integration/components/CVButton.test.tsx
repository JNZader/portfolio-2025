import { render, screen } from '@/__tests__/test-utils';
import { CVButton } from '@/components/ui/CVButton';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => (key === 'cvDownload' ? 'Descargar CV' : 'Ver CV'),
  getLocale: async () => 'es',
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('CVButton', () => {
  it('visibly identifies the web CV navigation while keeping PDF download separate', async () => {
    render(await CVButton({ pdfHref: '/api/resume' }));

    const view = screen.getByRole('link', { name: 'Ver CV' });
    const download = screen.getByRole('link', { name: 'Descargar CV' });
    expect(view).toHaveTextContent('Ver CV');
    expect(view).toHaveAttribute('href', '/cv');
    expect(download).toHaveAttribute('download');
    expect(download).toHaveAttribute('href', '/api/resume');
  });
});
