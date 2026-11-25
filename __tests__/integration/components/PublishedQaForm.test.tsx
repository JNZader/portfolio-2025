import { render as rtlRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PublishedQaForm } from '@/components/projects/PublishedQaForm';
import { QA_GREETING, QA_NO_EVIDENCE } from '@/lib/qa/retrieve';
import enMessages from '@/messages/en.json';
import esMessages from '@/messages/es.json';

const localEngine = vi.hoisted(() => ({
  probe: vi.fn(),
  cached: vi.fn(),
  load: vi.fn(),
  generate: vi.fn(),
  dispose: vi.fn(),
}));

const chat = vi.hoisted(() => ({
  messages: [] as Array<{
    id: string;
    role: 'user' | 'assistant';
    parts: Array<{ type: string; text?: string; data?: unknown }>;
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

vi.mock('@/lib/qa/local/capabilities', () => ({
  probeLocalBackend: () => localEngine.probe(),
  isModelCached: (dtype: string) => localEngine.cached(dtype),
}));

vi.mock('@/lib/qa/local/engine', () => ({
  createLocalEngine: () => ({
    load: (options: { onProgress: (progress: number) => void }) => localEngine.load(options),
    generate: (options: { onToken: (text: string) => void }) => localEngine.generate(options),
    dispose: () => localEngine.dispose(),
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
  localEngine.probe.mockReset().mockResolvedValue({
    supported: true,
    device: 'webgpu',
    dtype: 'q4f16',
    downloadLabel: '~1 GB',
  });
  localEngine.cached.mockReset().mockResolvedValue(false);
  localEngine.load.mockReset().mockImplementation(async ({ onProgress }) => {
    onProgress(100);
  });
  localEngine.generate.mockReset().mockImplementation(async ({ onToken }) => {
    onToken('Técnico ');
    onToken('en [CV](/cv)');
    return 'Técnico en [CV](/cv) y [phish](https://evil.example/x)';
  });
  localEngine.dispose.mockReset();
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
    expect(screen.getByRole('switch', { name: 'Modo local (beta)' })).not.toBeChecked();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('renders the labelled chat input from the English catalogue', async () => {
    await openPanel('en');

    expect(screen.getByRole('dialog', { name: 'Ask me' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Question' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Send' })).toBeVisible();
    expect(screen.getByRole('switch', { name: 'Local mode (beta)' })).not.toBeChecked();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });
});

describe('PublishedQaForm local mode', () => {
  it('asks for confirmation and does not download until the visitor accepts', async () => {
    const user = await openPanel('es');

    await user.click(screen.getByRole('switch', { name: 'Modo local (beta)' }));

    expect(await screen.findByRole('group', { name: 'Descargar el modelo local' })).toBeVisible();
    expect(screen.getByText(/~1 GB/)).toBeVisible();
    expect(localEngine.load).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Ahora no' }));

    expect(screen.queryByRole('group', { name: 'Descargar el modelo local' })).not.toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Modo local (beta)' })).not.toBeChecked();
    expect(localEngine.load).not.toHaveBeenCalled();
  });

  it('loads from cache without asking to download again', async () => {
    localEngine.cached.mockResolvedValue(true);
    const user = await openPanel('es');

    await user.click(screen.getByRole('switch', { name: 'Modo local (beta)' }));

    expect(await screen.findByText('Modo local activo.')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Descargar y activar' })).not.toBeInTheDocument();
    expect(localEngine.load).toHaveBeenCalledOnce();
  });

  it('streams a grounded answer and strips links that are not in the sources', async () => {
    const user = await openPanel('es');

    await user.click(screen.getByRole('switch', { name: 'Modo local (beta)' }));
    await user.click(await screen.findByRole('button', { name: 'Descargar y activar' }));
    expect(await screen.findByText('Modo local activo.')).toBeVisible();

    await user.type(screen.getByRole('textbox', { name: 'Pregunta' }), 'qué título tenés');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByRole('link', { name: 'CV' })).toHaveAttribute('href', '/cv');
    expect(screen.queryByRole('link', { name: 'phish' })).not.toBeInTheDocument();
    expect(screen.queryByText(/evil\.example/)).not.toBeInTheDocument();
    expect(chat.sendMessage).not.toHaveBeenCalled();
  });

  it('falls back to the Gemini transport when local generation fails', async () => {
    localEngine.generate.mockRejectedValue(new Error('oom'));
    const user = await openPanel('es');

    await user.click(screen.getByRole('switch', { name: 'Modo local (beta)' }));
    await user.click(await screen.findByRole('button', { name: 'Descargar y activar' }));
    expect(await screen.findByText('Modo local activo.')).toBeVisible();

    await user.type(screen.getByRole('textbox', { name: 'Pregunta' }), 'qué título tenés');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(
      await screen.findByText('El modo local falló. Sigo con el servicio en la nube.')
    ).toBeVisible();
    expect(chat.sendMessage).toHaveBeenCalledWith({ text: 'qué título tenés' });
    expect(screen.getByRole('switch', { name: 'Modo local (beta)' })).not.toBeChecked();
  });

  it('keeps Gemini when the browser cannot run the model', async () => {
    localEngine.probe.mockResolvedValue({ supported: false });
    const user = await openPanel('es');

    await user.click(screen.getByRole('switch', { name: 'Modo local (beta)' }));

    expect(
      await screen.findByText(
        'Este navegador no puede ejecutar el modelo en local. Sigo con el servicio en la nube.'
      )
    ).toBeVisible();
    expect(screen.getByRole('switch', { name: 'Modo local (beta)' })).not.toBeChecked();
    expect(localEngine.load).not.toHaveBeenCalled();
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

  it('renders bold, ordered lists and bare bracket citations from assistant answers', async () => {
    chat.messages = [
      { id: 'u1', role: 'user', parts: [{ type: 'text', text: '¿laburás con IA?' }] },
      {
        id: 'a1',
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: 'Sí:\n1. **Biogas Platform**: arquitectura de IA de tres capas [/proyectos/biogas-platform]\n2. *ghagga*: review multi-agente [ghagga](/cv)',
          },
        ],
      },
    ];
    await openPanel('es');

    const listitems = screen.getAllByRole('listitem');
    expect(listitems).toHaveLength(2);
    expect(screen.getByText('Biogas Platform', { exact: false })).toBeInTheDocument();
    const strong = document.querySelector('strong');
    expect(strong?.textContent).toBe('Biogas Platform');
    const em = document.querySelector('em');
    expect(em?.textContent).toBe('ghagga');
    expect(screen.getByRole('link', { name: 'biogas-platform' })).toHaveAttribute(
      'href',
      '/proyectos/biogas-platform'
    );
    expect(screen.getByRole('link', { name: 'ghagga' })).toHaveAttribute('href', '/cv');
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

  it('shows hello catalogue copy for the greeting sentinel', async () => {
    chat.messages = [
      {
        id: 'a1',
        role: 'assistant',
        parts: [{ type: 'text', text: QA_GREETING }],
      },
    ];
    await openPanel('es');

    expect(
      screen.getByText('Hola. Preguntame por un proyecto publicado o por la formación.')
    ).toBeVisible();
    expect(screen.getByText('JZ')).toBeVisible();
    expect(screen.queryByText('No hay una cita publicada para esa pregunta.')).not.toBeInTheDocument();
    expect(screen.queryByText(QA_GREETING)).not.toBeInTheDocument();
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

  it.each(['submitted', 'streaming'] as const)(
    'shows the writing catalogue line while status is %s',
    async (status) => {
      chat.status = status;
      await openPanel('es');

      expect(screen.getByText('Escribiendo…')).toBeVisible();
    }
  );

  it('does not show the writing line when the chat is ready', async () => {
    await openPanel('en');

    expect(screen.queryByText('Writing…')).not.toBeInTheDocument();
  });

  it('labels assistant bubbles with JZ and leaves user bubbles unlabeled', async () => {
    chat.messages = [
      { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'hola' }] },
      { id: 'a1', role: 'assistant', parts: [{ type: 'text', text: 'respuesta' }] },
    ];
    await openPanel('es');

    expect(screen.getByText('JZ')).toBeVisible();
    expect(screen.getByText('hola')).toBeVisible();
    expect(screen.getByText('hola').closest('div')?.textContent).not.toContain('JZ');
  });

  it('renders consecutive asterisk markdown lines as list items', async () => {
    chat.messages = [
      {
        id: 'a1',
        role: 'assistant',
        parts: [{ type: 'text', text: '* item' }],
      },
    ];
    await openPanel('en');

    expect(screen.getByRole('listitem')).toHaveTextContent('item');
  });

  it('shows suggestion chips when the log is empty and sends one on click', async () => {
    const user = await openPanel('es');

    await user.click(screen.getByRole('button', { name: '¿Qué es Consorcio Canalero?' }));

    expect(chat.sendMessage).toHaveBeenCalledWith({ text: '¿Qué es Consorcio Canalero?' });
  });

  it('hides suggestion chips after a message exists', async () => {
    chat.messages = [{ id: 'u1', role: 'user', parts: [{ type: 'text', text: 'hola' }] }];
    await openPanel('es');

    expect(
      screen.queryByRole('button', { name: '¿Qué es Consorcio Canalero?' })
    ).not.toBeInTheDocument();
  });

  it('lists retrieved sources under the assistant bubble', async () => {
    chat.messages = [
      {
        id: 'a1',
        role: 'assistant',
        parts: [
          { type: 'text', text: 'Freelance para un cliente real.' },
          {
            type: 'data-qa-sources',
            data: {
              sources: [
                {
                  title: 'Consorcio Canalero — Sistema de gestión',
                  href: '/cv',
                  citation: 'Consorcio Canalero — Sistema de gestión',
                },
              ],
            },
          },
        ],
      },
    ];
    await openPanel('es');

    expect(screen.getByText('Fuentes')).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Consorcio Canalero — Sistema de gestión' })
    ).toHaveAttribute('href', '/cv');
  });
});
