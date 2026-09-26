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
  transportOptions: undefined as
    | {
        api?: string;
        body?: { locale?: string; path?: string };
        prepareSendMessagesRequest?: (options: {
          body?: Record<string, unknown>;
          messages?: unknown[];
          id?: string;
          trigger?: string;
          messageId?: string;
        }) => { body: Record<string, unknown> };
      }
    | undefined,
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
    constructor(options: {
      api?: string;
      body?: { locale?: string; path?: string };
      prepareSendMessagesRequest?: (opts: {
        body?: Record<string, unknown>;
        messages?: unknown[];
        id?: string;
        trigger?: string;
        messageId?: string;
      }) => { body: Record<string, unknown> };
    }) {
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

async function openPanel(locale: 'es' | 'en') {
  const user = userEvent.setup();
  renderLocale(locale);
  const openName = locale === 'es' ? 'Preguntame' : 'Ask me';
  await user.click(screen.getByRole('button', { name: openName }));
  return user;
}

beforeEach(() => {
  chat.messages = [];
  chat.sendMessage.mockReset();
  chat.error = undefined;
  chat.status = 'ready';
  chat.transportOptions = undefined;
});

describe('PublishedQaForm catalogues', () => {
  it('keeps the panel closed until the launcher is used', () => {
    renderLocale('es');

    expect(screen.getByRole('button', { name: 'Preguntame' })).toBeVisible();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders the labelled chat input from the Spanish catalogue', async () => {
    await openPanel('es');

    expect(screen.getByRole('dialog', { name: 'Preguntame' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Pregunta' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeVisible();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('renders the labelled chat input from the English catalogue', async () => {
    await openPanel('en');

    expect(screen.getByRole('dialog', { name: 'Ask me' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Question' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Send' })).toBeVisible();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });
});

describe('PublishedQaForm chat', () => {
  it('sends the trimmed user text and live path through useChat', async () => {
    const user = await openPanel('en');

    await user.type(screen.getByRole('textbox', { name: 'Question' }), 'what degree do you have');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    const prepared = chat.transportOptions?.prepareSendMessagesRequest?.({
      body: {},
      messages: [],
      id: 'chat-1',
      trigger: 'submit-message',
      messageId: undefined,
    });

    expect(chat.transportOptions?.api).toBe('/api/qa');
    expect(prepared?.body).toMatchObject({
      locale: 'en',
      path: '/',
    });
    expect(chat.sendMessage).toHaveBeenCalledWith({ text: 'what degree do you have' });
  });

  it('renders assistant markdown links as anchors', async () => {
    chat.messages = [
      { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'qué título tenés' }] },
      {
        id: 'a1',
        role: 'assistant',
        parts: [{ type: 'text', text: 'Técnico en Desarrollo de Software. [CV](/cv)' }],
      },
    ];
    await openPanel('es');

    expect(screen.getByText('qué título tenés')).toBeVisible();
    expect(screen.getByRole('link', { name: 'CV' })).toHaveAttribute('href', '/cv');
  });

  it('shows refused catalogue copy for the no-evidence sentinel', async () => {
    chat.messages = [
      {
        id: 'a1',
        role: 'assistant',
        parts: [{ type: 'text', text: QA_NO_EVIDENCE }],
      },
    ];
    await openPanel('es');

    expect(screen.getByText('No hay una cita publicada para esa pregunta.')).toBeVisible();
    expect(screen.queryByText(QA_NO_EVIDENCE)).not.toBeInTheDocument();
  });

  it('shows error catalogue copy when the transport fails', async () => {
    chat.error = new Error('network');
    await openPanel('es');

    expect(screen.getByText('No se pudo consultar. Probá de nuevo.')).toBeVisible();
  });

  it('closes the panel on Escape', async () => {
    const user = await openPanel('es');

    expect(screen.getByRole('dialog', { name: 'Preguntame' })).toBeVisible();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
