import { render as rtlRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PublishedQaForm } from '@/components/projects/PublishedQaForm';
import { QA_NO_EVIDENCE } from '@/lib/qa/retrieve';
import enMessages from '@/messages/en.json';
import esMessages from '@/messages/es.json';

const chat = vi.hoisted(() => ({
  messages: [] as Array<{
    id: string;
    role: 'user' | 'assistant';
    parts: Array<{ type: string; text?: string }>;
  }>,
  sendMessage: vi.fn(),
  error: undefined as Error | undefined,
  status: 'ready' as string,
  transportOptions: undefined as { api?: string; body?: { locale?: string } } | undefined,
}));

vi.mock('@ai-sdk/react', () => ({
  useChat: () => ({
    messages: chat.messages,
    sendMessage: chat.sendMessage,
    error: chat.error,
    status: chat.status,
  }),
}));

vi.mock('ai', () => ({
  DefaultChatTransport: class {
    constructor(options: { api?: string; body?: { locale?: string } }) {
      chat.transportOptions = options;
    }
  },
}));

function renderLocale(locale: 'es' | 'en') {
  const messages = locale === 'es' ? esMessages : enMessages;
  return rtlRender(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <PublishedQaForm />
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  chat.messages = [];
  chat.sendMessage.mockReset();
  chat.error = undefined;
  chat.status = 'ready';
  chat.transportOptions = undefined;
});

describe('PublishedQaForm catalogues', () => {
  it('renders the labelled chat input from the Spanish catalogue', () => {
    renderLocale('es');

    expect(
      screen.getByRole('textbox', { name: 'Preguntá sobre un proyecto o la formación' })
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Consultar' })).toBeVisible();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('renders the labelled chat input from the English catalogue', () => {
    renderLocale('en');

    expect(
      screen.getByRole('textbox', { name: 'Ask about a project or the training' })
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Ask' })).toBeVisible();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });
});

describe('PublishedQaForm chat', () => {
  it('sends the trimmed user text through useChat for the active locale', async () => {
    const user = userEvent.setup();
    renderLocale('en');

    await user.type(
      screen.getByRole('textbox', { name: 'Ask about a project or the training' }),
      'what degree do you have'
    );
    await user.click(screen.getByRole('button', { name: 'Ask' }));

    expect(chat.transportOptions).toEqual({
      api: '/api/qa',
      body: { locale: 'en' },
    });
    expect(chat.sendMessage).toHaveBeenCalledWith({ text: 'what degree do you have' });
  });

  it('renders text parts from the thread', () => {
    chat.messages = [
      { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'qué título tenés' }] },
      {
        id: 'a1',
        role: 'assistant',
        parts: [{ type: 'text', text: 'Técnico en Desarrollo de Software. [CV](/cv)' }],
      },
    ];
    renderLocale('es');

    expect(screen.getByText('qué título tenés')).toBeVisible();
    expect(screen.getByText('Técnico en Desarrollo de Software. [CV](/cv)')).toBeVisible();
  });

  it('shows refused catalogue copy for the no-evidence sentinel', () => {
    chat.messages = [
      {
        id: 'a1',
        role: 'assistant',
        parts: [{ type: 'text', text: QA_NO_EVIDENCE }],
      },
    ];
    renderLocale('es');

    expect(screen.getByText('No hay una cita publicada para esa pregunta.')).toBeVisible();
    expect(screen.queryByText(QA_NO_EVIDENCE)).not.toBeInTheDocument();
  });

  it('shows error catalogue copy when the transport fails', () => {
    chat.error = new Error('network');
    renderLocale('es');

    expect(screen.getByText('No se pudo consultar. Probá de nuevo.')).toBeVisible();
  });
});
