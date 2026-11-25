import { describe, expect, it } from 'vitest';
import { extractAssistantText, stripThinking } from '@/lib/qa/local/assistant-text';
import { mergeQaLog } from '@/lib/qa/local/log';
import { priorQueryFromHistory } from '@/lib/qa/local/prepare';

describe('extractAssistantText', () => {
  it('reads the last assistant message from a chat result', () => {
    const text = extractAssistantText([
      {
        generated_text: [
          { role: 'system', content: 'rules' },
          { role: 'user', content: 'pregunta' },
          { role: 'assistant', content: 'Técnico en Desarrollo de Software.' },
        ],
      },
    ]);

    expect(text).toBe('Técnico en Desarrollo de Software.');
  });

  it('joins text parts and ignores a string result that is only whitespace', () => {
    expect(
      extractAssistantText([
        {
          generated_text: [
            {
              role: 'assistant',
              content: [{ type: 'text', text: 'Hola' }, { type: 'image' }, { type: 'text', text: ' mundo' }],
            },
          ],
        },
      ])
    ).toBe('Hola mundo');
    expect(extractAssistantText([{ generated_text: '   ' }])).toBe('');
  });
});

describe('stripThinking', () => {
  it('removes a thinking trace and a leaked empty think tag', () => {
    expect(stripThinking('<think>plan</think>\n\nRespuesta.')).toBe('Respuesta.');
    expect(stripThinking('<think></think>Respuesta.')).toBe('Respuesta.');
  });
});

describe('mergeQaLog', () => {
  it('appends a cloud reply after local turns are dropped', () => {
    const withLocal = mergeQaLog([], ['remote-user', 'remote-assistant'], ['local-user', 'local-assistant']);
    const afterFallback = mergeQaLog(
      withLocal,
      ['remote-user', 'remote-assistant', 'cloud-user', 'cloud-assistant'],
      []
    );

    expect(afterFallback.map((item) => item.id)).toEqual([
      'remote-user',
      'remote-assistant',
      'cloud-user',
      'cloud-assistant',
    ]);
  });

  it('keeps arrival order when a local turn follows a cloud reply', () => {
    const cloud = mergeQaLog([], ['u1', 'a1'], []);
    const mixed = mergeQaLog(cloud, ['u1', 'a1'], ['u2']);

    expect(mixed.map((item) => `${item.origin}:${item.id}`)).toEqual([
      'remote:u1',
      'remote:a1',
      'local:u2',
    ]);
  });
});

describe('priorQueryFromHistory', () => {
  it('returns the latest user turn and ignores the assistant', () => {
    expect(
      priorQueryFromHistory([
        { role: 'user', text: 'qué es biogas' },
        { role: 'assistant', text: 'una plataforma' },
      ])
    ).toBe('qué es biogas');
    expect(priorQueryFromHistory([])).toBeNull();
  });
});
