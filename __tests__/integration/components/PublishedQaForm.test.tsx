import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PublishedQaForm } from '@/components/projects/PublishedQaForm';
import enMessages from '@/messages/en.json';
import esMessages from '@/messages/es.json';

const fetchMock = vi.fn();

function renderLocale(locale: 'es' | 'en') {
  const messages = locale === 'es' ? esMessages : enMessages;
  return rtlRender(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <PublishedQaForm />
    </NextIntlClientProvider>
  );
}

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    json: () => Promise.resolve(body),
  };
}

const HIT = {
  status: 'hit',
  text: 'Técnico en Desarrollo de Software. Universidad Gastón Dachary. 2023-12 — 2025-07.',
  href: '/cv',
  citation: 'CV · Educación',
  title: 'Universidad Gastón Dachary',
  heading: null,
} as const;

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PublishedQaForm catalogues', () => {
  it('renders the labelled input from the Spanish catalogue', () => {
    renderLocale('es');

    expect(
      screen.getByRole('textbox', { name: 'Preguntá sobre un proyecto o la formación' })
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Consultar' })).toBeVisible();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('renders the labelled input from the English catalogue', () => {
    renderLocale('en');

    expect(
      screen.getByRole('textbox', { name: 'Ask about a project or the training' })
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Ask' })).toBeVisible();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });
});

describe('PublishedQaForm submit', () => {
  it('POSTs { query, locale } to /api/qa for the active locale', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(jsonResponse({ status: 'refused' }));
    renderLocale('en');

    await user.type(
      screen.getByRole('textbox', { name: 'Ask about a project or the training' }),
      'what degree do you have'
    );
    await user.click(screen.getByRole('button', { name: 'Ask' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/qa',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ query: 'what degree do you have', locale: 'en' }),
      })
    );
  });

  it('shows quote text and a citation link to href on HIT', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(jsonResponse(HIT));
    renderLocale('es');

    await user.type(
      screen.getByRole('textbox', { name: 'Preguntá sobre un proyecto o la formación' }),
      'qué título tenés'
    );
    await user.click(screen.getByRole('button', { name: 'Consultar' }));

    expect(await screen.findByText(HIT.text)).toBeVisible();
    const citation = screen.getByRole('link', { name: HIT.citation });
    expect(citation).toHaveAttribute('href', HIT.href);
  });

  it('uses title as the citation link name when citation is empty', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ ...HIT, citation: '', title: 'Universidad Gastón Dachary' })
    );
    renderLocale('es');

    await user.type(
      screen.getByRole('textbox', { name: 'Preguntá sobre un proyecto o la formación' }),
      'qué título tenés'
    );
    await user.click(screen.getByRole('button', { name: 'Consultar' }));

    expect(
      await screen.findByRole('link', { name: 'Universidad Gastón Dachary' })
    ).toHaveAttribute('href', HIT.href);
  });

  it('shows refused copy and no citation link on REFUSED', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(jsonResponse({ status: 'refused' }));
    renderLocale('es');

    await user.type(
      screen.getByRole('textbox', { name: 'Preguntá sobre un proyecto o la formación' }),
      'precio del dólar mañana'
    );
    await user.click(screen.getByRole('button', { name: 'Consultar' }));

    expect(
      await screen.findByText('No hay una cita publicada para esa pregunta.')
    ).toBeVisible();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText(HIT.text)).not.toBeInTheDocument();
  });

  it('does not invent an answer when fetch fails', async () => {
    const user = userEvent.setup();
    fetchMock.mockRejectedValueOnce(new Error('network'));
    renderLocale('es');

    await user.type(
      screen.getByRole('textbox', { name: 'Preguntá sobre un proyecto o la formación' }),
      'qué título tenés'
    );
    await user.click(screen.getByRole('button', { name: 'Consultar' }));

    expect(await screen.findByText('No se pudo consultar. Probá de nuevo.')).toBeVisible();
    expect(screen.queryByText(HIT.text)).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
