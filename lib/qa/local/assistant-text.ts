function textFromContent(content: unknown): string {
  if (typeof content === 'string') return content.trim();
  if (!Array.isArray(content)) return '';
  const text = content
    .map((part) => {
      if (!part || typeof part !== 'object') return '';
      const record = part as { type?: unknown; text?: unknown };
      return record.type === 'text' && typeof record.text === 'string' ? record.text : '';
    })
    .join('');
  return text.trim();
}

/** Pull the assistant string out of a transformers.js text-generation result. */
export function extractAssistantText(output: unknown): string {
  if (!Array.isArray(output)) return '';
  const first = output[0] as { generated_text?: unknown } | undefined;
  const generated = first?.generated_text;
  if (typeof generated === 'string') return generated.trim();
  if (!Array.isArray(generated)) return '';

  for (let index = generated.length - 1; index >= 0; index -= 1) {
    const message = generated[index] as { role?: unknown; content?: unknown } | undefined;
    if (message?.role !== 'assistant') continue;
    const text = textFromContent(message.content);
    if (text) return text;
  }
  return '';
}

/** Drop a leaked thinking trace. The chat template is asked to keep thinking off. */
export function stripThinking(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/^\s*<think>\s*/i, '')
    .trim();
}
