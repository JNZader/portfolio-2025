import { describe, expect, it } from 'vitest';
import { contactSchema, sanitizeContactData } from '@/lib/validations/contact';

describe('contactSchema', () => {
  it('should validate correct data', () => {
    const validData = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      subject: 'Consulta sobre desarrollo',
      message: 'Hola, me gustaría saber más sobre tus servicios.',
    };

    const result = contactSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalidData = {
      name: 'Juan',
      email: 'not-an-email',
      subject: 'Consulta',
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
      subject: 'Consulta',
      message: 'Mensaje de prueba',
    };

    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject name too short', () => {
    const invalidData = {
      name: 'J',
      email: 'juan@example.com',
      subject: 'Consulta',
      message: 'Mensaje de prueba',
    };

    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject subject too short', () => {
    const invalidData = {
      name: 'Juan',
      email: 'juan@example.com',
      subject: 'Hola', // min 5 characters
      message: 'Mensaje de prueba',
    };

    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject message too short', () => {
    const invalidData = {
      name: 'Juan',
      email: 'juan@example.com',
      subject: 'Consulta',
      message: 'Hola', // min 10 characters
    };

    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject message too long', () => {
    const invalidData = {
      name: 'Juan',
      email: 'juan@example.com',
      subject: 'Consulta',
      message: 'a'.repeat(5001), // max 5000 characters
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
      subject: 'Consulta sobre proyecto',
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
      subject: '  Consulta  ',
      message: '  Mensaje  ',
    };

    const sanitized = sanitizeContactData(data);
    expect(sanitized.name).toBe('Juan');
    expect(sanitized.email).toBe('juan@example.com');
    expect(sanitized.subject).toBe('Consulta');
    expect(sanitized.message).toBe('Mensaje');
  });
});
