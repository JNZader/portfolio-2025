import { describe, expect, it } from 'vitest';
import {
  capitalize,
  capitalizeWords,
  cleanWhitespace,
  excerpt,
  getInitials,
  pluralize,
  slugify,
} from '@/lib/utils/string';

describe('slugify', () => {
  it('should convert text to URL-friendly slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should handle accents and special characters', () => {
    expect(slugify('Hola Mundo con Ñ y Acentos')).toBe('hola-mundo-con-n-y-acentos');
    expect(slugify('¡TypeScript & React!')).toBe('typescript-react');
  });

  it('should handle multiple spaces and dashes', () => {
    expect(slugify('  hello   world  ')).toBe('hello-world');
    expect(slugify('hello--world')).toBe('hello-world');
  });
});

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('hello world')).toBe('Hello world');
  });

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('capitalizeWords', () => {
  it('should capitalize each word', () => {
    expect(capitalizeWords('hello world from typescript')).toBe('Hello World From Typescript');
  });
});

describe('getInitials', () => {
  it('should extract initials from name', () => {
    expect(getInitials('Juan Pérez García')).toBe('JP');
    expect(getInitials('Juan Pérez García', 3)).toBe('JPG');
  });

  it('should handle single word', () => {
    expect(getInitials('Juan')).toBe('J');
  });
});

describe('excerpt', () => {
  it('should truncate long text at word boundary', () => {
    const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
    const result = excerpt(text, 20);
    expect(result).toBe('Lorem ipsum dolor...');
  });

  it('should not truncate short text', () => {
    expect(excerpt('Hello', 20)).toBe('Hello');
  });
});

describe('pluralize', () => {
  it('should use singular form for 1', () => {
    expect(pluralize(1, 'proyecto')).toBe('1 proyecto');
  });

  it('should use plural form for other numbers', () => {
    expect(pluralize(5, 'proyecto')).toBe('5 proyectos');
    expect(pluralize(0, 'proyecto')).toBe('0 proyectos');
  });

  it('should accept custom plural', () => {
    expect(pluralize(2, 'mes', 'meses')).toBe('2 meses');
  });
});

describe('cleanWhitespace', () => {
  it('should normalize whitespace', () => {
    expect(cleanWhitespace('  hello    world  ')).toBe('hello world');
  });
});
