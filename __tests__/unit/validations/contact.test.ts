import { describe, expect, it } from 'vitest';
import { contactSchema, sanitizeContactData } from '@/lib/validations/contact';

describe('contactSchema', () => {
  it('should validate correct data', () => {
    const validData = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      reason: 'job',
      message: 'Hola, me gustaría saber más sobre tus servicios.',
    };

    const result = contactSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should accept optional company and timeline', () => {
    const validData = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      reason: 'freelance',
      company: 'Acme Corp',
      timeline: 'short',
      message: 'Hola, me gustaría saber más sobre tus servicios.',
    };

    const result = contactSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should treat empty timeline as valid (optional)', () => {
    const validData = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      reason: 'consulting',
      timeline: '',
      message: 'Hola, me gustaría saber más sobre tus servicios.',
    };

    const result = contactSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalidData = {
      name: 'Juan',
      email: 'not-an-email',
      reason: 'job',
      message: 'Mensaje de prueba',
    };

    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email');
    }
  });

  it('should reject name with invalid characters', () => {
    const invalidData = {
      name: 'Juan123',
      email: 'juan@example.com',
      reason: 'job',
      message: 'Mensaje de prueba',
    };

    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject name too short', () => {
    const invalidData = {
      name: 'J',
      email: 'juan@example.com',
      reason: 'job',
      message: 'Mensaje de prueba',
    };

    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject missing reason', () => {
    const invalidData = {
      name: 'Juan',
      email: 'juan@example.com',
      reason: '', // select sin elegir
      message: 'Mensaje de prueba largo',
    };

    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('reason');
    }
  });

  it('should reject invalid reason value', () => {
    const invalidData = {
      name: 'Juan',
      email: 'juan@example.com',
      reason: 'spam',
      message: 'Mensaje de prueba largo',
    };

    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject message too short', () => {
    const invalidData = {
      name: 'Juan',
      email: 'juan@example.com',
      reason: 'job',
      message: 'Hola', // min 10 characters
    };

    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject message too long', () => {
    const invalidData = {
      name: 'Juan',
      email: 'juan@example.com',
      reason: 'job',
      message: 'a'.repeat(1001), // max 1000 characters
    };

    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('message');
    }
  });

  it('should accept valid names with accents', () => {
    const validData = {
      name: "José María O'Brien-García",
      email: 'jose@example.com',
      reason: 'consulting',
      message: 'Este es un mensaje de prueba válido.',
    };

    const result = contactSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('sanitizeContactData', () => {
  it('should trim whitespace and lowercase email', () => {
    const data = {
      name: '  Juan  ',
      email: '  JUAN@EXAMPLE.COM  ',
      reason: 'job' as const,
      company: '  Acme  ',
      timeline: 'short' as const,
      message: '  Mensaje  ',
    };

    const sanitized = sanitizeContactData(data);
    expect(sanitized.name).toBe('Juan');
    expect(sanitized.email).toBe('juan@example.com');
    expect(sanitized.reason).toBe('job');
    expect(sanitized.company).toBe('Acme');
    expect(sanitized.message).toBe('Mensaje');
  });

  it('should drop empty company and timeline to undefined', () => {
    const data = {
      name: 'Juan',
      email: 'juan@example.com',
      reason: 'other' as const,
      company: '   ',
      timeline: '' as const,
      message: 'Mensaje de prueba',
    };

    const sanitized = sanitizeContactData(data);
    expect(sanitized.company).toBeUndefined();
    expect(sanitized.timeline).toBeUndefined();
  });
});
