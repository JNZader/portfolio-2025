import { z } from 'zod';
import { QA_LOCALE } from '@/lib/qa';

export const QA_QUERY_MAX_LENGTH = 500;

const qaMessagePartSchema = z
  .object({
    type: z.string(),
    text: z.string().optional(),
  })
  .passthrough();

const qaMessageSchema = z
  .object({
    role: z.enum(['user', 'assistant', 'system']),
    parts: z.array(qaMessagePartSchema).optional(),
  })
  .passthrough();

export const qaChatSchema = z.object({
  messages: z.array(qaMessageSchema).min(1),
  locale: z.enum([QA_LOCALE.ES, QA_LOCALE.EN]),
});

export type QaChatInput = z.infer<typeof qaChatSchema>;

export function latestUserText(messages: QaChatInput['messages']): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role !== 'user') continue;
    return (message.parts ?? [])
      .filter((part) => part.type === 'text' && typeof part.text === 'string')
      .map((part) => part.text)
      .join('')
      .trim();
  }
  return '';
}
