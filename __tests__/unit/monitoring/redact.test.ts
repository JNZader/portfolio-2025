import { describe, expect, it } from 'vitest';
import { redactSensitiveData } from '@/lib/monitoring/redact';

describe('redactSensitiveData', () => {
  it('redacts direct and nested PII and credentials', () => {
    const result = redactSensitiveData({
      email: 'person@example.com',
      ip: '203.0.113.42',
      nested: {
        token: 'secret-token',
        cookie: 'session=abc',
        authorization: 'Bearer abc.def',
      },
    });

    expect(result).toEqual({
      email: '[REDACTED]',
      ip: '[REDACTED]',
      nested: {
        token: '[REDACTED]',
        cookie: '[REDACTED]',
        authorization: '[REDACTED]',
      },
    });
  });

  it('scrubs PII embedded in messages and URLs', () => {
    const result = redactSensitiveData({
      message:
        'user person@example.com from 203.0.113.42 opened /confirm?token=abc123&next=/home',
    });
    expect(result.message).not.toContain('person@example.com');
    expect(result.message).not.toContain('203.0.113.42');
    expect(result.message).not.toContain('abc123');
  });

  it('scrubs Error message and stack fields', () => {
    const result = redactSensitiveData(new Error('failed for person@example.com')) as unknown as {
      message: string;
      stack?: string;
    };
    expect(result.message).toBe('failed for [REDACTED_EMAIL]');
    expect(result.stack).not.toContain('person@example.com');
  });
});
