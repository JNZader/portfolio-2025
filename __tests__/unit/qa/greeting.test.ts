import { describe, expect, it } from 'vitest';
import { isGreeting } from '@/lib/qa/text';

describe('isGreeting', () => {
  it.each([
    'hola',
    'holis',
    'hello',
    'hey',
    'hi',
    'buenas',
    'hola que tal',
    'buenas tardes',
    'buenas noches',
    'Hola!',
    '  HOLIS  ',
  ])('accepts greeting-only %j', (query) => {
    expect(isGreeting(query)).toBe(true);
  });

  it.each(['hola apigen', 'apigen', 'qué título tenés', 'precio del dólar mañana', '', 'ok'])(
    'rejects %j',
    (query) => {
      expect(isGreeting(query)).toBe(false);
    }
  );
});
